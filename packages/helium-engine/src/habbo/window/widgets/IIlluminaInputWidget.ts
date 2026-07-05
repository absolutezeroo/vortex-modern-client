import type {IWidget} from './IWidget';
import type {IIlluminaInputHandler} from './IIlluminaInputHandler';

/**
 * Interface for the Illumina input widget.
 *
 * Provides a text input field with optional submit button,
 * empty message placeholder, and multiline support.
 *
 * @see sources/win63_version/habbo/window/widgets/IIlluminaInputWidget.as
 */
export interface IIlluminaInputWidget extends IWidget
{
    /**
	 * The current message text.
	 */
    message: string;

    /**
	 * The submit handler called when the user submits input.
	 */
    submitHandler: IIlluminaInputHandler | null;

    /**
	 * The caption displayed on the submit button.
	 */
    buttonCaption: string;

    /**
	 * The placeholder text shown when the input is empty.
	 */
    emptyMessage: string;

    /**
	 * Whether the input supports multiple lines.
	 */
    multiline: boolean;

    /**
	 * The maximum number of characters allowed (0 = unlimited).
	 */
    maxChars: number;
}
