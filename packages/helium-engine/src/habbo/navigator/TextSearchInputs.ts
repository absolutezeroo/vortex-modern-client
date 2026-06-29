import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboTransitionalNavigator} from './IHabboTransitionalNavigator';
import {TextFieldManager} from './TextFieldManager';
import {Util} from './Util';

/**
 * Search input management with search type dropdown.
 *
 * Manages a text search field with a dropdown for search type selection
 * (default, by owner, by room name, by tag, by group name).
 *
 * @see sources/win63_version/habbo/navigator/TextSearchInputs.as
 */
export class TextSearchInputs
{
	private _navigator: IHabboTransitionalNavigator | null;
	private _dropdown: IDropMenuWindow | null = null;

	constructor(navigator: IHabboTransitionalNavigator, container: IWindowContainer)
	{
		this._navigator = navigator;

		const searchField = container.findChildByName('search_str') as ITextFieldWindow | null;

		if (searchField)
		{
			this._searchStr = new TextFieldManager(
				navigator, searchField, 35,
				() => this.searchRooms(),
				navigator.getText('navigator.search.info')
			);
		}

		Util.setProc(container, 'search_but', this.onSearchButtonClick);

		this._dropdown = container.findChildByName('search_type') as IDropMenuWindow | null;

		if (this._dropdown)
		{
			const items: string[] = [];

			items.push(navigator.getText('${navigator.navisel.bydefault}'));
			items.push(navigator.getText('${navigator.navisel.byowner}'));
			items.push(navigator.getText('${navigator.navisel.byroomname}'));
			items.push(navigator.getText('${navigator.navisel.bytag}'));
			items.push(navigator.getText('${navigator.navisel.bygroupname}'));

			(this._dropdown as any).populate(items);
			(this._dropdown as any).selection = 0;
		}
	}

	private _searchStr: TextFieldManager | null = null;

	get searchStr(): TextFieldManager | null
	{
		return this._searchStr;
	}

	/**
	 * Sets the search text and selects the corresponding dropdown type.
	 *
	 * @param text - Search text
	 * @param searchType - Legacy search type code
	 */
	setText(text: string, searchType: number): void
	{
		if (this._searchStr)
		{
			this._searchStr.setText(text);
		}

		if (this._dropdown)
		{
			switch (searchType - 8)
			{
				case 0:
					(this._dropdown as any).selection = 0;
					break;
				case 1:
					(this._dropdown as any).selection = 3;
					break;
				case 2:
					(this._dropdown as any).selection = 2;
					break;
				case 5:
					(this._dropdown as any).selection = 4;
					break;
				case 12:
					(this._dropdown as any).selection = 1;
					break;
			}
		}
	}

	dispose(): void
	{
		if (this._searchStr)
		{
			this._searchStr.dispose();
			this._searchStr = null;
		}

		this._navigator = null;
	}

	private onSearchButtonClick = (event: WindowEvent, _window: IWindow): void =>
	{
		if (event.type !== 'WME_CLICK') return;

		this.searchRooms();
	};

	private searchRooms(): void
	{
		if (!this._searchStr || !this._navigator) return;

		const text = this._searchStr.getText();

		if (text === '') return;

		const mainViewCtrl = this._navigator.mainViewCtrl;

		if (this._dropdown && mainViewCtrl)
		{
			const selection = (this._dropdown as any).selection as number;

			switch (selection)
			{
				case 0:
					mainViewCtrl.startSearch(5, 8, text);
					break;
				case 1:
					mainViewCtrl.startSearch(5, 20, text);
					break;
				case 2:
					mainViewCtrl.startSearch(5, 10, text);
					break;
				case 3:
					mainViewCtrl.startSearch(5, 9, text);
					break;
				case 4:
					mainViewCtrl.startSearch(5, 13, text);
					break;
			}
		}
		else if (mainViewCtrl)
		{
			mainViewCtrl.startSearch(5, 8, text);
		}

		this._navigator.trackNavigationDataPoint('Search', 'search', text);
	}
}
