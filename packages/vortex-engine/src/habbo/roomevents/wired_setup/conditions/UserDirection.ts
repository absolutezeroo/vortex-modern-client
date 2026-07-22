import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../uibuilder/params/CheckboxOptionParam';
import type {CheckboxGroupPreset} from '../uibuilder/presets/CheckboxGroupPreset';
import {ConditionCodes} from './ConditionCodes';
import {DefaultConditionType} from './DefaultConditionType';

/**
 * UserDirection — the "the user faces one of the selected directions" wired condition: an 8-direction
 * icon checkbox grid (4 columns) packed into a single bitmask intParam [directions].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4308`; the name follows the code it returns
 * (ConditionCodes.USER_DIRECTION).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/_SafeCls_4308.as
 */
export class UserDirection extends DefaultConditionType
{
    // AS3: _SafeCls_4308.as::_directions
    private _directions!: CheckboxGroupPreset;

    // AS3: _SafeCls_4308.as::get code()
    override get code(): number
    {
        return ConditionCodes.USER_DIRECTION;
    }

    // AS3: _SafeCls_4308.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4308.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const params: CheckboxOptionParam[] = [];
        for(let i = 0; i < 8; i++)
        {
            const param = new CheckboxOptionParam(null);
            param.iconAssetName = 'move_' + i;
            params.push(param);
        }
        this._directions = presetManager.createCheckboxGroup(params, null, 4);
        const section = presetManager.createSection(this.l('direction_selection'), this._directions);

        builder.addElements(section);
    }

    // AS3: _SafeCls_4308.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const mask = Math.trunc(def.intParams[0]);

        for(let i = 0; i < 8; i++)
        {
            this._directions.optionById(i).selected = (mask & (1 << i)) > 0;
        }
    }

    // AS3: _SafeCls_4308.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        let mask = 0;

        for(let i = 0; i < this._directions.numCheckboxes; i++)
        {
            if(this._directions.optionById(i).selected)
            {
                mask |= 1 << i;
            }
        }

        return [mask];
    }
}
