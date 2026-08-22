import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IUpdateReceiver} from '@core/runtime';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {ProductImageWidget} from '@habbo/window/widgets/ProductImageWidget';

import type {CollectiblesController} from './CollectiblesController';
import type {BaseItemWrapper} from './renderer/model/BaseItemWrapper';
import {CollectibleRarity} from './util/CollectibleRarity';

/**
 * "You got this!" — the popup that reveals what came out of an NFT reward box.
 *
 * It is a *queue*, not a single dialog: `showReward()` pushes onto `_pendingRewards` and the OK
 * button pops the next one, so opening several boxes in a row walks through them one at a time
 * rather than stacking windows. The window closes only when the queue is empty.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/CollectiblesRewardBoxView.as
 */
export class CollectiblesRewardBoxView implements IUpdateReceiver
{
    // AS3: CollectiblesRewardBoxView.as::BG_STAR_ROTATE_SPEED — degrees per second.
    private static readonly BG_STAR_ROTATE_SPEED = 20;

    /**
    * AS3: CollectiblesRewardBoxView.as — the window is built on desktop layer **2**, not 1 like the
    * rest of the collectibles UI. It is a celebration popup and sits above everything.
    */
    private static readonly DESKTOP_WINDOW_LAYER = 2;

    // AS3: CollectiblesRewardBoxView.as::_windowManager
    private _windowManager: IHabboWindowManager | null;
    // AS3: CollectiblesRewardBoxView.as::_SafeStr_4593 (the controller)
    private _controller: CollectiblesController | null;
    // AS3: CollectiblesRewardBoxView.as::_window
    private _window: IWindowContainer | null = null;
    // AS3: CollectiblesRewardBoxView.as::_SafeStr_6510 (the star cached at construction)
    private _rotatingStar: IStaticBitmapWrapperWindow | null = null;
    // AS3: CollectiblesRewardBoxView.as::_SafeStr_7886 (the reward queue)
    private _pendingRewards: BaseItemWrapper[] = [];

    // AS3: CollectiblesRewardBoxView.as::CollectiblesRewardBoxView()
    constructor(controller: CollectiblesController, windowManager: IHabboWindowManager)
    {
        this._controller = controller;
        this._windowManager = windowManager;

        // AS3 reads the layout via `assets.getAssetByName(...).content` + `buildFromXML(xml, 2)`;
        // `buildWidgetLayout()` is those two steps behind one call, layer included.
        this._window = windowManager.buildWidgetLayout('collectible_reward_xml', CollectiblesRewardBoxView.DESKTOP_WINDOW_LAYER) as IWindowContainer | null;

        if(this._window === null) return;

        this._rotatingStar = this.rotatingStar;

        controller.registerUpdateReceiver(this, 1);

        this.closeButton?.addEventListener(WindowMouseEvent.CLICK, this.onWindowCloseRequested as unknown as (...args: unknown[]) => void);
        this.okButton?.addEventListener(WindowMouseEvent.CLICK, this.onWindowCloseRequested as unknown as (...args: unknown[]) => void);
    }

    /**
     * `showImmediate` decides what happens when the window is *already* open: true walks straight
     * on to this reward, false leaves it queued behind whatever is on screen. The controller passes
     * true only for the first box of a session — see `showLootBoxReward()`.
     */
    // AS3: CollectiblesRewardBoxView.as::showReward()
    showReward(reward: BaseItemWrapper, showImmediate: boolean): void
    {
        if(reward.baseItem === null) return;

        this._pendingRewards.push(reward);

        if(this._windowManager !== null && this._window !== null && this._window.parent === null)
        {
            const desktop = this._windowManager.getDesktop(CollectiblesRewardBoxView.DESKTOP_WINDOW_LAYER) as IWindowContainer | null;

            desktop?.addChild(this._window);

            this.showNextRewardOrClose();
        }
        else if(showImmediate)
        {
            this.showNextRewardOrClose();
        }
    }

    // AS3: CollectiblesRewardBoxView.as::showNextRewardOrClose()
    private showNextRewardOrClose(): void
    {
        const next = this._pendingRewards.shift();

        if(next !== undefined)
        {
            this.populateRewardItem(next);

            return;
        }

        this.hideWindow();
    }

