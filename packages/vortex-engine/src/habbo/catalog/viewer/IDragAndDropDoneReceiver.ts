/**
 * Receiver for the result of a catalog grid item drag-and-drop (e.g. into the room).
 *
 * @see sources/win63_version/habbo/catalog/viewer/class_2050.as
 */
export interface IDragAndDropDoneReceiver
{
    onDragAndDropDone(success: boolean, extraParam: string): void;
}
