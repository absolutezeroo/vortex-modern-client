import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {ImageResult} from '@habbo/room/ImageResult';
import type {IFurnitureData} from '@habbo/session/furniture/IFurnitureData';
import type {CraftingWidget} from '../CraftingWidget';
import {CraftingProgressBarController} from './CraftingProgressBarController';
import {CraftingViewStateEnum} from '../utils/CraftingViewStateEnum';

/**
 * Drives the info panel: the two caption lines, the product icon, and `btn_craft`'s
 * caption/enabled state. `setState()` is the single entry point every other controller funnels
 * through (`CraftingWidget.setInfoState()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/crafting/controller/CraftingInfoController.as
 */
export class CraftingInfoController implements IGetImageListener
{
    // AS3: .../controller/CraftingInfoController.as::_SafeStr_4549 (widget)
    private _widget: CraftingWidget | null;

    // AS3: .../controller/CraftingInfoController.as::_SafeStr_5984 (progressBar)
    private _progressBar: CraftingProgressBarController | null;

    // AS3: .../controller/CraftingInfoController.as::CraftingInfoController()
    constructor(widget: CraftingWidget)
    {
        this._widget = widget;
        this._progressBar = new CraftingProgressBarController(widget);
    }

    // AS3: .../controller/CraftingInfoController.as::dispose()
    dispose(): void
    {
        this._widget = null;

        if(this._progressBar)
        {
            this._progressBar.dispose();
            this._progressBar = null;
        }
    }

    /**
     * AS3 forwards `CraftingWidget.setInfoState()`'s `...rest` as one already-built Array, so its
     * own `...rest` here holds a single array-of-array element it has to unwrap
     * (`rest[0] is Array ? rest[0] : rest`). This port's `CraftingWidget.setInfoState()` spreads its
     * args straight through instead, so `args` below is exactly what each call site below documents
     * — no unwrap needed.
     */
    // AS3: .../controller/CraftingInfoController.as::setState()
    setState(state: number, ...args: unknown[]): void
    {
        const container = this._widget?.handler.container;

        if(!this._widget || !container) return;

        let text1 = '';
        let text2 = '';

        const localization = container.localization;

        switch(state)
        {
            case CraftingViewStateEnum.DEFAULT_VIEW:
                text1 = '${crafting.info.start}';
                this.setButtonVisible(false);
                break;

            case CraftingViewStateEnum.MIXER_EMPTY:
                this.clearIcon();
                text1 = '${crafting.info.mixer.empty}';
                this.disableButtonWith('${crafting.status.mixer.notavailable}');
                break;

            case CraftingViewStateEnum.RECIPE_EMPTY:
                this.clearIcon();
                text1 = '${crafting.info.product.empty}';
                this.setButtonVisible(false);
                break;

            case CraftingViewStateEnum.MIXER_HIT:
                this.clearIcon();
                text1 = '${crafting.info.mixer.hit}';
                this.enableButton();
                break;

            case CraftingViewStateEnum.MIXER_HIT_PLUS_OTHERS: {
                this.clearIcon();

                const count = args[0] as number;

                text1 = localization?.getLocalization('crafting.info.mixer.hit.plus.others', 'crafting.info.mixer.hit.plus.others') ?? '';
                text1 = text1.replace('%number%', String(count));
                this.enableButton();
                break;
            }

            case CraftingViewStateEnum.MIXER_OTHERS_AVAILABLE: {
                this.clearIcon();

                const count = args[0] as number;

                text1 = localization?.getLocalization('crafting.info.mixer.others') ?? '';
                text1 = text1.replace('%number%', String(count));
                this.disableButtonWith('${crafting.status.mixer.notavailable}');
                break;
            }

            case CraftingViewStateEnum.MIXER_NO_HIT:
                this.clearIcon();
                text1 = '${crafting.info.mixer.nohit}';
                this.disableButtonWith('${crafting.status.mixer.notavailable}');
                break;

            case CraftingViewStateEnum.RECIPE_COMPLETE: {
                const furnitureData = args[0] as IFurnitureData | null;

                if(!furnitureData) return;

                this.requestIconFromRoomEngine(furnitureData);
                text1 = localization?.getLocalization('crafting.info.product.complete', 'crafting.info.product.complete') ?? '';
                text2 = furnitureData.localizedName;
                this.enableButton();
                break;
            }

            // AS3 also reads a `Vector.<String>` of missing item names into a local here
            // (`args[1]`) but never uses it — the "incomplete" caption never lists them. Kept
            // unused to match, not embellished.
            case CraftingViewStateEnum.RECIPE_INCOMPLETE: {
                const furnitureData = args[0] as IFurnitureData | null;

                if(!furnitureData) return;

                this.requestIconFromRoomEngine(furnitureData);
                text1 = localization?.getLocalization('crafting.info.product.incomplete', 'crafting.info.product.incomplete') ?? '';
                text2 = furnitureData.localizedName;
                this.disableButtonWith('${crafting.status.recipe.incomplete}');
                break;
            }

            case CraftingViewStateEnum.ITEM_NOT_IN_INVENTORY: {
                const furnitureData = args[0] as IFurnitureData | null;

                if(!furnitureData) return;

                this.requestIconFromRoomEngine(furnitureData);
                text1 = localization?.getLocalization('crafting.info.mixer.notininventory', 'crafting.info.mixer.notininventory') ?? '';
                text1 = text1.replace('%product%', furnitureData.localizedName);
                break;
            }

            case CraftingViewStateEnum.STATE_CRAFTING_RESULT_OK: {
                const furnitureData = args[0] as IFurnitureData | null;

                if(!furnitureData) return;

                this.requestIconFromRoomEngine(furnitureData);
                text1 = localization?.getLocalization('crafting.info.result.ok', 'crafting.info.result.ok') ?? '';
                text2 = furnitureData.localizedName;
                this.setButtonVisible(false);
                break;
            }

            case CraftingViewStateEnum.STATE_WORKING:
                text1 = '${crafting.info.working}';
                this.setButtonVisible(false);
                break;
        }

        const infoText1 = this.mainWindow?.findChildByName('info_text1') as ITextWindow | null;

        if(infoText1) infoText1.text = text1;

        const infoText2 = this.mainWindow?.findChildByName('info_text2') as ITextWindow | null;

        if(infoText2) infoText2.text = text2;
    }

