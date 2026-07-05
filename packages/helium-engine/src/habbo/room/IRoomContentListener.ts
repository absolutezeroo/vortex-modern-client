/**
 * IRoomContentListener
 *
 * Based on AS3: com.sulake.habbo.room.IRoomContentListener
 *
 * Interface for listening to room content loading events.
 */
export interface IRoomContentListener
{
    /**
	 * Called when an icon has been loaded.
	 */
    iconLoaded(typeId: number, type: string, success: boolean): void;
}
