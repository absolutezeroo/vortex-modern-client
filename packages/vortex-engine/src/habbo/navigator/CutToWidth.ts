import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IBinarySearchTest} from './IBinarySearchTest';

/**
 * Binary search helper for cutting text to fit within a width constraint.
 *
 * @see sources/win63_version/habbo/navigator/CutToWidth.as
 */
export class CutToWidth implements IBinarySearchTest
{
    // AS3: sources/win63_version/habbo/navigator/CutToWidth.as::_value
    private _value: string = '';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/CutToWidth.as::_text
    private _text: ITextWindow | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/CutToWidth.as::_maxWidth
    private _maxWidth: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/CutToWidth.as::test()
    test(index: number): boolean
    {
        if(!this._text) return false;

        this._text.text = this._value.substring(0, index) + '...';

        return this._text.textWidth > this._maxWidth;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/CutToWidth.as::beforeSearch()
    beforeSearch(value: string, textWindow: ITextWindow, maxWidth: number): void
    {
        this._value = value;
        this._text = textWindow;
        this._maxWidth = maxWidth;
    }
}
