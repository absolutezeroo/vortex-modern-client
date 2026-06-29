import type {IWidget} from './IWidget';

/**
 * Interface for progress indicator widgets.
 *
 * @see sources/win63_version/habbo/window/widgets/class_2339.as
 */
export interface IProgressIndicatorWidget extends IWidget
{
	size: number;
	position: number;
	mode: string;
}
