import type {IDisposable} from '@core/runtime/IDisposable';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {Logger} from '@core/utils/Logger';
import {RoomEntryInfoMessageEvent} from '@habbo/communication/messages/incoming/room/engine/RoomEntryInfoMessageEvent';
import {ScrSendUserInfoEvent} from '@habbo/communication/messages/incoming/users/ScrSendUserInfoEvent';
import {
    Game2AccountGameStatusMessageEvent,
    Game2GameCancelledMessageEvent,
    Game2GameCreatedMessageEvent,
    Game2GameDirectoryStatusMessageEvent,
    Game2GameLongDataMessageEvent,
    Game2GameStartedMessageEvent,
    Game2InArenaQueueMessageEvent,
    Game2JoiningGameFailedMessageEvent,
    Game2StartCounterMessageEvent,
    Game2StartingGameFailedMessageEvent,
    Game2StopCounterMessageEvent,
    Game2UserBlockedMessageEvent,
    Game2UserJoinedGameMessageEvent,
    Game2UserLeftGameMessageEvent
} from '@habbo/communication/messages/incoming/game/directory';
import {
    Game2ArenaEnteredMessageEvent,
    Game2EnterArenaFailedMessageEvent,
    Game2EnterArenaMessageEvent,
    Game2GameChatFromPlayerMessageEvent,
    Game2GameEndingMessageEvent,
    Game2GameRejoinMessageEvent,
    Game2PlayerExitedGameArenaMessageEvent,
    Game2PlayerRematchesMessageEvent,
    Game2StageEndingMessageEvent,
    Game2StageLoadMessageEvent,
    Game2StageRunningMessageEvent,
    Game2StageStartingMessageEvent,
    Game2StageStillLoadingMessageEvent
} from '@habbo/communication/messages/incoming/game/snowwar/arena';
import {
    Game2FullGameStatusMessageEvent,
    Game2GameStatusMessageEvent
} from '@habbo/communication/messages/incoming/game/snowwar/ingame';
import {
    Game2FriendsLeaderboardEvent,
    Game2TotalGroupLeaderboardEvent,
    Game2TotalLeaderboardEvent,
    Game2WeeklyFriendsLeaderboardEvent,
    Game2WeeklyGroupLeaderboardEvent,
    Game2WeeklyLeaderboardEvent
} from '@habbo/communication/messages/incoming/game/score';
import {
    Game2GetAccountGameStatusMessageComposer
} from '@habbo/communication/messages/outgoing/game/directory/Game2GetAccountGameStatusMessageComposer';
import type {
    Game2AccountGameStatusMessageParser
} from '@habbo/communication/messages/parser/game/directory/Game2AccountGameStatusMessageParser';
import type {
    Game2GameCreatedMessageEventParser
} from '@habbo/communication/messages/parser/game/directory/Game2GameCreatedMessageEventParser';
import type {
    Game2GameDirectoryStatusMessageParser
} from '@habbo/communication/messages/parser/game/directory/Game2GameDirectoryStatusMessageParser';
import type {
    Game2GameLongDataMessageEventParser
} from '@habbo/communication/messages/parser/game/directory/Game2GameLongDataMessageEventParser';
import type {
    Game2GameStartedMessageEventParser
} from '@habbo/communication/messages/parser/game/directory/Game2GameStartedMessageEventParser';
import type {
    Game2InArenaQueueMessageParser
} from '@habbo/communication/messages/parser/game/directory/Game2InArenaQueueMessageParser';
import type {
    Game2JoiningGameFailedMessageParser
} from '@habbo/communication/messages/parser/game/directory/Game2JoiningGameFailedMessageParser';
import type {
    Game2StartCounterMessageParser
} from '@habbo/communication/messages/parser/game/directory/Game2StartCounterMessageParser';
import type {
    Game2UserBlockedMessageParser
} from '@habbo/communication/messages/parser/game/directory/Game2UserBlockedMessageParser';
import type {
    Game2UserJoinedGameMessageEventParser
} from '@habbo/communication/messages/parser/game/directory/Game2UserJoinedGameMessageEventParser';
import type {
    Game2UserLeftGameMessageParser
} from '@habbo/communication/messages/parser/game/directory/Game2UserLeftGameMessageParser';
import type {
    Game2EnterArenaFailedMessageEventParser
} from '@habbo/communication/messages/parser/game/snowwar/arena/Game2EnterArenaFailedMessageEventParser';
import type {
    Game2EnterArenaMessageEventParser
} from '@habbo/communication/messages/parser/game/snowwar/arena/Game2EnterArenaMessageEventParser';
import type {
    Game2GameChatFromPlayerMessageEventParser
} from '@habbo/communication/messages/parser/game/snowwar/arena/Game2GameChatFromPlayerMessageEventParser';
import type {
    Game2GameEndingMessageEventParser
} from '@habbo/communication/messages/parser/game/snowwar/arena/Game2GameEndingMessageEventParser';
import type {
    Game2GameRejoinMessageEventParser
} from '@habbo/communication/messages/parser/game/snowwar/arena/Game2GameRejoinMessageEventParser';
import type {
    Game2PlayerExitedGameArenaMessageEventParser
} from '@habbo/communication/messages/parser/game/snowwar/arena/Game2PlayerExitedGameArenaMessageEventParser';
import type {
    Game2PlayerRematchesMessageEventParser
} from '@habbo/communication/messages/parser/game/snowwar/arena/Game2PlayerRematchesMessageEventParser';
import type {
    Game2StageEndingMessageEventParser
} from '@habbo/communication/messages/parser/game/snowwar/arena/Game2StageEndingMessageEventParser';
import type {
    Game2StageRunningMessageEventParser
} from '@habbo/communication/messages/parser/game/snowwar/arena/Game2StageRunningMessageEventParser';
import type {
    Game2StageStartingMessageEventParser
} from '@habbo/communication/messages/parser/game/snowwar/arena/Game2StageStartingMessageEventParser';
import type {
    Game2StageStillLoadingMessageEventParser
} from '@habbo/communication/messages/parser/game/snowwar/arena/Game2StageStillLoadingMessageEventParser';
import type {
    Game2FullGameStatusMessageEventParser
} from '@habbo/communication/messages/parser/game/snowwar/ingame/Game2FullGameStatusMessageEventParser';
import type {
    Game2GameStatusMessageEventParser
} from '@habbo/communication/messages/parser/game/snowwar/ingame/Game2GameStatusMessageEventParser';
import type {
    Game2GroupLeaderboardParser
} from '@habbo/communication/messages/parser/game/score/Game2GroupLeaderboardParser';
import type {
    Game2LeaderboardParser
} from '@habbo/communication/messages/parser/game/score/Game2LeaderboardParser';
import type {
    Game2WeeklyGroupLeaderboardParser
} from '@habbo/communication/messages/parser/game/score/Game2WeeklyGroupLeaderboardParser';
import type {
    Game2WeeklyLeaderboardParser
} from '@habbo/communication/messages/parser/game/score/Game2WeeklyLeaderboardParser';
import type {
    GameObjectsData
} from '@habbo/communication/messages/parser/game/snowwar/data/GameObjectsData';
import type {
    GameStatusData
} from '@habbo/communication/messages/parser/game/snowwar/data/GameStatusData';
import {
    CreateSnowballEventData
} from '@habbo/communication/messages/parser/game/snowwar/data/CreateSnowballEventData';
import {
    HumanGetsSnowballsFromMachineEventData
} from '@habbo/communication/messages/parser/game/snowwar/data/HumanGetsSnowballsFromMachineEventData';
import {
    HumanLeftGameEventData
} from '@habbo/communication/messages/parser/game/snowwar/data/HumanLeftGameEventData';
import {
    HumanStartsToMakeASnowballEventData
} from '@habbo/communication/messages/parser/game/snowwar/data/HumanStartsToMakeASnowballEventData';
import {
    HumanThrowsSnowballAtHumanEventData
} from '@habbo/communication/messages/parser/game/snowwar/data/HumanThrowsSnowballAtHumanEventData';
import {
    HumanThrowsSnowballAtPositionEventData
} from '@habbo/communication/messages/parser/game/snowwar/data/HumanThrowsSnowballAtPositionEventData';
import {
    MachineCreatesSnowballEventData
} from '@habbo/communication/messages/parser/game/snowwar/data/MachineCreatesSnowballEventData';
import {
    NewMoveTargetEventData
} from '@habbo/communication/messages/parser/game/snowwar/data/NewMoveTargetEventData';
import {
    HumanGameObjectData
} from '@habbo/communication/messages/parser/game/snowwar/data/HumanGameObjectData';
import {
    SnowballGameObjectData
} from '@habbo/communication/messages/parser/game/snowwar/data/SnowballGameObjectData';
import {
    SnowballMachineGameObjectData
} from '@habbo/communication/messages/parser/game/snowwar/data/SnowballMachineGameObjectData';
import {
    SnowballPileGameObjectData
} from '@habbo/communication/messages/parser/game/snowwar/data/SnowballPileGameObjectData';
import {
    TreeGameObjectData
} from '@habbo/communication/messages/parser/game/snowwar/data/TreeGameObjectData';
import type {SnowWarEngine} from './SnowWarEngine';
import type {SnowWarGameStage} from './SnowWarGameStage';
import type {ISynchronizedGameEvent} from './arena/ISynchronizedGameEvent';
import {CreateSnowballEvent} from './events/CreateSnowballEvent';
import {HumanGetsSnowballsFromMachineEvent} from './events/HumanGetsSnowballsFromMachineEvent';
import {HumanLeftGameEvent} from './events/HumanLeftGameEvent';
import {HumanStartsToMakeASnowballEvent} from './events/HumanStartsToMakeASnowballEvent';
import {HumanThrowsSnowballAtHumanEvent} from './events/HumanThrowsSnowballAtHumanEvent';
import {HumanThrowsSnowballAtPositionEvent} from './events/HumanThrowsSnowballAtPositionEvent';
import {MachineCreatesSnowballEvent} from './events/MachineCreatesSnowballEvent';
import {NewMoveTargetEvent} from './events/NewMoveTargetEvent';
import {HumanGameObject} from './gameobjects/HumanGameObject';
import type {SnowballGivingGameObject} from './gameobjects/SnowballGivingGameObject';
import {SnowBallGameObject} from './gameobjects/SnowBallGameObject';
import {SnowballMachineGameObject} from './gameobjects/SnowballMachineGameObject';
import {SnowballPileGameObject} from './gameobjects/SnowballPileGameObject';
import {TreeGameObject} from './gameobjects/TreeGameObject';

