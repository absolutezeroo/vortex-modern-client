import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {PetBreedingResultData} from '@habbo/communication/messages/incoming/room/pet/PetBreedingResultData';

/**
 * The outcome of breeding two pets (header 2940) — two offspring records, one per participant.
 *
 * SERVER MISMATCH, the largest of the pet set — Revision20260701's
 * PetBreedingResultEventMessageComposerSerializer writes three ints
 * (`PetOneId, PetTwoId, Result`), an entirely different message from the AS3's two
 * `(int, int, string, int, string, int, bool)` records. The third read is a readString() over what
 * is really an int, so parse() throws and SocketConnection logs it per message. Identical in
 * Revision20260112. The AS3 shape is kept because it is the real protocol; see
 * docs/CLIENT-SERVER-ARCHITECTURE.md for the full pet mismatch table.
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/room/pets/PetBreedingResultEventParser.as
 */
export class PetBreedingResultEventParser implements IMessageParser
{
    private _resultData: PetBreedingResultData | null = null;

    private _otherResultData: PetBreedingResultData | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/pets/PetBreedingResultEventParser.as::get resultData()
    get resultData(): PetBreedingResultData | null
    {
        return this._resultData;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/pets/PetBreedingResultEventParser.as::get otherResultData()
    get otherResultData(): PetBreedingResultData | null
    {
        return this._otherResultData;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/pets/PetBreedingResultEventParser.as::flush()
    flush(): boolean
    {
        this._resultData = null;
        this._otherResultData = null;

        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/pets/PetBreedingResultEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._resultData = this.parseResultData(wrapper);
        this._otherResultData = this.parseResultData(wrapper);

        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/pets/PetBreedingResultEventParser.as::parseResultData()
    // AS3 reads into locals and passes them to the constructor out of declaration order but in read
    // order — the wire order is stuffId, classId, productCode, userId, userName, rarityLevel,
    // hasMutation, which is what the constructor receives.
    private parseResultData(wrapper: IMessageDataWrapper): PetBreedingResultData
    {
        const stuffId = wrapper.readInt();
        const classId = wrapper.readInt();
        const productCode = wrapper.readString();
        const userId = wrapper.readInt();
        const userName = wrapper.readString();
        const rarityLevel = wrapper.readInt();
        const hasMutation = wrapper.readBoolean();

        return new PetBreedingResultData(stuffId, classId, productCode, userId, userName, rarityLevel, hasMutation);
    }
}
