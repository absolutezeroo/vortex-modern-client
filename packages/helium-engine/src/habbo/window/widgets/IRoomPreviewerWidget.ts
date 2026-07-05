import type {IWidget} from './IWidget';
import type {RoomPreviewer} from '@habbo/room/preview/RoomPreviewer';

/**
 * Interface for the room previewer widget.
 *
 * Renders a 3D room preview with configurable scale, zoom,
 * and offset. Used for catalog/navigator room previews.
 *
 * @see sources/win63_version/habbo/window/widgets/IRoomPreviewerWidget.as
 */
export interface IRoomPreviewerWidget extends IWidget
{
    /**
	 * The rendering scale (32 = small, 64 = normal).
	 */
    scale: number;

    /**
	 * The room previewer instance.
	 */
    readonly roomPreviewer: RoomPreviewer | null;
    /**
	 * The horizontal offset of the preview camera.
	 */
    offsetX: number;
    /**
	 * The vertical offset of the preview camera.
	 */
    offsetY: number;
    /**
	 * The zoom level of the preview.
	 */
    zoom: number;

    /**
	 * Show a static bitmap preview, replacing the live room canvas.
	 *
	 * AS3: showPreview(param1:BitmapData) wraps the given BitmapData in a
	 * Bitmap and swaps it into the room canvas wrapper. HTMLCanvasElement is
	 * the closest TS equivalent to a raw, already-rendered BitmapData buffer.
	 *
	 * @param image - The pre-rendered bitmap to display
	 */
    showPreview(image: HTMLCanvasElement): void;
}
