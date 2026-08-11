import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * The guide ticket a player already has open, as it arrives inside `GuideReportingStatus` (header
 * 3725) when the status code is 1.
 *
 * **Its tail is conditional on two of its own fields**, which is the only thing about this DTO
 * that can go wrong. `type` picks how many strings follow, and for type 3 (a bully report) the
 * strings are present *only when the reader is not the guide* — a guide sees the ticket exists and
 * nothing about who filed it. Read the type and `isGuide` first, or the rest of the packet
 * desyncs.
 *
 * The AS3 class is obfuscated in every tree and postdates the 2016 build, so the class name here
 * is DERIVED from the accessor that returns it (`pendingTicket`); every member below keeps its
 * real name.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2970/_SafeCls_2969.as
 */
export class PendingGuideTicket
{
    /** A tour request. Carries the other party's name and figure. */
    // AS3: .../_SafeCls_2969.as::PendingGuideTicket() (the `case 0` arm)
    public static readonly TYPE_TOUR: number = 0;

    /** A help request. Carries name, figure and the player's own description. */
    // AS3: .../_SafeCls_2969.as::PendingGuideTicket() (the `case 1` arm)
    public static readonly TYPE_INSTRUCTIONS: number = 1;

    /** A second tour shape, read identically to `TYPE_TOUR`. */
    // AS3: .../_SafeCls_2969.as::PendingGuideTicket() (the `case 2` arm)
    public static readonly TYPE_TOUR_ALT: number = 2;

    /** A bully report. Carries name, figure and room name — but only for a non-guide reader. */
    // AS3: .../_SafeCls_2969.as::PendingGuideTicket() (the `case 3` arm)
    public static readonly TYPE_BULLY: number = 3;

    // AS3: .../_SafeCls_2969.as::_SafeStr_4778 (name from `get type()`)
    private _type: number = 0;

    // AS3: .../_SafeCls_2969.as::_SafeStr_10005 (name from `get secondsAgo()`)
    private _secondsAgo: number = 0;

    // AS3: .../_SafeCls_2969.as::_SafeStr_9575 (name from `get isGuide()`)
    private _isGuide: boolean = false;

    // AS3: .../_SafeCls_2969.as::_SafeStr_6477 (name from `get otherPartyName()`)
    private _otherPartyName: string = '';

    // AS3: .../_SafeCls_2969.as::_SafeStr_6529 (name from `get otherPartyFigure()`)
    private _otherPartyFigure: string = '';

    // AS3: .../_SafeCls_2969.as::_description
    private _description: string = '';

    // AS3: .../_SafeCls_2969.as::_roomName
    private _roomName: string = '';

    // AS3: .../_SafeCls_2969.as::_SafeCls_2969()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._type = wrapper.readInt();
        this._secondsAgo = wrapper.readInt();
        this._isGuide = wrapper.readBoolean();

        switch(this._type)
        {
            case PendingGuideTicket.TYPE_TOUR:
            case PendingGuideTicket.TYPE_TOUR_ALT:
                this._otherPartyName = wrapper.readString();
                this._otherPartyFigure = wrapper.readString();

                return;
            case PendingGuideTicket.TYPE_INSTRUCTIONS:
                this._otherPartyName = wrapper.readString();
                this._otherPartyFigure = wrapper.readString();
                this._description = wrapper.readString();

                return;
            case PendingGuideTicket.TYPE_BULLY:
                if(!this._isGuide)
                {
                    this._otherPartyName = wrapper.readString();
                    this._otherPartyFigure = wrapper.readString();
                    this._roomName = wrapper.readString();
                }

                return;
            default:
                return;
        }
    }

    // AS3: .../_SafeCls_2969.as::get type()
    get type(): number
    {
        return this._type;
    }

    // AS3: .../_SafeCls_2969.as::get secondsAgo()
    get secondsAgo(): number
    {
        return this._secondsAgo;
    }

    // AS3: .../_SafeCls_2969.as::get isGuide()
    get isGuide(): boolean
    {
        return this._isGuide;
    }

    // AS3: .../_SafeCls_2969.as::get otherPartyName()
    get otherPartyName(): string
    {
        return this._otherPartyName;
    }

    // AS3: .../_SafeCls_2969.as::get otherPartyFigure()
    get otherPartyFigure(): string
    {
        return this._otherPartyFigure;
    }

    // AS3: .../_SafeCls_2969.as::get description()
    get description(): string
    {
        return this._description;
    }

    // AS3: .../_SafeCls_2969.as::get roomName()
    get roomName(): string
    {
        return this._roomName;
    }
}
