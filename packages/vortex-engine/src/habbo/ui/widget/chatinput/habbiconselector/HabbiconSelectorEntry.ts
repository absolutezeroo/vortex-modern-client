/**
 * HabbiconSelectorEntry — one owned habbicon as the room chat's selector sees it.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelectorEntry.as
 *
 * `color` is the seeded placeholder tint (`HabbiconSelector.seededColor()`) used while the real
 * spritesheet preview has not loaded yet — this is the one field `MessengerHabbiconPickerEntry`
 * does not carry, because the messenger's picker never draws a colored placeholder.
 */
export class HabbiconSelectorEntry
{
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelectorEntry.as::habbiconId
    public habbiconId: number;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelectorEntry.as::name
    public name: string;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelectorEntry.as::searchName
    public searchName: string;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelectorEntry.as::color
    public color: number;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelectorEntry.as::favorite
    public favorite: boolean;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelectorEntry.as::HabbiconSelectorEntry()
    constructor(habbiconId: number, name: string | null, color: number, favorite: boolean)
    {
        this.habbiconId = habbiconId;
        this.name = name as string;
        this.searchName = name != null ? name.toLowerCase() : '';
        this.color = color;
        this.favorite = favorite;
    }
}
