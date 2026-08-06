import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for interstitial ad availability message
 *
 * @see source_as_win63/habbo/communication/messages/parser/advertisement/InterstitialMessageEventParser.as
 */
export class InterstitialMessageParser implements IMessageParser
{
    private _canShowInterstitial: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/advertisement/InterstitialMessageEventParser.as::get canShowInterstitial()
    get canShowInterstitial(): boolean
    {
        return this._canShowInterstitial;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/advertisement/InterstitialMessageEventParser.as::flush()
    flush(): boolean
    {
        this._canShowInterstitial = false;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/advertisement/InterstitialMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._canShowInterstitial = wrapper.readBoolean();

        return true;
    }
}
