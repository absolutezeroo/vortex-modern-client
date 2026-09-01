import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';
import type {SnowWarEngine} from '../SnowWarEngine';
import {SnowWarAnimatedWindowElement} from '../utils/SnowWarAnimatedWindowElement';
import {WindowUtils} from '../utils/WindowUtils';
import {GameLobbyWindowCtrl} from './GameLobbyWindowCtrl';

const log = Logger.getLogger('habbo.game.snowwar.ui.GamesMainViewController');

/**
 * The games window: the front page with the play button, the five-page instruction flipbook, and
 * the lobby view that replaces it once a game is joined.
 *
 * The two panels — `quick_play_container` and the lobby — live in the same root window and are
 * swapped by visibility, which is why `openMainWindow()` and `openGameLobbyWindow()` both build the
 * root if it is missing and then hide the other one.
 *
 * The play button carries three states at once: how many free games are left, whether the player is
 * blocked, and whether they have unlimited games. `updateGameStartingStatus()` is the single place
 * that resolves them, and `checkGameAmountStatus()` returning false is what stops the block
 * countdown from overwriting the "buy more" label.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/ui/GamesMainViewController.as
 */
export class GamesMainViewController implements IDisposable
{
    // AS3: GamesMainViewController.as::INSTRUCTION_FRAME_LENGTH
    private static readonly INSTRUCTION_FRAME_LENGTH: number = 1000;

    // AS3: GamesMainViewController.as::INSTRUCTION_ASSETS
    private static readonly INSTRUCTION_ASSETS: string[] = ['move_', 'throw_1_', 'throw_2_', 'throw_3_', 'balls_'];

    // AS3: GamesMainViewController.as::INSTRUCTION_FRAME_COUNTS
    private static readonly INSTRUCTION_FRAME_COUNTS: number[] = [4, 4, 5, 5, 5];

    /** Derived name — `_SafeStr_4581`, the engine. */
    // AS3: GamesMainViewController.as::_SafeStr_4581
    private _engine: SnowWarEngine | null;

    /** Derived name — `_SafeStr_5051`; the root window both panels sit in. */
    // AS3: GamesMainViewController.as::_SafeStr_5051
    private _rootWindow: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_4565`; the front page. */
    // AS3: GamesMainViewController.as::_SafeStr_4565
    private _quickPlayContainer: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_4817`. */
    // AS3: GamesMainViewController.as::_SafeStr_4817
    private _lobbyView: GameLobbyWindowCtrl | null = null;

    // AS3: GamesMainViewController.as::_SafeStr_5769
    private _disposed: boolean = false;

    /** Derived name — `_SafeStr_5725`; the instruction flipbook, one page at a time. */
    // AS3: GamesMainViewController.as::_SafeStr_5725
    private _instructionAnimation: SnowWarAnimatedWindowElement | null = null;

    /** Derived name — `_SafeStr_5741`; the one-second block countdown. */
    // AS3: GamesMainViewController.as::_SafeStr_5741
    private _blockTimer: ReturnType<typeof setInterval> | null = null;

    /** Derived name — `_SafeStr_5009`; seconds of block left. */
    // AS3: GamesMainViewController.as::_SafeStr_5009
    private _blockSecondsLeft: number = 0;

    /** Derived name — `_SafeStr_4891`; which instruction page is showing, 0-based. */
    // AS3: GamesMainViewController.as::_SafeStr_4891
    private _instructionPage: number = 0;

    // AS3: GamesMainViewController.as::GamesMainViewController()
    constructor(engine: SnowWarEngine)
    {
        this._engine = engine;
    }

    // AS3: GamesMainViewController.as::get gameEngine()
    public get gameEngine(): SnowWarEngine | null
    {
        return this._engine;
    }

    // AS3: GamesMainViewController.as::get rootWindow()
    public get rootWindow(): IWindowContainer | null
    {
        return this._rootWindow;
    }

    // AS3: GamesMainViewController.as::get lobbyView()
    public get lobbyView(): GameLobbyWindowCtrl | null
    {
        return this._lobbyView;
    }

    // AS3: GamesMainViewController.as::get gameLobbyWindowActive()
    public get gameLobbyWindowActive(): boolean
    {
        return this._lobbyView !== null && this._lobbyView.visible;
    }

    // AS3: GamesMainViewController.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: GamesMainViewController.as::toggleVisibility()
    public toggleVisibility(): void
    {
        if(this._rootWindow) this._rootWindow.visible = !this._rootWindow.visible;
        else this.openMainWindow(true);
    }

