import type {IWindowContainer} from '@core/window/IWindowContainer';

import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import {WiredStyle} from './WiredStyle';

/**
 * VolterWiredStyle — the classic pixel "volter" wired skin: tight spacing, 9px header font, dark
 * frame. Clones its widgets from the `wired_style_volter` XML template.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/styles/VolterWiredStyle.as
 */
export class VolterWiredStyle extends WiredStyle
{
    // AS3: VolterWiredStyle.as::NAME
    public static readonly NAME: string = 'volter';

    // AS3: VolterWiredStyle.as::_styleTemplate
    private _styleTemplate: IWindowContainer | null = null;

    // AS3: VolterWiredStyle.as::VolterWiredStyle()
    constructor(roomEvents: HabboUserDefinedRoomEvents)
    {
        super(roomEvents);
    }

    // AS3: VolterWiredStyle.as::get styleTemplate()
    // Lazy load (see IlluminaWiredStyle): window-layouts register after this component inits, so an
    // eager ctor load returns null; first access is at dialog-open, when they exist.
    protected override get styleTemplate(): IWindowContainer
    {
        if(this._styleTemplate === null)
        {
            this._styleTemplate = this._roomEvents.getXmlWindow('wired_style_volter') as unknown as IWindowContainer;
        }

        return this._styleTemplate;
    }

    // AS3: VolterWiredStyle.as::get radioButtonSpacing()
    override get radioButtonSpacing(): number
    {
        return 6;
    }

    // AS3: VolterWiredStyle.as::get checkboxSpacing()
    override get checkboxSpacing(): number
    {
        return 2;
    }

    // AS3: VolterWiredStyle.as::get checkboxYOffset()
    override get checkboxYOffset(): number
    {
        return 0;
    }

    // AS3: VolterWiredStyle.as::get namedInputOffset()
    override get namedInputOffset(): number
    {
        return 0;
    }

    // AS3: VolterWiredStyle.as::get namedDropdownOffset()
    override get namedDropdownOffset(): number
    {
        return 0;
    }

    // AS3: VolterWiredStyle.as::get radioButtonYOffset()
    override get radioButtonYOffset(): number
    {
        return 0;
    }

    // AS3: VolterWiredStyle.as::get namedTextYOffset()
    override get namedTextYOffset(): number
    {
        return 0;
    }

    // AS3: VolterWiredStyle.as::get genericHorizontalSpacing()
    override get genericHorizontalSpacing(): number
    {
        return 5;
    }

    // AS3: VolterWiredStyle.as::get genericVerticalSpacing()
    override get genericVerticalSpacing(): number
    {
        return 5;
    }

    // AS3: VolterWiredStyle.as::get sectionSpacing()
    override get sectionSpacing(): number
    {
        return 4;
    }

    // AS3: VolterWiredStyle.as::get sectionLeftRightMargin()
    override get sectionLeftRightMargin(): number
    {
        return 5;
    }

    // AS3: VolterWiredStyle.as::get headerMargin()
    override get headerMargin(): number
    {
        return 5;
    }

    // AS3: VolterWiredStyle.as::get headerBottomMarginWithLink()
    override get headerBottomMarginWithLink(): number
    {
        return 1;
    }

    // AS3: VolterWiredStyle.as::get headerNameFontSize()
    override get headerNameFontSize(): number
    {
        return 9;
    }

    // AS3: VolterWiredStyle.as::get minimumOptionHeight()
    override get minimumOptionHeight(): number
    {
        return 20;
    }

    // AS3: VolterWiredStyle.as::get minimumOptionSpacing()
    override get minimumOptionSpacing(): number
    {
        return 4;
    }

    // AS3: VolterWiredStyle.as::get optionExtraUnderSpacing()
    override get optionExtraUnderSpacing(): number
    {
        return 3;
    }

    // AS3: VolterWiredStyle.as::get optionExtraUnderLeftMargin()
    override get optionExtraUnderLeftMargin(): number
    {
        return 25;
    }

    // AS3: VolterWiredStyle.as::get LRContainerMargin()
    override get LRContainerMargin(): number
    {
        return 9;
    }

    // AS3: VolterWiredStyle.as::get LRContainerSpacing()
    override get LRContainerSpacing(): number
    {
        return 6;
    }

    // AS3: VolterWiredStyle.as::get LRContainerTopBottomPadding()
    override get LRContainerTopBottomPadding(): number
    {
        return 4;
    }

    // AS3: VolterWiredStyle.as::get inputSourceListMinHeight()
    override get inputSourceListMinHeight(): number
    {
        return 23;
    }

    // AS3: VolterWiredStyle.as::get buttonRowSpacing()
    override get buttonRowSpacing(): number
    {
        return 12;
    }

    // AS3: VolterWiredStyle.as::get menuRightOffset()
    override get menuRightOffset(): number
    {
        return 12;
    }

    // AS3: VolterWiredStyle.as::get verticalSplitterColor()
    override get verticalSplitterColor(): number
    {
        return 4280492835;
    }

    // AS3: VolterWiredStyle.as::get frameColor()
    override get frameColor(): number
    {
        return 4013373;
    }

    // AS3: VolterWiredStyle.as::get backgroundColor()
    override get backgroundColor(): number
    {
        return this.frameColor;
    }

    // AS3: VolterWiredStyle.as::get advancedBackgroundColor()
    override get advancedBackgroundColor(): number
    {
        return 3158064;
    }

    // AS3: VolterWiredStyle.as::get yellowTextColor()
    override get yellowTextColor(): number
    {
        return 16777130;
    }

    // AS3: VolterWiredStyle.as::get softTextColor()
    override get softTextColor(): number
    {
        return 13619151;
    }

    // AS3: VolterWiredStyle.as::get redTextColor()
    override get redTextColor(): number
    {
        return 15573410;
    }

    // AS3: VolterWiredStyle.as::get name()
    override get name(): string
    {
        return 'volter';
    }

    // AS3: VolterWiredStyle.as::get isVolter()
    override get isVolter(): boolean
    {
        return true;
    }
}
