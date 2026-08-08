import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * A currency balance. Three types share one class and one `balance` field, so the type is the only
 * thing saying which currency the number is — `MeMenuWidgetHandler` only ever sends
 * `CREDIT_BALANCE`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetPurseUpdateEvent.as
 */
export class RoomWidgetPurseUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../widget/events/RoomWidgetPurseUpdateEvent.as::CREDIT_BALANCE
    public static readonly CREDIT_BALANCE: string = 'RWPUE_CREDIT_BALANCE';

    // AS3: .../widget/events/RoomWidgetPurseUpdateEvent.as::PIXEL_BALANCE
    // Name DERIVED (`_SafeStr_10904`), from its value.
    public static readonly PIXEL_BALANCE: string = 'RWPUE_PIXEL_BALANCE';

    // AS3: .../widget/events/RoomWidgetPurseUpdateEvent.as::SHELL_BALANCE
    public static readonly SHELL_BALANCE: string = 'RWPUE_SHELL_BALANCE';

    // AS3: .../widget/events/RoomWidgetPurseUpdateEvent.as::_balance
    // Name DERIVED (`_SafeStr_8545`): the field behind `get balance()`.
    private _balance: number;

    // AS3: .../widget/events/RoomWidgetPurseUpdateEvent.as::RoomWidgetPurseUpdateEvent()
    // The two Flash Event flags AS3 forwards are dropped — see RoomWidgetHabboClubUpdateEvent.
    constructor(type: string, balance: number)
    {
        super(type);

        this._balance = balance;
    }

    // AS3: .../widget/events/RoomWidgetPurseUpdateEvent.as::get balance()
    public get balance(): number
    {
        return this._balance;
    }
}
