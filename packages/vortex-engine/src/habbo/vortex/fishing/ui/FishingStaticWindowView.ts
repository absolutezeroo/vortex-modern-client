import {Logger} from '@core/utils/Logger';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';

const log = Logger.getLogger('habbo.vortex.fishing.ui.FishingStaticWindowView');

/** The layer the room widgets sit on; these belong with them. */
const LAYER = 1;

/**
 * Opens one of the windows `scripts/origins/convert-window.py` converts, as artwork.
 *
 * NOT ported from AS3 — fishing is an Origins feature. See `docs/vortex-original/fishing.md` §23.
 *
 * **These windows have no behaviour yet, and that is the point of this class.** The store and the
 * derby are converted from Origins' own element lists, so their layout, artwork and text are
 * finished and their logic is not. A converted layout with nothing to open it is exactly this port's
 * most common defect — complete code nobody connects — so rather than leave six XML files that
 * nothing references, this makes each reachable from a chat command and says out loud, at every call
 * site, that only the picture is there.
 *
 * What is missing per window is one view class each: the store's three tabs and its purchase flow,
 * the derby's standings, its timer and its registration. The wire messages for the derby already
 * exist on both sides (`VortexFishingDerbyStandingMessageEvent`, `VortexFishingJoinDerbyComposer`,
 * `FishingDerbyGrain`); the store's do not, because the shop is meant to ride the catalogue.
 */
export class FishingStaticWindowView
{
    // TS-only: Vortex-only view — no AS3 counterpart for any member here.
    private readonly _windowManager: IHabboWindowManager;

    // TS-only: see above.
    private readonly _layout: string;

    // TS-only: see above.
    private _window: IWindowContainer | null = null;

    // TS-only: see above.
    private _disposed: boolean = false;

    // TS-only: see above.
    private readonly _onClick = (): void =>
    {
        // Any click closes it. There is no close button to bind yet — which one it is differs per
        // window and none of them has a handler — so this is the whole interaction.
        this.close();
    };

    // TS-only: Vortex-only view.
    constructor(windowManager: IHabboWindowManager, layout: string)
    {
        this._windowManager = windowManager;
        this._layout = layout;
    }

    /**
     * Builds the window on first use and attaches it.
     *
     * `buildWidgetLayout()` hands back a standalone window — AS3 passes null as the parent and
     * leaves placing it to the caller — so without the `addChild` below it is built, holds its
     * children, and is never drawn.
     */
    // TS-only: Vortex-only view.
    public open(): void
    {
        if(this._disposed) return;

        if(this._window === null)
        {
            this._window = this._windowManager.buildWidgetLayout(this._layout, LAYER) as IWindowContainer | null;

            if(this._window === null)
            {
                log.warn(`${this._layout} is not registered; nothing to show.`);

                return;
            }

            const desktop = this._windowManager.getDesktop(LAYER) as unknown as IWindowContainer | null;

            if(desktop === null || typeof desktop.addChild !== 'function')
            {
                log.warn(`No desktop on layer ${LAYER}; ${this._layout} cannot be shown.`);

                return;
            }

            desktop.addChild(this._window);
            this._window.addEventListener(WindowMouseEvent.CLICK, this._onClick);
        }

        this._window.visible = true;
        log.info(`${this._layout} opened. Artwork only — see fishing.md §23 for what it still needs.`);
    }

    // TS-only: Vortex-only view.
    public close(): void
    {
        if(this._window !== null) this._window.visible = false;
    }

    // TS-only: `IDisposable`.
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // TS-only: `IDisposable`.
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._window !== null)
        {
            this._window.removeEventListener(WindowMouseEvent.CLICK, this._onClick);
            this._window.dispose();
            this._window = null;
        }
    }
}
