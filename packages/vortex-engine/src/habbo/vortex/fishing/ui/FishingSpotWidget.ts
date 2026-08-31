import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import {Logger} from '@core/utils/Logger';
import {WindowEvent} from '@core/window/events/WindowEvent';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {VortexFishingMountCatchComposer} from '@habbo/communication/messages/outgoing/vortex/VortexFishingMountCatchComposer';
import {VortexHookHavocInputComposer} from '@habbo/communication/messages/outgoing/vortex/VortexHookHavocInputComposer';
import {VortexStartFishingComposer} from '@habbo/communication/messages/outgoing/vortex/VortexStartFishingComposer';
import {VortexStopFishingComposer} from '@habbo/communication/messages/outgoing/vortex/VortexStopFishingComposer';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';

import type {FishingDefinitions} from '../FishingDefinitions';
import type {IFishingPlayerState} from '../HabboFishing';
import {HOOK_HAVOC_LEFT, HOOK_HAVOC_RIGHT, HOOK_HAVOC_TICK_MS, HookHavocGame} from '../HookHavocGame';
import type {FishingSpotWidgetHandler} from './FishingSpotWidgetHandler';
import {HookHavocView} from './HookHavocView';

const log = Logger.getLogger('vortex.fishing.ui.FishingSpotWidget');

/** The layout's own name, and the names of the children this widget drives. */
const LAYOUT_NAME = 'vortex_fishing_hud_xml';
const CHILD_LEVEL = 'hud_level';
const CHILD_LEVEL_MAX = 'hud_level_box_max';
const CHILD_XP_FILL = 'hud_xp_fill';
const CHILD_XP = 'hud_xp';
const CHILD_TOKENS = 'hud_tokens';
const CHILD_STATUS = 'hud_status';

/** The XP fill's span inside `fishing_progress_bar`'s 4px border — see the layout. */
const XP_FILL_MAX_WIDTH = 233;

/** The layer the room widgets and Hook Havoc sit on; the strip belongs with them. */
const HUD_LAYER = 1;

/** How far under the top edge the strip sits, clear of the toolbar's own chrome. */
const HUD_TOP_MARGIN = 8;

/**
 * How far off centre the dial shows before the needle pins to its edge.
 *
 * Display only — the simulation does not bound the needle, and a player who never corrects drifts
 * away for ever. Forty is roughly three times the default tolerance, so the gauge's painted arc is
 * used across its width and there is visible room to be wrong in.
 */
const HH_NEEDLE_RANGE = 40;

/**
 * Localisation keys. Every string this widget shows goes through one of these — a species' or zone's
 * `nameKey` is a key, not a display string, and printing it raw is how a panel ends up reading
 * `fishing.species.minnow` to a player.
 */
const KEY_CUE_FISH = 'vortex.fishing.cue.fish';
const KEY_DEPLETED = 'vortex.fishing.depleted';
const KEY_HOOK_HAVOC = 'vortex.fishing.hook_havoc';
const KEY_HOOK_HAVOC_WON = 'vortex.fishing.hook_havoc.won';
const KEY_HOOK_HAVOC_LOST = 'vortex.fishing.hook_havoc.lost';
const KEY_CUE_GOLDEN = 'vortex.fishing.cue.golden';
const KEY_CAUGHT = 'vortex.fishing.caught';
const KEY_ERROR_PREFIX = 'vortex.fishing.error.';
const KEY_ERROR_UNKNOWN = 'vortex.fishing.error.unknown';
const KEY_MOUNTED = 'vortex.fishing.mounted';

/** What the widget needs to send. Narrow on purpose: four composers and nothing else. */
export interface IFishingConnection
{
    // TS-only: Vortex-only — everything this panel can say to the server.
    send(
        composer:
            | VortexStartFishingComposer
            | VortexStopFishingComposer
            | VortexFishingMountCatchComposer
            | VortexHookHavocInputComposer
    ): void;
}

/**
 * The half of `HabboFishing` this widget needs: the tables it draws, the player's standing in them,
 * and the slot it registers itself in so incoming messages reach it.
 *
 * `playerState` was deliberately left out while this was a panel — the panel showed a zone name and
 * nothing else. The strip that replaced it *is* the level, the XP bar and the token count, so it
 * needs the state; it still has no business with the records tab, which the Fishopedia reads.
 */
