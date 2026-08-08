import type {ICategoryModel} from '../common/ICategoryModel';
import type {ICategoryModelOwner} from '../common/ICategoryModelOwner';
import {CategoryBaseModel} from '../common/CategoryBaseModel';

/**
 * The lower-body page: trousers, shoes and waist accessory.
 *
 * Nothing but an `init()`: the part types this page owns, then its view. Every behaviour is
 * `CategoryBaseModel`'s.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/avatar/legs/LegsModel.as
 */
export class LegsModel extends CategoryBaseModel implements ICategoryModel
{
    // AS3: .../avatar/legs/LegsModel.as::LegsModel()
    constructor(controller: ICategoryModelOwner | null)
    {
        super(controller);
    }

    /**
     * AS3: .../avatar/legs/LegsModel.as::init()
     *
     * The `_initialised` flag is set **before** the view is built, as in AS3 — so a view
     * constructor that re-entered `getWindowContainer()` would not recurse.
     *
     * TODO(AS3): the view (`LegsView`) is not ported yet, so `_view` stays null and the page
     * builds its grids without windows. Everything `CategoryBaseModel` does with `_view` is
     * already null-guarded; wire it up with the view slice.
     */
    protected override init(): void
    {
        super.init();

        this.initCategory('lg');
        this.initCategory('sh');
        this.initCategory('wa');
        this._initialised = true;
    }
}
