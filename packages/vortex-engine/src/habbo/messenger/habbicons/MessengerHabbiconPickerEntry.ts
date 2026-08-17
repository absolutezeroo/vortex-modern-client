/**
 * MessengerHabbiconPickerEntry — one habbicon as the picker sees it.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerEntry.as
 *
 * `searchName` is precomputed rather than lowercased per keystroke: the search pass walks every
 * owned habbicon on each change.
 */
export class MessengerHabbiconPickerEntry
{
    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerEntry.as::habbiconId
    public habbiconId: number;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerEntry.as::name
    public name: string;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerEntry.as::searchName
    public searchName: string;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerEntry.as::favorite
    public favorite: boolean;

    // AS3: .../src/com/sulake/habbo/messenger/habbicons/MessengerHabbiconPickerEntry.as::MessengerHabbiconPickerEntry()
    constructor(habbiconId: number, name: string | null, favorite: boolean)
    {
        this.habbiconId = habbiconId;
        this.name = name as string;
        this.searchName = name != null ? name.toLowerCase() : '';
        this.favorite = favorite;
    }
}