const log = Logger.getLogger('habbo.game.snowwar.SnowWarIncomingMessages');

/**
 * Everything the server says about a snow-war game, in one place: 34 subscriptions and the two
 * translators — `initializeGameObjects()` and `handleGameStatus()` — that turn wire DTOs into the
 * live simulation.
 *
 * **`handleGameStatus()` is where the lock-step actually happens.** Every event in a turn is queued
 * onto `turn + 1`, never the turn it arrived on, so the client applies inputs exactly one turn after
 * the server acknowledged them. The ghost gets a *second* copy of your own three inputs, applied to
 * the ghost object instead — that is the whole prediction mechanism.
 *
 * Two ids in the table are not snow-war messages at all: `RoomEntryInfo` (2914) triggers the
 * first-time promotion, and `ScrSendUserInfo` (1097) — the subscription reply — re-asks for the
 * account's game count, because buying HC changes it.
 *
 * **The name is derived.** `_SafeCls_1951` in the primary tree, `class_1762` in `win63_version`,
 * obfuscated in both. It is named for what it is, and to match `habbo/game`'s own
 * `IncomingMessages` — which is a different, much smaller class.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/_SafeCls_1951.as
 */
export class SnowWarIncomingMessages implements IDisposable
{
    /** Derived name — `_SafeStr_4554`, the engine. */
    // AS3: _SafeCls_1951.as::_SafeStr_4554
    private _engine: SnowWarEngine | null;

