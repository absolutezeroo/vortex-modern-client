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
 * MoveFurni — the "move furni" wired action: a 4-column direction grid (a "no move" text option plus
 * the eight compass directions, diagonal, vertical and random icons) and a rotate selector, stored as
 * intParams [move, rotate].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4238`; the name follows the code it returns
 * (ActionTypeCodes.MOVE_FURNI).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4238.as
 */
export class MoveFurni extends DefaultActionType
{
    // AS3: _SafeCls_4238.as::_move
    private _move!: RadioGroupPreset;

    // AS3: _SafeCls_4238.as::_rotate
    private _rotate!: RadioGroupPreset;

    // AS3: _SafeCls_4238.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.MOVE_FURNI;
    }

    // AS3: _SafeCls_4238.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._move.selected = def.intParams[0];
        this._rotate.selected = def.intParams[1];
    }

    // AS3: _SafeCls_4238.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._move.selected, this._rotate.selected];
    }

    // AS3: _SafeCls_4238.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4238.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        // AS3 builds each icon option inline, setting iconAssetName after construction.
        const icon = (id: number, asset: string): RadioButtonParam =>
        {
            const param = new RadioButtonParam(id, null);
            param.iconAssetName = asset;

            return param;
        };

        this._move = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('movefurni.0'), null, null, true),
            icon(4, 'move_0'),
            icon(8, 'move_1'),
            icon(5, 'move_2'),
            icon(9, 'move_3'),
            icon(6, 'move_4'),
            icon(10, 'move_5'),
            icon(7, 'move_6'),
            icon(11, 'move_7'),
            icon(2, 'move_diag'),
            icon(3, 'move_vrt'),
            icon(1, 'move_rnd')
        ], null, 4);
        this._move.selected = 0;
        const moveSection = presetManager.createSection(this.l('movefurni'), this._move);

        const rotateCw = new RadioButtonParam(1, this.l('rotatefurni.1'));
        rotateCw.iconAssetName = 'rotate_cw';
        const rotateCcw = new RadioButtonParam(2, this.l('rotatefurni.2'));
        rotateCcw.iconAssetName = 'rotate_ccw';

        this._rotate = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('rotatefurni.0')),
            rotateCw,
            rotateCcw,
            new RadioButtonParam(3, this.l('rotatefurni.3'))
        ]);
        this._rotate.selected = 0;
        const rotateSection = presetManager.createSection(this.l('rotatefurni'), this._rotate);

        builder.addElements(moveSection, rotateSection);
    }
}