export interface IFishingWidgetHost
{
    // TS-only: Vortex-only — the definition tables, for the level curve and species names.
    readonly definitions: FishingDefinitions;

    // TS-only: Vortex-only — the level, XP and token balance the strip draws.
    readonly playerState: IFishingPlayerState;

    // TS-only: Vortex-only — where an open widget registers so the wire can reach it.
    widget: FishingSpotWidget | null;
}

/**
 * The panel a fishing spot opens.
 *
 * NOT ported from AS3 — Vortex-only system, no Habbo equivalent and therefore no AS3 source to
 * trace to. See `docs/vortex-original/fishing.md` §2.3 and §4.
 *
 * **It computes nothing.** The zone name and level gate come from `FishingDefinitions`, the player's
 * level from `FishingPlayerState`, the cue from `FishSighted`, and every outcome from the server.
 *
 * **Fishing is a session, not a cast per fish.** One `StartFishing` begins it; after that the avatar
 * fishes on its own and this widget only listens, until `FishingSpotDepleted` says the spot ran dry.
 * The one button starts the session and then stops it — a shadow is something to watch, not
 * something to act on. Nothing here can start two, which is a courtesy: the server re-checks and
 * answers `TooSoon`.
 */
export class FishingSpotWidget extends RoomWidgetBase
{
    // TS-only: Vortex-only widget — no AS3 counterpart for any member here.
    private _window: IWindowContainer | null = null;

    // TS-only: see above.
    private _definitions: FishingDefinitions | null = null;

    // TS-only: Vortex-only — read live for the level, XP and tokens the strip shows.
    private _fishingHost: IFishingWidgetHost | null = null;

    /**
     * Read live from the handler's container rather than cached, the way
     * `RentableSpaceWidgetHandler` reaches it: the container is attached after the widget is built,
     * and it is replaced on every room change.
     */
    // TS-only: Vortex-only widget.
    private get connection(): IFishingConnection | null
    {
        return (this._handler as FishingSpotWidgetHandler | null)?.container?.connection ?? null;
    }

    // TS-only: the spot this panel was opened on. What `StartFishing` names.
    private _spotObjectId: number = 0;

    // TS-only: the sighting currently showing, or 0 when nothing is passing. Display only.
    private _armedSightingId: number = 0;

    // TS-only: true while a session is running — the button then stops rather than starts.
    private _fishing: boolean = false;

    // TS-only: the last catch's server-issued record id, or 0. What the mount button names.
    private _lastRecordId: number = 0;

    /**
     * Re-centres the strip when the desktop resizes. Bound once so it can be removed by identity;
     * an anonymous handler would leak one per session.
     */
    // TS-only: Vortex-only widget.
    private readonly _onDesktopResized: () => void = () => this.place();

    /** The attempt now running, or null. */
    // TS-only: Vortex-only widget.
    private _game: HookHavocGame | null = null;

    // TS-only: Vortex-only widget — the 100ms simulation clock.
    private _interval: ReturnType<typeof setInterval> | null = null;

    /** Origins' own Hook Havoc panel, built on first use. */
    // TS-only: Vortex-only widget.
    private _hookHavoc: HookHavocView | null = null;

    /**
     * Ticks left in the attempt, for the countdown Origins shows.
     *
     * Counted here rather than asked of the game: `HookHavocGame` answers whether it is finished,
     * not how long is left, and giving it a display concern would put a second reason to change it
     * beside the one that matters — staying identical to the server's replay.
     */
    // TS-only: Vortex-only widget.
    private _ticksLeft: number = 0;

