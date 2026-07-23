import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import {TextParam} from '../uibuilder/params/TextParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {SliderPreset} from '../uibuilder/presets/SliderPreset';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * RelativeFurniMove — the "move furni by a relative offset" wired action: a horizontal axis
 * (positive/negative direction) with a 0..20 distance slider and a vertical axis with its own slider.
 * Each axis is stored as one signed intParam (negative direction ⇒ negative value): intParams
 * [horizontal, vertical].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4186`; the name follows the code it returns
 * (ActionTypeCodes.RELATIVE_FURNI_MOVE).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4186.as
 */
export class RelativeFurniMove extends DefaultActionType
{
    // AS3: _SafeCls_4186.as::AXIS_POSITIVE (=4)
    // AS3 declares this constant (value 4); the decompiled body inlines the bare literal.
    private static readonly AXIS_POSITIVE: number = 4;

    // AS3: _SafeCls_4186.as::AXIS_NEGATIVE (=5)
    // AS3 declares this constant (value 5); the decompiled body inlines the bare literal.
    private static readonly AXIS_NEGATIVE: number = 5;

    // AS3: _SafeCls_4186.as::_horizontalAxis
    private _horizontalAxis!: RadioGroupPreset;

    // AS3: _SafeCls_4186.as::_verticalAxis
    private _verticalAxis!: RadioGroupPreset;

    // AS3: _SafeCls_4186.as::_horizontalSlider
    private _horizontalSlider!: SliderPreset;

    // AS3: _SafeCls_4186.as::_verticalSlider
    private _verticalSlider!: SliderPreset;

    // AS3: _SafeCls_4186.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.RELATIVE_FURNI_MOVE;
    }

    // AS3: _SafeCls_4186.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4186.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._horizontalAxis = presetManager.createRadioGroup([
            this.createAxisOption(RelativeFurniMove.AXIS_POSITIVE, 'move_2'),
            this.createAxisOption(RelativeFurniMove.AXIS_NEGATIVE, 'move_6')
        ], null, 4);
        this._horizontalAxis.selected = RelativeFurniMove.AXIS_POSITIVE;
        const horizontalLabel = presetManager.createText(this.l('movement.horizontal.distance'), new TextParam(1));
        this._horizontalSlider = presetManager.createSliderPreset(0, 20, 1);
        this._horizontalSlider.addEventListener('change', this._onHorizontalSliderChange);
        const horizontalList = presetManager.createSimpleListView(true, [this._horizontalAxis, horizontalLabel, this._horizontalSlider]);
        const horizontalSection = presetManager.createSection(this.l('movement.horizontal.selection'), horizontalList);

        this._verticalAxis = presetManager.createRadioGroup([
            this.createAxisOption(RelativeFurniMove.AXIS_POSITIVE, 'move_4'),
            this.createAxisOption(RelativeFurniMove.AXIS_NEGATIVE, 'move_0')
        ], null, 4);
        this._verticalAxis.selected = RelativeFurniMove.AXIS_POSITIVE;
        const verticalLabel = presetManager.createText(this.l('movement.vertical.distance'), new TextParam(1));
        this._verticalSlider = presetManager.createSliderPreset(0, 20, 1);
        this._verticalSlider.addEventListener('change', this._onVerticalSliderChange);
        const verticalList = presetManager.createSimpleListView(true, [this._verticalAxis, verticalLabel, this._verticalSlider]);
        const verticalSection = presetManager.createSection(this.l('movement.vertical.selection'), verticalList);

        this.updateDistanceLocalization('horizontal', 0);
        this.updateDistanceLocalization('vertical', 0);

        builder.addElements(horizontalSection, verticalSection);
    }

    // AS3: _SafeCls_4186.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this.setAxisValue(def.getInt(0), this._horizontalAxis, this._horizontalSlider, 'horizontal');
        this.setAxisValue(def.getInt(1), this._verticalAxis, this._verticalSlider, 'vertical');
    }

    // AS3: _SafeCls_4186.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];
        params.push(this.getAxisValue(this._horizontalAxis, this._horizontalSlider));
        params.push(this.getAxisValue(this._verticalAxis, this._verticalSlider));

        return params;
    }

    // AS3: _SafeCls_4186.as::createAxisOption()
    private createAxisOption(id: number, asset: string): RadioButtonParam
    {
        const param = new RadioButtonParam(id, null);
        param.iconAssetName = asset;

        return param;
    }

    // AS3: _SafeCls_4186.as::getAxisValue()
    private getAxisValue(group: RadioGroupPreset, slider: SliderPreset): number
    {
        const value = slider.value;

        return group.selected === RelativeFurniMove.AXIS_NEGATIVE ? -value : value;
    }

    // AS3: _SafeCls_4186.as::setAxisValue()
    private setAxisValue(value: number, group: RadioGroupPreset, slider: SliderPreset, axis: string): void
    {
        const magnitude = Math.abs(value);
        slider.value = magnitude;
        group.selected = value < 0 ? RelativeFurniMove.AXIS_NEGATIVE : RelativeFurniMove.AXIS_POSITIVE;
        this.updateDistanceLocalization(axis, magnitude);
    }

    // AS3: _SafeCls_4186.as::onHorizontalSliderChange()
    private _onHorizontalSliderChange = (): void =>
    {
        this.updateDistanceLocalization('horizontal', this._horizontalSlider.value);
    };

    // AS3: _SafeCls_4186.as::onVerticalSliderChange()
    private _onVerticalSliderChange = (): void =>
    {
        this.updateDistanceLocalization('vertical', this._verticalSlider.value);
    };

    // AS3: _SafeCls_4186.as::updateDistanceLocalization()
    private updateDistanceLocalization(axis: string, distance: number): void
    {
        this.roomEvents.localization.registerParameter('wiredfurni.params.movement.' + axis + '.distance', 'distance', '' + distance);
    }
}
