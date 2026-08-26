import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {RoomDesktop} from '@habbo/ui/RoomDesktop';
import type {CraftingWidget} from '@habbo/ui/widget/crafting/CraftingWidget';
import type {IProductData} from '@habbo/session/product/IProductData';
import {RoomEngineToWidgetEvent} from '@habbo/room/events/RoomEngineToWidgetEvent';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';
import {CraftingViewStateEnum} from '@habbo/ui/widget/crafting/utils/CraftingViewStateEnum';
import {
    HabboInventoryFurniListParsedEvent
} from '@habbo/inventory/events/HabboInventoryFurniListParsedEvent';
import {CraftableProductsMessageEvent} from '@habbo/communication/messages/incoming/crafting/CraftableProductsMessageEvent';
import type {CraftableProductsMessageEventParser} from '@habbo/communication/messages/parser/crafting/CraftableProductsMessageEventParser';
import {CraftingRecipeMessageEvent} from '@habbo/communication/messages/incoming/crafting/CraftingRecipeMessageEvent';
import type {CraftingRecipeMessageEventParser} from '@habbo/communication/messages/parser/crafting/CraftingRecipeMessageEventParser';
import {CraftingResultMessageEvent} from '@habbo/communication/messages/incoming/crafting/CraftingResultMessageEvent';
import type {CraftingResultMessageEventParser} from '@habbo/communication/messages/parser/crafting/CraftingResultMessageEventParser';
import {
    CraftingRecipesAvailableMessageEvent
} from '@habbo/communication/messages/incoming/crafting/CraftingRecipesAvailableMessageEvent';
import type {
    CraftingRecipesAvailableMessageEventParser
} from '@habbo/communication/messages/parser/crafting/CraftingRecipesAvailableMessageEventParser';
import {GetCraftableProductsComposer} from '@habbo/communication/messages/outgoing/crafting/GetCraftableProductsComposer';
import {GetCraftingRecipeComposer} from '@habbo/communication/messages/outgoing/crafting/GetCraftingRecipeComposer';
import {
    GetCraftingRecipesAvailableComposer
} from '@habbo/communication/messages/outgoing/crafting/GetCraftingRecipesAvailableComposer';
import {CraftComposer} from '@habbo/communication/messages/outgoing/crafting/CraftComposer';
import {CraftSecretComposer} from '@habbo/communication/messages/outgoing/crafting/CraftSecretComposer';
import {FurniListInvalidateMessageEvent} from '@habbo/communication/messages/incoming/inventory/furni/FurniListInvalidateMessageEvent';
import {RequestFurniInventoryComposer} from '@habbo/communication/messages/outgoing/inventory/RequestFurniInventoryComposer';

/**
 * Wires the crafting widget to the room engine (open/close on the crafting gizmo furni) and the
 * five crafting messages.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/CraftingWidgetHandler.as
 */
export class CraftingWidgetHandler implements IRoomWidgetHandler
{
    // AS3: .../handler/CraftingWidgetHandler.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../handler/CraftingWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../handler/CraftingWidgetHandler.as::_SafeStr_4549 (widget)
    private _widget: CraftingWidget | null = null;

    // AS3: .../handler/CraftingWidgetHandler.as::_SafeStr_5844 (roomDesktop)
    private _roomDesktop: RoomDesktop | null;

    // AS3: .../handler/CraftingWidgetHandler.as::_SafeStr_6400 (furniListInvalidateEvent)
    private _furniListInvalidateEvent: IMessageEvent | null = null;

    // AS3: .../handler/CraftingWidgetHandler.as::_messageEvents
    private _messageEvents: IMessageEvent[] | null = null;

    // AS3: .../handler/CraftingWidgetHandler.as::_SafeStr_5691 (furnitureId)
    private _furnitureId: number = -1;

    // AS3: .../handler/CraftingWidgetHandler.as::_SafeStr_7471 (initializingData)
    private _initializingData: boolean = false;

