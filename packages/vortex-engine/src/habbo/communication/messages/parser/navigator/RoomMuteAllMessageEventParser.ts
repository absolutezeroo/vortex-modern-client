import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * RoomMuteAllMessageEventParser
 *
 * Everyone in the room was muted, or unmuted. The navigator writes the flag onto the
 * entered room and redraws the room-info buttons so the mute-all button flips.
 *
 * **Name DERIVED**, from the handler it feeds (`onMuteAllEvent`) and its single
 * `allMuted` field: the AS3 class is obfuscated in every tree and the emulator has no
 * constant for header 1172 at all.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1710/_SafeCls_2723.as
 */
export class RoomMuteAllMessageEventParser implements IMessageParser
{
    // AS3: .../_SafeCls_2723.as::_SafeStr_9046
    private _allMuted: boolean = false;

    // AS3: .../_SafeCls_2723.as::get allMuted()
    get allMuted(): boolean
    {
        return this._allMuted;
    }

    // AS3: .../_SafeCls_2723.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../_SafeCls_2723.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._allMuted = wrapper.readBoolean();

        return true;
    }
}
