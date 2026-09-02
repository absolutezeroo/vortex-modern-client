import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {AssetLoaderStruct} from '@core/assets/AssetLoaderStruct';
import type {BitmapDataAsset} from '@core/assets/BitmapDataAsset';
import {AssetLoaderEvent} from '@core/assets/loaders/AssetLoaderEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {OrderedMap} from '@core/utils/OrderedMap';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import {Vector3d} from '@room/utils/Vector3d';
import type {HabboCatalog} from '../../HabboCatalog';
import type {Offer} from '../Offer';
import {CatalogProductImages} from '../CatalogProductImages';
import {CatalogWidgetColourIndexEvent} from './events/CatalogWidgetColourIndexEvent';
import {CatalogWidgetColoursEvent} from './events/CatalogWidgetColoursEvent';
import {CatalogWidgetEvent} from './events/CatalogWidgetEvent';
import {SelectProductEvent} from './events/SelectProductEvent';
import {SetExtraPurchaseParameterEvent} from './events/SetExtraPurchaseParameterEvent';
import {TextInputEvent} from './events/TextInputEvent';
import {CatalogWidget} from './CatalogWidget';

/**
 * The trophy page. A trophy comes in gold, silver and bronze — three separate offers whose
 * localization ids differ only by a trailing `_g`/`_s`/`_b` — so the widget re-buckets the page's
 * flat offer list into one map per trophy model, keyed by that suffix. The prev/next buttons walk
 * the models, and the colour grid (which this widget populates with the three metal colours)
 * picks the finish within the current one.
 *
 * The engraving is a plain text input whose contents become the purchase's extra parameter.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as
 */
export class TrophyCatalogWidget extends CatalogWidget implements IGetImageListener
{
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::gold
    private static readonly GOLD: number = 16763904;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::silver
    private static readonly SILVER: number = 13421772;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::bronze
    private static readonly BRONZE: number = 13395456;

    // The `ctlg_teaserimg_1` preview slot. Name DERIVED — `_SafeStr_4699` is obfuscated everywhere.
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::_SafeStr_4699
    private _previewImage: IBitmapWrapperWindow | null = null;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::_trophyOffers
    private _trophyOffers: OrderedMap<string, OrderedMap<string, Offer>> | null = null;

    // Which trophy model is on screen. Name DERIVED — `_SafeStr_5016`.
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::_SafeStr_5016
    private _modelIndex: number = 0;

    // The chosen finish, "g" / "s" / "b". Name DERIVED — `_SafeStr_5825`.
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::_SafeStr_5825
    private _trophyType: string = 'g';

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::_catalog
    private _catalog: HabboCatalog | null;

