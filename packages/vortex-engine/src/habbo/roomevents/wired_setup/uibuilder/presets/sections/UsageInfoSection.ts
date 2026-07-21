import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import {SectionParam} from '../../params/SectionParam';
import {TextParam} from '../../params/TextParam';
import type {TextPreset} from '../TextPreset';
import {AbstractSectionPreset} from './AbstractSectionPreset';

/**
 * UsageInfoSection — a collapsible/hidden info section showing soft-coloured multiline help text,
 * titled "general_box_info" by default.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/sections/UsageInfoSection.as
 */
export class UsageInfoSection extends AbstractSectionPreset
{
    // AS3: UsageInfoSection.as::_text
    private _text: TextPreset;

    // AS3: UsageInfoSection.as::UsageInfoSection()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, text: string, collapsed: boolean = false, title: string | null = null)
    {
        super(roomEvents, presetManager, wiredStyle);

        const textParam = new TextParam(1);

        textParam.textColor = wiredStyle.softTextColor;
        this._text = presetManager.createText(text, textParam);

        if(title == null)
        {
            title = this.l('general_box_info');
        }

        this.initializeSection(title, this._text, collapsed ? SectionParam.COLLAPSED : SectionParam.HIDDEN);
    }

    // AS3: UsageInfoSection.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._text = null as unknown as TextPreset;
    }
}
