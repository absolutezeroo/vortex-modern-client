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
    createRenderer(): IRoomRenderer
    {
        return new RoomRenderer();
    }
}
