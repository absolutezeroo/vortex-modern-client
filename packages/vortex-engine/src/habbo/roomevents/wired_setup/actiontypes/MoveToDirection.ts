import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../uibuilder/params/CheckboxOptionParam';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {CheckboxGroupPreset} from '../uibuilder/presets/CheckboxGroupPreset';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * MoveToDirection — the "move in a direction" wired action: a start-direction grid (8 compass icons,
 * 4 columns), a turn selector (turn.0..6) and a "block on collide" checkbox, stored as intParams
 * [startDir, turn, blockOnCollide].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4268`; the name follows the code it returns
 * (ActionTypeCodes.MOVE_TO_DIRECTION).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4268.as
 */
export class MoveToDirection extends DefaultActionType
{
    // AS3: _SafeCls_4268.as::_startDir
    private _startDir!: RadioGroupPreset;

    // AS3: _SafeCls_4268.as::_turn
    private _turn!: RadioGroupPreset;

    // AS3: _SafeCls_4268.as::_blockOnCollide
    private _blockOnCollide!: CheckboxGroupPreset;

    // AS3: _SafeCls_4268.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.MOVE_TO_DIRECTION;
    }

    // AS3: _SafeCls_4268.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._startDir.selected = def.getInt(0);
        this._turn.selected = def.getInt(1);
        this._blockOnCollide.optionById(0).selected = def.getInt(2) !== 0;
    }

    // AS3: _SafeCls_4268.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._startDir.selected, this._turn.selected, this._blockOnCollide.optionById(0).selected ? 1 : 0];
    }

    // AS3: _SafeCls_4268.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4268.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const startDirParams: RadioButtonParam[] = [];
        for(let i = 0; i < 8; i++)
        {
            const param = new RadioButtonParam(i, null);
            param.iconAssetName = 'move_' + i;
            startDirParams.push(param);
        }
        this._startDir = presetManager.createRadioGroup(startDirParams, null, 4);
        this._startDir.selected = 0;
        const startDirSection = presetManager.createSection(this.l('startdir'), this._startDir);

        const turnParams: RadioButtonParam[] = [];
        for(let i = 0; i <= 6; i++)
        {
            turnParams.push(new RadioButtonParam(i, this.l('turn.' + i)));
        }
        this._turn = presetManager.createRadioGroup(turnParams);
        this._turn.selected = 0;
        const turnSection = presetManager.createSection(this.l('turn'), this._turn);

        const collideOption = new CheckboxOptionParam(this.l('user_collide.0'), 0);
        this._blockOnCollide = presetManager.createCheckboxGroup([collideOption]);
        const collideSection = presetManager.createSection(this.l('user_collide'), this._blockOnCollide);

        builder.addElements(startDirSection, turnSection, collideSection);
    }
}
