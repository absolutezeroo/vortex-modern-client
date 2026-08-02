/**
 * RandomAvatarCloudsAnimation
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/onBoardingHcSteps/RandomAvatarCloudsAnimation.as
 *
 * The puff of clouds that fires whenever the avatar editor rolls a random look. Three sprites (a
 * left, a right and a downward puff) step through four frames on an 80ms timer, drifting apart by
 * a per-run random amount, and hide themselves on the ninth tick.
 *
 * One AS3 detail worth keeping: on every tick one of the two visible puffs is swapped for the
 * fourth ("alt") frame set, chosen by a coin flip — which is what stops the animation from looking
 * identical run to run.
 */
import {Bitmap} from '../onBoardingHcUi/display/Bitmap';
import {Sprite} from '../onBoardingHcUi/display/DisplayObjectContainer';
import {Timer} from '../onBoardingHcUi/display/Timer';
import {LoginAssets} from '../onBoardingHcUi/LoginAssets';

export class RandomAvatarCloudsAnimation extends Sprite
{
    // AS3: _leftFrames
    private _leftFrames: Bitmap[];

    // AS3: _rightFrames
    private _rightFrames: Bitmap[];

    // AS3: _downFrames
    private _downFrames: Bitmap[];

    // AS3: _altFrames
    private _altFrames: Bitmap[];

    // AS3: _animationTimer
    private _animationTimer: Timer | null = null;

    // AS3: _tickCount
    private _tickCount: number = 0;

    // AS3: _animationFrame
    private _animationFrame: number = 0;

    // AS3: _leftCloud
    private _leftCloud: Sprite | null = null;

    // AS3: _rightCloud
    private _rightCloud: Sprite | null = null;

    // AS3: _downCloud
    private _downCloud: Sprite | null = null;

    // AS3: _driftSteps
    private readonly _driftSteps: number[] = [-9, -8, -5, -3, 3, 5, 8, 9];

    // AS3: _drift
    private _drift: number = 0;

    // AS3: RandomAvatarCloudsAnimation()
    constructor()
    {
        super();

        this._rightFrames = [
            new Bitmap(LoginAssets.get('c1_1')),
            new Bitmap(LoginAssets.get('c1_2')),
            new Bitmap(LoginAssets.get('c1_3')),
            new Bitmap(LoginAssets.get('c1_4')),
        ];
        this._leftFrames = [
            new Bitmap(LoginAssets.get('c2_1')),
            new Bitmap(LoginAssets.get('c2_2')),
            new Bitmap(LoginAssets.get('c2_3')),
            new Bitmap(LoginAssets.get('c2_4')),
        ];
        this._downFrames = [
            new Bitmap(LoginAssets.get('c3_1')),
            new Bitmap(LoginAssets.get('c3_2')),
            new Bitmap(LoginAssets.get('c3_3')),
            new Bitmap(LoginAssets.get('c3_4')),
        ];
        this._altFrames = [
            new Bitmap(LoginAssets.get('c4_1')),
            new Bitmap(LoginAssets.get('c4_2')),
            new Bitmap(LoginAssets.get('c4_3')),
            new Bitmap(LoginAssets.get('c4_4')),
        ];
        this.addEventListener('addedToStage', this._onAddedToStage);
    }

    // AS3: startAnimation()
    public startAnimation(): void
    {
        this.resetAnimation();

        if(!this._animationTimer)
        {
            this._animationTimer = new Timer(80);
            this._animationTimer.addEventListener('timer', this._onAnimateTimer);
        }

        const index = Math.round(Math.random() * (this._driftSteps.length - 1));

        this._drift = this._driftSteps[index];
        this._animationTimer.start();
    }

    // AS3: onAddedToStage(_arg_1:Event)
    private _onAddedToStage = (): void =>
    {
        this._downCloud = new Sprite();
        this.addChild(this._downCloud);
        this._leftCloud = new Sprite();
        this.addChild(this._leftCloud);
        this._rightCloud = new Sprite();
        this.addChild(this._rightCloud);
        this.resetAnimation();
    };

    // AS3: resetAnimation()
    private resetAnimation(): void
    {
        if(!this._downCloud || !this._leftCloud || !this._rightCloud) return;

        this._tickCount = 0;
        this._animationFrame = 0;
        this._downCloud.addChild(this._downFrames[0]);
        this._downCloud.x = 75;
        this._downCloud.y = 140;
        this._leftCloud.addChild(this._leftFrames[0]);
        this._leftCloud.x = 30;
        this._leftCloud.y = 115;
        this._rightCloud.addChild(this._rightFrames[0]);
        this._rightCloud.x = 85;
        this._rightCloud.y = 110;
        this._downCloud.visible = true;
        this._leftCloud.visible = true;
        this._rightCloud.visible = true;
    }

    // AS3: onAnimateTimer(_arg_1:TimerEvent)
    private _onAnimateTimer = (): void =>
    {
        if(this._animationTimer == null) return;

        if(!this._downCloud || !this._leftCloud || !this._rightCloud) return;

        this._tickCount++;

        if(this._tickCount > 2 && this._tickCount < 5)
        {
            this._animationFrame = 1;
        }
        else if(this._tickCount > 4 && this._tickCount < 7)
        {
            this._animationFrame = 2;
        }
        else if(this._tickCount > 6 && this._tickCount < 9)
        {
            this._animationFrame = 3;
        }
        else if(this._tickCount >= 9)
        {
            this._downCloud.visible = false;
            this._leftCloud.visible = false;
            this._rightCloud.visible = false;
        }

        this._downCloud.removeChildAt(0);
        this._leftCloud.removeChildAt(0);
        this._rightCloud.removeChildAt(0);
        this._downCloud.addChild(this._downFrames[this._animationFrame]);
        this._leftCloud.addChild(this._leftFrames[this._animationFrame]);
        this._rightCloud.addChild(this._rightFrames[this._animationFrame]);

        // Coin flip: one of the two puffs gets the alt frame set this tick.
        const flip = Math.round(Math.random() * 10);

        if(flip % 2 !== 0)
        {
            this._rightCloud.removeChildAt(0);
            this._rightCloud.addChild(this._altFrames[this._animationFrame]);
        }
        else
        {
            this._downCloud.removeChildAt(0);
            this._downCloud.addChild(this._altFrames[this._animationFrame]);
        }

        if(this._tickCount <= 9)
        {
            this._rightCloud.x += 10 + Math.random() * 5;
            this._rightCloud.y -= this._drift;
            this._leftCloud.x -= 10 + Math.random() * 5;
            this._leftCloud.y -= this._drift;
            this._downCloud.y += this._drift * 1.3;
        }
    };

    // AS3: dispose()
    public dispose(): void
    {
        if(this._animationTimer)
        {
            this._animationTimer.reset();
            this._animationTimer = null;
        }

        while(this.numChildren > 0)
        {
            this.removeChildAt(0);
        }
    }
}