    /**
     * Q and E, the two keys Origins uses. Bound once so the document listener can be removed by
     * identity when the attempt ends — an anonymous handler would leak one per Hook Havoc.
     *
     * `event.code` rather than `event.key`: the physical key is what the guides describe, and on an
     * AZERTY keyboard `key` for that same key is `a`.
     */
    // TS-only: Vortex-only widget.
    private readonly _onHookHavocKey: (event: KeyboardEvent) => void = (event) =>
    {
        if(this._game === null) return;

        if(event.code === 'KeyQ') this.nudge(HOOK_HAVOC_LEFT);
        else if(event.code === 'KeyE') this.nudge(HOOK_HAVOC_RIGHT);
        else return;

        // The room reads keys too — a Q typed at the minigame must not also walk the avatar or land
        // in the chat bar.
        event.preventDefault();
        event.stopPropagation();
    };

    // TS-only: Vortex-only widget.
    constructor(
        handler: FishingSpotWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null = null,
        localizations: IHabboLocalizationManager | null = null
    )
    {
        super(handler, windowManager, assets, localizations);

        handler.widget = this;
    }

    /**
     * Handed in after construction, like every other optional dependency in this engine.
     *
     * **Both halves of this call are load-bearing and neither fails loudly.** Without the tables the
     * panel opens reading "you cannot fish here", because a zone is resolved from them; without the
     * registration `HabboFishing` holds a null widget and every sighting, catch and refusal is
     * dropped on arrival. The first version of this widget was wired for neither.
     */
    // TS-only: Vortex-only wiring.
    public setFishing(fishing: IFishingWidgetHost): void
    {
        this._definitions = fishing.definitions;
        this._fishingHost = fishing;

        fishing.widget = this;
    }

    /**
     * A spot was clicked: start fishing, or stop if this one is already running.
     *
     * **Nothing opens.** Origins' cast carries thirteen window definitions and not one of them is a
     * spot panel — clicking the water fishes, and the only fishing window it ever shows is Hook
     * Havoc. The panel this replaced was invented. What is left on screen is the strip below, which
     * is built from Origins' own plates; see `docs/vortex-original/fishing.md` §18.
     *
     * `furniClass` is no longer read: the strip names no zone, and the server refuses a spot the
     * player cannot fish with an error that lands in the same status line as everything else. It
     * stays in the signature because `RoomWidgetFactory` passes it and a zone name may yet earn a
     * place here.
     *
     * `buildWidgetLayout()` answers null when the layout is not registered — a Vortex layout moved
     * into `src/assets/window-layouts/` would be wiped by the next asset build and land here. Saying
     * so out loud beats an invisible no-op.
     */
    // TS-only: Vortex-only widget.
    public open(spotObjectId: number, furniClass: string): void
    {
        void furniClass;

        if(this._window === null)
        {
            this._window = this.windowManager.buildWidgetLayout(LAYOUT_NAME) as IWindowContainer | null;

            if(this._window === null)
            {
                log.warn(`${LAYOUT_NAME} is not registered; the fishing strip cannot be shown.`);

                return;
            }

            // `buildWidgetLayout()` hands back a standalone window — AS3 passes null as the parent
            // and leaves placing it to the caller. `RoomDesktop` would have attached it, but it
            // reads `mainWindow` once when the widget is CREATED and this one builds its window
            // lazily on the first click, so by then nothing is listening.
            //
            // The panel this replaced got away with it because its root was a `frame`; a bare
            // container is built, holds its children, and is never drawn. Same failure as
            // HookHavocView's, and the reason nothing appeared when fishing started.
            const desktop = this.windowManager.getDesktop(HUD_LAYER) as unknown as IWindowContainer | null;

            if(desktop === null || typeof desktop.addChild !== 'function')
            {
                log.warn(`No desktop on layer ${HUD_LAYER}; the fishing strip cannot be shown.`);

                return;
            }

            desktop.addChild(this._window);

            // Placed here, not in the layout: the strip is centred on the desktop, whose size is
            // only known at runtime and changes when the window does. The x/y in the XML are a
            // starting point for the editor and are overwritten on the first show.
            this._window.addEventListener(WindowEvent.WE_PARENT_RESIZED, this._onDesktopResized);

            this.clearSighting();
        }

        this.place();

        // Clicking the spot that is already fishing stops it — the strip has no buttons, so the
        // furni is the control. A *different* spot clicked mid-session is ignored rather than
        // silently retargeting: the server would refuse it anyway, and one session runs at a time.
        if(this._fishing)
        {
            if(spotObjectId === this._spotObjectId) this.toggleFishing();

            return;
        }

        this._spotObjectId = spotObjectId;

        this.refreshState();
        this.setCaption(CHILD_STATUS, '');

        this._window.visible = true;

        // Every silent way this can go wrong, in one line: no strip, no host to read the state off,
        // or no connection to start the session with. Each of those shows as "nothing happened".
        log.debug(
            `Fishing at spot ${spotObjectId}: strip attached, `
            + `host ${this._fishingHost === null ? 'MISSING' : 'ok'}, `
            + `connection ${this.connection === null ? 'MISSING' : 'ok'}`
        );

        this.toggleFishing();
    }

