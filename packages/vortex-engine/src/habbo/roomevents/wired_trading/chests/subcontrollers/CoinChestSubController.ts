import {OrderedMap} from '@core/utils/OrderedMap';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import {
    WiredChestCoinsMessageEvent
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/chests/WiredChestCoinsMessageEvent';
import type {
    WiredChestCoinsMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/WiredChestCoinsMessageParser';
import {
    WithdrawWiredChestCoinsComposer
} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredtrading/chests/WithdrawWiredChestCoinsComposer';
import {Util} from '../../../Util';
import {ChestType} from '../ChestType';
import type {IWiredChestControllerHost} from '../IWiredChestControllerHost';
import {AbstractChestSubController} from './AbstractChestSubController';

/**
 * The coin tab of a wired chest: a balance, an artwork that changes with it, and a withdraw field.
 *
 * **The balance artwork is picked by threshold, not by exact value.** `CHEST_STATES` maps a
 * *minimum* balance to a state name and the lookup walks every key keeping the last one matched, so
 * 0 is "zero", 1-19 "low", 20-99 "medium" and 100+ "high". The map is ordered and the walk depends
 * on it — a re-ordered map silently picks the wrong artwork.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/chests/subcontrollers/CoinChestSubController.as
 */
export class CoinChestSubController extends AbstractChestSubController
{
    /**
	 * Chests whose furniture is dark enough to need the light artwork set. A single entry in AS3,
	 * matched on the furniture's `className`.
	 */
    // AS3: CoinChestSubController.as::DARK_THEME_CHEST_NAMES
    static readonly DARK_THEME_CHEST_NAMES: string[] = ['wf_storage_coins1'];

    /**
	 * Minimum balance -> artwork state. Insertion order is load-bearing; see the class note.
	 */
    // AS3: CoinChestSubController.as::CHEST_STATES / initChestStates()
    private static readonly CHEST_STATES: OrderedMap<number, string> = CoinChestSubController.initChestStates();

    // AS3: CoinChestSubController.as::_SafeStr_4550 (name derived: the tab's window)
    private _view: IWindowContainer | null;

    // AS3: CoinChestSubController.as::_SafeStr_6468 (name derived: the balance)
    private _coins: number = 0;

    // AS3: CoinChestSubController.as::_chestState
    private _chestState: string = '';

    // AS3: CoinChestSubController.as::_SafeStr_8551 (name derived: "light" or "dark")
    private _theme: string = '';

    /**
	 * `className` walks the room object and the furniture data, so AS3 caches it — and clears the
	 * cache only when a *new* chest opens, not on a balance update.
	 */
    // AS3: CoinChestSubController.as::_classNameCache
    private _classNameCache: string | null = null;

    // AS3: CoinChestSubController.as::CoinChestSubController()
    constructor(parentController: IWiredChestControllerHost)
    {
        super(parentController);

        this._view = (this.roomEvents?.getXmlWindow('coins_chest_contents') as IWindowContainer | null) ?? null;

        this.addMessageEvent(new WiredChestCoinsMessageEvent((event) => this.onCoinsMessage(event)));

        const input = this.withdrawInput;

        if(input) input.restrict = '0-9';

        this.withdrawButton?.addEventListener('WME_CLICK', this.onWithdrawClick);
    }

    // AS3: CoinChestSubController.as::initChestStates()
    private static initChestStates(): OrderedMap<number, string>
    {
        const states = new OrderedMap<number, string>();

        states.add(0, 'zero');
        states.add(1, 'low');
        states.add(20, 'medium');
        states.add(100, 'high');

        return states;
    }

    /**
	 * A blank or non-numeric field is ignored rather than refused — AS3 returns without a message.
	 */
    // AS3: CoinChestSubController.as::onWithdrawClick()
    private onWithdrawClick = (): void =>
    {
        const amount = parseInt(this.withdrawInput?.text ?? '', 10);

        if(isNaN(amount)) return;

        this.parentController?.send(new WithdrawWiredChestCoinsComposer(this.viewingChestId, amount));
    };

    /**
	 * The same message both opens the tab and updates it, and `isUpdate` says which — an update is
	 * checked against the **active** chest, an open against the **requested** one, exactly as the
	 * furniture tab does with its fragments.
	 */
    // AS3: CoinChestSubController.as::onCoinsMessage()
    private onCoinsMessage(event: IMessageEvent): void
    {
        const parser = event.parser as WiredChestCoinsMessageParser;
        const host = this.parentController;

        if(host === null) return;

        const chestId = parser.chestId;

        if(parser.isUpdate)
        {
            if(host.activeChestId !== chestId) return;

            this._coins = parser.coins;
        }
        else
        {
            if(host.requestedChestId !== chestId) return;

            this._coins = parser.coins;
            this._chestState = CoinChestSubController.CHEST_STATES.getValue(0) ?? '';
            this._classNameCache = null;

            host.setOpenStatus(chestId, this);
        }

        const amountText = this.coinAmountText;

        if(amountText) amountText.text = String(parser.coins);

        // AS3 re-centres the balance block by hand rather than through a layout rule.
        const list = this.balanceContainerList;

        if(list?.parent) list.x = (list.parent.width / 2) - (list.width / 2);

        this._chestState = CoinChestSubController.CHEST_STATES.getValue(0) ?? '';

        for(const threshold of CoinChestSubController.CHEST_STATES.getKeys())
        {
            if(parser.coins >= threshold)
            {
                this._chestState = CoinChestSubController.CHEST_STATES.getValue(threshold) ?? this._chestState;
            }
        }

        this.applyBackground();
        this.wrapperView?.updateUI();
    }

    // TS-only: no AS3 counterpart; AS3 builds this asset name inline in two places, identically.
    private applyBackground(): void
    {
        const image = this.backgroundImage;

        if(image) image.assetUri = `wired_chests_images_${this._theme}_coins_chest_balance_${this._chestState}`;
    }

    // AS3: CoinChestSubController.as::get type()
    override get type(): number
    {
        return ChestType.TYPE_COIN;
    }

    // AS3: CoinChestSubController.as::get title()
    override get title(): string
    {
        return this.localize('wiredchests.coin_chest');
    }

    // AS3: CoinChestSubController.as::get view()
    override get view(): IWindowContainer | null
    {
        return this._view;
    }

    // AS3: CoinChestSubController.as::get isEmpty()
    override get isEmpty(): boolean
    {
        return this._coins <= 0;
    }

    /**
	 * The *balance*, not a count of things — the wrapper view shows it where the furniture tab shows
	 * an item count.
	 */
    // AS3: CoinChestSubController.as::get itemCount()
    override get itemCount(): number
    {
        return this._coins;
    }

    // AS3: CoinChestSubController.as::clear()
    override clear(): void
    {
        this._coins = 0;

        super.clear();
    }

    /**
	 * The theme is resolved here rather than in the constructor because it depends on which chest is
	 * being viewed, and one sub-controller serves every chest the player opens.
	 */
    // AS3: CoinChestSubController.as::updateUI()
    override updateUI(): void
    {
        const button = this.withdrawButton;

        if(button) Util.disableSection(button, !this.canWithdraw || this.isEmpty);

        this._theme = CoinChestSubController.DARK_THEME_CHEST_NAMES.indexOf(this.className) !== -1 ? 'dark' : 'light';

        this.applyBackground();
    }

    /**
	 * Two lookups deep — the room object's `furniture_type_id`, then the floor-item data — and both
	 * failure paths cache the empty string so a chest with no resolvable furniture is not re-walked
	 * on every repaint.
	 */
    // AS3: CoinChestSubController.as::get className()
    get className(): string
    {
        if(this._classNameCache !== null) return this._classNameCache;

        const furni = this.wrapperView?.viewingChestFurni ?? null;

        if(furni == null)
        {
            this._classNameCache = '';

            return this._classNameCache;
        }

        const typeId = furni.getModel().getNumber('furniture_type_id');
        const furniData = this.parentController?.sessionDataManager?.getFloorItemData(typeId) ?? null;

        this._classNameCache = furniData?.className ?? '';

        return this._classNameCache;
    }

    /**
	 * False, unlike the furniture tab: the coin tab is a fixed-height panel, so the wrapper must not
	 * grow to fit it.
	 */
    // AS3: CoinChestSubController.as::get allowResizing()
    override get allowResizing(): boolean
    {
        return false;
    }

    // AS3: CoinChestSubController.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        (this._view as unknown as IWindow | null)?.dispose();
        this._view = null;

        super.dispose();
    }

    // AS3: CoinChestSubController.as::get balanceText()
    private get balanceText(): ITextWindow | null
    {
        return (this._view?.findChildByName('balance_txt') as ITextWindow | null) ?? null;
    }

    // AS3: CoinChestSubController.as::get coinAmountText()
    private get coinAmountText(): ITextWindow | null
    {
        return (this._view?.findChildByName('coins_amount_txt') as ITextWindow | null) ?? null;
    }

    // AS3: CoinChestSubController.as::get balanceContainerList()
    private get balanceContainerList(): IWindow | null
    {
        return this._view?.findChildByName('balance_container') ?? null;
    }

    // AS3: CoinChestSubController.as::get backgroundImage()
    private get backgroundImage(): IStaticBitmapWrapperWindow | null
    {
        return (this._view?.findChildByName('bg_img') as IStaticBitmapWrapperWindow | null) ?? null;
    }

    // AS3: CoinChestSubController.as::get withdrawInput()
    private get withdrawInput(): ITextFieldWindow | null
    {
        return (this._view?.findChildByName('withdraw_input') as ITextFieldWindow | null) ?? null;
    }

    // AS3: CoinChestSubController.as::get withdrawButton()
    private get withdrawButton(): IWindow | null
    {
        return this._view?.findChildByName('withdraw_btn') ?? null;
    }
}
