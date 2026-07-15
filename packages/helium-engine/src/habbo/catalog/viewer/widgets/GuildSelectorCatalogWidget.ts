import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {ILabelWindow} from '@core/window/components/ILabelWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IDropListWindow} from '@core/window/components/IDropListWindow';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';
import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import {StringArrayStuffData} from '@habbo/room/object/data/StringArrayStuffData';
import type {HabboCatalog} from '../../HabboCatalog';
import type {GuildMembershipsController} from '../../guilds/GuildMembershipsController';
import type {GuildMembership} from '@habbo/communication/messages/incoming/users/GuildMembership';
import {CatalogWidget} from './CatalogWidget';
import {CatalogWidgetName} from './CatalogWidgetName';
import {CatalogWidgetEvent} from './events/CatalogWidgetEvent';
import {CatalogWidgetToggleEvent} from './events/CatalogWidgetToggleEvent';
import {CatalogWidgetGuildSelectedEvent} from './events/CatalogWidgetGuildSelectedEvent';
import {SetExtraPurchaseParameterEvent} from './events/SetExtraPurchaseParameterEvent';
import {SetRoomPreviewerStuffDataEvent} from './events/SetRoomPreviewerStuffDataEvent';

const log = Logger.getLogger('GuildSelectorCatalogWidget');

const CWE_EXTRA_PARAM_REQUIRED_FOR_BUY = 'CWE_EXTRA_PARAM_REQUIRED_FOR_BUY';

/**
 * Lets the user pick which of their groups to act on (buy a guild-related item for) via a
 * drop-list, and drives the room previewer + purchase-parameter plumbing to match the selection.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/GuildSelectorCatalogWidget.as
 */
export class GuildSelectorCatalogWidget extends CatalogWidget
{
    private static readonly GUILD_COLORS_BMP_BORDER_COLOR: number = 0;

    private static readonly GUILD_COLORS_BMP_BORDER_WIDTH: number = 1;

    private static readonly GUILD_COLORS_BMP_HEIGHT: number = 14;

    private static readonly GUILD_COLORS_BMP_WIDTH: number = 21;

    private _dropList: IDropListWindow | null = null;

    protected _controller: GuildMembershipsController | null;

    private _filteredMemberships: GuildMembership[] = [];

    private _selectorWindow: IWindow | null = null;

    private _membersOnlyInfo: IWindow | null = null;

