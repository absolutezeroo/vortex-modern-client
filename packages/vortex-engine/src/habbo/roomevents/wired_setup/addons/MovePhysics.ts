import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../uibuilder/params/CheckboxOptionParam';
import type {CheckboxGroupPreset} from '../uibuilder/presets/CheckboxGroupPreset';
import {AddonCodes} from './AddonCodes';
import {DefaultAddonType} from './DefaultAddonType';

/**
 * MovePhysics — the "movement physics" wired addon: four option checkboxes (keep altitude, move
 * through furni, move through users, block by furni), stored as a boolean intParam per option.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4084`; the name follows the movephysics.*
 * localization keys of its options (code AddonCodes.MOVE_PHYSICS).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/_SafeCls_4084.as
 */
export class MovePhysics extends DefaultAddonType
{
    // AS3: _SafeCls_4084.as::_options
    private _options!: CheckboxGroupPreset;

    // AS3: _SafeCls_4084.as::get code()
    override get code(): number
    {
        return AddonCodes.MOVE_PHYSICS;
    }

    // AS3: _SafeCls_4084.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4084.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._options = presetManager.createCheckboxGroup([
            new CheckboxOptionParam(this.l('movephysics.keep_altitude'), 0),
            new CheckboxOptionParam(this.l('movephysics.move_through_furni'), 1),
            new CheckboxOptionParam(this.l('movephysics.move_through_users'), 2),
            new CheckboxOptionParam(this.l('movephysics.block_by_furni'), 3)
        ]);
        const section = presetManager.createSection(this.l('select_options'), this._options);

        builder.addElements(section);
    }

    // AS3: _SafeCls_4084.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._options.optionById(0).selected = def.getBoolean(0);
        this._options.optionById(1).selected = def.getBoolean(1);
        this._options.optionById(2).selected = def.getBoolean(2);
        this._options.optionById(3).selected = def.getBoolean(3);
    }

    // AS3: _SafeCls_4084.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [
            this._options.optionById(0).selected ? 1 : 0,
            this._options.optionById(1).selected ? 1 : 0,
            this._options.optionById(2).selected ? 1 : 0,
            this._options.optionById(3).selected ? 1 : 0
        ];
    }

    // AS3: _SafeCls_4084.as::furniSelectionTitle()
    override furniSelectionTitle(id: number): string
    {
        return 'wiredfurni.params.sources.furni.title.physics.' + id;
    }

    // AS3: _SafeCls_4084.as::userSelectionTitle()
    override userSelectionTitle(id: number): string
    {
        return 'wiredfurni.params.sources.users.title.physics.' + id;
    }
}