    // AS3: .../handler/CraftingWidgetHandler.as::_SafeStr_6711 (inventoryDirty)
    private _inventoryDirtyFlag: boolean = false;

    // AS3: .../handler/CraftingWidgetHandler.as::_craftingInProgress
    private _craftingInProgress: boolean = false;

    // AS3: .../handler/CraftingWidgetHandler.as::_SafeStr_8229 (selectedProductData)
    private _selectedProductData: IProductData | null = null;

    // AS3: .../handler/CraftingWidgetHandler.as::_SafeStr_7062 (selectedRecipeCode)
    private _selectedRecipeCode: string | null = null;

    // AS3: .../handler/CraftingWidgetHandler.as::CraftingWidgetHandler()
    constructor(roomDesktop: RoomDesktop | null)
    {
        this._roomDesktop = roomDesktop;
    }

    // AS3: .../handler/CraftingWidgetHandler.as::dispose()
    dispose(): void
    {
        this.removeMessageEvents();
        this._widget = null;
        this._container = null;
        this._roomDesktop = null;
        this._selectedProductData = null;
        this._selectedRecipeCode = null;
        this._disposed = true;
    }

    // AS3: .../handler/CraftingWidgetHandler.as::addMessageEvents()
    private addMessageEvents(): void
    {
        const connection = this._container?.connection;

        if(!connection) return;

        this._messageEvents = [
            new CraftableProductsMessageEvent(this.onCraftableProductsMessage),
            new CraftingRecipeMessageEvent(this.onCraftingRecipeMessage),
            new CraftingResultMessageEvent(this.onCraftingResultMessage),
            new CraftingRecipesAvailableMessageEvent(this.onCraftingRecipesAvailableMessage)
        ];

        for(const event of this._messageEvents) connection.addMessageEvent(event);
    }

    // AS3: .../handler/CraftingWidgetHandler.as::removeMessageEvents()
    private removeMessageEvents(): void
    {
        const connection = this._container?.connection;

        if(!connection || !this._messageEvents) return;

        for(const event of this._messageEvents)
        {
            connection.removeMessageEvent(event);
            event.dispose();
        }

        this.removeInventoryUpdateEvent();

        this._container?.inventory?.events?.off(
            HabboInventoryFurniListParsedEvent.HFLPE_FURNI_LIST_PARSED, this.onFurniListParsed
        );

        this._messageEvents = null;
    }

    // AS3: .../handler/CraftingWidgetHandler.as::initializeData()
    initializeData(): void
    {
        if(this._initializingData) return;

        this._initializingData = true;

        if(this._container?.inventory?.checkCategoryInitilization('furni')) this.getCraftableProducts();
    }

    // AS3: .../handler/CraftingWidgetHandler.as::onFurniListParsed()
    private onFurniListParsed = (event: HabboInventoryFurniListParsedEvent): void =>
    {
        if(this._initializingData && event.category === 'furni') this.getCraftableProducts();
    };

    // AS3: .../handler/CraftingWidgetHandler.as::getCraftableProducts()
    private getCraftableProducts(): void
    {
        this._container?.connection?.send(new GetCraftableProductsComposer(this._furnitureId));
    }

    // AS3: .../handler/CraftingWidgetHandler.as::onCraftableProductsMessage()
    private onCraftableProductsMessage = (event: IMessageEvent): void =>
    {
        this._initializingData = false;

        if(!this._widget) return;

        const parser = event.parser as CraftableProductsMessageEventParser | null;

        if(!parser?.hasData())
        {
            this._widget.hide();

            return;
        }

        this._widget.showWidget();

        const roomEngine = this._container?.roomEngine;
        const sessionDataManager = this._container?.sessionDataManager;

        if(roomEngine && sessionDataManager)
        {
            this._widget.showCraftingCategories(
                parser.recipeProductItems, parser.usableInventoryFurniClasses, roomEngine, sessionDataManager
            );
        }

        this._inventoryDirtyFlag = false;
    };

