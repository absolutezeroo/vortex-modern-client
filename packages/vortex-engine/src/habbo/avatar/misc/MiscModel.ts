import type {ICategoryModel} from '../common/ICategoryModel';
import type {ICategoryModelOwner} from '../common/ICategoryModelOwner';
import {CategoryBaseModel} from '../common/CategoryBaseModel';
import {CategoryData} from '../common/CategoryData';

/**
 * The pets-and-props page: a held pet and a miscellaneous item.
 *
 * The only simple page that does more than declare its part types. Both of its grids are commonly
 * **empty** — most users own no props at all — and `generateDataContent()` returns null rather
 * than an empty grid for a part type with nothing in it, which would leave the page with no
 * `CategoryData` and make `selectPart()` a no-op. `ensureEmptyCategory()` fills the gap with a
 * genuinely empty one so the page still has something to hold.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/avatar/misc/MiscModel.as
 */
export class MiscModel extends CategoryBaseModel implements ICategoryModel
{
    // AS3: .../avatar/misc/MiscModel.as::MiscModel()
    constructor(controller: ICategoryModelOwner | null)
    {
        super(controller);
    }

    /**
     * AS3: .../avatar/misc/MiscModel.as::init()
     *
     * TODO(AS3): the view (`MiscView`) is not ported yet, so `_view` stays null and the page
     * builds its grids without windows. Wire it up with the view slice.
     */
    protected override init(): void
    {
        super.init();

        this.initCategory('pt');
        this.initCategory('mc');

        this.ensureEmptyCategory('pt');
        this.ensureEmptyCategory('mc');

        this._initialised = true;
    }

    // AS3: .../avatar/misc/MiscModel.as::ensureEmptyCategory()
    // Only fills a *missing* entry — a grid that was built stays as it is.
    private ensureEmptyCategory(partType: string): void
    {
        if(this._categories === null) return;
        if(this._categories.getValue(partType) !== null) return;

        this._categories.setValue(partType, new CategoryData([], []));
    }
}
