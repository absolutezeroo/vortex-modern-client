import type {IWindowContainer} from '@core/window/IWindowContainer';

import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import {WiredStyle} from './WiredStyle';

/**
 * UbuntuWiredStyle — the "ubuntu" wired skin: negative checkbox/radio offsets, wider section spacing,
 * padded container buttons/sections. Not a volter variant. Clones its widgets from the
 * `wired_style_ubuntu` XML template.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/styles/UbuntuWiredStyle.as
 */
export class UbuntuWiredStyle extends WiredStyle
{
    // AS3: UbuntuWiredStyle.as::NAME
    public static readonly NAME: string = 'ubuntu';

    // AS3: UbuntuWiredStyle.as::_styleTemplate
    private _styleTemplate: IWindowContainer;

    // AS3: UbuntuWiredStyle.as::UbuntuWiredStyle()
    constructor(roomEvents: HabboUserDefinedRoomEvents)
    {
        super(roomEvents);
        this._styleTemplate = roomEvents.getXmlWindow('wired_style_ubuntu') as unknown as IWindowContainer;
    }

    // AS3: UbuntuWiredStyle.as::get styleTemplate()
    protected override get styleTemplate(): IWindowContainer
    {
        return this._styleTemplate;
    }

    // AS3: UbuntuWiredStyle.as::get radioButtonSpacing()
    override get radioButtonSpacing(): number
    {
        return 3;
    }

    // AS3: UbuntuWiredStyle.as::get checkboxSpacing()
    override get checkboxSpacing(): number
    {
        return 3;
    }

    // AS3: UbuntuWiredStyle.as::get checkboxYOffset()
    override get checkboxYOffset(): number
    {
        return -1;
    }

    // AS3: UbuntuWiredStyle.as::get radioButtonYOffset()
    override get radioButtonYOffset(): number
    {
        return -1;
    }

    // AS3: UbuntuWiredStyle.as::get namedTextYOffset()
    override get namedTextYOffset(): number
    {
        return 2;
    }

    // AS3: UbuntuWiredStyle.as::get genericHorizontalSpacing()
    override get genericHorizontalSpacing(): number
    {
        return 5;
    }

    // AS3: UbuntuWiredStyle.as::get genericVerticalSpacing()
    override get genericVerticalSpacing(): number
    {
        return 5;
    }

    // AS3: UbuntuWiredStyle.as::get sectionSpacing()
    override get sectionSpacing(): number
    {
        return 7;
    }

    // AS3: UbuntuWiredStyle.as::get sectionLeftRightMargin()
    override get sectionLeftRightMargin(): number
    {
        return 7;
    }

    // AS3: UbuntuWiredStyle.as::get headerMargin()
    override get headerMargin(): number
    {
        return 5;
    }

    // AS3: UbuntuWiredStyle.as::get headerBottomMarginWithLink()
    override get headerBottomMarginWithLink(): number
    {
        return 1;
    }

    // AS3: UbuntuWiredStyle.as::get headerNameFontSize()
    override get headerNameFontSize(): number
    {
        return 12;
    }

    // AS3: UbuntuWiredStyle.as::get minimumOptionHeight()
    override get minimumOptionHeight(): number
    {
        return 20;
    }

    // AS3: UbuntuWiredStyle.as::get minimumOptionSpacing()
    override get minimumOptionSpacing(): number
    {
        return 4;
    }

    // AS3: UbuntuWiredStyle.as::get optionExtraUnderSpacing()
    override get optionExtraUnderSpacing(): number
    {
        return 3;
    }

    // AS3: UbuntuWiredStyle.as::get optionExtraUnderLeftMargin()
    override get optionExtraUnderLeftMargin(): number
    {
        return 25;
    }

    // AS3: UbuntuWiredStyle.as::get LRContainerMargin()
    override get LRContainerMargin(): number
    {
        return 9;
    }

    // AS3: UbuntuWiredStyle.as::get LRContainerSpacing()
    override get LRContainerSpacing(): number
    {
        return 6;
    }

    // AS3: UbuntuWiredStyle.as::get LRContainerTopBottomPadding()
    override get LRContainerTopBottomPadding(): number
    {
        return 4;
    }

    // AS3: UbuntuWiredStyle.as::get inputSourceListMinHeight()
    override get inputSourceListMinHeight(): number
    {
        return 23;
    }

    // AS3: UbuntuWiredStyle.as::get buttonRowSpacing()
    override get buttonRowSpacing(): number
    {
        return 12;
    }

    // AS3: UbuntuWiredStyle.as::get menuRightOffset()
    override get menuRightOffset(): number
    {
        return 12;
    }

    // AS3: UbuntuWiredStyle.as::get frameColor()
    override get frameColor(): number
    {
        return 4296112;
    }

    // AS3: UbuntuWiredStyle.as::get backgroundColor()
    override get backgroundColor(): number
    {
        return 15329761;
    }

    // AS3: UbuntuWiredStyle.as::get advancedBackgroundColor()
    override get advancedBackgroundColor(): number
    {
        return 14277073;
    }

    // AS3: UbuntuWiredStyle.as::get yellowTextColor()
    override get yellowTextColor(): number
    {
        return 8685354;
    }

    // AS3: UbuntuWiredStyle.as::get softTextColor()
    override get softTextColor(): number
    {
        return 3355443;
    }

    // AS3: UbuntuWiredStyle.as::get redTextColor()
    override get redTextColor(): number
    {
        return 16069173;
    }

    // AS3: UbuntuWiredStyle.as::get containerButtonPaddingLeft()
    override get containerButtonPaddingLeft(): number
    {
        return 10;
    }

    // AS3: UbuntuWiredStyle.as::get containerButtonPaddingTop()
    override get containerButtonPaddingTop(): number
    {
        return 5;
    }

    // AS3: UbuntuWiredStyle.as::get paddedSectionTop()
    override get paddedSectionTop(): number
    {
        return 10;
    }

    // AS3: UbuntuWiredStyle.as::get paddedSectionLeft()
    override get paddedSectionLeft(): number
    {
        return 5;
    }

    // AS3: UbuntuWiredStyle.as::get name()
    override get name(): string
    {
        return 'ubuntu';
    }
}
