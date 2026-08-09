import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Header 940, from WIN63's own registry (`habbo/communication/_SafeCls_2046.as:1162`) and
 * corroborated by the emulator.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/catalog/GetGiftWrappingConfigurationComposer.as
 */
export class GetGiftWrappingConfigurationComposer extends MessageComposer<[]>
{
    // AS3: sources/win63_version/habbo/communication/messages/outgoing/catalog/GetGiftWrappingConfigurationComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
