import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';
import {Util} from '@habbo/roomevents/Util';

import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import {HtmlTextParam} from '../../params/HtmlTextParam';
import {TextInputParam} from '../../params/TextInputParam';
import type {HtmlPreset} from '../HtmlPreset';
import type {SimpleListViewPreset} from '../SimpleListViewPreset';
import type {TextInputPreset} from '../TextInputPreset';
import {AbstractSectionPreset} from './AbstractSectionPreset';

/**
 * PlaceholderNameSection — a titled placeholder-name text input with a live HTML preview of how the
 * placeholder will render; normalises the entered name to a lower-case underscore-joined identifier.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/sections/PlaceholderNameSection.as
 */
export class PlaceholderNameSection extends AbstractSectionPreset
{
    // AS3: PlaceholderNameSection.as::_name
    private _name: TextInputPreset;

    // AS3: PlaceholderNameSection.as::_preview
    private _preview: HtmlPreset;

    // AS3: PlaceholderNameSection.as::_SafeStr_4652 (name derived: the input + preview list)
    private _list: SimpleListViewPreset;

    // AS3: PlaceholderNameSection.as::_SafeStr_7739 (name derived: the placeholder prefix)
    private _prefix: string;

    // AS3: PlaceholderNameSection.as::PlaceholderNameSection()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, title: string, prefix: string)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._prefix = prefix;
        this._name = presetManager.createTextInput(new TextInputParam('', 32, null, -1, 'a-zA-Z_0-9 '));
        this._preview = presetManager.createHtml(this.l('texts.placeholder_preview').replace('#ffffaa', Util.uintToHexColor(wiredStyle.yellowTextColor)), new HtmlTextParam(1, true, 2));
        this._list = presetManager.createSimpleListView(true, [this._name, this._preview.staticHeight(this._preview.fontSize * 3)]);
        this._name.addListener(this.onPlaceholderChange);
        this.initializeSection(title, this._list);
    }

    // AS3: PlaceholderNameSection.as::onPlaceholderChange()
    private onPlaceholderChange = (value: string): void =>
    {
        const current = this._name.text;
        const normalized = value.split(' ').join('_').toLowerCase();

        if(current !== normalized)
        {
            this._name.text = normalized;
        }

        const preview = this._roomEvents.localization.getLocalizationWithParams('wiredfurni.params.texts.placeholder_preview', '', 'placeholder', this._prefix + '(' + normalized.toLowerCase() + ')').replace('#ffffaa', Util.uintToHexColor(this._wiredStyle.yellowTextColor));
        this._preview.text = preview;
    };

    // AS3: PlaceholderNameSection.as::set placeholderName()
    set placeholderName(value: string)
    {
        this._name.text = value;
        this.onPlaceholderChange(value);
    }

    // AS3: PlaceholderNameSection.as::get placeholderName()
    get placeholderName(): string
    {
        return this._name.text.split(' ').join('_').toLowerCase();
    }

    // AS3: PlaceholderNameSection.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._list = null as unknown as SimpleListViewPreset;
        this._name = null as unknown as TextInputPreset;
        this._preview = null as unknown as HtmlPreset;
        this._prefix = null as unknown as string;
    }
}
