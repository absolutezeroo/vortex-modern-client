import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Progress push for the treasure hunt the player is running: how many steps are done, and whether
 * that was the last one.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/campaign/treasurehunt/TreasureHuntUpdateMessageEventParser.as
 */
export class TreasureHuntUpdateMessageEventParser implements IMessageParser
{
    private _huntId: string | null = null;
    private _stepsCompleted: number = 0;
    private _totalSteps: number = 0;
    private _isCompleted: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2656/_SafeCls_3955.as::get huntId()
    get huntId(): string | null
    {
        return this._huntId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2656/_SafeCls_3955.as::get stepsCompleted()
    get stepsCompleted(): number
    {
        return this._stepsCompleted;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2656/_SafeCls_3955.as::get totalSteps()
    get totalSteps(): number
    {
        return this._totalSteps;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2656/_SafeCls_3955.as::get isCompleted()
    get isCompleted(): boolean
    {
        return this._isCompleted;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2656/_SafeCls_3955.as::flush()
    flush(): boolean
    {
        this._huntId = null;
        this._stepsCompleted = 0;
        this._totalSteps = 0;
        this._isCompleted = false;

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2656/_SafeCls_3955.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._huntId = wrapper.readString();
        this._stepsCompleted = wrapper.readInt();
        this._totalSteps = wrapper.readInt();
        this._isCompleted = wrapper.readBoolean();

        return true;
    }
}
