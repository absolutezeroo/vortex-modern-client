/**
 * FurnitureSongDiskLogic
 *
 * @see source_as_win63/habbo/room/object/logic/furniture/FurnitureSongDiskLogic.as
 *
 * Logic for song disk furniture (stores song ID as extra param).
 */
import type {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';
import {FurnitureLogic} from './FurnitureLogic';

export class FurnitureSongDiskLogic extends FurnitureLogic
{
    override processUpdateMessage(message: RoomObjectUpdateMessage): void
    {
        super.processUpdateMessage(message);

        if(this.object === null)
        {
            return;
        }

        if(this.object.getModelController()?.getNumber('furniture_real_room_object') === 1)
        {
            const extras = this.object.getModelController()!.getString('furniture_extras');
            const songId = parseInt(extras ?? '0');

            this.object.getModelController()!.setString('RWEIEP_INFOSTAND_EXTRA_PARAM', 'RWEIEP_SONGDISK' + songId);
        }
    }
}
