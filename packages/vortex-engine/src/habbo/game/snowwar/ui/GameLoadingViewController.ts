import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {OrderedMap} from '@core/utils/OrderedMap';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import {AvatarTextureUtils} from '@habbo/avatar/AvatarTextureUtils';
import {
    Game2ExitGameMessageComposer
} from '@habbo/communication/messages/outgoing/game/arena/Game2ExitGameMessageComposer';
import {
    GetGuestRoomMessageComposer
} from '@habbo/communication/messages/outgoing/navigator/GetGuestRoomMessageComposer';
import type {GameLobbyData} from '@habbo/communication/messages/parser/game/snowwar/data/GameLobbyData';
import {GameLobbyPlayerData} from '@habbo/communication/messages/parser/game/snowwar/data/GameLobbyPlayerData';
import type {SnowWarEngine} from '../SnowWarEngine';
import {SnowWarAnimatedWindowElement} from '../utils/SnowWarAnimatedWindowElement';
import {WindowUtils} from '../utils/WindowUtils';
import {BackgroundViewController} from './BackgroundViewController';

/**
 * The screen between "the game is starting" and the arena: every player, their skill stars, and a
 * spinner each that stops when they report loaded.
 *
 * It is the *ending* window's layout with most of it hidden — `snowwar_ending` carries both states,
 * and which one you get is decided by which containers are switched off here.
 *
 * The spinners are the point: one `SnowWarAnimatedWindowElement` per user id, disposed as
 * `showReadyPlayers()` names them, and when the last one goes the panel switches to a single
 * "loading the arena" spinner instead.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/ui/GameLoadingViewController.as
 */
export class GameLoadingViewController implements IDisposable, IAvatarImageListener
{
    // AS3: GameLoadingViewController.as::_disposed
    private _disposed: boolean = false;

    /** Derived name — `_SafeStr_4581`, the engine. */
    // AS3: GameLoadingViewController.as::_SafeStr_4581
    private _engine: SnowWarEngine | null;

