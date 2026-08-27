import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Refusal push: the player is below the level this hunt requires. Two thresholds come back, the
 * second being the lower one HC members get.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/campaign/treasurehunt/TreasureHuntFailMessageEventParser.as
 */
export class TreasureHuntFailMessageEventParser implements IMessageParser
{
    private _huntId: string | null = null;
    private _requiredLevel: number = 0;
    private _requiredLevelPaying: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2656/_SafeCls_3563.as::get huntId()
    get huntId(): string | null
    {
        return this._huntId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2656/_SafeCls_3563.as::get requiredLevel()
    get requiredLevel(): number
    {
        return this._requiredLevel;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2656/_SafeCls_3563.as::get requiredLevelPaying()
    get requiredLevelPaying(): number
    {
        return this._requiredLevelPaying;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2656/_SafeCls_3563.as::flush()
    flush(): boolean
    {
        this._huntId = null;
        this._requiredLevel = 0;
        this._requiredLevelPaying = 0;

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2656/_SafeCls_3563.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._huntId = wrapper.readString();
        this._requiredLevel = wrapper.readInt();
        this._requiredLevelPaying = wrapper.readInt();

        return true;
    }
}
