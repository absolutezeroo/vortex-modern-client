import type {IWindowContainer} from '@core/window/IWindowContainer';

import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import {WiredStyle} from './WiredStyle';

/**
 * IlluminaWiredStyle — the modern "illumina" wired skin: roomier spacing, 12px header font, light
 * frame, soft/red accent text colours. Not a volter variant. Clones its widgets from the
 * `wired_style_illumina` XML template.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/styles/IlluminaWiredStyle.as
 */
export class IlluminaWiredStyle extends WiredStyle
{
    // AS3: IlluminaWiredStyle.as::NAME
    public static readonly NAME: string = 'illumina';

    // AS3: IlluminaWiredStyle.as::_styleTemplate
    private _styleTemplate: IWindowContainer;

    // AS3: IlluminaWiredStyle.as::IlluminaWiredStyle()
    constructor(roomEvents: HabboUserDefinedRoomEvents)
    {
        super(roomEvents);
        this._styleTemplate = roomEvents.getXmlWindow('wired_style_illumina') as unknown as IWindowContainer;
    }

    // AS3: IlluminaWiredStyle.as::get styleTemplate()
    protected override get styleTemplate(): IWindowContainer
    {
        return this._styleTemplate;
    }

    // AS3: IlluminaWiredStyle.as::get radioButtonSpacing()
    override get radioButtonSpacing(): number
    {
        return 3;
    }

    // AS3: IlluminaWiredStyle.as::get checkboxSpacing()
    override get checkboxSpacing(): number
    {
        return 3;
    }

    // AS3: IlluminaWiredStyle.as::get checkboxYOffset()
    override get checkboxYOffset(): number
    {
        return 2;
    }

    // AS3: IlluminaWiredStyle.as::get namedInputOffset()
    override get namedInputOffset(): number
    {
        return 2;
    }

    // AS3: IlluminaWiredStyle.as::get namedDropdownOffset()
    override get namedDropdownOffset(): number
    {
        return 2;
    }

    // AS3: IlluminaWiredStyle.as::get radioButtonYOffset()
    override get radioButtonYOffset(): number
    {
        return 0;
    }

    // AS3: IlluminaWiredStyle.as::get namedTextYOffset()
    override get namedTextYOffset(): number
    {
        return 0;
    }

    // AS3: IlluminaWiredStyle.as::get genericHorizontalSpacing()
    override get genericHorizontalSpacing(): number
    {
        return 5;
    }

    // AS3: IlluminaWiredStyle.as::get genericVerticalSpacing()
    override get genericVerticalSpacing(): number
    {
        return 5;
    }

    // AS3: IlluminaWiredStyle.as::get sectionSpacing()
    override get sectionSpacing(): number
    {
        return 5;
    }

    // AS3: IlluminaWiredStyle.as::get sectionLeftRightMargin()
    override get sectionLeftRightMargin(): number
    {
        return 5;
    }

    // AS3: IlluminaWiredStyle.as::get headerMargin()
    override get headerMargin(): number
    {
        return 5;
    }

    // AS3: IlluminaWiredStyle.as::get headerBottomMarginWithLink()
    override get headerBottomMarginWithLink(): number
    {
        return 1;
    }

    // AS3: IlluminaWiredStyle.as::get headerNameFontSize()
    override get headerNameFontSize(): number
    {
        return 12;
    }

    // AS3: IlluminaWiredStyle.as::get minimumOptionHeight()
    override get minimumOptionHeight(): number
    {
        return 20;
    }

    // AS3: IlluminaWiredStyle.as::get minimumOptionSpacing()
    override get minimumOptionSpacing(): number
    {
        return 4;
    }

    // AS3: IlluminaWiredStyle.as::get optionExtraUnderSpacing()
    override get optionExtraUnderSpacing(): number
    {
        return 3;
    }

    // AS3: IlluminaWiredStyle.as::get optionExtraUnderLeftMargin()
    override get optionExtraUnderLeftMargin(): number
    {
        return 25;
    }

    // AS3: IlluminaWiredStyle.as::get LRContainerMargin()
    override get LRContainerMargin(): number
    {
        return 9;
    }

    // AS3: IlluminaWiredStyle.as::get LRContainerSpacing()
    override get LRContainerSpacing(): number
    {
        return 6;
    }

    // AS3: IlluminaWiredStyle.as::get LRContainerTopBottomPadding()
    override get LRContainerTopBottomPadding(): number
    {
        return 4;
    }

    // AS3: IlluminaWiredStyle.as::get inputSourceListMinHeight()
    override get inputSourceListMinHeight(): number
    {
        return 23;
    }

    // AS3: IlluminaWiredStyle.as::get buttonRowSpacing()
    override get buttonRowSpacing(): number
    {
        return 12;
    }

    // AS3: IlluminaWiredStyle.as::get menuRightOffset()
    override get menuRightOffset(): number
    {
        return 12;
    }

    // AS3: IlluminaWiredStyle.as::get verticalSplitterColor()
    override get verticalSplitterColor(): number
    {
        return 4289374890;
    }

    // AS3: IlluminaWiredStyle.as::get frameColor()
    override get frameColor(): number
    {
        return 14869218;
    }

    // AS3: IlluminaWiredStyle.as::get backgroundColor()
    override get backgroundColor(): number
    {
        return this.frameColor;
    }

    // AS3: IlluminaWiredStyle.as::get advancedBackgroundColor()
    override get advancedBackgroundColor(): number
    {
        return 13421772;
    }

    // AS3: IlluminaWiredStyle.as::get yellowTextColor()
    override get yellowTextColor(): number
    {
        return 7501076;
    }

    // AS3: IlluminaWiredStyle.as::get softTextColor()
    override get softTextColor(): number
    {
        return 4473924;
    }

    // AS3: IlluminaWiredStyle.as::get redTextColor()
    override get redTextColor(): number
    {
        return 15544371;
    }

    // AS3: IlluminaWiredStyle.as::get name()
    override get name(): string
    {
        return 'illumina';
    }
}