    // AS3: .../handler/CraftingWidgetHandler.as::getCraftingRecipe()
    getCraftingRecipe(recipeCode: string, productCode: string): void
    {
        this._selectedProductData = this._container?.sessionDataManager?.getProductData(productCode) ?? null;
        this._selectedRecipeCode = recipeCode;
        this._container?.connection?.send(new GetCraftingRecipeComposer(recipeCode));
    }

    // AS3: .../handler/CraftingWidgetHandler.as::onCraftingRecipeMessage()
    private onCraftingRecipeMessage = (event: IMessageEvent): void =>
    {
        const parser = event.parser as CraftingRecipeMessageEventParser | null;

        this._widget?.showCraftingRecipe(parser?.ingredients ?? null);
    };

    // AS3: .../handler/CraftingWidgetHandler.as::getCraftingRecipesAvailable()
    getCraftingRecipesAvailable(furnitureIds: number[]): void
    {
        this._container?.connection?.send(new GetCraftingRecipesAvailableComposer(this._furnitureId, furnitureIds));
    }

    // AS3: .../handler/CraftingWidgetHandler.as::onCraftingRecipesAvailableMessage()
    private onCraftingRecipesAvailableMessage = (event: IMessageEvent): void =>
    {
        const parser = event.parser as CraftingRecipesAvailableMessageEventParser | null;

        if(!parser) return;

        this._widget?.infoCtrl?.craftingSecretRecipesAvailable(parser.count, parser.recipeComplete);
    };

    // AS3: .../handler/CraftingWidgetHandler.as::doCraftingWithRecipe()
    doCraftingWithRecipe(): void
    {
        if(!this._selectedProductData || !this._selectedRecipeCode) return;

        this._widget?.infoCtrl?.setState(CraftingViewStateEnum.STATE_WORKING);
        this.registerForFurniListInvalidate();
        this._container?.connection?.send(new CraftComposer(this._furnitureId, this._selectedRecipeCode));
    }

    // AS3: .../handler/CraftingWidgetHandler.as::doCraftingWithMixer()
    doCraftingWithMixer(): void
    {
        this._widget?.infoCtrl?.setState(CraftingViewStateEnum.STATE_WORKING);

        const furnitureIds = this._widget?.getSelectedIngredients() ?? [];

        this.registerForFurniListInvalidate();
        this._container?.connection?.send(new CraftSecretComposer(this._furnitureId, furnitureIds));
    }

    // AS3: .../handler/CraftingWidgetHandler.as::onCraftingResultMessage()
    private onCraftingResultMessage = (event: IMessageEvent): void =>
    {
        this._craftingInProgress = false;

        const parser = event.parser as CraftingResultMessageEventParser | null;

        if(!parser?.success)
        {
            this._widget?.clearMixerItems();
            this._inventoryDirtyFlag = false;
            this.removeInventoryUpdateEvent();
            this._widget?.setInfoState(CraftingViewStateEnum.MIXER_EMPTY);

            return;
        }

        this._widget?.clearMixerItems();

        const productData = parser.productData;
        const floorItemData = productData
            ? (this._container?.sessionDataManager?.getFloorItemDataByName(productData.furnitureClassName) ?? null)
            : null;

        if(!floorItemData) return;

        this._widget?.setInfoState(CraftingViewStateEnum.STATE_CRAFTING_RESULT_OK, floorItemData);
    };

    // AS3: .../handler/CraftingWidgetHandler.as::registerForFurniListInvalidate()
    private registerForFurniListInvalidate(): void
    {
        this._inventoryDirtyFlag = true;

        if(this._furniListInvalidateEvent === null)
        {
            this._furniListInvalidateEvent = new FurniListInvalidateMessageEvent(this.onFurniListInvalidate);
            this._container?.connection?.addMessageEvent(this._furniListInvalidateEvent);
        }
    }

