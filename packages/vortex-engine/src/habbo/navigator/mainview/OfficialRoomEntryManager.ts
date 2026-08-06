import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IHabboTransitionalNavigator} from '../IHabboTransitionalNavigator';
import {UserCountRenderer} from '../UserCountRenderer';
import {Util} from '../Util';

/**
 * Manages creation and display of official room entries.
 *
 * @see sources/win63_version/habbo/navigator/mainview/OfficialRoomEntryManager.as
 */
export class OfficialRoomEntryManager implements IDisposable
{
    // AS3: sources/win63_version/habbo/navigator/mainview/OfficialRoomEntryManager.as::HOTTEST_GROUPS_TAG
    private static readonly HOTTEST_GROUPS_TAG: string = 'hottest_groups';
    // AS3: sources/win63_version/habbo/navigator/mainview/OfficialRoomEntryManager.as::IMAGE_WIDTH_WIDE
    private static readonly IMAGE_WIDTH_WIDE: number = 267;
    // AS3: sources/win63_version/habbo/navigator/mainview/OfficialRoomEntryManager.as::IMAGE_WIDTH_NARROW
    private static readonly IMAGE_WIDTH_NARROW: number = 65;
    // AS3: sources/win63_version/habbo/navigator/mainview/OfficialRoomEntryManager.as::NARROW_IMAGE_OFFSET
    private static readonly NARROW_IMAGE_OFFSET: number = -70;
    // AS3: sources/win63_version/habbo/navigator/mainview/OfficialRoomEntryManager.as::_navigator
    private _navigator: IHabboTransitionalNavigator | null;
    private _userCountRenderer: UserCountRenderer;

    constructor(navigator: IHabboTransitionalNavigator)
    {
        this._navigator = navigator;
        this._userCountRenderer = new UserCountRenderer(navigator);
    }

    // AS3: sources/win63_version/habbo/navigator/mainview/OfficialRoomEntryManager.as::_disposed
    private _disposed: boolean = false;

    // AS3: sources/win63_version/habbo/navigator/mainview/OfficialRoomEntryManager.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
	 * Creates an official room entry container.
	 *
	 * @param isWide - Whether to create a wide entry
	 * @returns The entry container
	 */
    // AS3: sources/win63_version/habbo/navigator/mainview/OfficialRoomEntryManager.as::createEntry()
    createEntry(isWide: boolean): IWindowContainer | null
    {
        if(!this._navigator) return null;

        const xmlName = isWide ? 'orl_wide_entry' : 'orl_narrow_entry';
        const window = this._navigator.getXmlWindow(xmlName);

        return window as unknown as IWindowContainer | null;
    }

    /**
	 * Refreshes an official room entry with data.
	 *
	 * @param container - The entry container
	 * @param isWide - Whether this is a wide entry
	 * @param entryData - The entry data to display
	 */
    // AS3: sources/win63_version/habbo/navigator/mainview/OfficialRoomEntryManager.as::refreshEntry()
    refreshEntry(container: IWindowContainer, isWide: boolean, entryData: unknown): void
    {
        if(!container || !entryData) return;

        Util.hideChildren(container);

        // Delegate to appropriate refresh based on entry type
        this.refreshNormalEntry(container, isWide, entryData);
    }

    /**
	 * Refreshes the ad footer.
	 *
	 * @param container - The footer container
	 */
    // AS3: sources/win63_version/habbo/navigator/mainview/OfficialRoomEntryManager.as::refreshAdFooter()
    refreshAdFooter(container: IWindowContainer): void
    {
        if(!container) return;

        container.visible = false;
    }

    // AS3: sources/win63_version/habbo/navigator/mainview/OfficialRoomEntryManager.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._userCountRenderer.dispose();
        this._navigator = null;
    }

    // AS3: sources/win63_version/habbo/navigator/mainview/OfficialRoomEntryManager.as::refreshNormalEntry()
    private refreshNormalEntry(container: IWindowContainer, _isWide: boolean, _entryData: unknown): void
    {
        container.visible = true;
    }
}
