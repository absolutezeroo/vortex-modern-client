import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IWindow} from '@core/window/IWindow';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IModalDialog} from '@habbo/window/utils/IModalDialog';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {RoomUI} from '@habbo/ui/RoomUI';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import type {CraftingWidgetHandler} from '@habbo/ui/handler/CraftingWidgetHandler';
import type {CraftingResultObjectParser} from '@habbo/communication/messages/parser/crafting/CraftingResultObjectParser';
import type {CraftinRecipeIngredientParser} from '@habbo/communication/messages/parser/crafting/CraftinRecipeIngredientParser';
import {CraftingFurnitureItem} from './utils/CraftingFurnitureItem';
import {CraftingViewStateEnum} from './utils/CraftingViewStateEnum';
import {CraftingInventoryListController} from './controller/CraftingInventoryListController';
import {CraftingRecipeListController} from './controller/CraftingRecipeListController';
import {CraftingMixerController} from './controller/CraftingMixerController';
import {CraftingInfoController} from './controller/CraftingInfoController';

/**
 * The crafting gizmo's modal dialog: two grids (usable inventory furni, craftable public recipes)
 * on the left, a mixer grid for "secret" recipes and the info/craft panel on the right.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/crafting/CraftingWidget.as
 */
export class CraftingWidget extends RoomWidgetBase
{
    // AS3: .../crafting/CraftingWidget.as::MODE_NONE
    static readonly MODE_NONE: number = 0;

    // AS3: .../crafting/CraftingWidget.as::MODE_SECRET_RECIPE
    static readonly MODE_SECRET_RECIPE: number = 1;

    // AS3: .../crafting/CraftingWidget.as::MODE_PUBLIC_RECIPE
    static readonly MODE_PUBLIC_RECIPE: number = 2;

    // AS3: .../crafting/CraftingWidget.as::_roomUI
    private _roomUI: RoomUI | null;

    // AS3: .../crafting/CraftingWidget.as::_SafeStr_6227 (selectedProduct)
    private _selectedProduct: CraftingFurnitureItem | null = null;

    // AS3: .../crafting/CraftingWidget.as::_SafeStr_4876 (modalDialog)
    private _modalDialog: IModalDialog | null = null;

    // AS3: .../crafting/CraftingWidget.as::_SafeStr_6180 (itemTemplate)
    private _itemTemplate: IWindowContainer | null = null;

    // AS3: .../crafting/CraftingWidget.as::_SafeStr_5981 (inventoryCtrl)
    private _inventoryCtrl: CraftingInventoryListController | null;

    // AS3: .../crafting/CraftingWidget.as::_SafeStr_5851 (recipeCtrl)
    private _recipeCtrl: CraftingRecipeListController | null;

    // AS3: .../crafting/CraftingWidget.as::_SafeStr_5564 (mixerCtrl)
    private _mixerCtrl: CraftingMixerController | null;

    // AS3: .../crafting/CraftingWidget.as::_SafeStr_5692 (infoCtrl)
    private _infoCtrl: CraftingInfoController | null;

    // AS3: .../crafting/CraftingWidget.as::_craftingMode
    private _craftingMode: number = CraftingWidget.MODE_NONE;

    // AS3: .../crafting/CraftingWidget.as::CraftingWidget()
    // `super(handler, windowManager, null, null)` — AS3 passes the bare identifiers `assets` and
    // `localizations` here, which resolve to RoomWidgetBase's own (still-null) fields at this point
    // in construction, per AS3's field-init-before-super() order (see CLAUDE.md's
    // "AS3 field init runs before super()"). `_assets` is set from `roomUI.assets` two lines below,
    // exactly as AS3 does.
    constructor(handler: IRoomWidgetHandler, windowManager: IHabboWindowManager, roomUI: RoomUI)
    {
        super(handler, windowManager, null, null);

        this._roomUI = roomUI;
        this._inventoryCtrl = new CraftingInventoryListController(this);
        this._recipeCtrl = new CraftingRecipeListController(this);
        this._mixerCtrl = new CraftingMixerController(this);
        this._infoCtrl = new CraftingInfoController(this);
        this._assets = roomUI.assets;
        this.handler.widget = this;
    }

