import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Activate an avatar effect
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/inventory/avatareffect/AvatarEffectActivatedComposer.as
 */
export class AvatarEffectActivatedComposer extends MessageComposer<ConstructorParameters<typeof AvatarEffectActivatedComposer>>
{
	private _data: ConstructorParameters<typeof AvatarEffectActivatedComposer>;

	constructor(effectType: number)
	{
		super();

		this._data = [effectType];
	}

	getMessageArray()
	{
		return this._data;
	}

}
