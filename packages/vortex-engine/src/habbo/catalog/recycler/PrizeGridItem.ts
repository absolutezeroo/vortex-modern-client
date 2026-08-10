import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import {Logger} from '@core/utils/Logger';
import type {HabboCatalog} from '../HabboCatalog';
import {ProductGridItem} from '../viewer/ProductGridItem';
import type {IGridItem} from '../viewer/IGridItem';

const log = Logger.getLogger('habbo.catalog.recycler.PrizeGridItem');

/**
 * Base recycler prize grid-item: resolves and displays the prize's icon.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/PrizeGridItem.as
 */
export class PrizeGridItem extends ProductGridItem implements IGridItem, IGetImageListener
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/PrizeGridItem.as::PrizeGridItem()
    constructor(catalog: HabboCatalog)
    {
        super(catalog);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/PrizeGridItem.as::initProductIcon()
    protected initProductIcon(roomEngine: IRoomEngine | null, productItemType: string, productItemTypeId: number, extra: string = ''): void
    {
        if(!roomEngine) return;

        let result: {data: ImageBitmap | null} | null = null;
        let icon: ImageBitmap | null = null;

        switch(productItemType)
        {
            case 's':
                result = roomEngine.getFurnitureIcon(productItemTypeId, this);
                break;

            case 'i':
                result = roomEngine.getWallItemIcon(productItemTypeId, this, extra);
                break;

            case 'chat_style':
                icon = PrizeGridItem.halveChatStylePreview(
                    this.catalog?.freeFlowChat?.chatStyleLibrary?.getStyle(productItemTypeId)?.selectorPreview ?? null
                );
                break;

            default:
                log.warn(`Can not yet handle this type of product: ${productItemType}`);
                return;
        }

        // AS3 assigns the icon from the image result only when there is one, which is what keeps
        // the chat-style bitmap built above from being cleared by the null result.
        if(result?.data != null) icon = result.data;

        if(icon != null) this.setIconImage(icon, true);
    }

    /**
     * AS3: .../src/com/sulake/habbo/catalog/recycler/PrizeGridItem.as::initProductIcon()
     * (the `new BitmapData(w/2, h/2)` + `draw(preview, new Matrix(0.5, 0, 0, 0.5))` pair)
     *
     * The selector preview is drawn for the chat-style picker, twice the size a prize cell wants.
     * Extracted only to keep the switch readable; AS3 inlines it.
     */
    private static halveChatStylePreview(preview: ImageBitmap | null): ImageBitmap | null
    {
        if(preview === null) return null;

        const width = Math.max(1, Math.floor(preview.width / 2));
        const height = Math.max(1, Math.floor(preview.height / 2));
        const canvas = new OffscreenCanvas(width, height);
        const context = canvas.getContext('2d');

        if(context === null) return null;

        context.drawImage(preview, 0, 0, width, height);

        return canvas.transferToImageBitmap();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/PrizeGridItem.as::imageReady()
    imageReady(_id: number, data: ImageBitmap | null): void
    {
        if(this.disposed) return;

        this.setIconImage(data, true);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/PrizeGridItem.as::imageFailed()
    imageFailed(_id: number): void
    {
    }
}
