import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Interface for furniture stuff data
 *
 * Based on AS3 com.sulake.habbo.room.IStuffData
 * This holds the state/data of a furniture item (color, state, etc.)
 */
export interface IStuffData
{
    /**
	 * Flags for the stuff data
	 */
    flags: number;

    /**
	 * Unique serial number for limited items
	 */
    uniqueSerialNumber: number;

    /**
	 * Total series size for limited items
	 */
    uniqueSeriesSize: number;

    /**
	 * Rarity level (0 = common, higher = rarer)
	 */
    readonly rarityLevel: number;

    /**
	 * Initialize from incoming server message
	 */
    initializeFromIncomingMessage(wrapper: IMessageDataWrapper): void;

    /**
	 * Get the legacy string representation
	 */
    getLegacyString(): string;

    /**
	 * Get a JSON value by key
	 */
    getJSONValue(key: string): string | null;

    /**
	 * Compare with another stuff data
	 */
    compare(other: IStuffData): boolean;
}
