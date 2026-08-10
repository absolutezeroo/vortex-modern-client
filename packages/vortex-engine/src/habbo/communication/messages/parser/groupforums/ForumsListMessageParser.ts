import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {ForumData} from './ForumData';

/**
 * A page of forums. `listCode` says which list was asked for (most active, my groups, …) and
 * `totalAmount` is the whole list's size, against `amount` for this page.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2470/_SafeCls_2745.as
 * (readable as `ForumsListMessageEventParser` in win63_version — whose own body reads
 * `while(0 < amount)` with the counter never tested, the decompiler corruption CLAUDE.md
 * documents. The loop below is the primary tree's, which terminates.)
 */
export class ForumsListMessageParser implements IMessageParser
{
    // AS3: _SafeCls_2745.as::_listCode
    private _listCode: number = 0;

    // AS3: _SafeCls_2745.as::_totalAmount
    private _totalAmount: number = 0;

    // AS3: _SafeCls_2745.as::_startIndex
    private _startIndex: number = 0;

    // AS3: _SafeCls_2745.as::_amount
    private _amount: number = 0;

    // AS3: _SafeCls_2745.as::_forums
    private _forums: ForumData[] = [];

    // AS3: _SafeCls_2745.as::get listCode()
    get listCode(): number
    {
        return this._listCode;
    }

    // AS3: _SafeCls_2745.as::get totalAmount()
    get totalAmount(): number
    {
        return this._totalAmount;
    }

    // AS3: _SafeCls_2745.as::get startIndex()
    get startIndex(): number
    {
        return this._startIndex;
    }

    // AS3: _SafeCls_2745.as::get amount()
    get amount(): number
    {
        return this._amount;
    }

    // AS3: _SafeCls_2745.as::get forums()
    get forums(): ForumData[]
    {
        return this._forums;
    }

    // AS3: _SafeCls_2745.as::flush()
    flush(): boolean
    {
        this._listCode = 0;
        this._totalAmount = 0;
        this._startIndex = 0;
        this._amount = 0;
        this._forums = [];

        return true;
    }

    // AS3: _SafeCls_2745.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._listCode = wrapper.readInt();
        this._totalAmount = wrapper.readInt();
        this._startIndex = wrapper.readInt();
        this._amount = wrapper.readInt();
        this._forums = [];

        for(let i = 0; i < this._amount; i++)
        {
            this._forums.push(ForumData.readFromMessage(wrapper));
        }

        return true;
    }
}
