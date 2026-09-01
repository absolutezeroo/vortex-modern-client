import type {Texture} from 'pixi.js';
import type {IRoomObjectVisualizationData} from '@room/object/visualization/IRoomObjectVisualizationData';
import {RoomObjectSpriteVisualization} from '@room/object/visualization/RoomObjectSpriteVisualization';
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import type {GameObjectVisualization} from '../furniture/GameObjectVisualization';

/**
 * The three-frame puff where a snowball landed.
 *
 * It has no timing of its own: one frame per `update()`, so it plays at whatever rate the room
 * renderer runs. Past the third frame the sprite's texture is cleared and the object simply draws
 * nothing until `GameArenaView` disposes it, half a second after it was made.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/visualization/game/SnowSplashVisualization.as
 */
export class SnowSplashVisualization extends RoomObjectSpriteVisualization
{
    // AS3: SnowSplashVisualization.as::FRAME_ASSET_NAMES
    private static readonly FRAME_ASSET_NAMES: string[] = [
        'snowball_splash_1',
        'snowball_splash_2',
        'snowball_splash_3'
    ];

    // AS3: SnowSplashVisualization.as::_frameNumber
    private _frameNumber: number = 0;

    /** Derived name — `_SafeStr_4556`; the shared game visualization data, for its asset library. */
    // AS3: SnowSplashVisualization.as::_SafeStr_4556
    private _visualizationData: GameObjectVisualization | null = null;

    // AS3: SnowSplashVisualization.as::get isDone()
    get isDone(): boolean
    {
        return this._frameNumber >= SnowSplashVisualization.FRAME_ASSET_NAMES.length;
    }

    // AS3: SnowSplashVisualization.as::initialize()
    override initialize(data: IRoomObjectVisualizationData): boolean
    {
        this._visualizationData = data as unknown as GameObjectVisualization;

        this.createSprites(1);

        const sprite = this.getSprite(0);

        if(sprite) sprite.texture = this.getFrameTexture(this._frameNumber);

        return true;
    }

    // TS-only: AS3 reads `assets.getAssetByName(name).content as BitmapData` inline; here the asset
    // is typed `unknown` and the sprite takes a PixiJS `Texture`, so the cast lives in one place.
    private getFrameTexture(frameNumber: number): Texture | null
    {
        const name = SnowSplashVisualization.FRAME_ASSET_NAMES[frameNumber];

        return (this._visualizationData?.assets?.getAssetByName(name)?.content ?? null) as Texture | null;
    }

    // AS3: SnowSplashVisualization.as::update()
    override update(_geometry: IRoomGeometry, _time: number, _update: boolean, _skipUpdate: boolean): void
    {
        this._frameNumber += 1;

        const sprite = this.getSprite(0);

        if(!sprite) return;

        sprite.texture = this.isDone ? null : this.getFrameTexture(this._frameNumber);
    }
}
