import type {EventEmitter} from 'eventemitter3';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboLandingView} from '../../HabboLandingView';
import {BackgroundObject} from './BackgroundObject';
import {PathResetEvent} from './events/PathResetEvent';

/**
 * Background object that spirals inward/outward around a fixed center point.
 *
 * Data content format: `<image>;<type>;<startRadius>;<startAngle>;<speedRadius>;<speedAngle>;<centerX>;<centerY>`
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/SpiralMovingBackgroundObject.as
 */
export class SpiralMovingBackgroundObject extends BackgroundObject
{
    private _startRadius: number;
    private _startAngle: number;
    private _posRadius: number;
    private _posAngle: number;
    private _speedRadius: number;
    private _speedAngle: number;
    private _centerX: number;
    private _centerY: number;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/SpiralMovingBackgroundObject.as::SpiralMovingBackgroundObject()
    constructor(id: number, container: IWindowContainer, events: EventEmitter, landingView: HabboLandingView, dataContent: string)
    {
        super(id, container, events, landingView, dataContent);

        const parts = dataContent.split(';');
        const imageName = parts[0];

        this._startRadius = parseInt(parts[2], 10);
        this._startAngle = parseInt(parts[3], 10);
        this._speedRadius = Number(parts[4]);
        this._speedAngle = Number(parts[5]);
        this._centerX = Number(parts[6]);
        this._centerY = Number(parts[7]);
        this._posRadius = this._startRadius;
        this._posAngle = this._startAngle;

        if(this.sprite)
        {
            this.sprite.assetUri = '${image.library.url}reception/' + imageName + '.png';
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/SpiralMovingBackgroundObject.as::update()
    override update(elapsedTime: number): void
    {
        super.update(elapsedTime);

        const sprite = this.sprite;

        if(!sprite) return;

        const ratio = this._startRadius / this._posRadius;
        const scaleFactor = 1 + this._startRadius / this._posRadius / 8;

        this._posRadius += elapsedTime * this._speedRadius;
        this._posAngle += elapsedTime * this._speedAngle * ratio;

        if(sprite.bitmapData)
        {
            if(this._posRadius <= 0)
            {
                this._posRadius = this._startRadius;
                sprite.width = sprite.bitmapData.width;
                sprite.height = sprite.bitmapData.height;
                this.events.emit(PathResetEvent.MOVING_OBJECT_PATH_RESET, new PathResetEvent(this.id));
            }
        }

        if(this._posRadius > this._startRadius)
        {
            this._posRadius = 0;
            sprite.width = 0;
            sprite.height = 0;
            this.events.emit(PathResetEvent.MOVING_OBJECT_PATH_RESET, new PathResetEvent(this.id));
        }

        if(this._posAngle < 0)
        {
            this._posAngle = Math.PI * 2;
        }

        if(this._posAngle > Math.PI * 2)
        {
            this._posAngle = 0;
        }

        sprite.x = this._centerX + Math.sin(this._posAngle) * this._posRadius;
        sprite.y = this._centerY + Math.cos(this._posAngle) * this._posRadius;

        if(sprite.bitmapData)
        {
            sprite.pivotPoint = 4;
            sprite.stretchedX = true;
            sprite.stretchedY = true;
            sprite.width = sprite.bitmapData.width / scaleFactor;
            sprite.height = sprite.bitmapData.height / scaleFactor;
        }
    }
}
