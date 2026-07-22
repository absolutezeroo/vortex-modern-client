import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * MoveUser — the "move user" wired action: a move grid (a "no move" text option plus the eight compass
 * icons, 4 columns) and a rotate grid (a "no rotate" text option, the eight compass icons and two
 * rotate icons), both defaulting to -1 (no change), stored as intParams [move, rotate].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4333`; the name follows the code it returns
 * (ActionTypeCodes.MOVE_USER).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4333.as
 */
export class MoveUser extends DefaultActionType
{
    // AS3: _SafeCls_4333.as::_move
    private _move!: RadioGroupPreset;

    // AS3: _SafeCls_4333.as::_rotate
    private _rotate!: RadioGroupPreset;

    // AS3: _SafeCls_4333.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.MOVE_USER;
    }

    // AS3: _SafeCls_4333.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._move.selected = def.intParams[0];
        this._rotate.selected = def.intParams[1];
    }

    // AS3: _SafeCls_4333.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._move.selected, this._rotate.selected];
    }

    // AS3: _SafeCls_4333.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4333.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const icon = (id: number, asset: string): RadioButtonParam =>
        {
            const param = new RadioButtonParam(id, null);
            param.iconAssetName = asset;

            return param;
        };

        const moveParams: RadioButtonParam[] = [new RadioButtonParam(-1, this.l('movefurni.0'), null, null, true)];
        for(let i = 0; i < 8; i++)
        {
            moveParams.push(icon(i, 'move_' + i));
        }
        this._move = presetManager.createRadioGroup(moveParams, null, 4);
        this._move.selected = -1;
        const moveSection = presetManager.createSection(this.l('moveuser'), this._move);

        const rotateParams: RadioButtonParam[] = [new RadioButtonParam(-1, this.l('rotatefurni.0'), null, null, true)];
        for(let i = 0; i < 8; i++)
        {
            rotateParams.push(icon(i, 'move_' + i));
        }
        rotateParams.push(icon(9, 'rotate_cw'));
        rotateParams.push(icon(10, 'rotate_ccw'));
        this._rotate = presetManager.createRadioGroup(rotateParams, null, 4);
        this._rotate.selected = -1;
        const rotateSection = presetManager.createSection(this.l('rotateuser'), this._rotate);

        builder.addElements(moveSection, rotateSection);
    }
}
