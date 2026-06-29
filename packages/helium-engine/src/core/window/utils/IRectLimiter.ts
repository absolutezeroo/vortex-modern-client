/**
 * Interface for rectangle size limits.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/utils/IRectLimiter.as
 */
export interface IRectLimiter
{
	minWidth: number;
	maxWidth: number;
	minHeight: number;
	maxHeight: number;

	assign(minWidth: number, maxWidth: number, minHeight: number, maxHeight: number): void;

	clone(owner?: unknown): IRectLimiter;
}
