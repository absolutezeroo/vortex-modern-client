/**
 * RoomWidgetCreditFurniRedeemMessage
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetCreditFurniRedeemMessage.as
 *
 * Sent by CreditFurniWidget back to its handler when the user confirms the exchange.
 */
import {RoomWidgetMessage} from './RoomWidgetMessage';

export class RoomWidgetCreditFurniRedeemMessage extends RoomWidgetMessage
{
    /**
     * Obfuscated in every available tree; the member name is DERIVED from its value.
     */
    // AS3: RoomWidgetCreditFurniRedeemMessage.as::_SafeStr_10715
    public static readonly REDEEM: string = 'RWFCRM_REDEEM';

    // AS3: RoomWidgetCreditFurniRedeemMessage.as::_SafeStr_4841
    private _objectId: number;

    // AS3: RoomWidgetCreditFurniRedeemMessage.as::RoomWidgetCreditFurniRedeemMessage()
    constructor(type: string, objectId: number)
    {
        super(type);

        this._objectId = objectId;
    }

    // AS3: RoomWidgetCreditFurniRedeemMessage.as::get objectId()
    public get objectId(): number
    {
        return this._objectId;
    }
}
