/**
 * Interface for handling Illumina input widget submissions.
 *
 * Implemented by classes that need to receive text input from
 * an IIlluminaInputWidget.
 *
 * @see sources/win63_version/habbo/window/widgets/IIlluminaInputHandler.as
 */
export interface IIlluminaInputHandler
{
    /**
	 * Called when the user submits input.
	 *
	 * @param widgetId - The widget identifier
	 * @param message - The submitted text
	 */
    onInput(widgetId: string, message: string): void;
}
