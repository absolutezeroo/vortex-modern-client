import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Select/use an avatar effect
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/inventory/avatareffect/AvatarEffectSelectedComposer.as
 */
export class AvatarEffectSelectedComposer extends MessageComposer<ConstructorParameters<typeof AvatarEffectSelectedComposer>>
{
    private _data: ConstructorParameters<typeof AvatarEffectSelectedComposer>;

    constructor(effectType: number)
    {
        super();

        this._data = [effectType];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/inventory/avatareffect/AvatarEffectSelectedComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