    // AS3: .../handler/CraftingWidgetHandler.as::onFurniListInvalidate()
    private onFurniListInvalidate = (): void =>
    {
        this._container?.connection?.send(new RequestFurniInventoryComposer());
        this._container?.connection?.send(new GetCraftableProductsComposer(this._furnitureId));
        this.removeInventoryUpdateEvent();
    };

    // AS3: .../handler/CraftingWidgetHandler.as::removeInventoryUpdateEvent()
    removeInventoryUpdateEvent(): void
    {
        if(this._furniListInvalidateEvent)
        {
            this._container?.connection?.removeMessageEvent(this._furniListInvalidateEvent);
            this._furniListInvalidateEvent = null;
        }
    }

    // AS3: .../handler/CraftingWidgetHandler.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../handler/CraftingWidgetHandler.as::get type()
    get type(): string
    {
        return 'RWE_CRAFTING';
    }

    // AS3: .../handler/CraftingWidgetHandler.as::set container()
    set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
        this.addMessageEvents();

        this._container?.inventory?.events?.on(
            HabboInventoryFurniListParsedEvent.HFLPE_FURNI_LIST_PARSED, this.onFurniListParsed
        );
    }

    // AS3: .../handler/CraftingWidgetHandler.as::get container()
    get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    // AS3: .../handler/CraftingWidgetHandler.as::set widget()
    set widget(value: CraftingWidget | null)
    {
        this._widget = value;
    }

    // AS3: .../handler/CraftingWidgetHandler.as::getWidgetMessages()
    getWidgetMessages(): string[] | null
    {
        return null;
    }

    // AS3: .../handler/CraftingWidgetHandler.as::processWidgetMessage()
    processWidgetMessage(_message: unknown): unknown
    {
        return null;
    }

    // AS3: .../handler/CraftingWidgetHandler.as::getProcessedEvents()
    getProcessedEvents(): string[]
    {
        return [RoomEngineToWidgetEvent.REQUEST_OPEN_WIDGET, RoomEngineToWidgetEvent.REQUEST_CLOSE_WIDGET];
    }

    // AS3: .../handler/CraftingWidgetHandler.as::processEvent()
    processEvent(event: unknown): void
    {
        const roomEngine = this._container?.roomEngine;

        if(!roomEngine || !this._widget) return;

        const engineEvent = event instanceof RoomEngineToWidgetEvent ? event : null;

        if(!engineEvent) return;

        const roomObject = roomEngine.getRoomObject(engineEvent.roomId, engineEvent.objectId, engineEvent.category);

        switch(engineEvent.type)
        {
            case RoomEngineToWidgetEvent.REQUEST_OPEN_WIDGET:
                if(this._widget.window !== null) return;

                if(roomObject !== null)
                {
                    this._furnitureId = roomObject.getId();
                    this.initializeData();
                }
                break;

            case RoomEngineToWidgetEvent.REQUEST_CLOSE_WIDGET:
                this._furnitureId = -1;
                this._widget.hide();
                break;
        }
    }

    // AS3: .../handler/CraftingWidgetHandler.as::get isOwner()
    get isOwner(): boolean
    {
        const roomEngine = this._container?.roomEngine;

        if(!roomEngine) return false;

        const roomObject = roomEngine.getRoomObject(
            roomEngine.activeRoomId, this._furnitureId, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE
        );

        return roomObject !== null && (this._container?.isOwnerOfFurniture(roomObject) ?? false);
    }

    // AS3: .../handler/CraftingWidgetHandler.as::get craftingInProgress()
    get craftingInProgress(): boolean
    {
        return this._craftingInProgress;
    }

    // AS3: .../handler/CraftingWidgetHandler.as::set craftingInProgress()
    set craftingInProgress(value: boolean)
    {
        this._craftingInProgress = value;
    }

    // AS3: .../handler/CraftingWidgetHandler.as::get inventoryDirty()
    get inventoryDirty(): boolean
    {
        return this._inventoryDirtyFlag;
    }

    // AS3: .../handler/CraftingWidgetHandler.as::update()
    // Empty in AS3 too.
    update(): void
    {
    }
}