    /**
     * The room engine deselecting the furni. It must NOT take the strip away: the session outlives
     * the click that started it, and Origins has the avatar fish on unattended. The strip goes when
     * the session does — see `endSession()`.
     */
    // TS-only: Vortex-only widget.
    public close(spotObjectId: number): void
    {
        // The room engine closes widgets by object, and a click elsewhere can close a widget that
        // was never showing that object. Ignoring the mismatch is what the rentable-space widget
        // does.
        if(this._window === null || (spotObjectId !== 0 && spotObjectId !== this._spotObjectId)) return;

        if(!this._fishing) this._window.visible = false;
    }

    /**
     * Redraws the level, the XP bar and the token count from the player state.
     *
     * Pushed, not polled: `HabboFishing` calls this when `FishingPlayerState` arrives, which is on
     * login and after every catch. The bar's span is the gap between the level reached and the next
     * one, so a player at the cap shows a full bar and the gold slot.
     */
    // TS-only: Vortex-only widget.
    public refreshState(): void
    {
        if(this._window === null || this._fishingHost === null) return;

        const state = this._fishingHost.playerState;
        const levels = this._definitions?.allFishingLevels ?? [];

        this.setCaption(CHILD_LEVEL, `${state.fishingLevel}`);
        this.setCaption(CHILD_TOKENS, `${state.currency}`);

        const reached = this._definitions?.fishingLevelForXp(state.fishingXp) ?? null;
        const next = reached === null
            ? null
            : levels.find((level) => level.xpThreshold > reached.xpThreshold) ?? null;

        this.setVisible(CHILD_LEVEL_MAX, reached !== null && next === null);

        if(reached === null || next === null)
        {
            // At the cap, or no level table yet. A full bar reads better than an empty one for the
            // first case and is harmless for the second, which resolves on the next push.
            this.setCaption(CHILD_XP, `${state.fishingXp}`);
            this.setFillWidth(CHILD_XP_FILL, reached === null ? 0 : 1);

            return;
        }

        const into = state.fishingXp - reached.xpThreshold;
        const span = Math.max(1, next.xpThreshold - reached.xpThreshold);

        this.setCaption(CHILD_XP, `${into} / ${span}`);
        this.setFillWidth(CHILD_XP_FILL, into / span);
    }

    /**
     * A fish is passing, inside a session that is already running.
     *
     * Display only: the player does not act on a sighting. Origins has the avatar fish on its own
     * once started, and the catch resolves server-side whether or not anybody is looking — so this
     * shows the shadow and nothing more. `durationMs` is not enforced here either; the server
     * decides when a sighting expires, and a client timer that disagreed would only confuse.
     */
    // TS-only: Vortex-only widget, driven by VortexFishSightedMessageEvent.
    public onSighted(sightingId: number, golden: boolean): void
    {
        this._armedSightingId = sightingId;

        this.setCaption(CHILD_STATUS, this.translate(golden ? KEY_CUE_GOLDEN : KEY_CUE_FISH));
    }

    /** Forgets the armed sighting — used by both outcomes and by a refusal. */
    // TS-only: Vortex-only widget.
    public clearSighting(): void
    {
        this._armedSightingId = 0;
    }

