import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {WiredInputSourcePicker} from '../inputsources/WiredInputSourcePicker';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {NumberInputParam} from '../uibuilder/params/NumberInputParam';
import type {NamedNumberInputPreset} from '../uibuilder/presets/combinations/NamedNumberInputPreset';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * MoveAsGroup — the "move furni as a group" wired action: an x/y offset pair (each -64..64) plus a
 * merged furni/user target-location source, stored as intParams [targetIsUser, offsetX, offsetY].
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/MoveAsGroup.as
 */
export class MoveAsGroup extends DefaultActionType
{
    // AS3: MoveAsGroup.as::OFFSET_MIN (declared but unused; AS3 uses the literal -64 inline)
    private static readonly OFFSET_MIN: number = -64;

    // AS3: MoveAsGroup.as::_SafeStr_10747 (name derived: OFFSET_MAX; declared but unused; AS3 uses the literal 64 inline)
    private static readonly OFFSET_MAX: number = 64;

    // AS3: MoveAsGroup.as::_SafeStr_6999 (name derived: whether the target location comes from the user source)
    private _targetIsUser: boolean = true;

    // AS3: MoveAsGroup.as::_SafeStr_7606 (name derived: the x offset input)
    private _offsetX!: NamedNumberInputPreset;

    // AS3: MoveAsGroup.as::_SafeStr_7548 (name derived: the y offset input)
    private _offsetY!: NamedNumberInputPreset;

    // AS3: MoveAsGroup.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.MOVE_AS_GROUP;
    }

    // AS3: MoveAsGroup.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: MoveAsGroup.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const usageInfo = presetManager.createUsageInfoSection('${wiredfurni.params.move_as_group.usage_info}');
        this._offsetX = presetManager.createNamedNumberInput(new NumberInputParam(0, -64, 64), '${wiredfurni.params.place_furni.offsets.x}');
        this._offsetY = presetManager.createNamedNumberInput(new NumberInputParam(0, -64, 64), '${wiredfurni.params.place_furni.offsets.y}');
        const listView = presetManager.createSimpleListView(true, [this._offsetX, this._offsetY]);
        const section = presetManager.createSection('${wiredfurni.params.place_furni.offsets}', listView);

        builder.addElements(usageInfo, section);
    }

    // AS3: MoveAsGroup.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._targetIsUser = def.getBoolean(0);
        this._offsetX.value = def.getInt(1);
        this._offsetY.value = def.getInt(2);
    }

    // AS3: MoveAsGroup.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._targetIsUser ? 1 : 0, this._offsetX.value, this._offsetY.value];
    }

    // AS3: MoveAsGroup.as::mergedSelections()
    override mergedSelections(): number[][]
    {
        return [[1, 0]];
    }

    // AS3: MoveAsGroup.as::setMergedType()
    override setMergedType(_a: number, b: number): void
    {
        this._targetIsUser = b === WiredInputSourcePicker.USER_SOURCE;
    }

    // AS3: MoveAsGroup.as::getMergedType()
    override getMergedType(_id: number): number
    {
        return this._targetIsUser ? WiredInputSourcePicker.USER_SOURCE : WiredInputSourcePicker.FURNI_SOURCE;
    }

    // AS3: MoveAsGroup.as::furniSelectionTitle()
    override furniSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.furni.title.mv.0';
    }

    // AS3: MoveAsGroup.as::mergedSelectionTitle()
    override mergedSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.merged.title.target_location';
    }

    // AS3: MoveAsGroup.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }

    // AS3: MoveAsGroup.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }
}
