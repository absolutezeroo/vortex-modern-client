import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../../DefaultElement';
import {WiredInputSourcePicker} from '../../inputsources/WiredInputSourcePicker';
import type {PresetManager} from '../../uibuilder/PresetManager';
import type {WiredStyle} from '../../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../../uibuilder/presets/RadioGroupPreset';
import {ActionTypeCodes} from '../ActionTypeCodes';
import {DefaultActionType} from '../DefaultActionType';

/**
 * CancelTransaction — the "cancel transaction" action: a usage-info section plus a match-criteria radio
 * (0 = by chest, 1 = by contract). The criteria goes to intParams[0]. When criteria is "by contract"
 * (1) the furni source-picking is disabled.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4290`). Code = ActionTypeCodes.CANCEL_TRANSACTION.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/chests/_SafeCls_4290.as
 */
export class CancelTransaction extends DefaultActionType
{
    // AS3: _SafeCls_4290.as::_SafeStr_6976 (name derived: the match-criteria radio group)
    private _matchCriteria!: RadioGroupPreset;

    // AS3: _SafeCls_4290.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.CANCEL_TRANSACTION;
    }

    // AS3: _SafeCls_4290.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._matchCriteria.selected];
    }

    // AS3: _SafeCls_4290.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4290.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._matchCriteria.selected = def.getInt(0);
    }

    // AS3: _SafeCls_4290.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const usageInfo = presetManager.createUsageInfoSection('${wiredfurni.params.cancel_transaction.usage_info}');
        this._matchCriteria = presetManager.createRadioGroup([new RadioButtonParam(0, '${wiredfurni.params.cancel_transaction.match_criteria.0}'), new RadioButtonParam(1, '${wiredfurni.params.cancel_transaction.match_criteria.1}')], (selected: number): void => this.onChangeCancelMode(selected));
        const criteriaSection = presetManager.createSection('${wiredfurni.params.cancel_transaction.match_criteria}', this._matchCriteria);
        builder.addElements(usageInfo, criteriaSection);
    }

    // AS3: _SafeCls_4290.as::onChangeCancelMode()
    private onChangeCancelMode(_mode: number): void
    {
        this.roomEvents.wiredCtrl.updateSourceContainer(WiredInputSourcePicker.FURNI_SOURCE, 0);
    }

    // AS3: _SafeCls_4290.as::isInputSourceDisabled()
    override isInputSourceDisabled(a: number, b: number): boolean
    {
        if(b === WiredInputSourcePicker.FURNI_SOURCE && a === 0)
        {
            return this._matchCriteria.selected === 1;
        }

        return false;
    }
}
