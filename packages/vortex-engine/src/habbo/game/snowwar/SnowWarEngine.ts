import {Component} from '@core/runtime/Component';
import {ComponentDependency} from '@core/runtime/ComponentDependency';
import type {IContext, IUpdateReceiver} from '@core/runtime/IContext';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import {releaseProvider} from '@core/runtime/releaseProvider';
import type {IAlertDialog} from '@habbo/window/utils/AlertDialog';
import {OrderedMap} from '@core/utils/OrderedMap';
import {Logger} from '@core/utils/Logger';
import {IID_AvatarRenderManager} from '@iid/IIDAvatarRenderManager';
import {IID_HabboCatalog} from '@iid/IIDHabboCatalog';
import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboConfigurationManager} from '@iid/IIDHabboConfigurationManager';
import {IID_HabboFriendList} from '@iid/IIDHabboFriendList';
import {IID_HabboGroupsManager} from '@iid/IIDHabboGroupsManager';
import {IID_HabboHelp} from '@iid/IIDHabboHelp';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboSoundManager} from '@iid/IIDHabboSoundManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';
import {IID_RoomSessionManager} from '@iid/IIDRoomSessionManager';
import {IID_RoomUI} from '@iid/IIDRoomUI';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IHabboFriendList} from '@habbo/friendlist/IHabboFriendList';
import type {IHabboGroupsManager} from '@habbo/groups/IHabboGroupsManager';
import type {IHabboHelp} from '@habbo/help/IHabboHelp';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboSoundManager} from '@habbo/sound/IHabboSoundManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {RoomEngine} from '@habbo/room/RoomEngine';
import type {IRoomSessionManager} from '@habbo/session/IRoomSessionManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IRoomUI} from '@habbo/ui/IRoomUI';
import {RoomEngineEvent} from '@habbo/room/events/RoomEngineEvent';
import type {RoomObjectTileMouseEvent} from '@habbo/room/events/RoomObjectTileMouseEvent';
import {EventLogMessageComposer} from '@habbo/communication/messages/outgoing/tracking/EventLogMessageComposer';
import {
    Game2LoadStageReadyMessageComposer
} from '@habbo/communication/messages/outgoing/game/arena/Game2LoadStageReadyMessageComposer';
import {
    Game2PlayAgainMessageComposer
} from '@habbo/communication/messages/outgoing/game/arena/Game2PlayAgainMessageComposer';
import {
    Game2CheckGameDirectoryStatusMessageComposer
} from '@habbo/communication/messages/outgoing/game/directory/Game2CheckGameDirectoryStatusMessageComposer';
import {
    Game2GetAccountGameStatusMessageComposer
} from '@habbo/communication/messages/outgoing/game/directory/Game2GetAccountGameStatusMessageComposer';
import {
    Game2QuickJoinGameMessageComposer
} from '@habbo/communication/messages/outgoing/game/directory/Game2QuickJoinGameMessageComposer';
import {
    Game2StartSnowWarMessageComposer
} from '@habbo/communication/messages/outgoing/game/directory/Game2StartSnowWarMessageComposer';
import {
    Game2MakeSnowballMessageComposer
} from '@habbo/communication/messages/outgoing/game/ingame/Game2MakeSnowballMessageComposer';
import {
    Game2RequestFullStatusUpdateMessageComposer
} from '@habbo/communication/messages/outgoing/game/ingame/Game2RequestFullStatusUpdateMessageComposer';
import {
    Game2SetUserMoveTargetMessageComposer
} from '@habbo/communication/messages/outgoing/game/ingame/Game2SetUserMoveTargetMessageComposer';
import {
    Game2ThrowSnowballAtHumanMessageComposer
} from '@habbo/communication/messages/outgoing/game/ingame/Game2ThrowSnowballAtHumanMessageComposer';
import {
    Game2ThrowSnowballAtPositionMessageComposer
} from '@habbo/communication/messages/outgoing/game/ingame/Game2ThrowSnowballAtPositionMessageComposer';
import type {
    Game2GameResult
} from '@habbo/communication/messages/parser/game/snowwar/data/Game2GameResult';
import type {
    Game2SnowWarGameStats
} from '@habbo/communication/messages/parser/game/snowwar/data/Game2SnowWarGameStats';
import type {
    Game2TeamScoreData
} from '@habbo/communication/messages/parser/game/snowwar/data/Game2TeamScoreData';
import type {GameLobbyData} from '@habbo/communication/messages/parser/game/snowwar/data/GameLobbyData';
import type {
    GameLobbyPlayerData
} from '@habbo/communication/messages/parser/game/snowwar/data/GameLobbyPlayerData';
import {GameChatEvent} from '../events/GameChatEvent';
import type {HabboGameManager} from '../HabboGameManager';
import {ClickType} from './ClickType';
import {SnowWarArenaExtension} from './SnowWarArenaExtension';
import type {SnowWarGameStage} from './SnowWarGameStage';
import {SynchronizedGameArena} from './arena/SynchronizedGameArena';
import {NewMoveTargetEvent} from './events/NewMoveTargetEvent';
import type {HumanGameObject} from './gameobjects/HumanGameObject';
import {SnowWarIncomingMessages} from './SnowWarIncomingMessages';
import {LeaderboardViewController} from './leaderboard/LeaderboardViewController';
import {GameArenaView} from './ui/GameArenaView';
import {GameEndingViewController} from './ui/GameEndingViewController';
import {GameLoadingViewController} from './ui/GameLoadingViewController';
import type {GameLobbyWindowCtrl} from './ui/GameLobbyWindowCtrl';
import {GamesMainViewController} from './ui/GamesMainViewController';
import {WindowUtils} from './utils/WindowUtils';

const log = Logger.getLogger('habbo.game.snowwar.SnowWarEngine');

/**
 * Snow War itself: the state machine, the clock that drives the deterministic arena, and the owner
 * of every view the game has.
 *
 * **The clock is the whole thing.** `update()` runs per frame and pulses `SynchronizedGameArena`
 * once per `getPulseInterval()` — but only while the client is behind the sub-turn the server has
 * acknowledged (`_currentSubTurn < _maxSubTurn`), so the simulation can never run ahead of the
 * inputs it has been given. When a turn closes it folds a checksum and compares it against the
 * server's; three ways of disagreeing all end in `requestFullStatus()` and a paused pulse until the
 * full state arrives.
 *
 * **The ghost** is the second copy of your own avatar the client moves *immediately*, without
 * waiting for the server to echo the input back. It is enabled by config
 * (`snowwar.ghost.enabled`), optionally drawn (`…visualization.enabled`), and its position is
 * checked against the real one every turn — `checkGhostLocation()` — with a resync when they drift
 * apart.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/SnowWarEngine.as
 */
export class SnowWarEngine extends Component implements IUpdateReceiver
{
    // AS3: SnowWarEngine.as::GHOST_CHECKSUM_TURNS_TO_CHECK
    private static readonly GHOST_CHECKSUM_TURNS_TO_CHECK: number = 3;

