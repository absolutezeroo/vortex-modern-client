import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {WindowMouseEvent as WindowMouseEventClass} from '@core/window/events/WindowMouseEvent';

import type {CollectiblesController} from '../CollectiblesController';
import type {IRenderableCollectibleItem} from '../IRenderableCollectibleItem';
import {CollectibleProductPreviewer} from '../tabs/subviews/CollectibleProductPreviewer';

/**
 * One cell's worth of colours: the outline and the fill behind it.
 *
 * AS3 builds these as anonymous `Object`s with `background`/`outline` keys; typing them is the
 * port's, and it is what stops a misspelled key from silently doing nothing.
 */
// AS3: AbstractCollectibleItemRenderer.as::incompleteColoring() — the shape of each entry
export interface ICollectibleCellColors
{
    // AS3: AbstractCollectibleItemRenderer.as::incompleteColoring() — the "background" key
    background: number;
    // AS3: AbstractCollectibleItemRenderer.as::incompleteColoring() — the "outline" key
    outline: number;
}

// AS3: AbstractCollectibleItemRenderer.as::incompleteColoring() — the three states
export interface ICollectibleColoring
{
    // AS3: AbstractCollectibleItemRenderer.as::incompleteColoring() — the "active" key
    active: ICollectibleCellColors;
    // AS3: AbstractCollectibleItemRenderer.as::incompleteColoring() — the "hovered" key
    hovered: ICollectibleCellColors;
    // AS3: AbstractCollectibleItemRenderer.as::incompleteColoring() — the "normal" key
    normal: ICollectibleCellColors;
}

/**
 * The shared behaviour of every collectible cell in the catalog: hover/active colouring, the
 * product icon, and the click that selects it.
 *
 * **The constructor calls overridable members.** `bitmapWindow`, `badgeImageWindow`,
 * `petImageWindow`, `unknownImageWindow` and `updateVisuals()` are all resolved from the base
 * constructor and all overridden by subclasses. That works here because the getters only read
 * `container`, which the base sets first — but a subclass whose `updateVisuals()` reads one of its
 * *own* fields must assign that field before `super()`, which is legal in AS3 and legal in
 * TypeScript only with `declare`. `ShopCollectibleItemRenderer` and
 * `RewardCollectibleItemRenderer` both need that; `CollectibleItemRenderer` and
 * `MintInventoryItemRenderer` do not, and assign after `super()` as AS3 does.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/renderer/AbstractCollectibleItemRenderer.as
 */
export class AbstractCollectibleItemRenderer
{
    // AS3: AbstractCollectibleItemRenderer.as::_SafeStr_4593 (the controller)
    protected _controller: CollectiblesController;
    // AS3: AbstractCollectibleItemRenderer.as::_SafeStr_4718 (from `get renderableItem()`)
    private _renderableItem: IRenderableCollectibleItem;
    // AS3: AbstractCollectibleItemRenderer.as::_SafeStr_5766 (from `get container()`)
    private _container: IWindowContainer | null;
    // AS3: AbstractCollectibleItemRenderer.as::_SafeStr_6819 (the icon previewer)
    private _previewer: CollectibleProductPreviewer;
    // AS3: AbstractCollectibleItemRenderer.as::_active
    private _active: boolean = false;
    // AS3: AbstractCollectibleItemRenderer.as::_SafeStr_5943 (the hovered flag)
    private _hovered: boolean = false;

    // AS3: AbstractCollectibleItemRenderer.as::AbstractCollectibleItemRenderer()
    constructor(
        controller: CollectiblesController,
        renderableItem: IRenderableCollectibleItem,
        container: IWindowContainer
    )
    {
        this._controller = controller;
        this._renderableItem = renderableItem;
        this._container = container;

        container.addEventListener(WindowMouseEventClass.CLICK, this.onClickHandler);
        container.addEventListener(WindowMouseEventClass.OVER, this.onOver);
        container.addEventListener(WindowMouseEventClass.OUT, this.onOut);

        // Only four of the previewer's eight windows: a catalog cell has no avatar, no placeholder
        // and no effect preview. The other four parameters default to null, which is what makes
        // those setters no-ops here.
        this._previewer = new CollectibleProductPreviewer(
            this.bitmapWindow,
            this.badgeImageWindow,
            this.petImageWindow,
            this.unknownImageWindow
        );

        this._controller.previewIcon(this._renderableItem, this._previewer);

        this.updateVisuals();
        this.updateColoring();
    }

    /** Empty in the base; every subclass overrides it. Called from the constructor — see the note. */
    // AS3: AbstractCollectibleItemRenderer.as::updateVisuals()
    updateVisuals(): void
    {
    }

    /**
     * Empty in the base. Bound as an arrow property below so the listener identity is stable for
     * `removeEventListener`; subclasses override `onClick()`, not the binding.
     */
    // AS3: AbstractCollectibleItemRenderer.as::onClick()
    protected onClick(_event: WindowMouseEvent): void
    {
    }

