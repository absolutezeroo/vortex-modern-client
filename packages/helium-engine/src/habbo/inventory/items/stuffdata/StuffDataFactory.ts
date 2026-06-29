import type {IStuffData} from '../IStuffData';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {StuffDataType} from './StuffDataType';
import {LegacyStuffData} from './LegacyStuffData';
import {MapStuffData} from './MapStuffData';
import {StringArrayStuffData} from './StringArrayStuffData';
import {VoteResultStuffData} from './VoteResultStuffData';
import {EmptyStuffData} from './EmptyStuffData';
import {IntArrayStuffData} from './IntArrayStuffData';
import {HighScoreStuffData} from './HighScoreStuffData';
import {CrackableStuffData} from './CrackableStuffData';

/**
 * Factory for creating StuffData instances
 *
 * Based on AS3 com.sulake.habbo.room.object.data.class_1697
 */
export class StuffDataFactory
{
	/**
	 * Create a StuffData instance for the given type
	 */
	static createForType(typeFlags: number): IStuffData | null
	{
		const type = typeFlags & 0xFF;
		let stuffData: IStuffData | null = null;

		switch (type)
		{
			case StuffDataType.LEGACY:
				stuffData = new LegacyStuffData();
				break;
			case StuffDataType.MAP:
				stuffData = new MapStuffData();
				break;
			case StuffDataType.STRING_ARRAY:
				stuffData = new StringArrayStuffData();
				break;
			case StuffDataType.VOTE_RESULT:
				stuffData = new VoteResultStuffData();
				break;
			case StuffDataType.EMPTY:
				stuffData = new EmptyStuffData();
				break;
			case StuffDataType.INT_ARRAY:
				stuffData = new IntArrayStuffData();
				break;
			case StuffDataType.HIGH_SCORE:
				stuffData = new HighScoreStuffData();
				break;
			case StuffDataType.CRACKABLE:
				stuffData = new CrackableStuffData();
				break;
		}

		if (stuffData)
		{
			stuffData.flags = typeFlags & 0xFF00;
		}

		return stuffData;
	}

	/**
	 * Parse StuffData from a message wrapper
	 */
	static parseStuffData(wrapper: IMessageDataWrapper): IStuffData | null
	{
		const typeFlags = wrapper.readInt();
		const stuffData = StuffDataFactory.createForType(typeFlags);

		if (stuffData)
		{
			stuffData.initializeFromIncomingMessage(wrapper);
		}

		return stuffData;
	}
}
