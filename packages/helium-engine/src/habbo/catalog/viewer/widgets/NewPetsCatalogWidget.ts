import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import {Logger} from '@core/utils/Logger';
import {OrderedMap} from '@core/utils/OrderedMap';
import {Vector3d} from '@room/utils/Vector3d';
import {PetCustomPart} from '@habbo/avatar/pets/PetCustomPart';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {SellablePetPalette} from '@habbo/communication/messages/parser/catalog/SellablePetPalette';
import type {HabboCatalog} from '../../HabboCatalog';
import type {IPurchasableOffer} from '../../IPurchasableOffer';
import {CatalogWidget} from './CatalogWidget';
import {SelectProductEvent} from './events/SelectProductEvent';
import {CatalogWidgetEvent} from './events/CatalogWidgetEvent';
import {CatalogWidgetColourIndexEvent} from './events/CatalogWidgetColourIndexEvent';
import {CatalogWidgetMultiColoursEvent} from './events/CatalogWidgetMultiColoursEvent';
import {CatalogWidgetPurchaseOverrideEvent} from './events/CatalogWidgetPurchaseOverrideEvent';
import {CatalogWidgetApproveNameResultEvent} from './events/CatalogWidgetApproveNameResultEvent';
import {CatalogWidgetSellablePetPalettesEvent} from './events/CatalogWidgetSellablePetPalettesEvent';

const log = Logger.getLogger('NewPetsCatalogWidget');

/**
 * Buy-a-pet page widget for the newer pet types (type index >= 8): name field, per-breed colour
 * swatches driven by each palette's own primary/secondary colour, and a live rendered preview.
 *
 * Pet types < 8 are handled by PetsCatalogWidget instead - the two widgets split on exactly that
 * boundary and each bails out of init() for the other's range. Unlike PetsCatalogWidget this one
 * has no breed drop-menu (the swatches select the breed) and no user-chosen colour: the purchase
 * always sends white, with the palette carrying the actual colouring.
 *
 * TS deviation (pre-existing, architectural): see PetsCatalogWidget's header - getPetImage()
 * returns null here for the same ImageResult async reason, and the preview arrives via imageReady().
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as
 */
