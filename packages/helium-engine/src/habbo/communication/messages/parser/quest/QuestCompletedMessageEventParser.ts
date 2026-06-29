import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {QuestMessageData} from './QuestMessageData';

/**
 * Parser for the quest completed message.
 *
 * Parses the completed quest data and a boolean indicating whether to show the dialog.
 *
 * @see source_as_win63/habbo/communication/messages/parser/quest/QuestCompletedMessageEventParser.as
 */
export class QuestCompletedMessageEventParser implements IMessageParser
{
	private _questData: QuestMessageData | null = null;

	get questData(): QuestMessageData | null
	{
		return this._questData;
	}

	private _showDialog: boolean = false;

	get showDialog(): boolean
	{
		return this._showDialog;
	}

	flush(): boolean
	{
		this._questData = null;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._questData = new QuestMessageData(wrapper);
		this._showDialog = wrapper.readBoolean();

		return true;
	}
}