    private _selectedIndex: number = -1;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/GuildSelectorCatalogWidget.as::GuildSelectorCatalogWidget()
    constructor(window: IWindowContainer, controller: GuildMembershipsController)
    {
        super(window);

        this._controller = controller;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/GuildSelectorCatalogWidget.as::dispose()
    override dispose(): void
    {
        if(this.disposed) return;

        this.events.off(CatalogWidgetEvent.WIDGETS_INITIALIZED, this.onWidgetsInitialized);
        this.page.dispatchWidgetEvent(new CatalogWidgetGuildSelectedEvent(CatalogWidgetGuildSelectedEvent.NO_GUILD_SELECTED, '', '', ''));

        if(this._dropList != null)
        {
            this._dropList.procedure = null;
            this._dropList = null;
        }

        this._selectorWindow = null;
        this._membersOnlyInfo = null;

        if(this._controller != null)
        {
            this._controller.unregisterGuildSelectorWidget(this);
            this._controller = null;
        }

        super.dispose();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/GuildSelectorCatalogWidget.as::init()
    override init(): boolean
    {
        if(!super.init()) return false;

        this.events.on(CatalogWidgetEvent.WIDGETS_INITIALIZED, this.onWidgetsInitialized);
        this.attachWidgetView(CatalogWidgetName.GUILD_SELECTOR);

        this._selectorWindow = this.window.findChildByName('guild_selector');
        this._membersOnlyInfo = this.window.findChildByName('members_only');

        const findGroupsButton = this.window.findChildByName('find_groups_button');

        if(findGroupsButton != null)
        {
            findGroupsButton.addEventListener(WindowMouseEvent.CLICK, this.onFindGroups);
        }

        this._dropList = this.window.findChildByName('guild_selector') as unknown as IDropListWindow | null;

        if(this._dropList != null)
        {
            this._dropList.procedure = this.dropMenuEventProc;
        }
        else
        {
            log.error("Missing 'guild_selector' itemlist_dropmenu component from page layout xml");
        }

        if(this._selectorWindow != null) this._selectorWindow.visible = false;
        if(this._membersOnlyInfo != null) this._membersOnlyInfo.visible = false;

        return true;
    }

    private onWidgetsInitialized = (_event: CatalogWidgetEvent): void =>
    {
        this._controller?.registerGuildSelectorWidget(this);
        this.events.emit(CWE_EXTRA_PARAM_REQUIRED_FOR_BUY, new CatalogWidgetEvent(CWE_EXTRA_PARAM_REQUIRED_FOR_BUY));
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/GuildSelectorCatalogWidget.as::populateAndSelectFavorite()
    populateAndSelectFavorite(memberships: GuildMembership[]): void
    {
        this._filteredMemberships = this.filterGroupMemberships(memberships);

        const hasAny = memberships.length > 0;

        this.events.emit(CatalogWidgetToggleEvent.CWE_TOGGLE, new CatalogWidgetToggleEvent('purchaseWidget', hasAny));

        if(this._selectorWindow != null) this._selectorWindow.visible = hasAny;
        if(this._membersOnlyInfo != null) this._membersOnlyInfo.visible = !hasAny;

        if(this._dropList == null) return;

        const existingCount = this._dropList.numMenuItems;

        for(let i = 0; i < existingCount; i++)
        {
            this._dropList.removeMenuItemAt(0);
        }

        let favouriteIndex = -1;

        for(let i = 0; i < this._filteredMemberships.length; i++)
        {
            const membership = this._filteredMemberships[i]!;

            this._dropList.addMenuItem(this.createDropmenuItemWindow(membership));

            if(membership.favourite) favouriteIndex = i;
        }

        if(this._selectedIndex === -1)
        {
            if(favouriteIndex !== -1)
            {
                this._dropList.selection = favouriteIndex;
            }
            else if(this._dropList.numMenuItems > 0)
            {
                this._dropList.selection = 0;
            }
        }
        else
        {
            this._dropList.selection = this._selectedIndex;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/GuildSelectorCatalogWidget.as::filterGroupMemberships()
    protected filterGroupMemberships(memberships: GuildMembership[]): GuildMembership[]
    {
        return memberships;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/GuildSelectorCatalogWidget.as::selectFirstOffer()
    selectFirstOffer(): void
    {
        if(this.page && this.page.offers && this.page.offers.length > 0)
        {
            this.page.selectOffer(this.page.offers[0]!.offerId);
        }
    }

    private dropMenuEventProc = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type === WindowEvent.WE_SELECTED && this._dropList != null)
        {
            this.selectFromDropList(this._dropList.selection);
            this._selectedIndex = this._dropList.selection;
        }
    };

    private selectFromDropList(index: number): void
    {
        if(index > -1)
        {
            const membership = this._filteredMemberships[index];

            if(membership != null) this.selectGroup(membership);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/GuildSelectorCatalogWidget.as::selectGroup()
    protected selectGroup(membership: GuildMembership): void
    {
        this.page.dispatchWidgetEvent(new CatalogWidgetGuildSelectedEvent(membership.groupId, membership.primaryColor, membership.secondaryColor, membership.badgeCode));
        this.page.dispatchWidgetEvent(new SetRoomPreviewerStuffDataEvent(this.getPreviewerStuffData(membership.groupId, membership.primaryColor, membership.secondaryColor, membership.badgeCode)));
        this.events.emit(SetExtraPurchaseParameterEvent.CWE_SET_EXTRA_PARM, new SetExtraPurchaseParameterEvent(membership.groupId.toString()));
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/GuildSelectorCatalogWidget.as::createGuildColorsBitmap()
    // AS3 builds an opaque-black BitmapData(21, 14, transparent=false, 0) then fills two side-by-side
    // rects, leaving a 1px border of the base opaque-black fill untouched (the unused
    // GUILD_COLORS_BMP_BORDER_COLOR/_WIDTH constants below document that border, but AS3 itself never
    // references them in a fillRect call - preserved as unused, matching AS3).
    private createGuildColorsBitmap(primaryColor: number, secondaryColor: number): ImageBitmap
    {
        const width = GuildSelectorCatalogWidget.GUILD_COLORS_BMP_WIDTH;
        const height = GuildSelectorCatalogWidget.GUILD_COLORS_BMP_HEIGHT;
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d')!;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        const rightHalfStart = Math.trunc(width / 2) + 1;

        ctx.fillStyle = GuildSelectorCatalogWidget.colorToCss(primaryColor);
        ctx.fillRect(1, 1, rightHalfStart - 1, height - 2);

        ctx.fillStyle = GuildSelectorCatalogWidget.colorToCss(secondaryColor);
        ctx.fillRect(rightHalfStart, 1, width - 1 - rightHalfStart, height - 2);

        return canvas.transferToImageBitmap();
    }

    private static colorToCss(color: number): string
    {
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;

        return `rgb(${r},${g},${b})`;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/GuildSelectorCatalogWidget.as::createDropmenuItemWindow()
    private createDropmenuItemWindow(membership: GuildMembership): IWindow
    {
        const bitmap = this.createGuildColorsBitmap(parseInt(membership.primaryColor, 16), parseInt(membership.secondaryColor, 16));
        const catalog = this.page.viewer.catalog as HabboCatalog;
        const view = catalog.utils.createWindow('guild_selector_widget_item')!;
        const container = view as unknown as IWindowContainer;
        const colors = container.findChildByName('guild_colors') as unknown as IBitmapWrapperWindow;
        const name = container.findChildByName('guild_name') as unknown as ILabelWindow;

        colors.bitmap = bitmap;
        name.caption = membership.groupName;

        return view;
    }

    private onFindGroups = (_event: WindowMouseEvent): void =>
    {
        const catalog = (this.page?.viewer?.catalog ?? null) as HabboCatalog | null;

        catalog?.navigator?.performGuildBaseSearch();
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/GuildSelectorCatalogWidget.as::getPreviewerStuffData()
    private getPreviewerStuffData(groupId: number, color1: string, color2: string, badgeCode: string): IStuffData
    {
        const stuffData = new StringArrayStuffData();

        stuffData.setArray(['0', groupId.toString(), badgeCode, color1, color2]);

        return stuffData;
    }
}
