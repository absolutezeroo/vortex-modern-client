import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

import {DiscordPreferences} from './DiscordPreferences';

/**
 * The whole body of event 2767 is one `DiscordPreferences`, so this parser does nothing but
 * delegate to its `readFromData()`.
 *
 * **Name derived.** The class is `_SafeCls_4070` in the primary tree, `win63_version` predates the
 * Discord feature entirely (it has no `discord` path at all) and PRODUCTION is a 2016 build, so no
 * tree carries a readable name for it — this one is taken from the single field it exposes.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1917/_SafeCls_4070.as
 */
export class DiscordPreferencesParser implements IMessageParser
{
    // AS3: .../_SafePkg_1917/_SafeCls_4070.as::_preferences
    private _preferences: DiscordPreferences | null = null;

    // AS3: .../_SafePkg_1917/_SafeCls_4070.as::get preferences()
    get preferences(): DiscordPreferences | null
    {
        return this._preferences;
    }

    // AS3: .../_SafePkg_1917/_SafeCls_4070.as::flush()
    flush(): boolean
    {
        this._preferences = null;

        return true;
    }

    // AS3: .../_SafePkg_1917/_SafeCls_4070.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._preferences = DiscordPreferences.readFromData(wrapper);

        return true;
    }
}
