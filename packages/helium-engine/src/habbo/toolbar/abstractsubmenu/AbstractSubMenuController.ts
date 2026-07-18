import type {IDisposable} from '@core/runtime';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {HabboToolbar} from '../HabboToolbar';
import type {BottomBarLeft} from '../BottomBarLeft';
import {HabboToolbarEvent} from '../events/HabboToolbarEvent';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('AbstractSubMenuController');

/**
 * Shared base for the bottom bar's popup sub-menus (me-menu, progression menu, ...).
 *
 * Builds a popup window from a layout, wires a single root-level hover/click
 * procedure (bubbles from any un-procedure'd child region — see
 * WindowController.procedure), and toggles itself open/closed in response to its
 * own toolbar icon being clicked (closes on any other toolbar click).
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/abstractsubmenu/AbstractSubMenuController.as
 */
export class AbstractSubMenuController implements IDisposable
{
    private static readonly HOVER_TEXT_COLOR: number = 2215924;
    private static readonly OUT_TEXT_COLOR: number = 16777215;
    private static readonly UNSEEN_COUNTER_MARGIN: number = 5;

    private _toolbar: HabboToolbar | null;
    private _toolbarView: BottomBarLeft | null;
    private _window: IFrameWindow | null = null;
    private _unseenItemCounters: Map<string, IWindowContainer> = new Map();
    private readonly _iconId: string;
    // Bound once so the same reference can be used for both `.on()` and `.off()` while
    // still dispatching through the prototype chain (so subclass overrides fire).
    private readonly _onToolbarClickBound = this.onToolbarClick.bind(this);

    // AS3: AbstractSubMenuController.as::AbstractSubMenuController()
    constructor(toolbar: HabboToolbar, toolbarView: BottomBarLeft, layoutName: string, iconId: string)
    {
        this._toolbar = toolbar;
        this._toolbarView = toolbarView;
        this._iconId = iconId;

        this._toolbar.toolbarEvents.on(HabboToolbarEvent.TOOLBAR_CLICK, this._onToolbarClickBound);

        this._window = toolbar.windowManager?.buildWidgetLayout(layoutName, 2) as IFrameWindow | null;

        if(this._window === null)
        {
            log.warn(`Sub-menu layout could not be built: ${layoutName}`);
            return;
        }

        this._window.visible = false;
        this._window.procedure = this.windowProcedure.bind(this);
    }

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    protected get toolbar(): HabboToolbar | null
    {
        return this._toolbar;
    }

    protected get toolbarView(): BottomBarLeft | null
    {
        return this._toolbarView;
    }

    protected get window(): IFrameWindow | null
    {
        return this._window;
    }

    protected get unseenItemCounters(): Map<string, IWindowContainer>
    {
        return this._unseenItemCounters;
    }

    /**
	 * Hook for subclasses: called when a named region is clicked (region.name).
	 */
    // AS3: AbstractSubMenuController.as::onSubMenuItemClick()
    protected onSubMenuItemClick(_itemName: string): void
    {
        // Overridden by subclasses
    }

    // AS3: AbstractSubMenuController.as::windowProcedure()
    private windowProcedure(event: WindowEvent, window: IWindow): void
    {
        const container = window as unknown as IWindowContainer;
        const colorIcon = container.findChildByName(`${window.name}_icon_color`) as IStaticBitmapWrapperWindow | null;
        const greyIcon = container.findChildByName(`${window.name}_icon_grey`) as IStaticBitmapWrapperWindow | null;
        const fieldText = container.findChildByName('field_text') as ITextWindow | null;

        switch(event.type)
        {
            case WindowMouseEvent.OVER:
                if(colorIcon !== null && greyIcon !== null)
                {
                    colorIcon.visible = true;
                    greyIcon.visible = false;

                    if(fieldText !== null)
                    {
                        fieldText.textColor = AbstractSubMenuController.HOVER_TEXT_COLOR;
                    }
                }
                break;
            case WindowMouseEvent.OUT:
                if(colorIcon !== null && greyIcon !== null)
                {
                    colorIcon.visible = false;
                    greyIcon.visible = true;

                    if(fieldText !== null)
                    {
                        fieldText.textColor = AbstractSubMenuController.OUT_TEXT_COLOR;
                    }
                }
                break;
            case WindowMouseEvent.CLICK:
                if(this._window !== null) this._window.visible = false;

                if(this._toolbar !== null)
                {
                    this.onSubMenuItemClick(window.name);
                }
                break;
        }
    }