    // AS3: _SafeCls_1951.as::_SafeStr_5769
    private _disposed: boolean = false;

    // AS3: _SafeCls_1951.as::_SafeCls_1951()
    constructor(engine: SnowWarEngine)
    {
        this._engine = engine;

        const communication = engine.communication;

        if(!communication) return;

        const events: IMessageEvent[] = [
            new Game2UserJoinedGameMessageEvent((event) => this.onUserJoined(event as Game2UserJoinedGameMessageEvent)),
            new Game2StageEndingMessageEvent((event) => this.onStageEnding(event as Game2StageEndingMessageEvent)),
            new Game2JoiningGameFailedMessageEvent((event) => this.onJoiningGameFailed(event as Game2JoiningGameFailedMessageEvent)),
            new Game2StopCounterMessageEvent(() => this.onLobbyCounterStop()),
            new Game2GameChatFromPlayerMessageEvent((event) => this.onGameChat(event as Game2GameChatFromPlayerMessageEvent)),
            new Game2FullGameStatusMessageEvent((event) => this.onFullGameStatus(event as Game2FullGameStatusMessageEvent)),
            new Game2GameStartedMessageEvent((event) => this.onGameStarted(event as Game2GameStartedMessageEvent)),
            new Game2GameCreatedMessageEvent((event) => this.onGameCreated(event as Game2GameCreatedMessageEvent)),
            new Game2StartingGameFailedMessageEvent(() => this.onStartingGameFailed()),
            new Game2GameRejoinMessageEvent((event) => this.onRejoinGame(event as Game2GameRejoinMessageEvent)),
            new Game2WeeklyGroupLeaderboardEvent((event) => this.onWeeklyGroupLeaderboard(event as Game2WeeklyGroupLeaderboardEvent)),
            new Game2StageStillLoadingMessageEvent((event) => this.onStageStillLoading(event as Game2StageStillLoadingMessageEvent)),
            new Game2GameEndingMessageEvent((event) => this.onGameEnding(event as Game2GameEndingMessageEvent)),
            new Game2GameCancelledMessageEvent(() => this.onGameCancelled()),
            new Game2AccountGameStatusMessageEvent((event) => this.onAccountGameStatus(event as Game2AccountGameStatusMessageEvent)),
            new Game2EnterArenaFailedMessageEvent((event) => this.onEnterArenaFailed(event as Game2EnterArenaFailedMessageEvent)),
            new Game2InArenaQueueMessageEvent((event) => this.onInArenaQueue(event as Game2InArenaQueueMessageEvent)),
            new Game2StageRunningMessageEvent((event) => this.onStageRunning(event as Game2StageRunningMessageEvent)),
            new RoomEntryInfoMessageEvent(() => this.onRoomEnter()),
            new Game2ArenaEnteredMessageEvent(() => this.onArenaEntered()),
            new ScrSendUserInfoEvent(() => this.onSubscriptionStatus()),
            new Game2EnterArenaMessageEvent((event) => this.onEnterArena(event as Game2EnterArenaMessageEvent)),
            new Game2GameStatusMessageEvent((event) => this.onGameStatus(event as Game2GameStatusMessageEvent)),
            new Game2WeeklyLeaderboardEvent((event) => this.onWeeklyLeaderboard(event as Game2WeeklyLeaderboardEvent)),
            new Game2UserLeftGameMessageEvent((event) => this.onUserLeft(event as Game2UserLeftGameMessageEvent)),
            new Game2PlayerExitedGameArenaMessageEvent((event) => this.onPlayerExitedArena(event as Game2PlayerExitedGameArenaMessageEvent)),
            new Game2WeeklyFriendsLeaderboardEvent((event) => this.onWeeklyFriendsLeaderboard(event as Game2WeeklyFriendsLeaderboardEvent)),
            new Game2TotalLeaderboardEvent((event) => this.onTotalLeaderboard(event as Game2TotalLeaderboardEvent)),
            new Game2StageStartingMessageEvent((event) => this.onStageStarting(event as Game2StageStartingMessageEvent)),
            new Game2GameDirectoryStatusMessageEvent((event) => this.onGameDirectoryStatus(event as Game2GameDirectoryStatusMessageEvent)),
            new Game2TotalGroupLeaderboardEvent((event) => this.onTotalGroupLeaderboard(event as Game2TotalGroupLeaderboardEvent)),
            new Game2StartCounterMessageEvent((event) => this.onLobbyCounterStart(event as Game2StartCounterMessageEvent)),
            new Game2UserBlockedMessageEvent((event) => this.onPlayerBlockStatusChange(event as Game2UserBlockedMessageEvent)),
            new Game2PlayerRematchesMessageEvent((event) => this.onPlayerRematches(event as Game2PlayerRematchesMessageEvent)),
            new Game2StageLoadMessageEvent(() => this.onStageLoad()),
            new Game2GameLongDataMessageEvent((event) => this.onGameLongData(event as Game2GameLongDataMessageEvent)),
            new Game2FriendsLeaderboardEvent((event) => this.onFriendsLeaderboard(event as Game2FriendsLeaderboardEvent))
        ];

        for(const event of events) communication.addHabboConnectionMessageEvent(event);
    }

