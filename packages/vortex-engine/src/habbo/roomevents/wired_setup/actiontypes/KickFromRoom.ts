import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {TextInputParam} from '../uibuilder/params/TextInputParam';
import type {TextInputPreset} from '../uibuilder/presets/TextInputPreset';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * KickFromRoom — the "kick from room" wired action: a text field for the kick message (max 100 chars),
 * stored as the string param.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/KickFromRoom.as
 */
export class KickFromRoom extends DefaultActionType
{
    // AS3: KickFromRoom.as::_message
    private _message!: TextInputPreset;

    // AS3: KickFromRoom.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.KICK_FROM_ROOM;
    }

    // AS3: KickFromRoom.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: KickFromRoom.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._message.text;
    }

    // AS3: KickFromRoom.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._message.text = def.stringParam;
    }

    // AS3: KickFromRoom.as::validate()
    override validate(): string | null
    {
        if(this._message.text.length > 100)
        {
            const key = 'wiredfurni.chatmsgtoolong';

            return this.roomEvents.localization.getLocalization(key, key);
        }

        return null;
    }

    // AS3: KickFromRoom.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._message = presetManager.createTextInput(new TextInputParam('', 100));

        const section = presetManager.createSection('${wiredfurni.params.message}', this._message);

        builder.addElements(section);
    }
}
