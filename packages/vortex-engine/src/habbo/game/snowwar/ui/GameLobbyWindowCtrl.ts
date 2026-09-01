import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {OrderedMap} from '@core/utils/OrderedMap';
import {Logger} from '@core/utils/Logger';
import {drawIntoBitmapSlot} from '@core/utils/BitmapSlot';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import {AvatarTextureUtils} from '@habbo/avatar/AvatarTextureUtils';
import {
    Game2LeaveGameMessageComposer
} from '@habbo/communication/messages/outgoing/game/directory/Game2LeaveGameMessageComposer';
import type {
    GameLobbyPlayerData
} from '@habbo/communication/messages/parser/game/snowwar/data/GameLobbyPlayerData';
import type {SnowWarEngine} from '../SnowWarEngine';
import {SnowWarAnimatedWindowElement} from '../utils/SnowWarAnimatedWindowElement';
import {WindowUtils} from '../utils/WindowUtils';
import type {GamesMainViewController} from './GamesMainViewController';

const log = Logger.getLogger('habbo.game.snowwar.ui.GameLobbyWindowCtrl');

/**
 * The waiting room: one grid slot per possible player, filled with a head as each joins and left
 * spinning while it is empty.
 *
 * The grid is built once at `maxNumberOfPlayers` clones of `snowwar_lobby_player` and never
 * resized — a player joining takes the next slot, and the slots past the last one keep their
 * spinner. That is also why the spinners are keyed by the *window* they animate rather than by a
 * user: the slot outlives whoever is in it.
 *
 * The status line has three states in priority order — counting down, queued, or waiting for more
 * players — and each registers its own localisation parameter before reading the key back.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/ui/GameLobbyWindowCtrl.as
 */
export class GameLobbyWindowCtrl implements IDisposable, IAvatarImageListener
{
    /** Derived name — `_SafeStr_4684`, the games window this lobby lives inside. */
    // AS3: GameLobbyWindowCtrl.as::_SafeStr_4684
    private _mainView: GamesMainViewController | null;

    /** Derived name — `_SafeStr_4581`, the engine. */
    // AS3: GameLobbyWindowCtrl.as::_SafeStr_4581
    private _engine: SnowWarEngine | null;

    // AS3: GameLobbyWindowCtrl.as::_levelName
    private _levelName: string;

    // AS3: GameLobbyWindowCtrl.as::_numberOfTeams
    private _numberOfTeams: number;

    // AS3: GameLobbyWindowCtrl.as::_numberOfPlayers
    private _numberOfPlayers: number;

    // AS3: GameLobbyWindowCtrl.as::_maxNumberOfPlayers
    private _maxNumberOfPlayers: number;

