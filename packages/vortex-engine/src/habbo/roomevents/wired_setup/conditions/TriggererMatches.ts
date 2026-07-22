import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import {TextInputParam} from '../uibuilder/params/TextInputParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {TextInputPreset} from '../uibuilder/presets/TextInputPreset';
import {ConditionCodes} from './ConditionCodes';
import {DefaultConditionType} from './DefaultConditionType';

/**
 * TriggererMatches — the "the triggering user matches" wired condition: a user-type selector
 * (owner/rights/any) and an any-avatar / certain-avatar picker with a name text input. Stored as
 * intParams [userType] plus the avatar name as the string param (empty ⇒ any avatar). Exposes the
 * negation (NOT_TRIGGERER_MATCHES).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/TriggererMatches.as
 */
export class TriggererMatches extends DefaultConditionType
{
    // AS3: TriggererMatches.as::_userType
    private _userType!: RadioGroupPreset;

    // AS3: TriggererMatches.as::_pick
    private _pick!: RadioGroupPreset;

    // AS3: TriggererMatches.as::_avatarName
    private _avatarName!: TextInputPreset;

    // AS3: TriggererMatches.as::get code()
    override get code(): number
    {
        return ConditionCodes.TRIGGERER_MATCHES;
    }

    // AS3: TriggererMatches.as::get negativeCode()
    override get negativeCode(): number
    {
        return ConditionCodes.NOT_TRIGGERER_MATCHES;
    }

    // AS3: TriggererMatches.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: TriggererMatches.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._userType = presetManager.createRadioGroup([
            new RadioButtonParam(1, this.l('usertype.1')),
            new RadioButtonParam(2, this.l('usertype.2')),
            new RadioButtonParam(4, this.l('usertype.4'))
        ]);
        const userTypeSection = presetManager.createSection(this.l('usertype'), this._userType);

        this._avatarName = presetManager.createTextInput(new TextInputParam('', 32, null, -1, null, true, this.loc('wiredfurni.tooltip.avatarname')));
        this._pick = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('anyavatar')),
            new RadioButtonParam(1, this.l('certainavatar'), null, this._avatarName)
        ]);
        const pickSection = presetManager.createSection(this.l('picktriggerer'), this._pick);

        builder.addElements(userTypeSection, pickSection);
    }

    // AS3: TriggererMatches.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._userType.selected = def.intParams[0];

        if(def.stringParam !== '')
        {
            this._pick.selected = 1;
            this._avatarName.text = def.stringParam;
        }
        else
        {
            this._pick.selected = 0;
            this._avatarName.text = '';
        }
    }

    // AS3: TriggererMatches.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._userType.selected];
    }

    // AS3: TriggererMatches.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._pick.selected === 1 ? this._avatarName.text : '';
    }

    // AS3: TriggererMatches.as::userSelectionTitle()
    override userSelectionTitle(id: number): string
    {
        return 'wiredfurni.params.sources.users.title.match.' + id;
    }
}
