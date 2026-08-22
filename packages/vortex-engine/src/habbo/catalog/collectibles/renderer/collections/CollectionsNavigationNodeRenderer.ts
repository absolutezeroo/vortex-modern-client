import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {NftCollection} from '@habbo/communication/messages/parser/collectibles/NftCollection';

import type {CollectionsTab} from '../../tabs/CollectionsTab';
import {CollectionProgressColor} from './CollectionProgressColor';

/**
 * One collection in the left-hand list: its name, and a progress tint that only appears once the
 * player has collected something.
 *
 * The progress read-out has two levels. A thin colour hint shows whenever anything is collected; the
 * percentage label and bar appear **only on hover** — `setProgressLook()` is called with the hovered
 * flag from `updateLook()`, so selecting a collection does not reveal the number, hovering it does.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/renderer/collections/CollectionsNavigationNodeRenderer.as
 */
export class CollectionsNavigationNodeRenderer
{
    /** AS3: CollectionsNavigationNodeRenderer.as::setActiveLook() — 0xFFFFFFFF, alpha byte included. */
    private static readonly SELECTED_TEXT_COLOR = 4294967295;

    /** AS3: CollectionsNavigationNodeRenderer.as::setProgressLook() — forces the hint fully opaque. */
    private static readonly OPAQUE_ALPHA_MASK = 0xFF000000;

    // AS3: CollectionsNavigationNodeRenderer.as::_SafeStr_4908 (the owning tab)
    private _tab: CollectionsTab;
    // AS3: CollectionsNavigationNodeRenderer.as::_SafeStr_4700 (from `get nftCollection()`)
    private _nftCollection: NftCollection;
    // AS3: CollectionsNavigationNodeRenderer.as::_window
    private _window: IWindowContainer | null = null;
    // AS3: CollectionsNavigationNodeRenderer.as::_active
    private _active: boolean = false;
    // AS3: CollectionsNavigationNodeRenderer.as::_itemNormalColor
    private _itemNormalColor: number = 0;
    // AS3: CollectionsNavigationNodeRenderer.as::_itemSelectedEtchingColor
    private _itemSelectedEtchingColor: number = 0;
    // AS3: CollectionsNavigationNodeRenderer.as::_SafeStr_5943 (the hovered flag)
    private _hovered: boolean = false;

    // AS3: CollectionsNavigationNodeRenderer.as::CollectionsNavigationNodeRenderer()
    constructor(tab: CollectionsTab, nftCollection: NftCollection)
    {
        this._tab = tab;
        this._nftCollection = nftCollection;

        this.createWindow();
    }

    /**
     * The label falls back to the collection's *server-sent* name when `collectibles.set.<id>` has
     * no translation — so an untranslated collection still reads correctly rather than showing its
     * key.
     */
    // AS3: CollectionsNavigationNodeRenderer.as::createWindow()
    private createWindow(): void
    {
        const template = this._tab.navigationItemTemplate;

        if(template === null) return;

        this._window = template.clone() as IWindowContainer;

        const title = this._window.findChildByTag('ITEM_TITLE') as ITextWindow | null;

        if(title !== null)
        {
            title.text = this._tab.controller.localizationManager?.getLocalization(
                `collectibles.set.${this._nftCollection.collectionId}`,
                this._nftCollection.collectionName
            ) ?? this._nftCollection.collectionName;

            this._itemNormalColor = title.textColor;
            this._itemSelectedEtchingColor = title.etchingColor;
        }

        const highlight = this._window.findChildByTag('SELECTION_HILIGHT');

        if(highlight !== null) highlight.visible = false;

        this.setProgressLook(false);

        this._window.addEventListener(WindowMouseEvent.CLICK, this.onButtonClicked);
        this._window.addEventListener(WindowMouseEvent.OVER, this.onOver);
        this._window.addEventListener(WindowMouseEvent.OUT, this.onOut);
    }

    /**
     * `showDetail` gates the percentage container and label; the colour hint is gated only on
     * having collected something. The hint is forced opaque with `| 0xFF000000` because the
     * interpolated colour carries no alpha.
     */
    // AS3: CollectionsNavigationNodeRenderer.as::setProgressLook()
    private setProgressLook(showDetail: boolean = false): void
    {
        const collected = this._nftCollection.collectedItemCount;
        const total = this._nftCollection.totalItemCount;
        const container = this.progressContainer;
        const hint = this.progressColorHint;

        if(container !== null) container.visible = collected > 0 && showDetail;
        if(hint !== null) hint.visible = collected > 0;

        if(collected <= 0) return;

        const color = CollectionProgressColor.getColor(collected, total);

        if(hint !== null) hint.color = color | CollectionsNavigationNodeRenderer.OPAQUE_ALPHA_MASK;

        if(!showDetail) return;

        // AS3 divides without guarding an empty collection; `collected > 0` above already implies
        // `total > 0`, so it cannot divide by zero here.
        const percentage = Math.trunc(collected * 100 / total);
        const progressColor = this.progressColor;
        const progressText = this.progressText;

        if(progressColor !== null) progressColor.color = color;
        if(progressText !== null) progressText.text = `${percentage}%`;
    }

