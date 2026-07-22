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
 * MoveUserToFurni — the "move user to furni" wired action: a single walk-mode selector
 * (user_move.walkmode.0..2), stored as intParams [walkMode].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4021`; the name follows the code it returns
 * (ActionTypeCodes.MOVE_USER_TO_FURNI).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4021.as
 */
export class MoveUserToFurni extends DefaultActionType
{
    // AS3: _SafeCls_4021.as::_walkMode
    private _walkMode!: RadioGroupPreset;

    // AS3: _SafeCls_4021.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.MOVE_USER_TO_FURNI;
    }

    // AS3: _SafeCls_4021.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._walkMode.selected];
    }

    // AS3: _SafeCls_4021.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._walkMode.selected = def.intParams[0];
    }

    // AS3: _SafeCls_4021.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4021.as::furniSelectionTitle()
    override furniSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.furni.title.mv.1';
    }

    // AS3: _SafeCls_4021.as::userSelectionTitle()
    override userSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.furni.title.mv_user2';
    }

    // AS3: _SafeCls_4021.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4021.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._walkMode = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('user_move.walkmode.0')),
            new RadioButtonParam(1, this.l('user_move.walkmode.1')),
            new RadioButtonParam(2, this.l('user_move.walkmode.2'))
        ]);
        this._walkMode.selected = 0;
        const section = presetManager.createSection(this.l('user_move.walkmode'), this._walkMode);

        builder.addElements(section);
    }
}