    /**
     * A species this build has no definition for still has to say something: the definitions are
     * pushed and a catch can name one that arrived in a reload this client has not applied yet.
     */
    // TS-only: Vortex-only widget, driven by VortexFishingCatchResultMessageEvent.
    public onCatch(recordId: number, speciesId: number, weight: number): void
    {
        const species = this._definitions?.getSpecies(speciesId) ?? null;
        const speciesName = species === null ? `#${speciesId}` : this.translate(species.nameKey);

        // Zero means the server could not bank the catch. Kept for the mount composer, which has no
        // button on the strip — see the note on `mountLastCatch()`.
        this._lastRecordId = recordId;

        this.clearSighting();
        this.setCaption(CHILD_STATUS, this.translate(KEY_CAUGHT, 'species', speciesName, 'weight', `${weight}`));

        // The catch is XP and tokens, so the counters above it have just moved. The server pushes a
        // fresh state after every catch and `refreshState()` runs then too; this only spares the
        // strip a frame of stale numbers if the two messages arrive out of order.
        this.refreshState();
    }

    /**
     * Error codes are append-only, so a code this build does not know is always a newer one. It
     * falls back to a generic message rather than showing a bare number.
     */
    // TS-only: Vortex-only widget, driven by VortexFishingErrorMessageEvent.
    public onError(code: number, known: boolean): void
    {
        // A refused start is the common case, and it leaves no session behind — so the panel has to
        // come back to idle here or the button stays dead until it is rebuilt.
        this.endSession();
        this.setCaption(CHILD_STATUS, this.translate(known ? `${KEY_ERROR_PREFIX}${code}` : KEY_ERROR_UNKNOWN));
    }

    /**
     * Starts the session, or stops one already running. One button, two states.
     *
     * **One packet starts the whole session.** Origins does not ask per fish: the avatar fishes on
     * its own until the spot runs dry, and everything after this is the client listening.
     *
     * Starting names the *spot*, not a sighting. Waiting for a shadow before allowing a start would
     * deadlock the feature, because shadows only arrive inside a session that has already begun —
     * which is what the first version of this method did, and it also sent the sighting id in the
     * spot's place.
     *
     * Stopping is a courtesy in the other direction: the server ends a session on its own when the
     * player leaves the room or disconnects, so this only spares it simulating one nobody is
     * watching.
     */
    // TS-only: Vortex-only widget.
    private toggleFishing(): void
    {
        const connection = this.connection;

        if(connection === null) return;

        if(this._fishing)
        {
            connection.send(new VortexStopFishingComposer());

            return;
        }

        if(this._spotObjectId === 0) return;

        this._fishing = true;
        connection.send(new VortexStartFishingComposer(this._spotObjectId));
    }

    /**
     * Mounts the last catch as a trophy.
     *
     * It can only ever be the *last* one: `FishingRecords` carries no row ids, so `CatchResult` is
     * the only message that ever names one, and the client has nothing else to point at.
     *
     * **Nothing calls this.** The strip that replaced the spot panel has no buttons, and the panel's
     * mount button went with it. It was already inert — mounting needs `fishing.trophy_furni_class`
     * set and the shipped default is empty — so nothing that worked was lost. The Fishopedia's
     * records tab is where it belongs, since that is the one screen that lists catches.
     */
    // TS-only: Vortex-only widget.
    public mountLastCatch(): void
    {
        const connection = this.connection;

        if(this._lastRecordId === 0 || connection === null) return;

        connection.send(new VortexFishingMountCatchComposer(this._lastRecordId));

        this._lastRecordId = 0;
        this.setCaption(CHILD_STATUS, this.translate(KEY_MOUNTED));
    }

    /** The spot ran dry — the ordinary end of a session. */
    // TS-only: Vortex-only widget, driven by VortexFishingSpotDepletedMessageEvent.
    public onSpotDepleted(catches: number): void
    {
        this.endSession();
        this.setCaption(CHILD_STATUS, this.translate(KEY_DEPLETED, 'catches', `${catches}`));
    }

    /** Back to the idle state: not fishing, button offering to start again. */
    // TS-only: Vortex-only widget.
    private endSession(): void
    {
        // A session can end mid-attempt — the spot depletes, the player walks out, the server
        // refuses something. Leaving the interval and the document listener behind would keep a
        // dead minigame ticking and swallowing every Q and E the player types afterwards.
        this.endHookHavoc();

        this._fishing = false;

        this.clearSighting();

        // The strip goes with the session. It is not a panel the player closes — it is the only sign
        // that fishing is happening, so leaving it up afterwards would say something untrue.
        if(this._window !== null) this._window.visible = false;
    }