    /** Derived name — `_SafeStr_4929`; the lobby panel inside the games window. */
    // AS3: GameLobbyWindowCtrl.as::_SafeStr_4929
    private _lobbyContainer: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_5892`; the one-second countdown. */
    // AS3: GameLobbyWindowCtrl.as::_SafeStr_5892
    private _countdownTimer: ReturnType<typeof setInterval> | null = null;

    /** Derived name — `_SafeStr_5069`; seconds left, or -1 when there is no countdown. */
    // AS3: GameLobbyWindowCtrl.as::_SafeStr_5069
    private _countdown: number = -1;

    /** Derived name — `_SafeStr_6075`; place in the arena queue, or -1. */
    // AS3: GameLobbyWindowCtrl.as::_SafeStr_6075
    private _queuePosition: number = -1;

    // AS3: GameLobbyWindowCtrl.as::_SafeStr_5769
    private _disposed: boolean = false;

    /** Derived name — `_SafeStr_5806`; the players in the lobby, by user id. */
    // AS3: GameLobbyWindowCtrl.as::_SafeStr_5806
    private _players: OrderedMap<number, GameLobbyPlayerData> | null;

    /** Derived name — `_SafeStr_5411`; a spinner per *empty* slot, keyed by the slot's window. */
    // AS3: GameLobbyWindowCtrl.as::_SafeStr_5411
    private _loadingIcons: OrderedMap<IBitmapWrapperWindow, SnowWarAnimatedWindowElement> | null;

    /**
     * AS3 writes `_numberOfPlayers = numberOfPlayers` here — the field from its own getter, which
     * is still 0 — rather than from a parameter, and there is no parameter to take it from. The
     * port keeps the 0 that produces; nothing reads the field.
     */
    // AS3: GameLobbyWindowCtrl.as::GameLobbyWindowCtrl()
    constructor(
        mainView: GamesMainViewController,
        levelName: string,
        numberOfTeams: number,
        maxNumberOfPlayers: number
    )
    {
        this._mainView = mainView;
        this._engine = mainView.gameEngine;
        this._players = new OrderedMap<number, GameLobbyPlayerData>();
        this._loadingIcons = new OrderedMap<IBitmapWrapperWindow, SnowWarAnimatedWindowElement>();
        this._levelName = levelName;
        this._numberOfTeams = numberOfTeams;
        this._numberOfPlayers = 0;
        this._maxNumberOfPlayers = maxNumberOfPlayers;
    }

    // AS3: GameLobbyWindowCtrl.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: GameLobbyWindowCtrl.as::get levelName()
    public get levelName(): string
    {
        return this._levelName;
    }

    // AS3: GameLobbyWindowCtrl.as::set levelName()
    public set levelName(levelName: string)
    {
        this._levelName = levelName;
    }

    // AS3: GameLobbyWindowCtrl.as::get numberOfTeams()
    public get numberOfTeams(): number
    {
        return this._numberOfTeams;
    }

    // AS3: GameLobbyWindowCtrl.as::set numberOfTeams()
    public set numberOfTeams(numberOfTeams: number)
    {
        this._numberOfTeams = numberOfTeams;
    }

    // AS3: GameLobbyWindowCtrl.as::get numberOfPlayers()
    public get numberOfPlayers(): number
    {
        return this._numberOfPlayers;
    }

    // AS3: GameLobbyWindowCtrl.as::set numberOfPlayers()
    public set numberOfPlayers(numberOfPlayers: number)
    {
        this._numberOfPlayers = numberOfPlayers;
    }

    // AS3: GameLobbyWindowCtrl.as::get maxNumberOfPlayers()
    public get maxNumberOfPlayers(): number
    {
        return this._maxNumberOfPlayers;
    }

    // AS3: GameLobbyWindowCtrl.as::set maxNumberOfPlayers()
    public set maxNumberOfPlayers(maxNumberOfPlayers: number)
    {
        this._maxNumberOfPlayers = maxNumberOfPlayers;
    }

    // AS3: GameLobbyWindowCtrl.as::set counter()
    public set counter(counter: number)
    {
        this._countdown = counter;
    }

    // AS3: GameLobbyWindowCtrl.as::set queuePosition()
    public set queuePosition(queuePosition: number)
    {
        this._queuePosition = queuePosition;
    }

    // AS3: GameLobbyWindowCtrl.as::get visible()
    public get visible(): boolean
    {
        return this._lobbyContainer !== null && this._lobbyContainer.visible;
    }

    // AS3: GameLobbyWindowCtrl.as::set visible()
    public set visible(visible: boolean)
    {
        if(!this._lobbyContainer) this.createLobbyView();

        if(this._lobbyContainer) this._lobbyContainer.visible = visible;
    }

    // AS3: GameLobbyWindowCtrl.as::createLobbyView()
    private createLobbyView(): void
    {
        this._lobbyContainer = this._mainView?.rootWindow?.findChildByName('snowwar_lobby_cont') as IWindowContainer | null;

        if(!this._lobbyContainer) return;

        this._lobbyContainer.center();

        const cancel = this._lobbyContainer.findChildByName('cancel_link_region');

        if(cancel) cancel.procedure = (event: WindowEvent): void => this.onCancel(event);

        const grid = this._lobbyContainer.findChildByName('players_grid') as IItemGridWindow | null;
        const prototype = WindowUtils.createWindow('snowwar_lobby_player') as IWindowContainer | null;

        if(grid && prototype)
        {
            for(let i = 0; i < this._maxNumberOfPlayers; i++) grid.addGridItem(prototype.clone());

            prototype.dispose();
        }

        this._lobbyContainer.visible = false;
    }

    // AS3: GameLobbyWindowCtrl.as::onCancel()
    private onCancel(event: WindowEvent): void
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this.onClose(true);

        if(!this._engine?.gameCenterEnabled) this._mainView?.openMainWindow(true);
        else this._mainView?.close(true);
    }

    // AS3: GameLobbyWindowCtrl.as::onClose()
    public onClose(leaveGame: boolean): void
    {
        if(leaveGame) this._engine?.communication?.connection?.send(new Game2LeaveGameMessageComposer());

        this.disposeCountdownTimer();
        this._queuePosition = -1;
    }

    // AS3: GameLobbyWindowCtrl.as::playerLeft()
    public playerLeft(userId: number): void
    {
        this._players?.remove(userId);
        this.updateDialog(true);
    }

    // AS3: GameLobbyWindowCtrl.as::playerJoined()
    public playerJoined(player: GameLobbyPlayerData | null): void
    {
        if(!player) return;

        this._players?.add(player.userId, player);
        this.updateDialog(true, player.figure);
    }

    // AS3: GameLobbyWindowCtrl.as::clearPlayerList()
    public clearPlayerList(): void
    {
        this._players?.reset();
    }

    // AS3: GameLobbyWindowCtrl.as::startCountdown()
    public startCountdown(seconds: number): void
    {
        this.disposeCountdownTimer();

        this._countdown = seconds;
        this._countdownTimer = setInterval(() => this.onTick(), 1000);

        this.updateDialog(false);
    }

    // AS3: GameLobbyWindowCtrl.as::onTick()
    private onTick(): void
    {
        if(this._disposed) return;

        if(this._countdown > 0)
        {
            this._countdown -= 1;
            log.trace(`on tick ${this._countdown}`);
            this.updateDialog(false);
        }
    }

    // AS3: GameLobbyWindowCtrl.as::stopCountdown()
    public stopCountdown(): void
    {
        this.disposeCountdownTimer();
        this.updateDialog(false);
    }

    /**
     * Redraws the status line, and — when `withPlayers` — the heads.
     *
     * `figure` narrows the redraw to one avatar: `avatarImageReady()` passes the figure that just
     * finished loading so the other slots are left alone. A null figure redraws every one.
     */
    // AS3: GameLobbyWindowCtrl.as::updateDialog()
    private updateDialog(withPlayers: boolean, figure: string | null = null): void
    {
        if(!this._lobbyContainer) return;

        const waitText = this._lobbyContainer.findChildByName('wait_text');
        const waitTextStroke = this._lobbyContainer.findChildByName('wait_text_stroke');
        const localization = this._engine?.localization ?? null;

        let key: string;
        let fallback: string;

        if(this._countdown >= 0)
        {
            key = 'snowwar.lobby_game_start_countdown';
            localization?.registerParameter(key, 'seconds', `${this._countdown}`);
            fallback = `${key} %seconds% ${this._countdown}`;
        }
        else if(this._queuePosition >= 0)
        {
            key = 'snowwar.lobby_arena_queue_position';
            localization?.registerParameter(key, 'position', `${this._queuePosition}`);
            fallback = `${key} %position% ${this._queuePosition}`;
        }
        else
        {
            key = 'snowwar.lobby_waiting_for_more_players';
            fallback = key;
        }

        const text = localization?.getLocalization(key) ?? '';
        const caption = text ? text : fallback;

        if(waitText) waitText.caption = caption;
        if(waitTextStroke) waitTextStroke.caption = caption;

        if(!withPlayers) return;

        const grid = this._lobbyContainer.findChildByName('players_grid') as IItemGridWindow | null;

        if(!grid) return;

        let slot = 0;

        for(const player of this._players?.getValues() ?? [])
        {
            const avatarImage = (player.figure === figure || !figure)
                ? this._engine?.avatarManager?.createAvatarImage(player.figure, 'h', player.gender, this, null) ?? null
                : null;

            if(avatarImage)
            {
                avatarImage.setDirection('head', 2);

                const head = AvatarTextureUtils.toImageBitmap(avatarImage.getCroppedImage('head'));
                const item = grid.getGridItemAt(slot) as IInteractiveWindow | null;

                if(item)
                {
                    item.toolTipCaption = player.name;
                    item.mouseThreshold = 0;

                    const image = (item as unknown as IWindowContainer).findChildByName('image') as IBitmapWrapperWindow | null;

                    if(image)
                    {
                        this._loadingIcons?.remove(image)?.dispose();
                        image.bitmap?.close();
                        image.bitmap = drawIntoBitmapSlot(head, image.width, image.height, false);
                    }
                }

                head?.close();
                avatarImage.dispose();
            }

            slot++;
        }

        while(slot < this._maxNumberOfPlayers)
        {
            const item = grid.getGridItemAt(slot) as IWindowContainer | null;
            const image = item?.findChildByName('image') as IBitmapWrapperWindow | null;

            if(image && this._loadingIcons && !this._loadingIcons.hasKey(image) && this._engine?.assets)
            {
                this._loadingIcons.add(
                    image,
                    new SnowWarAnimatedWindowElement(this._engine.assets, image, 'load_', 8)
                );
            }

            slot++;
        }
    }

    // AS3: GameLobbyWindowCtrl.as::avatarImageReady()
    public avatarImageReady(figureString: string): void
    {
        this.updateDialog(true, figureString);
    }

    // AS3: GameLobbyWindowCtrl.as::disposeCountdownTimer()
    private disposeCountdownTimer(): void
    {
        if(this._countdownTimer !== null)
        {
            clearInterval(this._countdownTimer);
            this._countdownTimer = null;
        }

        this._countdown = -1;
    }

    // AS3: GameLobbyWindowCtrl.as::dispose()
    public dispose(): void
    {
        this._disposed = true;

        if(this._loadingIcons)
        {
            for(const icon of this._loadingIcons.values()) icon.dispose();

            this._loadingIcons.dispose();
            this._loadingIcons = null;
        }

        if(this._lobbyContainer !== null)
        {
            this._lobbyContainer.dispose();
            this._lobbyContainer = null;
        }

        this.disposeCountdownTimer();

        if(this._players)
        {
            this._players.dispose();
            this._players = null;
        }

        this._queuePosition = -1;
        this._mainView = null;
        this._engine = null;
    }
}
