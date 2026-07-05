import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowParam} from '@core/window/enum/WindowParam';
import {WindowType} from '@core/window/enum/WindowType';
import type {FlatCategory} from '../../communication/messages/incoming/navigator/FlatCategory';
import {CreateFlatMessageComposer} from '../../communication/messages/outgoing/navigator/CreateFlatMessageComposer';
import type {IHabboTransitionalNavigator} from '../IHabboTransitionalNavigator';
import {TextFieldManager} from '../TextFieldManager';
import {Util} from '../Util';

/**
 * Room layout definition.
 */
interface RoomLayout
{
    requiredClubLevel: number;
    tileSize: number;
    name: string;
    view: IWindowContainer | null;
}

/**
 * Room creation view controller.
 *
 * Handles room creation UI: layout selection, name/description input,
 * category/visitors/trade dropdowns, and creation limits.
 *
 * @see sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as
 */
// AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::RoomCreateViewCtrl
export class RoomCreateViewCtrl
{
    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::ROOM_LIMIT_HC
    private static readonly ROOM_LIMIT_HC: number = 75;
    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::ROOM_LIMIT_NON_SUBSCRIBER
    private static readonly ROOM_LIMIT_NON_SUBSCRIBER: number = 50;

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::_navigator
    private _navigator: IHabboTransitionalNavigator | null;
    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::_content
    private _content: IWindowContainer | null = null;
    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::_layouts
    private _layouts: RoomLayout[] = [];
    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::_selectedLayout
    private _selectedLayout: RoomLayout | null = null;
    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::_roomNameManager
    private _roomNameManager: TextFieldManager | null = null;
    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::_roomDescManager
    private _roomDescManager: TextFieldManager | null = null;
    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::_categories
    private _categories: FlatCategory[] = [];
    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::_layoutItemList
    private _layoutItemList: IItemListWindow | null = null;
    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::_categoryDropMenu
    private _categoryDropMenu: IDropMenuWindow | null = null;
    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::_maxVisitorsDropMenu
    private _maxVisitorsDropMenu: IDropMenuWindow | null = null;
    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::_tradeModeDropMenu
    private _tradeModeDropMenu: IDropMenuWindow | null = null;

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::RoomCreateViewCtrl()
    constructor(navigator: IHabboTransitionalNavigator)
    {
        this._navigator = navigator;
        this.initLayouts();
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::show()
    show(): void
    {
        this.prepare();

        if (!this._content) return;

        this._content.visible = true;
        this.refresh();
        this._content.activate();
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::hide()
    hide(): void
    {
        if (this._content)
        {
            this._content.visible = false;
        }
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::refresh()
    refresh(): void
    {
        this._roomNameManager?.goBackToInitialState();
        if (this._roomNameManager?.input) this._roomNameManager.input.textBackgroundColor = 0xFFFFFFFF;
        this._roomDescManager?.goBackToInitialState();
        if (this._roomDescManager?.input) this._roomDescManager.input.textBackgroundColor = 0xFFFFFFFF;

        if (this._categoryDropMenu && this._categoryDropMenu.numMenuItems > 0)
        {
            this._categoryDropMenu.selection = 0;
        }

        if (this._tradeModeDropMenu && this._tradeModeDropMenu.numMenuItems > 0)
        {
            this._tradeModeDropMenu.selection = 0;
        }

        this._selectedLayout = this._layouts[0] ?? null;
        this.refreshRoomThumbnails();
        this.refreshMaxVisitors(
            this._navigator?.sessionData?.hasVip
                ? RoomCreateViewCtrl.ROOM_LIMIT_HC
                : RoomCreateViewCtrl.ROOM_LIMIT_NON_SUBSCRIBER
        );
        this.refreshSelection();
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::prepare()
    private prepare(): void
    {
        if (!this._navigator || this._content) return;

        const window = this._navigator.getXmlWindow('roc_create_room') as IWindowContainer | null;

        if (!window) return;

        this._content = window;
        this._layoutItemList = this._content.findChildByName('layout_item_list') as IItemListWindow | null;

        this.refreshRoomThumbnails();
        this.prepareTextFields();
        this.prepareCategorySelection();
        this.prepareTradeModeSelection();
        this.refreshMaxVisitors(RoomCreateViewCtrl.ROOM_LIMIT_NON_SUBSCRIBER);
        this.prepareButtons();
        this.centerContent();
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::prepareTextFields()
    private prepareTextFields(): void
    {
        if (!this._navigator || !this._content) return;

        const roomNameInput = this._content.findChildByName('room_name_input') as ITextFieldWindow | null;
        const roomDescInput = this._content.findChildByName('room_desc_input') as ITextFieldWindow | null;

        if (roomNameInput)
        {
            this._roomNameManager = new TextFieldManager(
                this._navigator,
                roomNameInput,
                25,
                null,
                this._navigator.getText('navigator.createroom.roomnameinfo')
            );
        }

        if (roomDescInput)
        {
            this._roomDescManager = new TextFieldManager(
                this._navigator,
                roomDescInput,
                128,
                null,
                this._navigator.getText('navigator.createroom.roomdescinfo')
            );
        }
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::prepareButtons()
    private prepareButtons(): void
    {
        if (!this._content) return;

        RoomCreateViewCtrl.addClickHandler(this._content.findChildByName('create_button'), this.onCreateButtonClick);
        RoomCreateViewCtrl.addClickHandler(this._content.findChildByName('back_button'), this.onCancelButtonClick);
        RoomCreateViewCtrl.addClickHandler(this._content.findChildByTag('close'), this.onCancelButtonClick);
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::prepareCategorySelection()
    private prepareCategorySelection(): void
    {
        if (!this._navigator || !this._content) return;

        this._categoryDropMenu = this._content.findChildByName('categories_list') as IDropMenuWindow | null;
        this._categories = [];

        const items: string[] = [];
        const hasStaffSecurity = this._navigator.sessionData?.hasSecurity(7) ?? false;

        for (const category of this._navigator.data.visibleCategories)
        {
            if (category.automatic) continue;
            if (category.staffOnly && !hasStaffSecurity) continue;

            this._categories.push(category);
            items.push(this.resolveLocalization(category.visibleName));
        }

        if (this._categoryDropMenu)
        {
            this._categoryDropMenu.populate(items);

            if (this._categoryDropMenu.numMenuItems > 0)
            {
                this._categoryDropMenu.selection = 0;
            }
        }
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::prepareTradeModeSelection()
    private prepareTradeModeSelection(): void
    {
        if (!this._navigator || !this._content) return;

        this._tradeModeDropMenu = this._content.findChildByName('trade_settings_list') as IDropMenuWindow | null;

        if (!this._tradeModeDropMenu) return;

        this._tradeModeDropMenu.populate([
            this._navigator.getText('navigator.roomsettings.trade_not_allowed'),
            this._navigator.getText('navigator.roomsettings.trade_not_with_Controller'),
            this._navigator.getText('navigator.roomsettings.trade_allowed')
        ]);
        this._tradeModeDropMenu.selection = 0;
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::refreshMaxVisitors()
    private refreshMaxVisitors(maxVisitors: number): void
    {
        if (!this._content) return;

        this._maxVisitorsDropMenu = this._content.findChildByName('visitors_list') as IDropMenuWindow | null;

        if (!this._maxVisitorsDropMenu) return;

        const items: string[] = [];

        for (let value = 10; value <= maxVisitors; value += 5)
        {
            items.push(String(value));
        }

        this._maxVisitorsDropMenu.populate(items);
        this._maxVisitorsDropMenu.selection = items.length > 0 ? 0 : -1;
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::refreshRoomThumbnails()
    private refreshRoomThumbnails(): void
    {
        if (!this._navigator || !this._layoutItemList) return;

        this._layoutItemList.destroyListItems();

        for (const layout of this._layouts)
        {
            layout.view = null;
        }

        let row: IWindowContainer | null = null;
        let col = 0;

        for (const layout of this._layouts)
        {
            if (!this.isAllowed(layout, false)) continue;

            if (col === 0)
            {
                row = this.getRow();
                this._layoutItemList.addListItem(row);
            }

            if (row)
            {
                this.addThumbnail(row, layout, col === 0);
            }

            col = (col + 1) % 2;
        }

        this.addVipPromo();
        this._layoutItemList.arrangeListItems();
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::refreshRoomThumbnails()
    private addVipPromo(): void
    {
        if (!this._navigator || !this._layoutItemList) return;

        const clubLevel = this._navigator.sessionData?.clubLevel ?? 0;

        if (clubLevel >= 2 || this._navigator.getBoolean('habbo_club_buy_disabled')) return;

        const promo = this._navigator.getXmlWindow('roc_vip_promo') as IWindowContainer | null;

        if (!promo) return;

        RoomCreateViewCtrl.addClickHandler(promo.findChildByName('link'), this.onHcMoreClick);
        this._layoutItemList.addListItem(promo);
    }
    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::getRow()
    private getRow(): IWindowContainer
    {
        const row = this._navigator?.windowManager?.createWindow(
            '',
            '',
            WindowType.CONTAINER,
            0,
            WindowParam.USE_PARENT_GRAPHIC_CONTEXT,
            {x: 0, y: 0, width: 100, height: 300}
        ) as IWindowContainer | null;

        if (!row)
        {
            throw new Error('Unable to create room layout row');
        }

        return row;
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::addThumbnail()
    private addThumbnail(row: IWindowContainer, layout: RoomLayout, leftColumn: boolean): void
    {
        if (!this._navigator) return;

        const thumbnail = this._navigator.getXmlWindow('roc_room_thumbnail') as IWindowContainer | null;

        if (!thumbnail) return;

        thumbnail.tags.push(layout.name);
        thumbnail.x = leftColumn ? 0 : thumbnail.width;
        thumbnail.y = 0;
        RoomCreateViewCtrl.addClickHandler(thumbnail, this.onContPicClick);

        const bgPic = thumbnail.findChildByName('bg_pic') as IStaticBitmapWrapperWindow | null;

        if (bgPic)
        {
            bgPic.assetUri = '${image.library.url}newroom/model_' + layout.name + '.png';
        }

        const tileSizeText = thumbnail.findChildByName('tile_size_txt') as ITextWindow | null;

        if (tileSizeText)
        {
            tileSizeText.text = layout.tileSize + ' ' + this._navigator.getText('navigator.createroom.tilesize');
        }

        const clubIcon = thumbnail.findChildByName('club_icon');

        if (clubIcon)
        {
            clubIcon.visible = layout.requiredClubLevel > 0;
        }

        row.addChild(thumbnail);
        row.width = 2 * thumbnail.width;
        row.height = thumbnail.height;
        layout.view = thumbnail;
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::refreshSelection()
    private refreshSelection(): void
    {
        for (const layout of this._layouts)
        {
            const view = layout.view;

            if (!view) continue;

            const selected = layout === this._selectedLayout;
            this.setChildVisible(view, 'bg_sel', selected);
            this.setChildVisible(view, 'bg_unsel', !selected);
            this.setChildVisible(view, 'select_arrow', selected);
            this.setChildVisible(view, 'tile_icon_white', selected);
            this.setChildVisible(view, 'tile_icon_black', !selected);

            const tileSizeText = view.findChildByName('tile_size_txt') as ITextWindow | null;

            if (tileSizeText)
            {
                tileSizeText.textColor = selected ? 0xFFFFFFFF : 0xFF000000;
                tileSizeText.color = selected ? 0xFF6E8184 : 0xFFCBCBCB;
            }
        }
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::setChildVisible()
    private setChildVisible(container: IWindowContainer, childName: string, visible: boolean): void
    {
        const child = container.findChildByName(childName);

        if (child)
        {
            child.visible = visible;
        }
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::onContPicClick()
    private onContPicClick = (event: WindowEvent): void =>
    {
        const target = event.window as IWindowContainer | null;

        if (!target) return;

        this.onChooseLayout(target);
    };

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::onChooseLayout()
    private onChooseLayout(view: IWindowContainer): void
    {
        const layout = this.findLayout(view.tags);

        if (!layout) return;

        if (!this.isAllowed(layout, true))
        {
            this._navigator?.openCatalogClubPage('RoomCreateViewCtrl');
            return;
        }

        this._selectedLayout = layout;
        this.refreshSelection();
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::findLayout()
    private findLayout(tags: string[]): RoomLayout | null
    {
        for (const tag of tags)
        {
            const layout = this.getLayout(tag);

            if (layout) return layout;
        }

        return this._layouts[0] ?? null;
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::getLayout()
    private getLayout(name: string): RoomLayout | null
    {
        for (const layout of this._layouts)
        {
            if (layout.name === name) return layout;
        }

        return null;
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::isAllowed()
    private isAllowed(layout: RoomLayout, requireMembership: boolean): boolean
    {
        if (layout.requiredClubLevel === 0) return true;
        if (!requireMembership) return true;

        const sessionData = this._navigator?.sessionData;

        if (layout.requiredClubLevel === 1) return sessionData?.hasClub ?? false;
        if (layout.requiredClubLevel === 2) return sessionData?.hasVip ?? false;

        return sessionData?.hasSecurity(4) ?? false;
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::isMandatoryFieldsFilled()
    private isMandatoryFieldsFilled(): boolean
    {
        if (!this._roomNameManager) return false;

        return this._roomNameManager.checkMandatory(
            this._navigator?.getText('navigator.createroom.nameerr') ?? 'Name required'
        );
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::onCreateButtonClick()
    private onCreateButtonClick = (_event: WindowEvent): void =>
    {
        if (!this._navigator || !this._selectedLayout) return;
        if (!this.isMandatoryFieldsFilled()) return;

        const name = this._roomNameManager?.getText() ?? '';
        const desc = this._roomDescManager?.getText() ?? '';
        const selectedCategory = this._categories[this._categoryDropMenu?.selection ?? 0];
        const categoryId = selectedCategory?.nodeId ?? 0;
        const visitors = this.resolveSelectedVisitorLimit();
        const tradeMode = Math.max(0, this._tradeModeDropMenu?.selection ?? 0);

        this._navigator.send(new CreateFlatMessageComposer(
            name,
            desc,
            'model_' + this._selectedLayout.name,
            categoryId,
            visitors,
            tradeMode
        ));
    };

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::resolveSelectedVisitorLimit()
    private resolveSelectedVisitorLimit(): number
    {
        if (!this._maxVisitorsDropMenu) return RoomCreateViewCtrl.ROOM_LIMIT_NON_SUBSCRIBER;

        const selection = this._maxVisitorsDropMenu.selection;
        const values = this._maxVisitorsDropMenu.enumerateSelection();
        const value = Number(values[selection]);

        return Number.isFinite(value) && value > 0
            ? value
            : RoomCreateViewCtrl.ROOM_LIMIT_NON_SUBSCRIBER;
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::onHcMoreClick()
    private onHcMoreClick = (_event: WindowEvent): void =>
    {
        this._navigator?.openCatalogClubPage('RoomCreateViewCtrl');
    };
    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::onCancelButtonClick()
    private onCancelButtonClick = (_event: WindowEvent): void =>
    {
        this.hide();
    };

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::centerContent()
    private centerContent(): void
    {
        if (!this._navigator || !this._content) return;

        const desktop = this._navigator.windowManager?.getDesktop(1) ?? this._content.parent;
        const rect = Util.getLocationRelativeTo(desktop, this._content.width, this._content.height);

        this._content.x = Math.trunc(rect.x);
        this._content.y = Math.trunc(rect.y);
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::resolveLocalization()
    private resolveLocalization(value: string): string
    {
        if (!this._navigator) return value;

        const match = /^\$\{(.+)\}$/.exec(value);

        return match ? this._navigator.getText(match[1]) : this._navigator.getText(value);
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::addClickHandler()
    private static addClickHandler(window: IWindow | null, handler: (event: WindowEvent) => void): void
    {
        if (!window) return;

        window.setParamFlag(WindowParam.INPUT_EVENT_PROCESSOR, true);
        window.addEventListener('WME_CLICK', handler);
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::initLayouts()
    private initLayouts(): void
    {
        this._layouts = [
            {requiredClubLevel: 0, tileSize: 104, name: 'a', view: null},
            {requiredClubLevel: 0, tileSize: 94, name: 'b', view: null},
            {requiredClubLevel: 0, tileSize: 36, name: 'c', view: null},
            {requiredClubLevel: 0, tileSize: 84, name: 'd', view: null},
            {requiredClubLevel: 0, tileSize: 80, name: 'e', view: null},
            {requiredClubLevel: 0, tileSize: 80, name: 'f', view: null},
            {requiredClubLevel: 0, tileSize: 416, name: 'i', view: null},
            {requiredClubLevel: 0, tileSize: 320, name: 'j', view: null},
            {requiredClubLevel: 0, tileSize: 448, name: 'k', view: null},
            {requiredClubLevel: 0, tileSize: 352, name: 'l', view: null},
            {requiredClubLevel: 0, tileSize: 384, name: 'm', view: null},
            {requiredClubLevel: 0, tileSize: 372, name: 'n', view: null},
            {requiredClubLevel: 1, tileSize: 80, name: 'g', view: null},
            {requiredClubLevel: 1, tileSize: 74, name: 'h', view: null},
            {requiredClubLevel: 1, tileSize: 416, name: 'o', view: null},
            {requiredClubLevel: 1, tileSize: 352, name: 'p', view: null},
            {requiredClubLevel: 1, tileSize: 304, name: 'q', view: null},
            {requiredClubLevel: 1, tileSize: 336, name: 'r', view: null},
            {requiredClubLevel: 1, tileSize: 748, name: 'u', view: null},
            {requiredClubLevel: 1, tileSize: 438, name: 'v', view: null},
            {requiredClubLevel: 2, tileSize: 540, name: 't', view: null},
            {requiredClubLevel: 2, tileSize: 512, name: 'w', view: null},
            {requiredClubLevel: 2, tileSize: 396, name: 'x', view: null},
            {requiredClubLevel: 2, tileSize: 440, name: 'y', view: null},
            {requiredClubLevel: 2, tileSize: 456, name: 'z', view: null},
            {requiredClubLevel: 2, tileSize: 208, name: '0', view: null},
            {requiredClubLevel: 2, tileSize: 1009, name: '1', view: null},
            {requiredClubLevel: 2, tileSize: 1044, name: '2', view: null},
            {requiredClubLevel: 2, tileSize: 183, name: '3', view: null},
            {requiredClubLevel: 2, tileSize: 254, name: '4', view: null},
            {requiredClubLevel: 2, tileSize: 1024, name: '5', view: null},
            {requiredClubLevel: 2, tileSize: 801, name: '6', view: null},
            {requiredClubLevel: 2, tileSize: 354, name: '7', view: null},
            {requiredClubLevel: 2, tileSize: 888, name: '8', view: null},
            {requiredClubLevel: 2, tileSize: 926, name: '9', view: null},
            {requiredClubLevel: -1, tileSize: 2500, name: 'snowwar1', view: null},
            {requiredClubLevel: -1, tileSize: 2500, name: 'snowwar2', view: null}
        ];
    }

    // AS3: sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as::dispose()
    dispose(): void
    {
        this._roomNameManager?.dispose();
        this._roomDescManager?.dispose();
        this._roomNameManager = null;
        this._roomDescManager = null;

        if (this._content)
        {
            this._content.destroy();
            this._content = null;
        }

        this._layoutItemList = null;
        this._categoryDropMenu = null;
        this._maxVisitorsDropMenu = null;
        this._tradeModeDropMenu = null;
        this._categories = [];
        this._layouts = [];
        this._selectedLayout = null;
        this._navigator = null;
    }
}
