import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import type {InputSourcesConf} from '@habbo/communication/messages/incoming/userdefinedroomevents/InputSourcesConf';

import type {HabboUserDefinedRoomEvents} from '../../HabboUserDefinedRoomEvents';
import {VariableExtraSourceTypes} from '../common/VariableExtraSourceTypes';
import type {IWiredElement} from '../IWiredElement';
import type {IUserDefinedRoomEventsCtrl} from '../IUserDefinedRoomEventsCtrl';
import type {ISourceTypeListener} from './ISourceTypeListener';

/**
 * WiredInputSourcePicker — the input-source cycler for a wired element: owns a source-type slot
 * (furni / user / merged) and steps through the allowed sources for that slot, mutating the element's
 * definition snapshot (furniSourceTypes / userSourceTypes) and producing the display text shown next to
 * the source arrows, plus the stuff-picking special mode and disabled state.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/inputsources/WiredInputSourcePicker.as
 */
export class WiredInputSourcePicker implements ISourceTypeListener
{
    // AS3: WiredInputSourcePicker.as::_SafeStr_4603 (name derived: the furni source-type slot)
    public static readonly FURNI_SOURCE: number = 0;

    // AS3: WiredInputSourcePicker.as::USER_SOURCE
    public static readonly USER_SOURCE: number = 1;

    // AS3: WiredInputSourcePicker.as::MERGED_SOURCE
    public static readonly MERGED_SOURCE: number = 2;

    // AS3: WiredInputSourcePicker.as::STUFF_PICKING_MODE_NONE
    public static readonly STUFF_PICKING_MODE_NONE: number = 0;

    // AS3: WiredInputSourcePicker.as::STUFF_PICKING_MODE_1
    public static readonly STUFF_PICKING_MODE_1: number = 1;

    // AS3: WiredInputSourcePicker.as::STUFF_PICKING_MODE_2
    public static readonly STUFF_PICKING_MODE_2: number = 2;

    // AS3: WiredInputSourcePicker.as::_disposed
    private _disposed: boolean = false;

    // AS3: WiredInputSourcePicker.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: WiredInputSourcePicker.as::_SafeStr_5473 (name derived: the base source type)
    private readonly _sourceType: number;

    // AS3: WiredInputSourcePicker.as::_SafeStr_4872 (name derived: the slot id)
    private readonly _id: number;

    // AS3: WiredInputSourcePicker.as::_SafeStr_4792 (name derived: the current definition)
    private _def: Triggerable | null = null;

    // AS3: WiredInputSourcePicker.as::_SafeStr_4896 (name derived: the current element)
    private _element: IWiredElement | null = null;

    // AS3: WiredInputSourcePicker.as::_selectionCache (merged-source per-type selection memory)
    private _selectionCache: Map<number, number> | null = null;

    // AS3: WiredInputSourcePicker.as::_SafeStr_10148 (name derived: the selected display text)
    private _selectedText: string = '';

    // AS3: WiredInputSourcePicker.as::_stuffPickingSpecialMode
    private _stuffPickingSpecialMode: number = 0;

    // AS3: WiredInputSourcePicker.as::_SafeStr_9985 (name derived: whether the arrows are disabled)
    private _isButtonsDisabled: boolean = false;

    // AS3: WiredInputSourcePicker.as::_SafeStr_6948 (name derived: whether the section is disabled)
    private _sectionDisabled: boolean = false;

    // AS3: WiredInputSourcePicker.as::WiredInputSourcePicker()
    constructor(roomEvents: HabboUserDefinedRoomEvents, sourceType: number, id: number)
    {
        this._roomEvents = roomEvents;
        this._sourceType = sourceType;
        this._id = id;

        if(this._sourceType === WiredInputSourcePicker.MERGED_SOURCE)
        {
            this._selectionCache = new Map<number, number>();
        }
    }

    // AS3: WiredInputSourcePicker.as::getTypeNameForSource()
    public static getTypeNameForSource(source: number): string
    {
        if(source === WiredInputSourcePicker.FURNI_SOURCE)
        {
            return 'furni';
        }

        if(source === WiredInputSourcePicker.USER_SOURCE)
        {
            return 'users';
        }

        if(source === VariableExtraSourceTypes.CONTEXT_SOURCE)
        {
            return 'context';
        }

        if(source === VariableExtraSourceTypes.GLOBAL_SOURCE)
        {
            return 'global';
        }

        return '';
    }

