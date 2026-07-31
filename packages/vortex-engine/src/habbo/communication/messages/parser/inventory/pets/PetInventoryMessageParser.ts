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
    rarityLevel: number;
}

/**
 * Parser for pet inventory message (header 1200).
 *
 * Each entry is AS3's own pet DTO — id, name, an inlined PetFigureData, level, rarityLevel — read in
 * that exact order. `rarityLevel` used to be skipped here, which desynchronised every pet after the
 * first in a multi-pet fragment: the next pet's id was read out of the previous pet's rarity field.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2554/_SafeCls_2926.as
 * (obfuscated in the primary dump; `_SafeStr_4546[1200] = _SafeCls_3085` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as:1207, and
 * the class name is recovered from
 * sources/win63_version/habbo/communication/messages/parser/inventory/pets/PetInventoryEventParser.as).
 * The per-pet DTO is _SafeCls_2577 (win63_version `class_2838`), its figure block _SafeCls_3943,
 * whose real name PetFigureData survives unobfuscated in
 * sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/parser/inventory/pets/PetFigureData.as.
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
            const rarityLevel = wrapper.readInt();

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
                rarityLevel,
            });
        }

        return true;
    }
}
