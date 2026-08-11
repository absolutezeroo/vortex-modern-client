import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

import {BadgePointLimit} from './BadgePointLimit';

/**
 * How many points each achievement level is worth (header 3510).
 *
 * Two nested counts: a group count, then per group a prefix string and a level count. The flat
 * list this produces is deliberate — AS3 flattens the groups as it reads them, because the
 * consumer only ever wants (badgeId, limit) pairs.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3206/_SafeCls_3205.as
 * (obfuscated; identified by `_SafeCls_3477`, the event at `_SafeStr_4546[3510]`, whose
 * `getParser()` returns it. `vortex-emulator` corroborates the nesting:
 * `Revision20260701/Serializers/Inventory/Badges/BadgePointLimitsEventMessageComposerSerializer.cs`.)
 */
export class BadgePointLimitsMessageParser implements IMessageParser
{
    // AS3: .../_SafeCls_3205.as::_SafeStr_4556 (name from `get data()`)
    private _data: BadgePointLimit[] = [];

    // AS3: .../_SafeCls_3205.as::get data()
    get data(): BadgePointLimit[]
    {
        return this._data;
    }

    // AS3: .../_SafeCls_3205.as::flush()
    flush(): boolean
    {
        this._data = [];

        return true;
    }

    // AS3: .../_SafeCls_3205.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        const groupCount = wrapper.readInt();

        for(let i = 0; i < groupCount; i++)
        {
            const badgeCodePrefix = wrapper.readString();
            const levelCount = wrapper.readInt();

            for(let j = 0; j < levelCount; j++)
            {
                this._data.push(new BadgePointLimit(badgeCodePrefix, wrapper));
            }
        }

        return true;
    }
}
