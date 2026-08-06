import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {PetFigureData} from '@habbo/inventory/pets/PetFigureData';
import {parsePetFigureData} from '../../incoming/notifications/PetFigureDataParser';

/**
 * Parser for pet level notification
 *
 * Parses pet ID, pet name, level, and pet figure data.
 *
 * @see source_as_win63/habbo/communication/messages/parser/notifications/PetLevelNotificationEventParser.as
 */
export class PetLevelNotificationEventParser implements IMessageParser
{
    private _petId: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/notifications/PetLevelNotificationEventParser.as::get petId()
    get petId(): number
    {
        return this._petId;
    }

    private _petName: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/notifications/PetLevelNotificationEventParser.as::get petName()
    get petName(): string
    {
        return this._petName;
    }

    private _level: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/notifications/PetLevelNotificationEventParser.as::get level()
    get level(): number
    {
        return this._level;
    }

    private _figureData: PetFigureData | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/notifications/PetLevelNotificationEventParser.as::get figureData()
    get figureData(): PetFigureData | null
    {
        return this._figureData;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/notifications/PetLevelNotificationEventParser.as::flush()
    flush(): boolean
    {
        this._petId = 0;
        this._petName = '';
        this._level = 0;
        this._figureData = null;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/notifications/PetLevelNotificationEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._petId = wrapper.readInt();
        this._petName = wrapper.readString();
        this._level = wrapper.readInt();
        this._figureData = parsePetFigureData(wrapper);

        return true;
    }
}
