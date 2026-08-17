/**
 * MessengerHabbiconPickerSection — one titled band of the picker (favorites, recent, a collection,
 * or the search results).
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSection.as
 *
 * `type` and `key` are separate because collections share a type but need distinct identities —
 * `key` is `"collection:<collectionId>"`, which is what the incremental re-render matches on.
 */
import type {MessengerHabbiconPickerEntry} from './MessengerHabbiconPickerEntry';

export class MessengerHabbiconPickerSection
{
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSection.as::type
    public type: string;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSection.as::key
    public key: string;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSection.as::title
    public title: string;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSection.as::entries
    public entries: MessengerHabbiconPickerEntry[];

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerSection.as::MessengerHabbiconPickerSection()
    constructor(type: string, key: string, title: string, entries: MessengerHabbiconPickerEntry[])
    {
        this.type = type;
        this.key = key;
        this.title = title;
        this.entries = entries;
    }
}
