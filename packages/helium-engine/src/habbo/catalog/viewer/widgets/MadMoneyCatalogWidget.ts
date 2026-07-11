import type {IWindowContainer} from '@core/window/IWindowContainer';
import {CatalogWidget} from './CatalogWidget';

/**
 * The seasonal "mad money" catalog button. AS3 itself never attaches a click listener to the
 * button it looks up (`init()`'s `if(button != null) { }` is an empty block - confirmed in the
 * primary source, not a porting gap) - `eventProc()`'s own body is a placeholder
 * `windowManager.alert("TODO", "Fix in MadMoneyCatalogWidget.as", ...)`, dead code that never
 * runs. Ported as the inert lookup AS3 actually performs.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/MadMoneyCatalogWidget.as
 */
export class MadMoneyCatalogWidget extends CatalogWidget
{
    constructor(window: IWindowContainer)
    {
        super(window);
    }

    override init(): boolean
    {
        if(!super.init()) return false;

        this.window.findChildByName('ctlg_madmoney_button');

        return true;
    }
}
