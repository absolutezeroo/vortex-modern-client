import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Redeem a credit furni item
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/room/furniture/CreditFurniRedeemMessageComposer.as
 */
export class CreditFurniRedeemMessageComposer extends MessageComposer<ConstructorParameters<typeof CreditFurniRedeemMessageComposer>>
{
	private _data: ConstructorParameters<typeof CreditFurniRedeemMessageComposer>;

	constructor(objectId: number)
	{
		super();
		this._data = [objectId];
	}

	getMessageArray()
	{
		return this._data;
	}
}
