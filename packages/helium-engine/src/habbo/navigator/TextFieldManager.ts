import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import type {IHabboTransitionalNavigator} from './IHabboTransitionalNavigator';
import {Util} from './Util';

/**
 * Manages a text input field with placeholder, validation, and error display.
 *
 * Supports placeholder text (initial info mode), mandatory validation with
 * inline error popups, max length enforcement, and Enter key callbacks.
 *
 * @see sources/win63_version/habbo/navigator/TextFieldManager.as
 */
export class TextFieldManager
{
	private _navigator: IHabboTransitionalNavigator | null;
	private _includeInfo: boolean = false;
	private _placeholderText: string = '';
	private _maxTextLen: number;
	private _onEnter: (() => void) | null;
	private _emptyValue: string = '';
	private _errorPopup: IWindowContainer | null = null;
	private _orgTextBackground: boolean;
	private _orgTextBackgroundColor: number;

	// AS3: sources/win63_version/habbo/navigator/TextFieldManager.as::TextFieldManager()
	constructor(navigator: IHabboTransitionalNavigator, textField: ITextFieldWindow, maxLen: number = 1000, onEnter: (() => void) | null = null, initialText: string | null = null)
	{
		this._navigator = navigator;
		this._input = textField;
		this._maxTextLen = maxLen;
		textField.maxChars = maxLen;
		this._onEnter = onEnter;

		if (initialText !== null)
		{
			this._includeInfo = true;
			this._placeholderText = initialText;
			this._input.text = initialText;
		}

		Util.setProcDirectly(this._input, this.onInputClick);
		this._input.addEventListener('WME_DOWN', this.focusInput);
		this._input.addEventListener('WME_CLICK', this.focusInput);
		this._input.addEventListener('WKE_KEY_DOWN', this.checkEnterPress);
		this._input.addEventListener('WE_CHANGE', this.checkMaxLen);
		this._orgTextBackground = this._input.textBackground;
		this._orgTextBackgroundColor = this._input.textBackgroundColor;
	}

	private _input: ITextFieldWindow | null;

	get input(): ITextFieldWindow | null
	{
		return this._input;
	}

	/**
	 * Validates the field is filled, shows error if not.
	 *
	 * @param errorMsg - Error message to display if validation fails
	 * @returns True if the field has valid input
	 */
	checkMandatory(errorMsg: string): boolean
	{
		if (!this.isInputValid())
		{
			this.displayError(errorMsg);

			return false;
		}

		this.restoreBackground();

		return true;
	}

	restoreBackground(): void
	{
		if (!this._input) return;

		this._input.textBackground = this._orgTextBackground;
		this._input.textBackgroundColor = this._orgTextBackgroundColor;
	}

	/**
	 * Displays an error popup below the input field.
	 *
	 * @param msg - Error message text
	 */
	displayError(msg: string): void
	{
		if (!this._input || !this._navigator) return;

		this._input.textBackground = true;
		this._input.textBackgroundColor = 0xFFF1861B;

		if (!this._errorPopup)
		{
			const xmlWindow = this._navigator.getXmlWindow('nav_error_popup');

			if (!xmlWindow) return;

			this._errorPopup = xmlWindow as unknown as IWindowContainer;
			this._navigator.refreshButton(this._errorPopup, 'popup_arrow_down', true, () =>
			{
			}, 0);

			const parent = this._input.parent as IWindowContainer;

			if (parent)
			{
				parent.addChild(this._errorPopup);
			}
		}

		const errorText = this._errorPopup.findChildByName('error_text') as ITextWindow | null;

		if (errorText)
		{
			errorText.text = msg;
			errorText.width = errorText.textWidth + 5;

			const border = this._errorPopup.findChildByName('border');

			if (border)
			{
				border.width = errorText.width + 15;
			}

			this._errorPopup.width = errorText.width + 15;
		}

		const pos = {x: 0, y: 0};

		this._input.getLocalPosition(pos);
		this._errorPopup.x = pos.x;
		this._errorPopup.y = pos.y - this._errorPopup.height + 3;

		const arrow = this._errorPopup.findChildByName('popup_arrow_down');

		if (arrow)
		{
			arrow.x = this._errorPopup.width / 2 - arrow.width / 2;
		}

		this._errorPopup.x += (this._input.width - this._errorPopup.width) / 2;
		this._errorPopup.visible = true;
	}

	/**
	 * Resets the field to its initial placeholder state.
	 */
	goBackToInitialState(): void
	{
		this.clearErrors();

		if (!this._input) return;

		if (this._placeholderText)
		{
			this._input.text = this._placeholderText;
			this._includeInfo = true;
		}
		else
		{
			this._input.text = '';
			this._includeInfo = false;
		}
	}

	getText(): string
	{
		if (this._includeInfo)
		{
			return this._emptyValue;
		}

		return this._input?.text ?? '';
	}

	setText(text: string): void
	{
		this._includeInfo = false;

		if (this._input)
		{
			this._input.text = text;
		}
	}

	clearErrors(): void
	{
		this.restoreBackground();

		if (this._errorPopup)
		{
			this._errorPopup.visible = false;
		}
	}

	// AS3: sources/win63_version/habbo/navigator/TextFieldManager.as::dispose()
	dispose(): void
	{
		if (this._input)
		{
			this._input.removeEventListener('WME_DOWN', this.focusInput);
			this._input.removeEventListener('WME_CLICK', this.focusInput);
			this._input.removeEventListener('WKE_KEY_DOWN', this.checkEnterPress);
			this._input.removeEventListener('WE_CHANGE', this.checkMaxLen);
			this._input.dispose();
			this._input = null;
		}

		if (this._errorPopup)
		{
			this._errorPopup.dispose();
			this._errorPopup = null;
		}

		this._navigator = null;
	}

	private isInputValid(): boolean
	{
		return !this._includeInfo && Util.trim(this.getText()).length > 2;
	}

	// AS3: sources/win63_version/habbo/navigator/TextFieldManager.as::onInputClick()
	private onInputClick = (event: WindowEvent, _window: IWindow): void =>
	{
		if (event.type !== 'WE_FOCUSED') return;

		if (!this._includeInfo) return;

		if (this._input)
		{
			this._input.text = this._emptyValue;
			(this._input as unknown as { focus(): boolean }).focus();
			this._input.setSelection(0, 0);
		}

		this._includeInfo = false;
		this.restoreBackground();
	};

	// TS-only: browser DOM focus bridge for AS3 TextField stage focus.
	private focusInput = (_event: WindowEvent): void =>
	{
		(this._input as unknown as { focus(): boolean } | null)?.focus();
	};

	private checkEnterPress = (event: WindowKeyboardEvent): void =>
	{
		if (event.charCode === 13)
		{
			if (this._onEnter)
			{
				this._onEnter();
			}
		}
	};

	private checkMaxLen = (_event: WindowEvent): void =>
	{
		if (!this._input) return;

		const text = this._input.text;

		if (text.length > this._maxTextLen)
		{
			this._input.text = text.substring(0, this._maxTextLen);
		}
	};
}
