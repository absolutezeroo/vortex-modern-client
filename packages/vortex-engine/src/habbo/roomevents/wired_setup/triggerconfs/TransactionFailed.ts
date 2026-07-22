import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * TransactionFailed — the "a marketplace transaction failed" wired trigger: a usage-info section and a
 * "view in menu" textual button that opens the variable overview at the failure reason.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4104`; the name follows the code it returns
 * (TriggerConfCodes.TRANSACTION_FAILED).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/_SafeCls_4104.as
 */
export class TransactionFailed extends DefaultTriggerConf
{
    // AS3: _SafeCls_4104.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.TRANSACTION_FAILED;
    }

    // AS3: _SafeCls_4104.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4104.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const usage = presetManager.createUsageInfoSection('${wiredfurni.params.transaction_failed.usage_info}');
        const button = presetManager.createTextualButtonPreset(this.loc('wiredfurni.view_in_menu'), this._viewInMenu);

        builder.addElements(usage, button.alignCenter());
    }

    // AS3: _SafeCls_4104.as::viewInMenuCallback()
    private _viewInMenu = (): void =>
    {
        this.roomEvents.context.createLinkEvent('wiredmenu/open/variable_overview/@event.transaction_failed.reason');
    };
}
