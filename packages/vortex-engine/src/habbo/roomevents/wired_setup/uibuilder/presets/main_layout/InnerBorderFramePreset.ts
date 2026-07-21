import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import type {WiredUIPreset} from '../WiredUIPreset';
import {SectionPreset} from '../SectionPreset';
import {AbstractSectionPreset} from '../sections/AbstractSectionPreset';
import {FramePreset} from './FramePreset';
import {HeaderPreset} from './HeaderPreset';
import {FooterPreset} from './FooterPreset';

/**
 * InnerBorderFramePreset — a FramePreset variant (volter inner-border styles) that wraps the content
 * between the header and footer in a bordered, padded, back-filled container.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/main_layout/InnerBorderFramePreset.as
 */
export class InnerBorderFramePreset extends FramePreset
{
    // AS3: InnerBorderFramePreset.as::InnerBorderFramePreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, elements: WiredUIPreset[], onClose: (() => void) | null, holderKey: string, code: number, resizable: boolean = false)
    {
        super(roomEvents, presetManager, wiredStyle, elements, onClose, holderKey, code, resizable);
    }

    // AS3: InnerBorderFramePreset.as::createListView()
    protected override createListView(elements: WiredUIPreset[]): void
    {
        const innerBorder = this._wiredStyle.createInnerBorder() as unknown as IWindowContainer;
        const spacing = this._wiredStyle.sectionSpacing;
        const outer: WiredUIPreset[] = [];
        const inner: WiredUIPreset[] = [];
        let headerSeen = false;
        let footerSeen = false;

        for(let i = 0; i < elements.length; i++)
        {
            const element = elements[i];

            if(element instanceof FooterPreset)
            {
                element.splitterVisible = false;
                footerSeen = true;

                const innerList = this._presetManager.createSimpleListView(true, inner);

                innerList.spacing = 0;
                innerList.backgroundColor = this._wiredStyle.backgroundColor;

                const padded = this._presetManager.createPaddedContainerPreset(innerList, 9, 8, 9, 8, innerBorder);

                outer.push(padded);
            }

            if(!headerSeen || footerSeen)
            {
                outer.push(element);
            }
            else
            {
                inner.push(element);

                if(inner.length > 1)
                {
                    const spacer = this._presetManager.createSpacer(spacing);

                    element.blendSpacer = spacer;
                    inner.push(spacer);
                }

                if(inner.length === 1)
                {
                    if(element instanceof SectionPreset)
                    {
                        element.splitterVisible = false;
                    }
                    else if(element instanceof AbstractSectionPreset)
                    {
                        element.splitterVisible = false;
                    }
                }
            }

            if(element instanceof HeaderPreset)
            {
                this._headerPreset = element;
                headerSeen = true;
            }
        }

        this._content = this._presetManager.createSimpleListView(true, outer);
        this._content.backgroundColor = this._wiredStyle.frameColor;
    }
}
