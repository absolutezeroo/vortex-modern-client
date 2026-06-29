/**
 * EmptyStuffData
 *
 * Based on AS3: com.sulake.habbo.room.object.data.EmptyStuffData
 *
 * Empty furniture data placeholder (format type 4).
 */
import type {IStuffData} from './IStuffData';
import {StuffDataBase} from './StuffDataBase';

export class EmptyStuffData extends StuffDataBase implements IStuffData
{
	public static readonly FORMAT_KEY = 4;

	override getLegacyString(): string
	{
		return '';
	}

	override compare(_data: IStuffData): boolean
	{
		return true;
	}
}