export class NewPetsCatalogWidget extends CatalogWidget implements IGetImageListener
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::MAX_PALETTES
    // AS3 declares this constant but inlines the literal 20 at its only use site in
    // initializePaletteSelection(); the constant is used here instead - behaviourally identical.
    private static readonly MAX_PALETTES: number = 20;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::NORMAL_SIZE_PETS
    private static readonly NORMAL_SIZE_PETS: number[] = [15];

    private _offers: OrderedMap<number, IPurchasableOffer> | null = null;

    private _nameInput: IWindow | null = null;

    private _petTypeIndex: number = -1;

    private _paletteIndex: number = -1;

    private _selectedProductCode: string = '';

    private _pendingNameApproval: boolean = false;

    private _widgetDisposed: boolean = false;

    private _availablePalettes: SellablePetPalette[] | null = null;

    private _catalog: HabboCatalog | null;

    private _priceWindow: IWindow | null = null;

    private _petImageId: number = -1;

    constructor(window: IWindowContainer, catalog: HabboCatalog)
    {
        super(window);
        this._catalog = catalog;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::init()
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

        this._petTypeIndex = NewPetsCatalogWidget.getPetTypeIndexFromProduct(offer.localizationId);

        if(this._petTypeIndex < 8) return false;

        this._selectedProductCode = offer.localizationId;
        this.updateAvailablePalettes(offer.localizationId);

        this._paletteIndex = (this._availablePalettes != null && this._availablePalettes.length > 0) ? 0 : -1;

        this._offers.add(this._petTypeIndex, offer);

        this.events.on(SelectProductEvent.SELECT_PRODUCT, this.onSelectProduct);
        this.events.on(CatalogWidgetColourIndexEvent.COLOUR_INDEX, this.onColourIndex);
        this.events.on(CatalogWidgetApproveNameResultEvent.CWE_APPROVE_RESULT, this.onApproveNameResult);
        this.events.on(CatalogWidgetEvent.WIDGETS_INITIALIZED, this.onWidgetsInitialized);
        this.events.on(CatalogWidgetSellablePetPalettesEvent.SELLABLE_PET_PALETTES, this.onSellablePetPalettes);

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::onWidgetsInitialized()
    private onWidgetsInitialized = (_event: CatalogWidgetEvent | null = null): void =>
    {
        if(this._widgetDisposed) return;

        this.events.emit(CatalogWidgetPurchaseOverrideEvent.PURCHASE_OVERRIDE, new CatalogWidgetPurchaseOverrideEvent(this.onPurchase));

        const offer = this._offers?.getWithIndex(0) ?? null;

        if(offer != null) this.events.emit(SelectProductEvent.SELECT_PRODUCT, new SelectProductEvent(offer));

        this.initializePaletteSelection();
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::initializePaletteSelection()
    // One swatch per palette, coloured from that palette's own primary/secondary pair; a palette
    // whose two colours match collapses to a single-colour swatch.
    private initializePaletteSelection(): void
    {
        if(this._availablePalettes == null) return;

        const swatches: number[][] = [];
        const limit = Math.min(NewPetsCatalogWidget.MAX_PALETTES, this._availablePalettes.length);

        for(let i = 0; i < limit; i++)
        {
            const palette = this._availablePalettes[i]!;
            const color = this._catalog?.roomEngine?.getPetColor(this._petTypeIndex, palette.paletteId) ?? null;

            if(color == null) continue;

            if(color.primaryColor === color.secondaryColor) swatches.push([color.primaryColor]);
            else swatches.push([color.primaryColor, color.secondaryColor]);
        }

        this.events.emit(
            CatalogWidgetMultiColoursEvent.MULTI_COLOUR_ARRAY,
            new CatalogWidgetMultiColoursEvent(swatches, 'ctlg_clr_27x22_1', 'ctlg_clr_27x22_2', 'ctlg_clr_27x22_3')
        );
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::onColourIndex()
    private onColourIndex = (event: CatalogWidgetColourIndexEvent): void =>
    {
        if(event == null) return;

        this.selectedPalette(event.index);
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::selectedPalette()
    // AS3's bound check is `> length` (not `>=`) - preserved; getPetImage() re-checks properly.
    private selectedPalette(index: number): void
    {
        if(this._availablePalettes == null || this._availablePalettes.length === 0) return;

        if(index < 0 || index > this._availablePalettes.length) index = 0;

        this._paletteIndex = index;
        this.updateImage();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::getPetLocalization()
    private getPetLocalization(): string
    {
        if(this._paletteIndex < 0 || this._availablePalettes == null) return '';

        const palette = this._availablePalettes[this._paletteIndex];

        if(palette == null) return '';

        const key = NewPetsCatalogWidget.getRaceLocalizationKey(this._petTypeIndex, palette.breedId);

        if(this.page != null && this.page.viewer != null && this._catalog != null && this._catalog.localization != null)
        {
            return this._catalog.localization.getLocalization(key, key);
        }

        return key;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::onPurchase()
    // AS3 only logs on a pending approval and falls through rather than returning - preserved.
    private onPurchase = (_event: unknown): void =>
    {
        if(this._pendingNameApproval) log.debug('* Cannot buy a pet, pending previous name approval.');

        if(this.getPurchaseParameters() === '') return;

        const name = this._nameInput?.caption ?? '';

        this._pendingNameApproval = true;
        this._catalog?.approveName(name, 1);
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::onSelectProduct()
    private onSelectProduct = (event: SelectProductEvent): void =>
    {
        if(event == null) return;

        this.updateImage();
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::onApproveNameResult()
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::constructErrorMessage()
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::onSellablePetPalettes()
    private onSellablePetPalettes = (event: CatalogWidgetSellablePetPalettesEvent): void =>
    {
        if(event.productCode !== this._selectedProductCode) return;

        this._availablePalettes = this.parseSellablePalettes(event.sellablePalettes);
        this.initializePaletteSelection();
        this.selectedPalette(0);
        this.updateImage();
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::parseSellablePalettes()
    private parseSellablePalettes(palettes: SellablePetPalette[] | null): SellablePetPalette[] | null
    {
        if(!palettes) return null;

        return palettes.filter((palette) => palette.type === this._petTypeIndex && palette.sellable);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::getPetImage()
    // Pet type 15 (the monsterplant) is composed from two default-palette custom parts (hair/tail);
    // AS3's switch has that single case and no default, so every other type renders with no parts.
    private getPetImage(): ImageBitmap | null
    {
        const offer = this._offers?.getWithIndex(0) ?? null;

        if(offer == null || this._paletteIndex < 0 || this._availablePalettes == null) return null;

        const palette = this._availablePalettes[this._paletteIndex];

        if(palette == null) return null;

        const roomEngine = this._catalog?.roomEngine ?? null;

        if(roomEngine == null) return null;

        const isNormalSize = NewPetsCatalogWidget.NORMAL_SIZE_PETS.indexOf(this._petTypeIndex) === -1;
        const direction = isNormalSize ? new Vector3d(135) : new Vector3d(90);
        let customParts: PetCustomPart[] = [];

        if(this._petTypeIndex === 15)
        {
            const hairLayer = roomEngine.getPetLayerIdForTag(this._petTypeIndex, 'hair');
            const tailLayer = roomEngine.getPetLayerIdForTag(this._petTypeIndex, 'tail');
            const hairPalette = roomEngine.getPetDefaultPalette(this._petTypeIndex, 'hair');
            const tailPalette = roomEngine.getPetDefaultPalette(this._petTypeIndex, 'tail');

            customParts = [
                new PetCustomPart(hairLayer, -1, hairPalette ? parseInt(hairPalette.id) : -1),
                new PetCustomPart(tailLayer, -1, tailPalette ? parseInt(tailPalette.id) : -1)
            ];
        }

        const result = roomEngine.getPetImage(this._petTypeIndex, palette.paletteId, 16777215, direction, 64, this, true, 0, customParts);

        if(result != null)
        {
            this._petImageId = result.id;

            return result.data;
        }

        return null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::updateImage()
    private updateImage(): void
    {
        const offer = this._offers?.getWithIndex(0) ?? null;

        if(offer == null || this._paletteIndex < 0) return;

        const image = this.getPetImage();

        if(image != null) this.setPreviewImage(image, true);

        const teaser = this.window.findChildByName('ctlg_teaserimg_1');

        this._priceWindow = this._catalog?.utils?.showPriceOnProduct(offer, this._window, this._priceWindow, teaser, -6, false, 6) ?? null;

        const breedText = this._window.findChildByName('pet_breed_text');

        if(breedText) breedText.caption = this.getPetLocalization();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::getPurchaseParameters()
    // The colour is hardcoded white: on these pet types the palette carries the colouring, so
    // unlike PetsCatalogWidget there is no user-selected colour to encode.
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

        if(this._paletteIndex < 0 || this._availablePalettes == null) return '';

        const palette = this._availablePalettes[this._paletteIndex];

        if(palette == null) return '';

        const color = 16777215;

        return `${name}\n${palette.paletteId}\n${NewPetsCatalogWidget.addZeroPadding(color.toString(16).toUpperCase(), 6)}`;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::setPreviewImage()
    // Same BitmapData-to-OffscreenCanvas recipe as PetsCatalogWidget, except the 2x upscale only
    // applies to the non-"normal size" pets - type 15 renders at 1x.
    private setPreviewImage(image: ImageBitmap | null, dispose: boolean): void
    {
        if(!this.window.disposed)
        {
            const wrapper = this.window.findChildByName('ctlg_teaserimg_1') as unknown as IBitmapWrapperWindow | null;

            if(wrapper != null && image != null)
            {
                const scale = NewPetsCatalogWidget.NORMAL_SIZE_PETS.indexOf(this._petTypeIndex) === -1 ? 2 : 1;
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::getPetTypeIndexFromProduct()
    // The empty-digits case returns 0, matching AS3's `int("")` rather than JS's `parseInt("")`
    // NaN - see PetsCatalogWidget's copy of this method for why a NaN here breaks both widgets.
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::getRaceLocalizationKey()
    private static getRaceLocalizationKey(petType: number, breedId: number): string
    {
        return `pet.breed.${petType}.${breedId}`;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::addZeroPadding()
    private static addZeroPadding(value: string, length: number): string
    {
        return value.padStart(length, '0');
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::updateAvailablePalettes()
    // Unlike PetsCatalogWidget's version this one does not call updatePaletteSelections() - the
    // swatches are built later from onWidgetsInitialized()/onSellablePetPalettes() instead.
    private updateAvailablePalettes(productCode: string): void
    {
        if(this._availablePalettes != null) return;

        const palettes = this._catalog?.getSellablePetPalettes(productCode) ?? null;

        this._availablePalettes = this.parseSellablePalettes(palettes);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::imageReady()
    imageReady(id: number, data: ImageBitmap | null): void
    {
        if(this.disposed) return;

        if(id !== this._petImageId) return;

        this.setPreviewImage(data, true);
        this.onWidgetsInitialized();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::imageFailed()
    imageFailed(_id: number): void
    {
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/NewPetsCatalogWidget.as::dispose()
    override dispose(): void
    {
        if(this._widgetDisposed) return;

        this._pendingNameApproval = false;

        this.events.off(SelectProductEvent.SELECT_PRODUCT, this.onSelectProduct);
        this.events.off(CatalogWidgetColourIndexEvent.COLOUR_INDEX, this.onColourIndex);
        this.events.off(CatalogWidgetApproveNameResultEvent.CWE_APPROVE_RESULT, this.onApproveNameResult);
        this.events.off(CatalogWidgetEvent.WIDGETS_INITIALIZED, this.onWidgetsInitialized);
        this.events.off(CatalogWidgetSellablePetPalettesEvent.SELLABLE_PET_PALETTES, this.onSellablePetPalettes);

        if(this._offers != null)
        {
            this._offers.dispose();
            this._offers = null;
        }

        this._availablePalettes = null;
        this._catalog = null;
        this._priceWindow = null;
        this._nameInput = null;

        super.dispose();

        this._widgetDisposed = true;
    }
}
