/**
 * Background (onboarding)
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/onBoardingHcSteps/Background.as
 *
 * The new-user flow's backdrop. Byte-for-byte the same drawing as the login flow's `Background`
 * (same gradient, same hitch tile) — AS3 keeps two classes because they sit in different packages
 * and embed the tile separately, so the port keeps two as well rather than sharing one and losing
 * the trace on either side.
 */
import type {BitmapData} from '../onBoardingHcUi/display/BitmapData';
import {Sprite} from '../onBoardingHcUi/display/DisplayObjectContainer';
import {Matrix} from '../onBoardingHcUi/display/Geom';
import {LoginAssets} from '../onBoardingHcUi/LoginAssets';

export class Background extends Sprite
{
    // AS3: _backgroundImage — background_tiles_png (hitchTile_png)
    private _backgroundImage: BitmapData | null = null;

    // AS3: _disposed
    private _disposed: boolean = false;

    // AS3: _lines
    private _lines: Sprite | null = null;

    // AS3: Background()
    constructor()
    {
        super();

        this.addEventListener('addedToStage', this._onAddedToStage);
        this.addEventListener('removedFromStage', this._onRemovedFromStage);
    }

    // AS3: get disposed():Boolean
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: resize()
    public resize(): void
    {
        const stage = this.stage;

        if(!stage) return;

        const colors = [809599, 801381];
        const alphas = [1, 1];
        const ratios = [127, 255];
        const matrix = new Matrix();

        matrix.createGradientBox(50, 100, 0, 0, 0);
        matrix.rotate(Math.PI / 2);
        matrix.scale(stage.stageWidth / 50, stage.stageHeight / 100);

        this.graphics.clear();
        this.graphics.beginGradientFill(colors, alphas, ratios, matrix);
        this.graphics.drawRect(0, 0, stage.stageWidth, stage.stageHeight);
        this.graphics.endFill();

        if(this._lines != null && this._backgroundImage != null)
        {
            this._lines.graphics.clear();
            this._lines.graphics.beginBitmapFill(this._backgroundImage);
            this._lines.graphics.drawRect(0, 0, stage.stageWidth, stage.stageHeight);
            this._lines.graphics.endFill();
        }
    }

    // AS3: onAddedToStage(_arg_1:Event)
    private _onAddedToStage = (): void =>
    {
        this._lines = new Sprite();
        this._backgroundImage = LoginAssets.get('hitchTile');
        this.addChild(this._lines);
        this.resize();
    };

    // AS3: onRemovedFromStage(_arg_1:Event) — empty in AS3
    private _onRemovedFromStage = (): void =>
    {
        // AS3 leaves this empty.
    };

    // AS3: dispose()
    public dispose(): void
    {
        this._disposed = true;

        while(this.numChildren > 0)
        {
            this.removeChildAt(0);
        }
    }
}