    /**
     * Hook Havoc triggered: play it.
     *
     * The client plays and the server replays. `HookHavocGame` is the arithmetic both halves run —
     * see its own comment for why it must not drift from
     * `../vortex-emulator/Vortex.Fishing/HookHavocSimulation.cs`. Here it only drives the display and
     * collects the timeline; nothing decided on this side reaches the server except the keys pressed.
     *
     * `attemptId` is deliberately unused: one attempt is live at a time and the server knows which,
     * so the input names nothing. It is in the signature because the packet carries it and a future
     * concurrent attempt would need it.
     */
    // TS-only: Vortex-only widget, driven by VortexHookHavocStartedMessageEvent.
    public onHookHavocStarted(
        attemptId: number, seed: number, durationMs: number, fillRate: number, tolerance: number
    ): void
    {
        void attemptId;

        // A second start while one runs would leave the first's interval and key listener behind.
        this.endHookHavoc();

        this._game = new HookHavocGame(seed, durationMs, fillRate, tolerance);
        this._ticksLeft = Math.max(1, Math.floor(durationMs / HOOK_HAVOC_TICK_MS));

        this.setCaption(CHILD_STATUS, this.translate(KEY_HOOK_HAVOC));
        this.hookHavocView.show();
        this.hookHavocView.draw(0, HH_NEEDLE_RANGE, 0, this._ticksLeft, HOOK_HAVOC_TICK_MS);

        // On the document, not on the panel: the minigame has to answer to Q and E wherever the
        // pointer is, and a window-scoped listener only fires while that window holds focus. The
        // changelog window and the sound context reach for the document the same way.
        document.addEventListener('keydown', this._onHookHavocKey);

        this._interval = setInterval(() => this.stepHookHavoc(), HOOK_HAVOC_TICK_MS);
    }

    /**
     * One simulated step: advance, redraw, and send the timeline once it ends.
     *
     * The timeline goes up even on a loss. The server is waiting for it — an attempt it never hears
     * about stays live and the session stops with it.
     */
    // TS-only: Vortex-only widget.
    private stepHookHavoc(): void
    {
        if(this._game === null) return;

        const state = this._game.tick();

        this._ticksLeft = Math.max(0, this._ticksLeft - 1);
        this.hookHavocView.draw(
            state.needle, HH_NEEDLE_RANGE, state.fill, this._ticksLeft, HOOK_HAVOC_TICK_MS
        );

        if(!state.finished) return;

        const timeline = this._game.timeline;

        this.endHookHavoc();
        this.connection?.send(new VortexHookHavocInputComposer(timeline));
    }

    /** Stops the attempt and puts the panel back. Safe when none is running. */
    // TS-only: Vortex-only widget.
    private endHookHavoc(): void
    {
        if(this._interval !== null)
        {
            clearInterval(this._interval);
            this._interval = null;
        }

        document.removeEventListener('keydown', this._onHookHavocKey);

        this._game = null;
        this._hookHavoc?.hide();
    }

    /**
     * One nudge, from the keyboard or from the panel's own key button.
     *
     * Both go through here so a clicked button flashes exactly as a typed key does, and so the
     * timeline records them identically — the server cannot tell the two apart and must not.
     */
    // TS-only: Vortex-only widget.
    private nudge(direction: number): void
    {
        if(this._game === null) return;

        this._game.nudge(direction);
        this._hookHavoc?.flash(direction);
    }

    /** Built on first use: an attempt starts on a catch, which can be every few seconds. */
    // TS-only: Vortex-only widget.
    private get hookHavocView(): HookHavocView
    {
        this._hookHavoc ??= new HookHavocView(
            this.windowManager, this.assets, this.localizations, (d) => this.nudge(d)
        );

        return this._hookHavoc;
    }

