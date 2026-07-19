import type {EventEmitter} from 'eventemitter3';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboLandingView} from '../../HabboLandingView';
import {BackgroundObject} from './BackgroundObject';
import {PathResetEvent} from './events/PathResetEvent';

/**
 * Background object that moves in a straight line and resets to its start
 * point once it exits the visible desktop bounds.
 *
 * Data content format: `<image>;<type>;<startX>;<startY>;<speedX>;<speedY>`
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/LinearMovingBackgroundObject.as
 */
export class LinearMovingBackgroundObject extends BackgroundObject
{
    private _startX: number;
    private _startY: number;
    private _speedX: number;
    private _speedY: number;
    private _posX: number;
    private _posY: number;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/LinearMovingBackgroundObject.as::LinearMovingBackgroundObject()
    constructor(id: number, container: IWindowContainer, events: EventEmitter, landingView: HabboLandingView, dataContent: string)
    {
        super(id, container, events, landingView, dataContent);

        const parts = dataContent.split(';');
        const imageName = parts[0];

        this._startX = parseInt(parts[2], 10);
        this._startY = parseInt(parts[3], 10);
        this._speedX = Number(parts[4]);
        this._speedY = Number(parts[5]);
        this._posX = this._startX;
        this._posY = this._startY;

        if(this.sprite)
        {
            this.sprite.assetUri = '${image.library.url}reception/' + imageName + '.png';
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/LinearMovingBackgroundObject.as::update()
    override update(elapsedTime: number): void
    {
        super.update(elapsedTime);

        const sprite = this.sprite;

        if(!sprite || !this.window) return;

        const width = this.window.width;
        const height = this.window.height;

        this._posX += elapsedTime * this._speedX;
        this._posY += elapsedTime * this._speedY;

        sprite.x = this._posX;
        sprite.y = this._posY + (this.window.desktop?.height ?? 0);

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
