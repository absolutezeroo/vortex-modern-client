import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import {OrderedMap} from '@core/utils/OrderedMap';
import {Vector3d} from '@room/utils/Vector3d';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {SellablePetPalette} from '@habbo/communication/messages/parser/catalog/SellablePetPalette';
import type {HabboCatalog} from '../../HabboCatalog';
import type {IPurchasableOffer} from '../../IPurchasableOffer';
import {CatalogWidget} from './CatalogWidget';
import {SelectProductEvent} from './events/SelectProductEvent';
import {CatalogWidgetEvent} from './events/CatalogWidgetEvent';
import {CatalogWidgetColourIndexEvent} from './events/CatalogWidgetColourIndexEvent';
import {CatalogWidgetColoursEvent} from './events/CatalogWidgetColoursEvent';
import {CatalogWidgetPurchaseOverrideEvent} from './events/CatalogWidgetPurchaseOverrideEvent';
import {CatalogWidgetApproveNameResultEvent} from './events/CatalogWidgetApproveNameResultEvent';
import {CatalogWidgetSellablePetPalettesEvent} from './events/CatalogWidgetSellablePetPalettesEvent';

const log = Logger.getLogger('PetsCatalogWidget');

/**
 * Buy-a-pet page widget for the classic pet types (type index < 8): name field, breed drop-menu,
 * colour swatches and a live rendered preview of the pet being configured.
 *
 * Pet types >= 8 are handled by NewPetsCatalogWidget instead - the two widgets split on exactly
 * that boundary and each bails out of init() for the other's range.
 *
 * TS deviation (pre-existing, architectural): `getPetImage()` returns null here where AS3 returns a
 * ready BitmapData. RoomEngine always resolves an ImageResult through the asynchronous id>0 path
 * (see ImageResult's own header: converting a PixiJS Texture to an ImageBitmap cannot be done
 * synchronously in a browser), so the rendered pet always arrives via imageReady() instead. AS3 has
 * that same async path and does the same thing in its own imageReady(), so the preview behaves
 * identically; the only visible consequence is that the image handed to showPurchaseConfirmation()
 * is null, which is moot while that argument is not displayed (see HabboCatalog's TODO there).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as
 */
export class PetsCatalogWidget extends CatalogWidget implements IGetImageListener
{
    private _offers: OrderedMap<number, IPurchasableOffer> | null = null;

    private _petTypeIndex: number = -1;

    private _paletteIndex: number = 0;

    private _colourIndex: number = 0;

    private _selectedProductCode: string = '';

    private _pendingNameApproval: boolean = false;

    private _availablePalettes: SellablePetPalette[] | null = null;

    private _availableColors: number[] = [];

    private _widgetDisposed: boolean = false;

    private _catalog: HabboCatalog | null;

    private _priceWindow: IWindow | null = null;

    private _petImageId: number = -1;

    private _nameInput: IWindow | null = null;

