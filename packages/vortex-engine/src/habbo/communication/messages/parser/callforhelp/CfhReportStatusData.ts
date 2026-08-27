import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One row of "my reports": a call-for-help the player filed, and what came of it.
 *
 * **The class name is derived.** It is obfuscated in every tree — `_SafeCls_2648` in the primary,
 * `class_2748` in win63_version — so unlike its sibling messages there is no filename to recover it
 * from. Every *member* below is real, and so is the read order.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2056/_SafeCls_2648.as
 */
export class CfhReportStatusData
{
    // The four appeal-status codes AS3 declares as public statics. Their identifiers are obfuscated
    // in both trees, so all four names below are DERIVED from the two call sites that branch on
    // them — `MyReportStatus.getActionExplanation()` and `ReportStatusTableObject.statusText`:
    //   0 → not appealed at all (the appeal button is offered for this state only)
    //   1 → appealed, still undecided  ("report.status.state.appealed")
    //   2 → appeal resolved, sanction stands ("report.status.info.appeal.action")
    //   3 → appeal resolved, sanction lifted ("report.status.info.appeal.no_action")

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2056/_SafeCls_2648.as::_SafeStr_10265 (name derived, see above)
    static readonly APPEAL_STATUS_NONE: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2056/_SafeCls_2648.as::_SafeStr_10211 (name derived, see above)
    static readonly APPEAL_STATUS_PENDING: number = 1;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2056/_SafeCls_2648.as::_SafeStr_10353 (name derived, see above)
    static readonly APPEAL_STATUS_RESOLVED_ACTION: number = 2;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2056/_SafeCls_2648.as::_SafeStr_10390 (name derived, see above)
    static readonly APPEAL_STATUS_RESOLVED_NO_ACTION: number = 3;

    private _id: number;
    private _creationTime: number;
    private _userMessage: string;
    private _userCategory: number;
    private _reportedAccountName: string;
    private _closeTime: number;
    private _sanctioned: boolean;
    private _sanctionGivenByAutoModeration: boolean;
    private _appealStatus: number;
    private _appealCreationTime: number;
    private _appealResolutionTime: number;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2056/_SafeCls_2648.as::_SafeCls_2648()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._id = wrapper.readLong();
        this._creationTime = wrapper.readLong();
        this._userMessage = wrapper.readString();
        this._userCategory = wrapper.readInt();
        this._reportedAccountName = wrapper.readString();
        this._closeTime = wrapper.readLong();
        this._sanctioned = wrapper.readBoolean();
        this._sanctionGivenByAutoModeration = wrapper.readBoolean();
        this._appealStatus = wrapper.readByte();
        this._appealCreationTime = wrapper.readLong();
        this._appealResolutionTime = wrapper.readLong();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2056/_SafeCls_2648.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2056/_SafeCls_2648.as::get creationTime()
    get creationTime(): number
    {
        return this._creationTime;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2056/_SafeCls_2648.as::get userMessage()
    get userMessage(): string
    {
        return this._userMessage;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2056/_SafeCls_2648.as::get userCategory()
    get userCategory(): number
    {
        return this._userCategory;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2056/_SafeCls_2648.as::get reportedAccountName()
    get reportedAccountName(): string
    {
        return this._reportedAccountName;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2056/_SafeCls_2648.as::get closeTime()
    get closeTime(): number
    {
        return this._closeTime;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2056/_SafeCls_2648.as::get sanctioned()
    get sanctioned(): boolean
    {
        return this._sanctioned;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2056/_SafeCls_2648.as::get sanctionGivenByAutoModeration()
    get sanctionGivenByAutoModeration(): boolean
    {
        return this._sanctionGivenByAutoModeration;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2056/_SafeCls_2648.as::get appealStatus()
    get appealStatus(): number
    {
        return this._appealStatus;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2056/_SafeCls_2648.as::get appealCreationTime()
    get appealCreationTime(): number
    {
        return this._appealCreationTime;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2056/_SafeCls_2648.as::get appealResolutionTime()
    get appealResolutionTime(): number
    {
        return this._appealResolutionTime;
    }
}
