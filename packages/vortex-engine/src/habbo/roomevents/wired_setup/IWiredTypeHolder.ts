import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import type {IWiredElement} from './IWiredElement';

/**
 * IWiredTypeHolder — a holder of one wired type category (a trigger/action/condition/… registry
 * entry): resolves a concrete wired element by its code, exposes the category key (used for the type
 * icon / localization), and decides whether it accepts a given furni definition.
 *
 * Name derived: the AS3 interface is obfuscated as `_SafeCls_2661` with no counterpart in the older
 * vortex-flash-client; the name follows the port's convention and its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/_SafeCls_2661.as
 */
export interface IWiredTypeHolder
{
    // AS3: _SafeCls_2661.as::getElementByCode()
    getElementByCode(code: number): IWiredElement;

    // AS3: _SafeCls_2661.as::getKey()
    getKey(): string;

    // AS3: _SafeCls_2661.as::acceptTriggerable()
    acceptTriggerable(triggerable: Triggerable): boolean;
}
