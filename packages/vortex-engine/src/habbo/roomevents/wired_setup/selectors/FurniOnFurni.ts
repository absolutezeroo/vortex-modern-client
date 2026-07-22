import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import {SelectorCodes} from './SelectorCodes';
import {DefaultSelectorType} from './DefaultSelectorType';

/**
 * FurniOnFurni — the "furnis stacked relative to the furni" wired selector: a 4-way relation selector
 * (onfurni.0..3), stored as intParams [selection].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4116`; the name follows the code it returns
 * (SelectorCodes.FURNI_ON_FURNI).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/_SafeCls_4116.as
 */
export class FurniOnFurni extends DefaultSelectorType
{
    // AS3: _SafeCls_4116.as::_selection
    private _selection!: RadioGroupPreset;

    // AS3: _SafeCls_4116.as::get code()
    override get code(): number
    {
        return SelectorCodes.FURNI_ON_FURNI;
    }

    // AS3: _SafeCls_4116.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4116.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._selection = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('onfurni.0')),
            new RadioButtonParam(1, this.l('onfurni.1')),
            new RadioButtonParam(2, this.l('onfurni.2')),
            new RadioButtonParam(3, this.l('onfurni.3'))
        ]);
        this._selection.selected = 0;
        const section = presetManager.createSection(this.l('selection_type'), this._selection);

        builder.addElements(section);
    }

    // AS3: _SafeCls_4116.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._selection.selected = def.intParams[0];
    }

    // AS3: _SafeCls_4116.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._selection.selected];
    }
}
