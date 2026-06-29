import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Composer for getting current timing code
 *
 * This corresponds to the obfuscated class_1011 in the AS3 source.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/competition/class_1011.as
 */
export class GetCurrentTimingCodeMessageComposer extends MessageComposer<ConstructorParameters<typeof GetCurrentTimingCodeMessageComposer>>
{
	private _data: ConstructorParameters<typeof GetCurrentTimingCodeMessageComposer>;

	constructor(goalCode: string)
	{
		super();

		this._data = [goalCode];
	}

	getMessageArray()
	{
		return this._data;
	}
}
