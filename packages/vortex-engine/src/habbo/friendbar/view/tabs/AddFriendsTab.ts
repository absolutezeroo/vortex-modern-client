import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';
import {Tab} from './Tab';

const log = Logger.getLogger('habbo.friendbar.tabs.AddFriendsTab');

/**
 * AddFriendsTab
 *
 * The "find new friends" slot at the end of the bar. Opening it reveals its blurb and
 * a button that asks the server to match the player with somebody.
 *
 * Its open height is read once, from the layout, before the slot is first collapsed —
 * hence the static: every instance shares the height the XML declared.
 *
 * The primary tree obfuscates this class to `_SafeCls_3052` and no tree recovers it.
 * **The name `AddFriendsTab` is derived**, from its layout (`add_friends_tab_xml`) and
 * its action (`DATA.findNewFriends()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/view/tabs/_SafeCls_3052.as
 */
export class AddFriendsTab extends Tab
{
    // AS3: .../view/tabs/_SafeCls_3052.as::ICON
    protected static readonly ICON: string = 'icon';

    /** **Name derived** from its value. */
    // AS3: .../view/tabs/_SafeCls_3052.as::TEXT
    protected static readonly TEXT: string = 'text';

    // AS3: .../view/tabs/_SafeCls_3052.as::HEADER
    protected static readonly HEADER: string = 'header';

    // AS3: .../view/tabs/_SafeCls_3052.as::LABEL
    protected static readonly LABEL: string = 'label';

    /** **Name derived** from its value. */
    // AS3: .../view/tabs/_SafeCls_3052.as::BUTTON
    protected static readonly BUTTON: string = 'button';

    /** **Name derived** from its value; obfuscated in every tree. */
    // AS3: .../view/tabs/_SafeCls_3052.as::TAB_RESOURCE
    private static readonly TAB_RESOURCE: string = 'add_friends_tab_xml';

    // AS3: .../view/tabs/_SafeCls_3052.as::ICON_RESOURCE
    private static readonly ICON_RESOURCE: string = 'add_friends_icon';

    // AS3: .../view/tabs/_SafeCls_3052.as::DEFAULT_COLOR
    private static readonly DEFAULT_COLOR: number = 0x7FC8DE;

    /** **Name derived**: the hovered counterpart of `DEFAULT_COLOR`. */
    private static readonly HOVER_COLOR: number = 0x91E1F9;

    /**
     * The layout's own height, captured the first time a window is built and reused as
     * the opened height from then on. **Name derived**; obfuscated in every tree.
     */
    // AS3: .../view/tabs/_SafeCls_3052.as::_expandedHeight
    private static _expandedHeight: number = -1;

    /** **Name derived**; obfuscated in every tree. */
    // AS3: .../view/tabs/_SafeCls_3052.as::_TAB_POOL
    private static readonly TAB_POOL: AddFriendsTab[] = [];

    /** **Name derived**; obfuscated in every tree. */
    // AS3: .../view/tabs/_SafeCls_3052.as::_WINDOW_POOL
    private static readonly WINDOW_POOL: IWindowContainer[] = [];

    // AS3: .../view/tabs/_SafeCls_3052.as::allocate()
    static allocate(): AddFriendsTab
    {
        const tab = AddFriendsTab.TAB_POOL.length > 0 ? AddFriendsTab.TAB_POOL.pop()! : new AddFriendsTab();

        tab._recycled = false;
        tab._window = tab.allocateEntityWindow();

        return tab;
    }

