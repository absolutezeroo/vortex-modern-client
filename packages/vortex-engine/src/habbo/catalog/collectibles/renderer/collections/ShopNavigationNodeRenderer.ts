import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';

import type {ShopTab} from '../../tabs/ShopTab';

/**
 * One category button in the NFT store's left-hand list ("Furni", "Pets", "Clothes"…).
 *
 * Hover and selection share a look: `updateLook()` ORs the two flags, so hovering an unselected
 * category previews exactly what selecting it would show.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/renderer/collections/ShopNavigationNodeRenderer.as
 */
export class ShopNavigationNodeRenderer
{
    /**
    * AS3: ShopNavigationNodeRenderer.as::setActiveLook() — the selected label's colour, written as
    * `4294967295`, i.e. 0xFFFFFFFF: opaque white with the alpha byte set. Every sibling colour in this
    * package is a plain 0xRRGGBB, so the extra byte is this one literal's own.
    */
    private static readonly SELECTED_TEXT_COLOR = 4294967295;

    // AS3: ShopNavigationNodeRenderer.as::_SafeStr_7373 (the owning tab)
    private _tab: ShopTab;
    // AS3: ShopNavigationNodeRenderer.as::_SafeStr_4689 (from `get category()`)
    private _category: string;
    // AS3: ShopNavigationNodeRenderer.as::_window
    private _window: IWindowContainer | null = null;
    // AS3: ShopNavigationNodeRenderer.as::_active
    private _active: boolean = false;
    // AS3: ShopNavigationNodeRenderer.as::_itemNormalColor
    private _itemNormalColor: number = 0;
    // AS3: ShopNavigationNodeRenderer.as::_itemSelectedEtchingColor
    private _itemSelectedEtchingColor: number = 0;
    // AS3: ShopNavigationNodeRenderer.as::_SafeStr_5943 (the hovered flag)
    private _hovered: boolean = false;

    // AS3: ShopNavigationNodeRenderer.as::ShopNavigationNodeRenderer()
    constructor(tab: ShopTab, category: string)
    {
        this._tab = tab;
        this._category = category;

        this.createWindow();
    }

    /**
     * The two colours are *read off the layout* rather than hard-coded: whatever the template's
     * label was authored with becomes the unselected colour, and its etching colour becomes the
     * selected one. Which is why they are captured here, before anything repaints.
     */
    // AS3: ShopNavigationNodeRenderer.as::createWindow()
    private createWindow(): void
    {
        const template = this._tab.navigationItemTemplate;

        if(template === null) return;

        this._window = template.clone() as IWindowContainer;

        const title = this._window.findChildByTag('ITEM_TITLE') as ITextWindow | null;

        if(title !== null)
        {
            title.text = this._category;
            this._itemNormalColor = title.textColor;
            this._itemSelectedEtchingColor = title.etchingColor;
        }

        const highlight = this._window.findChildByTag('SELECTION_HILIGHT');

        if(highlight !== null) highlight.visible = false;

        this._window.addEventListener(WindowMouseEvent.CLICK, this.onButtonClicked);
        this._window.addEventListener(WindowMouseEvent.OVER, this.onOver);
        this._window.addEventListener(WindowMouseEvent.OUT, this.onOut);
    }

    // AS3: ShopNavigationNodeRenderer.as::get window()
    get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: ShopNavigationNodeRenderer.as::activate()
    activate(): void
    {
        this._active = true;
        this.updateLook();
    }

    // AS3: ShopNavigationNodeRenderer.as::deactivate()
    deactivate(): void
    {
        this._active = false;
        this.updateLook();
    }

    // AS3: ShopNavigationNodeRenderer.as::onOut()
    private onOut = (): void =>
    {
        this._hovered = false;
        this.updateLook();
    };

    // AS3: ShopNavigationNodeRenderer.as::onOver()
    private onOver = (): void =>
    {
        this._hovered = true;
        this.updateLook();
    };

    // AS3: ShopNavigationNodeRenderer.as::updateLook()
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
    }

    /**
     * Note the asymmetry with `setActiveLook()`, which is AS3's: the label is found by the
     * `SELECTION_COLOR` tag in both, but `createWindow()` above reads its initial colours off
     * `ITEM_TITLE`. In the shipped layout those are the same window; nothing guarantees it.
     */
    // AS3: ShopNavigationNodeRenderer.as::setInactiveLook()
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

    // AS3: ShopNavigationNodeRenderer.as::setActiveLook()
    private setActiveLook(): void
    {
        if(this._window === null) return;

        const label = this._window.findChildByTag('SELECTION_COLOR') as ITextWindow | null;

        if(label !== null)
        {
            label.textColor = ShopNavigationNodeRenderer.SELECTED_TEXT_COLOR;
            label.etchingColor = this._itemSelectedEtchingColor;
        }

        const highlight = this._window.findChildByTag('SELECTION_HILIGHT');

        if(highlight !== null) highlight.visible = true;
    }

    // AS3: ShopNavigationNodeRenderer.as::onButtonClicked()
    private onButtonClicked = (): void =>
    {
        this._tab.activateCategory(this);
    };

    // AS3: ShopNavigationNodeRenderer.as::get category()
    get category(): string
    {
        return this._category;
    }

    // AS3: ShopNavigationNodeRenderer.as::get disposed()
    get disposed(): boolean
    {
        return this._window === null;
    }

    // AS3: ShopNavigationNodeRenderer.as::dispose()
    dispose(): void
    {
        if(this._window === null) return;

        // AS3 disposes without unregistering; the port removes the three listeners first, as the
        // item-renderer base does.
        this._window.removeEventListener(WindowMouseEvent.CLICK, this.onButtonClicked);
        this._window.removeEventListener(WindowMouseEvent.OVER, this.onOver);
        this._window.removeEventListener(WindowMouseEvent.OUT, this.onOut);

        this._window.dispose();
        this._window = null;
    }
}
