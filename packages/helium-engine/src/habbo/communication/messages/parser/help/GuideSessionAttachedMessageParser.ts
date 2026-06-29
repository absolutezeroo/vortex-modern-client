import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for guide session attached messages.
 * Indicates that the user has been attached to a guide session.
 *
 * @see source_as_win63/habbo/communication/messages/parser/help/GuideSessionAttachedMessageEventParser.as
 */
export class GuideSessionAttachedMessageParser implements IMessageParser
{
	private _asGuide: boolean = false;

	get asGuide(): boolean
	{
		return this._asGuide;
	}

	private _helpRequestType: number = 0;

	get helpRequestType(): number
	{
		return this._helpRequestType;
	}

	private _helpRequestDescription: string = '';

	get helpRequestDescription(): string
	{
		return this._helpRequestDescription;
	}

	private _roleSpecificWaitTime: number = 0;

	get roleSpecificWaitTime(): number
	{
		return this._roleSpecificWaitTime;
	}

	flush(): boolean
	{
		this._asGuide = false;
		this._helpRequestType = 0;
		this._helpRequestDescription = '';
		this._roleSpecificWaitTime = 0;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._asGuide = wrapper.readBoolean();
		this._helpRequestType = wrapper.readInt();
		this._helpRequestDescription = wrapper.readString();
		this._roleSpecificWaitTime = wrapper.readInt();

		return true;
	}
}
