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
    // TODO(AS3): real return type is IWiredElement (`_SafeCls_2869`) — a Bloc B type, not ported yet.
    getElementByCode(code: number): unknown;

    // AS3: _SafeCls_2661.as::getKey()
    getKey(): string;

    // AS3: _SafeCls_2661.as::acceptTriggerable()
    // TODO(AS3): real param type is the furni definition (`_SafeCls_2448`) — a Bloc B type, not ported yet.
    acceptTriggerable(triggerable: unknown): boolean;
}