    // AS3: SnowWarEngine.as::GET_SNOWWAR_TOKENS
    public static readonly GET_SNOWWAR_TOKENS: string = 'GET_SNOWWAR_TOKENS';

    // AS3: SnowWarEngine.as::GET_SNOWWAR_TOKENS2
    public static readonly GET_SNOWWAR_TOKENS2: string = 'GET_SNOWWAR_TOKENS2';

    // AS3: SnowWarEngine.as::GET_SNOWWAR_TOKENS3
    public static readonly GET_SNOWWAR_TOKENS3: string = 'GET_SNOWWAR_TOKENS3';

    // AS3: SnowWarEngine.as::STATE_INACTIVE
    public static readonly STATE_INACTIVE: number = 0;

    // AS3: SnowWarEngine.as::STATE_GAME_STARTING
    public static readonly STATE_GAME_STARTING: number = 1;

    // AS3: SnowWarEngine.as::STATE_STAGE_LOADING
    public static readonly STATE_STAGE_LOADING: number = 2;

    // AS3: SnowWarEngine.as::STATE_STAGE_STARTING
    public static readonly STATE_STAGE_STARTING: number = 3;

    // AS3: SnowWarEngine.as::STATE_STAGE_RUNNING
    public static readonly STATE_STAGE_RUNNING: number = 4;

    // AS3: SnowWarEngine.as::STATE_STAGE_ENDING
    public static readonly STATE_STAGE_ENDING: number = 5;

    // AS3: SnowWarEngine.as::STATE_GAME_OVER
    public static readonly STATE_GAME_OVER: number = 6;

    // AS3: SnowWarEngine.as::STATE_REJOIN_GAME
    public static readonly STATE_REJOIN_GAME: number = 7;

    /**
     * Static because the game objects and the events play sounds without holding the engine —
     * `SnowBallGameObject.hit()` and friends call `SnowWarEngine.playSound()` straight.
     */
    // AS3: SnowWarEngine.as::_soundManager
    private static _soundManager: IHabboSoundManager | null = null;

    // AS3: SnowWarEngine.as::playSound()
    public static playSound(soundId: string, loops: number = 0): void
    {
        SnowWarEngine._soundManager?.playSound(soundId, loops);
    }

    // AS3: SnowWarEngine.as::stopSound()
    public static stopSound(soundId: string): void
    {
        SnowWarEngine._soundManager?.stopSound(soundId);
    }

    // AS3: SnowWarEngine.as::_gameManager
    private _gameManager: HabboGameManager | null;

    // AS3: SnowWarEngine.as::_communication
    private _communication: IHabboCommunicationManager | null = null;

    // AS3: SnowWarEngine.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;

    /** Derived name — `_SafeStr_5128`, read through the `config` getter. */
    // AS3: SnowWarEngine.as::_SafeStr_5128
    private _config: IHabboConfigurationManager | null = null;

    // AS3: SnowWarEngine.as::_localization
    private _localization: IHabboLocalizationManager | null = null;

    // AS3: SnowWarEngine.as::_sessionDataManager
    private _sessionDataManager: ISessionDataManager | null = null;

    // AS3: SnowWarEngine.as::_roomSessionManager
    private _roomSessionManager: IRoomSessionManager | null = null;

    // AS3: SnowWarEngine.as::_avatarManager
    private _avatarManager: IAvatarRenderManager | null = null;

    /** Derived name — `_SafeStr_6331`, read through the `groupsManager` getter. */
    // AS3: SnowWarEngine.as::_SafeStr_6331
    private _groupsManager: IHabboGroupsManager | null = null;

    // AS3: SnowWarEngine.as::_roomEngine
    private _roomEngine: IRoomEngine | null = null;

    // AS3: SnowWarEngine.as::_roomUI
    private _roomUI: IRoomUI | null = null;

    // AS3: SnowWarEngine.as::_catalog
    private _catalog: IHabboCatalog | null = null;

    // AS3: SnowWarEngine.as::_incomingMessages
    private _incomingMessages: SnowWarIncomingMessages | null = null;

    // AS3: SnowWarEngine.as::_habboHelp
    private _habboHelp: IHabboHelp | null = null;

    // AS3: SnowWarEngine.as::_friendList
    private _friendList: IHabboFriendList | null = null;

    /** Derived name — `_SafeStr_4646`, read through the `gameArena` getter. */
    // AS3: SnowWarEngine.as::_SafeStr_4646
    private _gameArena: SynchronizedGameArena | null = null;

    /** Derived name — `_SafeStr_4668`; the arena view. */
    // AS3: SnowWarEngine.as::_SafeStr_4668
    private _arenaView: GameArenaView | null = null;

    // AS3: SnowWarEngine.as::_timeSinceLastUpdate
    private _timeSinceLastUpdate: number = 0;

    /** Derived name — `_SafeStr_4601`; one of the eight `STATE_*`. */
    // AS3: SnowWarEngine.as::_SafeStr_4601
    private _state: number = SnowWarEngine.STATE_INACTIVE;

    /** Derived name — `_SafeStr_5478`; the one alert this engine ever shows. */
    // AS3: SnowWarEngine.as::_SafeStr_5478
    private _alert: IAlertDialog | null = null;

    /** Derived name — `_SafeStr_6156`; own game-object id, set while the objects are built. */
    // AS3: SnowWarEngine.as::_SafeStr_6156
    private _ownId: number = 0;

    // AS3: SnowWarEngine.as::_players
    private _players: OrderedMap<number, GameLobbyPlayerData> | null = null;

    /** Derived name — `_SafeStr_5014`; sub-turns the client has actually pulsed. */
    // AS3: SnowWarEngine.as::_SafeStr_5014
    private _currentSubTurn: number = 0;

    /** Derived name — `_SafeStr_5866`; the sub-turn the server has acknowledged up to. */
    // AS3: SnowWarEngine.as::_SafeStr_5866
    private _maxSubTurn: number = 0;

    /** Derived name — `_SafeStr_7398`; the last turn the server sent a checksum for. */
    // AS3: SnowWarEngine.as::_SafeStr_7398
    private _serverTurn: number = 0;

    // AS3: SnowWarEngine.as::_serverChecksums
    private _serverChecksums: OrderedMap<number, number> | null = null;

    /** Derived name — `_SafeStr_8280`; true while a full-status request is outstanding. */
    // AS3: SnowWarEngine.as::_SafeStr_8280
    private _awaitingFullStatus: boolean = false;

    /** Derived name — `_SafeStr_5805`. */
    // AS3: SnowWarEngine.as::_SafeStr_5805
    private _loadingView: GameLoadingViewController | null = null;

    /** Derived name — `_SafeStr_4613`. */
    // AS3: SnowWarEngine.as::_SafeStr_4613
    private _endingView: GameEndingViewController | null = null;

    /** Derived name — `_SafeStr_5096`. */
    // AS3: SnowWarEngine.as::_SafeStr_5096
    private _mainView: GamesMainViewController | null = null;

