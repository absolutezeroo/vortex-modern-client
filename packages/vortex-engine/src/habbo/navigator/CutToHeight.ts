import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IBinarySearchTest} from './IBinarySearchTest';

/**
 * Binary search helper for cutting text to fit within a height constraint.
 *
 * @see sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/CutToHeight.as
 */
export class CutToHeight implements IBinarySearchTest
{
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/CutToHeight.as::_value
    private _value: string = '';
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/CutToHeight.as::_text
    private _text: ITextWindow | null = null;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/CutToHeight.as::_maxHeight
    private _maxHeight: number = 0;

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/CutToHeight.as::test()
    test(index: number): boolean
    {
        if(!this._text) return false;

        this._text.text = this._value.substring(0, index) + '...';

        return this._text.textHeight > this._maxHeight;
    }

    beforeSearch(value: string, textWindow: ITextWindow, maxHeight: number): void
    {
        this._value = value;
        this._text = textWindow;
        this._maxHeight = maxHeight;
    }
}
