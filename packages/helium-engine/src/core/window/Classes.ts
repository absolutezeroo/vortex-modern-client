import {WindowType} from './enum/WindowType';
import {WindowController} from './WindowController';
import {IconController} from './components/IconController';
import {IconButtonController} from './components/IconButtonController';
import {BackgroundController} from './components/BackgroundController';
import {ContainerController} from './components/ContainerController';
import {RegionController} from './components/RegionController';
import {HeaderController} from './components/HeaderController';
import {ToolTipController} from './components/ToolTipController';
import {TextController} from './components/TextController';
import {HTMLTextController} from './components/HTMLTextController';
import {TextLabelController} from './components/TextLabelController';
import {TextLinkController} from './components/TextLinkController';
import {FormattedTextController} from './components/FormattedTextController';
import {WidgetWindowController} from './components/WidgetWindowController';
import {BoxSizerController} from './components/BoxSizerController';
import {DisplayObjectWrapperController} from './components/DisplayObjectWrapperController';
import {BitmapWrapperController} from './components/BitmapWrapperController';
import {StaticBitmapWrapperController} from './components/StaticBitmapWrapperController';
import {BorderController} from './components/BorderController';
import {FrameController} from './components/FrameController';
import {ActivatorController} from './components/ActivatorController';
import {ContainerButtonController} from './components/ContainerButtonController';
import {SelectorController} from './components/SelectorController';
import {SelectorListController} from './components/SelectorListController';
import {SelectableButtonController} from './components/SelectableButtonController';
import {BubbleController} from './components/BubbleController';
import {ItemListController} from './components/ItemListController';
import {ItemGridController} from './components/ItemGridController';
import {ScrollableItemListWindow} from './components/ScrollableItemListWindow';
import {ScrollableItemGridWindow} from './components/ScrollableItemGridWindow';
import {ButtonController} from './components/ButtonController';
import {CheckBoxController} from './components/CheckBoxController';
import {RadioButtonController} from './components/RadioButtonController';
import {CloseButtonController} from './components/CloseButtonController';
import {InteractiveController} from './components/InteractiveController';
import {TextFieldController} from './components/TextFieldController';
import {PasswordFieldController} from './components/PasswordFieldController';
import {TabContextController} from './components/TabContextController';
import {TabButtonController} from './components/TabButtonController';
import {TabContainerButtonController} from './components/TabContainerButtonController';
import {DropMenuController} from './components/DropMenuController';
import {DropMenuItemController} from './components/DropMenuItemController';
import {DropListController} from './components/DropListController';
import {DropListItemController} from './components/DropListItemController';
import {ScalerController} from './components/ScalerController';
import {ScrollBarController} from './components/ScrollBarController';
import {ScrollBarLiftController} from './components/ScrollBarLiftController';

/**
 * Registry mapping window type IDs to their controller constructors.
 *
 * In AS3, each type maps to a specific controller class (ButtonController,
 * ContainerController, etc.). The Classes registry is used by WindowContext.create()
 * to instantiate the correct controller for a given type.
 *
 * Controllers are registered lazily on first call to init().
 *
 * @see sources/win63_2021_version/com/sulake/core/window/Classes.as
 */
export class Classes
{
	private static _registry: Map<number, new (...args: unknown[]) => unknown> | null = null;

