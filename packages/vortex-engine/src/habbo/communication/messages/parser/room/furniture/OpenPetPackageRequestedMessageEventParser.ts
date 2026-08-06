import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for open pet package requested message
 *
 * @see source_as_win63/habbo/communication/messages/parser/room/furniture/OpenPetPackageRequestedMessageEventParser.as
 */
export class OpenPetPackageRequestedMessageEventParser implements IMessageParser
{
    private _objectId: number = -1;

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/furniture/OpenPetPackageRequestedMessageEventParser.as::get objectId()
    get objectId(): number
    {
        return this._objectId;
    }

    private _figureData: unknown = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/furniture/OpenPetPackageRequestedMessageEventParser.as::get figureData()
    get figureData(): unknown
    {
        return this._figureData;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/furniture/OpenPetPackageRequestedMessageEventParser.as::flush()
    flush(): boolean
    {
        this._objectId = -1;
        this._figureData = null;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/furniture/OpenPetPackageRequestedMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._objectId = wrapper.readInt();

        // TODO: Parse figureData (obfuscated class_1657 in AS3)

        return true;
    }
}
