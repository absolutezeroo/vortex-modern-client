import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * The local user's Habbo Club standing, pushed to the me-menu on open and again whenever the
 * subscription changes.
 *
 * `allowClubDances` is **not** derived from the other four — it comes from
 * `sessionDataManager.hasClub`, so a user whose days have run out can still be flagged as allowed
 * (or the reverse) without the counts agreeing.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetHabboClubUpdateEvent.as
 */
export class RoomWidgetHabboClubUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../widget/events/RoomWidgetHabboClubUpdateEvent.as::HABBO_CLUB
    // Name DERIVED (`_SafeStr_10324`), from its value "RWBIUE_HABBO_CLUB".
    public static readonly HABBO_CLUB: string = 'RWBIUE_HABBO_CLUB';

    // AS3: .../widget/events/RoomWidgetHabboClubUpdateEvent.as::_daysLeft
    // Name DERIVED (`_SafeStr_9147`): the field behind `get daysLeft()`.
    private _daysLeft: number = 0;

    // AS3: .../widget/events/RoomWidgetHabboClubUpdateEvent.as::_periodsLeft
    // Name DERIVED (`_SafeStr_9867`).
    private _periodsLeft: number = 0;

    // AS3: .../widget/events/RoomWidgetHabboClubUpdateEvent.as::_pastPeriods
    // Name DERIVED (`_SafeStr_8909`).
    private _pastPeriods: number = 0;

    // AS3: .../widget/events/RoomWidgetHabboClubUpdateEvent.as::_allowClubDances
    private _allowClubDances: boolean = false;

    // AS3: .../widget/events/RoomWidgetHabboClubUpdateEvent.as::_clubLevel
    // Name DERIVED (`_SafeStr_8008`).
    private _clubLevel: number;

    /**
     * AS3 also takes the two Flash `Event` flags (bubbles, cancelable) and forwards them to
     * `super`. This port's `RoomWidgetUpdateEvent` carries a type only — these events travel on an
     * EventEmitter, where neither flag has any meaning — so both are dropped here, as in every
     * other ported widget event.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetHabboClubUpdateEvent.as::RoomWidgetHabboClubUpdateEvent()
    constructor(daysLeft: number, periodsLeft: number, pastPeriods: number, allowClubDances: boolean, clubLevel: number)
    {
        super(RoomWidgetHabboClubUpdateEvent.HABBO_CLUB);

        this._daysLeft = daysLeft;
        this._periodsLeft = periodsLeft;
        this._pastPeriods = pastPeriods;
        this._allowClubDances = allowClubDances;
        this._clubLevel = clubLevel;
    }

    // AS3: .../widget/events/RoomWidgetHabboClubUpdateEvent.as::get daysLeft()
    public get daysLeft(): number
    {
        return this._daysLeft;
    }

    // AS3: .../widget/events/RoomWidgetHabboClubUpdateEvent.as::get periodsLeft()
    public get periodsLeft(): number
    {
        return this._periodsLeft;
    }

    // AS3: .../widget/events/RoomWidgetHabboClubUpdateEvent.as::get pastPeriods()
    public get pastPeriods(): number
    {
        return this._pastPeriods;
    }

    // AS3: .../widget/events/RoomWidgetHabboClubUpdateEvent.as::get allowClubDances()
    public get allowClubDances(): boolean
    {
        return this._allowClubDances;
    }

    // AS3: .../widget/events/RoomWidgetHabboClubUpdateEvent.as::get clubLevel()
    public get clubLevel(): number
    {
        return this._clubLevel;
    }
}
