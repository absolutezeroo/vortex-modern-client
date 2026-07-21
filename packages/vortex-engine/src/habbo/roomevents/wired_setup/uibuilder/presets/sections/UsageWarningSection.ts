import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import {SectionParam} from '../../params/SectionParam';
import {TextParam} from '../../params/TextParam';
import type {TextPreset} from '../TextPreset';
import {AbstractSectionPreset} from './AbstractSectionPreset';

/**
 * UsageWarningSection — a hidden warning section showing red multiline warning text, titled
 * "general_box_warning".
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/sections/UsageWarningSection.as
 */
export class UsageWarningSection extends AbstractSectionPreset
{
    // AS3: UsageWarningSection.as::_text
    private _text: TextPreset;

    // AS3: UsageWarningSection.as::UsageWarningSection()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, text: string)
    {
        super(roomEvents, presetManager, wiredStyle);

        const textParam = new TextParam(1);

        textParam.textColor = wiredStyle.redTextColor;
        this._text = presetManager.createText(text, textParam);
        this.initializeSection(this.l('general_box_warning'), this._text, SectionParam.HIDDEN);
    }

    // AS3: UsageWarningSection.as::dispose()
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
