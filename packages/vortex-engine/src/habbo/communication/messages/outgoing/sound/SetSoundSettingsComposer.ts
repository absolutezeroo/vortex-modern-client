import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Stores the account's three volume channels (header 3662), each as a 0-100 integer.
 *
 * **Constructor order and wire order are not the same, and that is AS3's doing.** The AS3
 * class takes `(trax, furni, generic)` and pushes them back to front:
 *
 * ```as3
 * public function _SafeCls_2171(param1:int, param2:int, param3:int) {
 *    _SafeStr_4642.push(param3);   // generic, first on the wire
 *    _SafeStr_4642.push(param2);   // furni
 *    _SafeStr_4642.push(param1);   // trax, last
 * }
 * ```
 *
 * so the packet is `[generic, furni, trax]`. Reading the constructor signature alone and
 * writing a `(trax, furni, generic)` parser is how `vortex-emulator` came to swap the
 * generic and trax channels — fixed there on 2026-08-02. This port keeps the AS3 signature
 * and does the reversal in the body, so the two stay comparable line for line.
 *
 * The class name is **derived**, not recovered: the composer is `_SafePkg_2091/_SafeCls_2171`
 * in every tree. It matches `vortex-emulator`'s `SetSoundSettingsEvent`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2091/_SafeCls_2171.as
 */
export class SetSoundSettingsComposer extends MessageComposer<[number, number, number]>
{
    // AS3: .../_SafePkg_2091/_SafeCls_2171.as::_SafeCls_2171()
    constructor(traxVolume: number, furniVolume: number, genericVolume: number)
    {
        super();

        this._data = [genericVolume, furniVolume, traxVolume];
    }

    // AS3: .../_SafePkg_2091/_SafeCls_2171.as::_SafeStr_4642
    private _data: [number, number, number];

    // AS3: .../_SafePkg_2091/_SafeCls_2171.as::getMessageArray()
    getMessageArray(): [number, number, number]
    {
        return this._data;
    }
}