    // AS3: .../controller/CraftingInfoController.as::enableButton()
    private enableButton(): void
    {
        this.setButtonVisible(true);

        const button = this.mainWindow?.findChildByName('btn_craft');

        if(!button) return;

        if(this._widget?.handler.isOwner)
        {
            button.caption = '${crafting.btn.craft}';
            button.enable();
            button.procedure = this.onCraftTriggered;
        }
        else
        {
            button.caption = '${crafting.btn.notowner}';
            button.disable();
        }
    }

    // AS3: .../controller/CraftingInfoController.as::disableButtonWith()
    private disableButtonWith(text: string): void
    {
        this.setButtonVisible(true);

        const button = this.mainWindow?.findChildByName('btn_craft');

        if(!button) return;

        button.caption = this._widget?.handler.isOwner ? text : '${crafting.btn.notowner}';
        button.disable();
    }

    // AS3: .../controller/CraftingInfoController.as::craftingSecretRecipesAvailable()
    craftingSecretRecipesAvailable(count: number, recipeComplete: boolean): void
    {
        if(recipeComplete)
        {
            if(count === 0)
            {
                this.setState(CraftingViewStateEnum.MIXER_HIT);
            }
            else
            {
                this.setState(CraftingViewStateEnum.MIXER_HIT_PLUS_OTHERS, count);
            }
        }
        else if(count > 0)
        {
            this.setState(CraftingViewStateEnum.MIXER_OTHERS_AVAILABLE, count);
        }
        else
        {
            this.setState(CraftingViewStateEnum.MIXER_NO_HIT);
        }
    }

    // AS3: .../controller/CraftingInfoController.as::onCraftTriggered()
    private onCraftTriggered = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_DOWN') return;

        this.showProgressBar();
    };

    // AS3: .../controller/CraftingInfoController.as::clearIcon()
    private clearIcon(): void
    {
        this.setIconBitmapData(null);
        this.alignElements();
    }

    // AS3: .../controller/CraftingInfoController.as::requestIconFromRoomEngine()
    private requestIconFromRoomEngine(furnitureData: IFurnitureData): void
    {
        const roomEngine = this._widget?.handler.container?.roomEngine;

        if(!roomEngine) return;

        let result: ImageResult | null = null;

        switch(furnitureData.type)
        {
            case 's':
                result = roomEngine.getFurnitureIcon(furnitureData.id, this);
                break;
            case 'i':
                result = roomEngine.getWallItemIcon(furnitureData.id, this);
                break;
        }

        if(result?.data) this.imageReady(0, result.data);
    }

    // AS3: .../controller/CraftingInfoController.as::imageReady() (IGetImageListener)
    imageReady(_id: number, bitmap: ImageBitmap | null): void
    {
        this.setIconBitmapData(bitmap);
        this.alignElements();
    }

    // AS3: .../controller/CraftingInfoController.as::imageFailed() (IGetImageListener)
    imageFailed(_id: number): void
    {
        this.setIconBitmapData(null);
        this.alignElements();
    }

    // AS3: .../controller/CraftingInfoController.as::alignElements()
    // Empty in AS3 too.
    private alignElements(): void
    {
    }

    // AS3: .../controller/CraftingInfoController.as::showProgressBar()
    private showProgressBar(): void
    {
        if(!this._widget) return;

        this._widget.handler.craftingInProgress = true;
        this.setButtonVisible(false);
        this._progressBar?.show();
    }

    // AS3: .../controller/CraftingInfoController.as::cancelCrafting()
    cancelCrafting(): void
    {
        if(this._widget) this._widget.handler.craftingInProgress = false;

        this._progressBar?.hide();
        this.setButtonVisible(true);
    }

    // AS3: .../controller/CraftingInfoController.as::onProgressBarComplete()
    onProgressBarComplete(): void
    {
        this._progressBar?.hide();
        this._widget?.doCrafting();
    }

    // AS3: .../controller/CraftingInfoController.as::setIconBitmapData()
    private setIconBitmapData(bitmap: ImageBitmap | null): void
    {
        const icon = this.mainWindow?.findChildByName('furniture_icon') as IBitmapWrapperWindow | null;

        if(!icon) return;

        icon.bitmap = bitmap;
    }

    // AS3: .../controller/CraftingInfoController.as::setButtonVisible()
    private setButtonVisible(visible: boolean): void
    {
        const button = this.mainWindow?.findChildByName('btn_craft');

        if(button) button.visible = visible;
    }

    // AS3: .../controller/CraftingInfoController.as::get mainWindow()
    get mainWindow(): IWindowContainer | null
    {
        return this._widget ? this._widget.window : null;
    }
}
