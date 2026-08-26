import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * The playlist editor's own lifecycle/refresh events: show/hide the window, and the four
 * "something changed, go re-read it" pokes the handler forwards from the sound manager.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetPlayListEditorEvent.as
 */
export class RoomWidgetPlayListEditorEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../RoomWidgetPlayListEditorEvent.as::SHOW_PLAYLIST_EDITOR
    static readonly SHOW_PLAYLIST_EDITOR: string = 'RWPLEE_SHOW_PLAYLIST_EDITOR';

    /**
     * Obfuscated in every available tree; the member name is DERIVED from its value.
     */
    // AS3: .../RoomWidgetPlayListEditorEvent.as::_SafeStr_11425
    static readonly HIDE_PLAYLIST_EDITOR: string = 'RWPLEE_HIDE_PLAYLIST_EDITOR';

    // AS3: .../RoomWidgetPlayListEditorEvent.as::INVENTORY_UPDATED
    static readonly INVENTORY_UPDATED: string = 'RWPLEE_INVENTORY_UPDATED';

    // AS3: .../RoomWidgetPlayListEditorEvent.as::SONG_DISK_INVENTORY_UPDATED
    static readonly SONG_DISK_INVENTORY_UPDATED: string = 'RWPLEE_SONG_DISK_INVENTORY_UPDATED';

    // AS3: .../RoomWidgetPlayListEditorEvent.as::PLAY_LIST_UPDATED
    static readonly PLAY_LIST_UPDATED: string = 'RWPLEE_PLAY_LIST_UPDATED';

    // AS3: .../RoomWidgetPlayListEditorEvent.as::PLAY_LIST_FULL
    static readonly PLAY_LIST_FULL: string = 'RWPLEE_PLAY_LIST_FULL';

    // AS3: .../RoomWidgetPlayListEditorEvent.as::_SafeStr_6628 (furniId)
    private readonly _furniId: number;

    // AS3: .../RoomWidgetPlayListEditorEvent.as::RoomWidgetPlayListEditorEvent()
    // AS3's trailing `bubbles`/`cancelable` booleans are Flash Event plumbing this port's
    // EventEmitter-based bus has no use for; dropped like everywhere else RoomWidgetUpdateEvent
    // is extended.
    constructor(type: string, furniId: number = -1)
    {
        super(type);

        this._furniId = furniId;
    }

    // AS3: .../RoomWidgetPlayListEditorEvent.as::get furniId()
    get furniId(): number
    {
        return this._furniId;
    }
}
