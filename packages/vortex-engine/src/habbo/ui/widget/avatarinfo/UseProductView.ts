/**
 * UseProductView — the "use this on…" bubble raised over every pet a product can target.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/avatarinfo/UseProductView.as
 *
 * One instance per candidate pet (AvatarInfoWidgetHandler::activateUseProductMenuForPets builds
 * the list, from either an inventory double-click or a click on the product already in the room).
 * The product's furniture category decides which single button the bubble shows; clicking it
 * opens UseProductConfirmationView for that pair.
 *
 * AS3 adaptation: the window's WME_OVER/WME_OUT listeners become one `procedure`, as in the
 * other pet bubbles.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IFurnitureData} from '@habbo/session/furniture/IFurnitureData';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';
import {Logger} from '@core/utils/Logger';
import type {UseProductItem} from '../events/UseProductItem';
import {AvatarContextInfoButtonView} from './AvatarContextInfoButtonView';
import type {AvatarInfoWidget} from './AvatarInfoWidget';

const logger = Logger.getLogger('habbo.ui.widget.avatarinfo.UseProductView');

// AS3: UseProductView.as::MODE_NORMAL
const MODE_NORMAL: number = 0;
const MODE_SHAMPOO: number = 1;
const MODE_CUSTOM_PART: number = 2;
const MODE_CUSTOM_PART_SHAMPOO: number = 3;
const MODE_SADDLE: number = 4;
const MODE_REVIVE: number = 5;
const MODE_REBREED: number = 6;
const MODE_FERTILIZE: number = 7;

// Furniture categories the modes above map to. AS3 writes them as `category - 13` switch
// offsets; the names come from the mode each one selects.
const CATEGORY_SHAMPOO: number = 13;
const CATEGORY_CUSTOM_PART: number = 14;
const CATEGORY_CUSTOM_PART_SHAMPOO: number = 15;
const CATEGORY_SADDLE: number = 16;
const CATEGORY_REVIVE: number = 20;
const CATEGORY_REBREED: number = 21;
const CATEGORY_FERTILIZE: number = 22;

export class UseProductView extends AvatarContextInfoButtonView
{
    // AS3: UseProductView.as::_mode
    private _mode: number = MODE_NORMAL;
    // AS3: UseProductView.as::_item (obfuscated `_SafeStr_5258`)
    private _item: UseProductItem | null = null;

    // AS3: UseProductView.as::UseProductView()
    constructor(widget: AvatarInfoWidget)
    {
        super(widget);
        this._autoHideEnabled = false;
    }

    // AS3: UseProductView.as::setup()
    public static setup(
        view: UseProductView,
        userId: number,
        userName: string,
        roomIndex: number,
        userType: number,
        item: UseProductItem
    ): void
    {
        if(!view) return;

        view._item = item;

        AvatarContextInfoButtonView.setupButtonView(view, userId, userName, roomIndex, userType, false);
    }

    // AS3: UseProductView.as::get objectId()
    public get objectId(): number
    {
        return this._item?.id ?? -1;
    }

    // AS3: UseProductView.as::get requestRoomObjectId()
    public get requestRoomObjectId(): number
    {
        return this._item?.requestRoomObjectId ?? -1;
    }

    // AS3: UseProductView.as::get widget()
    private get widget(): AvatarInfoWidget
    {
        return this._widget as AvatarInfoWidget;
    }

    // AS3: UseProductView.as::resolveMode()
    // The product may already be in the room (look it up as a room object) or still be in the
    // inventory (then requestRoomObjectId is a furniture *type* id, not a room object id).
    private resolveMode(): void
    {
        if(!this._item) return;

        const handler = this.widget.handler;
        const container = handler?.container ?? null;

        if(!container) return;

        const roomId = container.roomSession.roomId;
        const roomObject = container.roomEngine?.getRoomObject(
            roomId, this._item.requestRoomObjectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE
        ) ?? null;

        let furniData: IFurnitureData | null;

        if(roomObject) furniData = handler.getFurniData(roomObject);
        else furniData = container.sessionDataManager?.getFloorItemData(this._item.requestRoomObjectId) ?? null;

        if(!furniData) return;

        this._mode = MODE_NORMAL;

        switch(furniData.category)
        {
            case CATEGORY_SHAMPOO:
                this._mode = MODE_SHAMPOO;
                break;
            case CATEGORY_CUSTOM_PART:
                this._mode = MODE_CUSTOM_PART;
                break;
            case CATEGORY_CUSTOM_PART_SHAMPOO:
                this._mode = MODE_CUSTOM_PART_SHAMPOO;
                break;
            case CATEGORY_SADDLE:
                this._mode = MODE_SADDLE;
                break;
            case CATEGORY_REVIVE:
                this._mode = MODE_REVIVE;
                break;
            case CATEGORY_REBREED:
                this._mode = MODE_REBREED;
                break;
            case CATEGORY_FERTILIZE:
                this._mode = MODE_FERTILIZE;
                break;
            default:
                logger.warn(`[UseProductView.open()] Unsupported furniture category: ${furniData.category}`);
        }
    }

    // AS3: UseProductView.as::updateWindow()
    protected override updateWindow(): void
    {
        if(!this._widget.assets || !this._widget.windowManager) return;

        this.resolveMode();

        if(this.minimized)
        {
            const minimizedView = this.getMinimizedView();

            if(minimizedView) this.activeView = minimizedView;

            return;
        }

        if(!this._window)
        {
            this._window = this._widget.windowManager.buildWidgetLayout('use_product_menu') as IWindowContainer | null;

            if(!this._window) return;

            this._window.procedure = this.windowProc;

            const minimize = this._window.findChildByName('minimize');

            if(minimize) minimize.procedure = this.onMinimize;
        }

        this._buttons = this._window.findChildByName('buttons') as IItemListWindow | null;

        if(this._buttons) this._buttons.procedure = this.buttonEventProc;

        const nameWindow = this._window.findChildByName('name') as ITextWindow | null;

        if(nameWindow) nameWindow.caption = this._userName;

        this._window.visible = false;
        this.activeView = this._window;
        this.updateButtons();
    }

    // AS3: UseProductView.as::updateButtons()
    public updateButtons(): void
    {
        if(!this._window || !this._buttons) return;

        this._buttons.autoArrangeItems = false;

        const count = this._buttons.numListItems;

        for(let i = 0; i < count; i++)
        {
            const item = this._buttons.getListItemAt(i);

            if(item) item.visible = false;
        }

        switch(this._mode)
        {
            case MODE_NORMAL:
                this.showButton('use_product');
                break;
            case MODE_SHAMPOO:
                this.showButton('use_product_shampoo');
                break;
            case MODE_CUSTOM_PART:
                this.showButton('use_product_custom_part');
                break;
            case MODE_CUSTOM_PART_SHAMPOO:
                this.showButton('use_product_custom_part_shampoo');
                break;
            case MODE_SADDLE:
                // A pet that already wears a saddle gets the "replace" caption instead.
                if(this._item?.replace) this.showButton('replace_product_saddle');
                else this.showButton('use_product_saddle');
                break;
            case MODE_REVIVE:
                this.showButton('revive_monsterplant');
                break;
            case MODE_REBREED:
                this.showButton('rebreed_monsterplant');
                break;
            case MODE_FERTILIZE:
                this.showButton('fertilize_monsterplant');
                break;
        }

        this._buttons.autoArrangeItems = true;
        this._buttons.visible = true;
    }

    // AS3: UseProductView.as::buttonEventProc()
    protected override buttonEventProc = (event: WindowEvent, window: IWindow): void =>
    {
        if(this.disposed || !this._window || this._window.disposed) return;

        let close = false;

        if(event.type === 'WME_CLICK')
        {
            if(window.name === 'button' && this._item)
            {
                close = true;

                switch(window.parent?.name)
                {
                    case 'use_product':
                    case 'use_product_shampoo':
                    case 'use_product_custom_part':
                    case 'use_product_custom_part_shampoo':
                    case 'use_product_saddle':
                    case 'replace_product_saddle':
                    case 'revive_monsterplant':
                    case 'rebreed_monsterplant':
                    case 'fertilize_monsterplant':
                        this.widget.showUseProductConfirmation(
                            this._item.requestRoomObjectId, this._item.targetRoomObjectId, this._item.requestInventoryStripId
                        );
                        break;
                }
            }
        }
        else
        {
            this.applyButtonHover(event, window);
        }

        if(close) this.widget.removeUseProductViews();
    };

    // AS3: UseProductView.as::updateWindow() — the WME_OVER/WME_OUT listeners on _window.
    private windowProc = (event: WindowEvent, window: IWindow): void =>
    {
        this.onMouseHoverEvent(event, window);
    };

    // AS3: UseProductView.as::changeMode()
    private changeMode(mode: number): void
    {
        this._mode = mode;
        this.updateButtons();
    }

    // AS3: UseProductView.as::dispose()
    public override dispose(): void
    {
        this._item?.dispose();
        this._item = null;

        super.dispose();
    }
}
