import type {ICategoryModel} from '../common/ICategoryModel';
import type {ICategoryModelOwner} from '../common/ICategoryModelOwner';
import {CategoryBaseModel} from '../common/CategoryBaseModel';

/**
 * The upper-body page: coat, shirt, chest accessory and chest print.
 *
 * Nothing but an `init()`: the part types this page owns, then its view. Every behaviour is
 * `CategoryBaseModel`'s.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/avatar/torso/TorsoModel.as
 */
export class TorsoModel extends CategoryBaseModel implements ICategoryModel
{
    // AS3: .../avatar/torso/TorsoModel.as::TorsoModel()
    constructor(controller: ICategoryModelOwner | null)
    {
        super(controller);
    }

    /**
     * AS3: .../avatar/torso/TorsoModel.as::init()
     *
     * The `_initialised` flag is set **before** the view is built, as in AS3 — so a view
     * constructor that re-entered `getWindowContainer()` would not recurse.
     *
     * TODO(AS3): the view (`TorsoView`) is not ported yet, so `_view` stays null and the page
     * builds its grids without windows. Everything `CategoryBaseModel` does with `_view` is
     * already null-guarded; wire it up with the view slice.
     */
    protected override init(): void
    {
        super.init();

        this.initCategory('cc');
        this.initCategory('ch');
        this.initCategory('ca');
        this.initCategory('cp');
        this._initialised = true;
    }
}
