import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {ExpandableDropdownOption} from '../../common/advanced_dropdown/ExpandableDropdownOption';
import type {PresetManager} from '../../uibuilder/PresetManager';
import type {WiredStyle} from '../../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../../uibuilder/WiredUIBuilder';
import {DropdownParam} from '../../uibuilder/params/DropdownParam';
import {SectionParam} from '../../uibuilder/params/SectionParam';
import type {DropdownPreset} from '../../uibuilder/presets/DropdownPreset';
import type {SectionPreset} from '../../uibuilder/presets/SectionPreset';
import {ActionTypeCodes} from '../ActionTypeCodes';
import {GiveFromChest} from './GiveFromChest';

/**
 * GiveCurrencyFromChest — the "give currency from chest" action: GiveFromChest plus an earnings-category
 * dropdown (11 = pixels, 13 = points). The category id is appended to intParams[5].
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4282`). Code = ActionTypeCodes.GIVE_CURRENCY_FROM_CHEST.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/chests/_SafeCls_4282.as
 */
export class GiveCurrencyFromChest extends GiveFromChest
{
    // AS3: _SafeCls_4282.as::_SafeStr_7885 (name derived: the earnings-category dropdown)
    private _earningsCategoryDropdown!: DropdownPreset;

    // AS3: _SafeCls_4282.as::_SafeStr_8467 (name derived: the earnings-category section)
    private _earningsCategorySection!: SectionPreset;

    // AS3: _SafeCls_4282.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.GIVE_CURRENCY_FROM_CHEST;
    }

    // AS3: _SafeCls_4282.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params = super.readIntParamsFromForm();
        params.push(this._earningsCategoryDropdown.selectedId);
        return params;
    }

    // AS3: _SafeCls_4282.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        super.onEditStart(def);
        this._earningsCategoryDropdown.selectedId = def.getInt(5);
    }

    // AS3: _SafeCls_4282.as::buildInputs()
    override buildInputs(presetManager: PresetManager, wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const options = [new ExpandableDropdownOption(11, '${wiredfurni.params.earnings_category.11}'), new ExpandableDropdownOption(13, '${wiredfurni.params.earnings_category.13}')];
        this._earningsCategoryDropdown = presetManager.createDropdown(new DropdownParam('${wiredfurni.params.earnings_category}', options));
        this._earningsCategorySection = presetManager.createSection('${wiredfurni.params.earnings_category}', this._earningsCategoryDropdown, SectionParam.COLLAPSED);
        super.buildInputs(presetManager, wiredStyle, builder);
    }

    // AS3: _SafeCls_4282.as::finalizeBuilding()
    protected override finalizeBuilding(builder: WiredUIBuilder): void
    {
        super.finalizeBuilding(builder);
        builder.addElements(this._earningsCategorySection);
    }
}
