import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IBinarySearchTest} from './IBinarySearchTest';

/**
 * Binary search helper for cutting text to fit within a height constraint.
 *
 * @see sources/win63_version/habbo/navigator/CutToHeight.as
 */
export class CutToHeight implements IBinarySearchTest
{
	private _value: string = '';
	private _text: ITextWindow | null = null;
	private _maxHeight: number = 0;

	test(index: number): boolean
	{
		if (!this._text) return false;

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
