import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import {Logger} from '@core/utils/Logger';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';

import {HOOK_HAVOC_FULL_BAR, HOOK_HAVOC_LEFT, HOOK_HAVOC_RIGHT} from '../HookHavocGame';

const log = Logger.getLogger('habbo.vortex.fishing.ui.HookHavocView');

const LAYOUT = 'vortex_fishing_hookhavoc_xml';

/** The same layer the perf monitor and the room widgets sit on. */
const LAYER = 1;

const CHILD_TITLE = 'hh_title';
const CHILD_FILL = 'hh_fill';
const CHILD_DIAL = 'hh_dial';
const CHILD_SECONDS = 'hh_seconds';
const CHILD_KEY_LEFT = 'hh_key_left';
const CHILD_KEY_RIGHT = 'hh_key_right';

/** The pressed art, sitting under each key and revealed by `visible`. */
const CHILD_KEY_LEFT_DOWN = 'hh_key_left_down';
const CHILD_KEY_RIGHT_DOWN = 'hh_key_right_down';

/**
 * Origins' own art, out of `hh_fishing.cct`. See `docs/vortex-original/origins/`.
 *
 * Only the dial's three are named here: the board, the fill bar and both key states declare their
 * own `asset_uri` in the layout, which is how 293 of the shipped layouts do it and what lets this
 * panel render in vortex-glaze instead of showing empty slots.
 */
const ASSET_DIAL = 'fishingUI_mittari';
const ASSET_NEEDLE = 'fishingUI_viisari1';
const ASSET_PIVOT = 'fishingUI_viisari2';

const KEY_TITLE = 'vortex.fishing.hook_havoc.title';
const KEY_SECONDS = 'vortex.fishing.hook_havoc.seconds';

/** The dial slot, and where the needle turns about. Origins' `mittari` is 110x122. */
const DIAL_WIDTH = 110;
const DIAL_HEIGHT = 122;

/**
 * The needle's pivot inside the dial, and how far it swings.
 *
 * Origins parks `viisari1` and `viisari2` at the same point (78,148 in board space, so 56,75 inside
 * the dial) and rotates the needle sprite at draw time. The sweep is not in the window definition —
 * it is in the Lingo, which is compiled — so ±60° is chosen to use the gauge's painted arc.
 */
const PIVOT_X = 56;
const PIVOT_Y = 75;
const MAX_SWEEP_RADIANS = Math.PI / 3;

/**
 * The needle's drawn size, which is NOT its cast member's size.
 *
 * `fishingUI_viisari1` is a 42x112 two-tone bitmap and Origins' window definition draws it at
 * `#width: 11, #height: 28` — Director scales a sprite to the size the definition gives it. Drawing
 * the member at its own size instead fills most of the dial with a grey wedge, which is what this
 * did until the panel was actually composited and looked at.
 */
const NEEDLE_WIDTH = 11;
const NEEDLE_HEIGHT = 28;

/** The fill bar's full width on the board: from its x of 28 to the dial's right edge. */
const FILL_MAX_WIDTH = 104;

/** How long the pointer stays "pressed" after a nudge, in ticks. Feedback only. */
const PRESS_TICKS = 2;

/**
 * The Hook Havoc panel — Origins' `fishingUI` window, rebuilt.
 *
 * NOT ported from AS3: Origins is a Shockwave client, and this is read from its Director cast rather
 * than from any Flash source. `docs/vortex-original/origins/fishingUI.window.txt` is the definition
 * every position here comes from.
 *
 * **It draws; it does not decide.** `HookHavocGame` owns the arithmetic and must stay identical to
 * the server's replay; this class turns a needle position and a fill level into pixels, and reports
 * clicks on the two key buttons. Nothing here may change what the timeline says.
 */
export class HookHavocView
{
    // TS-only: Vortex-only view — no AS3 counterpart for any member here.
    private readonly _windowManager: IHabboWindowManager;

    // TS-only: see above.
    private readonly _assets: IAssetLibrary | null;

    // TS-only: see above.
    private readonly _localizations: IHabboLocalizationManager | null;

