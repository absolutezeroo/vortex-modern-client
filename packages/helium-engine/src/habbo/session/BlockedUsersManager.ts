import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';
import type {IHabboNotifications} from '../notifications/IHabboNotifications';
import {
	BlockListInitComposer,
	BlockUserMessageComposer,
	UnblockUserMessageComposer,
} from '../communication/messages/outgoing/users';
import {
	BlockListMessageEvent,
	BlockUserUpdateMessageEvent,
} from '../communication/messages/incoming/users';

/**
 * Blocked users manager.
 *
 * @see sources/win63_version/habbo/session/BlockedUsersManager.as
 */
export class BlockedUsersManager
{
	private _communication: IHabboCommunicationManager | null;
	private _sendCallback: ((composer: IMessageComposer<unknown[]>) => void) | null;
	private _notifications: IHabboNotifications | null;
	private _blockedUserIds: Set<number> = new Set();
	private _messageEvents: IMessageEvent[] = [];

	constructor(
		communication: IHabboCommunicationManager | null,
		sendCallback: ((composer: IMessageComposer<unknown[]>) => void) | null,
		notifications: IHabboNotifications | null
	)
	{
		this._communication = communication;
		this._sendCallback = sendCallback;
		this._notifications = notifications;

		this.registerMessageEvents();
	}

	get disposed(): boolean
	{
		return this._communication === null;
	}

	initBlockList(): void
	{
		this._sendCallback?.(new BlockListInitComposer());
	}

	blockUser(userId: number): void
	{
		this._sendCallback?.(new BlockUserMessageComposer(userId));
	}

	unblockUser(userId: number): void
	{
		this._sendCallback?.(new UnblockUserMessageComposer(userId));
	}

	isBlocked(userId: number): boolean
	{
		return this._blockedUserIds.has(userId);
	}

	dispose(): void
	{
		if (this.disposed) return;

		for (const event of this._messageEvents)
		{
			this._communication?.removeMessageEvent(event);
		}

		this._messageEvents.length = 0;
		this._blockedUserIds.clear();
		this._communication = null;
		this._sendCallback = null;
		this._notifications = null;
	}

	private registerMessageEvents(): void
	{
		if (!this._communication) return;

		const blockUpdateEvent = new BlockUserUpdateMessageEvent(this.onBlockUpdate.bind(this));
		this._communication.addMessageEvent(blockUpdateEvent);
		this._messageEvents.push(blockUpdateEvent);

		const blockListEvent = new BlockListMessageEvent(this.onBlockList.bind(this));
		this._communication.addMessageEvent(blockListEvent);
		this._messageEvents.push(blockListEvent);
	}

	private onBlockList(event: IMessageEvent): void
	{
		if (!(event instanceof BlockListMessageEvent)) return;

		this._blockedUserIds = new Set(event.blockedUserIds);
	}

	private onBlockUpdate(event: IMessageEvent): void
	{
		if (!(event instanceof BlockUserUpdateMessageEvent)) return;

		switch (event.result)
		{
			case BlockUserUpdateMessageEvent.UNBLOCKED:
				this.removeUserFromBlockList(event.userId);
				this._notifications?.addItem('${notification.unblocked_player}', 'info');
				break;

			case BlockUserUpdateMessageEvent.BLOCKED:
				this.addUserToBlockList(event.userId);
				this._notifications?.addItem('${notification.blocked_player}', 'info');
				break;
		}
	}

	private addUserToBlockList(userId: number): void
	{
		this._blockedUserIds.add(userId);
	}

	private removeUserFromBlockList(userId: number): void
	{
		this._blockedUserIds.delete(userId);
	}
}