    // AS3: WiredInputSourcePicker.as::onChangeInputSource()
    onChangeInputSource(forward: boolean): void
    {
        if(this._def === null || this._element === null)
        {
            return;
        }

        const conf: InputSourcesConf = this._def.inputSourcesConf;
        let allowed: number[];
        let index: number;
        let furniSlot = 0;
        let userSlot = 0;
        let mergedType = 0;

        if(this._sourceType === WiredInputSourcePicker.FURNI_SOURCE)
        {
            allowed = conf.getAllowedFurniSources(this._id);
            index = allowed.indexOf(this._def.furniSourceTypes[this._id]);
        }
        else if(this._sourceType === WiredInputSourcePicker.USER_SOURCE)
        {
            allowed = conf.getAllowedUserSources(this._id);
            index = allowed.indexOf(this._def.userSourceTypes[this._id]);
        }
        else
        {
            const selection = this._element.mergedSelections()[this._id];
            furniSlot = selection[0];
            userSlot = selection[1];
            mergedType = this._element.getMergedType(this._id);

            if(mergedType === WiredInputSourcePicker.FURNI_SOURCE)
            {
                allowed = conf.getAllowedFurniSources(furniSlot);
                index = allowed.indexOf(this._def.furniSourceTypes[furniSlot]);
            }
            else
            {
                if(mergedType !== WiredInputSourcePicker.USER_SOURCE)
                {
                    return;
                }

                allowed = conf.getAllowedUserSources(userSlot);
                index = allowed.indexOf(this._def.userSourceTypes[userSlot]);
            }
        }

        if(index === -1)
        {
            index = 0;
        }
        else if(forward)
        {
            index = (index + 1) % allowed.length;
        }
        else
        {
            index = (index - 1 + allowed.length) % allowed.length;
        }

        if(this._sourceType === WiredInputSourcePicker.FURNI_SOURCE)
        {
            this._def.furniSourceTypes[this._id] = allowed[index];
        }
        else if(this._sourceType === WiredInputSourcePicker.USER_SOURCE)
        {
            this._def.userSourceTypes[this._id] = allowed[index];
        }
        else if(mergedType === WiredInputSourcePicker.FURNI_SOURCE)
        {
            this._def.furniSourceTypes[furniSlot] = allowed[index];
        }
        else if(mergedType === WiredInputSourcePicker.USER_SOURCE)
        {
            this._def.userSourceTypes[userSlot] = allowed[index];
        }

        this.refreshContainer(this._def, this._element);
    }

    // AS3: WiredInputSourcePicker.as::set sourceType()
    set sourceType(type: number)
    {
        if(this._sourceType !== WiredInputSourcePicker.MERGED_SOURCE || this._def === null || this._element === null || this._selectionCache === null)
        {
            return;
        }

        const previousType = this._element.getMergedType(this._id);
        this._element.setMergedType(this._id, type);
        const selection = this._element.mergedSelections()[this._id];
        const furniSlot = selection[0];
        const userSlot = selection[1];

        if(previousType === WiredInputSourcePicker.FURNI_SOURCE)
        {
            this._selectionCache.set(previousType, this._def.furniSourceTypes[furniSlot]);
        }
        else if(previousType === WiredInputSourcePicker.USER_SOURCE)
        {
            this._selectionCache.set(previousType, this._def.userSourceTypes[userSlot]);
        }

        const conf: InputSourcesConf = this._def.inputSourcesConf;

        if(type === WiredInputSourcePicker.FURNI_SOURCE)
        {
            const value = this._selectionCache.has(type) ? this._selectionCache.get(type)! : conf.getAllowedFurniSources(furniSlot)[0];
            this._def.furniSourceTypes[furniSlot] = value;
        }
        else if(type === WiredInputSourcePicker.USER_SOURCE)
        {
            const value = this._selectionCache.has(type) ? this._selectionCache.get(type)! : conf.getAllowedUserSources(userSlot)[0];
            this._def.userSourceTypes[userSlot] = value;
        }

        this.refreshContainer(this._def, this._element);
    }

