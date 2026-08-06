import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {NewUserExperienceGift} from './NewUserExperienceGift';

/**
 * One step of the NUX gift flow: the options offered for a given day/step pair.
 *
 * The server can send several of these at once; `NuxGiftSelectionView` walks them one at a time,
 * captioning the frame "n/total" while more than one is pending, and answers with one
 * `NewUserExperienceGiftSelection` per step once the user has picked for all of them.
 *
 * `dayIndex`/`stepIndex` are echoed straight back in that answer — they are the server's cursor
 * into the flow, not something the client interprets.
 *
 * Name recovered from PRODUCTION (`NewUserExperienceGiftOptions.as`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_3375.as
 */
export class NewUserExperienceGiftOptions
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_3375.as::_SafeStr_9089
    private _dayIndex: number;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_3375.as::_SafeStr_9011
    private _stepIndex: number;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_3375.as::_SafeStr_5343
    private _options: NewUserExperienceGift[];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_3375.as::_SafeCls_3375()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._dayIndex = wrapper.readInt();
        this._stepIndex = wrapper.readInt();
        this._options = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._options.push(new NewUserExperienceGift(wrapper));
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_3375.as::get dayIndex()
    get dayIndex(): number
    {
        return this._dayIndex;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_3375.as::get stepIndex()
    get stepIndex(): number
    {
        return this._stepIndex;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_3375.as::get options()
    get options(): NewUserExperienceGift[]
    {
        return this._options;
    }
}
