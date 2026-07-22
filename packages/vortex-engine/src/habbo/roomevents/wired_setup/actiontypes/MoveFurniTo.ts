import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import {SliderSection} from '../uibuilder/presets/sections/SliderSection';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * MoveFurniTo — the "move furni towards" wired action: a direction selector (movefurni.0/2/4/6) and an
 * empty-tiles distance slider (1..5), stored as intParams [direction, tiles].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4270`; the name follows the code it returns
 * (ActionTypeCodes.MOVE_FURNI_TO).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4270.as
 */
export class MoveFurniTo extends DefaultActionType
{
    // AS3: _SafeCls_4270.as::_direction
    private _direction!: RadioGroupPreset;

    // AS3: _SafeCls_4270.as::_emptyTiles
    private _emptyTiles!: SliderSection;

    // AS3: _SafeCls_4270.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.MOVE_FURNI_TO;
    }

    // AS3: _SafeCls_4270.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._direction.selected, this._emptyTiles.value];
    }

    // AS3: _SafeCls_4270.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._direction.selected = def.intParams[0];
        this._emptyTiles.value = def.intParams[1];
    }

    // AS3: _SafeCls_4270.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4270.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._direction = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('movefurni.0')),
            new RadioButtonParam(2, this.l('movefurni.2')),
            new RadioButtonParam(4, this.l('movefurni.4')),
            new RadioButtonParam(6, this.l('movefurni.6'))
        ]);
        this._direction.selected = 0;
        const section = presetManager.createSection(this.l('movefurni'), this._direction);

        this._emptyTiles = presetManager.createSliderSection('wiredfurni.params.emptytiles', 'tiles', SliderSection.CONVERTER_ECHO, 1, 5, 1);
        this._emptyTiles.value = 1;

        builder.addElements(section, this._emptyTiles);
    }

    // AS3: _SafeCls_4270.as::furniSelectionTitle()
    override furniSelectionTitle(id: number): string
    {
        return 'wiredfurni.params.sources.furni.title.mv.' + id;
    }
}
