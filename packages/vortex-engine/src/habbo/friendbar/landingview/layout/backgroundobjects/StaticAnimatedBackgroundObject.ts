import type {EventEmitter} from 'eventemitter3';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboLandingView} from '../../HabboLandingView';
import {BackgroundObject} from './BackgroundObject';
import {PathResetEvent} from './events/PathResetEvent';

/**
 * Background object that cycles through a fixed set of numbered frame images
 * at a given fps, optionally resynchronizing to frame 0 when a linked object
 * (matched by id in `syncIds`) dispatches a `PathResetEvent`.
 *
 * Data content format: `<image>;<type>;<frameCount>;<fps>;<x>;<y>;<syncIds (comma-separated)>`
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/StaticAnimatedBackgroundObject.as
 */
export class StaticAnimatedBackgroundObject extends BackgroundObject
{
    private _elapsedAccum: number = 0;
    private _imageBaseUri: string;
    private _frameCount: number;
    private _fps: number;
    private _syncIds: string[];
    private _lastSyncTime: number = 0;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/StaticAnimatedBackgroundObject.as::StaticAnimatedBackgroundObject()
    constructor(id: number, container: IWindowContainer, events: EventEmitter, landingView: HabboLandingView, dataContent: string)
    {
        super(id, container, events, landingView, dataContent);

        const parts = dataContent.split(';');

        this._imageBaseUri = '${image.library.url}reception/' + parts[0];
        this._frameCount = parseInt(parts[2], 10);
        this._fps = parseInt(parts[3], 10);
        this._syncIds = String(parts[6]).split(',');

        this.events.on(PathResetEvent.MOVING_OBJECT_PATH_RESET, this.onPathResetEvent);

        if(this.sprite)
        {
            this.sprite.x = parseInt(parts[4], 10);
            this.sprite.y = parseInt(parts[5], 10);
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/StaticAnimatedBackgroundObject.as::dispose()
    override dispose(): void
    {
        this.events.off(PathResetEvent.MOVING_OBJECT_PATH_RESET, this.onPathResetEvent);
        super.dispose();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/StaticAnimatedBackgroundObject.as::update()
    override update(elapsedTime: number): void
    {
        super.update(elapsedTime);

        const sprite = this.sprite;

        if(!sprite) return;

        const frameDurationMs = 1000 / this._fps;
        const elapsedSinceSync = this._elapsedAccum - this._lastSyncTime;
        let frameIndex = this._frameCount - 1;

        if(this._syncIds.length > 0)
        {
            if(elapsedSinceSync < this._frameCount * frameDurationMs)
            {
                frameIndex = Math.floor(elapsedSinceSync / frameDurationMs);
            }
        }
        else
        {
            // AS3 quirk preserved verbatim: modulo by frame duration (ms), not
            // by total animation duration - see sources/win63_2026_crypted_version's
            // StaticAnimatedBackgroundObject.as::update(), only reachable when no syncIds are configured.
            frameIndex = Math.floor(this._elapsedAccum % frameDurationMs);
        }

        sprite.assetUri = this._imageBaseUri + (frameIndex + 1) + '.png';
        this._elapsedAccum += elapsedTime;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/backgroundobjects/StaticAnimatedBackgroundObject.as::onPathResetEvent()
    private onPathResetEvent = (event: PathResetEvent): void =>
    {
        if(this._syncIds.indexOf(event.objectId.toString()) !== -1)
        {
            this._lastSyncTime = this._elapsedAccum;
        }
    };
}
