import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * The player who finished a treasure hunt first, as pushed by TreasureHuntFirstWinnerMessageEvent.
 *
 * Carries enough to render the winner's head in a notification bubble: the figure and gender go to
 * `IAvatarRenderManager.createAvatarImage()`, whose result HabboFaceFocuser crops to the face.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/campaign/treasurehunt/TreasureHuntWinnerInfo.as
 */
export class TreasureHuntWinnerInfo
{
    private _huntId: string;
    private _userId: number;
    private _userName: string;
    private _userFigure: string;
    private _userGender: string;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2656/TreasureHuntWinnerInfo.as::TreasureHuntWinnerInfo()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._huntId = wrapper.readString();
        this._userId = wrapper.readInt();
        this._userName = wrapper.readString();
        this._userFigure = wrapper.readString();
        this._userGender = wrapper.readString();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2656/TreasureHuntWinnerInfo.as::get huntId()
    get huntId(): string
    {
        return this._huntId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2656/TreasureHuntWinnerInfo.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2656/TreasureHuntWinnerInfo.as::get userName()
    get userName(): string
    {
        return this._userName;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2656/TreasureHuntWinnerInfo.as::get userFigure()
    get userFigure(): string
    {
        return this._userFigure;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2656/TreasureHuntWinnerInfo.as::get userGender()
    get userGender(): string
    {
        return this._userGender;
    }
}
