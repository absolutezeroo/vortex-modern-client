import type {IWindowContainer} from '@core/window/IWindowContainer';

import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import {WiredStyle} from './WiredStyle';

/**
 * VolterYellowWiredStyle — the yellow volter variant: volter metrics with a yellow frame/background
 * and an inner border. Clones its widgets from the `wired_style_volter_yellow` XML template.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/styles/VolterYellowWiredStyle.as
 */
export class VolterYellowWiredStyle extends WiredStyle
{
    // AS3: VolterYellowWiredStyle.as::NAME
    public static readonly NAME: string = 'volter_yellow';

    // AS3: VolterYellowWiredStyle.as::_styleTemplate
    private _styleTemplate: IWindowContainer | null = null;

    // AS3: VolterYellowWiredStyle.as::VolterYellowWiredStyle()
    constructor(roomEvents: HabboUserDefinedRoomEvents)
    {
        super(roomEvents);
    }

    // AS3: VolterYellowWiredStyle.as::get styleTemplate()
    // Lazy load (see IlluminaWiredStyle): window-layouts register after this component inits, so an
    // eager ctor load returns null; first access is at dialog-open, when they exist.
    protected override get styleTemplate(): IWindowContainer
    {
        if(this._styleTemplate === null)
        {
            this._styleTemplate = this._roomEvents.getXmlWindow('wired_style_volter_yellow') as unknown as IWindowContainer;
        }

        return this._styleTemplate;
    }

    // AS3: VolterYellowWiredStyle.as::get radioButtonSpacing()
    override get radioButtonSpacing(): number
    {
        return 6;
    }

    // AS3: VolterYellowWiredStyle.as::get checkboxSpacing()
    override get checkboxSpacing(): number
    {
        return 2;
    }

    // AS3: VolterYellowWiredStyle.as::get checkboxYOffset()
    override get checkboxYOffset(): number
    {
        return 0;
    }

    // AS3: VolterYellowWiredStyle.as::get namedInputOffset()
    override get namedInputOffset(): number
    {
        return 0;
    }

    // AS3: VolterYellowWiredStyle.as::get namedDropdownOffset()
    override get namedDropdownOffset(): number
    {
        return 0;
    }

    // AS3: VolterYellowWiredStyle.as::get radioButtonYOffset()
    override get radioButtonYOffset(): number
    {
        return 0;
    }

    // AS3: VolterYellowWiredStyle.as::get namedTextYOffset()
    override get namedTextYOffset(): number
    {
        return 0;
    }

    // AS3: VolterYellowWiredStyle.as::get genericHorizontalSpacing()
    override get genericHorizontalSpacing(): number
    {
        return 5;
    }

    // AS3: VolterYellowWiredStyle.as::get genericVerticalSpacing()
    override get genericVerticalSpacing(): number
    {
        return 5;
    }

    // AS3: VolterYellowWiredStyle.as::get sectionSpacing()
    override get sectionSpacing(): number
    {
        return 4;
    }

    // AS3: VolterYellowWiredStyle.as::get sectionLeftRightMargin()
    override get sectionLeftRightMargin(): number
    {
        return 5;
    }

    // AS3: VolterYellowWiredStyle.as::get headerMargin()
    override get headerMargin(): number
    {
        return 5;
    }

    // AS3: VolterYellowWiredStyle.as::get headerBottomMarginWithLink()
    override get headerBottomMarginWithLink(): number
    {
        return 1;
    }

    // AS3: VolterYellowWiredStyle.as::get headerNameFontSize()
    override get headerNameFontSize(): number
    {
        return 9;
    }

    // AS3: VolterYellowWiredStyle.as::get minimumOptionHeight()
    override get minimumOptionHeight(): number
    {
        return 20;
    }

    // AS3: VolterYellowWiredStyle.as::get minimumOptionSpacing()
    override get minimumOptionSpacing(): number
    {
        return 4;
    }

    // AS3: VolterYellowWiredStyle.as::get optionExtraUnderSpacing()
    override get optionExtraUnderSpacing(): number
    {
        return 3;
    }

    // AS3: VolterYellowWiredStyle.as::get optionExtraUnderLeftMargin()
    override get optionExtraUnderLeftMargin(): number
    {
        return 25;
    }

    // AS3: VolterYellowWiredStyle.as::get LRContainerMargin()
    override get LRContainerMargin(): number
    {
        return 9;
    }

    // AS3: VolterYellowWiredStyle.as::get LRContainerSpacing()
    override get LRContainerSpacing(): number
    {
        return 6;
    }

    // AS3: VolterYellowWiredStyle.as::get LRContainerTopBottomPadding()
    override get LRContainerTopBottomPadding(): number
    {
        return 4;
    }

    // AS3: VolterYellowWiredStyle.as::get inputSourceListMinHeight()
    override get inputSourceListMinHeight(): number
    {
        return 23;
    }

    // AS3: VolterYellowWiredStyle.as::get buttonRowSpacing()
    override get buttonRowSpacing(): number
    {
        return 12;
    }

    // AS3: VolterYellowWiredStyle.as::get menuRightOffset()
    override get menuRightOffset(): number
    {
        return 12;
    }

    // AS3: VolterYellowWiredStyle.as::get verticalSplitterColor()
    override get verticalSplitterColor(): number
    {
        return 4280492835;
    }

    // AS3: VolterYellowWiredStyle.as::get frameColor()
    override get frameColor(): number
    {
        return 16433664;
    }

    // AS3: VolterYellowWiredStyle.as::get backgroundColor()
    override get backgroundColor(): number
    {
        return 16444028;
    }

    // AS3: VolterYellowWiredStyle.as::get advancedBackgroundColor()
    override get advancedBackgroundColor(): number
    {
        return 16044639;
    }

    // AS3: VolterYellowWiredStyle.as::get yellowTextColor()
    override get yellowTextColor(): number
    {
        return 16777130;
    }

    // AS3: VolterYellowWiredStyle.as::get name()
    override get name(): string
    {
        return 'volter_yellow';
    }

    // AS3: VolterYellowWiredStyle.as::get isVolter()
    override get isVolter(): boolean
    {
        return true;
    }

    // AS3: VolterYellowWiredStyle.as::get useInnerBorder()
    override get useInnerBorder(): boolean
    {
        return true;
    }
}