    // AS3: CollectiblesRewardBoxView.as::populateRewardItem()
    private populateRewardItem(reward: BaseItemWrapper): void
    {
        const image = this.productImage;
        const name = this.productNameText;
        const rarity = this.rarityText;

        if(image !== null) image.productInfo = reward;

        this.setWindowColors(reward.baseItem.rarity);

        if(name !== null) name.text = this._controller?.getProductName(reward) ?? '';

        if(rarity !== null) rarity.text = reward.baseItem.rarity.toUpperCase();
    }

    /**
     * Both the frame and the backdrop take the rarity colour. In practice that is always the same
     * grey — see `CollectibleRarity`, whose lookup is case-broken in AS3 too.
     */
    // AS3: CollectiblesRewardBoxView.as::setWindowColors()
    private setWindowColors(rarity: string): void
    {
        const color = CollectibleRarity.getRarityColor(rarity);
        const background = this.background;

        if(this._window !== null) this._window.color = color;

        if(background !== null) background.color = color;
    }

    // AS3: CollectiblesRewardBoxView.as::hideWindow()
    private hideWindow(): void
    {
        if(this._windowManager === null || this._window === null || this._window.parent === null) return;

        const desktop = this._windowManager.getDesktop(CollectiblesRewardBoxView.DESKTOP_WINDOW_LAYER) as IWindowContainer | null;

        desktop?.removeChild(this._window);
    }

    /** Both the X and the OK button do the same thing: advance the queue, closing only when empty. */
    // AS3: CollectiblesRewardBoxView.as::onWindowCloseRequested()
    private onWindowCloseRequested = (event: {type: string}): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this.showNextRewardOrClose();
    };

    // AS3: CollectiblesRewardBoxView.as::update()
    update(elapsedMs: number): void
    {
        if(this._rotatingStar === null) return;

        this._rotatingStar.rotation += CollectiblesRewardBoxView.BG_STAR_ROTATE_SPEED * (elapsedMs / 1000);
        this._rotatingStar.rotation %= 360;
        this._rotatingStar.invalidate();
    }

    // AS3: CollectiblesRewardBoxView.as::get background()
    private get background(): IWindow | null
    {
        return this._window?.findChildByName('background') ?? null;
    }

    // AS3: CollectiblesRewardBoxView.as::get productImage()
    private get productImage(): ProductImageWidget | null
    {
        const widgetWindow = this._window?.findChildByName('product_image') as IWidgetWindow | null ?? null;

        return (widgetWindow?.widget ?? null) as ProductImageWidget | null;
    }

    // AS3: CollectiblesRewardBoxView.as::get productNameText()
    private get productNameText(): ITextWindow | null
    {
        return this._window?.findChildByName('product_name') as ITextWindow | null ?? null;
    }

    // AS3: CollectiblesRewardBoxView.as::get closeButton()
    private get closeButton(): IWindow | null
    {
        return this._window?.findChildByName('header_button_close') ?? null;
    }

    // AS3: CollectiblesRewardBoxView.as::get okButton()
    private get okButton(): IWindow | null
    {
        return this._window?.findChildByName('ok_button') ?? null;
    }

    // AS3: CollectiblesRewardBoxView.as::get rotatingStar()
    private get rotatingStar(): IStaticBitmapWrapperWindow | null
    {
        return this._window?.findChildByName('rotating_star') as IStaticBitmapWrapperWindow | null ?? null;
    }

    // AS3: CollectiblesRewardBoxView.as::get rarityText()
    private get rarityText(): ITextWindow | null
    {
        return this._window?.findChildByName('rarity_text') as ITextWindow | null ?? null;
    }

    /**
     * AS3 returns a hard-coded `false` — the field it would read does not exist. `dispose()` below
     * is therefore not idempotent there either: calling it twice double-removes the update receiver
     * and disposes a null window. The port keeps the accessor honest instead, which also makes
     * `dispose()` safe to call twice.
     */
    // AS3: CollectiblesRewardBoxView.as::get disposed()
    get disposed(): boolean
    {
        return this._window === null;
    }

    // AS3: CollectiblesRewardBoxView.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        this._controller?.removeUpdateReceiver(this);

        this.closeButton?.removeEventListener(WindowMouseEvent.CLICK, this.onWindowCloseRequested as unknown as (...args: unknown[]) => void);
        this.okButton?.removeEventListener(WindowMouseEvent.CLICK, this.onWindowCloseRequested as unknown as (...args: unknown[]) => void);

        this._window?.dispose();
        this._window = null;
        this._rotatingStar = null;
        this._pendingRewards = [];
        this._controller = null;
        this._windowManager = null;
    }
}
