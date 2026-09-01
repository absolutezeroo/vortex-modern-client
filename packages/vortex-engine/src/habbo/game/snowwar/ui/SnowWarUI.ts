import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {drawIntoBitmapSlot} from '@core/utils/BitmapSlot';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import {AvatarTextureUtils} from '@habbo/avatar/AvatarTextureUtils';
import type {BitmapDataAsset} from '@core/assets/BitmapDataAsset';
import {
    Game2ExitGameMessageComposer
} from '@habbo/communication/messages/outgoing/game/arena/Game2ExitGameMessageComposer';
// A value import, not a type one: the two static sound helpers live on the engine. The cycle it
// forms with `SnowWarEngine` (which constructs this class) is safe because neither side touches the
// other while its module is still evaluating — every use is inside a method body.
import {SnowWarEngine} from '../SnowWarEngine';
import {SnowWarAnimatedWindowElement} from '../utils/SnowWarAnimatedWindowElement';
import {WindowUtils} from '../utils/WindowUtils';
import {RGBColor} from './RGBColor';

/**
 * The in-arena HUD: the exit button, the snowball rack, your own stats, the team scores, the clock
 * and the three-two-one counter.
 *
 * Every panel is its own top-level window positioned against the desktop, because there is no
 * container for them — the arena itself is the room, drawn underneath. Layer 1's desktop is hidden
 * for the whole life of this object and restored in `dispose()`, which is what takes the ordinary
 * client UI off screen during a game.
 *
 * Two things here only exist for staff (`hasSecurity(4)`): the checksum indicator on the clock,
 * and the colour tween that fades it back to white after `showChecksumError()` paints it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/ui/SnowWarUI.as
 */
export class SnowWarUI implements IDisposable, IAvatarImageListener
{
    // AS3: SnowWarUI.as::EMPTY_AMMO_FLASH_FRAMES
    private static readonly EMPTY_AMMO_FLASH_FRAMES: number = 4;

    // AS3: SnowWarUI.as::EMPTY_AMMO_FRAME_LENGTH
    private static readonly EMPTY_AMMO_FRAME_LENGTH: number = 75;

    // AS3: SnowWarUI.as::SCORE_FLASH_FRAMES
    private static readonly SCORE_FLASH_FRAMES: number = 4;

    // AS3: SnowWarUI.as::SCORE_FRAME_LENGTH
    private static readonly SCORE_FRAME_LENGTH: number = 50;

    // AS3: SnowWarUI.as::MAX_SNOWBALLS
    private static readonly MAX_SNOWBALLS: number = 5;

    // AS3: SnowWarUI.as::MAX_ENERGY
    private static readonly MAX_ENERGY: number = 5;

    /** Derived name — `_SafeStr_4581`, the engine. */
    // AS3: SnowWarUI.as::_SafeStr_4581
    private _engine: SnowWarEngine | null;

    // AS3: SnowWarUI.as::_exit
    private _exit: IWindowContainer | null = null;

    // AS3: SnowWarUI.as::_snowballs
    private _snowballs: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_5135`; the bottom-left own-stats panel. */
    // AS3: SnowWarUI.as::_SafeStr_5135
    private _ownStats: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_4902`; the clock panel. */
    // AS3: SnowWarUI.as::_SafeStr_4902
    private _timerWindow: IWindowContainer | null = null;

