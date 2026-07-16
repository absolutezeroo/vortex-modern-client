import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import {Logger} from '@core/utils/Logger';
import {Vector3d} from '@room/utils/Vector3d';
import {PetCustomPart} from '@habbo/avatar/pets/PetCustomPart';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {HabboCatalog} from '../../HabboCatalog';
import {Offer} from '../Offer';
import {CatalogWidget} from './CatalogWidget';
import {SelectProductEvent} from './events/SelectProductEvent';

const log = Logger.getLogger('PetPreviewCatalogWidget');

/**
 * Read-only pet preview panel: renders the selected offer's pet, plus its localized name and
 * description. Unlike PetsCatalogWidget/NewPetsCatalogWidget this one never purchases anything -
 * it only reacts to SELECT_PRODUCT.
 *
 * The pet is built from the product's `customParams`, decoded differently per furniture category
 * (13-16); see decodeCustomParts() for the four shapes.
 *
 * TS deviations, both documented in-place below: AS3's dead `_gridItemLayout` field is omitted, and
 * the preview image arrives asynchronously via imageReady() (see PetsCatalogWidget's header for the
 * ImageResult reason).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetPreviewCatalogWidget.as
 */
export class PetPreviewCatalogWidget extends CatalogWidget implements IGetImageListener
{
    // AS3 declares these as plain instance fields, not constants - preserved as readonly here since
    // nothing ever writes them.
    private static readonly PET_TYPE_ID: number = 15;

    private static readonly BREED: number = 1;

    private static readonly COLOR: number = 16777215;

    private static readonly PALETTE_ID: number = 2;

    private static readonly PART_ID: number = -1;

    private _productName: IWindow | null = null;

    private _description: IWindow | null = null;

    private _teaserImage: IBitmapWrapperWindow | null = null;

    private _teaserOrigin: {x: number; y: number} = {x: 0, y: 0};

    private _initialImageId: number = 0;

    private _catalog: HabboCatalog | null;

    private _priceWindow: IWindow | null = null;

