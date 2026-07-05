import {StuffDataBase} from './StuffDataBase';

/**
 * Empty stuff data - no data
 *
 * Based on AS3 com.sulake.habbo.room.object.data.EmptyStuffData
 */
export class EmptyStuffData extends StuffDataBase
{
    public static readonly FORMAT_KEY = 4;

    override getLegacyString(): string
    {
        return '';
    }
}
