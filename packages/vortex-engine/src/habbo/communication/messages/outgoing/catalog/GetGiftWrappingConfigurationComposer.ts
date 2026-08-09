import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Header 940, from WIN63's own registry (`habbo/communication/_SafeCls_2046.as:1162`) and
 * corroborated by the emulator.
 *
 * `win63_version` is cited only for the readable class name: this message is obfuscated in the
 * primary tree, which is where every member trace below points, because that tree is the
 * authority on behaviour and this one has shipped two bad decompiles today alone.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/catalog/GetGiftWrappingConfigurationComposer.as
 */
export class GetGiftWrappingConfigurationComposer extends MessageComposer<[]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1749/_SafeCls_2332.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
