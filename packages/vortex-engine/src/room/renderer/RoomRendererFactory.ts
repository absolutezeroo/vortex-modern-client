/**
 * RoomRendererFactory
 *
 * Based on AS3: com.sulake.room.renderer.class_2015
 *
 * Factory component that creates RoomRenderer instances.
 *
 * @see sources/win63_version/room/renderer/class_2015.as
 */
import {Component, type IContext} from '@core/runtime';
import type {IRoomRendererFactory} from './IRoomRendererFactory';
import type {IRoomRenderer} from './IRoomRenderer';
import {RoomRenderer} from './RoomRenderer';

export class RoomRendererFactory extends Component implements IRoomRendererFactory
{
    constructor(context: IContext)
    {
        super(context);
    }

    /**
	 * Create a new room renderer.
	 *
	 * @see AS3 class_2015 lines 16-19
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/room/renderer/RoomRendererFactory.as::createRenderer()
    createRenderer(): IRoomRenderer
    {
        return new RoomRenderer();
    }
}
