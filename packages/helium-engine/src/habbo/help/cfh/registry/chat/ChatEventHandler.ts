import type {ChatRegistry} from './ChatRegistry';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('ChatEventHandler');

/**
 * Room chat event listener for CFH reports
 *
 * Captures chat messages from room sessions and stores them
 * in the ChatRegistry for later use in Call For Help reports.
 *
 * @see source_as_win63/habbo/help/cfh/registry/chat/ChatEventHandler.as
 */
export class ChatEventHandler
{
    private _registry: ChatRegistry;

    constructor(registry: ChatRegistry)
    {
        this._registry = registry;
        log.debug('ChatEventHandler initialized');
    }

    private _disposed: boolean = false;

    /**
	 * Whether this handler has been disposed
	 */
    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
	 * Handle a room chat event by adding it to the registry
	 *
	 * @param roomId The room ID
	 * @param roomName The room name
	 * @param userId The user ID who sent the message
	 * @param userName The user name
	 * @param text The chat message text
	 */
    onChatEvent(roomId: number, roomName: string, userId: number, userName: string, text: string): void
    {
        if(this._disposed) return;

        this._registry.addItem(roomId, roomName, userId, userName, text);
    }

    /**
	 * Dispose of this handler
	 */
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
    }
}