    // TS-only: see above.
    private _window: IWindowContainer | null = null;

    /** Told when a key button is clicked, so the panel plays the same as the keyboard. */
    // TS-only: Vortex-only view.
    private readonly _onNudge: (direction: number) => void;

    // TS-only: Vortex-only view — ticks left on each button's pressed art.
    private _leftPress: number = 0;

    // TS-only: Vortex-only view.
    private _rightPress: number = 0;

    // TS-only: Vortex-only view.
    constructor(
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null,
        localizations: IHabboLocalizationManager | null,
        onNudge: (direction: number) => void
    )
    {
        this._windowManager = windowManager;
        this._assets = assets;
        this._localizations = localizations;
        this._onNudge = onNudge;
    }

    /**
     * Builds the panel on first use and shows it.
     *
     * Built once and reused: an attempt starts on a catch, which can be every few seconds, and
     * rebuilding a window that often would churn the whole tree for nothing.
     */
    // TS-only: Vortex-only view.
    public show(): void
    {
        if(this._window === null)
        {
            this._window = this._windowManager.buildWidgetLayout(LAYOUT, LAYER) as IWindowContainer | null;

            if(this._window === null)
            {
                log.warn(`${LAYOUT} is not registered; Hook Havoc has no panel.`);

                return;
            }

            // `buildWidgetLayout()` hands back a standalone window — AS3 passes null as the parent
            // and leaves placing it to the caller. A layout whose root is a `frame` gets away with
            // it; a bare container is built, holds its children, and is never drawn. This is the
            // first of the five silent layout failures, and it is what kept this panel invisible.
            const desktop = this._windowManager.getDesktop(LAYER) as unknown as IWindowContainer | null;

            if(desktop === null || typeof desktop.addChild !== 'function')
            {
                log.warn(`No desktop on layer ${LAYER}; Hook Havoc cannot be shown.`);

                return;
            }

            desktop.addChild(this._window);

            // Centred on the desktop, whose size is only known at runtime and changes when the
            // browser window does — so the x/y in the layout is a starting point for the editor and
            // is overwritten here. `WE_PARENT_RESIZED` is what the desktop sends its children.
            this._window.addEventListener(WindowEvent.WE_PARENT_RESIZED, this._onDesktopResized);

            this.setCaption(CHILD_TITLE, this.translate(KEY_TITLE));
            this.bindKey(CHILD_KEY_LEFT, HOOK_HAVOC_LEFT);
            this.bindKey(CHILD_KEY_RIGHT, HOOK_HAVOC_RIGHT);
        }

        this._leftPress = 0;
        this._rightPress = 0;
        this._window.center();
        this._window.visible = true;
    }

    /**
     * Re-centres on a desktop resize. Bound once so it can be removed by identity; an anonymous
     * handler would leak one per attempt.
     */
    // TS-only: Vortex-only view.
    private readonly _onDesktopResized: () => void = () => this._window?.center();

    // TS-only: Vortex-only view.
    public hide(): void
    {
        if(this._window !== null) this._window.visible = false;
    }

    /** Flashes a key button, whether the nudge came from the keyboard or from the button itself. */
    // TS-only: Vortex-only view.
    public flash(direction: number): void
    {
        if(direction === HOOK_HAVOC_LEFT) this._leftPress = PRESS_TICKS;
        else this._rightPress = PRESS_TICKS;
    }

    /**
     * One frame: the dial, the fill bar and the countdown.
     *
     * `needle` is the simulation's own signed value and `range` the span the panel shows before it
     * pins — the game does not bound it, so a player who never corrects would otherwise swing the
     * needle off the gauge.
     */
    // TS-only: Vortex-only view.
    public draw(needle: number, range: number, fill: number, ticksLeft: number, tickMs: number): void
    {
        if(this._window === null) return;

        this.drawDial(needle, range);

        const bar = this.child(CHILD_FILL);

        if(bar !== null)
        {
            // Width, not scale: Origins stretches a single green pixel, and a one-pixel floor keeps
            // the bar a bar rather than vanishing at zero.
            bar.width = Math.max(1, Math.round((fill / HOOK_HAVOC_FULL_BAR) * FILL_MAX_WIDTH));
        }

        const seconds = Math.max(0, Math.ceil((ticksLeft * tickMs) / 1000));

        this.setCaption(CHILD_SECONDS, this.translate(KEY_SECONDS, 'seconds', `${seconds}`));

        this.press(CHILD_KEY_LEFT_DOWN, this._leftPress > 0);
        this.press(CHILD_KEY_RIGHT_DOWN, this._rightPress > 0);

        if(this._leftPress > 0) this._leftPress--;
        if(this._rightPress > 0) this._rightPress--;
    }

