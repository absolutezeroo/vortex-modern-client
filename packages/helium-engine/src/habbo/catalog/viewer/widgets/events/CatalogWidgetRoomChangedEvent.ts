/**
 * Fired on the widget event bus when the player's current room changes, so widgets that
 * depend on room-session state (e.g. BuilderCatalogWidget's placement buttons) can refresh.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetRoomChangedEvent.as
 */
export class CatalogWidgetRoomChangedEvent
{
    static readonly CWE_ROOM_CHANGED: string = 'CWE_ROOM_CHANGED';

    get type(): string
    {
        return CatalogWidgetRoomChangedEvent.CWE_ROOM_CHANGED;
    }
}
