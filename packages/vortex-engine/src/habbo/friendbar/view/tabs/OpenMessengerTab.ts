import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';
import {Tab} from './Tab';

const log = Logger.getLogger('habbo.friendbar.tabs.OpenMessengerTab');

/**
 * OpenMessengerTab
 *
 * The slot that opens the messenger. It has no friend behind it and never selects —
 * a click toggles the messenger and that is all — so it overrides only the pooling and
 * the hover colours.
 *
 * The primary tree obfuscates this class to `_SafeCls_3739` and no tree recovers it.
 * **The name `OpenMessengerTab` is derived**, from its layout (`new_open_messenger_tab_xml`)
 * and its single action (`DATA.toggleMessenger()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/view/tabs/_SafeCls_3739.as
 */
export class OpenMessengerTab extends Tab
{
    // AS3: .../view/tabs/_SafeCls_3739.as::ICON
    protected static readonly ICON: string = 'icon';

    // AS3: .../view/tabs/_SafeCls_3739.as::HEADER
    protected static readonly HEADER: string = 'header';

    /** **Name derived** from its value; obfuscated in every tree. */
    // AS3: .../view/tabs/_SafeCls_3739.as::TAB_RESOURCE
    private static readonly TAB_RESOURCE: string = 'new_open_messenger_tab_xml';

    // AS3: .../view/tabs/_SafeCls_3739.as::DEFAULT_COLOR
    private static readonly DEFAULT_COLOR: number = 0x7FC8DE;

    /** **Name derived**: the hovered counterpart of `DEFAULT_COLOR`. */
    private static readonly HOVER_COLOR: number = 0x91E1F9;

    /**
     * Declared and unused in AS3 as well — the messenger slot never offsets itself.
     */
    // AS3: .../view/tabs/_SafeCls_3739.as::FRIENDS_Y_PADDING
    private static readonly FRIENDS_Y_PADDING: number = 10;

    /** **Name derived**; obfuscated in every tree. */
    // AS3: .../view/tabs/_SafeCls_3739.as::_TAB_POOL
    private static readonly TAB_POOL: OpenMessengerTab[] = [];

    /** **Name derived**; obfuscated in every tree. */
    // AS3: .../view/tabs/_SafeCls_3739.as::_WINDOW_POOL
    private static readonly WINDOW_POOL: IWindowContainer[] = [];

    // AS3: .../view/tabs/_SafeCls_3739.as::allocate()
    static allocate(): OpenMessengerTab
    {
        const tab = OpenMessengerTab.TAB_POOL.length > 0 ? OpenMessengerTab.TAB_POOL.pop()! : new OpenMessengerTab();

        tab._recycled = false;
        tab._window = tab.allocateEntityWindow();

        return tab;
    }

    /**
     * Note the asymmetry, verbatim from AS3: the click listener is added as
     * `onButtonClick` but removed as `onMouseClick` in `releaseEntityWindow()`, so a
     * pooled window keeps its click handler across a recycle.
     */
    // AS3: .../view/tabs/_SafeCls_3739.as::allocateEntityWindow()
    allocateEntityWindow(): IWindowContainer | null
    {
        const window = OpenMessengerTab.WINDOW_POOL.length > 0
            ? OpenMessengerTab.WINDOW_POOL.pop()!
            : Tab.windowing?.buildWidgetLayout(OpenMessengerTab.TAB_RESOURCE) as IWindowContainer | null;

        if(window === null || window === undefined)
        {
            log.error(`allocateEntityWindow: layout "${OpenMessengerTab.TAB_RESOURCE}" is not registered`);

            return null;
        }

        window.addEventListener('WME_CLICK', this.onButtonClick);
        window.addEventListener('WME_OVER', this.onMouseOverEvent);
        window.addEventListener('WME_OUT', this.onMouseOutEvent);
        window.height = Tab.height;

        return window;
    }

    // AS3: .../view/tabs/_SafeCls_3739.as::releaseEntityWindow()
    private releaseEntityWindow(window: IWindowContainer): void
    {
        if(window.disposed)
        {
            return;
        }

        window.procedure = null;
        window.removeEventListener('WME_CLICK', this.onMouseClickEvent);
        window.removeEventListener('WME_OVER', this.onMouseOverEvent);
        window.removeEventListener('WME_OUT', this.onMouseOutEvent);
        window.width = Tab.width;
        window.height = Tab.height;

        if(OpenMessengerTab.WINDOW_POOL.indexOf(window) === -1)
        {
            OpenMessengerTab.WINDOW_POOL.push(window);
        }
    }

    // AS3: .../view/tabs/_SafeCls_3739.as::recycle()
    override recycle(): void
    {
        if(this.disposed || this._recycled)
        {
            return;
        }

        if(this._window !== null)
        {
            this.releaseEntityWindow(this._window);
            this._window = null;
        }

        this._recycled = true;
        OpenMessengerTab.TAB_POOL.push(this);
    }

    // AS3: .../view/tabs/_SafeCls_3739.as::expose()
    protected override expose(): void
    {
        super.expose();

        this.applyHoverStyle();
    }

    // AS3: .../view/tabs/_SafeCls_3739.as::conceal()
    protected override conceal(): void
    {
        super.conceal();

        this.applyHoverStyle();
    }

    private applyHoverStyle(): void
    {
        if(this._window !== null)
        {
            this._window.color = this.exposed ? OpenMessengerTab.HOVER_COLOR : OpenMessengerTab.DEFAULT_COLOR;
        }
    }

    // AS3: .../view/tabs/_SafeCls_3739.as::onButtonClick()
    private onButtonClick = (_event: WindowEvent): void =>
    {
        if(this.disposed || this.recycled)
        {
            return;
        }

        Tab.data?.toggleMessenger();
    };

    private onMouseClickEvent = (event: WindowEvent): void =>
    {
        this.onMouseClick(event as WindowMouseEvent);
    };

    private onMouseOverEvent = (event: WindowEvent): void =>
    {
        this.onMouseOver(event as WindowMouseEvent);
    };

    private onMouseOutEvent = (event: WindowEvent): void =>
    {
        this.onMouseOut(event as WindowMouseEvent);
    };
}
