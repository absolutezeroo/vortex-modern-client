import type {IUserDefinedRoomEventsCtrl} from './IUserDefinedRoomEventsCtrl';
import type {HabboUserDefinedRoomEvents} from '../HabboUserDefinedRoomEvents';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('UserDefinedRoomEventsCtrl');

/**
 * UserDefinedRoomEventsCtrl — the core wired-setup controller ("wiredCtrl"): owns the wired
 * configuration dialog (pick furni, triggers/actions/conditions/selectors/variables/addons), the
 * clipboard, the UI builder and the save flow.
 *
 * TODO(AS3): STUB for Bloc C. The real controller is 1371 lines at
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/UserDefinedRoomEventsCtrl.as
 * and drags in the whole uibuilder/registries. Only the surface the spine touches is stubbed here
 * (stuffAdded/stuffSelected/close/clearCache/hasUIOpen); every method is a no-op placeholder so the
 * HabboUserDefinedRoomEvents component and its incoming handler can be wired without it. Do not treat
 * any behaviour here as ported.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/UserDefinedRoomEventsCtrl.as
 */
export class UserDefinedRoomEventsCtrl implements IUserDefinedRoomEventsCtrl
{
    // AS3: UserDefinedRoomEventsCtrl.as::_roomEvents (parent wired component)
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: UserDefinedRoomEventsCtrl.as::activeFurniPicks (backing field)
    private _activeFurniPicks: number = 0;

    // AS3: UserDefinedRoomEventsCtrl.as::UserDefinedRoomEventsCtrl()
    constructor(roomEvents: HabboUserDefinedRoomEvents)
    {
        this._roomEvents = roomEvents;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::stuffAdded()
    stuffAdded(_id: number): void
    {
        // TODO(AS3): Bloc C — track added stuff for the wired furni picker.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::stuffSelected()
    stuffSelected(_id: number): void
    {
        // TODO(AS3): Bloc C — open/route the wired config for the selected furni.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::stuffRemoved()
    stuffRemoved(_id: number): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::getStuffIds()
    getStuffIds(): number[]
    {
        // TODO(AS3): Bloc C.
        return [];
    }

    // AS3: UserDefinedRoomEventsCtrl.as::getStuffIds2()
    getStuffIds2(): number[]
    {
        // TODO(AS3): Bloc C.
        return [];
    }

    // AS3: UserDefinedRoomEventsCtrl.as::clearStuffPicks()
    clearStuffPicks(): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::resetToDefault()
    resetToDefault(): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::createClipboardCopy()
    createClipboardCopy(): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::pasteFromClipboard()
    pasteFromClipboard(): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::hasCurrentElementInClipboard()
    hasCurrentElementInClipboard(): boolean
    {
        // TODO(AS3): Bloc C.
        return false;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::get activeFurniPicks()
    get activeFurniPicks(): number
    {
        return this._activeFurniPicks;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::set activeFurniPicks()
    set activeFurniPicks(value: number)
    {
        this._activeFurniPicks = value;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::resizeFrame()
    resizeFrame(): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::setMergedSourceType()
    setMergedSourceType(_a: number, _b: number): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::updateSourceContainer()
    updateSourceContainer(_a: number, _b: number): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::get hidePickFurniInstructions()
    get hidePickFurniInstructions(): boolean
    {
        // TODO(AS3): Bloc C.
        return false;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::close()
    close(): void
    {
        // TODO(AS3): Bloc C — close the wired config dialog.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::prepareForUpdate()
    prepareForUpdate(_def: unknown): void
    {
        // TODO(AS3): Bloc C — apply an incoming trigger/action/condition/selector/variable/addon
        // definition into the open config dialog. `_def` is the Triggerable DTO (_SafeCls_2448).
        log.debug('prepareForUpdate ignored (wired-setup controller not ported — Bloc C)');
    }

    // AS3: UserDefinedRoomEventsCtrl.as::get isUsingAdvancedSettings()
    get isUsingAdvancedSettings(): boolean
    {
        // TODO(AS3): Bloc C.
        return false;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::get wiredStyle()
    get wiredStyle(): unknown
    {
        // TODO(AS3): Bloc D — real return type is WiredStyle.
        return null;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::get presetManager()
    get presetManager(): unknown
    {
        // TODO(AS3): Bloc D — real return type is PresetManager.
        return null;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::getStyleByName()
    getStyleByName(_name: string): unknown
    {
        // TODO(AS3): Bloc D — real return type is WiredStyle.
        return null;
    }

    // AS3: UserDefinedRoomEventsCtrl.as::setPreferredWiredStyleByName()
    setPreferredWiredStyleByName(_name: string): void
    {
        // TODO(AS3): Bloc D.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::onSaveFailure()
    onSaveFailure(): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::onSaveSuccess()
    onSaveSuccess(): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::update()
    update(_a: number = 0, _b: number = -1): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::onGuildMemberships()
    onGuildMemberships(_event: unknown): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::clearCache()
    clearCache(): void
    {
        // TODO(AS3): Bloc C.
    }

    // AS3: UserDefinedRoomEventsCtrl.as::hasUIOpen()
    hasUIOpen(): boolean
    {
        // TODO(AS3): Bloc C.
        return false;
    }
}