    // AS3: GamesMainViewController.as::createWindow()
    private createWindow(): void
    {
        this._rootWindow = WindowUtils.createWindow('games_main', 1) as IWindowContainer | null;

        if(!this._rootWindow) return;

        this._rootWindow.findChildByTag('close')?.addEventListener(WindowMouseEvent.CLICK, () => this.close(true));
        this._rootWindow.visible = true;
        this._rootWindow.center();

        this._quickPlayContainer = this._rootWindow.findChildByName('quick_play_container') as IWindowContainer | null;

        if(!this._quickPlayContainer) return;

        this._quickPlayContainer.findChildByName('play.button')
            ?.addEventListener(WindowMouseEvent.CLICK, () => this.onPlay());
        this._quickPlayContainer.visible = false;
        this._quickPlayContainer.findChildByName('instructions_link')
            ?.addEventListener(WindowMouseEvent.CLICK, () => this.showInstructions(true));
        this._quickPlayContainer.findChildByName('leaderboard_link')
            ?.addEventListener(WindowMouseEvent.CLICK, () => this._engine?.showLeaderboard());
        this._quickPlayContainer.findChildByName('instructions_back')
            ?.addEventListener(WindowMouseEvent.CLICK, () => this.showInstructions(false));
        this._quickPlayContainer.findChildByName('instructions_next')
            ?.addEventListener(WindowMouseEvent.CLICK, () => this.onNext());
        this._quickPlayContainer.findChildByName('instructions_prev')
            ?.addEventListener(WindowMouseEvent.CLICK, () => this.onPrevious());
        this._quickPlayContainer.findChildByName('games_vip_region')
            ?.addEventListener(WindowMouseEvent.CLICK, () => this._engine?.openClubCenter('gameFramework.getVip.clicked.frontView'));

        this._quickPlayContainer.procedure = (event: WindowEvent, window: IWindow): void =>
            this.windowEventProc(event, window);

        const leaderboardLink = this._quickPlayContainer.findChildByName('leaderboard_link');

        if(leaderboardLink)
        {
            leaderboardLink.visible = this._engine?.config?.getBoolean('games.highscores.enabled') ?? false;
        }

        const pageList = this._quickPlayContainer.findChildByName('page_list') as IItemListWindow | null;

        if(pageList)
        {
            for(let i = 0; i < pageList.numListItems; i++)
            {
                pageList.getListItemAt(i)
                    ?.addEventListener(WindowMouseEvent.CLICK, (event) => this.onSelectPage(event as WindowMouseEvent));
            }
        }

        this._disposed = false;
        this.updateGameStartingStatus();
    }

    /**
     * The three token-bundle buttons, hover art and all, driven off the container's own procedure
     * rather than per-button listeners — the layout names them and nothing else does.
     */
    // AS3: GamesMainViewController.as::windowEventProc()
    private windowEventProc(event: WindowEvent, window: IWindow): void
    {
        if(event.type === WindowMouseEvent.OVER || event.type === WindowMouseEvent.OUT)
        {
            const suffix = event.type === WindowMouseEvent.OVER ? '_hi' : '';

            switch(window.name)
            {
                case 'btn_more_games_10':
                case 'btn_more_games_100':
                case 'btn_more_games_300':
                    WindowUtils.setElementImage(window, this.getBitmap(`${window.name}${suffix}`));
                    break;
            }
        }

        if(event.type !== WindowMouseEvent.CLICK) return;

        switch(window.name)
        {
            case 'btn_more_games_10':
                this._engine?.catalog?.buySnowWarTokensOffer('GET_SNOWWAR_TOKENS');
                this._engine?.logGameEvent('gameFramework.buyTokens.clicked.frontView');
                break;
            case 'btn_more_games_100':
                this._engine?.catalog?.buySnowWarTokensOffer('GET_SNOWWAR_TOKENS2');
                this._engine?.logGameEvent('gameFramework.buyTokens.clicked.frontView');
                break;
            case 'btn_more_games_300':
                this._engine?.catalog?.buySnowWarTokensOffer('GET_SNOWWAR_TOKENS3');
                this._engine?.logGameEvent('gameFramework.buyTokens.clicked.frontView');
                break;
        }
    }

    // AS3: GamesMainViewController.as::close()
    public close(leaveGame: boolean): void
    {
        if(this._lobbyView && this._lobbyView.visible) this._lobbyView.onClose(leaveGame);

        this.disposeViews();
    }

    // AS3: GamesMainViewController.as::onPlay()
    private onPlay(): void
    {
        if(this._engine?.freeGamesLeft !== 0) this._engine?.startQuickServerGame();
        else this._engine?.openGetMoreGames('gameFramework.onPlay.clicked.frontView');
    }

    // AS3: GamesMainViewController.as::updateGettingMoreGamesOption()
    private updateGettingMoreGamesOption(): void
    {
        const playButton = this._quickPlayContainer?.findChildByName('play.button') ?? null;

        if(playButton) playButton.visible = this._engine?.freeGamesLeft !== 0;
    }