    // AS3: .../crafting/CraftingWidget.as::dispose()
    override dispose(): void
    {
        if(this.disposed) return;

        this.hide();
        this._roomUI = null;

        if(this._inventoryCtrl)
        {
            this._inventoryCtrl.dispose();
            this._inventoryCtrl = null;
        }

        if(this._recipeCtrl)
        {
            this._recipeCtrl.dispose();
            this._recipeCtrl = null;
        }

        if(this._mixerCtrl)
        {
            this._mixerCtrl.dispose();
            this._mixerCtrl = null;
        }

        if(this._infoCtrl)
        {
            this._infoCtrl.dispose();
            this._infoCtrl = null;
        }

        if(this._itemTemplate)
        {
            this._itemTemplate.dispose();
            this._itemTemplate = null;
        }

        super.dispose();
    }

    // AS3: .../crafting/CraftingWidget.as::hide()
    hide(): void
    {
        this.handler.removeInventoryUpdateEvent();
        this._mixerCtrl?.clearItems();
        this._inventoryCtrl?.clearItems();
        this._recipeCtrl?.clearItems();

        if(this.craftingInProgress) this._infoCtrl?.cancelCrafting();

        this._craftingMode = CraftingWidget.MODE_NONE;

        if(this._modalDialog !== null)
        {
            this._modalDialog.dispose();
            this._modalDialog = null;
        }
    }

    // AS3: .../crafting/CraftingWidget.as::createMainWindow()
    private createMainWindow(): void
    {
        // Guards on `_modalDialog` rather than the `window` getter AS3 checks (`if(window != null)
        // return;`) — equivalent in every real path (the getter is null exactly when `_modalDialog`
        // is), and it sidesteps a TS narrowing trap: a get-only accessor's result is treated as
        // stable for the rest of the function once tested, even across the reassignment of the
        // mutable field it is derived from, which would otherwise type every later `this.window`
        // read in this method as `never`.
        if(this._modalDialog !== null) return;

        const layout = (this.assets?.getAssetByName('craftingwidget_xml')?.content as string | null) ?? null;

        if(!layout) return;

        this._modalDialog = this.windowManager.buildModalDialogFromXML(layout);

        if(!this._modalDialog || !this._modalDialog.rootWindow) return;

        const rootWindow = this.window;

        if(!rootWindow) return;

        const closeButton = rootWindow.findChildByTag('close');

        closeButton?.addEventListener(WindowMouseEvent.CLICK, this.onClose);

        const productsGrid = rootWindow.findChildByName('itemgrid_products') as IItemGridWindow | null;
        const itemTemplate = productsGrid?.getGridItemAt(0) as IWindowContainer | null;

        if(productsGrid && itemTemplate)
        {
            this._itemTemplate = itemTemplate;
            productsGrid.removeGridItem(itemTemplate);
        }

        rootWindow.procedure = this.onInput;
        rootWindow.center();
    }

    // AS3: .../crafting/CraftingWidget.as::populateInventoryItems()
    populateInventoryItems(items: CraftingFurnitureItem[]): void
    {
        this._inventoryCtrl?.populateInventoryItems(items);
    }

    // AS3: .../crafting/CraftingWidget.as::populateRecipeItems()
    populateRecipeItems(items: CraftingFurnitureItem[]): void
    {
        this._recipeCtrl?.populateRecipeItems(items);
    }

    /**
     * AS3 forwards its own `...rest` (already an Array) as a single argument to
     * `CraftingInfoController.setState(param1, rest)`; this port spreads `args` straight through
     * instead — see the note on `CraftingInfoController.setState()`.
     */
    // AS3: .../crafting/CraftingWidget.as::setInfoState()
    setInfoState(state: number, ...args: unknown[]): void
    {
        this._infoCtrl?.setState(state, ...args);
    }

