/**
 * Interface for the toolbar extension view container
 *
 * Manages extension panels that can be attached/detached from the toolbar area
 * (purse, settings, promos, etc.)
 *
 * @see source_as_win63/habbo/toolbar/IExtensionView.as
 */
export interface IExtensionView
{
	/**
	 * Whether the extension view is visible
	 */
	visible: boolean;

	/**
	 * The screen height available to the extension view
	 */
	readonly screenHeight: number;

	/**
	 * Extra margin applied to the extension view
	 */
	extraMargin: number;

	/**
	 * Attach an extension panel to the view
	 *
	 * @param id Extension identifier
	 * @param element The element to attach
	 * @param index Optional insertion index (-1 for end)
	 * @param params Optional parameters
	 */
	attachExtension(id: string, element: unknown, index?: number, params?: unknown[] | null): void;

	/**
	 * Detach an extension panel from the view
	 *
	 * @param id Extension identifier
	 */
	detachExtension(id: string): void;

	/**
	 * Check whether an extension is currently attached
	 *
	 * @param id Extension identifier
	 * @returns True if the extension is attached
	 */
	hasExtension(id: string): boolean;

	/**
	 * Refresh the layout of the extension view
	 */
	refreshItemWindow(): void;
}
