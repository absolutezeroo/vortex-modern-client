import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * InputSourcesConf — the wired "input sources" configuration carried inside a Triggerable
 * definition: the allowed and default furni/user selection sources for each selection slot.
 * Constructed inline from the message stream during a Triggerable parse.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/InputSourcesConf.as
 */
export class InputSourcesConf
{
    // AS3: InputSourcesConf.as::FURNI_SOURCE_FURNI_PICKS_1
    static readonly FURNI_SOURCE_FURNI_PICKS_1: number = 100;

    // AS3: InputSourcesConf.as::FURNI_SOURCE_FURNI_PICKS_2
    static readonly FURNI_SOURCE_FURNI_PICKS_2: number = 101;

    // AS3: InputSourcesConf.as::_SafeStr_10842 (value 110) — name derived: a furni-picks source that
    // groups with FURNI_SOURCE_FURNI_PICKS_1 in isDualFurniPickingMode()/allowFurniSelection().
    static readonly FURNI_SOURCE_FURNI_PICKS_MERGED: number = 110;

    // AS3: InputSourcesConf.as::_SafeStr_8690 (allowed furni sources per slot)
    private _allowedFurniSources: number[][];

    // AS3: InputSourcesConf.as::_SafeStr_8585 (allowed user sources per slot)
    private _allowedUserSources: number[][];

    // AS3: InputSourcesConf.as::_SafeStr_6654 (default furni sources)
    private _defaultFurniSources: number[];

    // AS3: InputSourcesConf.as::_SafeStr_7670 (default user sources)
    private _defaultUserSources: number[];

    // AS3: InputSourcesConf.as::InputSourcesConf()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._allowedFurniSources = InputSourcesConf.readAllowedSources(wrapper);
        this._allowedUserSources = InputSourcesConf.readAllowedSources(wrapper);
        this._defaultFurniSources = InputSourcesConf.readDefaultSources(wrapper);
        this._defaultUserSources = InputSourcesConf.readDefaultSources(wrapper);
    }

    // AS3: InputSourcesConf.as::readAllowedSources()
    private static readAllowedSources(wrapper: IMessageDataWrapper): number[][]
    {
        const result: number[][] = [];
        const slots: number = wrapper.readInt();
        for(let i = 0; i < slots; i++)
        {
            result[i] = [];
            const sources: number = wrapper.readInt();
            for(let j = 0; j < sources; j++)
            {
                result[i][j] = wrapper.readInt();
            }
        }
        return result;
    }

    // AS3: InputSourcesConf.as::readDefaultSources()
    private static readDefaultSources(wrapper: IMessageDataWrapper): number[]
    {
        const result: number[] = [];
        const count: number = wrapper.readInt();
        for(let i = 0; i < count; i++)
        {
            result.push(wrapper.readInt());
        }
        return result;
    }

    // AS3: InputSourcesConf.as::get amountFurniSelections()
    get amountFurniSelections(): number
    {
        return this._allowedFurniSources.length;
    }

    // AS3: InputSourcesConf.as::getAllowedFurniSources()
    getAllowedFurniSources(index: number): number[]
    {
        return this._allowedFurniSources[index];
    }

    // AS3: InputSourcesConf.as::get amountUserSelections()
    get amountUserSelections(): number
    {
        return this._allowedUserSources.length;
    }

    // AS3: InputSourcesConf.as::getAllowedUserSources()
    getAllowedUserSources(index: number): number[]
    {
        return this._allowedUserSources[index];
    }

    // AS3: InputSourcesConf.as::get defaultFurniSources()
    get defaultFurniSources(): number[]
    {
        return this._defaultFurniSources;
    }

    // AS3: InputSourcesConf.as::get defaultUserSources()
    get defaultUserSources(): number[]
    {
        return this._defaultUserSources;
    }

    // AS3: InputSourcesConf.as::isUsingAdvancedSettings()
    isUsingAdvancedSettings(furniSourceTypes: number[], userSourceTypes: number[]): boolean
    {
        for(let i = 0; i < this._defaultFurniSources.length; i++)
        {
            if(this._defaultFurniSources[i] !== furniSourceTypes[i])
            {
                return true;
            }
        }
        for(let i = 0; i < this._defaultUserSources.length; i++)
        {
            if(this._defaultUserSources[i] !== userSourceTypes[i])
            {
                return true;
            }
        }
        return false;
    }

    // AS3: InputSourcesConf.as::allowFurniSelection()
    allowFurniSelection(): boolean
    {
        for(let i = 0; i < this.amountFurniSelections; i++)
        {
            const allowed = this.getAllowedFurniSources(i);
            if(allowed.indexOf(100) !== -1 || allowed.indexOf(101) !== -1 || allowed.indexOf(110) !== -1)
            {
                return true;
            }
        }
        return false;
    }

    // AS3: InputSourcesConf.as::isDualFurniPickingMode()
    isDualFurniPickingMode(): boolean
    {
        let firstPick: boolean = false;
        let secondPick: boolean = false;
        for(let i = 0; i < this.amountFurniSelections; i++)
        {
            const allowed = this.getAllowedFurniSources(i);
            if(allowed.indexOf(100) !== -1 || allowed.indexOf(110) !== -1)
            {
                firstPick = true;
            }
            if(allowed.indexOf(101) !== -1)
            {
                secondPick = true;
            }
        }
        return firstPick && secondPick;
    }

    // AS3: InputSourcesConf.as::isFurniSelectionDefault()
    isFurniSelectionDefault(): boolean
    {
        return this._defaultFurniSources.indexOf(100) !== -1 || this._defaultFurniSources.indexOf(101) !== -1;
    }
}
