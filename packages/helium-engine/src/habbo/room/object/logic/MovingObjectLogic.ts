/**
 * MovingObjectLogic
 *
 * Based on AS3: com.sulake.habbo.room.object.logic.MovingObjectLogic
 *
 * Base class for moving room objects with position interpolation.
 */
import type {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';
import type {IRoomObjectController} from '@room/object/IRoomObjectController';
import {ObjectLogicBase} from '@room/object/logic/ObjectLogicBase';
import type {IVector3d} from '@room/utils/IVector3d';
import {Vector3d} from '@room/utils/Vector3d';
import type {RoomObjectMoveUpdateMessage} from '../../messages/RoomObjectMoveUpdateMessage';
import {RoomObjectMoveEvent} from '../../events/RoomObjectMoveEvent';

export class MovingObjectLogic extends ObjectLogicBase
{
    public static readonly DEFAULT_UPDATE_INTERVAL = 500;

    private static readonly _helperVector: Vector3d = new Vector3d();

    private _delta: Vector3d = new Vector3d();
    private _location: Vector3d = new Vector3d();
    private _liftAmount: number = 0;
    private _changeTime: number = 0;

    override get object(): IRoomObjectController | null
    {
        return super.object;
    }

    override set object(value: IRoomObjectController | null)
    {
        super.object = value;

        if(value !== null)
        {
            this._location.assign(value.getLocation());
        }
    }

    private _moveUpdateInterval: number = 500;

    protected set moveUpdateInterval(value: number)
    {
        if(value <= 0)
        {
            value = 1;
        }

        this._moveUpdateInterval = value;
    }

    private _lastUpdateTime: number = 0;

    protected get lastUpdateTime(): number
    {
        return this._lastUpdateTime;
    }

    override dispose(): void
    {
        super.dispose();
    }

    override processUpdateMessage(message: RoomObjectUpdateMessage): void
    {
        if(message === null)
        {
            return;
        }

        super.processUpdateMessage(message);

        const moveMessage = message as RoomObjectMoveUpdateMessage;

        if(moveMessage && moveMessage.skipPositionUpdate)
        {
            return;
        }

        if(message.loc !== null)
        {
            this._location.assign(message.loc);
        }

        if(message.loc !== null)
        {
            this._delta.x = 0;
            this._delta.y = 0;
            this._delta.z = 0;
        }

        if(!moveMessage || !('targetLoc' in moveMessage))
        {
            return;
        }

        if(this.object !== null)
        {
            if(message.loc !== null)
            {
                const targetLoc = moveMessage.targetLoc;

                this.moveUpdateInterval = isNaN(moveMessage.animationTime!) ? 500 : moveMessage.animationTime!;
                this._changeTime = this._lastUpdateTime;

                this._delta.assign(targetLoc);
                this._delta.sub(this._location);
            }
        }
    }

    override getEventTypes(): string[]
    {
        const types = [RoomObjectMoveEvent.ROME_SLIDE_ANIMATION];

        return this.getAllEventTypes(super.getEventTypes(), types);
    }

    override update(time: number): void
    {
        const offset = this.getLocationOffset();
        const model = this.object?.getModelController();

        if(model !== null && model !== undefined)
        {
            if(offset !== null)
            {
                if(this._liftAmount !== offset.z)
                {
                    this._liftAmount = offset.z;
                    model.setNumber('furniture_lift_amount', this._liftAmount);
                }
            }
            else if(this._liftAmount !== 0)
            {
                this._liftAmount = 0;
                model.setNumber('furniture_lift_amount', this._liftAmount);
            }
        }

        if(this._delta.length > 0 || offset !== null)
        {
            let elapsed = time - this._changeTime;

            if(elapsed === this._moveUpdateInterval >> 1)
            {
                elapsed++;
            }

            if(elapsed > this._moveUpdateInterval)
            {
                elapsed = this._moveUpdateInterval;
            }

            if(this._delta.length > 0)
            {
                MovingObjectLogic._helperVector.assign(this._delta);
                MovingObjectLogic._helperVector.mul(elapsed / this._moveUpdateInterval);
                MovingObjectLogic._helperVector.add(this._location);
            }
            else
            {
                MovingObjectLogic._helperVector.assign(this._location);
            }

            if(offset !== null)
            {
                MovingObjectLogic._helperVector.add(offset);
            }

            if(this.object !== null)
            {
                this.object.setLocation(MovingObjectLogic._helperVector);
            }

            if(elapsed === this._moveUpdateInterval)
            {
                this._delta.x = 0;
                this._delta.y = 0;
                this._delta.z = 0;
            }

            if(this.eventDispatcher)
            {
                this.eventDispatcher.emit(RoomObjectMoveEvent.ROME_SLIDE_ANIMATION, new RoomObjectMoveEvent(RoomObjectMoveEvent.ROME_SLIDE_ANIMATION, this.object));
            }
        }

        this._lastUpdateTime = time;
    }

    protected getLocationOffset(): IVector3d | null
    {
        return null;
    }
}
