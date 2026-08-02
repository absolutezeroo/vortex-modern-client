import type {StringArrayStuffData} from '@habbo/room/object/data/StringArrayStuffData';
import type {FriendFurniEngravingWidget} from './FriendFurniEngravingWidget';
import {FriendFurniEngravingView} from './FriendFurniEngravingView';

/**
 * WildWestEngravingView
 *
 * The WildWest plaque. Differs from its siblings by its layout alone — every behaviour is
 * inherited.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/friendfurni/WildWestEngravingView.as
 */
export class WildWestEngravingView extends FriendFurniEngravingView
{
    // AS3: .../friendfurni/WildWestEngravingView.as::WildWestEngravingView()
    constructor(widget: FriendFurniEngravingWidget, stuffData: StringArrayStuffData)
    {
        super(widget, stuffData);
    }

    // AS3: .../friendfurni/WildWestEngravingView.as::assetName()
    protected override assetName(): string
    {
        return 'wildwest_engraving_xml';
    }
}