	/**
	 * Initializes the type→constructor registry with all known window types.
	 *
	 * Must be called before any window creation. Safe to call multiple times.
	 */
	public static init(): void
	{
		if (Classes._registry) return;

		Classes._registry = new Map();

		// ── Basic types ─────────────────────────────────────────────
		Classes.register(WindowType.ICON, IconController as any);
		Classes.register(WindowType.BACKGROUND, BackgroundController as any);
		Classes.register(WindowType.CONTAINER, ContainerController as any);
		Classes.register(WindowType.REGION, RegionController as any);
		Classes.register(WindowType.HEADER, HeaderController as any);
		Classes.register(WindowType.TOOLBAR, ContainerController as any);
		Classes.register(WindowType.TOOLTIP, ToolTipController as any);
		Classes.register(WindowType.NOTIFY, ContainerController as any);

		// ── Text types ──────────────────────────────────────────────
		Classes.register(WindowType.TEXT, TextController as any);
		Classes.register(WindowType.HTML, HTMLTextController as any);
		Classes.register(WindowType.LABEL, TextLabelController as any);
		Classes.register(WindowType.LINK, TextLinkController as any);
		Classes.register(WindowType.FORMATTED_TEXT, FormattedTextController as any);

		// ── Widget / Layout types ───────────────────────────────────
		Classes.register(WindowType.WIDGET, WidgetWindowController as any);
		Classes.register(WindowType.BOXSIZER, BoxSizerController as any);

		// ── Display wrappers ────────────────────────────────────────
		Classes.register(WindowType.DISPLAY_OBJECT_WRAPPER, DisplayObjectWrapperController as any);
		Classes.register(WindowType.BITMAP_WRAPPER, BitmapWrapperController as any);
		Classes.register(WindowType.SHAPE_WRAPPER, WindowController as any);
		Classes.register(WindowType.STATIC_BITMAP_WRAPPER, StaticBitmapWrapperController as any);

		// ── Borders ─────────────────────────────────────────────────
		Classes.registerMultiple([
			WindowType.BORDER, WindowType.BORDER_THIN,
			WindowType.BORDER_THICK, WindowType.BORDER_NOTIFY,
		], BorderController as any);

		// ── Frames ──────────────────────────────────────────────────
		Classes.registerMultiple([
			WindowType.FRAME, WindowType.FRAME_THIN,
			WindowType.FRAME_THICK, WindowType.FRAME_NOTIFY,
		], FrameController as any);

		// ── Interactive containers ──────────────────────────────────
		Classes.register(WindowType.ACTIVATOR, ActivatorController as any);
		Classes.register(WindowType.CONTAINER_BUTTON, ContainerButtonController as any);
		Classes.register(WindowType.SELECTOR, SelectorController as any);
		Classes.register(WindowType.SELECTOR_LIST, SelectorListController as any);

		// ── Bubbles ─────────────────────────────────────────────────
		Classes.register(WindowType.BUBBLE, BubbleController as any);
		Classes.register(WindowType.BUBBLE_POINTER_UP, WindowController as any);
		Classes.register(WindowType.BUBBLE_POINTER_RIGHT, WindowController as any);
		Classes.register(WindowType.BUBBLE_POINTER_DOWN, WindowController as any);
		Classes.register(WindowType.BUBBLE_POINTER_LEFT, WindowController as any);

		// ── Item lists ──────────────────────────────────────────────
		Classes.registerMultiple([
			WindowType.ITEMLIST, WindowType.ITEMLIST_HORIZONTAL,
		], ItemListController as any);

		// ── Item grids ──────────────────────────────────────────────
		Classes.registerMultiple([
			WindowType.ITEMGRID, WindowType.ITEMGRID_VERTICAL,
			WindowType.ITEMGRID_HORIZONTAL,
		], ItemGridController as any);

		// ── Scrollable item lists ───────────────────────────────────
		Classes.registerMultiple([
			WindowType.SCROLLABLE_ITEMLIST, WindowType.SCROLLABLE_ITEMLIST_VERTICAL,
			WindowType.SCROLLABLE_ITEMLIST_HORIZONTAL,
		], ScrollableItemListWindow as any);

		// ── Buttons ─────────────────────────────────────────────────
		Classes.registerMultiple([
			WindowType.BUTTON, WindowType.BUTTON_THICK,
			WindowType.BUTTON_UP, WindowType.BUTTON_DOWN,
			WindowType.BUTTON_LEFT, WindowType.BUTTON_RIGHT,
		], ButtonController as any);
		Classes.register(WindowType.BUTTON_ICON, IconButtonController as any);
		Classes.register(WindowType.BUTTON_GROUP_LEFT, SelectableButtonController as any);
		Classes.register(WindowType.BUTTON_GROUP_CENTER, SelectableButtonController as any);
		Classes.register(WindowType.BUTTON_GROUP_RIGHT, SelectableButtonController as any);

		// ── Checkable / selectable buttons ──────────────────────────
		Classes.register(WindowType.CHECKBOX, CheckBoxController as any);
		Classes.register(WindowType.RADIOBUTTON, RadioButtonController as any);
		Classes.register(WindowType.CLOSEBUTTON, CloseButtonController as any);
		Classes.registerMultiple([
			WindowType.MINIMIZEBOX, WindowType.MAXIMIZEBOX, WindowType.RESTOREBOX,
		], CloseButtonController as any);

		// ── Drag bar ────────────────────────────────────────────────
		Classes.register(WindowType.DRAGBAR, ScrollBarLiftController as any);

		// ── Text input ──────────────────────────────────────────────
		Classes.register(WindowType.TEXTFIELD, TextFieldController as any);
		Classes.register(WindowType.PASSWORD, PasswordFieldController as any);

		// ── Tabs ────────────────────────────────────────────────────
		Classes.register(WindowType.TAB_CONTENT, ContainerController as any);
		Classes.register(WindowType.TAB_CONTEXT, TabContextController as any);
		Classes.register(WindowType.TAB_SELECTOR, SelectorListController as any);
		Classes.register(WindowType.TAB_BUTTON, TabButtonController as any);
		Classes.register(WindowType.TAB_CONTAINER_BUTTON, TabContainerButtonController as any);

		// ── Menus ───────────────────────────────────────────────────
		Classes.registerMultiple([
			WindowType.MENU, WindowType.SUBMENU,
		], ContainerController as any);
		Classes.register(WindowType.MENU_ITEM, InteractiveController as any);
		Classes.register(WindowType.DROPMENU, DropMenuController as any);
		Classes.register(WindowType.DROPMENU_ITEM, DropMenuItemController as any);
		Classes.register(WindowType.DROPLIST, DropListController as any);
		Classes.register(WindowType.DROPLIST_ITEM, DropListItemController as any);

		// ── Sliders / Scalers ───────────────────────────────────────
		Classes.registerMultiple([
			WindowType.SLIDER, WindowType.SLIDER_HORIZONTAL, WindowType.SLIDER_VERTICAL,
			WindowType.SCALER, WindowType.SCALER_VERTICAL, WindowType.SCALER_HORIZONTAL,
		], ScalerController as any);

		// ── Scrollbars ──────────────────────────────────────────────
		Classes.registerMultiple([
			WindowType.SCROLLBAR_HORIZONTAL, WindowType.SCROLLBAR_VERTICAL,
		], ScrollBarController as any);

		Classes.registerMultiple([
			WindowType.SCROLLBAR_SLIDER_BAR_HORIZONTAL, WindowType.SCROLLBAR_SLIDER_BAR_VERTICAL,
		], ScrollBarLiftController as any);

		Classes.registerMultiple([
			WindowType.SCROLLBAR_SLIDER_TRACK_HORIZONTAL, WindowType.SCROLLBAR_SLIDER_TRACK_VERTICAL,
		], InteractiveController as any);

		Classes.registerMultiple([
			WindowType.SCROLLBAR_SLIDER_BUTTON_RIGHT, WindowType.SCROLLBAR_SLIDER_BUTTON_DOWN,
			WindowType.SCROLLBAR_SLIDER_BUTTON_LEFT, WindowType.SCROLLBAR_SLIDER_BUTTON_UP,
		], ButtonController as any);

		// ── Scrollable item grid ────────────────────────────────────
		Classes.register(WindowType.SCROLLABLE_ITEMGRID_VERTICAL, ScrollableItemGridWindow as any);
	}

