import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import type {SectionParam} from '../../params/SectionParam';
import type {WiredUIPreset} from '../WiredUIPreset';
import {AbstractSectionPreset} from './AbstractSectionPreset';

/**
 * BorderSection — a section whose content is wrapped in a bordered, padded container.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/sections/BorderSection.as
 */
export class BorderSection extends AbstractSectionPreset
{
    // AS3: BorderSection.as::BorderSection()
    // Note: AS3 accepts a SectionParam here but never forwards it to initializeSection() — preserved.
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, title: string, content: WiredUIPreset, _param: SectionParam | null = null)
    {
        super(roomEvents, presetManager, wiredStyle);

        this.initializeSection(
            title,
            presetManager.createPaddedContainerPreset(content, wiredStyle.paddedSectionLeft, wiredStyle.paddedSectionTop, wiredStyle.paddedSectionLeft, wiredStyle.paddedSectionTop, wiredStyle.createBorder())
        );
    }
}
