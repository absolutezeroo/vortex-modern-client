/* eslint-disable @typescript-eslint/no-explicit-any */
import type {IAssetLibrary} from '@core/assets';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';
import {Component, ComponentDependency, type IContext} from '@core/runtime';
import {Logger} from '@core/utils/Logger';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import {
    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    VortexFishingSpotDepletedMessageEvent,
    VortexHookHavocStartedMessageEvent,
    VortexHookHavocResultMessageEvent,
    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    VortexFishingCatchResultMessageEvent,
    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    VortexFishingDefinitionsMessageEvent,
    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    VortexFishingErrorMessageEvent,
    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    VortexFishingPlayerStateMessageEvent,
    VortexFishingRecordsMessageEvent,
    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    VortexFishSightedMessageEvent,
} from '@habbo/communication/messages/incoming/vortex';
import type {VortexFishingSpotDepletedMessageParser} from '@habbo/communication/messages/parser/vortex/VortexFishingSpotDepletedMessageParser';
import type {VortexHookHavocResultMessageParser} from '@habbo/communication/messages/parser/vortex/VortexHookHavocResultMessageParser';
import type {VortexHookHavocStartedMessageParser} from '@habbo/communication/messages/parser/vortex/VortexHookHavocStartedMessageParser';
import type {VortexFishingCatchResultMessageParser} from '@habbo/communication/messages/parser/vortex/VortexFishingCatchResultMessageParser';
import type {VortexFishingDefinitionsMessageParser} from '@habbo/communication/messages/parser/vortex/VortexFishingDefinitionsMessageParser';
import {fishingErrorKey} from '@habbo/communication/messages/parser/vortex/VortexFishingErrorMessageParser';
import type {VortexFishingErrorMessageParser} from '@habbo/communication/messages/parser/vortex/VortexFishingErrorMessageParser';
import type {VortexFishingPlayerStateMessageParser} from '@habbo/communication/messages/parser/vortex/VortexFishingPlayerStateMessageParser';
import type {FishingRecord, VortexFishingRecordsMessageParser} from '@habbo/communication/messages/parser/vortex/VortexFishingRecordsMessageParser';
import type {VortexFishSightedMessageParser} from '@habbo/communication/messages/parser/vortex/VortexFishSightedMessageParser';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboNotifications} from '@habbo/notifications/IHabboNotifications';
import {copyBitmap} from '@habbo/notifications/utils/copyBitmap';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboNotifications} from '@iid/IIDHabboNotifications';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';

import {FishingPediaView} from './ui/FishingPediaView';
import {FishingStaticWindowView} from './ui/FishingStaticWindowView';

import {FishingDefinitions} from './FishingDefinitions';
import type {FishingSpotWidget} from './ui/FishingSpotWidget';

const log = Logger.getLogger('habbo.vortex.fishing.HabboFishing');

/**
 * The catch bubbles.
 *
 * Not from the cast: `hh_fishing.cst` carries no such string, so Origins raises these from the main
 * client rather than from the fishing module, and the keys here are Vortex's own. The texts live in
 * `tools/locale-overrides/` and must be merged into the served `external_flash_texts.json` — see
 * docs/vortex-original/fishing.md §11.
 */
const KEY_CAUGHT_GOLDEN = 'vortex.fishing.notification.golden';
const KEY_DISCOVERED = 'vortex.fishing.notification.discovered';
const KEY_LEVEL_UP = 'vortex.fishing.notification.levelup';

/**
 * The bubble's style, and it has to be one `habbo_notifications_config_xml` already declares.
 *
 * `SingularNotificationController.addItem()` looks the type up in that config and **drops the
 * notification** when it is absent — one `warn`, nothing on screen. A `fishing` entry would have to
 * go into a shipped Flash asset that `build-window-assets.mjs` regenerates from the dump, so it
 * would not survive; `info` is the generic informational bubble, carries no internal link, and its
 * `if_icon_temp_png` is only a fallback because an explicit `iconBitmap` overrides it.
 */
const NOTIFICATION_TYPE = 'info';

/** The Fish-O-Pedia's species artwork, keyed by the last segment of the localisation key. */
const ASSET_FISH_PREFIX = 'fishpedia_';
const ASSET_FISH_SUFFIX = '_preview';

