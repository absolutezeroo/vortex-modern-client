import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ask for the point thresholds behind every levelled badge — header 2944 in WIN63's registry
 * (`_SafeCls_2046.as::_composers[2944]`). Empty payload.
 *
 * The answer (`BadgePointLimitsMessageEvent`, 3510) is what
 * `HabboLocalizationManager.setBadgeDetails()` reads to turn "achievement X level 3" into a
 * localized "3/10" progress line; without the request that table stays empty and every levelled
 * badge shows its limit as 0.
 *
 * `HabboInventory.initComponent()` is its only sender, once at boot.
 *
 * Name RECOVERED from `vortex-emulator`'s `GetBadgePointLimitsMessage` handler, which answers this
 * header; the class is obfuscated in every AS3 tree and the message has no readable filename in
 * `win63_version` either.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2020/_SafeCls_2019.as
 */
export class GetBadgePointLimitsComposer extends MessageComposer<[]>
{
    // AS3: _SafeCls_2019.as::_SafeCls_2019()
    constructor()
    {
        super();
    }

    // AS3: _SafeCls_2019.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