    // The price box `showPriceOnProduct()` hands back to be reused. Name DERIVED — `_SafeStr_5454`.
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::_SafeStr_5454
    private _priceBox: IWindow | null = null;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::TrophyCatalogWidget()
    constructor(window: IWindowContainer, catalog: HabboCatalog)
    {
        super(window);

        this._catalog = catalog;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::init()
    override init(): boolean
    {
        if(!super.init()) return false;

        this._previewImage = this.window.findChildByName('ctlg_teaserimg_1') as unknown as IBitmapWrapperWindow | null;

        this.events.on(SelectProductEvent.SELECT_PRODUCT, this.onSelectProduct);
        this.events.on(CatalogWidgetColourIndexEvent.COLOUR_INDEX, this.onColourIndex);
        this.events.on(TextInputEvent.TEXT_INPUT, this.onTextInput);

        const nextButton = this.window.findChildByName('ctlg_nextmodel_button');
        const prevButton = this.window.findChildByName('ctlg_prevmodel_button');

        nextButton?.addEventListener(WindowMouseEvent.CLICK, this.onClickNext);
        prevButton?.addEventListener(WindowMouseEvent.CLICK, this.onClickPrev);

        this._trophyOffers = new OrderedMap<string, OrderedMap<string, Offer>>();

        for(const offer of this.page.offers as Offer[])
        {
            const baseName = TrophyCatalogWidget.getBaseNameFromProduct(offer.localizationId);
            const trophyType = TrophyCatalogWidget.getTrophyTypeFromProduct(offer.localizationId);

            if(this._trophyOffers.getValue(baseName) == null)
            {
                this._trophyOffers.add(baseName, new OrderedMap<string, Offer>());
            }

            this._trophyOffers.getValue(baseName)?.add(trophyType, offer);
        }

        if(this.page.offers.length === 1)
        {
            // AS3 dereferences both buttons here without a null check, having guarded them above.
            if(nextButton) nextButton.visible = false;
            if(prevButton) prevButton.visible = false;

            if(this.page.offers[0].product?.isColorable === false)
            {
                const parent = this.window.parent as unknown as IWindowContainer | null;
                const colourGrid = parent?.findChildByName('colourGridWidget');

                if(colourGrid) colourGrid.visible = false;
            }
        }

        this.events.on(CatalogWidgetEvent.WIDGETS_INITIALIZED, this.onWidgetsInitialized);

        return true;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::onWidgetsInitialized()
    private onWidgetsInitialized = (_event: CatalogWidgetEvent): void =>
    {
        this.selectCurrentOffer();

        this.events.emit(
            CatalogWidgetColoursEvent.COLOUR_ARRAY,
            new CatalogWidgetColoursEvent(
                [TrophyCatalogWidget.GOLD, TrophyCatalogWidget.SILVER, TrophyCatalogWidget.BRONZE],
                'ctlg_clr_40x32_1',
                'ctlg_clr_40x32_2',
                'ctlg_clr_40x32_3'
            )
        );
    };

    /**
     * The four-line "take the current model, take the chosen finish or fall back to its first
     * offer, announce it" block AS3 repeats verbatim in `onWidgetsInitialized`, `onColourIndex`,
     * `onClickNext` and `onClickPrev`. Returns the offer it announced, because `onColourIndex`
     * goes on to price it.
     */
    // TS-only: the shape is AS3's, factored out of its four copies.
    private selectCurrentOffer(): Offer | null
    {
        const model = this._trophyOffers?.getWithIndex(this._modelIndex);

        if(model == null) return null;

        const offer = model.getValue(this._trophyType) ?? model.getWithIndex(0);

        if(offer != null) this.events.emit(SelectProductEvent.SELECT_PRODUCT, new SelectProductEvent(offer));

        return offer;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::onSelectProduct()
    private onSelectProduct = (event: SelectProductEvent): void =>
    {
        if(event == null) return;

        const offer = event.offer as Offer;

        if(CatalogProductImages.hasProductImage(offer.localizationId))
        {
            this.setPreviewFromAsset(CatalogProductImages.PRODUCT_IMAGES[offer.localizationId]);
        }
        else
        {
            const product = offer.product;
            const result = this.page.viewer.roomEngine.getFurnitureImage(
                product!.productClassId,
                new Vector3d(2, 0, 0),
                64,
                this,
                0,
                product!.extraParam
            );

            offer.previewCallbackId = result.id;
            this.setPreviewImage(result.data, true);
        }

        this._priceBox = this._catalog!.utils.showPriceOnProduct(
            offer, this._window, this._priceBox, this._previewImage as unknown as IWindow | null, 0, false, 0
        );
    };

    /**
     * AS3 prices `_loc3_` here, which is the offer only when the model lookup succeeded — on a
     * miss it is still null and `showPriceOnProduct()` is called with it. The port keeps that call
     * conditional instead, because the port's utility dereferences its offer where Flash's tolerated
     * the null.
     */
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::onColourIndex()
    private onColourIndex = (event: CatalogWidgetColourIndexEvent): void =>
    {
        if(event.index === 0) this._trophyType = 'g';
        if(event.index === 1) this._trophyType = 's';
        if(event.index === 2) this._trophyType = 'b';

        const offer = this.selectCurrentOffer();

        if(offer != null)
        {
            this._priceBox = this._catalog!.utils.showPriceOnProduct(
                offer, this._window, this._priceBox, this._previewImage as unknown as IWindow | null, 0, false, 0
            );
        }
    };

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::onTextInput()
    onTextInput = (event: TextInputEvent): void =>
    {
        this.events.emit(
            SetExtraPurchaseParameterEvent.CWE_SET_EXTRA_PARM,
            new SetExtraPurchaseParameterEvent(event.text)
        );
    };

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::imageReady()
    imageReady(id: number, data: ImageBitmap | null): void
    {
        if(this.disposed || this.page == null || this.page.offers == null) return;

        for(const offer of this.page.offers as Offer[])
        {
            if(offer.previewCallbackId === id)
            {
                offer.previewCallbackId = 0;
                this.setPreviewImage(data, true);
                break;
            }
        }
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::imageFailed()
    imageFailed(_id: number): void
    {
    }

    /**
     * `prizetrophy_2011_*` is excluded by name: those ids end in a year segment, not a metal, and
     * the `_2011` would otherwise be read as a finish suffix.
     */
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::getTrophyTypeFromProduct()
    private static getTrophyTypeFromProduct(localizationId: string): string
    {
        if(localizationId.indexOf('prizetrophy_2011_') !== -1) return '';

        const start = localizationId.lastIndexOf('_') + 1;

        if(start <= 0) return '';

        const suffix = localizationId.substr(start);

        if(suffix.length > 1 || (suffix !== 'g' && suffix !== 's' && suffix !== 'b')) return '';

        return suffix;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::getBaseNameFromProduct()
    private static getBaseNameFromProduct(localizationId: string): string
    {
        const trophyType = TrophyCatalogWidget.getTrophyTypeFromProduct(localizationId);

        if(trophyType.length > 0) return localizationId.slice(0, localizationId.length - 1 - trophyType.length);

        return localizationId;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::onClickNext()
    private onClickNext = (_event: WindowMouseEvent): void =>
    {
        this._modelIndex++;

        if(this._modelIndex >= (this._trophyOffers?.length ?? 0)) this._modelIndex = 0;

        this.selectCurrentOffer();
    };

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::onClickPrev()
    private onClickPrev = (_event: WindowMouseEvent): void =>
    {
        this._modelIndex--;

        if(this._modelIndex < 0) this._modelIndex = (this._trophyOffers?.length ?? 1) - 1;

        this.selectCurrentOffer();
    };

    /**
     * AS3 substitutes a 1x1 bitmap for a null image so the slot is cleared rather than left
     * showing the previous trophy; the port clears the canvas instead, which is the same result
     * without the throwaway allocation.
     */
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::setPreviewImage()
    private setPreviewImage(image: ImageBitmap | null, closeSource: boolean): void
    {
        if(!this.window.disposed && this._previewImage != null)
        {
            const width = Math.max(1, Math.floor(this._previewImage.width));
            const height = Math.max(1, Math.floor(this._previewImage.height));
            const canvas = new OffscreenCanvas(width, height);
            const context = canvas.getContext('2d');

            if(context !== null)
            {
                if(image !== null)
                {
                    context.drawImage(
                        image,
                        Math.floor((width - image.width) / 2),
                        Math.floor((height - image.height) / 2)
                    );
                }

                this._previewImage.bitmap = canvas.transferToImageBitmap();
            }
        }

        if(closeSource && image !== null) image.close();
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::setPreviewFromAsset()
    private setPreviewFromAsset(assetName: string): void
    {
        const asset = this._catalog?.assets?.getAssetByName(assetName) as BitmapDataAsset | null;

        if(asset == null)
        {
            this.retrievePreviewAsset(assetName);

            return;
        }

        this.setPreviewImage(asset.content as ImageBitmap | null, false);
    }

    /**
     * The trophy previews are `.gif`, where `HabboCatalog.retrievePreviewAsset()` asks for `.png`
     * off the same host. AS3 has both spellings too; this is the trophy page's own.
     */
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::retrievePreviewAsset()
    private retrievePreviewAsset(assetName: string): void
    {
        const catalog = this._catalog;

        if(catalog?.assets == null) return;

        const url = `${catalog.imageGalleryHost}${assetName}.gif`;
        const loader = catalog.assets.loadAssetFromFile(assetName, url, 'image/gif');

        // AS3 reads the loader back off `event.target`; this port's loader event carries no target,
        // so the struct is closed over instead — the handler wants only its `assetName`.
        loader?.addEventListener(AssetLoaderEvent.COMPLETE, () => this.onPreviewImageReady(loader));
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::onPreviewImageReady()
    private onPreviewImageReady(loader: AssetLoaderStruct | null): void
    {
        if(loader != null) this.setPreviewFromAsset(loader.assetName);
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TrophyCatalogWidget.as::dispose()
    override dispose(): void
    {
        if(this.disposed) return;

        this.events.off(SelectProductEvent.SELECT_PRODUCT, this.onSelectProduct);
        this.events.off(CatalogWidgetColourIndexEvent.COLOUR_INDEX, this.onColourIndex);
        this.events.off(TextInputEvent.TEXT_INPUT, this.onTextInput);
        this.events.off(CatalogWidgetEvent.WIDGETS_INITIALIZED, this.onWidgetsInitialized);

        this._trophyOffers?.dispose();
        this._trophyOffers = null;
        this._catalog = null;
        this._priceBox = null;
        super.dispose();
    }
}
