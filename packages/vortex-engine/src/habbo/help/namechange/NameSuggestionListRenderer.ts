import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {INameChangeUI} from '../INameChangeUI';

/**
 * NameSuggestionListRenderer — lays the server's alternative names out as a wrapped row of chips.
 *
 * Each suggestion is its own `welcome_name_suggestion_item` window, sized by its text, packed
 * left-to-right and wrapped when the row runs out; anything that still does not fit in the 150px
 * band is disposed rather than clipped. That height is AS3's own literal, overriding whatever the
 * `suggestions` container is sized to in the layout.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/namechange/NameSuggestionListRenderer.as
 */
export class NameSuggestionListRenderer
{
    /** Gap between two chips, horizontally and when wrapping to the next line. */
    // AS3: .../NameSuggestionListRenderer.as::MARGIN_X
    private static readonly MARGIN_X: number = 5;

    // AS3: .../NameSuggestionListRenderer.as::MARGIN_Y
    private static readonly MARGIN_Y: number = 5;

    /** The band a suggestion has to fit inside, whatever the layout says. */
    // AS3: .../NameSuggestionListRenderer.as::render() (the literal 150)
    private static readonly MAX_HEIGHT: number = 150;

    // AS3: .../NameSuggestionListRenderer.as::_main
    private _main: INameChangeUI | null;

    // AS3: .../NameSuggestionListRenderer.as::_offsetX
    private _offsetX: number = 0;

    // AS3: .../NameSuggestionListRenderer.as::_offsetY
    private _offsetY: number = 0;

    /** Derived name — `_SafeStr_7010`: the box the chips have to stay inside. */
    // AS3: .../NameSuggestionListRenderer.as::_SafeStr_7010
    private _bounds: { x: number; y: number; width: number; height: number } | null = null;

    // AS3: .../NameSuggestionListRenderer.as::NameSuggestionListRenderer()
    constructor(main: INameChangeUI)
    {
        this._main = main;
    }

    /**
     * AS3: .../NameSuggestionListRenderer.as::render()
     *
     * Returns the bottom of the last chip that fitted, which is what the caller uses to size the
     * area — and 0 when nothing fitted at all.
     */
    // AS3: .../NameSuggestionListRenderer.as::render()
    render(suggestions: string[], container: IWindowContainer): number
    {
        while(container.numChildren > 0)
        {
            container.removeChildAt(0)?.dispose();
        }

        container.parent?.invalidate();

        this._offsetX = 0;
        this._offsetY = 0;
        this._bounds = {...container.rectangle, height: NameSuggestionListRenderer.MAX_HEIGHT};

        for(const suggestion of suggestions)
        {
            const item = this.createItem(suggestion);

            if(item === null) continue;

            if(this.fit(item)) container.addChild(item);
            else item.dispose();
        }

        if(container.numChildren === 0) return 0;

        return container.getChildAt(container.numChildren - 1)?.bottom ?? 0;
    }

    /**
     * AS3: .../NameSuggestionListRenderer.as::fit()
     *
     * Recursive by design: a chip that overflows the row rewinds to x=0, drops a line and asks
     * again, so the second attempt is the one that either places it or gives up on the height.
     * The `width < 2` test rejects a window that failed to build rather than placing an empty one.
     */
    // AS3: .../NameSuggestionListRenderer.as::fit()
    private fit(item: IWindow): boolean
    {
        if(this._bounds === null) return false;

        if(item.width > this._bounds.width || item.width < 2) return false;

        if(this._offsetY + item.height > this._bounds.height) return false;

        if(this._offsetX + item.width > this._bounds.width)
        {
            this._offsetX = 0;
            this._offsetY += item.height + NameSuggestionListRenderer.MARGIN_Y;

            return this.fit(item);
        }

        item.x += this._offsetX;
        item.y += this._offsetY;
        this._offsetX += item.width + NameSuggestionListRenderer.MARGIN_X;

        return true;
    }

    // AS3: .../NameSuggestionListRenderer.as::createItem()
    private createItem(name: string): ITextWindow | null
    {
        const item = this._main?.buildXmlWindow('welcome_name_suggestion_item') as ITextWindow | null ?? null;

        if(item === null) return null;

        item.text = name;

        return item;
    }

    // AS3: .../NameSuggestionListRenderer.as::dispose()
    dispose(): void
    {
        this._main = null;
    }
}
