import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests bonus rare info from the catalog.
 * @see source_nitro_renderer/.../outgoing/catalog/GetBonusRareInfoMessageComposer.ts
 */
export class GetBonusRareInfoMessageComposer extends MessageComposer<ConstructorParameters<typeof GetBonusRareInfoMessageComposer>>
{
	private _data: ConstructorParameters<typeof GetBonusRareInfoMessageComposer>;

	constructor()
	{
		super();
		this._data = [];
	}

	getMessageArray()
	{
		return this._data;
	}
}
