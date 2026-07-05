/**
 * FurnitureExternalImageLogic
 *
 * @see source_as_win63/habbo/room/object/logic/furniture/FurnitureExternalImageLogic.as
 *
 * Logic for external image furniture (custom photos).
 */
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import type {RoomSpriteMouseEvent} from '@room/events/RoomSpriteMouseEvent';
import {FurnitureMultiStateLogic} from './FurnitureMultiStateLogic';

export class FurnitureExternalImageLogic extends FurnitureMultiStateLogic
{
    override get widget(): string | null
    {
        return 'RWE_EXTERNAL_IMAGE';
    }

    override getEventTypes(): string[]
    {
        const types = [
            'ROWRE__STICKIE',
            'ROFCAE_STICKIE'
        ];

        return this.getAllEventTypes(super.getEventTypes(), types);
    }

    override initialize(data: unknown): void
    {
        super.initialize(data);

        if(data === null)
        {
            return;
        }

        const config = data as { mask?: Array<{ type?: string }> };

        if(config.mask && config.mask.length > 0 && config.mask[0].type)
        {
            const maskType = config.mask[0].type;
            const model = this.object?.getModelController();

            if(model)
            {
                model.setNumber('furniture_uses_plane_mask', 1, true);
                model.setString('furniture_plane_mask_type', maskType, true);
            }
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

        if(event.type !== 'doubleClick')
        {
            super.mouseEvent(event, geometry);
        }
        else
        {
            this.useObject();
        }
    }
}
