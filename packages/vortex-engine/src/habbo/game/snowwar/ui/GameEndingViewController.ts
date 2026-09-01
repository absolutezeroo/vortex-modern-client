import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {OrderedMap} from '@core/utils/OrderedMap';
import {Logger} from '@core/utils/Logger';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import {AvatarTextureUtils} from '@habbo/avatar/AvatarTextureUtils';
import {EventLogMessageComposer} from '@habbo/communication/messages/outgoing/tracking/EventLogMessageComposer';
import {
    Game2ExitGameMessageComposer
} from '@habbo/communication/messages/outgoing/game/arena/Game2ExitGameMessageComposer';
import {
    Game2GetAccountGameStatusMessageComposer
} from '@habbo/communication/messages/outgoing/game/directory/Game2GetAccountGameStatusMessageComposer';
import {
    Game2LeaveGameMessageComposer
} from '@habbo/communication/messages/outgoing/game/directory/Game2LeaveGameMessageComposer';
import {
    GetGuestRoomMessageComposer
} from '@habbo/communication/messages/outgoing/navigator/GetGuestRoomMessageComposer';
import type {Game2GameResult} from '@habbo/communication/messages/parser/game/snowwar/data/Game2GameResult';
import type {
    Game2SnowWarGameStats
} from '@habbo/communication/messages/parser/game/snowwar/data/Game2SnowWarGameStats';
import type {
    Game2TeamPlayerData
} from '@habbo/communication/messages/parser/game/snowwar/data/Game2TeamPlayerData';
import type {
    Game2TeamScoreData
} from '@habbo/communication/messages/parser/game/snowwar/data/Game2TeamScoreData';
import type {GameLobbyData} from '@habbo/communication/messages/parser/game/snowwar/data/GameLobbyData';
import {GameLobbyPlayerData} from '@habbo/communication/messages/parser/game/snowwar/data/GameLobbyPlayerData';
import type {SnowWarEngine} from '../SnowWarEngine';
import {SnowWarAnimatedWindowElement} from '../utils/SnowWarAnimatedWindowElement';
import {WindowUtils} from '../utils/WindowUtils';
import {BackgroundViewController} from './BackgroundViewController';

const log = Logger.getLogger('habbo.game.snowwar.ui.GameEndingViewController');

/**
 * The panel after a game, which is also the panel *between* games: results, then a rematch lobby,
 * then the loading screen for the next arena — all in the one `snowwar_ending` window, switched by
 * `_state`.
 *
 * That is why so much of this class is hiding things. `changeToWaitState()` strips the scores and
 * throws out everyone who did not ask for a rematch; `changeToLobbyState()` empties the lists
 * entirely and rebuilds them from the new lobby. Nothing is rebuilt from scratch because the window
 * is also the one the chat is drawn over.
 *
 * `_buyButtonMode` is a constant 1 in this build — the "get VIP" arm — so the "buy games" arm of
 * every switch on it is unreachable. It is ported as written rather than folded away: it is a live
 * field in AS3 with a setter nowhere, and collapsing it would hide that.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/ui/GameEndingViewController.as
 */
export class GameEndingViewController implements IDisposable, IAvatarImageListener
{
    // AS3: GameEndingViewController.as::NUMBER_OF_TEAMS
    private static readonly NUMBER_OF_TEAMS: number = 2;

    // AS3: GameEndingViewController.as::STATE_RESULTS
    private static readonly STATE_RESULTS: number = 0;

    // AS3: GameEndingViewController.as::STATE_RESULTS_PENDING_REMATCH
    private static readonly STATE_RESULTS_PENDING_REMATCH: number = 1;

    // AS3: GameEndingViewController.as::STATE_WAITING
    private static readonly STATE_WAITING: number = 2;

    // AS3: GameEndingViewController.as::STATE_LOBBY
    private static readonly STATE_LOBBY: number = 3;

    // AS3: GameEndingViewController.as::STATE_LOADING
    private static readonly STATE_LOADING: number = 4;

    // AS3: GameEndingViewController.as::STATE_AFTER_SKI
    private static readonly STATE_AFTER_SKI: number = 5;

    /** Derived name — `_SafeStr_10949`; the only value `_buyButtonMode` ever holds. */
    // AS3: GameEndingViewController.as::_SafeStr_10949
    private static readonly BUY_BUTTON_MODE_VIP: number = 1;