/** The player's own fishing state, as the server last pushed it. */
export interface IFishingPlayerState
{
    // TS-only: the fishing level — unlocks zones, and nothing else.
    readonly fishingLevel: number;
    // TS-only: cumulative fishing XP.
    readonly fishingXp: number;
    // TS-only: the rod's quality tier — multipliers and Hook Havoc chance. A separate progression.
    readonly rodQuality: number;
    // TS-only: cumulative rod XP.
    readonly rodXp: number;
    // TS-only: Vortex-only — the fishing currency's balance.
    readonly currency: number;
    // TS-only: Vortex-only — measured against the daily cap below.
    readonly currencyEarnedToday: number;
    // TS-only: Vortex-only — zero means uncapped.
    readonly dailyCap: number;
    // TS-only: Vortex-only — a zero cap means uncapped, not instantly capped.
    readonly dailyCapReached: boolean;
    // TS-only: Vortex-only — feeds the diminishing-returns curve's display.
    readonly sessionCatchCount: number;
    // TS-only: Vortex-only — the bottles, statues and badge this player holds.
    readonly collectibleIds: readonly number[];
}

const EMPTY_STATE: IFishingPlayerState = {
    fishingLevel: 0,
    fishingXp: 0,
    rodQuality: 0,
    rodXp: 0,
    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    currency: 0,
    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    currencyEarnedToday: 0,
    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    dailyCap: 0,
    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    dailyCapReached: false,
    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    sessionCatchCount: 0,
    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    collectibleIds: [],
};

/**
 * The fishing system's subscriber.
 *
 * NOT ported from AS3 — Vortex-only system, no Habbo equivalent and therefore no AS3 source to
 * trace to. It follows the project's manager convention (DI Component + IID) rather than inventing a
 * lifecycle, the same way `HabboFurniEditor` does.
 *
 * **This class exists because a registered message with no subscriber is the port's most common
 * failure mode**: the parser runs, the event fires, and nothing listens — no throw, no log, the
 * feature simply inert. Six incoming messages are registered for fishing and this is what consumes
 * all six.
 *
 * It holds no authoritative state. The definitions are whatever the server last pushed, the player
 * state likewise, and every catch outcome is decided server-side before it arrives here.
 */
export class HabboFishing extends Component implements ILinkEventTracker
{
    // TS-only: Vortex-only system — no AS3 counterpart for any member here.
    private _communication: IHabboCommunicationManager | null = null;

    // TS-only: see above.
    private readonly _definitions: FishingDefinitions = new FishingDefinitions();

    // TS-only: see above.
    private _playerState: IFishingPlayerState = EMPTY_STATE;

    // TS-only: see above.
    private _messageEvents: IMessageEvent[] = [];

    /**
     * Personal bests, keyed by species. Only the species actually caught are in here — the records
     * tab draws the whole table from the definitions and greys out whatever this map does not have.
     */
    // TS-only: see above.
    private _records: Map<number, FishingRecord> = new Map();

    /**
     * The open spot panel, if any. Attached by `RoomUI` when the widget is built; null while the
     * player is not standing at a spot, which is most of the time.
     */
    // TS-only: see above.
    private _widget: FishingSpotWidget | null = null;

    // TS-only: Vortex-only component — for the Fish-O-Pedia, which builds its own window.
    private _windowManager: IHabboWindowManager | null = null;

    // TS-only: Vortex-only component.
    private _localizations: IHabboLocalizationManager | null = null;

    // TS-only: Vortex-only component — raises the catch and new-species bubbles.
    private _notifications: IHabboNotifications | null = null;

    // TS-only: Vortex-only component — built on the first `:fishpedia`, then reused.
    private _pedia: FishingPediaView | null = null;

    /** The converted store and derby windows, built on first use. See `openStaticWindow`. */
    // TS-only: Vortex-only component.
    private readonly _staticWindows: Map<string, FishingStaticWindowView> = new Map();

    // TS-only: Vortex-only component.
    constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
    {
        super(context, flags, assetLibrary);
    }

