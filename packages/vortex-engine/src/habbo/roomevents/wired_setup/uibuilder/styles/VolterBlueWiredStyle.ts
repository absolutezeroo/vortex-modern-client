import type {IWindowContainer} from '@core/window/IWindowContainer';

import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import {WiredStyle} from './WiredStyle';

/**
 * VolterBlueWiredStyle — the blue volter variant: volter metrics with a blue frame/background and an
 * inner border. Clones its widgets from the `wired_style_volter_blue` XML template.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/styles/VolterBlueWiredStyle.as
 */
export class VolterBlueWiredStyle extends WiredStyle
{
    // AS3: VolterBlueWiredStyle.as::NAME
    public static readonly NAME: string = 'volter_blue';

    // AS3: VolterBlueWiredStyle.as::_styleTemplate
    private _styleTemplate: IWindowContainer;

    // AS3: VolterBlueWiredStyle.as::VolterBlueWiredStyle()
    constructor(roomEvents: HabboUserDefinedRoomEvents)
    {
        super(roomEvents);
        this._styleTemplate = roomEvents.getXmlWindow('wired_style_volter_blue') as unknown as IWindowContainer;
    }

    // AS3: VolterBlueWiredStyle.as::get styleTemplate()
    protected override get styleTemplate(): IWindowContainer
    {
        return this._styleTemplate;
    }

    // AS3: VolterBlueWiredStyle.as::get radioButtonSpacing()
    override get radioButtonSpacing(): number
    {
        return 6;
    }

    // AS3: VolterBlueWiredStyle.as::get checkboxSpacing()
    override get checkboxSpacing(): number
    {
        return 2;
    }

    // AS3: VolterBlueWiredStyle.as::get checkboxYOffset()
    override get checkboxYOffset(): number
    {
        return 0;
    }

    // AS3: VolterBlueWiredStyle.as::get radioButtonYOffset()
    override get radioButtonYOffset(): number
    {
        return 0;
    }

    // AS3: VolterBlueWiredStyle.as::get namedTextYOffset()
    override get namedTextYOffset(): number
    {
        return 0;
    }

    // AS3: VolterBlueWiredStyle.as::get namedInputOffset()
    override get namedInputOffset(): number
    {
        return 0;
    }

    // AS3: VolterBlueWiredStyle.as::get namedDropdownOffset()
    override get namedDropdownOffset(): number
    {
        return 0;
    }

    // AS3: VolterBlueWiredStyle.as::get genericHorizontalSpacing()
    override get genericHorizontalSpacing(): number
    {
        return 5;
    }

    // AS3: VolterBlueWiredStyle.as::get genericVerticalSpacing()
    override get genericVerticalSpacing(): number
    {
        return 5;
    }

    // AS3: VolterBlueWiredStyle.as::get sectionSpacing()
    override get sectionSpacing(): number
    {
        return 4;
    }

    // AS3: VolterBlueWiredStyle.as::get sectionLeftRightMargin()
    override get sectionLeftRightMargin(): number
    {
        return 5;
    }

    // AS3: VolterBlueWiredStyle.as::get headerMargin()
    override get headerMargin(): number
    {
        return 5;
    }

    // AS3: VolterBlueWiredStyle.as::get headerBottomMarginWithLink()
    override get headerBottomMarginWithLink(): number
    {
        return 1;
    }

    // AS3: VolterBlueWiredStyle.as::get headerNameFontSize()
    override get headerNameFontSize(): number
    {
        return 9;
    }

    // AS3: VolterBlueWiredStyle.as::get minimumOptionHeight()
    override get minimumOptionHeight(): number
    {
        return 20;
    }

    // AS3: VolterBlueWiredStyle.as::get minimumOptionSpacing()
    override get minimumOptionSpacing(): number
    {
        return 4;
    }

    // AS3: VolterBlueWiredStyle.as::get optionExtraUnderSpacing()
    override get optionExtraUnderSpacing(): number
    {
        return 3;
    }

    // AS3: VolterBlueWiredStyle.as::get optionExtraUnderLeftMargin()
    override get optionExtraUnderLeftMargin(): number
    {
        return 25;
    }

    // AS3: VolterBlueWiredStyle.as::get LRContainerMargin()
    override get LRContainerMargin(): number
    {
        return 9;
    }

    // AS3: VolterBlueWiredStyle.as::get LRContainerSpacing()
    override get LRContainerSpacing(): number
    {
        return 6;
    }

    // AS3: VolterBlueWiredStyle.as::get LRContainerTopBottomPadding()
    override get LRContainerTopBottomPadding(): number
    {
        return 4;
    }

    // AS3: VolterBlueWiredStyle.as::get inputSourceListMinHeight()
    override get inputSourceListMinHeight(): number
    {
        return 23;
    }

    // AS3: VolterBlueWiredStyle.as::get buttonRowSpacing()
    override get buttonRowSpacing(): number
    {
        return 12;
    }

    // AS3: VolterBlueWiredStyle.as::get menuRightOffset()
    override get menuRightOffset(): number
    {
        return 12;
    }

    // AS3: VolterBlueWiredStyle.as::get verticalSplitterColor()
    override get verticalSplitterColor(): number
    {
        return 4280492835;
    }

    // AS3: VolterBlueWiredStyle.as::get frameColor()
    override get frameColor(): number
    {
        return 8235445;
    }

    // AS3: VolterBlueWiredStyle.as::get backgroundColor()
    override get backgroundColor(): number
    {
        return 13095124;
    }

    // AS3: VolterBlueWiredStyle.as::get advancedBackgroundColor()
    override get advancedBackgroundColor(): number
    {
        return 11647421;
    }

    // AS3: VolterBlueWiredStyle.as::get yellowTextColor()
    override get yellowTextColor(): number
    {
        return 16777130;
    }

    // AS3: VolterBlueWiredStyle.as::get name()
    override get name(): string
    {
        return 'volter_blue';
    }

    // AS3: VolterBlueWiredStyle.as::get isVolter()
    override get isVolter(): boolean
    {
        return true;
    }

    // AS3: VolterBlueWiredStyle.as::get useInnerBorder()
    override get useInnerBorder(): boolean
    {
        return true;
    }
}