    // AS3: GameLoadingViewController.as::_window
    private _window: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_5411`; one spinner per user id still loading. */
    // AS3: GameLoadingViewController.as::_SafeStr_5411
    private _loadingIcons: OrderedMap<number, SnowWarAnimatedWindowElement> | null;

    /** Derived name — `_SafeStr_7890`; the lobby this screen is showing. */
    // AS3: GameLoadingViewController.as::_SafeStr_7890
    private _lobbyData: GameLobbyData | null = null;

    /** Derived name — `_SafeStr_6792`. */
    // AS3: GameLoadingViewController.as::_SafeStr_6792
    private _background: BackgroundViewController | null = null;

    // AS3: GameLoadingViewController.as::_avatarFigures
    private _avatarFigures: string[] = [];

    // AS3: GameLoadingViewController.as::GameLoadingViewController()
    constructor(engine: SnowWarEngine)
    {
        this._engine = engine;
        this._loadingIcons = new OrderedMap<number, SnowWarAnimatedWindowElement>();

        this.createMainWindow();

        this._background = new BackgroundViewController(engine);

        const background = this._background.background;

        if(background) background.visible = true;

        const desktop = engine.windowManager?.getDesktop(1) ?? null;

        if(desktop) desktop.visible = false;
        if(engine.roomUI) engine.roomUI.visible = false;
    }

    // AS3: GameLoadingViewController.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: GameLoadingViewController.as::createMainWindow()
    private createMainWindow(): void
    {
        this._window = WindowUtils.createWindow('snowwar_ending') as IWindowContainer | null;

        if(!this._window) return;

        this._window.x = ((this._window.desktop?.width ?? 0) - this._window.width) / 2;
        this._window.y = (this._window.desktop?.height ?? 0) > 685 ? 115 : 10;

        WindowUtils.setCaption(this._window.findChildByName('endingInformation'), '${snowwar.loading.title}');
        WindowUtils.hideElement(this._window, 'buttonsContainer');
        WindowUtils.hideElement(this._window, 'mostKillsContainer');
        WindowUtils.hideElement(this._window, 'mostHitsContainer');
        WindowUtils.hideElement(this._window, 'team1Score');
        WindowUtils.hideElement(this._window, 'team2Score');
        WindowUtils.hideElement(this._window, 'statusContainer');

        const loadingContainer = this._window.findChildByName('loadingContainer');

        if(loadingContainer) loadingContainer.visible = true;

        const leaveLink = this._window.findChildByName('leave_link_region');

        if(leaveLink) leaveLink.procedure = (event: WindowEvent): void => this.onCancel(event);
    }

    // AS3: GameLoadingViewController.as::onCancel()
    private onCancel(event: WindowEvent): void
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this.onClose();
    }

    /**
     * Leaving from the loading screen has to undo two things: the game session, and the room the
     * player was taken out of — hence the `GetGuestRoomMessageComposer` back to `roomBeforeGame`.
     */
    // AS3: GameLoadingViewController.as::onClose()
    private onClose(): void
    {
        if(this._engine === null) return;

        this._engine.gameCancelled(true);
        this._engine.send(new Game2ExitGameMessageComposer());

        if(this._engine.roomBeforeGame > -1)
        {
            this._engine.send(new GetGuestRoomMessageComposer(this._engine.roomBeforeGame, false, true));
        }

        this._engine.disposeLoadingView();
    }

    // AS3: GameLoadingViewController.as::show()
    public show(lobbyData: GameLobbyData): void
    {
        this._lobbyData = lobbyData;

        const preview = this._window?.findChildByName('arenaPreview') as IBitmapWrapperWindow | null;
        const asset = this._engine?.assets?.getAssetByName(`arena_${lobbyData.fieldType}_preview`) ?? null;

        if(preview && asset)
        {
            preview.bitmap = (asset.content ?? null) as ImageBitmap | null;
            preview.disposesBitmap = false;
        }

        WindowUtils.setCaption(
            this._window?.findChildByName('arenaName') ?? null,
            this._engine?.getArenaName(lobbyData) ?? ''
        );

        this.renderPlayers();
    }

    // AS3: GameLoadingViewController.as::renderPlayers()
    private renderPlayers(): void
    {
        this.clearPlayers();

        const players = [...(this._lobbyData?.players ?? [])].sort(GameLobbyPlayerData.COMPARE_BY_SKILL_LEVEL);

        for(const player of players) this.addPlayer(player);
    }

    /** Walks `team1PlayersList`, `team2PlayersList`, … until one is missing. */
    // AS3: GameLoadingViewController.as::clearPlayers()
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

    // AS3: GameLoadingViewController.as::addPlayer()
    private addPlayer(player: GameLobbyPlayerData): void
    {
        const teamId = player.teamId;
        const list = this._window?.findChildByName(`team${teamId}PlayersList`) as IItemListWindow | null;
        const row = WindowUtils.createWindow(`snowwar_results_player_team_${teamId}`) as IItemListWindow | null;

        if(!list || !row) return;

        const imageContainer = row.getListItemByName('playerImageContainer') as IWindowContainer | null;
        const dataContainer = row.getListItemByName('playerDataContainer') as IWindowContainer | null;
        const scoreContainer = row.getListItemByName('playerScoreContainer') as IWindowContainer | null;

        if(!imageContainer || !dataContainer || !scoreContainer) return;

        if(player.userId === this._engine?.sessionDataManager?.userId)
        {
            WindowUtils.setElementImage(
                imageContainer.findChildByName('playerImageBackground'),
                this.getBitmap('green_square')
            );
        }

        // Team 2 faces the other way, so its avatars are rendered from direction 4 rather than 2.
        const direction = teamId === 2 ? 4 : 2;

        WindowUtils.setElementImage(
            imageContainer.findChildByName('playerImage'),
            this.getAvatarFigure(player.teamId, player.figure, player.gender, direction)
        );
        WindowUtils.setCaption(dataContainer.findChildByName('playerName'), player.name);
        WindowUtils.hideElement(dataContainer, 'playerStats');
        WindowUtils.hideElement(scoreContainer, 'playerScore');
        WindowUtils.hideElement(dataContainer, 'playerTotalStats');

        const skillLevel = dataContainer.findChildByName('skillLevel') as IBitmapWrapperWindow | null;

        if(skillLevel)
        {
            skillLevel.bitmap?.close();
            skillLevel.bitmap = this.getSkillLevelImage(player.skillLevel, player.teamId);
        }

        const scoreTooltip = dataContainer.findChildByName('scoreTooltip') as IInteractiveWindow | null;

        if(scoreTooltip)
        {
            scoreTooltip.toolTipCaption = `${player.totalScore}/${player.scoreToNextLevel}`;
            scoreTooltip.visible = true;
        }

        list.addListItem(row);

        const loadingIcon = scoreContainer.findChildByName('loadingIcon') as IBitmapWrapperWindow | null;

        if(!loadingIcon || !this._engine?.assets || !this._loadingIcons) return;

        this._loadingIcons.remove(player.userId)?.dispose();
        this._loadingIcons.add(
            player.userId,
            new SnowWarAnimatedWindowElement(this._engine.assets, loadingIcon, 'load_', 8)
        );

        loadingIcon.visible = true;
    }

    /**
     * Ten stars, filled left to right — bronze below level 11, silver below 21, gold above — with
     * the level's position inside its own decade deciding how many are lit.
     *
     * Team 2 fills them from the right, because its whole row is mirrored.
     */
    // AS3: GameLoadingViewController.as::getSkillLevelImage()
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

    /** A figure arriving late re-renders the whole list, once per figure. */
    // AS3: GameLoadingViewController.as::avatarImageReady()
    public avatarImageReady(figureString: string): void
    {
        if(this._avatarFigures.indexOf(figureString) !== -1) return;

        this.renderPlayers();
        this._avatarFigures.push(figureString);
    }

    // AS3: GameLoadingViewController.as::getElement()
    private getElement(container: IWindowContainer | null, name: string): IWindow | null
    {
        return container?.findChildByName(name) ?? null;
    }

    // AS3: GameLoadingViewController.as::getBitmap()
    private getBitmap(name: string): ImageBitmap | null
    {
        return (this._engine?.assets?.getAssetByName(name)?.content ?? null) as ImageBitmap | null;
    }

    /** The same team-jumper rebuild `GameArenaView` does, at half scale and full body. */
    // AS3: GameLoadingViewController.as::getAvatarFigure()
    private getAvatarFigure(teamId: number, figure: string, gender: string, direction: number): ImageBitmap | null
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

        avatarImage.setDirection('full', direction);

        return AvatarTextureUtils.toImageBitmap(avatarImage.getCroppedImage('full'));
    }

    /**
     * Stops the named players' spinners. When the last one goes the panel stops being about the
     * players at all and becomes one spinner for the arena itself.
     */
    // AS3: GameLoadingViewController.as::showReadyPlayers()
    public showReadyPlayers(userIds: number[]): void
    {
        if(!this._loadingIcons) return;

        for(const userId of userIds)
        {
            this._loadingIcons.remove(userId)?.dispose();
        }

        if(this._loadingIcons.length !== 0) return;

        const mainIcon = this._window?.findChildByName('mainLoadingIcon') as IBitmapWrapperWindow | null;

        if(mainIcon && this._engine?.assets)
        {
            this._loadingIcons.add(
                -1,
                new SnowWarAnimatedWindowElement(this._engine.assets, mainIcon, 'load_', 8)
            );
        }

        WindowUtils.setCaption(this._window?.findChildByName('loadingText') ?? null, '${snowwar.loading_arena}');
    }

    // AS3: GameLoadingViewController.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        const desktop = this._engine?.windowManager?.getDesktop(1) ?? null;

        if(desktop) desktop.visible = true;

        this._engine = null;

        if(this._loadingIcons)
        {
            for(const icon of this._loadingIcons.values()) icon.dispose();

            this._loadingIcons.dispose();
            this._loadingIcons = null;
        }

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        if(this._background)
        {
            this._background.dispose();
            this._background = null;
        }

        this._disposed = true;
        this._avatarFigures = [];
    }
}
