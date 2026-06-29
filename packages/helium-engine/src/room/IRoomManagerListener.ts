/**
 * IRoomManagerListener
 *
 * Based on AS3: com.sulake.room.IRoomManagerListener
 *
 * Interface for listening to room manager events.
 */
export interface IRoomManagerListener
{
	/**
	 * Called when the room manager has been initialized.
	 */
	roomManagerInitialized(success: boolean): void;

	/**
	 * Called when content has been loaded.
	 */
	contentLoaded(type: string, success: boolean): void;

	/**
	 * Called when a single object has been initialized.
	 */
	objectInitialized(roomId: string, objectId: number, category: number): void;

	/**
	 * Called when all objects of a type have been initialized.
	 */
	objectsInitialized(type: string): void;
}
