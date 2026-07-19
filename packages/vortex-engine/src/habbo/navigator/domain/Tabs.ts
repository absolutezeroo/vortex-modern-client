import { Tab } from './Tab';
import { CategoriesTabPageDecorator } from '../mainview/tabpagedecorators/CategoriesTabPageDecorator';
import { EventsTabPageDecorator } from '../mainview/tabpagedecorators/EventsTabPageDecorator';
import { MyRoomsTabPageDecorator } from '../mainview/tabpagedecorators/MyRoomsTabPageDecorator';
import { OfficialTabPageDecorator } from '../mainview/tabpagedecorators/OfficialTabPageDecorator';
import { RoomsTabPageDecorator } from '../mainview/tabpagedecorators/RoomsTabPageDecorator';
import { SearchTabPageDecorator } from '../mainview/tabpagedecorators/SearchTabPageDecorator';
import type { ITabNavigator } from './Tab';

/**
 * All navigator tab ID constants.
 *
 * @see sources/win63_version/habbo/navigator/domain/Tabs.as
 */
export const TAB_EVENTS = 1;
export const TAB_ROOMS = 2;
export const TAB_ME = 3;
export const TAB_OFFICIAL = 4;
export const TAB_SEARCH = 5;
export const TAB_CATEGORIES = 6;

export const SEARCHTYPE_POPULAR_ROOMS = 1;
export const SEARCHTYPE_ROOMS_WITH_HIGHEST_SCORE = 2;
export const SEARCHTYPE_MY_FRIENDS_ROOMS = 3;
export const SEARCHTYPE_ROOMS_WHERE_MY_FRIENDS_ARE = 4;
export const SEARCHTYPE_MY_ROOMS = 5;
export const SEARCHTYPE_MY_FAVOURITES = 6;
export const SEARCHTYPE_VISITED_ROOMS = 7;
export const SEARCHTYPE_TEXT_SEARCH = 8;
export const SEARCHTYPE_TAG_SEARCH = 9;
export const SEARCHTYPE_ROOM_NAME_SEARCH = 10;
export const SEARCHTYPE_OFFICIALROOMS = 11;
export const SEARCHTYPE_GROUP_NAME_SEARCH = 13;
export const SEARCHTYPE_GUILD_BASES = 14;
export const SEARCHTYPE_COMPETITION_ROOMS = 15;
export const SEARCHTYPE_ROOMAD_TOP = 16;
export const SEARCHTYPE_ROOMAD_NEW = 17;
export const SEARCHTYPE_ROOMS_WITH_RIGHTS = 18;
export const SEARCHTYPE_MY_GUILD_BASES = 19;
export const SEARCHTYPE_BY_OWNER = 20;
export const SEARCHTYPE_CATEGORIES = 21;
export const SEARCHTYPE_RECOMMENDED_ROOMS = 22;
export const SEARCHTYPE_NO_FRIENDS_FILTER = 23;

const TAB_NAMES: Record<string, number> = {
    popular: 2,
    official: 4,
    me: 3,
    events: 1,
    search: 5,
    categories: 6,
};

/**
 * Collection of all tabs and their decorators for the old navigator.
 *
 * @see sources/win63_version/habbo/navigator/domain/Tabs.as
 */
export class Tabs
{
    private _tabs: Tab[];
    private _navigator: ITabNavigator;

    constructor(navigator: ITabNavigator)
    {
        this._navigator = navigator;
        this._tabs = [
            new Tab(navigator, TAB_EVENTS,      16, new EventsTabPageDecorator(navigator),     1),
            new Tab(navigator, TAB_CATEGORIES,  21, new CategoriesTabPageDecorator(navigator), 5),
            new Tab(navigator, TAB_ROOMS,        1, new RoomsTabPageDecorator(navigator),      1),
            new Tab(navigator, TAB_OFFICIAL,    11, new OfficialTabPageDecorator(navigator),   4),
            new Tab(navigator, TAB_ME,           5, new MyRoomsTabPageDecorator(navigator),    1),
            new Tab(navigator, TAB_SEARCH,       8, new SearchTabPageDecorator(navigator),     2),
        ];

        this.setSelectedTab(TAB_EVENTS);
    }

    static tabIdFromName(name: string, fallback: number): number
    {
        return name in TAB_NAMES ? TAB_NAMES[name] : fallback;
    }

    onFrontPage(): boolean
    {
        return this.getSelected()?.id === TAB_OFFICIAL;
    }

    get tabs(): Tab[]
    {
        return this._tabs;
    }

    setSelectedTab(id: number): void
    {
        const tab = this.getTab(id);

        if(tab !== null)
        {
            this.clearSelected();
            tab.selected = true;
        }
    }

    getSelected(): Tab | null
    {
        for(const tab of this._tabs)
        {
            if(tab.selected) return tab;
        }

        return null;
    }

    getTab(id: number): Tab | null
    {
        for(const tab of this._tabs)
        {
            if(tab.id === id) return tab;
        }

        return null;
    }

    private clearSelected(): void
    {
        for(const tab of this._tabs)
        {
            tab.selected = false;
        }
    }
}
