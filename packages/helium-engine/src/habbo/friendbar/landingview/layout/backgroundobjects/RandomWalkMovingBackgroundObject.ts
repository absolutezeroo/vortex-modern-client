import type {EventEmitter} from 'eventemitter3';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboLandingView} from '../../HabboLandingView';
import {BackgroundObject} from './BackgroundObject';
import {PathResetEvent} from './events/PathResetEvent';
import {MathUtils} from '@habbo/utils/MathUtils';

/**
 * Background object that drifts with a base velocity perturbed by a random
 * offset re-rolled every `intervalMs`, smoothly interpolated between rolls.
 *
 * Data content format: `<image>;<type>;<startX>;<startY>;<speedX>;<speedY>;<randRangeX>;<randRangeY>;<intervalMs>`
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/RandomWalkMovingBackgroundObject.as
 */
export class RandomWalkMovingBackgroundObject extends BackgroundObject
{
    private _startX: number;
    private _startY: number;
    private _speedX: number;
    private _speedY: number;
    private _randRangeX: number;
    private _randRangeY: number;
    private _intervalMs: number;
    private _posX: number;
    private _posY: number;
    private _elapsedAccum: number = 0;
    private _prevOffsetX: number = 0;
    private _prevOffsetY: number = 0;
    private _curOffsetX: number = 0;
    private _curOffsetY: number = 0;
    private _lastIntervalTime: number = 0;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/RandomWalkMovingBackgroundObject.as::RandomWalkMovingBackgroundObject()
    constructor(id: number, container: IWindowContainer, events: EventEmitter, landingView: HabboLandingView, dataContent: string)
    {
        super(id, container, events, landingView, dataContent, false);

        const parts = dataContent.split(';');
        const imageName = parts[0];

        this._startX = parseInt(parts[2], 10);
        this._startY = parseInt(parts[3], 10);
        this._speedX = Number(parts[4]);
        this._speedY = Number(parts[5]);
        this._randRangeX = Number(parts[6]);
        this._randRangeY = Number(parts[7]);
        this._intervalMs = parseInt(parts[8], 10);
        this._posX = this._startX;
        this._posY = this._startY;

        if(this.sprite)
        {
            this.sprite.assetUri = '${image.library.url}' + imageName + '.png';
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/RandomWalkMovingBackgroundObject.as::update()
    override update(elapsedTime: number): void
    {
        super.update(elapsedTime);

        const sprite = this.sprite;

        if(!sprite || !this.window) return;

        this._elapsedAccum += elapsedTime;

        if(this._elapsedAccum - this._lastIntervalTime > this._intervalMs)
        {
            this._prevOffsetX = this._curOffsetX;
            this._prevOffsetY = this._curOffsetY;
            this._curOffsetX = (Math.random() * 2 - 1) * this._randRangeX;
            this._curOffsetY = (Math.random() * 2 - 1) * this._randRangeY;
            this._lastIntervalTime = this._elapsedAccum;
        }

        const width = this.window.width;
        const height = this.window.height;
        const t = (this._elapsedAccum - this._lastIntervalTime) / this._intervalMs;

        this._posX += (elapsedTime / 1000) * (this._speedX + MathUtils.lerp(t, this._prevOffsetX, this._curOffsetX));
        this._posY += (elapsedTime / 1000) * (this._speedY + MathUtils.lerp(t, this._prevOffsetY, this._curOffsetY));

        sprite.x = this._posX;
        sprite.y = this._posY;

        const outOfBounds =
            (this._speedX > 0 && sprite.x > width) ||
            (this._speedX < 0 && sprite.x + sprite.width < 0) ||
            (this._speedY > 0 && sprite.y > height) ||
            (this._speedY < 0 && sprite.y + sprite.height < 0);

        if(outOfBounds)
        {
            this._posX = this._startX;
            this._posY = this._startY;
            this.events.emit(PathResetEvent.MOVING_OBJECT_PATH_RESET, new PathResetEvent(this.id));
        }
    }
}
