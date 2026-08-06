import type { ITextWindow } from '@core/window/components/ITextWindow';
import type { IBinarySearchTest } from './IBinarySearchTest';

/**
 * Binary search test that checks whether truncated text still overflows a text field's height.
 * Used by CutToWidth/CutToHeight to find the maximum character count that fits.
 *
 * @see sources/win63_version/habbo/navigator/class_4017.as
 */
export class TextWidthBinarySearchTest implements IBinarySearchTest
{
    // AS3: sources/win63_version/habbo/navigator/class_4017.as::_value
    private _value: string = '';
    // AS3: sources/win63_version/habbo/navigator/class_4017.as::_text
    private _text: ITextWindow | null = null;
    private _maxHeight: number = 0;

    // AS3: sources/win63_version/habbo/navigator/class_4017.as::test()
    test(index: number): boolean
    {
        if(this._text === null) return false;

        this._text.caption = this._value.substring(0, index) + '...';

        return (this._text as unknown as { textHeight?: number }).textHeight! > this._maxHeight;
    }

    // AS3: sources/win63_version/habbo/navigator/class_4017.as::beforeSearch()
    beforeSearch(value: string, text: ITextWindow, maxHeight: number): void
    {
        this._value = value;
        this._text = text;
        this._maxHeight = maxHeight;
    }

    dispose(): void
    {
        this._text = null;
    }
}
