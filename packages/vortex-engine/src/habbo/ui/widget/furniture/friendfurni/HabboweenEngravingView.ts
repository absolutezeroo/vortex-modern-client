import type {StringArrayStuffData} from '@habbo/room/object/data/StringArrayStuffData';
import type {FriendFurniEngravingWidget} from './FriendFurniEngravingWidget';
import {FriendFurniEngravingView} from './FriendFurniEngravingView';

/**
 * HabboweenEngravingView
 *
 * The Habboween plaque. Differs from its siblings by its layout alone — every behaviour is
 * inherited.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/friendfurni/HabboweenEngravingView.as
 */
export class HabboweenEngravingView extends FriendFurniEngravingView
{
    // AS3: .../friendfurni/HabboweenEngravingView.as::HabboweenEngravingView()
    constructor(widget: FriendFurniEngravingWidget, stuffData: StringArrayStuffData)
    {
        super(widget, stuffData);
    }

    // AS3: .../friendfurni/HabboweenEngravingView.as::assetName()
    protected override assetName(): string
    {
        return 'habboween_engraving_xml';
    }
}
