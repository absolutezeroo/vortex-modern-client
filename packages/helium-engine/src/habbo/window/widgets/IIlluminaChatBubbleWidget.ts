import type {IWidget} from './IWidget';

/**
 * Interface for the Illumina chat bubble widget.
 *
 * Renders a chat bubble with avatar, username, messages, timestamp,
 * and online status indicator. Supports flipped layout and message
 * confirmation tracking.
 *
 * @see sources/win63_version/habbo/window/widgets/IIlluminaChatBubbleWidget.as
 */
export interface IIlluminaChatBubbleWidget extends IWidget
{
    /**
	 * Whether the bubble layout is flipped (avatar on right).
	 */
    flipped: boolean;

    /**
	 * The display name of the user.
	 */
    userName: string;

    /**
	 * The user ID for click-to-profile behavior.
	 */
    userId: number;

    /**
	 * The avatar figure string.
	 */
    figure: string;

    /**
	 * The number of messages in the bubble.
	 */
    readonly numMessages: number;
    /**
	 * The timestamp of the message (milliseconds since epoch).
	 */
    timeStamp: number;

    /**
	 * Get a message by index.
	 *
	 * @param index - The message index
	 * @returns The message text
	 */
    getMessage(index: number): string;

    /**
	 * Set a message at the given index.
	 *
	 * @param index - The message index
	 * @param text - The message text
	 */
    setMessage(index: number, text: string): void;

    /**
	 * Append a message to the bubble.
	 *
	 * @param text - The message text
	 * @param prepend - Whether to insert at the beginning
	 * @param confirmationId - Optional awaiting confirmation ID
	 */
    appendMessage(text: string, prepend?: boolean, confirmationId?: number): void;

    /**
	 * Set the friend online status indicator.
	 */
    set friendOnlineStatus(value: boolean);

    /**
	 * Set an awaiting confirmation ID on a message.
	 *
	 * @param messageIndex - The message index
	 * @param confirmationId - The confirmation ID
	 */
    setAwaitingConfirmationId(messageIndex: number, confirmationId: number): void;

    /**
	 * Clear an awaiting confirmation ID on a message.
	 *
	 * @param messageIndex - The message index
	 */
    clearAwaitingConfirmationId(messageIndex: number): void;

    /**
	 * Get the awaiting confirmation ID for a message.
	 *
	 * @param messageIndex - The message index
	 * @returns The confirmation ID, or 0
	 */
    getAwaitingConfirmationId(messageIndex: number): number;
}