    constructor(window: IWindowContainer, catalog: HabboCatalog)
    {
        super(window);
        this._catalog = catalog;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetPreviewCatalogWidget.as::init()
    // AS3 also reads the "gridItem" XmlAsset into a `_gridItemLayout` field that nothing in the
    // class ever reads - omitted rather than reproduced, since this port builds windows from the
    // compiled window-layout registry and has no raw-XML asset path to load it from anyway.
    override init(): boolean
    {
        if(!super.init()) return false;

        this._productName = this._window.findChildByName('ctlg_product_name');

        if(this._productName != null) this._productName.caption = '';

        this._description = this._window.findChildByName('ctlg_description');

        if(this._description != null) this._description.caption = '';

        this._teaserImage = this._window.findChildByName('ctlg_teaserimg_1') as unknown as IBitmapWrapperWindow | null;

        if(this._teaserImage != null) this._teaserOrigin = {x: this._teaserImage.x, y: this._teaserImage.y};

        const result = this._catalog?.roomEngine?.getPetImage(
            PetPreviewCatalogWidget.PET_TYPE_ID,
            PetPreviewCatalogWidget.PALETTE_ID,
            PetPreviewCatalogWidget.COLOR,
            new Vector3d(90),
            64,
            this,
            true,
            0
        ) ?? null;

        if(result != null)
        {
            this.setPreviewImage(result.data, true, {x: 0, y: 0});
            this._initialImageId = result.id;
        }

        this.events.on(SelectProductEvent.SELECT_PRODUCT, this.onPreviewProduct);

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetPreviewCatalogWidget.as::onPreviewProduct()
    private onPreviewProduct = (event: SelectProductEvent): void =>
    {
        if(event == null) return;

        const offer = event.offer;
        const productData = this._catalog?.getProductData(offer.localizationId) ?? null;
        const name = productData != null ? `\${${productData.name}}` : `\${${offer.localizationId}}`;
        const description = productData != null ? `\${${productData.description}}` : `\${${offer.localizationId}}`;

        if(this._productName != null) this._productName.caption = name;

        if(this._description != null)
        {
            this._description.caption = description;

            if(this._productName != null) this._description.y = this._productName.y + this._productName.height + 5;
        }

        this._priceWindow = this._catalog?.utils?.showPriceOnProduct(
            offer, this._window, this._priceWindow, this._teaserImage as unknown as IWindow | null, -6, true, 6
        ) ?? null;

        let image: ImageBitmap | null = null;

        if(offer.pricingModel === Offer.PRICING_MODEL_SINGLE || offer.pricingModel === Offer.PRICING_MODEL_MULTI)
        {
            const result = this.renderPetForOffer(offer);

            if(result != null)
            {
                offer.previewCallbackId = result.id;
                image = result.data;
            }
        }
        else
        {
            log.debug(`[Pet Preview Catalog Widget] Unknown pricing model${offer.pricingModel}`);
        }

        this.setPreviewImage(image, true, {x: 0, y: 0});
        this._window.invalidate();
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetPreviewCatalogWidget.as::onPreviewProduct()
    // The pricing_model_single/multi branch of AS3's switch, split out for readability. Returns null
    // wherever AS3 logs and breaks out with no image request made.
    private renderPetForOffer(offer: {product: {productType: string; furnitureData: {customParams: string | null; category: number} | null} | null}): {id: number; data: ImageBitmap | null} | null
    {
        const product = offer.product;
        const furnitureData = product?.furnitureData ?? null;

        if(furnitureData == null || furnitureData.customParams == null)
        {
            log.debug(`[Pet Preview Catalog Widget] Unsupported product: ${product?.productType}`);

            return null;
        }

        const params = furnitureData.customParams.split(' ');

        if(params.length < 1)
        {
            log.debug(`[Pet Preview Catalog Widget] Invalid custom params: ${product?.productType}`);

            return null;
        }

        const roomEngine = this._catalog?.roomEngine ?? null;

        if(roomEngine == null) return null;

        const petType = parseInt(params[0]!);

        switch(furnitureData.category - 13)
        {
            case 0:
                return this.renderByColorTag(roomEngine, petType, params, product!.productType);
            case 1:
                return this.renderByTriples(roomEngine, petType, params, product!.productType);
            case 2:
                return this.renderByLayerAndPalette(roomEngine, petType, params, product!.productType);
            case 3:
                return this.renderBySingleTriple(roomEngine, petType, params, product!.productType);
            default:
                log.debug(`[Pet Preview Catalog Widget] Unsupported Product Type: ${product?.productType}`);

                return null;
        }
    }

    // Category 13: the palette is looked up by colour tag, picking the entry matching BREED.
    private renderByColorTag(roomEngine: IRoomEngine, petType: number, params: string[], productType: string): {id: number; data: ImageBitmap | null} | null
    {
        if(params.length < 2)
        {
            log.debug(`[Pet Preview Catalog Widget] Invalid custom params: ${productType}`);

            return null;
        }

        const colors = roomEngine.getPetColorsByTag(petType, params[1]!) ?? [];
        let colorId = 0;

        for(const color of colors)
        {
            if(color.breed === PetPreviewCatalogWidget.BREED)
            {
                colorId = parseInt(color.id);

                break;
            }
        }

        let customParts: PetCustomPart[] = [];

        // AS3's inner switch has only this one case and no default: every pet type other than 15
        // renders with no custom parts.
        if(petType === 15)
        {
            const hairPalette = roomEngine.getPetDefaultPalette(petType, 'hair');
            const tailPalette = roomEngine.getPetDefaultPalette(petType, 'tail');

            customParts = [
                new PetCustomPart(2, -1, hairPalette ? parseInt(hairPalette.id) : -1),
                new PetCustomPart(3, -1, tailPalette ? parseInt(tailPalette.id) : -1)
            ];
        }

        return roomEngine.getPetImage(petType, colorId, PetPreviewCatalogWidget.COLOR, new Vector3d(90), 64, this, true, 0, customParts);
    }

    // Category 14: three parallel comma-lists - layer ids, part ids, palette ids.
    private renderByTriples(roomEngine: IRoomEngine, petType: number, params: string[], productType: string): {id: number; data: ImageBitmap | null} | null
    {
        if(params.length < 4)
        {
            log.debug(`[Pet Preview Catalog Widget] Invalid custom params: ${productType}`);

            return null;
        }

        const layerIds = params[1]!.split(',');
        const partIds = params[2]!.split(',');
        const paletteIds = params[3]!.split(',');
        const customParts: PetCustomPart[] = [];

        for(let i = 0; i < layerIds.length; i++)
        {
            customParts.push(new PetCustomPart(parseInt(layerIds[i]!), parseInt(partIds[i]!), parseInt(paletteIds[i]!)));
        }

        return roomEngine.getPetImage(petType, PetPreviewCatalogWidget.PALETTE_ID, PetPreviewCatalogWidget.COLOR, new Vector3d(90), 64, this, true, 0, customParts);
    }

    // Category 15: two parallel comma-lists - layer ids and palette ids, with a fixed part id.
    private renderByLayerAndPalette(roomEngine: IRoomEngine, petType: number, params: string[], productType: string): {id: number; data: ImageBitmap | null} | null
    {
        if(params.length < 3)
        {
            log.debug(`[Pet Preview Catalog Widget] Invalid custom params: ${productType}`);

            return null;
        }

        const layerIds = params[1]!.split(',');
        const paletteIds = params[2]!.split(',');
        const customParts: PetCustomPart[] = [];

        for(let i = 0; i < layerIds.length; i++)
        {
            customParts.push(new PetCustomPart(parseInt(layerIds[i]!), PetPreviewCatalogWidget.PART_ID, parseInt(paletteIds[i]!)));
        }

        return roomEngine.getPetImage(petType, PetPreviewCatalogWidget.PALETTE_ID, PetPreviewCatalogWidget.COLOR, new Vector3d(90), 64, this, true, 0, customParts);
    }

    // Category 16: one literal layer/part/palette triple.
    // AS3 logs on a short param list here but - unlike every sibling case - does not break, and
    // falls through to build the part from the missing entries anyway. Preserved.
    private renderBySingleTriple(roomEngine: IRoomEngine, petType: number, params: string[], productType: string): {id: number; data: ImageBitmap | null} | null
    {
        if(params.length < 4) log.debug(`[Pet Preview Catalog Widget] Invalid custom params: ${productType}`);

        const customParts = [new PetCustomPart(parseInt(params[1]!), parseInt(params[2]!), parseInt(params[3]!))];

        return roomEngine.getPetImage(petType, PetPreviewCatalogWidget.PALETTE_ID, PetPreviewCatalogWidget.COLOR, new Vector3d(90), 64, this, true, 0, customParts);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetPreviewCatalogWidget.as::imageReady()
    imageReady(id: number, data: ImageBitmap | null): void
    {
        if(this.disposed || this.page == null || this.page.offers == null) return;

        if(this._initialImageId === id)
        {
            this.setPreviewImage(data, true);
            this._initialImageId = 0;

            return;
        }

        for(const offer of this.page.offers)
        {
            if(offer.previewCallbackId === id)
            {
                this.setPreviewImage(data, true);
                offer.previewCallbackId = 0;

                break;
            }
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetPreviewCatalogWidget.as::imageFailed()
    imageFailed(_id: number): void
    {
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetPreviewCatalogWidget.as::setPreviewImage()
    // Centres the image in the wrapper and re-anchors the wrapper to its original position plus an
    // optional offset. Unlike the two buy widgets there is no upscale here.
    private setPreviewImage(image: ImageBitmap | null, dispose: boolean, offset: {x: number; y: number} | null = null): void
    {
        if(this._teaserImage != null && !this.window.disposed && image != null)
        {
            const wrapper = this._teaserImage;
            const canvas = new OffscreenCanvas(wrapper.width, wrapper.height);
            const ctx = canvas.getContext('2d')!;

            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(image, (wrapper.width - image.width) / 2, (wrapper.height - image.height) / 2);

            wrapper.bitmap = canvas.transferToImageBitmap();
            wrapper.invalidate();

            wrapper.x = this._teaserOrigin.x;
            wrapper.y = this._teaserOrigin.y;

            if(offset != null)
            {
                wrapper.x += offset.x;
                wrapper.y += offset.y;
            }
        }

        if(dispose) image?.close();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/PetPreviewCatalogWidget.as::dispose()
    override dispose(): void
    {
        if(this.disposed) return;

        this.events.off(SelectProductEvent.SELECT_PRODUCT, this.onPreviewProduct);

        this._catalog = null;
        this._priceWindow = null;
        this._productName = null;
        this._description = null;
        this._teaserImage = null;

        super.dispose();
    }
}
