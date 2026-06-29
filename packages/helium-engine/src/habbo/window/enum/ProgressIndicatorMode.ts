/**
 * Progress indicator fill mode values.
 *
 * @see sources/win63_version/habbo/window/enum/ProgressIndicatorMode.as
 */
export class ProgressIndicatorMode
{
	public static readonly POSITION: string = 'position';
	public static readonly PROGRESS: string = 'progress';
	public static readonly ALL: string[] = [
		ProgressIndicatorMode.POSITION,
		ProgressIndicatorMode.PROGRESS
	];
}