    /** The server's verdict on an attempt. A rejected timeline reads as an ordinary loss. */
    // TS-only: Vortex-only widget, driven by VortexHookHavocResultMessageEvent.
    public onHookHavocResult(won: boolean, speciesId: number, currencyGained: number): void
    {
        if(!won)
        {
            this.setCaption(CHILD_STATUS, this.translate(KEY_HOOK_HAVOC_LOST));

            return;
        }

        const species = this._definitions?.getSpecies(speciesId) ?? null;
        const name = species === null ? `#${speciesId}` : this.translate(species.nameKey);

        this.setCaption(CHILD_STATUS, this.translate(KEY_HOOK_HAVOC_WON, 'species', name, 'amount', `${currencyGained}`));
    }

    /**
     * `getLocalizationWithParams()` never returns null in this port — it answers the key itself when
     * there is no entry — so the key doubles as its own fallback and a missing translation is
     * visible rather than blank.
     *
     * **`params` are name/value pairs, not positional values.** The manager reads them two at a time
     * and registers `params[i]` as the name of `params[i + 1]`; a list of bare values therefore
     * registers the first value under the second's name and substitutes nothing. Every caller here
     * passes `'name', value` accordingly.
     */
    // TS-only: Vortex-only widget.
    private translate(key: string, ...params: string[]): string
    {
        return this.localizations?.getLocalizationWithParams(key, key, ...params) ?? key;
    }

    // TS-only: Vortex-only widget.
    private child(name: string): IWindow | null
    {
        return this._window?.findChildByName(name) ?? null;
    }

    // TS-only: Vortex-only widget.
    private setCaption(name: string, caption: string): void
    {
        const child = this.child(name);

        if(child !== null)
        {
            child.caption = caption;
        }
    }

    // TS-only: Vortex-only widget.
    private setVisible(name: string, visible: boolean): void
    {
        const child = this.child(name);

        if(child !== null)
        {
            child.visible = visible;
        }
    }

    /**
     * Centres the strip horizontally and parks it under the top edge.
     *
     * `center()` does both axes, so the vertical half is undone straight after: the strip belongs at
     * the top of the screen, out of the room's way, where Origins keeps its own counters.
     */
    // TS-only: Vortex-only widget.
    private place(): void
    {
        if(this._window === null) return;

        this._window.center();
        this._window.y = HUD_TOP_MARGIN;
    }

    /**
     * Sets a stretched bar's width from a 0..1 fraction.
     *
     * A one-pixel floor keeps the bar a bar: at zero the window still has to draw something, or the
     * trough reads as broken rather than as empty.
     */
    // TS-only: Vortex-only widget.
    private setFillWidth(name: string, fraction: number): void
    {
        const child = this.child(name);

        if(child === null) return;

        child.width = Math.max(1, Math.round(Math.min(1, Math.max(0, fraction)) * XP_FILL_MAX_WIDTH));
    }

    /** `enable()`/`disable()` are methods on `IWindow`, not a boolean property. */
    // TS-only: Vortex-only widget.
    private setEnabled(name: string, enabled: boolean): void
    {
        const child = this.child(name);

        if(child === null)
        {
            return;
        }

        if(enabled) child.enable();
        else child.disable();
    }

    // TS-only: Vortex-only widget.
    public override get mainWindow(): IWindow | null
    {
        return this._window;
    }

    // TS-only: `IRoomWidget` contract.
    public override dispose(): void
    {
        // First: it is the only thing that removes the document-level key listener, and a leaked one
        // would swallow every Q and E the player types for the rest of the session.
        this.endHookHavoc();

        // Its own window, not a child of this one — Origins keeps Hook Havoc in a separate panel and
        // so does this port, so it is not disposed by the tree below.
        this._hookHavoc?.dispose();
        this._hookHavoc = null;

        // Nothing to unbind: the strip has no buttons. The furni is the control, and that click
        // arrives through the room engine, not through a listener this widget owns.
        this._window?.dispose();
        this._window = null;
        this._definitions = null;
        this._fishingHost = null;
        this._armedSightingId = 0;
        this._spotObjectId = 0;
        this._lastRecordId = 0;
        this._fishing = false;

        super.dispose();
    }
}
