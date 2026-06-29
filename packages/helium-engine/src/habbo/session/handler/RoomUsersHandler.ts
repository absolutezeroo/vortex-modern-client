import type {IConnection} from '@core/communication/connection/IConnection';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IRoomHandlerListener} from '../IRoomHandlerListener';
import {BaseHandler} from './BaseHandler';

// Message events
import {UsersMessageEvent} from '../../communication/messages/incoming/room/engine/UsersMessageEvent';
import {UserRemoveMessageEvent} from '../../communication/messages/incoming/room/engine/UserRemoveMessageEvent';
import {DoorbellMessageEvent} from '../../communication/messages/incoming/navigator/DoorbellMessageEvent';
import {BlockUserUpdateMessageEvent} from '../../communication/messages/incoming/users/BlockUserUpdateMessageEvent';
import {HabboUserBadgesMessageEvent} from '../../communication/messages/incoming/users/HabboUserBadgesMessageEvent';

// Parsers
import type {UsersMessageParser} from '../../communication/messages/parser/room/engine/UsersMessageParser';
import type {UserRemoveMessageParser} from '../../communication/messages/parser/room/engine/UserRemoveMessageParser';
import type {DoorbellMessageParser} from '../../communication/messages/parser/navigator/DoorbellMessageParser';
import type {HabboUserBadgesMessageParser} from '../../communication/messages/parser/users/HabboUserBadgesMessageParser';

// Events
import {RoomSessionUserDataUpdateEvent} from '../events/RoomSessionUserDataUpdateEvent';
import {RoomSessionDoorbellEvent} from '../events/RoomSessionDoorbellEvent';
import {RoomSessionUserBadgesEvent} from '../events/RoomSessionUserBadgesEvent';
import {IUserData, UserData} from '@habbo/session';
import {RoomUserData} from '@habbo/communication';

/**
 * Room users handler
 *
 * Based on AS3: com.sulake.habbo.session.handler.RoomUsersHandler
 *
 * Handles user-related messages and manages user data in the session.
 * This is a simplified implementation focusing on core functionality.
 *
 * TODO: Implement additional handlers:
 * - UserChangeMessageEvent (figure updates)
 * - UserNameChangedMessageEvent
 * - PetInfoMessageEvent, PetCommandsMessageEvent, etc. (pet-related)
 * - DanceMessageEvent
 * - FavoriteMembershipUpdateMessageEvent
 */
export class RoomUsersHandler extends BaseHandler
{
	private _messageEvents: IMessageEvent[] = [];

	constructor(connection: IConnection | null, listener: IRoomHandlerListener)
	{
		super(connection, listener);

		if (connection === null)
		{
			return;
		}

		// Register core message events
		this.addMessageEvent(connection, new UsersMessageEvent(this.onUsers.bind(this)));
		this.addMessageEvent(connection, new UserRemoveMessageEvent(this.onUserRemove.bind(this)));
		this.addMessageEvent(connection, new HabboUserBadgesMessageEvent(this.onUserBadges.bind(this)));
		this.addMessageEvent(connection, new DoorbellMessageEvent(this.onDoorbell.bind(this)));
		this.addMessageEvent(connection, new BlockUserUpdateMessageEvent(this.onBlockUserUpdate.bind(this)));

		// TODO: Register additional message events when implemented
		// this.addMessageEvent(connection, new UserChangeMessageEvent(this.onUserChange.bind(this)));
		// this.addMessageEvent(connection, new DanceMessageEvent(this.onDance.bind(this)));
	}

	/**
	 * Convert a RoomUserData (from parser) into a UserData (for session storage)
	 */
	private static createUserDataFromRoomUser(roomUser: RoomUserData): UserData
	{
		const userData = new UserData(roomUser.roomIndex);

		userData.type = roomUser.userType;
		userData.webID = roomUser.webID;
		userData.name = roomUser.name;
		userData.figure = roomUser.figure;
		userData.sex = roomUser.sex;
		userData.custom = roomUser.custom;
		userData.achievementScore = roomUser.achievementScore;
		userData.groupID = roomUser.groupID;
		userData.groupName = roomUser.groupName;
		userData.groupStatus = roomUser.groupStatus;
		userData.isModerator = roomUser.isModerator;
		userData.ownerId = roomUser.ownerId;
		userData.ownerName = roomUser.ownerName;
		userData.petLevel = roomUser.petLevel;
		userData.rarityLevel = roomUser.rarityLevel;
		userData.hasSaddle = roomUser.hasSaddle;
		userData.isRiding = roomUser.isRiding;
		userData.canBreed = roomUser.canBreed;
		userData.canHarvest = roomUser.canHarvest;
		userData.canRevive = roomUser.canRevive;
		userData.hasBreedingPermission = roomUser.hasBreedingPermission;
		userData.botSkills = roomUser.botSkills;

		return userData;
	}

