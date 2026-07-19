/**
 * FurnitureYoutubeLogic
 *
 * @see source_as_flash/com/sulake/habbo/room/object/logic/furniture/FurnitureYoutubeLogic.as
 *
 * Logic for YouTube video furniture (widget = YOUTUBE, requests URL prefix).
 */
import {FurnitureLogic} from './FurnitureLogic';
import {RoomObjectDataRequestEvent} from '@habbo/room/events/RoomObjectDataRequestEvent';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';

export class FurnitureYoutubeLogic extends FurnitureLogic
{
    override get widget(): string | null
    {
        return 'YOUTUBE';
    }

    override getEventTypes(): string[]
    {
        return this.getAllEventTypes(super.getEventTypes(), [
            RoomObjectDataRequestEvent.URL_PREFIX
        ]);
    }

    override update(time: number): void
    {
        super.update(time);

        if(this.object === null)
        {
            return;
        }

        if(!this.object.getModel().hasString(RoomObjectVariableEnum.SESSION_URL_PREFIX))
        {
            this.eventDispatcher?.emit(
                RoomObjectDataRequestEvent.URL_PREFIX,
                new RoomObjectDataRequestEvent(RoomObjectDataRequestEvent.URL_PREFIX, this.object)
            );
        }
    }
}
