import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Marks the guide advertisement as read (header 1850).
 *
 * Sent from two places, which is why it lives in `talent/` but is also part of the help flow:
 * `TalentTrackController.as` sends it twice as the citizenship track advances, and
 * `HabboHelp.as::queryForGuideReportingStatus()` sends it alongside
 * `GetGuideReportingStatusMessageComposer` — asking about guide reporting counts as having seen
 * the advertisement.
 *
 * Header from the primary registry
 * (`sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as`:
 * `_composers[1850] = _SafeCls_2205`); the class name is recovered from
 * `sources/win63_version/habbo/communication/messages/outgoing/talent/GuideAdvertisementReadMessageComposer.as`,
 * the only tree where this message has a readable filename. `vortex-emulator` corroborates both:
 * `Revision20260701/Headers.cs::GuideAdvertisementReadMessageEvent = 1850`, routed to
 * `Vortex.PacketHandlers/Talent/GuideAdvertisementReadMessageHandler.cs`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2206/_SafeCls_2205.as
 */
export class GuideAdvertisementReadMessageComposer extends MessageComposer<[]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2206/_SafeCls_2205.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