    // AS3: GamesMainViewController.as::onNext()
    private onNext(): void
    {
        this._instructionPage = (this._instructionPage + 1) % GamesMainViewController.INSTRUCTION_ASSETS.length;
        this.showInstructions(true);
    }

    // AS3: GamesMainViewController.as::onPrevious()
    private onPrevious(): void
    {
        this._instructionPage = (this._instructionPage - 1 + GamesMainViewController.INSTRUCTION_ASSETS.length)
            % GamesMainViewController.INSTRUCTION_ASSETS.length;
        this.showInstructions(true);
    }

    // AS3: GamesMainViewController.as::onSelectPage()
    private onSelectPage(event: WindowMouseEvent): void
    {
        this._instructionPage = parseInt((event.window?.name ?? '').replace('page_', ''), 10);
        this.showInstructions(true);
    }

    /**
     * Swaps the teaser for the instruction page, runs that page's animation, and lights the
     * pagination dots up to and including the current one.
     */
    // AS3: GamesMainViewController.as::showInstructions()
    private showInstructions(show: boolean): void
    {
        if(!this._quickPlayContainer) return;

        const teaser = this._quickPlayContainer.findChildByName('teaser_container');
        const instructions = this._quickPlayContainer.findChildByName('instructions_container');

        if(teaser) teaser.visible = !show;
        if(instructions) instructions.visible = show;

        if(this._instructionAnimation)
        {
            this._instructionAnimation.dispose();
            this._instructionAnimation = null;
        }

        if(!show) return;

        const image = this._quickPlayContainer.findChildByName('instructions_image') as IBitmapWrapperWindow | null;
        const prefix = GamesMainViewController.INSTRUCTION_ASSETS[this._instructionPage];
        const frames = GamesMainViewController.INSTRUCTION_FRAME_COUNTS[this._instructionPage];

        if(image && this._engine?.assets)
        {
            this._instructionAnimation = new SnowWarAnimatedWindowElement(
                this._engine.assets,
                image,
                prefix,
                frames,
                GamesMainViewController.INSTRUCTION_FRAME_LENGTH
            );
        }

        const text = this._quickPlayContainer.findChildByName('instruction_text');

        if(text) text.caption = `\${snowwar.instructions.${this._instructionPage + 1}}`;

        const pageList = this._quickPlayContainer.findChildByName('page_list') as IItemListWindow | null;

        if(!pageList) return;

        for(let i = 0; i < pageList.numListItems; i++)
        {
            const item = pageList.getListItemAt(i) as IWindowContainer | null;
            const asset = i <= this._instructionPage ? 'pagination_ball_hilite' : 'pagination_ball';

            if(item) WindowUtils.setElementImage(item.getChildAt(0), this.getBitmap(asset));
        }
    }

    // AS3: GamesMainViewController.as::getBitmap()
    private getBitmap(name: string): ImageBitmap | null
    {
        return (this._engine?.assets?.getAssetByName(name)?.content ?? null) as ImageBitmap | null;
    }

    // AS3: GamesMainViewController.as::openMainWindow()
    public openMainWindow(open: boolean): void
    {
        if(!this._rootWindow && open) this.createWindow();
        else if(!this._rootWindow && !open) return;

        if(this._lobbyView) this._lobbyView.visible = false;
        if(this._quickPlayContainer) this._quickPlayContainer.visible = true;
    }

    // AS3: GamesMainViewController.as::openGameLobbyWindow()
    public openGameLobbyWindow(levelName: string, numberOfTeams: number, maxNumberOfPlayers: number): void
    {
        if(!this._rootWindow) this.createWindow();

        if(!this._lobbyView)
        {
            this._lobbyView = new GameLobbyWindowCtrl(this, levelName, numberOfTeams, maxNumberOfPlayers);
        }
        else
        {
            this._lobbyView.levelName = levelName;
            this._lobbyView.numberOfTeams = numberOfTeams;
            this._lobbyView.maxNumberOfPlayers = maxNumberOfPlayers;
            this._lobbyView.clearPlayerList();
        }

        if(this._quickPlayContainer) this._quickPlayContainer.visible = false;

        this._lobbyView.visible = true;
    }