    // AS3: _SafeCls_1951.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: _SafeCls_1951.as::onEnterArena()
    private onEnterArena(event: Game2EnterArenaMessageEvent): void
    {
        const parser = event.getParser<Game2EnterArenaMessageEventParser>();

        this._engine?.initArena(parser.gameType, parser.fieldType, parser.numberOfTeams, parser.players);

        const stage = this._engine?.gameArena?.getCurrentStage() ?? null;

        if(stage && this._engine?.gameArena && parser.gameLevel)
        {
            stage.initialize(this._engine.gameArena, parser.gameLevel);
        }

        this._engine?.mainView?.close(false);
    }

    // AS3: _SafeCls_1951.as::onEnterArenaFailed()
    private onEnterArenaFailed(event: Game2EnterArenaFailedMessageEvent): void
    {
        const parser = event.getParser<Game2EnterArenaFailedMessageEventParser>();
        let key = 'snowwar.error.generic';

        if(parser.reason === 1) key = 'snowwar.error.game_already_started';

        this._engine?.alert(`\${${key}}`);
    }

    /** AS3 reads the player into a local and does nothing with it. */
    // AS3: _SafeCls_1951.as::onArenaEntered()
    private onArenaEntered(): void
    {
        // Intentionally empty, as in AS3.
    }

    // AS3: _SafeCls_1951.as::onStageLoad()
    private onStageLoad(): void
    {
        this._engine?.initView();
    }

    // AS3: _SafeCls_1951.as::onStageStillLoading()
    private onStageStillLoading(event: Game2StageStillLoadingMessageEvent): void
    {
        const parser = event.getParser<Game2StageStillLoadingMessageEventParser>();

        this._engine?.stageLoading(parser.percentage, parser.finishedPlayers);
    }

    // AS3: _SafeCls_1951.as::onStageStarting()
    private onStageStarting(event: Game2StageStartingMessageEvent): void
    {
        const parser = event.getParser<Game2StageStartingMessageEventParser>();

        log.debug(`[SnowWarEngine] On stage start: ${parser.countDown}`);

        this.initializeGameObjects(parser.gameObjects);
        this._engine?.startStage(parser.countDown);
    }

    // AS3: _SafeCls_1951.as::onStageRunning()
    private onStageRunning(event: Game2StageRunningMessageEvent): void
    {
        const parser = event.getParser<Game2StageRunningMessageEventParser>();

        log.debug(`[SnowWarEngine] On stage running: ${parser.timeToStageEnd}`);
        this._engine?.stageRunning(parser.timeToStageEnd);
    }

    // AS3: _SafeCls_1951.as::onStageEnding()
    private onStageEnding(event: Game2StageEndingMessageEvent): void
    {
        const parser = event.getParser<Game2StageEndingMessageEventParser>();

        log.debug(`[SnowWarEngine] On stage ending: ${parser.timeToNextState}`);

        if(parser.timeToNextState === 0) this._engine?.resetGameSession();
    }

    // AS3: _SafeCls_1951.as::onGameEnding()
    private onGameEnding(event: Game2GameEndingMessageEvent): void
    {
        const parser = event.getParser<Game2GameEndingMessageEventParser>();

        log.debug(`[SnowWarEngine] On game ending: ${parser.timeToNextState}`);
        this._engine?.gameOver(parser.timeToNextState, parser.teams, parser.generalStats, parser.gameResult);
    }

    // AS3: _SafeCls_1951.as::onPlayerExitedArena()
    private onPlayerExitedArena(event: Game2PlayerExitedGameArenaMessageEvent): void
    {
        const parser = event.getParser<Game2PlayerExitedGameArenaMessageEventParser>();

        log.debug(
            `[SnowWarEngine] On player exited arena. userId:${parser.userId}`
            + ` gameObjectId:${parser.playerGameObjectId}`
        );
    }

    // AS3: _SafeCls_1951.as::onRejoinGame()
    private onRejoinGame(event: Game2GameRejoinMessageEvent): void
    {
        const parser = event.getParser<Game2GameRejoinMessageEventParser>();

        log.debug(`Rejoin game! Room Before game: ${parser.roomBeforeGame}`);
        this._engine?.rejoinGame(parser.roomBeforeGame);
    }

    // AS3: _SafeCls_1951.as::onPlayerRematches()
    private onPlayerRematches(event: Game2PlayerRematchesMessageEvent): void
    {
        const parser = event.getParser<Game2PlayerRematchesMessageEventParser>();

        log.debug(`User ${parser.userId} rematches`);
        this._engine?.playerRematches(parser.userId);
    }