	/**
	 * Registers a controller constructor for a window type.
	 *
	 * @param type - The WindowType value
	 * @param ctor - The controller constructor
	 */
	public static register(type: number, ctor: new (...args: unknown[]) => unknown): void
	{
		if (!Classes._registry) Classes.init();

		Classes._registry!.set(type, ctor);
	}

	/**
	 * Registers a controller constructor for multiple window types.
	 *
	 * @param types - Array of WindowType values
	 * @param ctor - The controller constructor
	 */
	public static registerMultiple(types: number[], ctor: new (...args: unknown[]) => unknown): void
	{
		for (const type of types)
		{
			Classes.register(type, ctor);
		}
	}

	/**
	 * Returns the controller constructor for a given window type.
	 *
	 * @param type - The WindowType value
	 * @returns The constructor, or null if not registered
	 */
	public static getWindowClassByType(type: number): (new (...args: unknown[]) => unknown) | null
	{
		if (!Classes._registry) Classes.init();

		return Classes._registry!.get(type) ?? null;
	}

	/**
	 * Returns all registered type IDs.
	 */
	public static getRegisteredTypes(): number[]
	{
		if (!Classes._registry) return [];

		return [...Classes._registry.keys()];
	}
}

// Export WindowType values for convenience in registration
export {WindowType};
