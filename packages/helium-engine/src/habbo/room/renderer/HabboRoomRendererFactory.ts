/**
 * HabboRoomRendererFactory
 *
 * Habbo-specific renderer factory used by RoomEngine through IID_RoomRendererFactory.
 */
import type {IContext} from '@core/runtime';
import type {IRoomRenderer} from '@room/renderer/IRoomRenderer';
import {RoomRendererFactory} from '@room/renderer/RoomRendererFactory';
import {HabboRoomRenderer} from './HabboRoomRenderer';

export class HabboRoomRendererFactory extends RoomRendererFactory
{
    constructor(context: IContext)
    {
        super(context);
    }

    override createRenderer(): IRoomRenderer
    {
        return new HabboRoomRenderer();
    }
}
