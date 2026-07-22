import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from './uibuilder/PresetManager';
import type {WiredStyle} from './uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from './uibuilder/WiredUIBuilder';

/**
 * IWiredElement — one concrete wired vocabulary element (a trigger / action / condition / addon /
 * selector / variable type). It owns its server code, builds its own configuration inputs into the
 * wired dialog, reads its parameters back from the form, validates them, and drives the input-source
 * (furni/user/merged) selection for its slots.
 *
 * Name derived: the AS3 interface is obfuscated as `_SafeCls_2869` with no counterpart in the older
 * vortex-flash-client; the name follows the port's convention and its concrete base `DefaultElement`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/_SafeCls_2869.as
 */
export interface IWiredElement
{
    // AS3: _SafeCls_2869.as::get code()
    readonly code: number;

    // AS3: _SafeCls_2869.as::get negativeCode()
    readonly negativeCode: number;

    // AS3: _SafeCls_2869.as::setRoomEvents()
    setRoomEvents(roomEvents: HabboUserDefinedRoomEvents): void;

    // AS3: _SafeCls_2869.as::onInit()
    onInit(roomEvents: HabboUserDefinedRoomEvents): void;

    // AS3: _SafeCls_2869.as::onEditStart()
    onEditStart(def: Triggerable): void;

    // AS3: _SafeCls_2869.as::onEditInitialized()
    onEditInitialized(): void;

    // AS3: _SafeCls_2869.as::onEditEnd()
    onEditEnd(): void;

    // AS3: _SafeCls_2869.as::readIntParamsFromForm()
    readIntParamsFromForm(): number[];

    // AS3: _SafeCls_2869.as::readVariableIdsFromForm()
    readVariableIdsFromForm(): string[];

    // AS3: _SafeCls_2869.as::readStringParamFromForm()
    readStringParamFromForm(): string;

    // AS3: _SafeCls_2869.as::get hasStateSnapshot()
    readonly hasStateSnapshot: boolean;

    // AS3: _SafeCls_2869.as::validate()
    validate(): string | null;

    // AS3: _SafeCls_2869.as::get inputMode()
    readonly inputMode: number;

    // AS3: _SafeCls_2869.as::buildInputs()
    buildInputs(presetManager: PresetManager, wiredStyle: WiredStyle, builder: WiredUIBuilder): void;

    // AS3: _SafeCls_2869.as::furniSelectionTitle()
    furniSelectionTitle(id: number): string;

    // AS3: _SafeCls_2869.as::userSelectionTitle()
    userSelectionTitle(id: number): string;

    // AS3: _SafeCls_2869.as::get forceFurniSelection()
    readonly forceFurniSelection: boolean;

    // AS3: _SafeCls_2869.as::mergedSelections()
    mergedSelections(): number[][];

    // AS3: _SafeCls_2869.as::mergedSelectionTitle()
    mergedSelectionTitle(id: number): string;

    // AS3: _SafeCls_2869.as::setMergedType()
    setMergedType(a: number, b: number): void;

    // AS3: _SafeCls_2869.as::getMergedType()
    getMergedType(id: number): number;

    // AS3: _SafeCls_2869.as::mergedSourceOptions()
    mergedSourceOptions(id: number): number[];

    // AS3: _SafeCls_2869.as::hasCustomTypePicker()
    hasCustomTypePicker(id: number): boolean;

    // AS3: _SafeCls_2869.as::isInputSourceDisabled()
    isInputSourceDisabled(a: number, b: number): boolean;

    // AS3: _SafeCls_2869.as::getCustomSourcesForMergedType()
    getCustomSourcesForMergedType(id: number): number[];

    // AS3: _SafeCls_2869.as::get forceHidePickFurniInstructions()
    readonly forceHidePickFurniInstructions: boolean;

    // AS3: _SafeCls_2869.as::advancedAlwaysVisible()
    advancedAlwaysVisible(): boolean;

    // AS3: _SafeCls_2869.as::get usingCustomAdvancedSettings()
    readonly usingCustomAdvancedSettings: boolean;

    // AS3: _SafeCls_2869.as::onGuildMemberships()
    // TODO(AS3): param real type is the guild-memberships event (_SafePkg_1731._SafeCls_1876) — not ported.
    onGuildMemberships(event: unknown): void;

    // AS3: _SafeCls_2869.as::get requireConfirmation()
    // AS3 returns Object (null when no confirmation is required).
    readonly requireConfirmation: unknown;

    // AS3: _SafeCls_2869.as::get roomEvents()
    readonly roomEvents: HabboUserDefinedRoomEvents;

    // AS3: _SafeCls_2869.as::get widthModifier()
    readonly widthModifier: number;

    // AS3: _SafeCls_2869.as::get allowScrolling()
    readonly allowScrolling: boolean;
}