    // AS3: AbstractSubMenuController.as::onToolbarClick()
    // A normal (overridable) method, not an arrow field: MeMenuNewController.as overrides
    // this with a super.onToolbarClick() call, which needs prototype-chain dispatch.
    // See the constructor for the bound reference actually registered with toolbarEvents.
    protected onToolbarClick(event: HabboToolbarEvent): void
    {
        if(event.iconId === this._iconId)
        {
            this.toggleVisibility();
        }
        else if(this._window !== null)
        {
            this._window.visible = false;
        }
    }

    /**
	 * Toggle this sub-menu open/closed.
	 */
    // AS3: AbstractSubMenuController.as::toggleVisibility()
    toggleVisibility(): void
    {
        if(this._window === null) return;

        this._window.visible = !this._window.visible;
        this.reposition();
    }

    /**
	 * Reposition against the bottom bar's own window.
	 */
    // AS3: AbstractSubMenuController.as::reposition()
    reposition(): void
    {
        if(this._window === null || this._toolbarView === null) return;

        const toolbarWindow = this._toolbarView.window;

        if(toolbarWindow === null) return;

        this._window.x = 3;
        this._window.y = toolbarWindow.top - this._window.height;
    }

    /**
	 * Screen-space center point of a named icon region, or null if not found.
	 */
    // AS3: AbstractSubMenuController.as::getIconPosition()
    getIconPosition(name: string): {x: number, y: number, width: number, height: number} | null
    {
        if(this._window === null) return null;

        const child = this._window.findChildByName(name);

        if(child === null) return null;

        this._window.visible = true;

        return {
            x: child.rectangle.x + this._window.x + child.width / 2,
            y: child.rectangle.y + this._window.y + child.height / 2,
            width: child.rectangle.width,
            height: child.rectangle.height,
        };
    }

    // AS3: AbstractSubMenuController.as::getIcon()
    getIcon(name: string): IWindow | null
    {
        if(this._window === null) return null;

        const child = this._window.findChildByName(name);

        if(child !== null)
        {
            this._window.visible = true;
        }

        return child;
    }

    // AS3: AbstractSubMenuController.as::getUnseenItemCounter()
    getUnseenItemCounter(name: string): IWindowContainer | null
    {
        if(!name)
        {
            log.warn(`[Toolbar] Unknown icon type for unseen item counter for iconId: ${name}`);
        }

        let counter = this._unseenItemCounters.get(name) ?? null;

        if(counter === null && this._window !== null && this._toolbar !== null)
        {
            const created = this._toolbar.windowManager?.createUnseenItemCounter() ?? null;
            const host = this._window.findChildByName(name) as IWindowContainer | null;

            if(created !== null && host !== null)
            {
                host.addChild(created);
                created.x = host.width - created.width - AbstractSubMenuController.UNSEEN_COUNTER_MARGIN;
                created.y = AbstractSubMenuController.UNSEEN_COUNTER_MARGIN;
                this._unseenItemCounters.set(name, created);
                counter = created;
            }
        }

        return counter;
    }

    // AS3: AbstractSubMenuController.as::setUnseenItemCount()
    setUnseenItemCount(name: string, count: number): void
    {
        const counter = this.getUnseenItemCounter(name);

        if(counter === null) return;

        const countText = counter.findChildByName('count');

        if(count < 0)
        {
            counter.visible = true;
            if(countText !== null) countText.caption = ' ';
        }
        else if(count > 0)
        {
            counter.visible = true;
            if(countText !== null) countText.caption = count.toString();
        }
        else
        {
            counter.visible = false;
        }
    }

    // AS3: AbstractSubMenuController.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._toolbar?.toolbarEvents.off(HabboToolbarEvent.TOOLBAR_CLICK, this._onToolbarClickBound);

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        this._unseenItemCounters.clear();
        this._toolbarView = null;
        this._toolbar = null;
        this._disposed = true;
    }
}
