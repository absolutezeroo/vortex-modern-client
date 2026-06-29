import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for guide session started messages.
 * Contains information about both the requester and guide in a new session.
 *
 * @see source_as_win63/habbo/communication/messages/parser/help/GuideSessionStartedMessageEventParser.as
 */
export class GuideSessionStartedMessageParser implements IMessageParser
{
	private _requesterUserId: number = 0;

	get requesterUserId(): number
	{
		return this._requesterUserId;
	}

	private _requesterName: string = '';

	get requesterName(): string
	{
		return this._requesterName;
	}

	private _requesterFigure: string = '';

	get requesterFigure(): string
	{
		return this._requesterFigure;
	}

	private _guideUserId: number = 0;

	get guideUserId(): number
	{
		return this._guideUserId;
	}

	private _guideName: string = '';

	get guideName(): string
	{
		return this._guideName;
	}

	private _guideFigure: string = '';

	get guideFigure(): string
	{
		return this._guideFigure;
	}

	flush(): boolean
	{
		this._requesterUserId = 0;
		this._requesterName = '';
		this._requesterFigure = '';
		this._guideUserId = 0;
		this._guideName = '';
		this._guideFigure = '';
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._requesterUserId = wrapper.readInt();
		this._requesterName = wrapper.readString();
		this._requesterFigure = wrapper.readString();
		this._guideUserId = wrapper.readInt();
		this._guideName = wrapper.readString();
		this._guideFigure = wrapper.readString();

		return true;
	}
}
