/**
 * Link Event Tracker Interface
 *
 * Components implement this interface to receive link events matching their pattern.
 * The pattern is matched against the beginning of the link string.
 *
 * @see source_as_win63/core/runtime/events/ILinkEventTracker.as
 */
export interface ILinkEventTracker
{
    /**
	 * The URL prefix pattern this tracker handles (e.g. "navigator/", "catalog/").
	 * An empty string matches all links.
	 */
    readonly linkPattern: string;

    /**
	 * Called when a link matching this tracker's pattern is received
	 *
	 * @param link The full link string
	 */
    linkReceived(link: string): void;
}