    // AS3: .../view/tabs/_SafeCls_3052.as::allocateEntityWindow()
    allocateEntityWindow(): IWindowContainer | null
    {
        const window = AddFriendsTab.WINDOW_POOL.length > 0
            ? AddFriendsTab.WINDOW_POOL.pop()!
            : Tab.windowing?.buildWidgetLayout(AddFriendsTab.TAB_RESOURCE) as IWindowContainer | null;

        if(window === null || window === undefined)
        {
            log.error(`allocateEntityWindow: layout "${AddFriendsTab.TAB_RESOURCE}" is not registered`);

            return null;
        }

        window.addEventListener('WME_CLICK', this.onMouseClickEvent);
        window.addEventListener('WME_OVER', this.onMouseOverEvent);
        window.addEventListener('WME_OUT', this.onMouseOutEvent);

        const header = window.findChildByName(AddFriendsTab.HEADER);

        if(header !== null)
        {
            header.addEventListener('WME_CLICK', this.onMouseClickEvent);
            header.addEventListener('WME_OVER', this.onMouseOverEvent);
            header.addEventListener('WME_OUT', this.onMouseOutEvent);
        }

        if(AddFriendsTab._expandedHeight < 0)
        {
            AddFriendsTab._expandedHeight = window.height;
        }

        window.height = Tab.height;

        const icon = window.findChildByName(AddFriendsTab.ICON) as IBitmapWrapperWindow | null;

        if(icon !== null)
        {
            // The icon comes from the shared library, so the window must not dispose it.
            icon.disposesBitmap = false;
            icon.bitmap = (Tab.assets?.getAssetByName(AddFriendsTab.ICON_RESOURCE)?.content as ImageBitmap | null) ?? null;

            // AS3 guards this lookup and says nothing when it misses, so a missing icon
            // renders an empty tile in silence. `find_friends_icon` is declared in
            // HabboFriendBarCom.as but was never extracted into the images bundle, which
            // is exactly that case — worth a line rather than a mystery.
            if(icon.bitmap === null)
            {
                log.warn(`allocateEntityWindow: no bitmap asset named "${AddFriendsTab.ICON_RESOURCE}" - the tile renders without its icon`);
            }
        }

        window.findChildByName(AddFriendsTab.BUTTON)?.addEventListener('WME_CLICK', this.onButtonClick);

        const text = window.findChildByName(AddFriendsTab.TEXT);

        if(text !== null)
        {
            text.visible = false;
        }

        return window;
    }

    // AS3: .../view/tabs/_SafeCls_3052.as::releaseEntityWindow()
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

        const header = window.findChildByName(AddFriendsTab.HEADER);

        if(header !== null)
        {
            header.removeEventListener('WME_CLICK', this.onMouseClickEvent);
            header.removeEventListener('WME_OVER', this.onMouseOverEvent);
            header.removeEventListener('WME_OUT', this.onMouseOutEvent);
        }

        window.findChildByName(AddFriendsTab.BUTTON)?.removeEventListener('WME_CLICK', this.onButtonClick);

        const text = window.findChildByName(AddFriendsTab.TEXT);

        if(text !== null)
        {
            text.visible = false;
        }

        window.width = Tab.width;
        window.height = Tab.height;

        if(AddFriendsTab.WINDOW_POOL.indexOf(window) === -1)
        {
            AddFriendsTab.WINDOW_POOL.push(window);
        }
    }

    // AS3: .../view/tabs/_SafeCls_3052.as::select()
    override select(animate: boolean): void
    {
        if(this.selected || this._window === null)
        {
            return;
        }

        // AS3 guards the animated path with `param1 && false` — unreachable, so the slot
        // always snaps open. Kept verbatim.
        this._window.height = AddFriendsTab._expandedHeight;
        this._window.y = Tab.height - this._window.height;

        const text = this._window.findChildByName(AddFriendsTab.TEXT);

        if(text !== null)
        {
            text.visible = true;
        }

        super.select(animate);
    }

    // AS3: .../view/tabs/_SafeCls_3052.as::deselect()
    override deselect(animate: boolean): void
    {
        if(!this.selected || this._window === null)
        {
            return;
        }

        const text = this._window.findChildByName(AddFriendsTab.TEXT);

        if(text !== null)
        {
            text.visible = false;
        }

        this._window.height = Tab.height;
        this._window.y = 0;

        super.deselect(animate);
    }

    // AS3: .../view/tabs/_SafeCls_3052.as::recycle()
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
        AddFriendsTab.TAB_POOL.push(this);
    }

    // AS3: .../view/tabs/_SafeCls_3052.as::expose()
    protected override expose(): void
    {
        super.expose();

        this.applyHoverStyle();
    }

    // AS3: .../view/tabs/_SafeCls_3052.as::conceal()
    protected override conceal(): void
    {
        super.conceal();

        this.applyHoverStyle();
    }

    private applyHoverStyle(): void
    {
        if(this._window === null)
        {
            return;
        }

        const label = this._window.findChildByTag(AddFriendsTab.LABEL) as ITextWindow | null;

        if(label !== null)
        {
            label.underline = this.exposed;
        }

        this._window.color = this.exposed ? AddFriendsTab.HOVER_COLOR : AddFriendsTab.DEFAULT_COLOR;
    }

    // AS3: .../view/tabs/_SafeCls_3052.as::onButtonClick()
    private onButtonClick = (_event: WindowEvent): void =>
    {
        if(this.disposed || this.recycled)
        {
            return;
        }

        Tab.data?.findNewFriends();
        this.deselect(true);
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
