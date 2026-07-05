import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboTransitionalNavigator} from './IHabboTransitionalNavigator';
import {Util} from './Util';

/**
 * Renders clickable room tags with hover effects.
 *
 * Creates up to 4 tag elements dynamically with background hover states.
 * Clicking a tag performs a tag search in the navigator.
 *
 * @see sources/win63_version/habbo/navigator/TagRenderer.as
 */
export class TagRenderer
{
    private _navigator: IHabboTransitionalNavigator | null;
    private _callback: (() => void) | null;

    constructor(navigator: IHabboTransitionalNavigator, callback: (() => void) | null = null)
    {
        this._navigator = navigator;
        this._callback = callback;
    }

    private _useHashTags: boolean = false;

    set useHashTags(value: boolean)
    {
        this._useHashTags = value;
    }

    /**
	 * Refreshes up to 4 tags in the container.
	 *
	 * @param container - Parent container with a "tags" child
	 * @param tagArray - Array of tag strings
	 */
    refreshTags(container: IWindowContainer, tagArray: string[]): void
    {
        const tagsContainer = container.findChildByName('tags') as IWindowContainer | null;

        if(!tagsContainer) return;

        for(let i = 0; i < 4; i++)
        {
            this.refreshTag(tagsContainer, i, tagArray[i] || null);
        }

        const availableWidth = container.width - tagsContainer.x;

        Util.layoutChildrenInArea(tagsContainer, availableWidth, 14);
        tagsContainer.height = Util.getLowestPoint(tagsContainer);
        tagsContainer.visible = tagArray.length > 0;
    }

    /**
	 * Refreshes a single tag at the given index.
	 *
	 * @param container - The tags container
	 * @param index - Tag index (0-3)
	 * @param text - Tag text, or null to hide
	 */
    refreshTag(container: IWindowContainer, index: number, text: string | null): void
    {
        const name = 'tag.' + index;
        let tagWindow = container.getChildByName(name) as IWindowContainer | null;

        if(!text || text === '')
        {
            if(tagWindow)
            {
                tagWindow.visible = false;
            }

            return;
        }

        if(!tagWindow)
        {
            if(!this._navigator) return;

            const xmlWindow = this._navigator.getXmlWindow('iro_tag');

            if(!xmlWindow) return;

            tagWindow = xmlWindow as unknown as IWindowContainer;
            tagWindow.name = name;
            container.addChild(tagWindow);
            tagWindow.procedure = this.tagProcedure;
        }

        const textWindow = tagWindow.findChildByName('txt') as ITextWindow | null;

        if(textWindow)
        {
            textWindow.text = (this._useHashTags ? '#' : '') + text;
            textWindow.width = textWindow.textWidth + 5;
            tagWindow.width = textWindow.width + 3;
        }

        this.refreshTagBg(tagWindow, false);
        tagWindow.visible = true;
    }

    dispose(): void
    {
        this._navigator = null;
        this._callback = null;
    }

    private refreshTagBg(container: IWindowContainer, hover: boolean): void
    {
        this.refreshBgPiece(container, 'l', hover);
        this.refreshBgPiece(container, 'm', hover);
        this.refreshBgPiece(container, 'r', hover);
    }

    private tagProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        const container = window as IWindowContainer;

        if(!container) return;

        if(event.type === 'WME_OVER')
        {
            this.refreshTagBg(container, true);
        }
        else if(event.type === 'WME_OUT')
        {
            this.refreshTagBg(container, false);
        }
        else if(event.type === 'WME_CLICK')
        {
            const textWindow = container.findChildByName('txt') as ITextWindow | null;

            if(textWindow && this._navigator)
            {
                const tagText = this._useHashTags
                    ? textWindow.text.substring(1)
                    : textWindow.text;

                this._navigator.performTagSearch(tagText);

                if(this._callback)
                {
                    this._callback();
                }
            }
        }
    };

    private refreshBgPiece(container: IWindowContainer, piece: string, hover: boolean): void
    {
        if(!this._navigator) return;

        const bgWindow = container.findChildByName('bg_' + piece);

        if(!bgWindow) return;

        const hoverStr = '' + hover;

        if(bgWindow.tags[0] !== hoverStr)
        {
            bgWindow.tags.splice(0, bgWindow.tags.length);
            bgWindow.tags.push(hoverStr);

            const assetName = 'tag_' + piece + (hover ? '_reactive' : '');
            const bitmapData = this._navigator.getButtonImage(assetName);

            if(bitmapData)
            {
                (bgWindow as any).bitmap = bitmapData;
                (bgWindow as any).disposesBitmap = false;
            }

            bgWindow.invalidate();
        }
    }
}
