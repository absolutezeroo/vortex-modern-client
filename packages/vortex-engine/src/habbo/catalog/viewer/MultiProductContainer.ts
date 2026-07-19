import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import {SingleProductContainer} from './SingleProductContainer';

/**
 * A single-product offer sold in a fixed multi-quantity bundle (e.g. "x5").
 *
 * @see sources/win63_version/habbo/catalog/viewer/MultiProductContainer.as
 */
export class MultiProductContainer extends SingleProductContainer
{
    override initProductIcon(roomEngine: IRoomEngine, stuffData?: unknown | null): void
    {
        super.initProductIcon(roomEngine, stuffData);

        const multiContainer = this._view!.findChildByName('multiContainer');

        if(multiContainer)
        {
            multiContainer.visible = true;
        }

        const multiCounter = this._view!.findChildByName('multiCounter') as unknown as ITextWindow | null;

        if(multiCounter)
        {
            multiCounter.text = 'x' + this.firstProduct!.productCount;
        }

        this.setClubIconLevel(this.offer.clubLevel);
    }
}