    // AS3: _SafeCls_1951.as::onGameDirectoryStatus()
    private onGameDirectoryStatus(event: Game2GameDirectoryStatusMessageEvent): void
    {
        const parser = event.getParser<Game2GameDirectoryStatusMessageParser>();

        if(parser.status !== 0)
        {
            this._engine?.onGameDirectoryAvailable(false);
            log.debug(`Game directory not available, status:${parser.status}`);

            return;
        }

        this._engine?.mainView?.changeBlockStatus(parser.blockLength);

        if(this._engine) this._engine.gamesPlayed = parser.gamesPlayed;

        this._engine?.onGameDirectoryAvailable(true);
        this._engine?.gamesLeft(0, parser.freeGamesLeft === -1, parser.freeGamesLeft);
    }

    // AS3: _SafeCls_1951.as::onAccountGameStatus()
    private onAccountGameStatus(event: Game2AccountGameStatusMessageEvent): void
    {
        const parser = event.getParser<Game2AccountGameStatusMessageParser>();

        log.debug(
            `FREE GAMES LEFT: ${parser.freeGamesLeft} OR HAS UNLIMITED GAMES: ${parser.hasUnlimitedGames}`
        );
        this._engine?.gamesLeft(parser.gameTypeId, parser.hasUnlimitedGames, parser.freeGamesLeft);
    }

    // AS3: _SafeCls_1951.as::onGameCreated()
    private onGameCreated(event: Game2GameCreatedMessageEvent): void
    {
        const parser = event.getParser<Game2GameCreatedMessageEventParser>();
        const lobbyData = parser.gameLobbyData;

        if(lobbyData) this._engine?.createLobby(lobbyData);
    }

    // AS3: _SafeCls_1951.as::onGameStarted()
    private onGameStarted(event: Game2GameStartedMessageEvent): void
    {
        const parser = event.getParser<Game2GameStartedMessageEventParser>();

        log.debug('Game started!');

        if(parser.lobbyData) this._engine?.gameStarted(parser.lobbyData);
    }

    // AS3: _SafeCls_1951.as::onLobbyCounterStart()
    private onLobbyCounterStart(event: Game2StartCounterMessageEvent): void
    {
        const parser = event.getParser<Game2StartCounterMessageParser>();

        log.debug(`Start Lobby Counter: ${parser.countDownLength}`);
        this._engine?.startLobbyCounter(parser.countDownLength);
    }

    // AS3: _SafeCls_1951.as::onLobbyCounterStop()
    private onLobbyCounterStop(): void
    {
        this._engine?.stopLobbyCounter();
    }

    // AS3: _SafeCls_1951.as::onGameCancelled()
    private onGameCancelled(): void
    {
        this._engine?.gameCancelled(false);
    }

    // AS3: _SafeCls_1951.as::onInArenaQueue()
    private onInArenaQueue(event: Game2InArenaQueueMessageEvent): void
    {
        const parser = event.getParser<Game2InArenaQueueMessageParser>();
        const lobbyView = this._engine?.lobbyView ?? null;

        if(lobbyView) lobbyView.queuePosition = parser.position;
    }

    // AS3: _SafeCls_1951.as::onUserJoined()
    private onUserJoined(event: Game2UserJoinedGameMessageEvent): void
    {
        const parser = event.getParser<Game2UserJoinedGameMessageEventParser>();

        this._engine?.userJoined(parser.user);
    }

    // AS3: _SafeCls_1951.as::onUserLeft()
    private onUserLeft(event: Game2UserLeftGameMessageEvent): void
    {
        const parser = event.getParser<Game2UserLeftGameMessageParser>();

        this._engine?.userLeft(parser.userId);
    }

    // AS3: _SafeCls_1951.as::onGameLongData()
    private onGameLongData(event: Game2GameLongDataMessageEvent): void
    {
        const parser = event.getParser<Game2GameLongDataMessageEventParser>();
        const lobbyData = parser.gameLobbyData;

        if(!lobbyData) return;

        log.debug(
            `Long data received: ${lobbyData.fieldType},${lobbyData.numberOfTeams},${lobbyData.maximumPlayers}`
        );
        this._engine?.createLobby(lobbyData);
    }

    /**
     * Three of the eight refusal reasons get their own message; the rest fall through to the
     * generic one. `6` and `7` share it, which is why both are listed.
     */
    // AS3: _SafeCls_1951.as::onJoiningGameFailed()
    private onJoiningGameFailed(event: Game2JoiningGameFailedMessageEvent): void
    {
        const parser = event.getParser<Game2JoiningGameFailedMessageParser>();
        let key = 'snowwar.error.generic';

        switch(parser.reason)
        {
            case 2:
                key = 'snowwar.error.duplicate_machineid';
                break;
            case 6:
            case 7:
                key = 'snowwar.error.has_active_instance';
                break;
            case 8:
                key = 'snowwar.error.no_free_games_left';
                break;
        }

        this._engine?.alert(`\${${key}}`);
    }

    // AS3: _SafeCls_1951.as::onStartingGameFailed()
    private onStartingGameFailed(): void
    {
        this._engine?.alert('${snowwar.error.generic}');
    }

    // AS3: _SafeCls_1951.as::onPlayerBlockStatusChange()
    private onPlayerBlockStatusChange(event: Game2UserBlockedMessageEvent): void
    {
        const parser = event.getParser<Game2UserBlockedMessageParser>();

        this._engine?.mainView?.changeBlockStatus(parser.playerBlockLength);
    }

