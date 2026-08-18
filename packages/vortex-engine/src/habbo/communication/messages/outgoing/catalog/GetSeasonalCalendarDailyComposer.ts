import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ask for today's seasonal-calendar offer. Header 1012, from WIN63's own registry
 * (`_composers[1012] = _SafeCls_3869`). Empty payload.
 *
 * Name from `sources/win63_version/habbo/communication/messages/outgoing/catalog/
 * GetSeasonalCalendarDailyComposer.as`, corroborated by the emulator's
 * `GetSeasonalCalendarDailyEvent = 1012`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1749/_SafeCls_3869.as
 */
export class GetSeasonalCalendarDailyComposer extends MessageComposer<[]>
{
    // AS3: _SafeCls_3869.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
