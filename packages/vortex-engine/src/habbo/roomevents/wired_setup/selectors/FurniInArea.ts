import {InArea} from './InArea';
import {SelectorCodes} from './SelectorCodes';

/**
 * FurniInArea — the "furni in area" selector: InArea targeting furni.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/FurniInArea.as
 */
export class FurniInArea extends InArea
{
    // AS3: FurniInArea.as::get code()
    override get code(): number
    {
        return SelectorCodes.FURNI_IN_AREA;
    }
}
