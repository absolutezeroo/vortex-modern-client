import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import {WindowParam} from '@core/window/enum/WindowParam';
import type {HabboNewNavigator} from '../../HabboNewNavigator';
import {FilterMode} from './FilterMode';

/**
 * Search input view for the navigator.
 *
 * Manages the search text field, filter dropdown, and clear button.
 * Translates user input + filter selection into a filter parameter string.
 *
 * @see sources/win63_version/habbo/navigator/view/search/SearchView.as
 */
// AS3: sources/win63_version/habbo/navigator/view/search/SearchView.as::SearchView
export class SearchView
{
	/** Maps dropdown selection index → FilterMode constant */
	private static readonly FILTER_SELECTOR_INDEX_TO_MODE: number[] = [5, 2, 1, 3, 4];

	/** Maps FilterMode constant → dropdown selection index */
	private static readonly FILTER_MODE_TO_SELECTOR_INDEX: number[] = [0, 2, 1, 3, 4, 0];

	private static readonly INPUT_PLACEHOLDER_TEXTCOLOR: number = 0x9FADFF;
	private static readonly INPUT_TEXTCOLOR: number = 0x000000;

	private _navigator: HabboNewNavigator;
	private _inputField: ITextFieldWindow | null = null;
	private _filterDropMenu: IDropMenuWindow | null = null;
	private _searchInputClickArea: IWindow | null = null;
	private _clearButton: IWindow | null = null;
	private _placeholderText: string;

	constructor(navigator: HabboNewNavigator)
	{
		this._navigator = navigator;
		this._placeholderText = this._navigator.getLocalization(
			'navigator.filter.input.placeholder',
			'filter rooms by...'
		);
	}

	private _container: IWindowContainer | null = null;

	/**
	 * Set the container and wire up search input controls.
	 *
	 * @see sources/win63_version/habbo/navigator/view/search/SearchView.as set container()
	 */
	// AS3: sources/win63_version/habbo/navigator/view/search/SearchView.as::set container()
	set container(value: IWindowContainer)
	{
		this.removeInputListeners();
		this._container = value;

		this._filterDropMenu = this._container.findChildByName('filter_type_drop_menu') as IDropMenuWindow | null;
		this._inputField = this._container.findChildByName('search_input') as ITextFieldWindow | null;

		if (this._inputField)
		{
			this._inputField.addEventListener('WKE_KEY_UP', this.keyUpHandler);
			this._inputField.addEventListener('WE_CHANGE', this.onInputChanged);
			this._inputField.addEventListener('WE_FOCUSED', this.onInputFocused);
			this._inputField.addEventListener('WME_DOWN', this.onSearchInputMouse);
			this._inputField.addEventListener('WME_CLICK', this.onSearchInputMouse);

			this._searchInputClickArea = this._inputField.parent;

			if (this._searchInputClickArea)
			{
				this._searchInputClickArea.setParamFlag(WindowParam.INPUT_EVENT_PROCESSOR, true);
				this._searchInputClickArea.addEventListener('WME_DOWN', this.onSearchInputMouse);
				this._searchInputClickArea.addEventListener('WME_CLICK', this.onSearchInputMouse);
			}
		}

		this._clearButton = this._container.findChildByName('clear_search_button');

		if (this._clearButton)
		{
			this._clearButton.addEventListener('WME_CLICK', this.onClearSearch);
		}

		this.clear();
	}

	/**
	 * Get the current text in the search input.
	 *
	 * @see sources/win63_version/habbo/navigator/view/search/SearchView.as get currentInput()
	 */
	get currentInput(): string
	{
		if (this._inputField)
		{
			return this._inputField.caption;
		}

		return this._placeholderText;
	}

	/**
	 * Clear the search input and reset the filter dropdown.
	 *
	 * @see sources/win63_version/habbo/navigator/view/search/SearchView.as clear()
	 */
	clear(): void
	{
		this.setInputToFilterPlaceHolder();

		if (this._filterDropMenu && this._filterDropMenu.numMenuItems > 0)
		{
			this._filterDropMenu.selection = 0;
		}

		const refreshContainer = this._container?.findChildByName('refreshButtonContainer');

		if (refreshContainer)
		{
			refreshContainer.visible = false;
		}
	}

