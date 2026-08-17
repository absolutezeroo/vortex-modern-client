/**
 * TalentLevelUpController — the "you reached level N" window and its reward strip.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/talent/TalentLevelUpController.as
 *
 * The reward strip is built from four templates lifted out of the layout's list: a plus sign
 * inserted *between* rewards, and one row each for a perk, a product, and a subscription. A level
 * that pays nothing hides the whole strip and re-arranges the window around it.
 *
 * `helper` level 1 is deliberately swallowed while citizenship is on — that level is the tail of
 * the citizenship track and its own window has already been shown.
 */
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';
import {TalentLevelUpMessageEvent} from '@habbo/communication/messages/incoming/talent/TalentLevelUpMessageEvent';
import {GetTalentTrackMessageComposer} from '@habbo/communication/messages/outgoing/talent/GetTalentTrackMessageComposer';
import type {TalentTrackRewardPerk} from '@habbo/communication/messages/parser/talent/TalentTrackRewardPerk';
import type {
    TalentTrackRewardProduct
} from '@habbo/communication/messages/parser/talent/TalentTrackRewardProduct';
import {TalentEnum} from '@habbo/session/enum/TalentEnum';
import type {HabboTalent} from './HabboTalent';

export class TalentLevelUpController
{
    // AS3: TalentLevelUpController.as::_habboTalent
    private _habboTalent: HabboTalent | null;

    // AS3: TalentLevelUpController.as::_disposed
    private _disposed: boolean = false;