    // TS-only: `Component` contract.
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) =>
                {
                    this._communication = manager;
                },
                true
            ),
            // Optional, and read live rather than cached at construction: the window manager and the
            // localizations attach several components after this one, so a hard dependency on either
            // would lock the whole component with nothing in the log.
            new ComponentDependency(
                IID_HabboWindowManager,
                (manager: IHabboWindowManager | null) =>
                {
                    this._windowManager = manager;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) =>
                {
                    this._localizations = manager;
                },
                false
            ),
            // Optional too, and for the same reason. A catch raises one of the singular bubbles —
            // the live half of the notification system; the feed behind it is dead code.
            new ComponentDependency(
                IID_HabboNotifications,
                (manager: IHabboNotifications | null) =>
                {
                    this._notifications = manager;
                },
                false
            ),
        ];
    }

    /**
     * Opens Origins' own Fish-O-Pedia, built on first use.
     *
     * Opened by the me-menu entry, by the wooden sign in the room, and by `:fishpedia` — the three
     * routes all land here. See `docs/vortex-original/fishing.md` §23.
     */
    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    public openPedia(): void
    {
        if(this._windowManager === null)
        {
            log.warn('No window manager yet; the Fish-O-Pedia cannot open.');

            return;
        }

        this._pedia ??= new FishingPediaView(
            this._windowManager,
            this.assets,
            this._localizations,
            this
        );

        this._pedia.open();
    }

    /**
     * Opens one of the windows converted from Origins' own element lists — **artwork only.**
     *
     * The store and the derby have their layout, their sprites and their text and none of their
     * behaviour; §23 lists what each still needs. They are reachable rather than left as six XML
     * files nothing references, because a complete thing nobody connects is this port's most common
     * defect and the hardest to notice.
     */
    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    public openStaticWindow(layout: string): void
    {
        if(this._windowManager === null)
        {
            log.warn(`No window manager yet; ${layout} cannot open.`);

            return;
        }

        let view = this._staticWindows.get(layout) ?? null;

        if(view === null)
        {
            view = new FishingStaticWindowView(this._windowManager, layout);
            this._staticWindows.set(layout, view);
        }

        view.open();
    }

    /**
     * Subscribes all six. Any one of them left out is a silent hole — see the class comment.
     */
    // TS-only: `Component` contract.
    protected override initComponent(): void
    {
        this.addMessageEvent(new VortexFishingDefinitionsMessageEvent(this.onDefinitions.bind(this)));
        this.addMessageEvent(new VortexFishingPlayerStateMessageEvent(this.onPlayerState.bind(this)));
        this.addMessageEvent(new VortexFishSightedMessageEvent(this.onFishSighted.bind(this)));
        this.addMessageEvent(new VortexFishingCatchResultMessageEvent(this.onCatchResult.bind(this)));
        this.addMessageEvent(new VortexFishingSpotDepletedMessageEvent(this.onSpotDepleted.bind(this)));
        this.addMessageEvent(new VortexHookHavocStartedMessageEvent(this.onHookHavocStarted.bind(this)));
        this.addMessageEvent(new VortexHookHavocResultMessageEvent(this.onHookHavocResult.bind(this)));
        this.addMessageEvent(new VortexFishingErrorMessageEvent(this.onFishingError.bind(this)));
        this.addMessageEvent(new VortexFishingRecordsMessageEvent(this.onRecords.bind(this)));

        // `fishpedia/open` is how the me-menu button reaches the book. A link event rather than a
        // direct call for the reason every other component uses one: the toolbar has no business
        // holding a reference to fishing, and `HabboCatalog` registers itself the same way.
        this.context.addLinkEventTracker(this);
    }

    // TS-only: `ILinkEventTracker` — Vortex-only system, no AS3 counterpart.
    public get linkPattern(): string
    {
        return 'fishpedia/';
    }

    /** Only `fishpedia/open` for now; anything else under the prefix is ignored, not guessed at. */
    // TS-only: `ILinkEventTracker` — Vortex-only system, no AS3 counterpart.
    public linkReceived(link: string): void
    {
        if(link === 'fishpedia/open' || link === 'fishpedia/show') this.openPedia();
    }

    // TS-only: Vortex-only accessor — the definition tables, shared with whatever draws them.
    public get definitions(): FishingDefinitions
    {
        return this._definitions;
    }

    // TS-only: Vortex-only accessor.
    public get playerState(): IFishingPlayerState
    {
        return this._playerState;
    }

    /** Null for a species never caught — which is exactly what greys its row out. */
    // TS-only: Vortex-only accessor.
    public getRecord(speciesId: number): FishingRecord | null
    {
        return this._records.get(speciesId) ?? null;
    }

    // TS-only: Vortex-only accessor.
    public get caughtSpeciesCount(): number
    {
        return this._records.size;
    }

    /** Attached and detached by the widget's own lifecycle; there is at most one open at a time. */
    // TS-only: Vortex-only wiring.
    public set widget(widget: FishingSpotWidget | null)
    {
        this._widget = widget;
    }

    // TS-only: Vortex-only accessor.
    public get widget(): FishingSpotWidget | null
    {
        return this._widget;
    }

    /**
     * A definitions push. `apply()` ignores one whose version is not newer, so a reconnect broadcast
     * costs nothing — see `docs/vortex-original/fishing.md` §6.
     */
    // TS-only: Vortex-only handler.
    private onDefinitions(event: IMessageEvent): void
    {
        const parser = event.parser as VortexFishingDefinitionsMessageParser | null;

        if(parser === null) return;

        const applied = this._definitions.apply(
            parser.version, parser.species, parser.rodLevels, parser.fishingLevels, parser.zones
        );

        if(applied)
        {
            log.debug(`Fishing definitions v${parser.version}: ${parser.species.length} species, ${parser.zones.length} zones.`);
        }
    }

    // TS-only: Vortex-only handler.
    private onPlayerState(event: IMessageEvent): void
    {
        const parser = event.parser as VortexFishingPlayerStateMessageParser | null;

        if(parser === null) return;

        this._playerState = {
            fishingLevel: parser.fishingLevel,
            fishingXp: parser.fishingXp,
            rodQuality: parser.rodQuality,
            rodXp: parser.rodXp,
            currency: parser.currency,
            currencyEarnedToday: parser.currencyEarnedToday,
            dailyCap: parser.dailyCap,
            dailyCapReached: parser.dailyCapReached,
            sessionCatchCount: parser.sessionCatchCount,
            collectibleIds: parser.collectibleIds,
        };

        // The strip IS the level, the XP bar and the token count, so it has to be told. Pushed
        // rather than polled: this message arrives on login and after every catch, which is exactly
        // when those three change and never otherwise.
        this._widget?.refreshState();
    }

    /**
     * A fish is passing. Dropped when no panel is open — the player is not at a spot, and there is
     * nothing to arm.
     */
    // TS-only: Vortex-only handler.
    private onFishSighted(event: IMessageEvent): void
    {
        const parser = event.parser as VortexFishSightedMessageParser | null;

        if(parser === null) return;

        this._widget?.onSighted(parser.sightingId, parser.golden);
    }

    // TS-only: Vortex-only handler.
    private onCatchResult(event: IMessageEvent): void
    {
        const parser = event.parser as VortexFishingCatchResultMessageParser | null;

        if(parser === null) return;

        // Read BEFORE the widget and before the state push that follows: `_records` still holds the
        // pre-catch table here, so a species missing from it is one the player has never landed.
        // Origins announces that differently, and no field on the wire says so — this is the only
        // moment the client can tell.
        const discovered = this._records.get(parser.speciesId) === undefined;

        this._widget?.onCatch(parser.recordId, parser.speciesId, parser.weight);
        this.announceCatch(parser.speciesId, parser.weight, parser.xpGained, parser.golden, discovered);

        if(parser.leveledUp)
        {
            this.announce(KEY_LEVEL_UP, new Map([['level', `${parser.newLevel}`]]), null);
            log.debug(`Fishing level up: ${parser.newLevel}.`);
        }
    }

    /**
     * The bubble Origins shows on a catch, and the louder one for a species never landed before.
     *
     * The icon is the fish's own Fish-O-Pedia preview, which is why this uses `addItemWithBitmap`
     * rather than `addItem`: the artwork is keyed by the species' localisation key, not by an asset
     * name the notification system could resolve on its own.
     */
    // TS-only: Vortex-only system — no AS3 counterpart.
    private announceCatch(
        speciesId: number, weight: number, xp: number, golden: boolean, discovered: boolean
    ): void
    {
        const species = this._definitions.getSpecies(speciesId);

        if(species === null) return;

        // An ORDINARY catch raises nothing. Origins keeps yielding fish until the spot runs dry —
        // one every few seconds — so a bubble per catch buries the screen in them, and it buries
        // the two that are worth reading. The ordinary catch already shows in the HUD strip's own
        // status line, which is where Origins puts it; only a species never landed before and a
        // Golden Fish are events.
        if(!discovered && !golden) return;

        const name = this.translate(species.nameKey);
        const parameters = new Map([
            ['species', name],
            ['weight', `${weight}`],
            ['xp', `${xp}`],
        ]);

        const key = discovered ? KEY_DISCOVERED : KEY_CAUGHT_GOLDEN;
        const slug = species.nameKey.split('.').pop() ?? '';

        this.announce(key, parameters, `${ASSET_FISH_PREFIX}${slug}${ASSET_FISH_SUFFIX}`);
    }

    /** One bubble, with the fish's preview when there is one and no icon when there is not. */
    // TS-only: Vortex-only system — no AS3 counterpart.
    private announce(key: string, parameters: Map<string, string>, asset: string | null): void
    {
        if(this._notifications === null) return;

        const text = this._localizations?.getLocalizationWithParamMap(key, key, parameters) ?? key;

        this._notifications.addItemWithBitmap(text, NOTIFICATION_TYPE, this.copyIcon(asset));
    }

    /**
     * A COPY of the species sprite, never the library's own — see `copyBitmap` for what handing
     * over the original costs.
     */
    // TS-only: Vortex-only system — no AS3 counterpart.
    private copyIcon(asset: string | null): ImageBitmap | null
    {
        if(asset === null) return null;

        return copyBitmap((this.assets?.getAssetByName(asset)?.content as ImageBitmap | null) ?? null);
    }

    /** The localisation manager attaches late, so this falls back to the key rather than to null. */
    // TS-only: Vortex-only system — no AS3 counterpart.
    private translate(key: string): string
    {
        return this._localizations?.getLocalizationWithParams(key, key) ?? key;
    }

    /**
     * The spot ran dry. This is how a session ordinarily ends — not an error, and not a missed
     * catch: Origins keeps yielding fish until the stock is gone, then the player relocates.
     */
    // TS-only: Vortex-only handler.
    private onSpotDepleted(event: IMessageEvent): void
    {
        const parser = event.parser as VortexFishingSpotDepletedMessageParser | null;

        if(parser === null) return;

        this._widget?.onSpotDepleted(parser.catches);
    }

    /**
     * Hook Havoc triggered. The widget plays it and sends its input timeline back; the server
     * replays that against the same seed and answers with `onHookHavocResult`.
     */
    // TS-only: Vortex-only handler.
    private onHookHavocStarted(event: IMessageEvent): void
    {
        const parser = event.parser as VortexHookHavocStartedMessageParser | null;

        if(parser === null) return;

        this._widget?.onHookHavocStarted(
            parser.attemptId, parser.seed, parser.durationMs, parser.fillRate, parser.tolerance
        );
    }

    /** The server's verdict. A rejected timeline arrives here as an ordinary loss. */
    // TS-only: Vortex-only handler.
    private onHookHavocResult(event: IMessageEvent): void
    {
        const parser = event.parser as VortexHookHavocResultMessageParser | null;

        if(parser === null) return;

        this._widget?.onHookHavocResult(parser.won, parser.speciesId, parser.currencyGained);
    }

    /**
     * A refusal. Logged as well as shown, because most of these mean the client asked for something
     * it should have known better than to ask for — a cast with the cap reached, or into a zone the
     * player's level does not reach.
     *
     * **It raises a bubble as well as writing the widget's status line, and the bubble is the half
     * the player actually reads.** The status line is where Origins puts a refusal, and on its own
     * it is unreachable: the commonest refusals — `LevelTooLow`, `TooFarAway`, `DailyCapReached` —
     * answer the click that would have *started* a session, so there is no panel on screen to write
     * into. Nothing told the player why the water did nothing.
     */
    // TS-only: Vortex-only handler.
    private onFishingError(event: IMessageEvent): void
    {
        const parser = event.parser as VortexFishingErrorMessageParser | null;

        if(parser === null) return;

        log.warn(`Fishing refused, code ${parser.code}${parser.known ? '' : ' (unknown to this build)'}.`);
        this._widget?.onError(parser.code, parser.known, parser.detail);

        // `%detail%` is the code's own number — the required level for `LevelTooLow`. A key whose
        // text does not use it simply ignores it, so every refusal goes through one call.
        //
        // No icon: `copyIcon` resolves the Fish-O-Pedia species previews, and a refusal names no
        // species. `announce()` already draws the bubble without one.
        this.announce(
            fishingErrorKey(parser.code, parser.known),
            new Map([['detail', `${parser.detail}`]]),
            null
        );
    }

    /**
     * Replaces the whole record map. The server sends every caught species each time rather than a
     * delta, so a merge would keep a record the server has since removed — a reset after a wipe, for
     * instance.
     */
    // TS-only: Vortex-only handler.
    private onRecords(event: IMessageEvent): void
    {
        const parser = event.parser as VortexFishingRecordsMessageParser | null;

        if(parser === null) return;

        this._records = new Map(parser.records.map((record) => [record.speciesId, record]));
    }

    // TS-only: mirrors HabboFurniEditor's own helper.
    private addMessageEvent(event: IMessageEvent): void
    {
        if(this._communication != null)
        {
            this._communication.addMessageEvent(event);
            this._messageEvents.push(event);
        }
    }

    // TS-only: `Component` contract.
    public override dispose(): void
    {
        if(this._disposed) return;

        for(const event of this._messageEvents)
        {
            this._communication?.removeMessageEvent(event);
        }

        this._messageEvents = [];
        this._records.clear();
        this._widget = null;
        this._definitions.dispose();
        this._playerState = EMPTY_STATE;

        super.dispose();
    }
}