    // AS3: .../crafting/CraftingWidget.as::onInput()
    private onInput = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_DOWN') return;

        if(window.name === 'header_button_close') this.hide();
    };

    // AS3: .../crafting/CraftingWidget.as::onCloseHandler() (_SafeStr onClose)
    private onClose = (_event: WindowMouseEvent): void =>
    {
        this.hide();
    };

    // AS3: .../crafting/CraftingWidget.as::setInfoText()
    setInfoText(text: string): void
    {
        const headerMixer = this.window?.findChildByName('header_mixer') as ITextWindow | null;

        if(headerMixer) headerMixer.text = text;
    }

    // AS3: .../crafting/CraftingWidget.as::showWidget()
    showWidget(): void
    {
        if(this.window) return;

        this.createMainWindow();
        this.setInfoText('');
        this.setInfoState(CraftingViewStateEnum.DEFAULT_VIEW);
    }

    // AS3: .../crafting/CraftingWidget.as::showCraftingCategories()
    showCraftingCategories(
        recipeProductItems: CraftingResultObjectParser[],
        usableInventoryFurniClasses: string[],
        _roomEngine: IRoomEngine,
        sessionDataManager: ISessionDataManager
    ): void
    {
        const inventoryItems: CraftingFurnitureItem[] = [];

        for(const furniClassName of usableInventoryFurniClasses)
        {
            let isWallItem = false;
            let furnitureData = sessionDataManager.getFloorItemDataByName(furniClassName);

            if(!furnitureData)
            {
                furnitureData = sessionDataManager.getWallItemDataByName(furniClassName);
                isWallItem = true;

                if(!furnitureData) continue;
            }

            const item = new CraftingFurnitureItem(null, null, furnitureData);
            const ids = this.handler.container?.inventory?.getNonRentedInventoryIds('furni', item.typeId, isWallItem);

            if(ids && ids.length > 0) item.inventoryIds = ids;

            inventoryItems.push(item);
        }

        this.populateInventoryItems(inventoryItems);

        const recipeItems: CraftingFurnitureItem[] = [];

        for(const recipe of recipeProductItems)
        {
            const floorData = sessionDataManager.getFloorItemDataByName(recipe.furnitureClassName);
            const wallData = sessionDataManager.getWallItemDataByName(recipe.furnitureClassName);

            if(floorData)
            {
                recipeItems.push(new CraftingFurnitureItem(recipe.recipeCode, recipe.productCode, floorData));
            }
            else if(wallData)
            {
                recipeItems.push(new CraftingFurnitureItem(recipe.recipeCode, recipe.productCode, wallData));
            }
        }

        this.populateRecipeItems(recipeItems);
    }

    // AS3: .../crafting/CraftingWidget.as::showCraftableProduct()
    showCraftableProduct(item: CraftingFurnitureItem): void
    {
        this._selectedProduct = item;

        if(!this._selectedProduct) return;

        this.setInfoText(this._selectedProduct.furnitureData ? this._selectedProduct.furnitureData.localizedName : '');
        this.handler.getCraftingRecipe(this._selectedProduct.recipeCode ?? '', this._selectedProduct.productCode ?? '');
    }

    // AS3: .../crafting/CraftingWidget.as::showCraftingRecipe()
    showCraftingRecipe(ingredients: CraftinRecipeIngredientParser[] | null): void
    {
        this.showCraftableProductView();
        this._recipeCtrl?.showRecipe(this._selectedProduct as CraftingFurnitureItem, ingredients);
    }

    // AS3: .../crafting/CraftingWidget.as::clearMixerItems()
    clearMixerItems(): void
    {
        this._mixerCtrl?.clearItems();
    }

    // AS3: .../crafting/CraftingWidget.as::mixerContentChanged()
    mixerContentChanged(ids: number[]): void
    {
        if(ids.length > 0)
        {
            this.setInfoState(CraftingViewStateEnum.STATE_WORKING);
            this.handler.getCraftingRecipesAvailable(ids);
        }
        else
        {
            this.setInfoState(CraftingViewStateEnum.MIXER_EMPTY);
        }
    }

    // AS3: .../crafting/CraftingWidget.as::showSecretRecipeView()
    showSecretRecipeView(): void
    {
        if(this._craftingMode !== CraftingWidget.MODE_SECRET_RECIPE) this.clearMixerItems();

        this._craftingMode = CraftingWidget.MODE_SECRET_RECIPE;
        this.setInfoText('');
        this.setInfoState(CraftingViewStateEnum.MIXER_EMPTY);
    }

    // AS3: .../crafting/CraftingWidget.as::showCraftableProductView()
    showCraftableProductView(): void
    {
        if(this._craftingMode !== CraftingWidget.MODE_PUBLIC_RECIPE) this.clearMixerItems();

        this._craftingMode = CraftingWidget.MODE_PUBLIC_RECIPE;
        this.setInfoState(CraftingViewStateEnum.RECIPE_EMPTY);
    }

    // AS3: .../crafting/CraftingWidget.as::doCrafting()
    // AS3 switches on `_craftingMode - 1`; written directly against the mode constants instead.
    doCrafting(): void
    {
        switch(this._craftingMode)
        {
            case CraftingWidget.MODE_SECRET_RECIPE:
                this.handler.doCraftingWithMixer();
                break;
            case CraftingWidget.MODE_PUBLIC_RECIPE:
                this.handler.doCraftingWithRecipe();
                break;
        }
    }

    // AS3: .../crafting/CraftingWidget.as::getSelectedIngredients()
    getSelectedIngredients(): number[]
    {
        return this._mixerCtrl?.collectSelectedFurnitureIds() ?? [];
    }

    // AS3: .../crafting/CraftingWidget.as::get inSecretRecipeMode()
    get inSecretRecipeMode(): boolean
    {
        return this._craftingMode === CraftingWidget.MODE_SECRET_RECIPE;
    }

    // AS3: .../crafting/CraftingWidget.as::get craftingInProgress()
    get craftingInProgress(): boolean
    {
        return this.handler.craftingInProgress;
    }

    // AS3: .../crafting/CraftingWidget.as::get inventoryDirty()
    get inventoryDirty(): boolean
    {
        return this.handler.inventoryDirty;
    }

    // AS3: .../crafting/CraftingWidget.as::get itemTemplate()
    get itemTemplate(): IWindowContainer | null
    {
        return this._itemTemplate;
    }

    // AS3: .../crafting/CraftingWidget.as::get handler()
    get handler(): CraftingWidgetHandler
    {
        return this._handler as CraftingWidgetHandler;
    }

    // AS3: .../crafting/CraftingWidget.as::get sessionDataManager()
    get sessionDataManager(): ISessionDataManager | null
    {
        return this.handler.container?.sessionDataManager ?? null;
    }

    // AS3: .../crafting/CraftingWidget.as::get inventoryCtrl()
    get inventoryCtrl(): CraftingInventoryListController | null
    {
        return this._inventoryCtrl;
    }

    // AS3: .../crafting/CraftingWidget.as::get recipeCtrl()
    get recipeCtrl(): CraftingRecipeListController | null
    {
        return this._recipeCtrl;
    }

    // AS3: .../crafting/CraftingWidget.as::get mixerCtrl()
    get mixerCtrl(): CraftingMixerController | null
    {
        return this._mixerCtrl;
    }

    // AS3: .../crafting/CraftingWidget.as::get infoCtrl()
    get infoCtrl(): CraftingInfoController | null
    {
        return this._infoCtrl;
    }

    // AS3: .../crafting/CraftingWidget.as::get window()
    // Not an override: AS3's `CraftingWidget.window` is a separate accessor from
    // `RoomWidgetBase.mainWindow` (used by the base's own `release()`/`dispose()` machinery) — every
    // controller and renderer in this widget reads `widget.window`, matching AS3 exactly.
    get window(): IWindowContainer | null
    {
        return this._modalDialog ? (this._modalDialog.rootWindow as IWindowContainer | null) : null;
    }
}
