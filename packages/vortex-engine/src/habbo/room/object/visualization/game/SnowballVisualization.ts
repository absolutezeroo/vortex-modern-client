import type {Texture} from 'pixi.js';
import type {IRoomObjectSprite} from '@room/object/visualization/IRoomObjectSprite';
import type {IRoomObjectVisualizationData} from '@room/object/visualization/IRoomObjectVisualizationData';
import {RoomObjectSpriteVisualization} from '@room/object/visualization/RoomObjectSpriteVisualization';
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import type {GameObjectVisualization} from '../furniture/GameObjectVisualization';

/**
 * A snowball: two sprites, the ball and its shadow.
 *
 * The shadow is what sells the arc. It is drawn at the ball's *height* below it — `z * 16` — and
 * faded out as that height grows, so a lobbed ball rises away from a shadow that stays on the floor
 * and gets fainter. `relativeDepth = 1` keeps it sorted behind everything else on the tile.
 *
 * The two asset names lose the `_png` suffix AS3 spells them with: this port's library is keyed by
 * the shipped filename, where `snowball_small_png` is `snowball_small`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/visualization/game/SnowballVisualization.as
 */
export class SnowballVisualization extends RoomObjectSpriteVisualization
{
    // AS3: SnowballVisualization.as::SNOWBALL_ASSET_NAME
    private static readonly SNOWBALL_ASSET_NAME: string = 'snowball_small';

    // AS3: SnowballVisualization.as::SNOWBALL_SHADOW_ASSET_NAME
    private static readonly SNOWBALL_SHADOW_ASSET_NAME: string = 'snowball_small_shadow';

    /** Derived name — `_SafeStr_10967`; the height-to-pixels factor the shadow offset uses. */
    // AS3: SnowballVisualization.as::_SafeStr_10967
    private static readonly SHADOW_HEIGHT_SCALE: number = 16;

    /** Derived name — `_SafeStr_4556`; the shared game visualization data, for its asset library. */
    // AS3: SnowballVisualization.as::_SafeStr_4556
    private _visualizationData: GameObjectVisualization | null = null;

    /** Derived name — `_SafeStr_5746`; sprite 1, kept because `update()` touches it every frame. */
    // AS3: SnowballVisualization.as::_SafeStr_5746
    private _shadowSprite: IRoomObjectSprite | null = null;

    // AS3: SnowballVisualization.as::initialize()
    override initialize(data: IRoomObjectVisualizationData): boolean
    {
        this._visualizationData = data as unknown as GameObjectVisualization;

        this.createSprites(2);

        const ball = this.getSprite(0);

        if(ball) ball.texture = this.getTexture(SnowballVisualization.SNOWBALL_ASSET_NAME);

        this._shadowSprite = this.getSprite(1);

        if(this._shadowSprite)
        {
            this._shadowSprite.texture = this.getTexture(SnowballVisualization.SNOWBALL_SHADOW_ASSET_NAME);
            this._shadowSprite.alpha = 100;
            this._shadowSprite.relativeDepth = 1;
        }

        return true;
    }

    // TS-only: AS3 reads `assets.getAssetByName(name).content as BitmapData` inline; here the asset
    // is typed `unknown` and the sprite takes a PixiJS `Texture`, so the cast lives in one place.
    private getTexture(name: string): Texture | null
    {
        return (this._visualizationData?.assets?.getAssetByName(name)?.content ?? null) as Texture | null;
    }

    // AS3: SnowballVisualization.as::update()
    override update(_geometry: IRoomGeometry, _time: number, _update: boolean, _skipUpdate: boolean): void
    {
        if(!this._shadowSprite) return;

        this._shadowSprite.offsetY = (this.object?.getLocation()?.z ?? 0) * SnowballVisualization.SHADOW_HEIGHT_SCALE;
        this._shadowSprite.alpha = Math.max(0, 100 - this._shadowSprite.offsetY / 10);
    }

    // AS3: SnowballVisualization.as::dispose()
    override dispose(): void
    {
        this._shadowSprite = null;

        super.dispose();
    }
}
