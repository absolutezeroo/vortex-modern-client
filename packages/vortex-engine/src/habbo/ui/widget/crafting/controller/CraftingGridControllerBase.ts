import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {CraftingWidget} from '../CraftingWidget';

/**
 * Shared plumbing for the three grid controllers (inventory, recipes, mixer): the owning widget's
 * main window and its cloneable grid-item template.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/crafting/controller/CraftingGridControllerBase.as
 */
export class CraftingGridControllerBase
{
    // AS3: .../controller/CraftingGridControllerBase.as::_SafeStr_4549 (widget)
    protected _widget: CraftingWidget | null;

    // AS3: .../controller/CraftingGridControllerBase.as::CraftingGridControllerBase()
    constructor(widget: CraftingWidget)
    {
        this._widget = widget;
    }

    // AS3: .../controller/CraftingGridControllerBase.as::dispose()
    dispose(): void
    {
        this._widget = null;
    }

    // AS3: .../controller/CraftingGridControllerBase.as::get mainWindow()
    get mainWindow(): IWindowContainer | null
    {
        return this._widget ? this._widget.window : null;
    }

    // AS3: .../controller/CraftingGridControllerBase.as::getItemTemplate()
    getItemTemplate(): IWindowContainer | null
    {
        return this._widget ? this._widget.itemTemplate : null;
    }
}
