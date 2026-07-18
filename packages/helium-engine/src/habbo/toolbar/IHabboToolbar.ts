import type {EventEmitter} from 'eventemitter3';
import type {Motion} from '@core/window/motion/Motion';
import type {IExtensionView} from './IExtensionView';
import type {IRoomUI} from '@habbo/ui/IRoomUI';
import type {IWindow} from '@core/window/IWindow';

/**
 * Interface for the Habbo toolbar component
 *
 * Provides methods for managing toolbar state, icon visibility,
 * and extension panels.
 *
 * @see source_as_win63/habbo/toolbar/IHabboToolbar.as
 */
export interface IHabboToolbar
{
    /**
	 * Custom toolbar event emitter (NOT the Component events)
	 */
    readonly toolbarEvents: EventEmitter;

    /**
	 * The extension view container for toolbar extensions
	 */
    readonly extensionView: IExtensionView | null;

    /**
	 * The width of the toolbar area
	 */
    readonly toolBarAreaWidth: number;

    /**
	 * Room UI dependency used by the bottom bar resize flow.
	 */
    // AS3: sources/win63_version/habbo/toolbar/IHabboToolbar.as::get roomUI()
    readonly roomUI: IRoomUI | null;

    /**
	 * Set whether the user is on duty (moderation)
	 */
    onDuty: boolean;

    /**
	 * Set the toolbar state (hotel view, room view, hidden, etc.)
	 *
	 * @param state One of HabboToolbarEnum state constants
	 */
    setToolbarState(state: string): void;

    /**
	 * Get the screen location of a toolbar icon
	 *
	 * @param iconId Icon identifier
	 * @returns Rectangle-like object with position, or null
	 */
    getIconLocation(iconId: string): { x: number; y: number; width: number; height: number } | null;

    /**
	 * Set bitmap data for a toolbar icon
	 *
	 * @param iconId Icon identifier
	 * @param bitmap Bitmap data (implementation-specific)
	 */
    setIconBitmap(iconId: string, bitmap: unknown): void;

    /**
	 * Get the bounding rectangle of the toolbar
	 *
	 * @returns Rectangle-like object with toolbar bounds
	 */
    getRect(): { x: number; y: number; width: number; height: number };

    /**
	 * Set the visibility of a toolbar icon
	 *
	 * @param iconId Icon identifier
	 * @param visible Whether the icon should be visible
	 */
    setIconVisibility(iconId: string, visible: boolean): void;

    /**
	 * Toggle the visibility of a window by icon name
	 *
	 * @param iconName Icon name to toggle
	 */
    toggleWindowVisibility(iconName: string): void;

    /**
	 * Animate a bitmap from a source position to a toolbar icon.
	 *
	 * Creates a temporary floating bitmap that flies from (startX, startY)
	 * to the target icon with a jump arc, then bounces the icon on arrival.
	 *
	 * @param iconId Target icon identifier (e.g. 'HTIE_ICON_INVENTORY')
	 * @param bitmap The bitmap to animate (ownership is transferred)
	 * @param startX Source X position in global coordinates
	 * @param startY Source Y position in global coordinates
	 * @returns The fly motion, or null if the icon was not found
	 * @see sources/win63_version/habbo/toolbar/IHabboToolbar.as createTransitionToIcon()
	 */
    createTransitionToIcon(iconId: string, bitmap: ImageBitmap | null, startX: number, startY: number): Motion | null;

    /**
	 * Get the toolbar icon window for an icon identifier
	 *
	 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/IHabboToolbar.as::getIcon()
	 */
    getIcon(iconId: string): IWindow | null;

    /**
	 * Refresh the purse area's indicators (currency/club icons)
	 *
	 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/IHabboToolbar.as::refreshPurseAreaIndicators()
	 */
    refreshPurseAreaIndicators(): void;
}