    /**
     * TS-only: the stable listener the container is registered with. AS3 can pass the overridden
     * method directly because a method reference there is virtual and identity-stable; a TypeScript
     * arrow property is neither if each subclass rebinds it, so the base owns the binding and
     * dispatches to the overridable `onClick()`.
     */
    // TS-only: see the note above.
    private onClickHandler = (event: WindowMouseEvent): void =>
    {
        this.onClick(event);
    };

    // AS3: AbstractCollectibleItemRenderer.as::updateColoring()
    private updateColoring(): void
    {
        const coloring = this.isComplete ? this.completeColoring() : this.incompleteColoring();
        const state = this._hovered ? coloring.hovered : (this._active ? coloring.active : coloring.normal);
        const outline = this.borderOutline;
        const background = this.borderBackground;

        if(outline !== null) outline.color = state.outline;

        if(background !== null) background.color = state.background;
    }

    // AS3: AbstractCollectibleItemRenderer.as::incompleteColoring()
    protected incompleteColoring(): ICollectibleColoring
    {
        return {
            active: {background: 15132390, outline: 16777215},
            hovered: {background: 14409183, outline: 16119544},
            normal: {background: 13159891, outline: 9412017},
        };
    }

    // AS3: AbstractCollectibleItemRenderer.as::completeColoring()
    protected completeColoring(): ICollectibleColoring
    {
        return {
            active: {background: 14872032, outline: 16777215},
            hovered: {background: 14346200, outline: 16119544},
            normal: {background: 13820623, outline: 8823170},
        };
    }

    /** "Complete" means owned at all — the amount, not a separate flag. */
    // AS3: AbstractCollectibleItemRenderer.as::get isComplete()
    protected get isComplete(): boolean
    {
        return this._renderableItem.amount > 0;
    }

    // AS3: AbstractCollectibleItemRenderer.as::activate()
    activate(): void
    {
        this._active = true;
        this.updateColoring();
    }

    // AS3: AbstractCollectibleItemRenderer.as::deactivate()
    deactivate(): void
    {
        this._active = false;
        this.updateColoring();
    }

    // AS3: AbstractCollectibleItemRenderer.as::onOut()
    private onOut = (): void =>
    {
        this._hovered = false;
        this.updateColoring();
    };

    // AS3: AbstractCollectibleItemRenderer.as::onOver()
    private onOver = (): void =>
    {
        this._hovered = true;
        this.updateColoring();
    };

    // AS3: AbstractCollectibleItemRenderer.as::get renderableItem()
    get renderableItem(): IRenderableCollectibleItem
    {
        return this._renderableItem;
    }

    // AS3: AbstractCollectibleItemRenderer.as::get container()
    get container(): IWindowContainer | null
    {
        return this._container;
    }

    /**
     * All eight window accessors return null in the base and are overridden per subclass, because
     * the cell layouts differ. AS3 declares them the same way.
     */
    // AS3: AbstractCollectibleItemRenderer.as::get borderOutline()
    protected get borderOutline(): IWindow | null
    {
        return null;
    }

    // AS3: AbstractCollectibleItemRenderer.as::get borderBackground()
    protected get borderBackground(): IWindow | null
    {
        return null;
    }

    // AS3: AbstractCollectibleItemRenderer.as::get amountText()
    protected get amountText(): ITextWindow | null
    {
        return null;
    }

    // AS3: AbstractCollectibleItemRenderer.as::get amountTextBorder()
    protected get amountTextBorder(): IWindow | null
    {
        return null;
    }

    // AS3: AbstractCollectibleItemRenderer.as::get bitmapWindow()
    protected get bitmapWindow(): IBitmapWrapperWindow | null
    {
        return null;
    }

    // AS3: AbstractCollectibleItemRenderer.as::get unknownImageWindow()
    protected get unknownImageWindow(): IStaticBitmapWrapperWindow | null
    {
        return null;
    }

    // AS3: AbstractCollectibleItemRenderer.as::get badgeImageWindow()
    protected get badgeImageWindow(): IWidgetWindow | null
    {
        return null;
    }

    // AS3: AbstractCollectibleItemRenderer.as::get petImageWindow()
    protected get petImageWindow(): IWidgetWindow | null
    {
        return null;
    }

    /**
     * AS3 returns a hard-coded `false` here and never sets a flag — so a disposed renderer still
     * reports itself alive. The port answers from the container it actually nulls in `dispose()`.
     */
    // AS3: AbstractCollectibleItemRenderer.as::get disposed()
    get disposed(): boolean
    {
        return this._container === null;
    }

    /**
     * AS3 disposes the container without unregistering its three listeners first. Harmless there,
     * since disposing the window drops them with it; the port removes them anyway, because a
     * listener outliving its renderer is the shape of leak this codebase has had before.
     */
    // AS3: AbstractCollectibleItemRenderer.as::dispose()
    dispose(): void
    {
        if(this._container === null) return;

        this._container.removeEventListener(WindowMouseEventClass.CLICK, this.onClickHandler);
        this._container.removeEventListener(WindowMouseEventClass.OVER, this.onOver);
        this._container.removeEventListener(WindowMouseEventClass.OUT, this.onOut);

        this._previewer.dispose();

        this._container.dispose();
        this._container = null;
    }
}
