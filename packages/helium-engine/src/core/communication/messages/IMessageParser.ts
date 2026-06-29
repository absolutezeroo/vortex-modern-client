import type {IMessageDataWrapper} from './IMessageDataWrapper';

/**
 * Interface for incoming message parsers
 * Each parser knows how to extract data from a specific message type
 */
export interface IMessageParser
{
	/**
	 * Reset parser state for reuse
	 */
	flush(): boolean;

	/**
	 * Parse the message data
	 * @param wrapper The message data to parse
	 * @returns True if parsing succeeded
	 */
	parse(wrapper: IMessageDataWrapper): boolean;
}
