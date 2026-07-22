import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {TextAreaParam} from '../uibuilder/params/TextAreaParam';
import type {TextAreaPreset} from '../uibuilder/presets/TextAreaPreset';
import {SelectorCodes} from './SelectorCodes';
import {DefaultSelectorType} from './DefaultSelectorType';

/**
 * UsersByName — the "users matching a list of names" wired selector: a multi-line text area, with each
 * line stored as a tab-separated entry in the string param.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/UsersByName.as
 */
export class UsersByName extends DefaultSelectorType
{
    // AS3: UsersByName.as::_names
    private _names!: TextAreaPreset;

    // AS3: UsersByName.as::get code()
    override get code(): number
    {
        return SelectorCodes.USERS_BY_NAME;
    }

    // AS3: UsersByName.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: UsersByName.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._names.text.replace(/\n\r/g, '\t').replace(/\r/g, '\t').replace(/\n/g, '\t');
    }

    // AS3: UsersByName.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._names.text = def.stringParam.replace(/\t/g, '\r');
    }

    // AS3: UsersByName.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._names = presetManager.createTextArea(new TextAreaParam(140, -1, 20, -1, 1000));
        const section = presetManager.createSection('${wiredfurni.params.enter_names}', this._names);

        builder.addElements(section);
    }
}
