import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Adds a saved search to the navigator
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/newnavigator/NavigatorAddSavedSearchComposer.as
 */
export class NavigatorAddSavedSearchComposer extends MessageComposer<ConstructorParameters<typeof NavigatorAddSavedSearchComposer>>
{
	private _data: ConstructorParameters<typeof NavigatorAddSavedSearchComposer>;

	constructor(searchCode: string, filtering: string)
	{
		super();

		this._data = [searchCode, filtering];
	}

	getMessageArray()
	{
		return this._data;
	}

}
