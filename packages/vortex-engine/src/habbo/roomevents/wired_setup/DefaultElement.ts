import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {IWiredElement} from './IWiredElement';
import type {IUserDefinedRoomEventsCtrl} from './IUserDefinedRoomEventsCtrl';
import type {ISourceTypeListener} from './inputsources/ISourceTypeListener';
import {WiredInputSourcePicker} from './inputsources/WiredInputSourcePicker';
import {VariableExtraSourceTypes} from './common/VariableExtraSourceTypes';
import {WrappedSourceTypeListener} from './WrappedSourceTypeListener';
import type {PresetManager} from './uibuilder/PresetManager';
import type {WiredStyle} from './uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from './uibuilder/WiredUIBuilder';

/**
 * DefaultElement — the base implementation of every wired vocabulary element. Provides neutral
 * defaults for the whole IWiredElement contract (no code, no inputs, no snapshot, furni+user merged
 * sources), which concrete trigger/action/condition/addon/selector/variable types override.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/DefaultElement.as
 */
export class DefaultElement implements IWiredElement
{
    // AS3: DefaultElement.as::INPUTS_TYPE_NONE
    public static readonly INPUTS_TYPE_NONE: number = 0;

    // AS3: DefaultElement.as::INPUTS_TYPE_UI_BUILDER
    public static readonly INPUTS_TYPE_UI_BUILDER: number = 1;

    // AS3: DefaultElement.as::_cont (set by concrete subclasses)
    protected _cont!: IWindowContainer;

    // AS3: DefaultElement.as::_roomEvents
    private _roomEvents!: HabboUserDefinedRoomEvents;

    // AS3: DefaultElement.as::_initialized
    private _initialized: boolean = false;

    // AS3: DefaultElement.as::get code()
    get code(): number
    {
        return -1;
    }

    // AS3: DefaultElement.as::get negativeCode()
    get negativeCode(): number
    {
        return -1;
    }

    // AS3: DefaultElement.as::get hasStateSnapshot()
    get hasStateSnapshot(): boolean
    {
        return false;
    }

    // AS3: DefaultElement.as::readIntParamsFromForm()
    readIntParamsFromForm(): number[]
    {
        return [];
    }

    // AS3: DefaultElement.as::readVariableIdsFromForm()
    readVariableIdsFromForm(): string[]
    {
        return [];
    }

    // AS3: DefaultElement.as::readStringParamFromForm()
    readStringParamFromForm(): string
    {
        return '';
    }

    // AS3: DefaultElement.as::setRoomEvents()
    setRoomEvents(roomEvents: HabboUserDefinedRoomEvents): void
    {
        this._roomEvents = roomEvents;
    }

    // AS3: DefaultElement.as::onInit()
    onInit(roomEvents: HabboUserDefinedRoomEvents): void
    {
        this._roomEvents = roomEvents;
        this._initialized = true;
    }

    // AS3: DefaultElement.as::onEditStart()
    onEditStart(_def: Triggerable): void
    {
    }

    // AS3: DefaultElement.as::onEditInitialized()
    onEditInitialized(): void
    {
    }

    // AS3: DefaultElement.as::onEditEnd()
    onEditEnd(): void
    {
    }

    // AS3: DefaultElement.as::validate()
    validate(): string | null
    {
        return null;
    }

    // AS3: DefaultElement.as::onGuildMemberships()
    onGuildMemberships(_event: unknown): void
    {
    }

    // AS3: DefaultElement.as::furniSelectionTitle()
    furniSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.furni.title';
    }

    // AS3: DefaultElement.as::userSelectionTitle()
    userSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.users.title';
    }

    // AS3: DefaultElement.as::get forceFurniSelection()
    get forceFurniSelection(): boolean
    {
        return this.hasStateSnapshot;
    }

    // AS3: DefaultElement.as::mergedSelections()
    mergedSelections(): number[][]
    {
        return [];
    }

    // AS3: DefaultElement.as::mergedSelectionTitle()
    mergedSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.merged.title';
    }

    // AS3: DefaultElement.as::setMergedType()
    setMergedType(_a: number, _b: number): void
    {
    }

    // AS3: DefaultElement.as::getMergedType()
    getMergedType(_id: number): number
    {
        return 0;
    }

    // AS3: DefaultElement.as::isInputSourceDisabled()
    isInputSourceDisabled(_a: number, _b: number): boolean
    {
        return false;
    }

    // AS3: DefaultElement.as::getCustomSourcesForMergedType()
    getCustomSourcesForMergedType(_id: number): number[]
    {
        return [];
    }

    // AS3: DefaultElement.as::get forceHidePickFurniInstructions()
    get forceHidePickFurniInstructions(): boolean
    {
        return false;
    }

    // AS3: DefaultElement.as::advancedAlwaysVisible()
    advancedAlwaysVisible(): boolean
    {
        return false;
    }

    // AS3: DefaultElement.as::get usingCustomAdvancedSettings()
    get usingCustomAdvancedSettings(): boolean
    {
        return false;
    }

    // AS3: DefaultElement.as::get requireConfirmation()
    get requireConfirmation(): unknown
    {
        return null;
    }

    // AS3: DefaultElement.as::buildInputs()
    buildInputs(_presetManager: PresetManager, _wiredStyle: WiredStyle, _builder: WiredUIBuilder): void
    {
    }

    // AS3: DefaultElement.as::get inputMode()
    get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_NONE;
    }

    // AS3: DefaultElement.as::mergedSourceOptions()
    mergedSourceOptions(id: number): number[]
    {
        const options = [WiredInputSourcePicker.FURNI_SOURCE, WiredInputSourcePicker.USER_SOURCE];

        for(const source of this.getCustomSourcesForMergedType(id))
        {
            if(!(!this._roomEvents.getBoolean('wired.variables.context_visible') && source === VariableExtraSourceTypes.CONTEXT_SOURCE && this.getMergedType(id) !== VariableExtraSourceTypes.CONTEXT_SOURCE))
            {
                options.push(source);
            }
        }

        return options;
    }

    // AS3: DefaultElement.as::hasCustomTypePicker()
    hasCustomTypePicker(_id: number): boolean
    {
        return false;
    }

    // AS3: DefaultElement.as::createSourceTypeListener()
    protected createSourceTypeListener(id: number): ISourceTypeListener
    {
        return new WrappedSourceTypeListener(this, id);
    }

    // AS3: DefaultElement.as::get cont()
    protected get cont(): IWindowContainer
    {
        return this._cont;
    }

    // AS3: DefaultElement.as::get roomEvents()
    get roomEvents(): HabboUserDefinedRoomEvents
    {
        return this._roomEvents;
    }

    // AS3: DefaultElement.as::get roomEventsCtrl()
    protected get roomEventsCtrl(): IUserDefinedRoomEventsCtrl
    {
        return this._roomEvents.wiredCtrl;
    }

    // AS3: DefaultElement.as::loc()
    protected loc(key: string): string
    {
        return this._roomEvents.localization.getLocalization(key, key);
    }

    // AS3: DefaultElement.as::l()
    protected l(key: string): string
    {
        return '${wiredfurni.params.' + key + '}';
    }

    // AS3: DefaultElement.as::get widthModifier()
    get widthModifier(): number
    {
        return 1;
    }

    // AS3: DefaultElement.as::get allowScrolling()
    get allowScrolling(): boolean
    {
        return false;
    }
}
