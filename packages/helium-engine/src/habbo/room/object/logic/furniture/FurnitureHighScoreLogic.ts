/**
 * FurnitureHighScoreLogic
 *
 * @see source_as_flash/com/sulake/habbo/room/object/logic/furniture/FurnitureHighScoreLogic.as
 *
 * Logic for high score display furniture.
 */
import type {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import type {RoomSpriteMouseEvent} from '@room/events/RoomSpriteMouseEvent';
import {FurnitureLogic} from './FurnitureLogic';
import {RoomObjectWidgetRequestEvent} from '@habbo/room/events/RoomObjectWidgetRequestEvent';
import type {RoomObjectDataUpdateMessage} from '@habbo/room/messages/RoomObjectDataUpdateMessage';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';

export class FurnitureHighScoreLogic extends FurnitureLogic
{
    private static readonly SHOW_WIDGET_IN_STATE = 1;

    private _state: number = -1;

    override getEventTypes(): string[]
    {
        return [
            RoomObjectWidgetRequestEvent.ROWRE_HIGH_SCORE_DISPLAY,
            RoomObjectWidgetRequestEvent.ROWRE_HIDE_HIGH_SCORE_DISPLAY
        ];
    }

    override tearDown(): void
    {
        if(this.object?.getModelController()?.getNumber(RoomObjectVariableEnum.FURNITURE_REAL_ROOM_OBJECT) === 1)
        {
            this.eventDispatcher?.emit(
                RoomObjectWidgetRequestEvent.ROWRE_HIDE_HIGH_SCORE_DISPLAY,
                new RoomObjectWidgetRequestEvent(RoomObjectWidgetRequestEvent.ROWRE_HIDE_HIGH_SCORE_DISPLAY, this.object)
            );
        }

        super.tearDown();
    }

    override processUpdateMessage(message: RoomObjectUpdateMessage): void
    {
        super.processUpdateMessage(message);

        if(this.object?.getModelController()?.getNumber(RoomObjectVariableEnum.FURNITURE_REAL_ROOM_OBJECT) !== 1)
        {
            return;
        }

        const dataMessage = message as unknown as RoomObjectDataUpdateMessage;

        if('state' in message && 'data' in message && typeof dataMessage.state === 'number')
        {
            if(dataMessage.state === FurnitureHighScoreLogic.SHOW_WIDGET_IN_STATE)
            {
                this.eventDispatcher?.emit(
                    RoomObjectWidgetRequestEvent.ROWRE_HIGH_SCORE_DISPLAY,
                    new RoomObjectWidgetRequestEvent(RoomObjectWidgetRequestEvent.ROWRE_HIGH_SCORE_DISPLAY, this.object)
                );
            }
            else
            {
                this.eventDispatcher?.emit(
                    RoomObjectWidgetRequestEvent.ROWRE_HIDE_HIGH_SCORE_DISPLAY,
                    new RoomObjectWidgetRequestEvent(RoomObjectWidgetRequestEvent.ROWRE_HIDE_HIGH_SCORE_DISPLAY, this.object)
                );
            }

            this._state = dataMessage.state;
        }
    }

    override mouseEvent(event: RoomSpriteMouseEvent, geometry: IRoomGeometry): void
    {
        if(event === null || geometry === null)
        {
            return;
        }

        if(this.object === null)
        {
            return;
        }

        if(event.type === 'doubleClick')
        {
            this.useObject();
            return;
        }

        super.mouseEvent(event, geometry);
    }
}
