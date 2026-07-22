import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import type {PlaceholderNameSection} from '../uibuilder/presets/sections/PlaceholderNameSection';
import type {PlaceholderTypeSection} from '../uibuilder/presets/sections/PlaceholderTypeSection';
import {AddonCodes} from './AddonCodes';
import {DefaultAddonType} from './DefaultAddonType';

/**
 * UsernamePlaceholder — the "username placeholder" wired addon: a placeholder-name section and a
 * placeholder-type section (user). Stored as the string param (name, optionally "name\tdelimiter" when
 * showing multiple) plus intParams [showMultiple].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4052`; the name follows the code it returns
 * (AddonCodes.USERNAME_PLACEHOLDER).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/_SafeCls_4052.as
 */
export class UsernamePlaceholder extends DefaultAddonType
{
    // AS3: _SafeCls_4052.as::_nameSection
    private _nameSection!: PlaceholderNameSection;

    // AS3: _SafeCls_4052.as::_typeSection
    private _typeSection!: PlaceholderTypeSection;

    // AS3: _SafeCls_4052.as::get code()
    override get code(): number
    {
        return AddonCodes.USERNAME_PLACEHOLDER;
    }

    // AS3: _SafeCls_4052.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4052.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._nameSection = presetManager.createPlaceholderNameSection(this.l('texts.placeholder_name'), '$');
        this._typeSection = presetManager.createPlaceholderTypeSection('user');

        builder.addElements(this._nameSection, this._typeSection);
    }

    // AS3: _SafeCls_4052.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const parts = def.stringParam.split('\t');
        const showMultiple = def.getBoolean(0);
        const name = parts[0];
        const delimiter = parts.length > 1 ? parts[1] : '';

        this._nameSection.placeholderName = name;
        this._typeSection.isShowMultiple = showMultiple;
        this._typeSection.delimiter = delimiter;
    }

    // AS3: _SafeCls_4052.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._typeSection.isShowMultiple ? 1 : 0];
    }

    // AS3: _SafeCls_4052.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        if(!this._typeSection.isShowMultiple)
        {
            return this._nameSection.placeholderName;
        }

        return this._nameSection.placeholderName + '\t' + this._typeSection.delimiter;
    }
}
