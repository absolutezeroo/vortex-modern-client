import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {SectionParam} from '../params/SectionParam';
import {TextParam} from '../params/TextParam';
import {WiredUIPreset} from './WiredUIPreset';
import type {SplitterPreset} from './SplitterPreset';
import type {TextPreset} from './TextPreset';
import {SourceTypeSelectorPreset} from './SourceTypeSelectorPreset';

/**
 * SectionPreset — a titled section: a top splitter, a header row (title + optional left option +
 * right-aligned options such as the source-type selector and the collapse/expand button) and an
 * indented content area. The expand mode controls whether the content starts shown and whether a
 * collapse button is created.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/SectionPreset.as
 */
export class SectionPreset extends WiredUIPreset
{
    // AS3: SectionPreset.as::_container
    private _container: IItemListWindow;

    // AS3: SectionPreset.as::_contentList (indented content area)
    private _contentList: IItemListWindow;

    // AS3: SectionPreset.as::_headerContainer
    private _headerContainer: IWindowContainer;

    // AS3: SectionPreset.as::_headerOptionsRightList
    private _headerOptionsRightList: IItemListWindow;

    // AS3: SectionPreset.as::_headerLeft
    private _headerLeft: IItemListWindow;

    // AS3: SectionPreset.as::_expectedWidth
    private _expectedWidth: number = 0;

    // AS3: SectionPreset.as::_splitter
    private _splitter: SplitterPreset;

    // AS3: SectionPreset.as::_title
    private _title: TextPreset;

    // AS3: SectionPreset.as::_headerOptionsRight
    private _headerOptionsRight: WiredUIPreset[];

    // AS3: SectionPreset.as::_content
    private _content: WiredUIPreset;

    // AS3: SectionPreset.as::_headerOptionLeft
    private _headerOptionLeft: WiredUIPreset | null;

    // AS3: SectionPreset.as::SectionPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, title: string, content: WiredUIPreset, param: SectionParam | null = null)
    {
        super(roomEvents, presetManager, wiredStyle);

        if(param == null)
        {
            param = SectionParam.DEFAULT;
        }

        this._container = presetManager.createLayout('vertical_list_view') as unknown as IItemListWindow;
        this._contentList = presetManager.createLayout('vertical_list_view') as unknown as IItemListWindow;
        this._container.spacing = wiredStyle.sectionSpacing;
        this._contentList.spacing = wiredStyle.sectionSpacing;
        this._contentList.x = wiredStyle.sectionLeftRightMargin;
        this._headerOptionsRight = [];
        this._headerContainer = presetManager.createLayout('container_view') as unknown as IWindowContainer;
        this._headerLeft = presetManager.createLayout('horizontal_list_view') as unknown as IItemListWindow;
        this._headerLeft.spacing = wiredStyle.genericHorizontalSpacing;
        this._headerOptionsRightList = presetManager.createLayout('horizontal_list_view') as unknown as IItemListWindow;
        this._headerOptionsRightList.spacing = wiredStyle.genericHorizontalSpacing;
        this._splitter = presetManager.createSplitter();
        this._content = content;
        this._headerOptionLeft = param.headerOptionLeft;

        const titleParam = new TextParam(this._headerOptionLeft == null ? 1 : 0, true);

        this._title = presetManager.createText(title, titleParam);

        if(param.titleYOffset > 0)
        {
            this._title.window.y = param.titleYOffset;
        }

        this._headerLeft.addListItem(this._title.window);

        if(this._headerOptionLeft != null)
        {
            this._headerLeft.addListItem(this._headerOptionLeft.window);
        }

        this._headerContainer.addChild(this._headerLeft);
        this._headerContainer.addChild(this._headerOptionsRightList);
        this._container.addListItem(this._splitter.window);
        this._contentList.addListItem(this._headerContainer);

        if(param.expandMode !== SectionParam.EXPAND_MODE_COLLAPSED)
        {
            this._contentList.addListItem(this._content.window);
        }

        this._container.addListItem(this._contentList);

        for(const option of param.miscHeaderOptions)
        {
            this.addHeaderOption(option);
        }

        if(param.sourceTypeSelectorParam != null)
        {
            const selector = presetManager.createSourceTypeSelector(param.sourceTypeSelectorParam);

            this.addHeaderOption(selector);
        }

        if(param.expandMode !== SectionParam.EXPAND_MODE_EXPANDED)
        {
            const button = presetManager.createCollapseExpandSectionButton((expanded: boolean) => this.onExpandCollapseClicked(expanded), param.expandMode === SectionParam.EXPAND_MODE_HIDDEN);

            this.addHeaderOption(button);
        }
    }