    constructor(window: IWindowContainer, catalog: HabboCatalog)
    {
        super(window);
        this._catalog = catalog;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as::init()
    override init(): boolean
    {
        if(!super.init()) return false;

        this._pendingNameApproval = false;

        this._nameInput = this.window.findChildByName('name_input_text');

        if(this._nameInput == null) return false;

        this._nameInput.caption = '';

        this._offers = new OrderedMap<number, IPurchasableOffer>();

        if(this.page.offers.length === 0) return false;

        const offer = this.page.offers[0]!;

        this._petTypeIndex = PetsCatalogWidget.getPetTypeIndexFromProduct(offer.localizationId);

        if(this._petTypeIndex >= 8) return false;

        this.updateAvailablePalettes(offer.localizationId);
        this._selectedProductCode = offer.localizationId;
        this.updateAvailableColors();
        this._offers.add(this._petTypeIndex, offer);

        this.events.on(SelectProductEvent.SELECT_PRODUCT, this.onSelectProduct);
        this.events.on(CatalogWidgetColourIndexEvent.COLOUR_INDEX, this.onColourIndex);
        this.events.on(CatalogWidgetApproveNameResultEvent.CWE_APPROVE_RESULT, this.onApproveNameResult);
        this.events.on(CatalogWidgetEvent.WIDGETS_INITIALIZED, this.onWidgetsInitialized);
        this.events.on(CatalogWidgetSellablePetPalettesEvent.SELLABLE_PET_PALETTES, this.onSellablePetPalettes);

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as::updateAvailableColors()
    // Colour tables are literal in AS3 (types 0 and 1 genuinely share the same 40-colour table).
    private updateAvailableColors(): void
    {
        switch(this._petTypeIndex)
        {
            case 0:
            case 1:
                this._availableColors = [
                    16743226, 16750435, 16764339, 16094464, 16498012, 16704690, 15586304, 16115545,
                    16513201, 8694111, 11585939, 14413767, 6664599, 9553845, 12971486, 8358322,
                    10002885, 13292268, 10780600, 12623573, 14403561, 12418717, 14327229, 15517403,
                    14515069, 15764368, 16366271, 11250603, 13948116, 16777215, 14256481, 14656129,
                    15848130, 14005087, 14337152, 15918540, 15118118, 15531929, 9764857, 11258085
                ];
                break;
            case 2:
                this._availableColors = [
                    16579283, 15378351, 8830016, 15257125, 9340985, 8949607, 6198292, 8703620,
                    9889626, 8972045, 12161285, 13162269, 8620113, 12616503, 8628101, 13827840,
                    9764857
                ];
                break;
            case 3:
            case 5:
                this._availableColors = [16777215, 15658734, 14540253];
                break;
            case 4:
                this._availableColors = [16777215, 16053490, 15464440, 16248792, 15396319, 15007487];
                break;
            case 6:
                this._availableColors = [16777215, 15658734, 14540253, 16767177, 16770205, 16751331];
                break;
            case 7:
                this._availableColors = [13421772, 11447982, 16751331, 10149119, 16763290, 16743786];
                break;
            default:
                this._availableColors = [];
                break;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as::onWidgetsInitialized()
    private onWidgetsInitialized = (_event: CatalogWidgetEvent | null = null): void =>
    {
        if(this._widgetDisposed) return;

        this.events.emit(CatalogWidgetPurchaseOverrideEvent.PURCHASE_OVERRIDE, new CatalogWidgetPurchaseOverrideEvent(this.onPurchase));

        const offer = this._offers?.getWithIndex(0) ?? null;

        if(offer != null) this.events.emit(SelectProductEvent.SELECT_PRODUCT, new SelectProductEvent(offer));

        this.events.emit(
            CatalogWidgetColoursEvent.COLOUR_ARRAY,
            new CatalogWidgetColoursEvent(this._availableColors.slice(), 'ctlg_clr_27x22_1', 'ctlg_clr_27x22_2', 'ctlg_clr_27x22_3')
        );
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as::onPurchase()
    // AS3 only logs on a pending approval and falls through rather than returning - preserved.
    private onPurchase = (_event: unknown): void =>
    {
        if(this._pendingNameApproval) log.debug('* Cannot buy a pet, pending previous name approval.');

        if(this.getPurchaseParameters() === '') return;

        this._pendingNameApproval = true;
        this._catalog?.approveName(this._nameInput?.caption ?? '', 1);
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as::onDropMenuEvent()
    private onDropMenuEvent = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WE_SELECTED') return;

        const selection = (window as unknown as IDropMenuWindow).selection;

        if(this._availablePalettes == null || selection >= this._availablePalettes.length) return;

        this._paletteIndex = selection;
        this.updateImage();
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as::onSelectProduct()
    private onSelectProduct = (event: SelectProductEvent): void =>
    {
        if(event == null) return;

        this.updateImage();
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as::onColourIndex()
    // AS3's bound check is `> length` (not `>=`) - preserved; getPetImage()/getPurchaseParameters()
    // both re-check properly, so the off-by-one never reaches an out-of-range read.
    private onColourIndex = (event: CatalogWidgetColourIndexEvent): void =>
    {
        if(event == null) return;

        this._colourIndex = event.index;

        if(this._colourIndex < 0 || this._colourIndex > this._availableColors.length) this._colourIndex = 0;

        this.updateImage();
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as::onApproveNameResult()
    private onApproveNameResult = (event: CatalogWidgetApproveNameResultEvent): void =>
    {
        if(event == null || !this._pendingNameApproval) return;

        this._pendingNameApproval = false;

        const nameValidationInfo = event.nameValidationInfo ?? '';

        if(event.result !== 0) this._catalog?.purchaseWillBeGift(false);

        switch(event.result - 1)
        {
            case 0:
                this.showNameError('long', nameValidationInfo);

                return;
            case 1:
                this.showNameError('short', nameValidationInfo);

                return;
            case 2:
                this.showNameError('chars', nameValidationInfo);

                return;
            case 3:
                this.showNameError('bobba', nameValidationInfo);

                return;
            default:
            {
                const extraParameter = this.getPurchaseParameters();

                if(extraParameter === '')
                {
                    log.debug('* Not enough information to buy a pet!');

                    return;
                }

                log.debug(`* Will buy pet as ${extraParameter}`);

                const offer = this._offers?.getWithIndex(0) ?? null;

                if(offer == null) return;

                this._catalog?.showPurchaseConfirmation(offer, this.page.pageId, extraParameter, 1, null, null, true, this.getPetImage());

                return;
            }
        }
    };

    private showNameError(key: string, nameValidationInfo: string): void
    {
        this._catalog?.windowManager?.alert(
            '${catalog.alert.purchaseerror.title}',
            this.constructErrorMessage(key, nameValidationInfo),
            0,
            (dialog) => dialog.dispose()
        );
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as::constructErrorMessage()
    private constructErrorMessage(key: string, nameValidationInfo: string): string
    {
        const localization = this._catalog?.localization;
        const baseKey = `catalog.alert.petname.${key}`;
        const additionalKey = `${baseKey}.additionalInfo`;

        localization?.registerParameter(additionalKey, 'additional_info', nameValidationInfo);

        let message = localization?.getLocalization(baseKey) ?? '';
        const additional = localization?.getLocalization(additionalKey) ?? '';

        if(nameValidationInfo != null && nameValidationInfo.length > 0 && additional != null && additional.length > 0) message = additional;

        return message;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as::onSellablePetPalettes()
    private onSellablePetPalettes = (event: CatalogWidgetSellablePetPalettesEvent): void =>
    {
        if(event.productCode !== this._selectedProductCode) return;

        this._availablePalettes = this.parseSellablePalettes(event.sellablePalettes);

        this._paletteIndex = 0;
        this.updatePaletteSelections();
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as::parseSellablePalettes()
    private parseSellablePalettes(palettes: SellablePetPalette[] | null): SellablePetPalette[] | null
    {
        if(!palettes) return null;

        return palettes.filter((palette) => palette.type === this._petTypeIndex && palette.sellable);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as::updatePaletteSelections()
    private updatePaletteSelections(): void
    {
        if(this._availablePalettes == null) return;

        const localization = this._catalog?.localization;
        const captions: string[] = [];

        for(const palette of this._availablePalettes)
        {
            const key = PetsCatalogWidget.getRaceLocalizationKey(this._petTypeIndex, palette.breedId);

            captions.push(localization?.getLocalization(key, key) ?? key);
        }

        const dropMenu = this.window.findChildByName('type_drop_menu') as unknown as IDropMenuWindow | null;

        if(dropMenu == null) return;

        if(captions.length > 1)
        {
            dropMenu.populateWithStrings(captions);
            dropMenu.selection = 0;
            (dropMenu as unknown as IWindow).procedure = this.onDropMenuEvent;
            dropMenu.visible = true;
        }
        else
        {
            dropMenu.visible = false;
        }

        this.updateImage();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as::getPetImage()
    private getPetImage(): ImageBitmap | null
    {
        const offer = this._offers?.getWithIndex(0) ?? null;

        if(offer == null) return null;

        if(this._availablePalettes == null || this._paletteIndex >= this._availablePalettes.length) return null;

        let color = 16777215;

        if(this._colourIndex >= 0 && this._colourIndex < this._availableColors.length) color = this._availableColors[this._colourIndex]!;

        const palette = this._availablePalettes[this._paletteIndex]!;
        const result = this._catalog?.roomEngine?.getPetImage(this._petTypeIndex, palette.paletteId, color, new Vector3d(90, 0, 0), 64, this) ?? null;

        if(result != null)
        {
            this._petImageId = result.id;

            return result.data;
        }

        return null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as::updateImage()
    private updateImage(): void
    {
        const offer = this._offers?.getWithIndex(0) ?? null;

        if(offer == null || this._paletteIndex < 0) return;

        const image = this.getPetImage();

        if(image != null) this.setPreviewImage(image, true);

        const teaser = this.window.findChildByName('ctlg_teaserimg_1');

        this._priceWindow = this._catalog?.utils?.showPriceOnProduct(offer, this._window, this._priceWindow, teaser, -6, false, 6) ?? null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as::getPurchaseParameters()
    private getPurchaseParameters(): string
    {
        const name = this._nameInput?.caption ?? '';

        if(name == null || name.length === 0)
        {
            this._catalog?.windowManager?.alert(
                '${catalog.alert.purchaseerror.title}',
                '${catalog.alert.petname.empty}',
                0,
                (dialog) => dialog.dispose()
            );

            return '';
        }

        if(this._availablePalettes == null || this._paletteIndex >= this._availablePalettes.length) return '';

        if(this._colourIndex >= this._availableColors.length) return '';

        const color = this._availableColors[this._colourIndex]!;
        const palette = this._availablePalettes[this._paletteIndex]!;

        return `${name}\n${palette.paletteId}\n${PetsCatalogWidget.addZeroPadding(color.toString(16).toUpperCase(), 6)}`;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as::setPreviewImage()
    // AS3 builds this by hand out of BitmapData (fillRect to a fully transparent 0x00FFFFFF, then a
    // 2x Matrix draw copyPixels'd into the centre); the port composites the same result onto an
    // OffscreenCanvas and hands the wrapper an ImageBitmap, matching ColourGridCatalogWidget's
    // established recipe. `dispose` closes the source, mirroring AS3's BitmapData.dispose().
    private setPreviewImage(image: ImageBitmap | null, dispose: boolean): void
    {
        if(!this.window.disposed)
        {
            const wrapper = this.window.findChildByName('ctlg_teaserimg_1') as unknown as IBitmapWrapperWindow | null;

            if(wrapper != null && image != null)
            {
                const scale = 2;
                const canvas = new OffscreenCanvas(wrapper.width, wrapper.height);
                const ctx = canvas.getContext('2d')!;

                ctx.imageSmoothingEnabled = false;

                const width = image.width * scale;
                const height = image.height * scale;

                ctx.drawImage(image, (wrapper.width - width) / 2, (wrapper.height - height) / 2, width, height);

                wrapper.bitmap = canvas.transferToImageBitmap();
                wrapper.invalidate();
            }
        }

        if(dispose) image?.close();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as::getPetTypeIndexFromProduct()
    // Walks back over the trailing digits of e.g. "a0 pet2" and parses them as the type index.
    //
    // The empty-digits case must return 0, not NaN: AS3 ends on `int(param1.substring(...))`, and
    // `int("")` is 0 in ActionScript where `parseInt("")` is NaN in JS. Getting this wrong is not
    // cosmetic - a NaN type satisfies neither `>= 8` (this widget's bail-out) nor `< 8`
    // (NewPetsCatalogWidget's), so *both* widgets would survive init() on the same page and then
    // silently render nothing: switch(NaN) yields no colours, `palette.type === NaN` matches no
    // palette, so the preview stays empty and the buy button can never assemble its parameters.
    private static getPetTypeIndexFromProduct(localizationId: string): number
    {
        if(localizationId.length === 0) return 0;

        let index = localizationId.length - 1;

        while(index >= 0)
        {
            if(isNaN(parseInt(localizationId.charAt(index)))) break;

            index--;
        }

        if(index > 0)
        {
            const digits = localizationId.substring(index + 1);

            return digits.length === 0 ? 0 : parseInt(digits);
        }

        return -1;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as::getRaceLocalizationKey()
    private static getRaceLocalizationKey(petType: number, breedId: number): string
    {
        return `pet.breed.${petType}.${breedId}`;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as::addZeroPadding()
    private static addZeroPadding(value: string, length: number): string
    {
        return value.padStart(length, '0');
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as::updateAvailablePalettes()
    // getSellablePetPalettes() returns null on a cache miss and fires the request; the response
    // comes back through onSellablePetPalettes().
    private updateAvailablePalettes(productCode: string): void
    {
        if(this._availablePalettes != null) return;

        const palettes = this._catalog?.getSellablePetPalettes(productCode) ?? null;

        this._availablePalettes = this.parseSellablePalettes(palettes);
        this._paletteIndex = 0;

        if(this._availablePalettes != null) this.updatePaletteSelections();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as::imageReady()
    imageReady(id: number, data: ImageBitmap | null): void
    {
        if(this.disposed) return;

        if(id !== this._petImageId) return;

        this.setPreviewImage(data, true);
        this.onWidgetsInitialized();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as::imageFailed()
    imageFailed(_id: number): void
    {
        // which is exactly why an asset failure here is otherwise completely silent.
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetsCatalogWidget.as::dispose()
    override dispose(): void
    {
        if(this._widgetDisposed) return;

        this._pendingNameApproval = false;

        this.events.off(SelectProductEvent.SELECT_PRODUCT, this.onSelectProduct);
        this.events.off(CatalogWidgetColourIndexEvent.COLOUR_INDEX, this.onColourIndex);
        this.events.off(CatalogWidgetApproveNameResultEvent.CWE_APPROVE_RESULT, this.onApproveNameResult);
        this.events.off(CatalogWidgetEvent.WIDGETS_INITIALIZED, this.onWidgetsInitialized);
        this.events.off(CatalogWidgetSellablePetPalettesEvent.SELLABLE_PET_PALETTES, this.onSellablePetPalettes);

        this._offers?.dispose();
        this._offers = null;
        this._availablePalettes = null;
        this._availableColors = [];
        this._catalog = null;
        this._priceWindow = null;
        this._nameInput = null;

        super.dispose();

        this._widgetDisposed = true;
    }
}