    // AS3: SnowWarUI.as::_teamScores
    private _teamScores: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_5345`; the "really leave?" dialog, built on first use. */
    // AS3: SnowWarUI.as::_SafeStr_5345
    private _exitConfirmation: IWindowContainer | null = null;

    // AS3: SnowWarUI.as::_checksumIndicatorColor
    private _checksumIndicatorColor: RGBColor | null = null;

    // AS3: SnowWarUI.as::_tweenColor
    private _tweenColor: RGBColor | null = null;

    /** Derived name — `_SafeStr_4809`; the countdown/explosion bitmap in the middle of the screen. */
    // AS3: SnowWarUI.as::_SafeStr_4809
    private _counter: IBitmapWrapperWindow | null = null;

    // AS3: SnowWarUI.as::_SafeStr_5769
    private _disposed: boolean = false;

    /** Derived name — `_SafeStr_6279`; which counter frame is showing, 1..11. */
    // AS3: SnowWarUI.as::_SafeStr_6279
    private _counterFrame: number = 1;

    // AS3: SnowWarUI.as::_timeSinceLastUpdate
    private _timeSinceLastUpdate: number = 0;

    /** Derived name — `_SafeStr_9460`; the last value `timer` was set to, in seconds. */
    // AS3: SnowWarUI.as::_SafeStr_9460
    private _lastTimerValue: number = -1;

    /** Derived name — `_SafeStr_8339`; the last hit-point count drawn. */
    // AS3: SnowWarUI.as::_SafeStr_8339
    private _lastHitPoints: number = 5;

    /** Derived name — `_SafeStr_7707`; the make-snowball button's bitmap. */
    // AS3: SnowWarUI.as::_SafeStr_7707
    private _makeSnowballImage: IBitmapWrapperWindow | null = null;

    // AS3: SnowWarUI.as::_makingSnowballs
    private _makingSnowballs: boolean = false;

    /** Derived name — `_SafeStr_9879`; how many snowballs the rack is showing. */
    // AS3: SnowWarUI.as::_SafeStr_9879
    private _snowballCount: number = 5;

    /** Derived name — `_SafeStr_6531`; the slot the "making a snowball" spinner is drawn into. */
    // AS3: SnowWarUI.as::_SafeStr_6531
    private _ballProgress: IBitmapWrapperWindow | null = null;

    /** Derived name — `_SafeStr_5540`; that spinner, while it runs. */
    // AS3: SnowWarUI.as::_SafeStr_5540
    private _loadAnimation: SnowWarAnimatedWindowElement | null = null;

    // AS3: SnowWarUI.as::_emptyAmmoFlash
    private _emptyAmmoFlash: IBitmapWrapperWindow | null = null;

    // AS3: SnowWarUI.as::_emptyAmmoAnimation
    private _emptyAmmoAnimation: SnowWarAnimatedWindowElement | null = null;

    /** Derived name — `_SafeStr_6839`; the +1/-1 flash behind the personal score. */
    // AS3: SnowWarUI.as::_SafeStr_6839
    private _scoreFlash: IBitmapWrapperWindow | null = null;

    /** Derived name — `_SafeStr_6036`; milliseconds into the score flash, 0 when idle. */
    // AS3: SnowWarUI.as::_SafeStr_6036
    private _scoreFlashElapsed: number = 0;

    /** Derived name — `_SafeStr_9207`; `ui_me_plus_` or `ui_me_minus_`. */
    // AS3: SnowWarUI.as::_SafeStr_9207
    private _scoreFlashPrefix: string = '';

    /** Derived name — `_SafeStr_5629`; the half-second one-shot that hides the clock at 0:05. */
    // AS3: SnowWarUI.as::_SafeStr_5629
    private _timerHider: ReturnType<typeof setTimeout> | null = null;

    /** Derived name — `_SafeStr_7032`; `hasSecurity(4)`, i.e. staff. */
    // AS3: SnowWarUI.as::_SafeStr_7032
    private _isStaff: boolean = false;

    // AS3: SnowWarUI.as::SnowWarUI()
    constructor(engine: SnowWarEngine)
    {
        this._engine = engine;

        const desktop = engine.windowManager?.getDesktop(1) ?? null;

        if(desktop) desktop.visible = false;

        this._isStaff = engine.sessionDataManager?.hasSecurity(4) ?? false;

        if(this._isStaff)
        {
            this._checksumIndicatorColor = new RGBColor();
            this._tweenColor = new RGBColor(0xFFFFFF);
        }
    }

    // AS3: SnowWarUI.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    /** Builds every panel. Called from `SnowWarEngine.initView()`, once the stage is loaded. */
    // AS3: SnowWarUI.as::init()
    public init(): void
    {
        this._exit = WindowUtils.createWindow('snowwar_exit') as IWindowContainer | null;

        if(this._exit)
        {
            this._exit.addEventListener(WindowMouseEvent.CLICK, () => this.onExit());
            this._exit.x = 0;
            this._exit.y = 10;
        }

        this._snowballs = WindowUtils.createWindow('snowwar_snowballs') as IWindowContainer | null;

        if(this._snowballs)
        {
            const makeSnowball = this._snowballs.findChildByName('make_snowball');

            makeSnowball?.addEventListener(WindowMouseEvent.DOWN, () => this.onMakeSnowballDown());
            makeSnowball?.addEventListener(WindowMouseEvent.UP, () => this.onMakeSnowballUp());
            makeSnowball?.addEventListener(WindowMouseEvent.OUT, () => this.onMakeSnowballUp());

            this._snowballs.center();
            this._snowballs.x = 10;

            this._makeSnowballImage = this._snowballs.findChildByName('makeSnowballImage') as IBitmapWrapperWindow | null;
            this._emptyAmmoFlash = this._snowballs.findChildByName('emptyFlashImage') as IBitmapWrapperWindow | null;

            if(this._emptyAmmoFlash)
            {
                this._emptyAmmoFlash.visible = false;

                if(this._engine?.assets)
                {
                    this._emptyAmmoAnimation = new SnowWarAnimatedWindowElement(
                        this._engine.assets,
                        this._emptyAmmoFlash,
                        'ui_no_balls_',
                        SnowWarUI.EMPTY_AMMO_FLASH_FRAMES,
                        SnowWarUI.EMPTY_AMMO_FRAME_LENGTH,
                        true
                    );
                }
            }

            this._ballProgress = this._snowballs.findChildByName('ballProgress') as IBitmapWrapperWindow | null;
        }

        this._ownStats = WindowUtils.createWindow('snowwar_own_stats') as IWindowContainer | null;

        if(this._ownStats)
        {
            this._ownStats.x = 10;
            this._ownStats.y = (this._ownStats.desktop?.height ?? 0) - this._ownStats.height - 10;
            this._scoreFlash = this._ownStats.findChildByName('backgroundFlashImage') as IBitmapWrapperWindow | null;
        }

        this.updateUserImage();

        this._teamScores = WindowUtils.createWindow('snowwar_team_scores') as IWindowContainer | null;

        if(this._teamScores)
        {
            this._teamScores.x = (this._teamScores.desktop?.width ?? 0) - this._teamScores.width - 10;
            this._teamScores.y = 10;
        }

        this._timerWindow = WindowUtils.createWindow('snowwar_timer') as IWindowContainer | null;

        if(this._timerWindow)
        {
            this._timerWindow.x = (this._timerWindow.desktop?.width ?? 0) - this._timerWindow.width - 50;
            this._timerWindow.y = 105;
        }

        this.setTimer(0);

        this._counter = WindowUtils.createWindow('counter') as IBitmapWrapperWindow | null;
        this._counter?.center();

        if(this._isStaff && this._timerWindow)
        {
            const indicator = this._timerWindow.getChildByName('checksumIndicator');

            if(indicator) indicator.visible = true;

            this._checksumIndicatorColor?.fromInt(this._timerWindow.color);
        }

        this._lastHitPoints = SnowWarUI.MAX_ENERGY;
    }

    // AS3: SnowWarUI.as::avatarImageReady()
    public avatarImageReady(_figureString: string): void
    {
        this.updateUserImage();
    }

    // AS3: SnowWarUI.as::updateUserImage()
    private updateUserImage(): void
    {
        const figure = this._engine?.sessionDataManager?.figure ?? '';
        const gender = this._engine?.sessionDataManager?.gender ?? null;
        const avatarImage = this._engine?.avatarManager?.createAvatarImage(figure, 'h', gender, this, null) ?? null;

        if(avatarImage === null) return;

        avatarImage.setDirection('full', 2);

        const head = AvatarTextureUtils.toImageBitmap(avatarImage.getCroppedImage('head'));

        avatarImage.dispose();

        WindowUtils.setElementImage(this._ownStats?.findChildByName('user_image') ?? null, head);
        head?.close();
    }

    // AS3: SnowWarUI.as::getBitmap()
    private getBitmap(name: string): ImageBitmap | null
    {
        return (this._engine?.assets?.getAssetByName(name)?.content ?? null) as ImageBitmap | null;
    }

    // AS3: SnowWarUI.as::getElement()
    private getElement(container: IWindowContainer | null, name: string): IWindow | null
    {
        return container?.findChildByName(name) ?? null;
    }

    // AS3: SnowWarUI.as::onMakeSnowballDown()
    private onMakeSnowballDown(): void
    {
        this.makeSnowballButtonPressed(true);

        if(this._engine?.makeSnowball()) this.startWaitingForSnowball();
    }

    // AS3: SnowWarUI.as::onMakeSnowballUp()
    private onMakeSnowballUp(): void
    {
        this.makeSnowballButtonPressed(false);
    }

    /** Starts the spinner over the next empty rack slot and the packing sound with it. */
    // AS3: SnowWarUI.as::startWaitingForSnowball()
    public startWaitingForSnowball(): void
    {
        this.disposeLoadIcon();

        if(this._engine?.assets && this._ballProgress)
        {
            this._loadAnimation = new SnowWarAnimatedWindowElement(
                this._engine.assets,
                this._ballProgress,
                'load_',
                8
            );
        }

        SnowWarEngine.playSound('HBSTG_snowwar_make_snowball');
    }

    /**
     * The ball landed. If the button is still held down this immediately starts the next one —
     * which is how holding the button packs snowballs continuously.
     */
    // AS3: SnowWarUI.as::stopWaitingForSnowball()
    public stopWaitingForSnowball(): void
    {
        this.disposeLoadIcon();
        SnowWarEngine.stopSound('HBSTG_snowwar_make_snowball');

        if(this._makingSnowballs) this.onMakeSnowballDown();
    }

    // AS3: SnowWarUI.as::disposeLoadIcon()
    private disposeLoadIcon(): void
    {
        if(this._loadAnimation !== null)
        {
            this._loadAnimation.dispose();
            this._loadAnimation = null;
        }
    }

    // AS3: SnowWarUI.as::onExit()
    private onExit(): void
    {
        if(!this._exitConfirmation)
        {
            this._exitConfirmation = WindowUtils.createWindow('snowwar_exit_confirmation') as IWindowContainer | null;

            this._exitConfirmation?.findChildByName('yes')
                ?.addEventListener(WindowMouseEvent.CLICK, (event) => this.confirmationHandler(event as WindowMouseEvent));
            this._exitConfirmation?.findChildByName('no')
                ?.addEventListener(WindowMouseEvent.CLICK, (event) => this.confirmationHandler(event as WindowMouseEvent));
            this._exitConfirmation?.findChildByTag('close')
                ?.addEventListener(WindowMouseEvent.CLICK, (event) => this.confirmationHandler(event as WindowMouseEvent));
        }
        else
        {
            this._exitConfirmation.visible = true;
            this._exitConfirmation.activate();
        }
    }

    // AS3: SnowWarUI.as::confirmationHandler()
    private confirmationHandler(event: WindowMouseEvent): void
    {
        if(event.window?.name === 'yes')
        {
            this._engine?.send(new Game2ExitGameMessageComposer());
            this._engine?.resetGameSession();
            this._engine?.resetRoomSession();
        }
        else if(this._exitConfirmation)
        {
            this._exitConfirmation.visible = false;
        }
    }

    /** Lights up `count` of the five rack slots and parks the spinner over the first empty one. */
    // AS3: SnowWarUI.as::set snowballs()
    public setSnowballs(count: number): void
    {
        for(let i = 0; i < SnowWarUI.MAX_SNOWBALLS; i++)
        {
            const ball = this._snowballs?.findChildByName(`ball_${i}`) ?? null;

            if(ball) ball.visible = i < count;
        }

        this._snowballCount = count;

        const next = this._snowballs?.findChildByName(`ball_${count}`) ?? null;

        if(next !== null && this._ballProgress)
        {
            this._ballProgress.x = next.x;
            this._ballProgress.y = next.y;
        }
    }

    // AS3: SnowWarUI.as::set ownScore()
    public setOwnScore(score: number): void
    {
        WindowUtils.setCaption(this._ownStats?.findChildByName('personal_score') ?? null, `${score}`);
    }

    /**
     * Seconds left in the stage, as `mm:ss`.
     *
     * Under five seconds it also plays a tick and arms a half-second one-shot that *hides* the
     * label again — the clock blinks, and the blink is driven by the fact that the server keeps
     * sending the same second until it changes.
     */
    // AS3: SnowWarUI.as::set timer()
    public setTimer(seconds: number): void
    {
        if(this._isStaff && this._checksumIndicatorColor && this._tweenColor && this._timerWindow)
        {
            this._checksumIndicatorColor.tweenTo(this._tweenColor);

            const indicator = this._timerWindow.getChildByName('checksumIndicator');

            if(indicator) indicator.color = this._checksumIndicatorColor.rgb;
        }

        if(this._lastTimerValue === seconds) return;

        this._lastTimerValue = seconds;

        let minutes = `${Math.trunc(seconds / 60)}`;
        let remainder = `${Math.trunc(seconds % 60)}`;

        if(parseInt(minutes, 10) < 10) minutes = `0${minutes}`;
        if(parseInt(remainder, 10) < 10) remainder = `0${remainder}`;

        WindowUtils.showElement(this._timerWindow, 'time_left');
        WindowUtils.setCaption(this._timerWindow?.findChildByName('time_left') ?? null, `${minutes}:${remainder}`);

        if(seconds <= 5 && seconds > 0)
        {
            SnowWarEngine.playSound('HBST_call_for_help');

            if(this._timerHider !== null) clearTimeout(this._timerHider);

            this._timerHider = setTimeout(() => this.onTimerHider(), 500);
        }
    }

    // AS3: SnowWarUI.as::onTimerHider()
    private onTimerHider(): void
    {
        this._timerHider = null;

        if(this._timerWindow) WindowUtils.hideElement(this._timerWindow, 'time_left');
    }

    // AS3: SnowWarUI.as::set hitPoints()
    public setHitPoints(hitPoints: number): void
    {
        if(this._lastHitPoints === hitPoints) return;

        WindowUtils.setElementImage(
            this.getElement(this._ownStats, 'energy_bar'),
            this.getBitmap(`ui_me_health_${Math.min(SnowWarUI.MAX_ENERGY, hitPoints)}`)
        );

        this._lastHitPoints = hitPoints;
    }

    /** Paints the clock in the desync colour. Staff-only, like the indicator itself. */
    // AS3: SnowWarUI.as::showChecksumError()
    public showChecksumError(color: number): void
    {
        if(!this._isStaff) return;

        if(this._timerWindow) this._timerWindow.color = color;

        this._checksumIndicatorColor?.fromInt(color);
    }

    // AS3: SnowWarUI.as::initCounter()
    public initCounter(): void
    {
        this._timeSinceLastUpdate = 0;
        this._counterFrame = 1;
    }

    // AS3: SnowWarUI.as::update()
    public update(elapsed: number): void
    {
        this.updateAmmoDisplay();
        this.updateCounterImage(elapsed);
        this.updateScoreFlash(elapsed);
        this.updateTeamScores();
    }

    // AS3: SnowWarUI.as::updateScoreFlash()
    private updateScoreFlash(elapsed: number): void
    {
        if(this._scoreFlashElapsed <= 0) return;

        const frame = Math.trunc(this._scoreFlashElapsed / SnowWarUI.SCORE_FRAME_LENGTH) + 1;

        if(frame > SnowWarUI.SCORE_FLASH_FRAMES)
        {
            this._scoreFlashElapsed = 0;

            if(this._scoreFlash) this._scoreFlash.visible = false;

            return;
        }

        this._scoreFlashElapsed += elapsed;

        if(this._scoreFlash) this._scoreFlash.visible = true;

        WindowUtils.setElementImage(this._scoreFlash, this.getBitmap(`${this._scoreFlashPrefix}${frame}`));
    }

    // AS3: SnowWarUI.as::flashOwnScore()
    public flashOwnScore(gained: boolean): void
    {
        this._scoreFlashElapsed = 1;
        this._scoreFlashPrefix = gained ? 'ui_me_plus_' : 'ui_me_minus_';
    }

    /** The empty-rack flash only shows when there is nothing left *and* nothing being packed. */
    // AS3: SnowWarUI.as::updateAmmoDisplay()
    private updateAmmoDisplay(): void
    {
        if(this._emptyAmmoFlash)
        {
            this._emptyAmmoFlash.visible = this._snowballCount === 0 && this._loadAnimation === null;
        }
    }

    /**
     * The countdown, then the explosion: frames 1-5 at one a second, 6-10 at one every 100 ms, and
     * the window disposed at 11.
     *
     * The frames are drawn at `-offset`, not centred — these assets carry their own registration
     * point, and the counter window is the size of the largest of them.
     */
    // AS3: SnowWarUI.as::updateCounterImage()
    private updateCounterImage(elapsed: number): void
    {
        this._timeSinceLastUpdate += elapsed;

        let advance = false;

        if(this._counterFrame < 6)
        {
            if(this._timeSinceLastUpdate >= 1000)
            {
                advance = true;
                this._timeSinceLastUpdate = 0;
            }
        }
        else if(this._counterFrame < 11)
        {
            if(this._timeSinceLastUpdate > 100)
            {
                advance = true;
                this._timeSinceLastUpdate = 0;
            }
        }
        else if(this._counter)
        {
            this._counter.dispose();
            this._counter = null;
        }

        if(!advance || this._disposed || !this._counter) return;

        const asset = this._engine?.assets?.getAssetByName(this.padName('explosion', this._counterFrame)) as BitmapDataAsset | null;
        const frame = (asset?.content ?? null) as ImageBitmap | null;

        if(asset && frame)
        {
            this._counter.bitmap = drawIntoBitmapSlot(
                frame,
                this._counter.width,
                this._counter.height,
                false,
                // AS3 copies to `-offset`, from the top-left rather than centred; the offset term
                // here cancels `drawIntoBitmapSlot()`'s centring and puts it back at that corner.
                Math.floor((frame.width - this._counter.width) * 0.5) - asset.offset.x,
                Math.floor((frame.height - this._counter.height) * 0.5) - asset.offset.y
            );

            this._counter.invalidate();
        }

        this._counterFrame += 1;
    }

    // AS3: SnowWarUI.as::padName()
    private padName(name: string, index: number, length: number = 4): string
    {
        return name + `${index}`.padStart(length, '0');
    }

    // AS3: SnowWarUI.as::updateTeamScores()
    private updateTeamScores(): void
    {
        const scores = this._engine?.gameArena?.getTeamScores() ?? [];

        if(scores.length >= 2)
        {
            WindowUtils.setCaption(this._teamScores?.findChildByName('score_blue') ?? null, `${scores[0]}`);
            WindowUtils.setCaption(this._teamScores?.findChildByName('score_red') ?? null, `${scores[1]}`);
        }
    }

    // AS3: SnowWarUI.as::makeSnowballButtonPressed()
    private makeSnowballButtonPressed(pressed: boolean): void
    {
        if(this._makingSnowballs !== pressed)
        {
            WindowUtils.setElementImage(
                this._makeSnowballImage,
                this.getBitmap(`ui_make_balls_${pressed ? 'down' : 'up'}`)
            );
        }

        this._makingSnowballs = pressed;
    }

    // AS3: SnowWarUI.as::dispose()
    public dispose(): void
    {
        const desktop = this._engine?.windowManager?.getDesktop(1) ?? null;

        if(desktop) desktop.visible = true;

        this._engine = null;

        if(this._exit)
        {
            this._exit.dispose();
            this._exit = null;
        }

        if(this._snowballs)
        {
            this._makeSnowballImage = null;
            this._ballProgress = null;
            this._emptyAmmoFlash = null;
            this._snowballs.dispose();
            this._snowballs = null;
        }

        if(this._ownStats)
        {
            this._scoreFlash = null;
            this._ownStats.dispose();
            this._ownStats = null;
        }

        if(this._timerWindow)
        {
            this._timerWindow.dispose();
            this._timerWindow = null;
        }

        if(this._teamScores)
        {
            this._teamScores.dispose();
            this._teamScores = null;
        }

        if(this._counter)
        {
            this._counter.dispose();
            this._counter = null;
        }

        if(this._emptyAmmoAnimation !== null)
        {
            this._emptyAmmoAnimation.dispose();
            this._emptyAmmoAnimation = null;
        }

        if(this._exitConfirmation)
        {
            this._exitConfirmation.dispose();
            this._exitConfirmation = null;
        }

        if(this._timerHider !== null)
        {
            clearTimeout(this._timerHider);
            this._timerHider = null;
        }

        this.disposeLoadIcon();
        this._disposed = true;
    }
}