    // AS3: CollectionsNavigationNodeRenderer.as::get nftCollection()
    get nftCollection(): NftCollection
    {
        return this._nftCollection;
    }

    // AS3: CollectionsNavigationNodeRenderer.as::get window()
    get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: CollectionsNavigationNodeRenderer.as::activate()
    activate(): void
    {
        this._active = true;
        this.updateLook();
    }

    // AS3: CollectionsNavigationNodeRenderer.as::deactivate()
    deactivate(): void
    {
        this._active = false;
        this.updateLook();
    }

    // AS3: CollectionsNavigationNodeRenderer.as::onOut()
    private onOut = (): void =>
    {
        this._hovered = false;
        this.updateLook();
    };

    // AS3: CollectionsNavigationNodeRenderer.as::onOver()
    private onOver = (): void =>
    {
        this._hovered = true;
        this.updateLook();
    };

    /** Note the detail flag is the *hovered* one, not `active || hovered`. See the class note. */
    // AS3: CollectionsNavigationNodeRenderer.as::updateLook()
    private updateLook(): void
    {
        if(this._active || this._hovered)
        {
            this.setActiveLook();
        }
        else
        {
            this.setInactiveLook();
        }

        this.setProgressLook(this._hovered);
    }

    // AS3: CollectionsNavigationNodeRenderer.as::setInactiveLook()
    private setInactiveLook(): void
    {
        if(this._window === null) return;

        const label = this._window.findChildByTag('SELECTION_COLOR') as ITextWindow | null;

        if(label !== null)
        {
            label.textColor = this._itemNormalColor;
            label.etchingColor = 0;
        }

        const highlight = this._window.findChildByTag('SELECTION_HILIGHT');

        if(highlight !== null) highlight.visible = false;
    }

    // AS3: CollectionsNavigationNodeRenderer.as::setActiveLook()
    private setActiveLook(): void
    {
        if(this._window === null) return;

        const label = this._window.findChildByTag('SELECTION_COLOR') as ITextWindow | null;

        if(label !== null)
        {
            label.textColor = CollectionsNavigationNodeRenderer.SELECTED_TEXT_COLOR;
            label.etchingColor = this._itemSelectedEtchingColor;
        }

        const highlight = this._window.findChildByTag('SELECTION_HILIGHT');

        if(highlight !== null) highlight.visible = true;
    }

    // AS3: CollectionsNavigationNodeRenderer.as::get progressContainer()
    private get progressContainer(): IWindowContainer | null
    {
        return this._window?.findChildByName('progress_container') as IWindowContainer | null ?? null;
    }

    /** By `getChildByName` on the container, not `findChildByName` on the window — AS3's. */
    // AS3: CollectionsNavigationNodeRenderer.as::get progressColor()
    private get progressColor(): IWindow | null
    {
        return this.progressContainer?.getChildByName('progress_color') ?? null;
    }

    // AS3: CollectionsNavigationNodeRenderer.as::get progressText()
    private get progressText(): ITextWindow | null
    {
        return this.progressContainer?.getChildByName('progress_text') as ITextWindow | null ?? null;
    }

    // AS3: CollectionsNavigationNodeRenderer.as::get progressColorHint()
    private get progressColorHint(): IWindow | null
    {
        return this._window?.findChildByName('progress_color_hint') ?? null;
    }

    // AS3: CollectionsNavigationNodeRenderer.as::onButtonClicked()
    private onButtonClicked = (): void =>
    {
        this._tab.activateCollection(this);
    };

    // AS3: CollectionsNavigationNodeRenderer.as::get disposed()
    get disposed(): boolean
    {
        return this._window === null;
    }

    // AS3: CollectionsNavigationNodeRenderer.as::dispose()
    dispose(): void
    {
        if(this._window === null) return;

        // AS3 disposes without unregistering; the port removes the three listeners first.
        this._window.removeEventListener(WindowMouseEvent.CLICK, this.onButtonClicked);
        this._window.removeEventListener(WindowMouseEvent.OVER, this.onOver);
        this._window.removeEventListener(WindowMouseEvent.OUT, this.onOut);

        this._window.dispose();
        this._window = null;
    }
}