	override dispose(): void
	{
		if (this.connection)
		{
			for (const event of this._messageEvents)
			{
				this.connection.removeMessageEvent(event);
			}
		}
		this._messageEvents = [];

		super.dispose();
	}

	private addMessageEvent(connection: IConnection, event: IMessageEvent): void
	{
		connection.addMessageEvent(event);
		this._messageEvents.push(event);
	}

	/**
	 * Handle users entering the room
	 */
	private onUsers(event: IMessageEvent): void
	{
		const usersEvent = event as UsersMessageEvent;
		if (usersEvent === null)
		{
			return;
		}

		const parser = usersEvent.parser as UsersMessageParser;

		if (parser === null)
		{
			return;
		}

		const session = this.listener.getSession(this.roomId);

		if (session === null)
		{
			return;
		}

		// Collect added users for the event
		const addedUsers: IUserData[] = [];

		for (let i = 0; i < parser.userCount; i++)
		{
			const roomUserData = parser.getUser(i);

			if (roomUserData !== null)
			{
				const userData = RoomUsersHandler.createUserDataFromRoomUser(roomUserData);

				session.userDataManager.setUserData(userData);

				addedUsers.push(userData);
			}
		}

		// Dispatch user data update event
		if (this.listener.sessionEvents)
		{
			this.listener.sessionEvents.emit(
				RoomSessionUserDataUpdateEvent.RSUDUE_USER_DATA_UPDATE,
				new RoomSessionUserDataUpdateEvent(session, addedUsers)
			);
		}
	}

	/**
	 * Handle user leaving the room
	 */
	private onUserRemove(event: IMessageEvent): void
	{
		const removeEvent = event as UserRemoveMessageEvent;

		if (removeEvent === null)
		{
			return;
		}

		const parser = removeEvent.parser as UserRemoveMessageParser;

		if (parser === null)
		{
			return;
		}

		const session = this.listener.getSession(this.roomId);

		if (session === null)
		{
			return;
		}

		session.userDataManager.removeUserDataByRoomIndex(parser.roomIndex);
	}

	private onBlockUserUpdate(event: IMessageEvent): void
	{
		const blockEvent = event as BlockUserUpdateMessageEvent;

		if (blockEvent === null)
		{
			return;
		}

		const session = this.listener.getSession(this.roomId);

		if (session === null)
		{
			return;
		}

		const userData = session.userDataManager.getUserData(blockEvent.userId);

		if (userData !== null)
		{
			session.userDataManager.markAsBlocked(
				userData.roomObjectId,
				blockEvent.result === BlockUserUpdateMessageEvent.BLOCKED
			);
		}
	}

	/**
	 * Handle doorbell ring
	 */
	private onDoorbell(event: IMessageEvent): void
	{
		const doorbellEvent = event as DoorbellMessageEvent;

		if (doorbellEvent === null)
		{
			return;
		}

		const userName = (doorbellEvent.parser as DoorbellMessageParser)?.userName;

		if (!userName || userName === '')
		{
			return;
		}

		const session = this.listener.getSession(this.roomId);

		if (session === null)
		{
			return;
		}

		if (this.listener.sessionEvents)
		{
			this.listener.sessionEvents.emit(
				RoomSessionDoorbellEvent.RSDE_DOORBELL,
				new RoomSessionDoorbellEvent(RoomSessionDoorbellEvent.RSDE_DOORBELL, session, userName)
			);
		}
	}

	/**
	 * Handle user badges update
	 */
	private onUserBadges(event: IMessageEvent): void
	{
		const badgesEvent = event as HabboUserBadgesMessageEvent;

		if(badgesEvent === null)
		{
			return;
		}

		const parser = badgesEvent.parser as HabboUserBadgesMessageParser;

		if(parser === null)
		{
			return;
		}

		const session = this.listener.getSession(this.roomId);

		if(session === null)
		{
			return;
		}

		session.userDataManager.setUserBadges(parser.userId, parser.badges);

		if(this.listener.sessionEvents)
		{
			this.listener.sessionEvents.emit(
				RoomSessionUserBadgesEvent.RSUBE_BADGES,
				new RoomSessionUserBadgesEvent(session, parser.userId, parser.badges)
			);
		}
	}

	// TODO: Implement additional handlers

	// private onUserChange(event: IMessageEvent): void { ... }
	// private onDance(event: IMessageEvent): void { ... }
}
