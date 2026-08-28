import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {InfoStandWidget} from './InfoStandWidget';

/**
 * Lays a user's room tags out as clickable chips, wrapping them across rows and dropping whatever
 * does not fit in 150 pixels.
 *
 * **`renderTags()` has no caller in any source tree.** `InfoStandUserView` builds one of these in
 * its constructor and disposes it, and never asks it to draw — the 2026 client took the tag list
 * off the info stand and left the renderer behind. It is ported because it is part of the client,
 * not because anything runs it; the search message it would send, `RWRTSM_ROOM_TAG_SEARCH`, is
 * handled by `InfoStandWidgetHandler` and is reachable by other routes.
 *
 * The layout is a recursive fit, the same shape `NameSuggestionListRenderer` uses: place, advance,
 * and on overflow reset to the left, drop a row and *retry the same chip* — so one chip is never
 * split across the wrap, and one too wide for the band is rejected outright rather than looping.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/TagListRenderer.as
 */
export class TagListRenderer
{
    // AS3: TagListRenderer.as::MARGIN_X
    private static readonly MARGIN_X: number = 5;

    // AS3: TagListRenderer.as::MARGIN_Y
    private static readonly MARGIN_Y: number = 5;

    /** The band tags are allowed to fill; AS3 overwrites the container's own height with it. */
    // AS3: TagListRenderer.as::renderTags() — inline literal (name derived)
    private static readonly MAX_HEIGHT: number = 150;

    /** Derived name — `_SafeStr_4549`: the widget the assets and window manager come from. */
    // AS3: TagListRenderer.as::_SafeStr_4549
    private _widget: InfoStandWidget | null;

    /** Derived name — `_SafeStr_4791`: the click handler every chip gets. */
    // AS3: TagListRenderer.as::_SafeStr_4791
    private _onTagSelected: ((event: WindowEvent, window: IWindow) => void) | null;

    // AS3: TagListRenderer.as::_offsetX
    private _offsetX: number = 0;

    // AS3: TagListRenderer.as::_offsetY
    private _offsetY: number = 0;

    /** Derived name — `_SafeStr_7010`: the area to fill, its height forced to MAX_HEIGHT. */
    // AS3: TagListRenderer.as::_SafeStr_7010
    private _bounds: {width: number; height: number} = {width: 0, height: 0};

    /** Derived name — `_SafeStr_7994`: the tags to draw highlighted, and to sort to the front. */
    // AS3: TagListRenderer.as::_SafeStr_7994
    private _highlighted: string[] | null = null;

    // AS3: TagListRenderer.as::TagListRenderer()
    constructor(widget: InfoStandWidget, onTagSelected: (event: WindowEvent, window: IWindow) => void)
    {
        this._widget = widget;
        this._onTagSelected = onTagSelected;
    }

    /**
     * Draws `tags` into `container` and answers the bottom of the last chip that fitted, or 0.
     *
     * The reordering is AS3's and is destructive: it *pops* `tags` empty, unshifting highlighted
     * ones to the front and pushing the rest to the back — which reverses the non-highlighted ones.
     * Transcribed, because the order is what would show.
     */
    // AS3: TagListRenderer.as::renderTags()
    renderTags(tags: string[], container: IWindowContainer, highlighted: string[] | null): number
    {
        this._highlighted = highlighted;

        let ordered = tags;

        if(highlighted !== null)
        {
            const sorted: string[] = [];

            for(;;)
            {
                const tag = tags.pop();

                if(tag === undefined) break;

                if(highlighted.indexOf(tag) !== -1) sorted.unshift(tag);
                else sorted.push(tag);
            }

            ordered = sorted;
        }

        while(container.removeChildAt(0) !== null)
        {
            // AS3 empties the container by removing index 0 until it answers null.
        }

        this._offsetX = 0;
        this._offsetY = 0;
        this._bounds = {width: container.width, height: TagListRenderer.MAX_HEIGHT};

        for(const tag of ordered)
        {
            const chip = this.createTag(tag);

            if(chip === null) continue;

            if(this.fit(chip as unknown as IWindow)) container.addChild(chip as unknown as IWindow);
            else chip.dispose();
        }

        if(container.numChildren === 0) return 0;

        const last = container.getChildAt(container.numChildren - 1);

        return last?.bottom ?? 0;
    }

    /**
     * Places one chip, wrapping to a new row if it does not fit on this one — and then retrying
     * *itself*, which is what makes a chip never straddle the wrap.
     */
    // AS3: TagListRenderer.as::fit()
    private fit(chip: IWindow): boolean
    {
        if(chip.width > this._bounds.width) return false;
        if(this._offsetY + chip.height > this._bounds.height) return false;

        if(this._offsetX + chip.width > this._bounds.width)
        {
            this._offsetX = 0;
            this._offsetY += chip.height + TagListRenderer.MARGIN_Y;

            return this.fit(chip);
        }

        chip.offset(this._offsetX, this._offsetY);

        this._offsetX += chip.width + TagListRenderer.MARGIN_X;

        return true;
    }

    /** One chip, from whichever of the two layouts its highlighted state calls for. */
    // AS3: TagListRenderer.as::createTag()
    private createTag(tag: string): ITextWindow | null
    {
        const widget = this._widget;

        if(widget == null) return null;

        const layout = (this._highlighted?.indexOf(tag) ?? -1) !== -1 ? 'user_tag_highlighted' : 'user_tag';
        const chip = widget.windowManager?.buildWidgetLayout(layout) as unknown as ITextWindow | null ?? null;

        if(chip === null) return null;

        if(this._onTagSelected !== null) (chip as unknown as IWindow).procedure = this._onTagSelected;

        chip.caption = tag;

        return chip;
    }

    // AS3: TagListRenderer.as::dispose()
    dispose(): void
    {
        this._widget = null;
        this._onTagSelected = null;
    }
}
