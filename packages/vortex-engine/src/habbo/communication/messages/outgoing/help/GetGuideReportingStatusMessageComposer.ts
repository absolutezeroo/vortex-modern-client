import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the current guide reporting status.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/help/GetGuideReportingStatusMessageComposer.as
 */
export class GetGuideReportingStatusMessageComposer extends MessageComposer<[]>
{
    // AS3: sources/win63_version/habbo/communication/messages/outgoing/help/GetGuideReportingStatusMessageComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
