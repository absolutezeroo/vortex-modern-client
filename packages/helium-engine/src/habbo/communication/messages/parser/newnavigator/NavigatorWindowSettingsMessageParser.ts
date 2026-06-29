import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for navigator window settings message
 *
 * @see source_as_win63/habbo/communication/messages/parser/newnavigator/class_1323.as
 */
export class NavigatorWindowSettingsMessageParser implements IMessageParser
{
	private _windowX: number = 0;

	get windowX(): number
	{
		return this._windowX;
	}

	private _windowY: number = 0;

	get windowY(): number
	{
		return this._windowY;
	}

	private _windowWidth: number = 0;

	get windowWidth(): number
	{
		return this._windowWidth;
	}

	private _windowHeight: number = 0;

	get windowHeight(): number
	{
		return this._windowHeight;
	}

	private _leftPaneHidden: boolean = false;

	get leftPaneHidden(): boolean
	{
		return this._leftPaneHidden;
	}

	private _resultsMode: number = 0;

	get resultsMode(): number
	{
		return this._resultsMode;
	}

	flush(): boolean
	{
		this._windowX = 0;
		this._windowY = 0;
		this._windowWidth = 0;
		this._windowHeight = 0;
		this._leftPaneHidden = false;
		this._resultsMode = 0;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		this._windowX = wrapper.readInt();
		this._windowY = wrapper.readInt();
		this._windowWidth = wrapper.readInt();
		this._windowHeight = wrapper.readInt();
		this._leftPaneHidden = wrapper.readBoolean();
		this._resultsMode = wrapper.readInt();
		return true;
	}
}
