import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import {Logger} from '@core/utils/Logger';
import type {HabboCatalog} from '../HabboCatalog';
import {ProductGridItem} from '../viewer/ProductGridItem';
import type {IGridItem} from '../viewer/IGridItem';

const log = Logger.getLogger('PrizeGridItem');

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
    // TODO(AS3): the "chat_style" branch needs catalog.freeFlowChat.chatStyleLibrary, which isn't
    // exposed on HabboCatalog yet (same gap already documented in HabboCatalogUtils.showExtraOnProduct()).
    protected initProductIcon(roomEngine: IRoomEngine | null, productItemType: string, productItemTypeId: number, _extra: string = ''): void
    {
        if(!roomEngine) return;

        let result: {data: ImageBitmap | null} | null;

        switch(productItemType)
        {
            case 's':
                result = roomEngine.getFurnitureIcon(productItemTypeId, this);
                break;

            case 'i':
                result = roomEngine.getWallItemIcon(productItemTypeId, this);
                break;

            case 'chat_style':
                log.warn(`[PrizeGridItem] chat_style prize icons are not supported yet (item ${productItemTypeId})`);
                return;

            default:
                log.warn(`[PrizeGridItem] Can not yet handle this type of product: ${productItemType}`);
                return;
        }

        if(result?.data != null) this.setIconImage(result.data, true);
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
