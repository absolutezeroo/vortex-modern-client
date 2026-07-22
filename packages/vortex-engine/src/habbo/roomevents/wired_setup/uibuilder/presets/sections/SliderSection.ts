import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {ISliderConverter} from '../../../common/slider_converter/ISliderConverter';
import {SliderValueEcho} from '../../../common/slider_converter/SliderValueEcho';
import {SliderValuePulses} from '../../../common/slider_converter/SliderValuePulses';
import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import {NumberInputParam} from '../../params/NumberInputParam';
import {SectionParam} from '../../params/SectionParam';
import type {NumberInputPreset} from '../NumberInputPreset';
import type {SliderPreset} from '../SliderPreset';
import {AbstractSectionPreset} from './AbstractSectionPreset';

/**
 * SliderSection — a section wrapping a slider, with an optional synced numeric input in the header,
 * and a title that shows the converter-formatted current value (unless a number input is shown).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/sections/SliderSection.as
 */
export class SliderSection extends AbstractSectionPreset
{
    // AS3: SliderSection.as::CONVERTER_ECHO
    public static readonly CONVERTER_ECHO: ISliderConverter = new SliderValueEcho();

    // AS3: SliderSection.as::CONVERTER_PULSES
    public static readonly CONVERTER_PULSES: ISliderConverter = new SliderValuePulses();

    // AS3: SliderSection.as::_slider
    private _slider: SliderPreset;

    // AS3: SliderSection.as::_converter
    private _converter: ISliderConverter;

    // AS3: SliderSection.as::_localizationKey
    private _localizationKey: string;

    // AS3: SliderSection.as::_unit
    private _unit: string;

    // AS3: SliderSection.as::_numberInput
    private _numberInput: NumberInputPreset | null = null;

    // AS3: SliderSection.as::_ignoreListeners
    private _ignoreListeners: boolean = false;

    // AS3: SliderSection.as::SliderSection()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, localizationKey: string, unit: string, converter: ISliderConverter, min: number = 0, max: number = 1, step: number = 0, showNumberInput: boolean = true, param: SectionParam | null = null)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._converter = converter;
        this._localizationKey = localizationKey;
        this._unit = unit;
        this._slider = presetManager.createSliderPreset(min, max, step);

        if(showNumberInput && (param == null || param.headerOptionLeft == null))
        {
            this._numberInput = presetManager.createNumberInput(new NumberInputParam(0, min, max, 40, converter.precision, converter.endsWithFive));
            this._numberInput.onValueChange = this._onTextValueChange;

            if(param == null)
            {
                param = new SectionParam();
            }

            param.headerOptionLeft = this._numberInput;
            param.titleYOffset = wiredStyle.namedInputOffset;
        }

        this.initializeSection(roomEvents.localization.getLocalization(localizationKey), this._slider, param);

        if(!showNumberInput)
        {
            this.updateName();
        }

        this._slider.addEventListener('change', this._onSliderChange);
    }

    // AS3: SliderSection.as::onTextValueChange()
    private _onTextValueChange = (value: number): void =>
    {
        if(this._ignoreListeners)
        {
            return;
        }

        this._ignoreListeners = true;
        this._slider.value = value;
        this._ignoreListeners = false;
    };

    // AS3: SliderSection.as::onSliderChange()
    private _onSliderChange = (): void =>
    {
        if(this._ignoreListeners)
        {
            return;
        }

        if(this._numberInput != null)
        {
            this._ignoreListeners = true;
            this._numberInput.value = this._slider.value;
            this._ignoreListeners = false;
        }
        else
        {
            this.updateName();
        }
    };

    // AS3: SliderSection.as::updateName()
    private updateName(): void
    {
        this.sectionTitle = this.localizations.getLocalizationWithParams(this._localizationKey, '', this._unit, this._converter.toString(this.value));
    }

    // AS3: SliderSection.as::get value()
    get value(): number
    {
        return this._slider.value;
    }

    // AS3: SliderSection.as::set value()
    set value(value: number)
    {
        this._ignoreListeners = true;
        this._slider.value = value;

        if(this._numberInput != null)
        {
            this._numberInput.value = value;
        }

        this.updateName();
        this._ignoreListeners = false;
    }

    // AS3: SliderSection.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._slider = null as unknown as SliderPreset;
        this._converter = null as unknown as ISliderConverter;
        this._numberInput = null;
    }
}