    // AS3: WiredInputSourcePicker.as::refreshContainer()
    refreshContainer(def: Triggerable, element: IWiredElement): void
    {
        if(this._def !== def || this._element !== element)
        {
            this._def = def;
            this._element = element;

            if(this._sourceType === WiredInputSourcePicker.MERGED_SOURCE)
            {
                this._selectionCache = new Map<number, number>();
            }
        }

        let isSpecialType = false;
        let typeName: string;
        let sourceValue = 0;

        if(this._sourceType === WiredInputSourcePicker.FURNI_SOURCE)
        {
            typeName = 'furni';
            sourceValue = def.furniSourceTypes[this._id];
        }
        else if(this._sourceType === WiredInputSourcePicker.USER_SOURCE)
        {
            typeName = 'users';
            sourceValue = def.userSourceTypes[this._id];
        }
        else
        {
            const selection = element.mergedSelections()[this._id];
            const furniSlot = selection[0];
            const userSlot = selection[1];
            const mergedType = element.getMergedType(this._id);

            if(mergedType === WiredInputSourcePicker.FURNI_SOURCE)
            {
                typeName = 'furni';
                sourceValue = def.furniSourceTypes[furniSlot];
            }
            else if(mergedType === WiredInputSourcePicker.USER_SOURCE)
            {
                typeName = 'users';
                sourceValue = def.userSourceTypes[userSlot];
            }
            else
            {
                isSpecialType = true;
                typeName = WiredInputSourcePicker.getTypeNameForSource(element.getMergedType(this._id));
            }
        }

        const key = isSpecialType ? 'wiredfurni.params.sources.' + typeName : 'wiredfurni.params.sources.' + typeName + '.' + sourceValue;
        let text = this._roomEvents.localization.getLocalization(key, key);

        this._stuffPickingSpecialMode = WiredInputSourcePicker.STUFF_PICKING_MODE_NONE;

        if(typeName === 'furni')
        {
            const isDual = def.inputSourcesConf.isDualFurniPickingMode();
            const hideInstructions = this.wiredCtrl.hidePickFurniInstructions;
            let mode = WiredInputSourcePicker.STUFF_PICKING_MODE_NONE;
            let stuffIds: number[] | null = null;

            if(sourceValue === 100 || sourceValue === 110)
            {
                stuffIds = this.wiredCtrl.getStuffIds();
                mode = WiredInputSourcePicker.STUFF_PICKING_MODE_1;
            }
            else if(sourceValue === 101)
            {
                stuffIds = this.wiredCtrl.getStuffIds2();
                mode = WiredInputSourcePicker.STUFF_PICKING_MODE_2;
            }

            if(isDual && mode !== WiredInputSourcePicker.STUFF_PICKING_MODE_NONE)
            {
                this._stuffPickingSpecialMode = mode;
            }

            if((isDual || hideInstructions) && stuffIds !== null)
            {
                text += ' [' + stuffIds.length + '/' + def.furniLimit + ']';
            }
        }

        this._isButtonsDisabled = isSpecialType;
        this._selectedText = text;
        this._sectionDisabled = element.isInputSourceDisabled(this._id, this._sourceType);
    }

    // AS3: WiredInputSourcePicker.as::get sourceType()
    get sourceType(): number
    {
        return this._sourceType;
    }

    // AS3: WiredInputSourcePicker.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: WiredInputSourcePicker.as::get selectedText()
    get selectedText(): string
    {
        return this._selectedText;
    }

    // AS3: WiredInputSourcePicker.as::get isButtonsDisabled()
    get isButtonsDisabled(): boolean
    {
        return this._isButtonsDisabled;
    }

    // AS3: WiredInputSourcePicker.as::get stuffPickingSpecialMode()
    get stuffPickingSpecialMode(): number
    {
        return this._stuffPickingSpecialMode;
    }

    // AS3: WiredInputSourcePicker.as::get wiredCtrl()
    private get wiredCtrl(): IUserDefinedRoomEventsCtrl
    {
        return this._roomEvents.wiredCtrl;
    }

    // AS3: WiredInputSourcePicker.as::get disabled()
    get disabled(): boolean
    {
        return this._sectionDisabled;
    }

    // AS3: WiredInputSourcePicker.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._roomEvents = null as unknown as HabboUserDefinedRoomEvents;
        this._def = null;
        this._element = null;
        this._selectionCache = null;
        this._disposed = true;
    }

    // AS3: WiredInputSourcePicker.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }
}
