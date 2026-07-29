import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for the prize a mystery box paid out.
 *
 * `contentType` is the one-letter product code the reward dialog switches on — "s" floor item,
 * "i" wall item, "e" pixel effect, "h" subscription product — and `classId` is that product's id
 * within its own space (furni type id, effect id, …), not a catalog page offer id.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/mysterybox/GotMysteryBoxPrizeMessageEventParser.as
 *
 * WIN63 primary has the identical shape at `src/unknowns/_SafePkg_1737/_SafeCls_4210.as` (readable
 * members `contentType`/`classId`, obfuscated class); the class name comes from the win63_version tree.
 */
export class GotMysteryBoxPrizeMessageParser implements IMessageParser
{
    private _contentType: string = '';

    // AS3: GotMysteryBoxPrizeMessageEventParser.as::get contentType()
    get contentType(): string
    {
        return this._contentType;
    }

    private _classId: number = 0;

    // AS3: GotMysteryBoxPrizeMessageEventParser.as::get classId()
    get classId(): number
    {
        return this._classId;
    }

    /**
     * AS3 nulls `contentType` only — `classId` keeps its previous value across a flush. Kept as-is:
     * every reader takes the pair together, so the stale int is never observed alone.
     */
    // AS3: GotMysteryBoxPrizeMessageEventParser.as::flush()
    flush(): boolean
    {
        this._contentType = '';

        return true;
    }

    // AS3: GotMysteryBoxPrizeMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._contentType = wrapper.readString();
        this._classId = wrapper.readInt();

        return true;
    }
}
