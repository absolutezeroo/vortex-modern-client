/**
 * RoomWidgetCreditFurniUpdateEvent
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetCreditFurniUpdateEvent.as
 *
 * Carries an exchangeable furni's credit value to the redeem dialog. `isNftCredit` selects a
 * different wording and hides the info link.
 */
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

export class RoomWidgetCreditFurniUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: RoomWidgetCreditFurniUpdateEvent.as::UPDATE_CREDIT_FURNI
    public static readonly UPDATE_CREDIT_FURNI: string = 'RWCFUE_CREDIT_FURNI_UPDATE';

    // AS3: RoomWidgetCreditFurniUpdateEvent.as::_SafeStr_4841
    private _objectId: number;

    // AS3: RoomWidgetCreditFurniUpdateEvent.as::_SafeStr_9198
    private _creditValue: number;

    // AS3: RoomWidgetCreditFurniUpdateEvent.as::_isNftCredit
    private _isNftCredit: boolean;

    // AS3: RoomWidgetCreditFurniUpdateEvent.as::RoomWidgetCreditFurniUpdateEvent()
    constructor(type: string, objectId: number, creditValue: number, isNftCredit: boolean)
    {
        super(type);

        this._creditValue = creditValue;
        this._objectId = objectId;
        this._isNftCredit = isNftCredit;
    }

    // AS3: RoomWidgetCreditFurniUpdateEvent.as::get creditValue()
    public get creditValue(): number
    {
        return this._creditValue;
    }

    // AS3: RoomWidgetCreditFurniUpdateEvent.as::get objectId()
    public get objectId(): number
    {
        return this._objectId;
    }

    // AS3: RoomWidgetCreditFurniUpdateEvent.as::get isNftCredit()
    public get isNftCredit(): boolean
    {
        return this._isNftCredit;
    }
}
