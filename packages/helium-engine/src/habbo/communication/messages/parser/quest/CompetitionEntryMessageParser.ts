import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {CompetitionEntryData} from './CompetitionEntryData';

/**
 * Parses competition entry prizes from the server.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/quest/class_1139.as
 */
export class CompetitionEntryMessageParser implements IMessageParser
{
	private _prizes: Array<CompetitionEntryData> = [];

	get prizes(): Array<CompetitionEntryData>
	{
		return this._prizes;
	}

	flush(): boolean
	{
		this._prizes = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		const count = wrapper.readInt();

		for (let i = 0; i < count; i++)
		{
			this._prizes.push(new CompetitionEntryData(wrapper));
		}

		return true;
	}
}
