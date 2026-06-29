import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {IssueInfoData} from './IssueInfoData';
import {IssueInfoMessageParser} from './IssueInfoMessageParser';

/**
 * Data class containing moderator initialization data.
 * Includes issues, message templates, permissions, and room message templates.
 *
 * @see source_as_win63/habbo/communication/messages/parser/moderation/class_1762.as
 */
export class ModeratorInitData
{
	constructor(wrapper: IMessageDataWrapper)
	{
		const issueParser = new IssueInfoMessageParser();
		this._issues = [];
		this._messageTemplates = [];
		this._roomMessageTemplates = [];

		let count = wrapper.readInt();

		for (let i = 0; i < count; i++)
		{
			if (issueParser.parse(wrapper))
			{
				const data = issueParser.issueData;

				if (data)
				{
					this._issues.push(data);
				}
			}
		}

		count = wrapper.readInt();

		for (let i = 0; i < count; i++)
		{
			this._messageTemplates.push(wrapper.readString());
		}

		// CFH categories (read and discard string keys)
		count = wrapper.readInt();

		for (let i = 0; i < count; i++)
		{
			wrapper.readString();
		}

		this._cfhPermission = wrapper.readBoolean();
		this._chatlogsPermission = wrapper.readBoolean();
		this._alertPermission = wrapper.readBoolean();
		this._kickPermission = wrapper.readBoolean();
		this._banPermission = wrapper.readBoolean();
		this._roomAlertPermission = wrapper.readBoolean();
		this._roomKickPermission = wrapper.readBoolean();

		count = wrapper.readInt();

		for (let i = 0; i < count; i++)
		{
			this._roomMessageTemplates.push(wrapper.readString());
		}
	}

	private _issues: IssueInfoData[];

	get issues(): IssueInfoData[]
	{
		return this._issues;
	}

	private _messageTemplates: string[];

	get messageTemplates(): string[]
	{
		return this._messageTemplates;
	}

	private _roomMessageTemplates: string[];

	get roomMessageTemplates(): string[]
	{
		return this._roomMessageTemplates;
	}

	private _cfhPermission: boolean;

	get cfhPermission(): boolean
	{
		return this._cfhPermission;
	}

	private _chatlogsPermission: boolean;

	get chatlogsPermission(): boolean
	{
		return this._chatlogsPermission;
	}

	private _alertPermission: boolean;

	get alertPermission(): boolean
	{
		return this._alertPermission;
	}

	private _kickPermission: boolean;

	get kickPermission(): boolean
	{
		return this._kickPermission;
	}

	private _banPermission: boolean;

	get banPermission(): boolean
	{
		return this._banPermission;
	}

	private _roomAlertPermission: boolean;

	get roomAlertPermission(): boolean
	{
		return this._roomAlertPermission;
	}

	private _roomKickPermission: boolean;

	get roomKickPermission(): boolean
	{
		return this._roomKickPermission;
	}

	dispose(): void
	{
		this._issues = [];
		this._messageTemplates = [];
		this._roomMessageTemplates = [];
	}
}
