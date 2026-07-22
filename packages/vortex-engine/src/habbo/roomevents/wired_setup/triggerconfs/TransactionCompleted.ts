import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * TransactionCompleted — the "a marketplace transaction completed" wired trigger: a single usage-info
 * section, no parameters.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4336`; the name follows the code it returns
 * (TriggerConfCodes.TRANSACTION_COMPLETED).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/_SafeCls_4336.as
 */
export class TransactionCompleted extends DefaultTriggerConf
{
    // AS3: _SafeCls_4336.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.TRANSACTION_COMPLETED;
    }

    // AS3: _SafeCls_4336.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4336.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const usage = presetManager.createUsageInfoSection('${wiredfurni.params.transaction_complete.usage_info}');

        builder.addElements(usage);
    }
}