    // AS3: GameEndingViewController.as::_window
    private _window: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_4581`, the engine. */
    // AS3: GameEndingViewController.as::_SafeStr_4581
    private _engine: SnowWarEngine | null;

    // AS3: GameEndingViewController.as::_SafeStr_5769
    private _disposed: boolean = false;

    // AS3: GameEndingViewController.as::_teams
    private _teams: Game2TeamScoreData[] | null;

    /** AS3 keeps this in a `Dictionary` keyed by user id; a `Map` is the same thing here. */
    // AS3: GameEndingViewController.as::_players
    private _players: Map<number, Game2TeamPlayerData> | null;

    /** Derived name — `_SafeStr_6792`. */
    // AS3: GameEndingViewController.as::_SafeStr_6792
    private _background: BackgroundViewController | null = null;

    /** Derived name — `_SafeStr_6782`. */
    // AS3: GameEndingViewController.as::_SafeStr_6782
    private _gameResult: Game2GameResult | null;

    /** Derived name — `_SafeStr_5892`; the one-second countdown shared by all three states. */
    // AS3: GameEndingViewController.as::_SafeStr_5892
    private _countdownTimer: ReturnType<typeof setInterval> | null = null;

    /** Derived name — `_SafeStr_5069`; seconds left on whichever countdown is running. */
    // AS3: GameEndingViewController.as::_SafeStr_5069
    private _countdown: number = 0;

    /** Derived name — `_SafeStr_4597`; one of the six `STATE_*`. */
    // AS3: GameEndingViewController.as::_SafeStr_4597
    private _state: number = GameEndingViewController.STATE_RESULTS;

    // AS3: GameEndingViewController.as::_lobbyPlayers
    private _lobbyPlayers: OrderedMap<number, GameLobbyPlayerData> | null = null;

    /** Derived name — `_SafeStr_5414`; the rematch glow behind each player who opted in. */
    // AS3: GameEndingViewController.as::_SafeStr_5414
    private _rematchGlows: OrderedMap<IBitmapWrapperWindow, SnowWarAnimatedWindowElement> | null;

    // AS3: GameEndingViewController.as::_buyButtonMode
    private _buyButtonMode: number = GameEndingViewController.BUY_BUTTON_MODE_VIP;

    // AS3: GameEndingViewController.as::GameEndingViewController()
    constructor(
        engine: SnowWarEngine,
        teams: Game2TeamScoreData[],
        stats: Game2SnowWarGameStats | null,
        gameResult: Game2GameResult | null,
        countdown: number
    )
    {
        this._teams = teams;
        this._players = new Map<number, Game2TeamPlayerData>();
        this._engine = engine;
        this._gameResult = gameResult;
        this._rematchGlows = new OrderedMap<IBitmapWrapperWindow, SnowWarAnimatedWindowElement>();

        if(engine.roomUI) engine.roomUI.visible = false;

        const desktop = engine.windowManager?.getDesktop(1) ?? null;

        if(desktop) desktop.visible = false;

        this._background = new BackgroundViewController(engine);

        const background = this._background.background;

        if(background) background.visible = true;

        this.createMainView();

        for(const team of teams) this.addTeamScores(team);

        const information = this.getElement(this._window, 'endingInformation');

        // resultType 2 is the draw; anything else names a winning team.
        if(this._gameResult?.resultType === 2)
        {
            WindowUtils.colorStrokes(information?.parent ?? null, this.getNeutralTeamColor());
            WindowUtils.setCaption(information, '${snowwar.result.tie}');
        }
        else
        {
            WindowUtils.colorStrokes(information?.parent ?? null, this.getTeamColor(this._gameResult?.winnerId ?? 1));
            WindowUtils.setCaption(information, `\${snowwar.team_${this._gameResult?.winnerId ?? 1}_wins}`);
        }

        this.showMostHits(stats?.playerWithMostHits ?? -1);
        this.showMostKills(stats?.playerWithMostKills ?? -1);
        this.startResultsCountDown(countdown);

        if(engine.hasUnlimitedGames)
        {
            WindowUtils.hideElement(this._window, 'statusContainer');
        }
        else
        {
            WindowUtils.showElement(this._window, 'statusContainer');
            engine.communication?.connection?.send(new Game2GetAccountGameStatusMessageComposer(0));
        }

        this.updateGamesLeft();
    }

    // AS3: GameEndingViewController.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: GameEndingViewController.as::createMainView()
    private createMainView(): void
    {
        this._window = WindowUtils.createWindow('snowwar_ending') as IWindowContainer | null;

        if(!this._window) return;

        this._window.x = ((this._window.desktop?.width ?? 0) - this._window.width) / 2;
        this._window.y = (this._window.desktop?.height ?? 0) > 685 ? 115 : 10;

        const leaveLink = this._window.findChildByName('leave_link_region');

        if(leaveLink) leaveLink.procedure = (event: WindowEvent): void => this.onCancel(event);

        this._window.findChildByName('button_rematch')
            ?.addEventListener(WindowMouseEvent.CLICK, () => this.onJoinRematch());
        this._window.findChildByName('button_play_again')
            ?.addEventListener(WindowMouseEvent.CLICK, () => this.onPlayAgain());
        this._window.findChildByName('button_buy_games')
            ?.addEventListener(WindowMouseEvent.CLICK, () => this.onGetMore());

        const loadingContainer = this._window.findChildByName('loadingContainer');

        if(loadingContainer) loadingContainer.visible = false;

        this._window.findChildByName('statusContainer')
            ?.addEventListener(WindowMouseEvent.CLICK, () => this.onGetMore());
    }

    // AS3: GameEndingViewController.as::onJoinRematch()
    private onJoinRematch(): void
    {
        if(this._engine?.freeGamesLeft === 0)
        {
            this.onGetMore();

            return;
        }

        this._state = GameEndingViewController.STATE_RESULTS_PENDING_REMATCH;
        this._engine?.sendRejoinGame();

        const button = this._window?.findChildByName('button_rematch') ?? null;

        if(button)
        {
            button.color = 13421772;
            button.disable();
        }

        const status = this._window?.findChildByName('statusContainer') ?? null;

        if(status) status.visible = false;
    }

    // AS3: GameEndingViewController.as::onPlayAgain()
    private onPlayAgain(): void
    {
        this._engine?.startQuickServerGame();

        const playAgain = this._window?.findChildByName('button_play_again') ?? null;
        const status = this._window?.findChildByName('statusContainer') ?? null;

        if(playAgain) playAgain.visible = false;
        if(status) status.visible = false;
    }

    // AS3: GameEndingViewController.as::updateGettingMoreGamesOption()
    private updateGettingMoreGamesOption(): void
    {
        const rematch = this._window?.findChildByName('button_rematch') ?? null;
        const buyGames = this._window?.findChildByName('button_buy_games') ?? null;
        const getVip = this._window?.findChildByName('status.text_get_vip') ?? null;
        const getMoreGames = this._window?.findChildByName('status.text_get_more_games') ?? null;

        if(rematch) rematch.visible = false;
        if(buyGames) buyGames.visible = false;
        if(getVip) getVip.visible = false;
        if(getMoreGames) getMoreGames.visible = false;

        if(this._buyButtonMode === GameEndingViewController.BUY_BUTTON_MODE_VIP)
        {
            if(rematch) rematch.visible = true;
            if(getVip) getVip.visible = true;

            return;
        }

        if(this._engine?.freeGamesLeft === 0)
        {
            if(buyGames) buyGames.visible = true;
        }
        else if(rematch)
        {
            rematch.visible = true;
        }

        if(getMoreGames) getMoreGames.visible = true;
    }

    // AS3: GameEndingViewController.as::onCancel()
    private onCancel(event: WindowEvent): void
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this.onClose(true);
    }

    /**
     * Leaving, and what it means depends on where the panel had got to: out of a rematch lobby it
     * leaves the *game* and goes back to the old room; after the ski it only goes back; from the
     * results it exits the arena.
     */
    // AS3: GameEndingViewController.as::onClose()
    public onClose(leaveGame: boolean): void
    {
        if(!leaveGame || !this._engine) return;

        const connection = this._engine.communication?.connection ?? null;

        this._engine.gameCancelled(true);

        if(this._state === GameEndingViewController.STATE_LOBBY || this._state === GameEndingViewController.STATE_WAITING)
        {
            connection?.send(new Game2LeaveGameMessageComposer());

            if(this._engine.roomBeforeGame > -1)
            {
                connection?.send(new GetGuestRoomMessageComposer(this._engine.roomBeforeGame, false, true));
            }
        }
        else if(this._state === GameEndingViewController.STATE_AFTER_SKI)
        {
            if(this._engine.roomBeforeGame > -1)
            {
                connection?.send(new GetGuestRoomMessageComposer(this._engine.roomBeforeGame, false, true));
            }
            else
            {
                connection?.send(new Game2ExitGameMessageComposer());
            }
        }
        else
        {
            connection?.send(new Game2ExitGameMessageComposer());
        }

        this.disposeCountDownTimer();
    }

    // AS3: GameEndingViewController.as::addTeamScores()
    private addTeamScores(team: Game2TeamScoreData): void
    {
        for(const player of team.players) this.addPlayerScore(player);

        WindowUtils.setCaption(this.getElement(this._window, `team${team.teamReference}Score`), `${team.score}`);
    }

    /**
     * One result row. The list item is *named* after the player (`player<userId>`), which is how
     * `playerRematches()` and the two state changes find it again later.
     */
    // AS3: GameEndingViewController.as::addPlayerScore()
    private addPlayerScore(player: Game2TeamPlayerData): void
    {
        this._players?.set(player.userId, player);

        const list = this._window?.findChildByName(`team${player.teamId}PlayersList`) as IItemListWindow | null;
        const row = WindowUtils.createWindow(`snowwar_results_player_team_${player.teamId}`) as IItemListWindow | null;

        if(!list || !row) return;

        const imageContainer = row.getListItemByName('playerImageContainer') as IWindowContainer | null;
        const dataContainer = row.getListItemByName('playerDataContainer') as IWindowContainer | null;
        const scoreContainer = row.getListItemByName('playerScoreContainer') as IWindowContainer | null;

        WindowUtils.setElementImage(
            this.getElement(imageContainer, 'playerImage'),
            this.getAvatarFigure(player.teamId, player.figure, player.gender),
            0,
            0,
            0
        );
        WindowUtils.setCaption(this.getElement(dataContainer, 'playerName'), player.userName);
        WindowUtils.hideElement(dataContainer, 'playerTotalStats');
        WindowUtils.setCaption(this.getElement(dataContainer, 'playerHits'), `${player.playerStats?.snowballHits ?? 0}`);
        WindowUtils.setCaption(this.getElement(dataContainer, 'playerKills'), `${player.playerStats?.kills ?? 0}`);
        WindowUtils.setCaption(this.getElement(scoreContainer, 'playerScore'), `${player.score}`);

        const addFriend = imageContainer?.findChildByName('addFriend') as IWindowContainer | null;
        const canAsk = this._engine?.friendList?.canBeAskedForAFriend(player.userId) ?? false;

        if(addFriend && canAsk && player.userId !== this._engine?.sessionDataManager?.userId)
        {
            addFriend.id = player.userId;

            const icon = addFriend.getChildAt(0);

            if(icon) icon.id = player.teamId;

            addFriend.addEventListener(WindowMouseEvent.CLICK, (event) => this.onAddFriendClick(event as WindowMouseEvent));
            addFriend.addEventListener(WindowMouseEvent.OVER, (event) => this.onAddFriendOver(event as WindowMouseEvent));
            addFriend.addEventListener(WindowMouseEvent.OUT, (event) => this.onAddFriendOut(event as WindowMouseEvent));
            addFriend.visible = true;
        }

        list.addListItem(row);
        row.name = `player${player.userId}`;
    }

    // AS3: GameEndingViewController.as::onAddFriendClick()
    private onAddFriendClick(event: WindowMouseEvent): void
    {
        const userId = event.window?.id ?? 0;
        const player = this._players?.get(userId) ?? null;

        if(player)
        {
            this._engine?.friendList?.askForAFriend(userId, player.userName);
            this._engine?.communication?.connection?.send(
                new EventLogMessageComposer('GameFramework', 'SnowStorm', 'gameFramework.sendFriendRequest.rematchView')
            );
            this._engine?.addChatMessage(userId, '${snowwar.friend_request.sent}', true);
        }

        if(event.window) event.window.visible = false;
    }

    // AS3: GameEndingViewController.as::onAddFriendOver()
    private onAddFriendOver(event: WindowMouseEvent): void
    {
        const icon = (event.window as IWindowContainer | null)?.getChildAt(0) ?? null;

        WindowUtils.setElementImage(icon, this.getBitmap('add_friend_icon_green'));
    }

    // AS3: GameEndingViewController.as::onAddFriendOut()
    private onAddFriendOut(event: WindowMouseEvent): void
    {
        const icon = (event.window as IWindowContainer | null)?.getChildAt(0) ?? null;

        if(!icon) return;

        WindowUtils.setElementImage(icon, this.getBitmap(`add_friend_icon_${icon.id === 1 ? 'blue' : 'red'}`));
    }

    /** The banner is hidden rather than shown empty when the best score is zero. */
    // AS3: GameEndingViewController.as::showMostHits()
    private showMostHits(userId: number): void
    {
        const player = this._players?.get(userId) ?? null;

        if(player === null) return;

        const container = this._window?.findChildByName('mostHitsContainer') as IWindowContainer | null;

        if(!container) return;

        if((player.playerStats?.snowballHits ?? 0) === 0)
        {
            container.visible = false;

            return;
        }

        this.fillBestPlayerBanner(container, player);
    }

    // AS3: GameEndingViewController.as::showMostKills()
    private showMostKills(userId: number): void
    {
        const player = this._players?.get(userId) ?? null;

        if(player === null) return;

        const container = this._window?.findChildByName('mostKillsContainer') as IWindowContainer | null;

        if(!container) return;

        if((player.playerStats?.kills ?? 0) === 0)
        {
            container.visible = false;

            return;
        }

        this.fillBestPlayerBanner(container, player);
    }

    // TS-only: the four lines `showMostHits()` and `showMostKills()` share verbatim in AS3.
    private fillBestPlayerBanner(container: IWindowContainer, player: Game2TeamPlayerData): void
    {
        WindowUtils.setElementImage(
            this.getElement(container, 'backgroundImage'),
            this.getBitmap(this.getPlayerImageBackground(player.teamId))
        );
        WindowUtils.setElementImage(
            this.getElement(container, 'playerImage'),
            this.getAvatarFigure(player.teamId, player.figure, player.gender),
            0,
            0,
            0
        );
        WindowUtils.setCaption(this.getElement(container, 'playerName'), player.userName);
        WindowUtils.colorStrokes(container, this.getTeamColor(player.teamId));
    }

    // AS3: GameEndingViewController.as::getPlayerImageBackground()
    private getPlayerImageBackground(teamId: number): string
    {
        return teamId === 2 ? 'red_square' : 'blue_square';
    }

    // AS3: GameEndingViewController.as::getNeutralTeamColor()
    private getNeutralTeamColor(): number
    {
        return 8227482;
    }

    // AS3: GameEndingViewController.as::getTeamColor()
    private getTeamColor(teamId: number): number
    {
        return teamId === 2 ? 4294797401 : 4279269292;
    }

    /** Team 2 is drawn facing the other way, the same mirroring the loading screen uses. */
    // AS3: GameEndingViewController.as::getTeamPlayerDirection()
    private getTeamPlayerDirection(teamId: number): number
    {
        return teamId === 2 ? 4 : 2;
    }

    // AS3: GameEndingViewController.as::getAvatarFigure()
    private getAvatarFigure(teamId: number, figure: string, gender: string): ImageBitmap | null
    {
        const container = this._engine?.avatarManager?.createFigureContainer(figure) ?? null;

        if(!container) return null;

        switch(teamId)
        {
            case 1:
                container.updatePart('ch', 20000, [1]);
                break;
            case 2:
                container.updatePart('ch', 20001, [1]);
                break;
            default:
                container.updatePart('ch', 20000, [1]);
        }

        container.removePart('cc');

        const avatarImage = this._engine?.avatarManager?.createAvatarImage(
            container.getFigureString(), 'h_50', gender, this, null
        ) ?? null;

        if(!avatarImage) return null;

        avatarImage.setDirection('full', this.getTeamPlayerDirection(teamId));

        return AvatarTextureUtils.toImageBitmap(avatarImage.getCroppedImage('full'));
    }

    // AS3: GameEndingViewController.as::getElement()
    private getElement(container: IWindowContainer | null, name: string): IWindow | null
    {
        return container !== null ? container.findChildByName(name) : null;
    }

    // AS3: GameEndingViewController.as::getBitmap()
    private getBitmap(name: string): ImageBitmap | null
    {
        return (this._engine?.assets?.getAssetByName(name)?.content ?? null) as ImageBitmap | null;
    }

    /** AS3's body is empty: the results panel does not redraw for a late figure. */
    // AS3: GameEndingViewController.as::avatarImageReady()
    public avatarImageReady(_figureString: string): void
    {
        // Intentionally empty, as in AS3.
    }

    // AS3: GameEndingViewController.as::playerRematches()
    public playerRematches(userId: number): void
    {
        const row = this._window?.findChildByName(`player${userId}`) as IItemListWindow | null;

        if(row === null) return;

        const player = this._players?.get(userId) ?? null;

        if(player === null) return;

        player.willRejoin = true;

        const scoreContainer = row.getListItemByName('playerScoreContainer') as IWindowContainer | null;
        const glow = this.getElement(scoreContainer, 'playerScoreGlow') as IBitmapWrapperWindow | null;

        if(!glow || !this._rematchGlows || this._rematchGlows.hasKey(glow) || !this._engine?.assets) return;

        this._rematchGlows.add(
            glow,
            new SnowWarAnimatedWindowElement(this._engine.assets, glow, 'rematch_', 6, 100, true)
        );
    }

    /**
     * The results turn into a waiting room: everyone who did not opt into the rematch is removed
     * from their list *and* from `_players`, and the score furniture is hidden.
     *
     * `false` means the player themselves is not rematching, and takes the après-ski branch instead.
     */
    // AS3: GameEndingViewController.as::changeToWaitState()
    public changeToWaitState(isRematching: boolean): void
    {
        if(!isRematching)
        {
            this.changeToAfterSkiState();

            return;
        }

        this._state = GameEndingViewController.STATE_WAITING;
        this.stopResultsCountDown();

        const removed: number[] = [];

        for(const player of this._players?.values() ?? [])
        {
            const list = this._window?.findChildByName(`team${player.teamId}PlayersList`) as IItemListWindow | null;
            const row = this._window?.findChildByName(`player${player.userId}`) as IItemListWindow | null;

            if(row === null) return;

            if(!player.willRejoin)
            {
                list?.removeListItem(row);
                removed.push(player.userId);
            }
            else
            {
                const dataContainer = row.getListItemByName('playerDataContainer') as IWindowContainer | null;
                const scoreContainer = row.getListItemByName('playerScoreContainer') as IWindowContainer | null;
                const stats = dataContainer?.findChildByName('playerStats') ?? null;

                if(stats) stats.visible = false;

                WindowUtils.setCaption(this.getElement(dataContainer, 'playerName'), player.userName);
                WindowUtils.hideElement(scoreContainer, 'playerScore');
            }
        }

        for(const userId of removed) this._players?.delete(userId);

        WindowUtils.hideElement(this._window, 'buttonsContainer');
        WindowUtils.hideElement(this._window, 'mostKillsContainer');
        WindowUtils.hideElement(this._window, 'mostHitsContainer');
        WindowUtils.hideElement(this._window, 'team1Score');
        WindowUtils.hideElement(this._window, 'team2Score');
        WindowUtils.setCaption(
            this.getElement(this._window, 'endingInformation'),
            '${snowwar.lobby_waiting_for_more_players}'
        );
    }

    /** Nobody is rematching: the glows stop, the chat goes away, and "play again" takes over. */
    // AS3: GameEndingViewController.as::changeToAfterSkiState()
    private changeToAfterSkiState(): void
    {
        this._state = GameEndingViewController.STATE_AFTER_SKI;

        if(this._rematchGlows)
        {
            for(const glow of this._rematchGlows.values()) glow.dispose();

            this._rematchGlows.reset();
        }

        this.hideChatInput();

        if(this._engine?.freeGamesLeft === 0) return;

        const rematch = this._window?.findChildByName('button_rematch') ?? null;
        const playAgain = this._window?.findChildByName('button_play_again') ?? null;

        if(rematch) rematch.visible = false;

        if(playAgain)
        {
            playAgain.visible = true;
            playAgain.enable();
            playAgain.color = 5622784;
        }
    }

    // AS3: GameEndingViewController.as::updateDialog()
    private updateDialog(): void
    {
        if(this._disposed || !this._window) return;

        const information = this._window.findChildByName('endingInformation') as ITextWindow | null;
        const informationStroke = this._window.findChildByName('endingInformation_stroke') as ITextWindow | null;

        if(information) information.fontSize = 28;
        if(informationStroke) informationStroke.fontSize = 28;

        if(this._engine?.freeGamesLeft === 0)
        {
            WindowUtils.setCaption(this.getElement(this._window, 'button_rematch'), '${catalog.vip.buy.title}');
        }
        else if(this._state === GameEndingViewController.STATE_RESULTS)
        {
            this._engine?.localization?.registerParameter('snowwar.rematch', 'seconds', `${this._countdown}`);
            WindowUtils.setCaption(this.getElement(this._window, 'button_rematch'), '${snowwar.rematch}');
        }
        else if(this._state === GameEndingViewController.STATE_RESULTS_PENDING_REMATCH)
        {
            this._engine?.localization?.registerParameter('snowwar.please_wait', 'seconds', `${this._countdown}`);
            WindowUtils.setCaption(this.getElement(this._window, 'button_rematch'), '${snowwar.please_wait}');
        }
        else if(this._state === GameEndingViewController.STATE_LOBBY)
        {
            this._engine?.localization?.registerParameter(
                'snowwar.lobby_game_start_countdown', 'seconds', `${this._countdown}`
            );
            WindowUtils.setCaption(
                this.getElement(this._window, 'endingInformation'),
                '${snowwar.lobby_game_start_countdown}'
            );

            if(information) information.fontSize = 22;
            if(informationStroke) informationStroke.fontSize = 22;
        }
        else if(this._state === GameEndingViewController.STATE_WAITING)
        {
            WindowUtils.setCaption(
                this.getElement(this._window, 'endingInformation'),
                '${snowwar.lobby_waiting_for_more_players}'
            );

            if(information) information.fontSize = 22;
            if(informationStroke) informationStroke.fontSize = 22;
        }
    }

    // AS3: GameEndingViewController.as::startCountDownTimer()
    private startCountDownTimer(seconds: number): void
    {
        this.disposeCountDownTimer();

        this._countdownTimer = setInterval(() => this.onTick(), 1000);
        this._countdown = seconds;
    }

    // AS3: GameEndingViewController.as::onTick()
    private onTick(): void
    {
        if(this._countdown > 0)
        {
            this._countdown -= 1;
            log.trace(`On results window tick ${this._countdown}`);
            this.updateDialog();
        }
    }

    // AS3: GameEndingViewController.as::startResultsCountDown()
    private startResultsCountDown(seconds: number): void
    {
        this.startCountDownTimer(seconds);
        this.updateDialog();
    }

    // AS3: GameEndingViewController.as::stopResultsCountDown()
    private stopResultsCountDown(): void
    {
        this.disposeCountDownTimer();
        this.updateDialog();
    }

    // AS3: GameEndingViewController.as::startLobbyCountDown()
    public startLobbyCountDown(seconds: number): void
    {
        this._state = GameEndingViewController.STATE_LOBBY;
        this.startCountDownTimer(seconds);
        this.updateDialog();
    }

    // AS3: GameEndingViewController.as::stopLobbyCountDown()
    public stopLobbyCountDown(): void
    {
        this.disposeCountDownTimer();
        this.updateDialog();
    }

    /** The results are cleared out entirely and the panel becomes the next arena's lobby. */
    // AS3: GameEndingViewController.as::changeToLobbyState()
    public changeToLobbyState(lobbyData: GameLobbyData): void
    {
        this._state = GameEndingViewController.STATE_LOBBY;
        this._lobbyPlayers = new OrderedMap<number, GameLobbyPlayerData>();

        const removed: number[] = [];

        for(const player of this._players?.values() ?? [])
        {
            const list = this._window?.findChildByName(`team${player.teamId}PlayersList`) as IItemListWindow | null;
            const row = this._window?.findChildByName(`player${player.userId}`) as IItemListWindow | null;

            if(row === null) return;

            list?.removeListItem(row);
            removed.push(player.userId);
        }

        for(const userId of removed) this._players?.delete(userId);

        const loadingContainer = this._window?.findChildByName('loadingContainer') as IWindowContainer | null;

        if(loadingContainer)
        {
            loadingContainer.visible = true;
            WindowUtils.hideElement(loadingContainer, 'loadingText');
        }

        WindowUtils.setCaption(
            this._window?.findChildByName('arenaName') ?? null,
            this._engine?.getArenaName(lobbyData) ?? ''
        );
        WindowUtils.colorStrokes(this.getElement(this._window, 'headerContainer'), this.getTeamColor(1));
        WindowUtils.setElementImage(
            this._window?.findChildByName('arenaPreview') ?? null,
            this.getBitmap(`arena_${lobbyData.fieldType}_preview`)
        );
    }

    // AS3: GameEndingViewController.as::playerJoined()
    public playerJoined(player: GameLobbyPlayerData | null): void
    {
        if(!player) return;

        this._lobbyPlayers?.add(player.userId, player);
        this.renderLobbyPlayers();
    }

    // AS3: GameEndingViewController.as::playerLeft()
    public playerLeft(userId: number): void
    {
        if(this._lobbyPlayers?.getValue(userId)) this._lobbyPlayers.remove(userId);

        this.renderLobbyPlayers();
    }

    // AS3: GameEndingViewController.as::renderLobbyPlayers()
    private renderLobbyPlayers(): void
    {
        this.clearPlayers();

        const players = this._lobbyPlayers?.getValues() ?? [];

        if(this._state !== GameEndingViewController.STATE_RESULTS
            && this._state !== GameEndingViewController.STATE_RESULTS_PENDING_REMATCH)
        {
            players.sort(GameLobbyPlayerData.COMPARE_BY_SKILL_LEVEL);
        }

        for(const player of players) this.addLobbyPlayer(player);
    }

    // AS3: GameEndingViewController.as::clearPlayers()
    private clearPlayers(): void
    {
        let team = 1;

        for(;;)
        {
            const list = this._window?.findChildByName(`team${team++}PlayersList`) as IItemListWindow | null;

            if(list === null) break;

            list.destroyListItems();
        }
    }

    /**
     * Lobby rows alternate teams by *arrival order*, not by the team the player is actually on —
     * `index % 2 + 1` — because the next game's teams are not decided yet.
     */
    // AS3: GameEndingViewController.as::addLobbyPlayer()
    private addLobbyPlayer(player: GameLobbyPlayerData): void
    {
        log.trace(`Add Lobby Player: ${player.name}, ${player.userId}, ${player.teamId}`);

        const teamSlot = ((this._lobbyPlayers?.getKeys() ?? []).indexOf(player.userId) % 2) + 1;
        const list = this._window?.findChildByName(`team${teamSlot}PlayersList`) as IItemListWindow | null;

        if(list === null) return;

        const row = WindowUtils.createWindow(`snowwar_lobby_player_team_${teamSlot}`) as IItemListWindow | null;

        if(row === null) return;

        const imageContainer = row.getListItemByName('playerImageContainer') as IWindowContainer | null;
        const dataContainer = row.getListItemByName('playerDataContainer') as IWindowContainer | null;
        const scoreContainer = row.getListItemByName('playerScoreContainer') as IWindowContainer | null;

        WindowUtils.setElementImage(
            this.getElement(imageContainer, 'playerImage'),
            this.getAvatarFigure(teamSlot, player.figure, player.gender)
        );
        WindowUtils.setCaption(this.getElement(dataContainer, 'playerName'), player.name);
        WindowUtils.hideElement(dataContainer, 'playerStats');
        WindowUtils.hideElement(scoreContainer, 'playerScore');
        WindowUtils.hideElement(dataContainer, 'playerTotalStats');

        const skillLevel = dataContainer?.findChildByName('skillLevel') as IBitmapWrapperWindow | null;

        if(skillLevel)
        {
            skillLevel.bitmap?.close();
            skillLevel.bitmap = this.getSkillLevelImage(player.skillLevel, teamSlot);
        }

        const scoreTooltip = dataContainer?.findChildByName('scoreTooltip') as IInteractiveWindow | null;

        if(scoreTooltip)
        {
            scoreTooltip.toolTipCaption = `${player.totalScore}/${player.scoreToNextLevel}`;
            scoreTooltip.visible = true;
        }

        list.addListItem(row);
    }

    /** The same ten-star strip `GameLoadingViewController` draws; AS3 repeats it in both classes. */
    // AS3: GameEndingViewController.as::getSkillLevelImage()
    private getSkillLevelImage(skillLevel: number, teamId: number): ImageBitmap | null
    {
        const level = Math.min(skillLevel, 30);
        const empty = this.getBitmap('star_empty');
        const bronze = this.getBitmap('star_filled_bronze');
        const silver = this.getBitmap('star_filled_silver');
        const gold = this.getBitmap('star_filled_gold');

        if(!empty) return null;

        const canvas = new OffscreenCanvas(150, 13);
        const context = canvas.getContext('2d');

        if(context === null) return null;

        let remaining = level > 0 ? ((level - 1) % 10) + 1 : 0;

        for(let i = 0; i < 10; i++)
        {
            const x = teamId === 1 ? i * 15 : (9 - i) * 15;
            const filled = level > 20 ? gold : (level > 10 ? silver : bronze);
            const star = remaining-- > 0 ? (filled ?? empty) : empty;

            context.drawImage(star, x, 0);
        }

        return canvas.transferToImageBitmap();
    }

    // AS3: GameEndingViewController.as::updateGamesLeft()
    public updateGamesLeft(): void
    {
        const buttons = this._window?.findChildByName('buttonsContainer') as IWindowContainer | null;
        const status = this._window?.findChildByName('statusContainer') as IWindowContainer | null;

        if(!buttons || !status) return;

        buttons.visible = true;

        WindowUtils.setCaption(status.findChildByName('games_left'), `${this._engine?.freeGamesLeft ?? 0}`);

        const stroke = status.findChildByName('games_left_stroke') as ITextWindow | null;
        const rematch = this._window?.findChildByName('button_rematch') ?? null;

        this.updateGettingMoreGamesOption();

        if(this._engine?.hasUnlimitedGames)
        {
            rematch?.enable();

            if(rematch) rematch.color = 5622784;

            status.visible = false;

            return;
        }

        switch(this._engine?.freeGamesLeft ?? 0)
        {
            case -1:
                rematch?.enable();

                if(rematch) rematch.color = 5622784;

                status.visible = false;
                break;
            case 0:
                if(stroke) stroke.textColor = 0xFF0000;

                rematch?.enable();

                if(rematch) rematch.color = 5622784;
                break;
            default:
                if(stroke) stroke.textColor = 1079212;

                rematch?.enable();

                if(rematch) rematch.color = 5622784;
        }
    }

    // AS3: GameEndingViewController.as::onGetMore()
    private onGetMore(): void
    {
        if(this._buyButtonMode === GameEndingViewController.BUY_BUTTON_MODE_VIP)
        {
            this.onClose(true);
            this._engine?.openClubCenter('gameFramework.getVip.clicked.rematchView');

            return;
        }

        this._engine?.openGetMoreGames('gameFramework.buyTokens.clicked.rematchView');
    }

    // AS3: GameEndingViewController.as::hideChatInput()
    private hideChatInput(): void
    {
        this._engine?.roomUI?.hideWidget('RWE_CHAT_INPUT_WIDGET');
    }

    // AS3: GameEndingViewController.as::disposeCountDownTimer()
    private disposeCountDownTimer(): void
    {
        if(this._countdownTimer)
        {
            clearInterval(this._countdownTimer);
            this._countdownTimer = null;
            this._countdown = 0;
        }
    }

    // AS3: GameEndingViewController.as::dispose()
    public dispose(): void
    {
        const desktop = this._engine?.windowManager?.getDesktop(1) ?? null;

        if(desktop) desktop.visible = true;

        this.disposeCountDownTimer();

        if(this._rematchGlows)
        {
            for(const glow of this._rematchGlows.values()) glow.dispose();

            this._rematchGlows.dispose();
            this._rematchGlows = null;
        }

        if(this._background)
        {
            this._background.dispose();
            this._background = null;
        }

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        this._teams = null;
        this._players = null;
        this._gameResult = null;
        this._engine = null;
        this._disposed = true;
    }
}
