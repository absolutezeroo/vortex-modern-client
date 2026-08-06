import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IPetInfoData} from '../../incoming/notifications/PetFigureDataParser';
import {parsePetInfoData} from '../../incoming/notifications/PetFigureDataParser';

/**
 * Parser for pet received message
 *
 * Parses whether the pet was bought as a gift and the pet data.
 *
 * @see source_as_win63/habbo/communication/messages/parser/inventory/pets/PetReceivedMessageEventParser.as
 */
export class PetReceivedMessageEventParser implements IMessageParser
{
    private _boughtAsGift: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/pets/PetReceivedMessageEventParser.as::get boughtAsGift()
    get boughtAsGift(): boolean
    {
        return this._boughtAsGift;
    }

    private _pet: IPetInfoData | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/pets/PetReceivedMessageEventParser.as::get pet()
    get pet(): IPetInfoData | null
    {
        return this._pet;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/pets/PetReceivedMessageEventParser.as::flush()
    flush(): boolean
    {
        this._boughtAsGift = false;
        this._pet = null;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/pets/PetReceivedMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._boughtAsGift = wrapper.readBoolean();
        this._pet = parsePetInfoData(wrapper);

        return true;
    }
}
