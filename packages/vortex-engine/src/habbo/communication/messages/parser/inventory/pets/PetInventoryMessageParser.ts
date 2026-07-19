import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

export interface IPetData
{
    id: number;
    name: string;
    figureData: {
        typeId: number;
        paletteId: number;
        color: string;
        breedId: number;
        customParts: number[];
    };
    level: number;
}

/**
 * Parser for pet inventory message
 *
 * @see source_as_win63/habbo/communication/messages/parser/inventory/pets/PetInventoryEventParser.as
 */
export class PetInventoryMessageParser implements IMessageParser
{
    private _totalFragments: number = 1;

    get totalFragments(): number
    {
        return this._totalFragments;
    }

    private _fragmentNo: number = 0;

    get fragmentNo(): number
    {
        return this._fragmentNo;
    }

    private _pets: IPetData[] = [];

    get pets(): IPetData[]
    {
        return this._pets;
    }

    flush(): boolean
    {
        this._pets = [];
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._totalFragments = wrapper.readInt();
        this._fragmentNo = wrapper.readInt();

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const id = wrapper.readInt();
            const name = wrapper.readString();

            // Pet figure data (AS3: class_2486)
            const typeId = wrapper.readInt();
            const paletteId = wrapper.readInt();
            const color = wrapper.readString();
            const breedId = wrapper.readInt();

            // Custom parts: 3 ints per part
            const customPartCount = wrapper.readInt();
            const customParts: number[] = [];
            for(let j = 0; j < customPartCount; j++)
            {
                customParts.push(wrapper.readInt());
                customParts.push(wrapper.readInt());
                customParts.push(wrapper.readInt());
            }

            const level = wrapper.readInt();

            this._pets.push({
                id,
                name,
                figureData: {
                    typeId,
                    paletteId,
                    color,
                    breedId,
                    customParts,
                },
                level,
            });
        }

        return true;
    }
}
