import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Persists the user's chat bubble style and font size preferences server-side, so the
 * next login's AccountPreferencesParser reports back the last one chosen instead of
 * always resetting to the default.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2091/_SafeCls_2257.as
 */
export class SetChatStylePreferenceComposer extends MessageComposer<ConstructorParameters<typeof SetChatStylePreferenceComposer>>
{
    private _data: ConstructorParameters<typeof SetChatStylePreferenceComposer>;

    constructor(chatStyle: number, chatFontSizeMode: number)
    {
        super();

        this._data = [chatStyle, chatFontSizeMode];
    }

    getMessageArray()
    {
        return this._data;
    }
}
