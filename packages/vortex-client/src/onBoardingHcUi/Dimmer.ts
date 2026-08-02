/**
 * Dimmer
 *
 * AS3: sources/WIN63-202607011411-782849652/src/onBoardingHcUi/Dimmer.as
 *
 * A stage-sized translucent fill, used behind the onboarding dialogs. The 2×2 pattern has one
 * lighter pixel, which is what gives the dim its faint dither instead of a flat wash.
 */
import {BitmapData} from './display/BitmapData';
import {Sprite} from './display/DisplayObjectContainer';

export class Dimmer extends Sprite
{
    // AS3: _fill
    private readonly _fill: BitmapData;

    // AS3: Dimmer()
    constructor()
    {
        super();

        const blended = 1 - (1 - 0.75) * (1 - 0.06);
        const channel = Math.trunc((255 * 0.06) / blended);

        this._fill = new BitmapData(2, 2, true, Math.trunc(0.75 * 255) << 24);
        this._fill.setPixel32(0, 0, ((Math.trunc(blended * 255) << 24) + channel * 65793) >>> 0);

        this.addEventListener('addedToStage', this._onAddedToStage);
        this.addEventListener('removedFromStage', this._onRemovedFromStage);
    }

    // AS3: onStageResize(_arg_1:Event)
    private _onStageResize = (): void =>
    {
        const stage = this.stage;

        if(!stage) return;

        this.graphics.clear();
        this.graphics.beginBitmapFill(this._fill);
        this.graphics.drawRect(0, 0, stage.stageWidth, stage.stageHeight);
        this.graphics.endFill();
        this.width = stage.stageWidth;
        this.height = stage.stageHeight;
        this.x = -Math.trunc(this.width / 2);
        this.y = -Math.trunc(this.height / 2);
    };

    // AS3: onAddedToStage(_arg_1:Event)
    private _onAddedToStage = (): void =>
    {
        this.stage?.addEventListener('resize', this._onStageResize);
        this._onStageResize();
    };

    // AS3: onRemovedFromStage(_arg_1:Event)
    private _onRemovedFromStage = (): void =>
    {
        this.stage?.removeEventListener('resize', this._onStageResize);
    };
}
