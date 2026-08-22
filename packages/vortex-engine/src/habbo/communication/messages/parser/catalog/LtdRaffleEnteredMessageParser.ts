import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * The player is now in the draw for a limited-edition item (header 2901).
 *
 * One string, the product's class name — and nothing reads it: `HabboCatalog.onLtdRaffleEntered()`
 * only starts the dialog's "raffling…" animation. It is parsed because the wire says so.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_2408.as
 * (obfuscated; the class is named for its readable filename in
 * sources/win63_version/habbo/communication/messages/parser/catalog/, and `className` keeps its
 * real name in the primary tree.)
 */
export class LtdRaffleEnteredMessageParser implements IMessageParser
{
    // AS3: .../_SafeCls_2408.as::_className
    private _className: string = '';

    // AS3: .../_SafeCls_2408.as::get className()
    get className(): string
    {
        return this._className;
    }

    // AS3: .../_SafeCls_2408.as::flush()
    flush(): boolean
    {
        this._className = '';

        return true;
    }

    // AS3: .../_SafeCls_2408.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._className = wrapper.readString();

        return true;
    }
}
