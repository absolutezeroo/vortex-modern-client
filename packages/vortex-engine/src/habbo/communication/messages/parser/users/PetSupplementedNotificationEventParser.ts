import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Someone gave a pet water, light or a treat (header 3858). RoomChatHandler turns it into a chat
 * bubble over the pet, picking the bubble style from `supplementType`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1891/_SafeCls_3613.as
 * (obfuscated in the primary dump; `_SafeStr_4546[3858] = _SafeCls_3489` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as:1637, and
 * the class name is recovered from
 * sources/win63_version/habbo/communication/messages/parser/users/PetSupplementedNotificationEventParser.as).
 */
export class PetSupplementedNotificationEventParser implements IMessageParser
{
    private _petId: number = 0;

    private _userId: number = 0;

    private _supplementType: number = 0;

    // AS3: .../_SafeCls_3613.as::get petId()
    get petId(): number
    {
        return this._petId;
    }

    // AS3: .../_SafeCls_3613.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    // AS3: .../_SafeCls_3613.as::get supplementType()
    get supplementType(): number
    {
        return this._supplementType;
    }

    // AS3: .../_SafeCls_3613.as::flush()
    // AS3's flush() resets nothing; parse() overwrites all three fields unconditionally.
    flush(): boolean
    {
        return true;
    }

    // AS3: .../_SafeCls_3613.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._petId = wrapper.readInt();
        this._userId = wrapper.readInt();
        this._supplementType = wrapper.readInt();

        return true;
    }
}