    // AS3: SectionPreset.as::addHeaderOption()
    addHeaderOption(option: WiredUIPreset): void
    {
        this._headerOptionsRightList.addListItem(option.window);
        this._headerOptionsRight.push(option);
    }

    // AS3: SectionPreset.as::onExpandCollapseClicked()
    onExpandCollapseClicked(expanded: boolean): void
    {
        if(expanded)
        {
            this._contentList.addListItem(this._content.window);
        }
        else
        {
            this._contentList.removeListItem(this._content.window);
        }
    }

    // AS3: SectionPreset.as::getSourceTypeSelector()
    getSourceTypeSelector(): SourceTypeSelectorPreset | null
    {
        for(const option of this._headerOptionsRight)
        {
            if(option instanceof SourceTypeSelectorPreset)
            {
                return option;
            }
        }

        return null;
    }

    // AS3: SectionPreset.as::refreshAlignments()
    refreshAlignments(): void
    {
        this.resizeToWidth(this._expectedWidth);
    }

    // AS3: SectionPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        if(this.disposed || this._container == null)
        {
            return;
        }

        super.resizeToWidth(width);
        this._expectedWidth = width;

        const contentWidth = width - 2 * this._wiredStyle.sectionLeftRightMargin;

        this._splitter.resizeToWidth(width);
        this._content.resizeToWidth(contentWidth);

        let maxOptionBottom = 0;

        for(const option of this._headerOptionsRight)
        {
            option.resizeToWidth(option.staticWidth);

            if(option.window.bottom > maxOptionBottom)
            {
                maxOptionBottom = option.window.bottom;
            }
        }

        this._headerOptionsRightList.x = contentWidth - this._headerOptionsRightList.width;
        this._headerOptionsRightList.height = maxOptionBottom;

        let headerHeight = this._title.window.height;

        if(this._headerOptionLeft != null)
        {
            this._headerOptionLeft.resizeToWidth(this._headerOptionLeft.staticWidth);
            this._title.resizeToWidth(this._title.staticWidth);

            if(this._headerOptionLeft.window.height > headerHeight)
            {
                headerHeight = this._headerOptionLeft.window.height;
            }
        }
        else
        {
            this._title.resizeToWidth(contentWidth - this._headerOptionsRightList.width - this._wiredStyle.genericHorizontalSpacing);
            headerHeight = this._title.window.height;
        }

        this._headerLeft.height = headerHeight;
        this._headerContainer.width = contentWidth;
        this._headerContainer.height = Math.max(maxOptionBottom, headerHeight);
        this._container.width = width;
    }

    // AS3: SectionPreset.as::set titleText()
    set titleText(value: string)
    {
        this._title.text = value;
    }

    // AS3: SectionPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: SectionPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        const presets: WiredUIPreset[] = [this._splitter, this._title, this._content];

        if(this._headerOptionLeft != null)
        {
            presets.push(this._headerOptionLeft);
        }

        return presets.concat(this._headerOptionsRight);
    }

    // AS3: SectionPreset.as::set splitterVisible()
    set splitterVisible(value: boolean)
    {
        this._splitter.visible = value;
    }

    // AS3: SectionPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IItemListWindow;
        this._contentList = null as unknown as IItemListWindow;
        this._headerContainer = null as unknown as IWindowContainer;
        this._headerOptionsRightList = null as unknown as IItemListWindow;
        this._splitter = null as unknown as SplitterPreset;
        this._title = null as unknown as TextPreset;
        this._content = null as unknown as WiredUIPreset;
        this._headerLeft = null as unknown as IItemListWindow;
        this._headerOptionLeft = null;
    }
}
