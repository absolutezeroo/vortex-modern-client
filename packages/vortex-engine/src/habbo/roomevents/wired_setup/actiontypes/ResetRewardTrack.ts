import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {TextInputParam} from '../uibuilder/params/TextInputParam';
import type {NamedTextInputPreset} from '../uibuilder/presets/combinations/NamedTextInputPreset';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * ResetRewardTrack — the "reset a reward track" wired action: a single named track-id text input,
 * stored as the string param.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4401`; the name follows the code it returns
 * (ActionTypeCodes.RESET_REWARD_TRACK).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4401.as
 */
export class ResetRewardTrack extends DefaultActionType
{
    // AS3: _SafeCls_4401.as::_SafeStr_10591 (name derived: the track-id restrict mask; declared but unused — AS3 uses the literal '^\t' inline)
    private static readonly TRACK_ID_RESTRICT: string = '^\t';

    // AS3: _SafeCls_4401.as::_SafeStr_8183 (name derived: the track-id input)
    private _trackId!: NamedTextInputPreset;

    // AS3: _SafeCls_4401.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.RESET_REWARD_TRACK;
    }

    // AS3: _SafeCls_4401.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4401.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._trackId = presetManager.createNamedTextInput(new TextInputParam('', 100, null, -1, '^\t'), '${wiredfurni.params.reward_track.track_id}');

        const section = presetManager.createSection('${wiredfurni.params.reward_track.reset.track}', this._trackId);

        builder.addElements(section);
    }

    // AS3: _SafeCls_4401.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._trackId.text;
    }

    // AS3: _SafeCls_4401.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._trackId.text = def.stringParam;
    }

    // AS3: _SafeCls_4401.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4401.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }
}