    /** Derived name — `_SafeStr_6247`. */
    // AS3: SnowWarEngine.as::_SafeStr_6247
    private _leaderboard: LeaderboardViewController | null = null;

    /** Derived name — `_SafeStr_6104`; `snowwar.ghost.enabled`. */
    // AS3: SnowWarEngine.as::_SafeStr_6104
    private _isGhostEnabled: boolean = false;

    /** Derived name — `_SafeStr_8864`; `snowwar.ghost.visualization.enabled`. */
    // AS3: SnowWarEngine.as::_SafeStr_8864
    private _isGhostVisualizationEnabled: boolean = false;

    /** Derived name — `_SafeStr_9676`; `snowwar.ghost.immediate.enabled`. */
    // AS3: SnowWarEngine.as::_SafeStr_9676
    private _isGhostImmediate: boolean = false;

    /** Derived name — `_SafeStr_8274`; set by `generateChecksumMismatch()` for the next fold. */
    // AS3: SnowWarEngine.as::_SafeStr_8274
    private _forceChecksumMismatch: boolean = false;

    // AS3: SnowWarEngine.as::_stageLength
    private _stageLength: number = 0;

    /** Derived name — `_SafeStr_5007`; "I asked for the rematch", which decides the rejoin state. */
    // AS3: SnowWarEngine.as::_SafeStr_5007
    private _wantsRematch: boolean = false;

    // AS3: SnowWarEngine.as::_hasUnlimitedGames
    private _hasUnlimitedGames: boolean = false;

    /** Derived name — `_SafeStr_8462`; free games left, -1 meaning unlimited. */
    // AS3: SnowWarEngine.as::_SafeStr_8462
    private _freeGamesLeft: number = 0;

    // AS3: SnowWarEngine.as::_roomBeforeGame
    private _roomBeforeGame: number = -1;

    /** Derived name — `_SafeStr_9061`; games played, -1 until the directory says. */
    // AS3: SnowWarEngine.as::_SafeStr_9061
    private _gamesPlayed: number = -1;

    /** Derived name — `_SafeStr_9149`; the promotion is shown at most once per session. */
    // AS3: SnowWarEngine.as::_SafeStr_9149
    private _promotionShown: boolean = false;

    // TS-only: AS3 subscribes a method reference; the port needs a stable bound one to unsubscribe.
    private readonly _onRoomObjectsInitialized: () => void;