	/**
	 * Set the text and search mode from a filter string.
	 *
	 * Parses the filter prefix to detect filter mode, then sets the dropdown
	 * and input text accordingly.
	 *
	 * @param filteringData - The raw filter string from search results
	 * @param source - Optional source hint
	 *
	 * @see sources/win63_version/habbo/navigator/view/search/SearchView.as setTextAndSearchModeFromFilter()
	 */
	setTextAndSearchModeFromFilter(filteringData: string, source: string = ''): void
	{
		const safeFilteringData = filteringData ?? '';
		const filterMode = FilterMode.filterInInput(safeFilteringData);

		if (filterMode !== FilterMode.DEFAULT)
		{
			if (this._filterDropMenu)
			{
				this._filterDropMenu.selection = SearchView.FILTER_MODE_TO_SELECTOR_INDEX[filterMode];
			}

			if (this._inputField)
			{
				const prefix = FilterMode.FILTER_PREFIX[filterMode];

				this._inputField.caption = safeFilteringData.substr(prefix.length, safeFilteringData.length - prefix.length);
			}
		}
		else
		{
			if (this._inputField)
			{
				this._inputField.caption = safeFilteringData;
			}

			if (this._filterDropMenu)
			{
				this._filterDropMenu.selection = 0;
			}
		}

		if (source !== '' && source !== this._placeholderText)
		{
			if (this._inputField)
			{
				this._inputField.caption = source;
			}

			this.setInputFieldTextFormattingToPlaceholder(true);
		}
		else if (this._inputField?.caption === '')
		{
			this.setInputToFilterPlaceHolder();
		}
		else
		{
			this.setInputFieldTextFormattingToPlaceholder(false);
		}

		// Show/hide refresh button and toggle clear icon based on content
		const clearIcon = this._container?.findChildByName('search.clear.icon') as unknown as IStaticBitmapWrapperWindow | null;

		const inputCaption = this._inputField?.caption ?? '';

		if(this._inputField && inputCaption.length !== 0 && inputCaption !== this._placeholderText)
		{
			const refreshContainer = this._container?.findChildByName('refreshButtonContainer');

			if(refreshContainer)
			{
				refreshContainer.visible = true;
			}

			if(clearIcon)
			{
				clearIcon.assetUri = 'icons_close';
			}
		}
		else
		{
			const refreshContainer = this._container?.findChildByName('refreshButtonContainer');

			if(refreshContainer)
			{
				refreshContainer.visible = false;
			}

			if(clearIcon)
			{
				clearIcon.assetUri = 'common_small_pen';
			}
		}
	}

	/**
	 * Build the filter parameter string from the dropdown selection and input text.
	 *
	 * @returns The combined filter prefix + input text
	 *
	 * @see sources/win63_version/habbo/navigator/view/search/SearchView.as getFilterParameter()
	 */
	getFilterParameter(): string
	{
		const selectorIndex = this._filterDropMenu?.selection ?? 0;
		const filterMode = SearchView.FILTER_SELECTOR_INDEX_TO_MODE[selectorIndex];
		const inputCaption = this._inputField?.caption ?? '';

		return FilterMode.FILTER_PREFIX[filterMode] + inputCaption;
	}

	private setInputToFilterPlaceHolder(): void
	{
		this.setInputFieldTextFormattingToPlaceholder(true);

		if (this._inputField)
		{
			this._inputField.caption = this._placeholderText;
		}
	}

	/**
	 * In AS3, this sets textColor and italic on the text field.
	 *
	 * @see sources/win63_version/habbo/navigator/view/search/SearchView.as setInputFieldTextFormattingToPlaceholder()
	 */
	private setInputFieldTextFormattingToPlaceholder(isPlaceholder: boolean): void
	{
		if(this._inputField)
		{
			this._inputField.textColor = isPlaceholder ? SearchView.INPUT_PLACEHOLDER_TEXTCOLOR : SearchView.INPUT_TEXTCOLOR;
			(this._inputField as any).italic = isPlaceholder;
		}
	}

	private keyUpHandler = (event: WindowEvent): void =>
	{
		const kbEvent = event as unknown as WindowKeyboardEvent;

		if (kbEvent.keyCode === 13)
		{
			const searchCode = this._navigator.currentResults?.searchCodeOriginal ?? 'official_view';

			this._navigator.performSearch(searchCode, this.getFilterParameter());
		}
	};

	private onInputFocused = (_event: WindowEvent): void =>
	{
		this.setInputFieldTextFormattingToPlaceholder(false);

		if (this._inputField && this._inputField.caption === this._placeholderText)
		{
			this._inputField.caption = '';
		}
	};

	private onSearchInputMouse = (event: WindowEvent): void =>
	{
		(this._inputField as unknown as { focus?: () => boolean | void } | null)?.focus?.();
		this.onInputFocused(event);
	};

	private onInputChanged = (_event: WindowEvent): void =>
	{
		// Placeholder — AS3 has empty handler too
	};

	private onClearSearch = (_event: WindowEvent): void =>
	{
		if(this._inputField)
		{
			(this._inputField as any).focus?.();
			this._inputField.caption = '';
		}

		// Reset clear icon to pen icon (AS3: search.clear.icon = common_small_pen)
		if(this._container)
		{
			const clearIcon = this._container.findChildByName('search.clear.icon') as unknown as IStaticBitmapWrapperWindow | null;

			if(clearIcon)
			{
				clearIcon.assetUri = 'common_small_pen';
			}
		}
	};

	private removeInputListeners(): void
	{
		if (this._inputField)
		{
			this._inputField.removeEventListener('WKE_KEY_UP', this.keyUpHandler);
			this._inputField.removeEventListener('WE_CHANGE', this.onInputChanged);
			this._inputField.removeEventListener('WE_FOCUSED', this.onInputFocused);
			this._inputField.removeEventListener('WME_DOWN', this.onSearchInputMouse);
			this._inputField.removeEventListener('WME_CLICK', this.onSearchInputMouse);
		}

		if (this._searchInputClickArea)
		{
			this._searchInputClickArea.removeEventListener('WME_DOWN', this.onSearchInputMouse);
			this._searchInputClickArea.removeEventListener('WME_CLICK', this.onSearchInputMouse);
		}

		if (this._clearButton)
		{
			this._clearButton.removeEventListener('WME_CLICK', this.onClearSearch);
		}

		this._inputField = null;
		this._filterDropMenu = null;
		this._searchInputClickArea = null;
		this._clearButton = null;
	}

	// AS3: sources/win63_version/habbo/navigator/view/search/SearchView.as::dispose()
	dispose(): void
	{
		this.removeInputListeners();
		this._container = null;
	}
}
