import type {IWindowContainer} from '@core/window/IWindowContainer';

import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import {WiredStyle} from './WiredStyle';

/**
 * VolterGreenWiredStyle — the green volter variant: volter metrics with a green frame/background and
 * an inner border. Clones its widgets from the `wired_style_volter_green` XML template.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/styles/VolterGreenWiredStyle.as
 */
export class VolterGreenWiredStyle extends WiredStyle
{
    // AS3: VolterGreenWiredStyle.as::NAME
    public static readonly NAME: string = 'volter_green';

    // AS3: VolterGreenWiredStyle.as::_styleTemplate
    private _styleTemplate: IWindowContainer | null = null;

    // AS3: VolterGreenWiredStyle.as::VolterGreenWiredStyle()
    constructor(roomEvents: HabboUserDefinedRoomEvents)
    {
        super(roomEvents);
    }

    // AS3: VolterGreenWiredStyle.as::get styleTemplate()
    // Lazy load (see IlluminaWiredStyle): window-layouts register after this component inits, so an
    // eager ctor load returns null; first access is at dialog-open, when they exist.
    protected override get styleTemplate(): IWindowContainer
    {
        if(this._styleTemplate === null)
        {
            this._styleTemplate = this._roomEvents.getXmlWindow('wired_style_volter_green') as unknown as IWindowContainer;
        }

        return this._styleTemplate;
    }

    // AS3: VolterGreenWiredStyle.as::get radioButtonSpacing()
    override get radioButtonSpacing(): number
    {
        return 6;
    }

    // AS3: VolterGreenWiredStyle.as::get checkboxSpacing()
    override get checkboxSpacing(): number
    {
        return 2;
    }

    // AS3: VolterGreenWiredStyle.as::get checkboxYOffset()
    override get checkboxYOffset(): number
    {
        return 0;
    }

    // AS3: VolterGreenWiredStyle.as::get namedInputOffset()
    override get namedInputOffset(): number
    {
        return 0;
    }

    // AS3: VolterGreenWiredStyle.as::get namedDropdownOffset()
    override get namedDropdownOffset(): number
    {
        return 0;
    }

    // AS3: VolterGreenWiredStyle.as::get radioButtonYOffset()
    override get radioButtonYOffset(): number
    {
        return 0;
    }

    // AS3: VolterGreenWiredStyle.as::get namedTextYOffset()
    override get namedTextYOffset(): number
    {
        return 0;
    }

    // AS3: VolterGreenWiredStyle.as::get genericHorizontalSpacing()
    override get genericHorizontalSpacing(): number
    {
        return 5;
    }

    // AS3: VolterGreenWiredStyle.as::get genericVerticalSpacing()
    override get genericVerticalSpacing(): number
    {
        return 5;
    }

    // AS3: VolterGreenWiredStyle.as::get sectionSpacing()
    override get sectionSpacing(): number
    {
        return 4;
    }

    // AS3: VolterGreenWiredStyle.as::get sectionLeftRightMargin()
    override get sectionLeftRightMargin(): number
    {
        return 5;
    }

    // AS3: VolterGreenWiredStyle.as::get headerMargin()
    override get headerMargin(): number
    {
        return 5;
    }

    // AS3: VolterGreenWiredStyle.as::get headerBottomMarginWithLink()
    override get headerBottomMarginWithLink(): number
    {
        return 1;
    }

    // AS3: VolterGreenWiredStyle.as::get headerNameFontSize()
    override get headerNameFontSize(): number
    {
        return 9;
    }

    // AS3: VolterGreenWiredStyle.as::get minimumOptionHeight()
    override get minimumOptionHeight(): number
    {
        return 20;
    }

    // AS3: VolterGreenWiredStyle.as::get minimumOptionSpacing()
    override get minimumOptionSpacing(): number
    {
        return 4;
    }

    // AS3: VolterGreenWiredStyle.as::get optionExtraUnderSpacing()
    override get optionExtraUnderSpacing(): number
    {
        return 3;
    }

    // AS3: VolterGreenWiredStyle.as::get optionExtraUnderLeftMargin()
    override get optionExtraUnderLeftMargin(): number
    {
        return 25;
    }

    // AS3: VolterGreenWiredStyle.as::get LRContainerMargin()
    override get LRContainerMargin(): number
    {
        return 9;
    }

    // AS3: VolterGreenWiredStyle.as::get LRContainerSpacing()
    override get LRContainerSpacing(): number
    {
        return 6;
    }

    // AS3: VolterGreenWiredStyle.as::get LRContainerTopBottomPadding()
    override get LRContainerTopBottomPadding(): number
    {
        return 4;
    }

    // AS3: VolterGreenWiredStyle.as::get inputSourceListMinHeight()
    override get inputSourceListMinHeight(): number
    {
        return 23;
    }

    // AS3: VolterGreenWiredStyle.as::get buttonRowSpacing()
    override get buttonRowSpacing(): number
    {
        return 12;
    }

    // AS3: VolterGreenWiredStyle.as::get menuRightOffset()
    override get menuRightOffset(): number
    {
        return 12;
    }

    // AS3: VolterGreenWiredStyle.as::get verticalSplitterColor()
    override get verticalSplitterColor(): number
    {
        return 4280492835;
    }

    // AS3: VolterGreenWiredStyle.as::get frameColor()
    override get frameColor(): number
    {
        return 7909520;
    }

    // AS3: VolterGreenWiredStyle.as::get backgroundColor()
    override get backgroundColor(): number
    {
        return 12572361;
    }

    // AS3: VolterGreenWiredStyle.as::get advancedBackgroundColor()
    override get advancedBackgroundColor(): number
    {
        return 11323319;
    }

    // AS3: VolterGreenWiredStyle.as::get yellowTextColor()
    override get yellowTextColor(): number
    {
        return 16777130;
    }

    // AS3: VolterGreenWiredStyle.as::get name()
    override get name(): string
    {
        return 'volter_green';
    }

    // AS3: VolterGreenWiredStyle.as::get isVolter()
    override get isVolter(): boolean
    {
        return true;
    }

    // AS3: VolterGreenWiredStyle.as::get useInnerBorder()
    override get useInnerBorder(): boolean
    {
        return true;
    }
}