    // AS3: SnowWarEngine.as::SnowWarEngine()
    constructor(
        gameManager: HabboGameManager,
        context: IContext,
        flags: number = 0,
        assetLibrary: IAssetLibrary | null = null
    )
    {
        super(context, flags, assetLibrary);

        this._gameManager = gameManager;
        this._onRoomObjectsInitialized = (): void => this.onRoomObjectsInitialized();

        log.debug(`SnowWarEngine initialized: ${assetLibrary?.name ?? 'no asset library'}`);

        this._mainView = new GamesMainViewController(this);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- variance: ComponentDependency<T> is contravariant in T
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            ...super.dependencies,
            new ComponentDependency(IID_HabboWindowManager, (manager: IHabboWindowManager | null) =>
            {
                this._windowManager = manager;
                WindowUtils.init(this.assets, this._windowManager);
            }),
            new ComponentDependency(IID_HabboCommunicationManager, (manager: IHabboCommunicationManager | null) =>
            {
                this._communication = manager;
                this._incomingMessages = new SnowWarIncomingMessages(this);
            }),
            new ComponentDependency(IID_HabboConfigurationManager, (manager: IHabboConfigurationManager | null) =>
            {
                this._config = manager;
                this._isGhostEnabled = manager?.getBoolean('snowwar.ghost.enabled') ?? false;

                if(this._isGhostEnabled)
                {
                    this._isGhostVisualizationEnabled = manager?.getBoolean('snowwar.ghost.visualization.enabled') ?? false;
                    this._isGhostImmediate = manager?.getBoolean('snowwar.ghost.immediate.enabled') ?? false;
                }
            }),
            new ComponentDependency(IID_HabboLocalizationManager, (manager: IHabboLocalizationManager | null) =>
            {
                this._localization = manager;
            }),
            new ComponentDependency(IID_RoomSessionManager, (manager: IRoomSessionManager | null) =>
            {
                this._roomSessionManager = manager;
            }),
            new ComponentDependency(IID_SessionDataManager, (manager: ISessionDataManager | null) =>
            {
                this._sessionDataManager = manager;
            }),
            new ComponentDependency(IID_AvatarRenderManager, (manager: IAvatarRenderManager | null) =>
            {
                this._avatarManager = manager;
            }),
            new ComponentDependency(IID_RoomEngine, (engine: IRoomEngine | null) =>
            {
                if(this.disposed) return;

                this._roomEngine = engine;
                this._roomEngine?.events?.on(RoomEngineEvent.REE_OBJECTS_INITIALIZED, this._onRoomObjectsInitialized);
            }),
            new ComponentDependency(IID_HabboSoundManager, (manager: IHabboSoundManager | null) =>
            {
                SnowWarEngine._soundManager = manager;
            }),
            new ComponentDependency(IID_RoomUI, (roomUI: IRoomUI | null) =>
            {
                this._roomUI = roomUI;
            }),
            new ComponentDependency(IID_HabboCatalog, (catalog: IHabboCatalog | null) =>
            {
                this._catalog = catalog;
            }),
            new ComponentDependency(IID_HabboHelp, (help: IHabboHelp | null) =>
            {
                if(this.disposed) return;

                this._habboHelp = help;
            }),
            new ComponentDependency(IID_HabboFriendList, (friendList: IHabboFriendList | null) =>
            {
                if(this.disposed) return;

                this._friendList = friendList;
            }),
            new ComponentDependency(IID_HabboGroupsManager, (manager: IHabboGroupsManager | null) =>
            {
                if(this.disposed) return;

                this._groupsManager = manager;
            })
        ];
    }

    // AS3: SnowWarEngine.as::get gameCenterEnabled()
    public get gameCenterEnabled(): boolean
    {
        return this._gameManager?.gameCenterEnabled ?? false;
    }

    // AS3: SnowWarEngine.as::get roomEngine()
    public get roomEngine(): RoomEngine | null
    {
        // AS3 casts the interface to `_SafeCls_90`/`_SafeCls_87`/`_SafeCls_89` at every game call
        // site — the arena needs members `IRoomEngine` does not declare (the snow-war objects,
        // `playerUnderCursor`). The cast is done once, here.
        return this._roomEngine as RoomEngine | null;
    }

    // AS3: SnowWarEngine.as::get windowManager()
    public get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: SnowWarEngine.as::get sessionDataManager()
    public get sessionDataManager(): ISessionDataManager | null
    {
        return this._sessionDataManager;
    }

    // AS3: SnowWarEngine.as::get communication()
    public get communication(): IHabboCommunicationManager | null
    {
        return this._communication;
    }

    // AS3: SnowWarEngine.as::get localization()
    public get localization(): IHabboLocalizationManager | null
    {
        return this._localization;
    }

    // AS3: SnowWarEngine.as::get config()
    public get config(): IHabboConfigurationManager | null
    {
        return this._config;
    }

    // AS3: SnowWarEngine.as::get avatarManager()
    public get avatarManager(): IAvatarRenderManager | null
    {
        return this._avatarManager;
    }

    // AS3: SnowWarEngine.as::get groupsManager()
    public get groupsManager(): IHabboGroupsManager | null
    {
        return this._groupsManager;
    }

    // AS3: SnowWarEngine.as::get roomUI()
    public get roomUI(): IRoomUI | null
    {
        return this._roomUI;
    }

    // AS3: SnowWarEngine.as::get catalog()
    public get catalog(): IHabboCatalog | null
    {
        return this._catalog;
    }

    // AS3: SnowWarEngine.as::get friendList()
    public get friendList(): IHabboFriendList | null
    {
        return this._friendList;
    }

    // AS3: SnowWarEngine.as::get gameArena()
    public get gameArena(): SynchronizedGameArena | null
    {
        return this._gameArena;
    }

    // AS3: SnowWarEngine.as::get currentSubTurn()
    public get currentSubTurn(): number
    {
        return this._currentSubTurn;
    }

    // AS3: SnowWarEngine.as::get stageLength()
    public get stageLength(): number
    {
        return this._stageLength;
    }

    // AS3: SnowWarEngine.as::get roomBeforeGame()
    public get roomBeforeGame(): number
    {
        return this._roomBeforeGame;
    }

    // AS3: SnowWarEngine.as::get isGhostEnabled()
    public get isGhostEnabled(): boolean
    {
        return this._isGhostEnabled;
    }

    // AS3: SnowWarEngine.as::get isGhostVisualizationEnabled()
    public get isGhostVisualizationEnabled(): boolean
    {
        return this._isGhostVisualizationEnabled;
    }

    // AS3: SnowWarEngine.as::get ownId()
    public get ownId(): number
    {
        return this._ownId;
    }

    // AS3: SnowWarEngine.as::set ownId()
    public set ownId(ownId: number)
    {
        this._ownId = ownId;
    }

    // AS3: SnowWarEngine.as::get mainView()
    public get mainView(): GamesMainViewController | null
    {
        return this._mainView;
    }

    // AS3: SnowWarEngine.as::get lobbyView()
    public get lobbyView(): GameLobbyWindowCtrl | null
    {
        return this._mainView?.lobbyView ?? null;
    }

    // AS3: SnowWarEngine.as::get isGameStarting()
    public get isGameStarting(): boolean
    {
        return this._state === SnowWarEngine.STATE_GAME_STARTING || this._state === SnowWarEngine.STATE_REJOIN_GAME;
    }

    // AS3: SnowWarEngine.as::get hasUnlimitedGames()
    public get hasUnlimitedGames(): boolean
    {
        return this._hasUnlimitedGames;
    }

    // AS3: SnowWarEngine.as::get freeGamesLeft()
    public get freeGamesLeft(): number
    {
        return this._freeGamesLeft;
    }

    // AS3: SnowWarEngine.as::set gamesPlayed()
    public set gamesPlayed(gamesPlayed: number)
    {
        this._gamesPlayed = gamesPlayed;
    }

    /** Built on first use, and only when the game centre is *off* — the two are alternatives. */
    // AS3: SnowWarEngine.as::get leaderboard()
    public get leaderboard(): LeaderboardViewController | null
    {
        if(!this._leaderboard && !this.gameCenterEnabled)
        {
            this._leaderboard = new LeaderboardViewController(this);
        }

        return this._leaderboard;
    }

    // AS3: SnowWarEngine.as::getArenaName()
    public getArenaName(lobbyData: GameLobbyData): string
    {
        const key = `snowwar.field.name.${lobbyData.fieldType}`;

        return this._localization?.getLocalization(key, key) ?? key;
    }

    // AS3: SnowWarEngine.as::send()
    public send(composer: IMessageComposer<unknown[]>): void
    {
        this._communication?.connection?.send(composer);
    }

    /**
     * The room engine reports its objects built; the server is waiting to hear it before the stage
     * can start. AS3 sends 100 flat — there is no partial progress to report.
     */
    // AS3: SnowWarEngine.as::onRoomObjectsInitialized()
    private onRoomObjectsInitialized(): void
    {
        if(this._gameArena) this.send(new Game2LoadStageReadyMessageComposer(100));
    }

    // AS3: SnowWarEngine.as::showGamesMainView()
    public showGamesMainView(): void
    {
        this._mainView?.toggleVisibility();
    }

    // AS3: SnowWarEngine.as::onGameDirectoryAvailable()
    public onGameDirectoryAvailable(available: boolean): void
    {
        if(available) this.showGamesMainView();
    }

    /**
     * Builds the arena once per game. The order matters: the extension has to be set before
     * `initialize()`, which sizes its first event queue from `getNumberOfSubTurns()`.
     *
     * `disposeSession(-1, false)` drops whatever room session was open *without* disposing the room
     * engine, and `startGameSession()` opens the game one in its place.
     */
    // AS3: SnowWarEngine.as::initArena()
    public initArena(_gameType: number, _fieldType: number, numberOfTeams: number, _players: unknown[]): void
    {
        if(this._gameArena) return;

        this._gameArena = new SynchronizedGameArena();
        this._gameArena.setExtension(new SnowWarArenaExtension());
        this._gameArena.initialize(this, numberOfTeams);

        this._arenaView = new GameArenaView(this);

        this._roomSessionManager?.disposeSession(-1, false);
        this._roomSessionManager?.startGameSession();

        this.registerUpdateReceiver(this, 1);

        this._timeSinceLastUpdate = 0;
        this._currentSubTurn = 0;
        this._maxSubTurn = 0;
    }

    // AS3: SnowWarEngine.as::startServerGame()
    public startServerGame(arenaName: string): void
    {
        this.initGameDirectoryConnection();
        this.send(new Game2StartSnowWarMessageComposer(arenaName));
    }

    // AS3: SnowWarEngine.as::initGameDirectoryConnection()
    public initGameDirectoryConnection(): void
    {
        this.send(new Game2CheckGameDirectoryStatusMessageComposer());
    }

    // AS3: SnowWarEngine.as::startQuickServerGame()
    public startQuickServerGame(): void
    {
        this.send(new Game2QuickJoinGameMessageComposer());
    }

    // AS3: SnowWarEngine.as::getCurrentStage()
    private getCurrentStage(): SnowWarGameStage | null
    {
        return (this._gameArena?.getCurrentStage() ?? null) as SnowWarGameStage | null;
    }

    // AS3: SnowWarEngine.as::getCurrentPlayer()
    public getCurrentPlayer(): HumanGameObject | null
    {
        return this.getPlayer(this._ownId);
    }

    // AS3: SnowWarEngine.as::getPlayer()
    public getPlayer(gameObjectId: number): HumanGameObject | null
    {
        return (this.getCurrentStage()?.getGameObject(gameObjectId) ?? null) as HumanGameObject | null;
    }

    /** No modifier walks; any modifier throws at the tile. */
    // AS3: SnowWarEngine.as::handleClickOnTile()
    public handleClickOnTile(event: RoomObjectTileMouseEvent): void
    {
        if(this._state !== SnowWarEngine.STATE_STAGE_RUNNING) return;

        const clickType = ClickType.getClickTypeOnTile(event.altKey, event.shiftKey);

        if(clickType === ClickType.MOVE) this.moveOwnAvatarTo(event.tileXAsInt, event.tileYAsInt);
        else this.throwSnowballAt(event.tileXAsInt, event.tileYAsInt, this.getTrajectoryFromClickType(clickType));
    }

    /**
     * Clicking *yourself* — or your own ghost — packs a snowball; clicking anyone on the other team
     * throws at them. A team-mate is neither, and nothing happens.
     */
    // AS3: SnowWarEngine.as::handleClickOnHuman()
    public handleClickOnHuman(gameObjectId: number, altKey: boolean, shiftKey: boolean): void
    {
        if(this._state !== SnowWarEngine.STATE_STAGE_RUNNING) return;

        const ghost = this.getGhostPlayer();

        if(gameObjectId === this._ownId || (this._isGhostEnabled && ghost && gameObjectId === ghost.gameObjectId))
        {
            if(this.makeSnowball() && this._arenaView) this._arenaView.startWaitingForSnowball();

            return;
        }

        const own = this.getCurrentPlayer();
        const target = this.getPlayer(gameObjectId);

        if(own && target && own.team !== target.team)
        {
            const clickType = ClickType.getClickTypeOnOpponent(altKey, shiftKey);

            this.throwSnowballAtHuman(gameObjectId, this.getTrajectoryFromClickType(clickType));
        }
    }

    // AS3: SnowWarEngine.as::handleMouseOverOnHuman()
    public handleMouseOverOnHuman(gameObjectId: number, _altKey: boolean, _shiftKey: boolean): void
    {
        const human = this.getPlayer(gameObjectId);

        if(!human) return;

        if(this._config?.getBoolean('snowstorm.settings.show_user_names'))
        {
            const color = human.team === 1 ? 4281310921 : 4290988872;

            this._roomUI?.showGamePlayerName(human.gameObjectId, human.name, color, 500);
        }

        if(this._state === SnowWarEngine.STATE_STAGE_RUNNING) this._arenaView?.updateTileCursor(human.team);
    }

    // AS3: SnowWarEngine.as::moveOwnAvatarTo()
    public moveOwnAvatarTo(tileX: number, tileY: number): void
    {
        if(this._state !== SnowWarEngine.STATE_STAGE_RUNNING) return;

        const own = this.getCurrentPlayer();

        if(!own || !this._gameArena) return;

        const x = tileX * 3200;
        const y = tileY * 3200;

        if(!this.getCurrentStage()) return;

        this.send(new Game2SetUserMoveTargetMessageComposer(
            x, y, this._gameArena.getTurnNumber(), this._gameArena.subturn
        ));
        this.walkGhost(own, x, y);
    }

    // AS3: SnowWarEngine.as::getGhostPlayer()
    public getGhostPlayer(): HumanGameObject | null
    {
        const own = this.getCurrentPlayer();

        return own ? this.getPlayer(own.ghostObjectId) : null;
    }

    // AS3: SnowWarEngine.as::throwSnowballAtHuman()
    private throwSnowballAtHuman(targetGameObjectId: number, trajectory: number): void
    {
        const own = this.getCurrentPlayer();

        if(!own || !own.canThrowSnowballs() || !this._gameArena) return;

        this.send(new Game2ThrowSnowballAtHumanMessageComposer(
            targetGameObjectId, trajectory, this._gameArena.getTurnNumber(), this._gameArena.subturn
        ));
        this.stopGhost();
    }

    // AS3: SnowWarEngine.as::throwSnowballAt()
    private throwSnowballAt(tileX: number, tileY: number, trajectory: number): void
    {
        const own = this.getCurrentPlayer();

        if(!own || !own.canThrowSnowballs() || !this._gameArena) return;

        this.send(new Game2ThrowSnowballAtPositionMessageComposer(
            tileX * 3200, tileY * 3200, trajectory, this._gameArena.getTurnNumber(), this._gameArena.subturn
        ));
        this.stopGhost();
    }

    /** Not the identity: fast → quick throw, long lob → 2, short lob → 1, default → 3. */
    // AS3: SnowWarEngine.as::getTrajectoryFromClickType()
    private getTrajectoryFromClickType(clickType: number): number
    {
        switch(clickType)
        {
            case ClickType.THROW_FAST_BALL: return 0;
            case ClickType.THROW_LONG_LOB_BALL: return 2;
            case ClickType.THROW_SHORT_LOB_BALL: return 1;
            default: return 3;
        }
    }

    // AS3: SnowWarEngine.as::makeSnowball()
    public makeSnowball(): boolean
    {
        if(this._state !== SnowWarEngine.STATE_STAGE_RUNNING) return false;

        const own = this.getCurrentPlayer();

        if(!own || !own.canMakeSnowballs() || !this._gameArena) return false;

        this.send(new Game2MakeSnowballMessageComposer(this._gameArena.getTurnNumber(), this._gameArena.subturn));
        this.stopGhost();

        return true;
    }

    /**
     * Moves the ghost to where the click asked, either immediately or on the next turn.
     *
     * A dead player's ghost does not walk — that is what the two posture tests are for.
     */
    // AS3: SnowWarEngine.as::walkGhost()
    private walkGhost(own: HumanGameObject | null, x: number, y: number): void
    {
        if(!this._isGhostEnabled || !this._gameArena) return;

        const alive = own !== null && own.posture !== 'swdieback' && own.posture !== 'swdiefront';
        const ghost = this.getGhostPlayer();

        if(!ghost || !alive) return;

        const event = new NewMoveTargetEvent(ghost, x, y);

        if(this._isGhostImmediate)
        {
            const stage = this._gameArena.getCurrentStage();

            if(stage) event.apply(stage);
        }
        else
        {
            this._gameArena.addGameEvent(this._gameArena.getTurnNumber(), this._gameArena.subturn, event);
        }
    }

    // AS3: SnowWarEngine.as::stopGhost()
    private stopGhost(): void
    {
        if(!this._isGhostEnabled) return;

        this.getGhostPlayer()?.stopMovement();
    }

    /**
     * The clock.
     *
     * One pulse per `getPulseInterval()` of elapsed time, but never past `_maxSubTurn` — the last
     * sub-turn the server has acknowledged. When the client is more than three sub-turns behind it
     * catches up in one frame rather than drifting further, and at every turn boundary the folded
     * checksum is compared with the server's.
     */
    // AS3: SnowWarEngine.as::update()
    public update(elapsed: number): void
    {
        if(!this._gameArena) return;
        if(this._state !== SnowWarEngine.STATE_STAGE_RUNNING && this._state !== SnowWarEngine.STATE_STAGE_STARTING) return;

        if(this._arenaView && this._state === SnowWarEngine.STATE_STAGE_STARTING)
        {
            this._arenaView.update(elapsed, this._gameArena.subturn === 0);
        }

        this._timeSinceLastUpdate += elapsed;

        const pulseInterval = (this._gameArena.getExtension() as SnowWarArenaExtension | null)?.getPulseInterval() ?? 50;

        if(this._awaitingFullStatus) return;
        if(this._timeSinceLastUpdate <= pulseInterval) return;
        if(this._currentSubTurn >= this._maxSubTurn) return;

        this._gameArena.pulse();
        this._timeSinceLastUpdate -= pulseInterval;
        this._currentSubTurn += 1;

        if(this._timeSinceLastUpdate > pulseInterval) this._timeSinceLastUpdate = 0;

        let behind = this._maxSubTurn - this._currentSubTurn;

        while(behind-- > SnowWarEngine.GHOST_CHECKSUM_TURNS_TO_CHECK)
        {
            this._gameArena.pulse();
            this._currentSubTurn += 1;
        }

        if(this._arenaView && this._state === SnowWarEngine.STATE_STAGE_RUNNING)
        {
            this._arenaView.update(elapsed, this._gameArena.subturn === 0);
        }

        if(this._currentSubTurn % this._gameArena.getNumberOfSubTurns() !== 0) return;

        const turn = this._gameArena.getTurnNumber() - 1;
        const clientChecksum = this._gameArena.getCheckSum(turn);
        const serverChecksum = this._serverChecksums?.getValue(turn) ?? 0;

        this.checkGhostLocation(turn);

        const tooFarBehind = turn < this._serverTurn - SnowWarEngine.GHOST_CHECKSUM_TURNS_TO_CHECK;
        const mismatch = serverChecksum !== clientChecksum;

        if(!tooFarBehind && !mismatch && !this._forceChecksumMismatch) return;

        log.debug(
            `Turn: ${turn},${this._serverTurn} currentSubTurn:${this._currentSubTurn}`
            + ` maxSubTurn:${this._maxSubTurn} serverChecksum:${serverChecksum} clientChecksum:${clientChecksum}`
        );

        let reason: number;
        let color: number;

        if(tooFarBehind)
        {
            reason = 0;
            color = 16711935;
            log.debug('CLIENT TOO MUCH BEHIND, requesting full status!');
        }
        else if(mismatch)
        {
            reason = 1;
            color = 16711680;
            log.debug('CHECKSUM MISMATCH, requesting full status!');
        }
        else
        {
            reason = -1;
            color = 255;
            log.debug('ERROR WAS GENERATED! Requesting full status!');
        }

        this._arenaView?.showChecksumError(color);
        this.requestFullStatus(reason);
        this._forceChecksumMismatch = false;
        this._awaitingFullStatus = true;
    }

    /**
     * The ghost is allowed to be anywhere the real player was within three turns either side; if it
     * is not, it is teleported back onto the player and the desync is flagged in green.
     */
    // AS3: SnowWarEngine.as::checkGhostLocation()
    private checkGhostLocation(turn: number): void
    {
        if(!this._isGhostEnabled) return;

        const own = this.getCurrentPlayer();
        const ghost = this.getGhostPlayer();

        if(!own || !ghost) return;

        const location = own.currentLocation;
        let inRange = false;

        for(let offset = -SnowWarEngine.GHOST_CHECKSUM_TURNS_TO_CHECK; offset < SnowWarEngine.GHOST_CHECKSUM_TURNS_TO_CHECK; offset++)
        {
            inRange = ghost.isInGhostDistance(turn + offset, location);

            if(inRange) break;
        }

        ghost.removeGhostLocation(turn - SnowWarEngine.GHOST_CHECKSUM_TURNS_TO_CHECK);

        if(inRange || turn <= SnowWarEngine.GHOST_CHECKSUM_TURNS_TO_CHECK) return;

        log.debug(`GHOST CHECKSUM MISMATCH, checksumTurn:${turn} currentLocation:${location}`);
        ghost.reinitGhost(own);
        ghost.addGhostLocation(turn);
        this._arenaView?.showChecksumError(65280);
    }

    /**
     * The server has acknowledged a turn. `isFullStatus` is what a full-status reply sets: it winds
     * the client back to the start of that turn and lifts the pulse freeze.
     */
    // AS3: SnowWarEngine.as::nextTurn()
    public nextTurn(turn: number, checksum: number, isFullStatus: boolean = false): void
    {
        if(!this._gameArena) return;

        this._serverTurn = turn;
        this._serverChecksums?.add(this._serverTurn, checksum);
        this._maxSubTurn = (turn + 1) * this._gameArena.getNumberOfSubTurns();

        if(!isFullStatus) return;

        this._currentSubTurn = this._maxSubTurn - this._gameArena.getNumberOfSubTurns();
        this._timeSinceLastUpdate = (this._gameArena.getExtension() as SnowWarArenaExtension | null)?.getPulseInterval() ?? 50;
        this._awaitingFullStatus = false;

        if(this._isGhostEnabled) this.getGhostPlayer()?.addGhostLocation(this._serverTurn);
    }

    // AS3: SnowWarEngine.as::requestFullStatus()
    public requestFullStatus(reason: number): void
    {
        this.send(new Game2RequestFullStatusUpdateMessageComposer(reason));
    }

    // AS3: SnowWarEngine.as::alert()
    public alert(message: string): void
    {
        this.removeOldAlert();

        if(!this._alert)
        {
            this._alert = this._windowManager?.alert('SnowWar Alert', message, 0, () => this.removeOldAlert()) ?? null;
        }
        else
        {
            this._alert.summary = message;
        }

        log.debug(`[HabboGameManager.alert] ${message}`);
    }

    // AS3: SnowWarEngine.as::disposeLoadingView()
    public disposeLoadingView(): void
    {
        if(this._loadingView)
        {
            this._loadingView.dispose();
            this._loadingView = null;
        }
    }

    // AS3: SnowWarEngine.as::removeOldAlert()
    public removeOldAlert(): void
    {
        if(this._alert)
        {
            this._alert.dispose();
            this._alert = null;
        }
    }

    /** Staff-only debugging: forces the next checksum fold to disagree. */
    // AS3: SnowWarEngine.as::generateChecksumMismatch()
    public generateChecksumMismatch(): void
    {
        if(this._state !== SnowWarEngine.STATE_STAGE_RUNNING) return;

        this._forceChecksumMismatch = true;
    }

    // AS3: SnowWarEngine.as::initView()
    public initView(): void
    {
        this._arenaView?.init();
    }

    // AS3: SnowWarEngine.as::stageLoading()
    public stageLoading(_percentage: number, finishedPlayers: number[]): void
    {
        if(this._loadingView === null) return;

        this._state = SnowWarEngine.STATE_STAGE_LOADING;
        this._loadingView.showReadyPlayers(finishedPlayers);
    }

    // AS3: SnowWarEngine.as::startStage()
    public startStage(countDown: number): void
    {
        if(!this._arenaView) return;

        if(this._roomUI) this._roomUI.visible = true;

        this.disposeLoadingView();
        SnowWarEngine.playSound('HBSTG_ig_countdown');
        this._arenaView.initGameUI(countDown);
        this._state = SnowWarEngine.STATE_STAGE_STARTING;
    }

    /** A `timeToStageEnd` of 0 or less means the stage is already over. */
    // AS3: SnowWarEngine.as::stageRunning()
    public stageRunning(timeToStageEnd: number): void
    {
        if(timeToStageEnd > 0)
        {
            this._stageLength = timeToStageEnd;
            this._state = SnowWarEngine.STATE_STAGE_RUNNING;
        }
        else
        {
            this._state = SnowWarEngine.STATE_STAGE_ENDING;
        }

        this._currentSubTurn = 0;
        this._maxSubTurn = 0;
    }

    // AS3: SnowWarEngine.as::resetGameSession()
    public resetGameSession(): void
    {
        if(this._roomEngine) this._roomEngine.isGameMode = false;

        this._state = SnowWarEngine.STATE_STAGE_ENDING;
        this.removeUpdateReceiver(this);

        if(this._gameArena)
        {
            this._gameArena.dispose();
            this._gameArena = null;
        }

        SnowWarEngine.stopSound('HBSTG_snowwar_walk');
        this.send(new Game2GetAccountGameStatusMessageComposer(0));
    }

    // AS3: SnowWarEngine.as::resetRoomSession()
    public resetRoomSession(): void
    {
        this._roomSessionManager?.disposeGameSession();

        if(this._arenaView)
        {
            this._arenaView.dispose();
            this._arenaView = null;
        }
    }

    // AS3: SnowWarEngine.as::gameOver()
    public gameOver(
        countdown: number,
        teams: Game2TeamScoreData[],
        stats: Game2SnowWarGameStats | null,
        gameResult: Game2GameResult | null
    ): void
    {
        this._state = SnowWarEngine.STATE_GAME_OVER;
        this._mainView?.close(false);

        if(this._endingView)
        {
            this._endingView.dispose();
            this._endingView = null;
        }

        this._arenaView?.removeGameUI();
        this._endingView = new GameEndingViewController(this, teams, stats, gameResult, countdown);
    }

    // AS3: SnowWarEngine.as::gameStarted()
    public gameStarted(lobbyData: GameLobbyData): void
    {
        this._state = SnowWarEngine.STATE_GAME_STARTING;
        this._wantsRematch = false;
        this._players = new OrderedMap<number, GameLobbyPlayerData>();
        this._serverChecksums = new OrderedMap<number, number>();

        for(const player of lobbyData.players) this._players.add(player.userId, player);

        if(this._endingView)
        {
            this._endingView.dispose();
            this._endingView = null;
        }

        if(!this._loadingView) this._loadingView = new GameLoadingViewController(this);

        this._loadingView.show(lobbyData);
    }

    // AS3: SnowWarEngine.as::rejoinGame()
    public rejoinGame(roomBeforeGame: number): void
    {
        this._state = this._wantsRematch ? SnowWarEngine.STATE_REJOIN_GAME : SnowWarEngine.STATE_GAME_OVER;
        this._roomBeforeGame = roomBeforeGame;

        if(this._endingView)
        {
            this._endingView.changeToWaitState(this._wantsRematch);
            this._wantsRematch = false;
        }
    }

    // AS3: SnowWarEngine.as::playerRematches()
    public playerRematches(userId: number): void
    {
        this._endingView?.playerRematches(userId);
    }

    /** In the rejoin state the ending panel owns the countdown; otherwise the lobby does. */
    // AS3: SnowWarEngine.as::startLobbyCounter()
    public startLobbyCounter(seconds: number): void
    {
        if(this._state === SnowWarEngine.STATE_REJOIN_GAME && this._endingView !== null)
        {
            this._endingView.startLobbyCountDown(seconds);
        }
        else
        {
            this.lobbyView?.startCountdown(seconds);
        }
    }

    // AS3: SnowWarEngine.as::sendRejoinGame()
    public sendRejoinGame(): void
    {
        this._wantsRematch = true;
        this.send(new Game2PlayAgainMessageComposer());
    }

    /**
     * Turns an arena chat line into a `GameChatEvent` on the game manager's bus, with the speaker's
     * team deciding both the colour and which side of the screen it is pinned to.
     */
    // AS3: SnowWarEngine.as::addChatMessage()
    public addChatMessage(userId: number, message: string, notify: boolean = false): void
    {
        if(this._players === null) return;

        const player = this._players.getValue(userId);

        if(player === null) return;

        const locX = player.teamId === 1 ? -300 : 300;
        const color = player.teamId === 1 ? 255 : 16711680;

        this._gameManager?.events.emit(
            GameChatEvent.GAME_CHAT,
            new GameChatEvent(
                GameChatEvent.GAME_CHAT,
                userId,
                message,
                locX,
                color,
                player.figure,
                player.gender,
                player.name,
                player.teamId,
                notify
            )
        );
    }

    // AS3: SnowWarEngine.as::stopLobbyCounter()
    public stopLobbyCounter(): void
    {
        if(this._state === SnowWarEngine.STATE_REJOIN_GAME && this._endingView !== null)
        {
            this._wantsRematch = true;
            this._endingView.changeToWaitState(this._wantsRematch);
        }
        else
        {
            this.lobbyView?.stopCountdown();
        }
    }

    /**
     * A lobby arrives in one of two places: folded into the ending panel when the player is coming
     * out of a game, or in the games window otherwise.
     */
    // AS3: SnowWarEngine.as::createLobby()
    public createLobby(lobbyData: GameLobbyData): void
    {
        if(this._state === SnowWarEngine.STATE_GAME_OVER) this._wantsRematch = true;

        if(this._endingView !== null && this._state !== SnowWarEngine.STATE_REJOIN_GAME)
        {
            this._endingView.changeToWaitState(this._wantsRematch);
            this._state = SnowWarEngine.STATE_REJOIN_GAME;
            this._wantsRematch = false;
        }

        if(this._state === SnowWarEngine.STATE_REJOIN_GAME && this._endingView !== null)
        {
            this._endingView.changeToLobbyState(lobbyData);

            for(const player of lobbyData.players) this._endingView.playerJoined(player);

            return;
        }

        this._state = SnowWarEngine.STATE_INACTIVE;
        this._mainView?.openGameLobbyWindow(
            this.getArenaName(lobbyData),
            lobbyData.numberOfTeams,
            lobbyData.maximumPlayers
        );

        for(const player of lobbyData.players) this.lobbyView?.playerJoined(player);
    }

    // AS3: SnowWarEngine.as::userJoined()
    public userJoined(player: GameLobbyPlayerData | null): void
    {
        if(this._state === SnowWarEngine.STATE_REJOIN_GAME && this._endingView !== null)
        {
            this._endingView.playerJoined(player);

            return;
        }

        this._state = SnowWarEngine.STATE_INACTIVE;
        this.lobbyView?.playerJoined(player);
    }

    // AS3: SnowWarEngine.as::userLeft()
    public userLeft(userId: number): void
    {
        if(this._state === SnowWarEngine.STATE_REJOIN_GAME && this._endingView !== null)
        {
            this._endingView.playerLeft(userId);

            return;
        }

        this._state = SnowWarEngine.STATE_INACTIVE;
        this.lobbyView?.playerLeft(userId);
    }

    /** Only game type 0 — snow war — is acted on; the reply covers every game the account has. */
    // AS3: SnowWarEngine.as::gamesLeft()
    public gamesLeft(gameTypeId: number, hasUnlimitedGames: boolean, freeGamesLeft: number): void
    {
        if(gameTypeId !== 0) return;

        this._hasUnlimitedGames = hasUnlimitedGames;
        this._freeGamesLeft = freeGamesLeft;

        this._endingView?.updateGamesLeft();
        this._mainView?.updateGameStartingStatus();
    }

    // AS3: SnowWarEngine.as::resetSession()
    public resetSession(): void
    {
        this.resetGameSession();
        this.resetRoomSession();

        if(this._endingView)
        {
            this._endingView.dispose();
            this._endingView = null;
        }

        this._mainView?.openMainWindow(false);
    }

    // AS3: SnowWarEngine.as::gameCancelled()
    public gameCancelled(returnToHotel: boolean): void
    {
        this.resetSession();

        if(returnToHotel) this._gameManager?.onSnowWarArenaSessionEnded();
    }

    // AS3: SnowWarEngine.as::stopWaitingForSnowball()
    public stopWaitingForSnowball(gameObjectId: number): void
    {
        if(this._arenaView !== null && gameObjectId === this._ownId) this._arenaView.stopWaitingForSnowball();
    }

    // AS3: SnowWarEngine.as::openGetMoreGames()
    public openGetMoreGames(logEvent: string): void
    {
        this._catalog?.buySnowWarTokensOffer(SnowWarEngine.GET_SNOWWAR_TOKENS);
        this.logGameEvent(logEvent);
    }

    // AS3: SnowWarEngine.as::openClubCenter()
    public openClubCenter(logEvent: string): void
    {
        this._catalog?.openClubCenter();
        this.logGameEvent(logEvent);
    }

    // AS3: SnowWarEngine.as::logGameEvent()
    public logGameEvent(action: string): void
    {
        this.send(new EventLogMessageComposer('GameFramework', 'SnowStorm', action, '', this.freeGamesLeft));
    }

    /** Flashes your own score green when you hit someone, red when you are hit. */
    // AS3: SnowWarEngine.as::registerHit()
    public registerHit(victim: HumanGameObject, thrower: HumanGameObject): void
    {
        if(this._ownId === victim.gameObjectId) this._arenaView?.flashOwnScore(false);
        else if(this._ownId === thrower.gameObjectId) this._arenaView?.flashOwnScore(true);
    }

    /**
     * The welcome screen for a player who has never played, shown once. A brand-new identity only
     * gets it if they came in through the games wing.
     */
    // AS3: SnowWarEngine.as::promoteGame()
    public promoteGame(): void
    {
        if(this._promotionShown || this._gamesPlayed !== 0) return;

        this._promotionShown = true;

        const isNewIdentity = (this._config?.getInteger('new.identity', 0) ?? 0) > 0;
        const wing = this._config?.getProperty('new.user.wing') ?? null;

        if(isNewIdentity && wing !== 'game') return;

        this._habboHelp?.showWelcomeScreen('HTIE_ICON_GAMES', 'snowwar.promotion', 0, 'GAMES');
    }

    // AS3: SnowWarEngine.as::showLeaderboard()
    public showLeaderboard(): void
    {
        const leaderboard = this.leaderboard;

        if(!leaderboard) return;

        leaderboard.selectedGame = 0;
        leaderboard.showFriendsAllTime();
    }

    // AS3: SnowWarEngine.as::dispose()
    public override dispose(): void
    {
        if(this._communication)
        {
            releaseProvider(this._communication, IID_HabboCommunicationManager);
            this._communication = null;
        }

        if(this._windowManager)
        {
            releaseProvider(this._windowManager, IID_HabboWindowManager);
            this._windowManager = null;
        }

        if(this._config)
        {
            releaseProvider(this._config, IID_HabboConfigurationManager);
            this._config = null;
        }

        if(this._localization)
        {
            releaseProvider(this._localization, IID_HabboLocalizationManager);
            this._localization = null;
        }

        if(this._roomSessionManager)
        {
            releaseProvider(this._roomSessionManager, IID_RoomSessionManager);
            this._roomSessionManager = null;
        }

        if(this._sessionDataManager !== null)
        {
            releaseProvider(this._sessionDataManager, IID_SessionDataManager);
            this._sessionDataManager = null;
        }

        if(this._roomEngine !== null)
        {
            this._roomEngine.events?.off(RoomEngineEvent.REE_OBJECTS_INITIALIZED, this._onRoomObjectsInitialized);
            releaseProvider(this._roomEngine, IID_RoomEngine);
            this._roomEngine = null;
        }

        if(SnowWarEngine._soundManager !== null)
        {
            releaseProvider(SnowWarEngine._soundManager, IID_HabboSoundManager);
            SnowWarEngine._soundManager = null;
        }

        if(this._habboHelp !== null)
        {
            releaseProvider(this._habboHelp, IID_HabboHelp);
            this._habboHelp = null;
        }

        if(this._avatarManager !== null)
        {
            releaseProvider(this._avatarManager, IID_AvatarRenderManager);
            this._avatarManager = null;
        }

        if(this._groupsManager !== null)
        {
            releaseProvider(this._groupsManager, IID_HabboGroupsManager);
            this._groupsManager = null;
        }

        if(this._roomUI !== null)
        {
            releaseProvider(this._roomUI, IID_RoomUI);
            this._roomUI = null;
        }

        if(this._catalog !== null)
        {
            releaseProvider(this._catalog, IID_HabboCatalog);
            this._catalog = null;
        }

        if(this._friendList !== null)
        {
            releaseProvider(this._friendList, IID_HabboFriendList);
            this._friendList = null;
        }

        this.removeOldAlert();

        if(this._endingView)
        {
            this._endingView.dispose();
            this._endingView = null;
        }

        this.disposeLoadingView();

        if(this._gameArena !== null)
        {
            this._gameArena.dispose();
            this._gameArena = null;
        }

        if(this._arenaView !== null)
        {
            this._arenaView.dispose();
            this._arenaView = null;
        }

        if(this._mainView)
        {
            this._mainView.dispose();
            this._mainView = null;
        }

        if(this._incomingMessages)
        {
            this._incomingMessages.dispose();
            this._incomingMessages = null;
        }

        if(this._leaderboard)
        {
            this._leaderboard.dispose();
            this._leaderboard = null;
        }

        this._gameManager = null;

        super.dispose();
    }
}
