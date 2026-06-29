import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {IssueInfoData} from './IssueInfoData';
import {PatternMatchData} from './PatternMatchData';

/**
 * Parser for a single issue info message.
 *
 * @see source_as_win63/habbo/communication/messages/parser/moderation/IssueInfoMessageEventParser.as
 */
export class IssueInfoMessageParser implements IMessageParser
{
	private _issueData: IssueInfoData | null = null;

	get issueData(): IssueInfoData | null
	{
		return this._issueData;
	}

	flush(): boolean
	{
		this._issueData = null;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		const issueId = wrapper.readInt();
		const state = wrapper.readInt();
		const categoryId = wrapper.readInt();
		const reportedCategoryId = wrapper.readInt();
		const issueAgeInMilliseconds = wrapper.readInt();
		const priority = wrapper.readInt();
		const groupingId = wrapper.readInt();
		const reporterUserId = wrapper.readInt();
		const reporterUserName = wrapper.readString();
		const reportedUserId = wrapper.readInt();
		const reportedUserName = wrapper.readString();
		const pickerUserId = wrapper.readInt();
		const pickerUserName = wrapper.readString();
		const message = wrapper.readString();
		const chatRecordId = wrapper.readInt();

		const patternCount = wrapper.readInt();
		const patterns: PatternMatchData[] = [];

		for (let i = 0; i < patternCount; i++)
		{
			patterns.push(new PatternMatchData(wrapper));
		}

		this._issueData = new IssueInfoData(
			issueId,
			state,
			categoryId,
			reportedCategoryId,
			issueAgeInMilliseconds,
			priority,
			groupingId,
			reporterUserId,
			reporterUserName,
			reportedUserId,
			reportedUserName,
			pickerUserId,
			pickerUserName,
			message,
			chatRecordId,
			patterns
		);

		return true;
	}
}