    /**
     * Composites the gauge, the rotated needle and its pivot into the one dial slot.
     *
     * Origins keeps these as three sprites and rotates the needle at draw time. This window system
     * has no sprite rotation, so they are drawn together into an ImageBitmap — the alternative,
     * three windows with a pre-rendered needle per angle, would need dozens of sprites for the same
     * picture.
     */
    // TS-only: Vortex-only view.
    private drawDial(needle: number, range: number): void
    {
        const target = this.child(CHILD_DIAL) as IBitmapWrapperWindow | null;

        if(target === null) return;

        const canvas = new OffscreenCanvas(DIAL_WIDTH, DIAL_HEIGHT);
        const context = canvas.getContext('2d');

        if(context === null) return;

        const dial = this.sprite(ASSET_DIAL);
        const pointer = this.sprite(ASSET_NEEDLE);
        const pivot = this.sprite(ASSET_PIVOT);

        if(dial !== null) context.drawImage(dial, 0, 0);

        if(pointer !== null)
        {
            const clamped = Math.max(-range, Math.min(range, needle));

            context.save();
            context.translate(PIVOT_X, PIVOT_Y);
            context.rotate((clamped / range) * MAX_SWEEP_RADIANS);
            // The sprite points up and pivots at its foot, so it is drawn centred on x and above y —
            // at the size Origins gives it, not the member's own. See NEEDLE_WIDTH.
            context.drawImage(pointer, -NEEDLE_WIDTH / 2, -NEEDLE_HEIGHT, NEEDLE_WIDTH, NEEDLE_HEIGHT);
            context.restore();
        }

        if(pivot !== null)
        {
            context.drawImage(pivot, PIVOT_X - pivot.width / 2, PIVOT_Y - pivot.height / 2);
        }

        target.bitmap = canvas.transferToImageBitmap();
        target.invalidate();
    }

    // TS-only: Vortex-only view.
    private bindKey(name: string, direction: number): void
    {
        const button = this.child(name);

        if(button === null)
        {
            log.warn(`${name} is missing from ${LAYOUT}; that key cannot be clicked.`);

            return;
        }

        button.addEventListener(WindowMouseEvent.CLICK, () => this._onNudge(direction));
    }

    /** Shows or hides a key's pressed art, which sits under the unpressed one in the layout. */
    // TS-only: Vortex-only view.
    private press(name: string, down: boolean): void
    {
        const target = this.child(name);

        if(target !== null) target.visible = down;
    }

    // TS-only: Vortex-only view.
    private sprite(assetName: string): ImageBitmap | null
    {
        const bitmap = (this._assets?.getAssetByName(assetName)?.content ?? null) as ImageBitmap | null;

        if(bitmap === null) log.warn(`${assetName} is not in the asset library.`);

        return bitmap;
    }

    // TS-only: Vortex-only view.
    private child(name: string): IWindow | null
    {
        return this._window?.findChildByName(name) ?? null;
    }

    // TS-only: Vortex-only view.
    private setCaption(name: string, caption: string): void
    {
        const child = this.child(name);

        if(child !== null) child.caption = caption;
    }

    /** Name/value pairs, not positional values — see `FishingSpotWidget.translate()`. */
    // TS-only: Vortex-only view.
    private translate(key: string, ...params: string[]): string
    {
        return this._localizations?.getLocalizationWithParams(key, key, ...params) ?? key;
    }

    // TS-only: Vortex-only view.
    public dispose(): void
    {
        this._window?.dispose();
        this._window = null;
    }
}
