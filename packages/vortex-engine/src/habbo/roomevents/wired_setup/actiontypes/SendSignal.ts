import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import type {IDisposable} from '@core/runtime/IDisposable';
import {WindowEvent} from '@core/window/events/WindowEvent';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../uibuilder/params/CheckboxOptionParam';
import type {CheckboxGroupPreset} from '../uibuilder/presets/CheckboxGroupPreset';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * SendSignal — the "send signal" wired action: two toggle options (split by furni / split by users),
 * each guarded by a confirmation dialog when enabled, stored as intParams [splitFurni, splitUsers].
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/SendSignal.as
 */
export class SendSignal extends DefaultActionType
{
    // AS3: SendSignal.as::_signalOptions
    private _signalOptions!: CheckboxGroupPreset;

    // AS3: SendSignal.as::_ignoreCheckboxEvents
    private _ignoreCheckboxEvents: boolean = false;

    // AS3: SendSignal.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.SEND_SIGNAL;
    }

    // AS3: SendSignal.as::get negativeCode()
    override get negativeCode(): number
    {
        return ActionTypeCodes.NEG_SEND_SIGNAL;
    }

    // AS3: SendSignal.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: SendSignal.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const options = [
            new CheckboxOptionParam(this.l('signal.split_furni')),
            new CheckboxOptionParam(this.l('signal.split_users'))
        ];
        this._signalOptions = presetManager.createCheckboxGroup(options, this._onChangeCheckbox);
        const section = presetManager.createSection(this.l('signal.send_options'), this._signalOptions);

        builder.addElements(section);
    }

    // AS3: SendSignal.as::onChangeCheckbox()
    private _onChangeCheckbox = (id: number, value: boolean): void =>
    {
        if(this._ignoreCheckboxEvents)
        {
            return;
        }

        if(value)
        {
            this.roomEvents.windowManager!.confirm('${wiredfurni.params.signal_warning.title}', '${wiredfurni.params.signal_warning.desc}', 0, (dialog: IDisposable, event: WindowEvent): void =>
            {
                dialog.dispose();

                if(event.type !== WindowEvent.WE_OK)
                {
                    this._signalOptions.optionById(id).selected = false;
                }
            });
        }
    };

    // AS3: SendSignal.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._ignoreCheckboxEvents = true;
        this._signalOptions.optionById(0).selected = def.getBoolean(0);
        this._signalOptions.optionById(1).selected = def.getBoolean(1);
        this._ignoreCheckboxEvents = false;
    }

    // AS3: SendSignal.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        // AS3 returns the raw Booleans; they are coerced to 0/1 when serialized as int params.
        return [this._signalOptions.optionById(0).selected ? 1 : 0, this._signalOptions.optionById(1).selected ? 1 : 0];
    }

    // AS3: SendSignal.as::furniSelectionTitle()
    override furniSelectionTitle(id: number): string
    {
        if(id === 0)
        {
            return 'wiredfurni.params.sources.furni.title.signal_antenna';
        }

        return 'wiredfurni.params.sources.furni.title.signal_forward';
    }

    // AS3: SendSignal.as::userSelectionTitle()
    override userSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.users.title.signal_forward';
    }
}