    /**
     * The recovery path: throw the tiles and objects away, rebuild them from the full state, wind
     * the arena back to the server's turn, and replay that turn's events.
     */
    // AS3: _SafeCls_1951.as::onFullGameStatus()
    private onFullGameStatus(event: Game2FullGameStatusMessageEvent): void
    {
        const parser = event.getParser<Game2FullGameStatusMessageEventParser>();
        const arena = this._engine?.gameArena ?? null;
        const fullStatus = parser.fullStatus;

        log.debug('On full game status: ');

        if(!fullStatus) return;

        (arena?.getCurrentStage() as SnowWarGameStage | null)?.resetTiles();
        this.initializeGameObjects(fullStatus.gameObjects);

        if(!arena) return;

        const status = fullStatus.gameStatus;

        if(!status) return;

        arena.seekToTurn(status.turn, status.checksum);
        this.handleGameStatus(status, true);
    }

    // AS3: _SafeCls_1951.as::onGameStatus()
    private onGameStatus(event: Game2GameStatusMessageEvent): void
    {
        const parser = event.getParser<Game2GameStatusMessageEventParser>();

        log.trace('[SnowWarEngine] On game status: ');

        if(parser.status) this.handleGameStatus(parser.status);
    }

    /**
     * Rebuilds the stage's objects from the wire.
     *
     * Two things worth knowing: the *own* player is recognised by **name**, not by id — that is how
     * `ownId` is learned — and the ghost is created here, once, as a second `HumanGameObject` filed
     * under `ghostObjectId`.
     */
    // AS3: _SafeCls_1951.as::initializeGameObjects()
    private initializeGameObjects(gameObjects: GameObjectsData | null): void
    {
        const arena = this._engine?.gameArena ?? null;

        if(!arena || !gameObjects) return;

        const stage = arena.getCurrentStage() as SnowWarGameStage | null;

        if(!stage) return;

        stage.removeAllGameObjects();

        for(const data of gameObjects.gameObjects)
        {
            if(data instanceof SnowballGameObjectData)
            {
                const thrower = stage.getGameObject(data.throwingHuman) as HumanGameObject | null;
                const snowball = new SnowBallGameObject(data.id);

                if(thrower === null) continue;

                snowball.initializeFromData(data, thrower);
                stage.addGameObject(snowball.gameObjectId, snowball);
                log.trace(`snowball x:${data.locationX3D} y:${data.locationY3D}`);
            }
            else if(data instanceof TreeGameObjectData)
            {
                const tree = new TreeGameObject(data, stage);

                stage.addGameObject(tree.gameObjectId, tree);
                log.trace(`tree id:${tree.gameObjectId}`);
            }
            else if(data instanceof SnowballPileGameObjectData)
            {
                const pile = new SnowballPileGameObject(data, stage);

                stage.addGameObject(data.id, pile);
                log.trace(`pile id:${data.id}`);
            }
            else if(data instanceof SnowballMachineGameObjectData)
            {
                const machine = new SnowballMachineGameObject(data, stage);

                stage.addGameObject(data.id, machine);
                log.trace(`machine id:${data.id}`);
            }
            else if(data instanceof HumanGameObjectData)
            {
                const isOwn = data.name === this._engine?.sessionDataManager?.userName;

                if(isOwn && this._engine) this._engine.ownId = data.id;

                const human = new HumanGameObject(stage, data, false, this._engine);

                stage.addGameObject(human.gameObjectId, human);
                human.visualizationMode = 0;

                if(isOwn && this._engine?.isGhostEnabled)
                {
                    human.visualizationMode = this._engine.isGhostVisualizationEnabled ? 1 : 2;

                    if(stage.getGameObject(human.ghostObjectId) === null)
                    {
                        const ghost = new HumanGameObject(stage, data, true, this._engine);

                        ghost.gameObjectId = human.ghostObjectId;
                        stage.addGameObject(ghost.gameObjectId, ghost);
                    }
                }

                log.trace(`human id:${data.id} x:${data.currentLocationX} y:${data.currentLocationY}`);
            }
            else
            {
                log.warn(`Unkonwn game-object:${(data as {type?: number}).type}`);
            }
        }
    }

    /**
     * Queues one turn's events onto `turn + 1` and closes the turn.
     *
     * Event ids 5, 9 and 10 (0-based 4, 8, 9) have no branch in AS3 either — they are server-side
     * only. `isFullStatus` is what tells `nextTurn()` to wind the clock back rather than advance it.
     */
    // AS3: _SafeCls_1951.as::handleGameStatus()
    private handleGameStatus(status: GameStatusData, isFullStatus: boolean = false): void
    {
        const arena = this._engine?.gameArena ?? null;

        if(!arena) return;

        const turn = status.turn;

        for(const subturn of status.events.getKeys())
        {
            for(const data of status.events.getValue(subturn) ?? [])
            {
                let event: ISynchronizedGameEvent | null = null;
                let ghostEvent: ISynchronizedGameEvent | null = null;

                if(data instanceof HumanLeftGameEventData)
                {
                    event = this.handleHumanLeftGameEvent(data);
                }
                else if(data instanceof NewMoveTargetEventData)
                {
                    event = this.handleNewMoveTargetEvent(data);
                }
                else if(data instanceof HumanThrowsSnowballAtHumanEventData)
                {
                    event = this.handleThrowSnowballAtHuman(data);
                    ghostEvent = this.handleGhostThrowSnowballAtHuman(data);
                }
                else if(data instanceof HumanThrowsSnowballAtPositionEventData)
                {
                    event = this.handleThrowSnowballAtPosition(data);
                    ghostEvent = this.handleGhostThrowSnowballAtPosition(data);
                }
                else if(data instanceof HumanStartsToMakeASnowballEventData)
                {
                    event = this.handleHumanStartsToMakeASnowball(data);
                    ghostEvent = this.handleGhostStartsToMakeASnowball(data);
                }
                else if(data instanceof CreateSnowballEventData)
                {
                    event = this.handleCreateSnowballEvent(data);
                }
                else if(data instanceof MachineCreatesSnowballEventData)
                {
                    event = this.handleMachineCreatesSnowballEvent(data);
                }
                else if(data instanceof HumanGetsSnowballsFromMachineEventData)
                {
                    event = this.handleHumanGetsSnowballFromMachineEvent(data);
                }
                else
                {
                    log.warn(`Unknown event id ${(data as {id?: number}).id}`);
                }

                if(event) arena.addGameEvent(turn + 1, subturn, event);
                if(ghostEvent) arena.addGameEvent(turn + 1, subturn, ghostEvent);
            }
        }

        this._engine?.nextTurn(turn, status.checksum, isFullStatus);
    }