    /** Free games left, the block countdown and the "buy more" state, resolved in that order. */
    // AS3: GamesMainViewController.as::updateGameStartingStatus()
    public updateGameStartingStatus(): void
    {
        if(!this._quickPlayContainer || !this._quickPlayContainer.visible) return;

        WindowUtils.setCaption(
            this._quickPlayContainer.findChildByName('games_left'),
            `${this._engine?.freeGamesLeft ?? 0}`
        );

        const gamesLeftRegion = this._quickPlayContainer.findChildByName('games_left_region');
        const gamesLeftStroke = this._quickPlayContainer.findChildByName('games_left_stroke') as ITextWindow | null;
        const playButton = this._quickPlayContainer.findChildByName('play.button');

        if(playButton) playButton.visible = true;

        this.updateGettingMoreGamesOption();

        if(this.checkGameAmountStatus(gamesLeftRegion, gamesLeftStroke, playButton))
        {
            this.checkBlockStatus(playButton);
        }
    }

    /**
     * Returns false — "do not go on to the block countdown" — for the one case where the button is
     * not a play button at all: no free games and no club, where it becomes "buy VIP".
     */
    // AS3: GamesMainViewController.as::checkGameAmountStatus()
    private checkGameAmountStatus(
        gamesLeftRegion: IWindow | null,
        gamesLeftStroke: ITextWindow | null,
        playButton: IWindow | null
    ): boolean
    {
        if(this._engine?.hasUnlimitedGames)
        {
            if(gamesLeftRegion) gamesLeftRegion.visible = false;

            return true;
        }

        if(gamesLeftRegion) gamesLeftRegion.visible = true;

        const playText = this._quickPlayContainer?.findChildByName('play_text') ?? null;

        if(playButton) playButton.color = 5622784;

        switch(this._engine?.freeGamesLeft ?? 0)
        {
            // -1 is the unlimited marker; the counter is hidden and the button stays "play".
            case -1:
                if(gamesLeftRegion) gamesLeftRegion.visible = false;

                WindowUtils.setCaption(playText, '${snowwar.play}');

                return true;
            case 0:
                if(gamesLeftRegion) gamesLeftRegion.visible = true;
                if(gamesLeftStroke) gamesLeftStroke.textColor = 0xFF0000;

                WindowUtils.setCaption(playText, '${catalog.vip.buy.title}');

                return false;
            default:
                if(gamesLeftRegion) gamesLeftRegion.visible = true;
                if(gamesLeftStroke) gamesLeftStroke.textColor = 1079212;

                WindowUtils.setCaption(playText, '${snowwar.play}');

                return true;
        }
    }

    // AS3: GamesMainViewController.as::checkBlockStatus()
    private checkBlockStatus(playButton: IWindow | null): void
    {
        const playText = this._quickPlayContainer?.findChildByName('play_text') ?? null;

        if(this._blockSecondsLeft > 0)
        {
            playButton?.disable();

            if(playButton) playButton.color = 13421772;

            const minutes = Math.floor(this._blockSecondsLeft / 60);
            const seconds = this._blockSecondsLeft % 60;

            if(playText) playText.caption = `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
        }
        else
        {
            playButton?.enable();

            if(playButton) playButton.color = 5622784;

            WindowUtils.setCaption(playText, '${snowwar.play}');
        }
    }

    // AS3: GamesMainViewController.as::onTick()
    private onTick(): void
    {
        if(this._blockSecondsLeft > 0)
        {
            this._blockSecondsLeft -= 1;
            log.trace(`on block tick ${this._blockSecondsLeft}`);
            this.updateGameStartingStatus();
        }

        if(this._blockSecondsLeft <= 0)
        {
            this.updateGameStartingStatus();
            this.disposeCounter();
        }
    }

    // AS3: GamesMainViewController.as::changeBlockStatus()
    public changeBlockStatus(seconds: number): void
    {
        if(seconds > 0)
        {
            this._blockSecondsLeft = seconds;

            if(!this._blockTimer) this._blockTimer = setInterval(() => this.onTick(), 1000);
        }

        this.updateGameStartingStatus();
    }

    // AS3: GamesMainViewController.as::disposeViews()
    private disposeViews(): void
    {
        if(this._instructionAnimation)
        {
            this._instructionAnimation.dispose();
            this._instructionAnimation = null;
        }

        if(this._lobbyView)
        {
            this._lobbyView.dispose();
            this._lobbyView = null;
        }

        if(this._quickPlayContainer)
        {
            this._quickPlayContainer.dispose();
            this._quickPlayContainer = null;
        }

        if(this._rootWindow)
        {
            this._rootWindow.dispose();
            this._rootWindow = null;
        }
    }

    /** AS3 assigns `NaN` to an `int` field here, which is 0 — the port writes the 0. */
    // AS3: GamesMainViewController.as::disposeCounter()
    private disposeCounter(): void
    {
        if(this._blockTimer)
        {
            clearInterval(this._blockTimer);
            this._blockTimer = null;
        }

        this._blockSecondsLeft = 0;
    }

    // AS3: GamesMainViewController.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this.disposeViews();
        this._disposed = true;
        this.disposeCounter();
    }
}
