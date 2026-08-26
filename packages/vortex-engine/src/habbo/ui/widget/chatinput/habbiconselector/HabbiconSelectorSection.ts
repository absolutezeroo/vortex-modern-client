/**
 * HabbiconSelectorSection — one titled band of the room chat's habbicon selector (favorites,
 * recent, a collection, or the search results).
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelectorSection.as
 */
import type {HabbiconSelectorEntry} from './HabbiconSelectorEntry';

export class HabbiconSelectorSection
{
    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelectorSection.as::type
    public type: string;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelectorSection.as::key
    public key: string;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelectorSection.as::title
    public title: string;

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelectorSection.as::entries
    public entries: HabbiconSelectorEntry[];

    // AS3: .../src/com/sulake/habbo/ui/widget/chatinput/habbiconselector/HabbiconSelectorSection.as::HabbiconSelectorSection()
    constructor(type: string, key: string, title: string, entries: HabbiconSelectorEntry[])
    {
        this.type = type;
        this.key = key;
        this.title = title;
        this.entries = entries;
    }
}
