import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {BadgePointLimitsMessageParser} from '../../../parser/inventory/badges/BadgePointLimitsMessageParser';

/**
 * The badge-point limits table (header 3510).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2931/_SafeCls_3477.as
 * (obfuscated; `_SafeStr_4546[3510] = _SafeCls_3477` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as, and
 * `HabboInventory` (`_SafeCls_1951.as`) is its only handler — it feeds every pair straight into
 * `HabboLocalizationManager.setBadgePointLimit()`.)
 */
export class BadgePointLimitsMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_3477.as::_SafeCls_3477()
    constructor(callback: MessageEventCallback)
    {
        super(callback, BadgePointLimitsMessageParser);
    }
}
