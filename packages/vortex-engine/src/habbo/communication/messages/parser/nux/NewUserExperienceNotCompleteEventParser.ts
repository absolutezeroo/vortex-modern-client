import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parses the "new user experience not complete" notice, which carries no payload — its arrival is
 * the whole message. `HabboNuxDialogs` answers it by showing `NuxOfferOldUserView`.
 *
 * Name recovered from `sources/win63_version/habbo/communication/messages/parser/nux/NewUserExperienceNotCompleteEventParser.as`;
 * the class is `_SafeCls_4042` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3895/_SafeCls_4042.as
 */
export class NewUserExperienceNotCompleteEventParser implements IMessageParser
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3895/_SafeCls_4042.as::flush()
    flush(): boolean
    {
        return true;
    }

    /**
     * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3895/_SafeCls_4042.as::parse()
     *
     * Reads nothing: AS3's body is `return true`.
     */
    // AS3: .../src/unknowns/_SafePkg_3895/_SafeCls_4042.as::parse()
    parse(_wrapper: IMessageDataWrapper): boolean
    {
        return true;
    }
}