    // AS3: _SafeCls_1951.as::handleHumanGetsSnowballFromMachineEvent()
    private handleHumanGetsSnowballFromMachineEvent(
        data: HumanGetsSnowballsFromMachineEventData
    ): HumanGetsSnowballsFromMachineEvent | null
    {
        const stage = this._engine?.gameArena?.getCurrentStage() ?? null;
        const human = stage?.getGameObject(data.humanGameObjectId) as HumanGameObject | null;
        const giver = stage?.getGameObject(data.snowBallMachineReference) as SnowballGivingGameObject | null;

        // AS3 hands both straight to the constructor and lets a null through; the ported event
        // types are non-null, so an event naming an object the stage has not built is dropped
        // instead — the same nothing that AS3's null-dereference-free `apply()` would have done.
        if(!human || !giver) return null;

        return new HumanGetsSnowballsFromMachineEvent(human, giver);
    }

    // AS3: _SafeCls_1951.as::handleMachineCreatesSnowballEvent()
    private handleMachineCreatesSnowballEvent(data: MachineCreatesSnowballEventData): MachineCreatesSnowballEvent
    {
        const stage = this._engine?.gameArena?.getCurrentStage() ?? null;
        const machine = stage?.getGameObject(data.snowBallMachineReference) as SnowballMachineGameObject | null;

        return new MachineCreatesSnowballEvent(machine);
    }

    // AS3: _SafeCls_1951.as::handleThrowSnowballAtPosition()
    private handleThrowSnowballAtPosition(
        data: HumanThrowsSnowballAtPositionEventData
    ): HumanThrowsSnowballAtPositionEvent | null
    {
        const stage = this._engine?.gameArena?.getCurrentStage() ?? null;
        const human = stage?.getGameObject(data.humanGameObjectId) as HumanGameObject | null;

        if(!human) return null;

        return new HumanThrowsSnowballAtPositionEvent(human, data.targetX, data.targetY, data.trajectory);
    }

    // AS3: _SafeCls_1951.as::handleThrowSnowballAtHuman()
    private handleThrowSnowballAtHuman(
        data: HumanThrowsSnowballAtHumanEventData
    ): HumanThrowsSnowballAtHumanEvent | null
    {
        const stage = this._engine?.gameArena?.getCurrentStage() ?? null;
        const human = stage?.getGameObject(data.humanGameObjectId) as HumanGameObject | null;
        const target = stage?.getGameObject(data.targetHumanGameObjectId) as HumanGameObject | null;

        if(!human || !target) return null;

        return new HumanThrowsSnowballAtHumanEvent(human, target, data.trajectory);
    }

    // AS3: _SafeCls_1951.as::handleHumanStartsToMakeASnowball()
    private handleHumanStartsToMakeASnowball(
        data: HumanStartsToMakeASnowballEventData
    ): HumanStartsToMakeASnowballEvent | null
    {
        const stage = this._engine?.gameArena?.getCurrentStage() ?? null;
        const human = stage?.getGameObject(data.humanGameObjectId) as HumanGameObject | null;

        if(!human) return null;

        return new HumanStartsToMakeASnowballEvent(human);
    }

    // AS3: _SafeCls_1951.as::handleCreateSnowballEvent()
    private handleCreateSnowballEvent(data: CreateSnowballEventData): CreateSnowballEvent | null
    {
        const stage = this._engine?.gameArena?.getCurrentStage() ?? null;
        const human = stage?.getGameObject(data.humanGameObjectId) as HumanGameObject | null;

        if(!human) return null;

        return new CreateSnowballEvent(
            data.snowBallGameObjectId, human, data.targetX, data.targetY, data.trajectory
        );
    }

    // AS3: _SafeCls_1951.as::handleNewMoveTargetEvent()
    private handleNewMoveTargetEvent(data: NewMoveTargetEventData): NewMoveTargetEvent | null
    {
        const stage = this._engine?.gameArena?.getCurrentStage() ?? null;
        const human = stage?.getGameObject(data.humanGameObjectId) as HumanGameObject | null;

        if(!human) return null;

        return new NewMoveTargetEvent(human, data.x, data.y);
    }

    // AS3: _SafeCls_1951.as::handleHumanLeftGameEvent()
    private handleHumanLeftGameEvent(data: HumanLeftGameEventData): HumanLeftGameEvent | null
    {
        const stage = this._engine?.gameArena?.getCurrentStage() ?? null;
        const human = stage?.getGameObject(data.humanGameObjectId) as HumanGameObject | null;

        if(!human) return null;

        return new HumanLeftGameEvent(human);
    }

