import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Avatar effect data
 */
export interface IAvatarEffect
{
    type: number;
    subType: number;
    duration: number;
    inactiveEffectsInInventory: number;
    secondsLeftIfActive: number;
    isPermanent: boolean;
}

/**
 * Parser for avatar effects message
 *
 * @see source_as_win63/habbo/communication/messages/parser/inventory/avatareffect/AvatarEffectsMessageEventParser.as
 */
export class AvatarEffectsMessageParser implements IMessageParser
{
    private _effects: IAvatarEffect[] = [];

    get effects(): IAvatarEffect[]
    {
        return this._effects;
    }

    flush(): boolean
    {
        this._effects = [];
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        const count = wrapper.readInt();
        for(let i = 0; i < count; i++)
        {
            const effect: IAvatarEffect = {
                type: wrapper.readInt(),
                subType: wrapper.readInt(),
                duration: wrapper.readInt(),
                inactiveEffectsInInventory: wrapper.readInt(),
                secondsLeftIfActive: wrapper.readInt(),
                isPermanent: wrapper.readBoolean(),
            };
            this._effects.push(effect);
        }
        return true;
    }
}
