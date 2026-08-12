import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

import {SanctionRecord} from './SanctionRecord';
import {SanctionTypeData} from './SanctionTypeData';

/**
 * The player's sanction history (header 1746) — a counted list, not a single sanction.
 *
 * **This parser was against the wrong revision until 2026-08-12.** It read thirteen flat fields,
 * faithfully following `win63_version`'s `SanctionStatusEventParser` — a class that does not exist
 * anywhere in the primary tree. The 2026 build reads a count followed by that many records, each
 * of which is itself two nested sanction types. The two shapes share no prefix, so the old parser
 * could not have produced anything usable from a real packet.
 *
 * `SanctionInfo.openWindow()` is the only consumer; it prints one row per record.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2056/_SafeCls_2564.as
 */
export class SanctionStatusMessageParser implements IMessageParser
{
    // AS3: .../_SafeCls_2564.as::_SafeStr_6387 (name from `get sanctions()`)
    private _sanctions: SanctionRecord[] = [];

    // AS3: .../_SafeCls_2564.as::get sanctions()
    get sanctions(): SanctionRecord[]
    {
        return this._sanctions;
    }

    // AS3: .../_SafeCls_2564.as::flush()
    flush(): boolean
    {
        this._sanctions = [];

        return true;
    }

    // AS3: .../_SafeCls_2564.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._sanctions = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const record = new SanctionRecord();

            // Order matters and is not symmetrical: the *current* type comes first, then the
            // three scalars, then the *next* type last.
            record.sanctionType = SanctionStatusMessageParser.readSanctionType(wrapper);
            record.description = wrapper.readString();
            record.showsProbationDetails = wrapper.readBoolean();
            record.probationHoursLeft = wrapper.readInt();
            record.nextSanctionType = SanctionStatusMessageParser.readSanctionType(wrapper);

            this._sanctions.push(record);
        }

        return true;
    }

    // AS3: .../_SafeCls_2564.as::readSanctionType()
    private static readSanctionType(wrapper: IMessageDataWrapper): SanctionTypeData
    {
        const type = new SanctionTypeData();

        type.name = wrapper.readString();
        type.durationHours = wrapper.readInt();
        type.probationHours = wrapper.readInt();

        return type;
    }
}
