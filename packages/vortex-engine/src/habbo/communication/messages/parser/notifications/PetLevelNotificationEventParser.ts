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

    get petId(): number
    {
        return this._petId;
    }

    private _petName: string = '';

    get petName(): string
    {
        return this._petName;
    }

    private _level: number = 0;

    get level(): number
    {
        return this._level;
    }

    private _figureData: PetFigureData | null = null;

    get figureData(): PetFigureData | null
    {
        return this._figureData;
    }

    flush(): boolean
    {
        this._petId = 0;
        this._petName = '';
        this._level = 0;
        this._figureData = null;
        return true;
    }

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
