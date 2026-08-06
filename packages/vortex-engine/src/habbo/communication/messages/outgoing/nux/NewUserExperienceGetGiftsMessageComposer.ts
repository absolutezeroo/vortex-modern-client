import {MessageComposer} from '@core/communication/messages/MessageComposer';
import type {NewUserExperienceGiftSelection} from './NewUserExperienceGiftSelection';

/**
 * Claims the NUX gifts the user picked — one `(dayIndex, stepIndex, giftIndex)` triple per step.
 *
 * **The length prefix is not the item count.** AS3 pushes `selections.length * 3`, i.e. the number
 * of integers that follow, then flattens the triples after it. Sending the item count instead
 * would leave the server reading two thirds of the payload as the next message.
 *
 * Header 3490, from WIN63's registry (`_composers[3490] = _SafeCls_2936`); the emulator
 * corroborates it as `NewUserExperienceGetGiftsMessageEvent`. The class name is recovered from
 * `sources/win63_version/habbo/communication/messages/outgoing/nux/NewUserExperienceGetGiftsMessageComposer.as`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2937/_SafeCls_2936.as
 */
export class NewUserExperienceGetGiftsMessageComposer extends MessageComposer<number[]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2937/_SafeCls_2936.as::_SafeStr_4642
    private _data: number[] = [];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2937/_SafeCls_2936.as::_SafeCls_2936()
    constructor(selections: NewUserExperienceGiftSelection[])
    {
        super();

        this._data.push(selections.length * 3);

        for(const selection of selections)
        {
            this._data.push(selection.dayIndex);
            this._data.push(selection.stepIndex);
            this._data.push(selection.giftIndex);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2937/_SafeCls_2936.as::getMessageArray()
    getMessageArray(): number[]
    {
        return this._data;
    }
}