    // AS3: TalentLevelUpController.as::_window
    private _window: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_4821`: the track the open window belongs to. */
    // AS3: TalentLevelUpController.as::_SafeStr_4821
    private _talentTrackName: string | null = null;

    /** Derived name — `_SafeStr_6513`: the product-reward row template. */
    // AS3: TalentLevelUpController.as::_SafeStr_6513
    private _productTemplate: IWindow | null = null;

    /** Derived name — `_SafeStr_6658`: the subscription-reward row template. */
    // AS3: TalentLevelUpController.as::_SafeStr_6658
    private _vipTemplate: IWindow | null = null;

    /** Derived name — `_SafeStr_6840`: the perk-reward row template. */
    // AS3: TalentLevelUpController.as::_SafeStr_6840
    private _perkTemplate: IWindow | null = null;

    // AS3: TalentLevelUpController.as::TalentLevelUpController()
    constructor(habboTalent: HabboTalent)
    {
        this._habboTalent = habboTalent;
    }

    // AS3: TalentLevelUpController.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: TalentLevelUpController.as::initialize()
    public initialize(): void
    {
        this._habboTalent?.communicationManager?.addMessageEvent(
            new TalentLevelUpMessageEvent(this.onTalentLevelUp)
        );
    }

    // AS3: TalentLevelUpController.as::onTalentLevelUp()
    private onTalentLevelUp = (event: IMessageEvent): void =>
    {
        const parser = (event as TalentLevelUpMessageEvent).talentParser;

        if(parser.level === 1
            && parser.talentTrackName === TalentEnum.HELPER
            && this._habboTalent?.citizenshipEnabled)
        {
            return;
        }

        this.showWindow(parser.talentTrackName, parser.level, parser.rewardPerks, parser.rewardProducts);
    };

    // AS3: TalentLevelUpController.as::showWindow()
    public showWindow(
        talentTrackName: string,
        level: number,
        rewardPerks: TalentTrackRewardPerk[],
        rewardProducts: TalentTrackRewardProduct[]
    ): void
    {
        this.closeWindow();

        this._talentTrackName = talentTrackName;
        this._window = (this._habboTalent?.getXmlWindow('level_up') ?? null) as IWindowContainer | null;

        if(this._window === null) return;

        const window = this._window as unknown as IWindow;

        window.center();
        window.procedure = this.onWindowEvent;

        const decoration = this._window.findChildByName('level_decoration') as IStaticBitmapWrapperWindow | null;

        if(decoration !== null)
        {
            decoration.assetUri = `\${image.library.url}talent/${talentTrackName}_levelup_${level}.png`;
        }

        this.setCaption('level_up_message', `\${talent.track.${talentTrackName}.levelup.message}`);
        this.setCaption('level_title', `\${talent.track.${talentTrackName}.level.${level}.title}`);
        this.setCaption('level_description', `\${talent.track.${talentTrackName}.level.${level}.description}`);

        const rewardList = this._window.findChildByName('reward_list') as unknown as IItemListWindow | null;

        if(rewardList === null) return;

        const plusTemplate = TalentLevelUpController.takeTemplate(rewardList, 'plus_template');

        this._productTemplate = TalentLevelUpController.takeTemplate(rewardList, 'reward_product_template');
        this._vipTemplate = TalentLevelUpController.takeTemplate(rewardList, 'reward_vip_template');
        this._perkTemplate = TalentLevelUpController.takeTemplate(rewardList, 'reward_perk_template');

        let any = false;

        for(const perk of rewardPerks)
        {
            if(any && plusTemplate !== null) rewardList.addListItem(plusTemplate.clone());

            const row = this.createRewardPerk(perk);

            if(row !== null) rewardList.addListItem(row);

            any = true;
        }

        for(const product of rewardProducts)
        {
            if(any && plusTemplate !== null) rewardList.addListItem(plusTemplate.clone());

            const row = this.createRewardProduct(product);

            if(row !== null) rewardList.addListItem(row);

            any = true;
        }

        if(rewardList.numListItems < 1)
        {
            const rewards = this._window.findChildByName('level_rewards');

            if(rewards !== null) rewards.visible = false;

            const layout = this._window.findChildByName('level_up_layout') as unknown as IItemListWindow | null;

            layout?.arrangeListItems();
        }
    }

    // TS-only: AS3 inlines `list.removeListItem(list.getListItemByName(name))` at each of the four
    // template lifts; the null-guard the port needs is the same every time.
    private static takeTemplate(list: IItemListWindow, name: string): IWindow | null
    {
        const item = list.getListItemByName(name);

        return item !== null ? list.removeListItem(item) : null;
    }

    // TS-only: the null-guarded form of AS3's `findChildByName(name).caption = value`.
    private setCaption(name: string, caption: string): void
    {
        const child = this._window?.findChildByName(name) ?? null;

        if(child !== null) child.caption = caption;
    }

    // AS3: TalentLevelUpController.as::createRewardPerk()
    private createRewardPerk(perk: TalentTrackRewardPerk): IWindow | null
    {
        if(this._perkTemplate === null) return null;

        const row = this._perkTemplate.clone() as unknown as IWindowContainer;
        const image = row.findChildByName('perk_image') as unknown as IWidgetWindow | null;
        const badge = image?.widget as unknown as IBadgeImageWidget | null;

        if(badge != null) badge.badgeId = perk.perkId;

        const name = row.findChildByName('perk_name');

        if(name !== null) name.caption = `\${perk.${perk.perkId}.name}`;

        return row as unknown as IWindow;
    }

    /**
     * A product reward is an image named after its code; a subscription reward is a different row
     * whose caption carries the day count.
     */
    // AS3: TalentLevelUpController.as::createRewardProduct()
    private createRewardProduct(product: TalentTrackRewardProduct): IWindow | null
    {
        if(product.vipDays === 0)
        {
            if(this._productTemplate === null) return null;

            const row = this._productTemplate.clone();
            const code = product.productCode.toLowerCase().replace(' ', '_');

            (row as unknown as IStaticBitmapWrapperWindow).assetUri =
                `\${image.library.url}talent/reward_product_${code}.png`;

            return row;
        }

        if(this._vipTemplate === null) return null;

        const row = this._vipTemplate.clone();
        const length = (row as unknown as IWindowContainer).findChildByName('vip_length');

        if(length !== null)
        {
            length.caption = this._habboTalent?.localizationManager?.getLocalizationWithParams(
                'catalog.vip.item.header.days', '', 'num_days', String(product.vipDays)
            ) ?? '';
        }

        return row;
    }

    // AS3: TalentLevelUpController.as::closeWindow()
    private closeWindow(): void
    {
        if(this._window !== null)
        {
            (this._window as unknown as IWindow).dispose();
            this._window = null;
        }
    }

    // AS3: TalentLevelUpController.as::onWindowEvent()
    private onWindowEvent = (event: WindowEvent, window: IWindow): void =>
    {
        const self = this._window as unknown as IWindow | null;

        if(self === null || self.disposed || event.type !== 'WME_CLICK') return;

        switch(window.name)
        {
            case 'header_button_close':
            case 'close_button':
                this.closeWindow();
                break;

            case 'talent_button':
                this.closeWindow();
                this._habboTalent?.tracking?.trackTalentTrackOpen(this._talentTrackName ?? '', 'levelup');
                this._habboTalent?.send(new GetTalentTrackMessageComposer(this._talentTrackName ?? ''));
                break;
        }
    };

    // AS3: TalentLevelUpController.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        if(this._perkTemplate !== null)
        {
            this._perkTemplate.dispose();
            this._perkTemplate = null;
        }

        if(this._productTemplate !== null)
        {
            this._productTemplate.dispose();
            this._productTemplate = null;
        }

        if(this._vipTemplate !== null)
        {
            this._vipTemplate.dispose();
            this._vipTemplate = null;
        }

        this.closeWindow();

        this._habboTalent = null;
        this._disposed = true;
    }
}
