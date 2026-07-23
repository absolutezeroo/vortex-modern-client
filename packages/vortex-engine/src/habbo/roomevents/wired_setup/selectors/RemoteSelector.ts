import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {NumberInputParam} from '../uibuilder/params/NumberInputParam';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {NumberInputPreset} from '../uibuilder/presets/NumberInputPreset';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import {SelectorCodes} from './SelectorCodes';
import {DefaultSelectorType} from './DefaultSelectorType';

/**
 * RemoteSelector — the "remote selector" wired selector: a type selector and a filter selector whose
 * "limited" option reveals a count number input. Stored as intParams [type, count] where a count of 0
 * means unlimited.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4251`; the name follows the code it returns
 * (SelectorCodes.REMOTE_SELECTOR).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/_SafeCls_4251.as
 */
export class RemoteSelector extends DefaultSelectorType
{
    // AS3: _SafeCls_4251.as::_type
    private _type!: RadioGroupPreset;

    // AS3: _SafeCls_4251.as::_filter
    private _filter!: RadioGroupPreset;

    // AS3: _SafeCls_4251.as::_filterCount
    private _filterCount!: NumberInputPreset;

    // AS3: _SafeCls_4251.as::get code()
    override get code(): number
    {
        return SelectorCodes.REMOTE_SELECTOR;
    }

    // AS3: _SafeCls_4251.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4251.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._type = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('remote_selection.type.0')),
            new RadioButtonParam(1, this.l('remote_selection.type.1'))
        ]);
        const typeSection = presetManager.createSection(this.l('remote_selection.type'), this._type);

        this._filterCount = presetManager.createNumberInput(new NumberInputParam(0, 0, 2147483647, 40, 0, false));
        this._filter = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('remote_selection.filter.0')),
            new RadioButtonParam(1, this.l('remote_selection.filter.1'), this._filterCount)
        ]);
        const filterSection = presetManager.createSection(this.l('remote_selection.filter'), this._filter);

        builder.addElements(typeSection, filterSection);
    }

    // AS3: _SafeCls_4251.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._type.selected = def.getInt(0);

        const count = Math.trunc(def.getInt(1));
        this._filter.selected = count > 0 ? 1 : 0;
        this._filterCount.value = count;
    }

    // AS3: _SafeCls_4251.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const count = Math.trunc(this._filter.selected === 1 ? this._filterCount.value : 0);

        return [this._type.selected, count];
    }
}