    /** Only *your own* inputs get a ghost copy — everyone else's are simulated as they arrive. */
    // AS3: _SafeCls_1951.as::handleGhostThrowSnowballAtPosition()
    private handleGhostThrowSnowballAtPosition(
        data: HumanThrowsSnowballAtPositionEventData
    ): HumanThrowsSnowballAtPositionEvent | null
    {
        if(!this._engine?.isGhostEnabled) return null;
        if(data.humanGameObjectId !== this._engine.ownId) return null;

        const ghost = this._engine.getGhostPlayer();

        if(!ghost) return null;

        return new HumanThrowsSnowballAtPositionEvent(ghost, data.targetX, data.targetY, data.trajectory);
    }

    // AS3: _SafeCls_1951.as::handleGhostThrowSnowballAtHuman()
    private handleGhostThrowSnowballAtHuman(
        data: HumanThrowsSnowballAtHumanEventData
    ): HumanThrowsSnowballAtHumanEvent | null
    {
        if(!this._engine?.isGhostEnabled) return null;

        const stage = this._engine.gameArena?.getCurrentStage() ?? null;
        const target = stage?.getGameObject(data.targetHumanGameObjectId) as HumanGameObject | null;

        if(data.humanGameObjectId !== this._engine.ownId) return null;

        const ghost = this._engine.getGhostPlayer();

        if(!ghost || !target) return null;

        return new HumanThrowsSnowballAtHumanEvent(ghost, target, data.trajectory);
    }

    // AS3: _SafeCls_1951.as::handleGhostStartsToMakeASnowball()
    private handleGhostStartsToMakeASnowball(
        data: HumanStartsToMakeASnowballEventData
    ): HumanStartsToMakeASnowballEvent | null
    {
        if(!this._engine?.isGhostEnabled) return null;
        if(data.humanGameObjectId !== this._engine.ownId) return null;

        const ghost = this._engine.getGhostPlayer();

        if(!ghost) return null;

        return new HumanStartsToMakeASnowballEvent(ghost);
    }

    // AS3: _SafeCls_1951.as::onGameChat()
    private onGameChat(event: Game2GameChatFromPlayerMessageEvent): void
    {
        const parser = event.getParser<Game2GameChatFromPlayerMessageEventParser>();

        this._engine?.addChatMessage(parser.userId, parser.chatMessage);
    }

    /**
     * The HC subscription reply. Buying club changes how many games the account has, so this
     * re-asks — and opens the games window unless a lobby is already up.
     */
    // AS3: _SafeCls_1951.as::onSubscriptionStatus()
    private onSubscriptionStatus(): void
    {
        if(this._engine === null) return;

        this._engine.send(new Game2GetAccountGameStatusMessageComposer(0));

        if(this._engine.mainView?.gameLobbyWindowActive) return;
        if(this._engine.gameCenterEnabled) return;

        this._engine.mainView?.openMainWindow(false);
    }

    // AS3: _SafeCls_1951.as::onRoomEnter()
    private onRoomEnter(): void
    {
        this._engine?.promoteGame();
    }

    // AS3: _SafeCls_1951.as::onFriendsLeaderboard()
    private onFriendsLeaderboard(event: Game2FriendsLeaderboardEvent): void
    {
        const parser = event.getParser<Game2LeaderboardParser>();

        this._engine?.leaderboard?.addFriendAllTimeData(parser.leaderboard, parser.totalListSize);
    }

    // AS3: _SafeCls_1951.as::onTotalLeaderboard()
    private onTotalLeaderboard(event: Game2TotalLeaderboardEvent): void
    {
        const parser = event.getParser<Game2LeaderboardParser>();

        this._engine?.leaderboard?.addAllTimeData(parser.leaderboard, parser.totalListSize);
    }

    // AS3: _SafeCls_1951.as::onTotalGroupLeaderboard()
    private onTotalGroupLeaderboard(event: Game2TotalGroupLeaderboardEvent): void
    {
        const parser = event.getParser<Game2GroupLeaderboardParser>();

        this._engine?.leaderboard?.addAllTimeGroupData(
            parser.leaderboard, parser.totalListSize, parser.favouriteGroupId
        );
    }

    // AS3: _SafeCls_1951.as::onWeeklyGroupLeaderboard()
    private onWeeklyGroupLeaderboard(event: Game2WeeklyGroupLeaderboardEvent): void
    {
        const parser = event.getParser<Game2WeeklyGroupLeaderboardParser>();

        this._engine?.leaderboard?.addWeeklyGroupData(
            parser.year,
            parser.week,
            parser.leaderboard,
            parser.totalListSize,
            parser.maxOffset,
            parser.minutesUntilReset,
            parser.favouriteGroupId
        );
    }

    // AS3: _SafeCls_1951.as::onWeeklyLeaderboard()
    private onWeeklyLeaderboard(event: Game2WeeklyLeaderboardEvent): void
    {
        const parser = event.getParser<Game2WeeklyLeaderboardParser>();

        this._engine?.leaderboard?.addWeeklyData(
            parser.year,
            parser.week,
            parser.leaderboard,
            parser.totalListSize,
            parser.maxOffset,
            parser.minutesUntilReset
        );
    }

    // AS3: _SafeCls_1951.as::onWeeklyFriendsLeaderboard()
    private onWeeklyFriendsLeaderboard(event: Game2WeeklyFriendsLeaderboardEvent): void
    {
        const parser = event.getParser<Game2WeeklyLeaderboardParser>();

        this._engine?.leaderboard?.addFriendWeeklyData(
            parser.year,
            parser.week,
            parser.leaderboard,
            parser.totalListSize,
            parser.maxOffset,
            parser.minutesUntilReset
        );
    }

    // AS3: _SafeCls_1951.as::dispose()
    public dispose(): void
    {
        this._engine = null;
        this._disposed = true;
    }
}
