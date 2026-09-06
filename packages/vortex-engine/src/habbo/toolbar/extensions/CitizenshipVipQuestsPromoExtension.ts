import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {
    CitizenshipQuestPromoEnabledMessageEvent
} from '@habbo/communication/messages/incoming/quest/CitizenshipQuestPromoEnabledMessageEvent';
import {
    StartCampaignMessageComposer
} from '@habbo/communication/messages/outgoing/quest/StartCampaignMessageComposer';
import {Logger} from '@core/utils/Logger';
import {ToolbarDisplayExtensionIds} from '../ToolbarDisplayExtensionIds';

import type {HabboToolbar} from '../HabboToolbar';
import type {IExtensionView} from '../IExtensionView';

const log = Logger.getLogger('habbo.toolbar.extensions.CitizenshipVipQuestsPromoExtension');

/**
 * The "start the VIP quests" strip above the toolbar, for citizenship.
 *
 * Server-triggered and one-shot: header 1584 arrives, the strip is built and takes the slot away
 * from the club promo, and clicking its button both starts the campaign and destroys the strip. The
 * minimise/maximise pair does not hide the strip — it collapses it to a 33px header by hiding the
 * content list and the image, keeping the title bar clickable.
 *
 * The collapsed height is AS3's literal 33; the expanded one is read off the built layout rather
 * than assumed, with 216 as the value AS3 initialises the field to in case the layout is missing.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/extensions/CitizenshipVipQuestsPromoExtension.as
 */
export class CitizenshipVipQuestsPromoExtension
{
    /** AS3's literal: the height the strip collapses to, title bar only. */
    // AS3: CitizenshipVipQuestsPromoExtension.as::assignState()
    private static readonly COLLAPSED_HEIGHT: number = 33;

    // AS3: CitizenshipVipQuestsPromoExtension.as::_toolbar
    private _toolbar: HabboToolbar | null;

    /** Derived name — `_SafeStr_4985`. */
    // AS3: CitizenshipVipQuestsPromoExtension.as::_SafeStr_4985
    private _extensionView: IExtensionView | null;

    /** Derived name — `_SafeStr_4550`: the strip itself. */
    // AS3: CitizenshipVipQuestsPromoExtension.as::_SafeStr_4550
    private _window: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_6878`: the 1584 subscription, held so `dispose()` can drop it. */
    // AS3: CitizenshipVipQuestsPromoExtension.as::_SafeStr_6878
    private _promoEvent: IMessageEvent | null = null;

    // AS3: CitizenshipVipQuestsPromoExtension.as::_disposed
    private _disposed: boolean = false;

    // AS3: CitizenshipVipQuestsPromoExtension.as::_expanded
    private _expanded: boolean = true;

    /** Derived name — `_SafeStr_9118`: the layout's own height, captured once it is built. */
    // AS3: CitizenshipVipQuestsPromoExtension.as::_SafeStr_9118
    private _expandedHeight: number = 216;

    // AS3: CitizenshipVipQuestsPromoExtension.as::_vipQuestsCampaignName
    private _vipQuestsCampaignName: string = '';

    /**
     * DEVIATION: AS3 takes the window manager, assets, an event dispatcher, localisation and the
     *   connection as five further constructor arguments. `HabboToolbar` publishes every one it
     *   actually uses, and the port's other toolbar extensions take only the toolbar, so this one
     *   does too. The dispatcher and localisation arguments are dropped rather than replaced: AS3
     *   stores both and reads neither.
     */
    // AS3: CitizenshipVipQuestsPromoExtension.as::CitizenshipVipQuestsPromoExtension()
    constructor(toolbar: HabboToolbar)
    {
        this._toolbar = toolbar;
        this._extensionView = toolbar.extensionView;

        this._promoEvent = new CitizenshipQuestPromoEnabledMessageEvent(this.onCitizenshipQuestPromoEnabled);
        toolbar.connection?.addMessageEvent(this._promoEvent);

        this._vipQuestsCampaignName = toolbar.getProperty('citizenship.vip.tutorial.quest.campaign.name');
    }

    // AS3: CitizenshipVipQuestsPromoExtension.as::_disposed
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: CitizenshipVipQuestsPromoExtension.as::_expanded
    get expanded(): boolean
    {
        return this._expanded;
    }

    // AS3: CitizenshipVipQuestsPromoExtension.as::_vipQuestsCampaignName
    get vipQuestsCampaignName(): string
    {
        return this._vipQuestsCampaignName;
    }

    /**
     * The strip and the club promo share one slot, and this one wins: AS3 detaches `club_promo`
     * before attaching, every time the message arrives.
     */
    // AS3: CitizenshipVipQuestsPromoExtension.as::onCitizenshipQuestPromoEnabled()
    private onCitizenshipQuestPromoEnabled = (_event: IMessageEvent): void =>
    {
        if(this._window === null) this._window = this.createWindow();

        if(this._window === null) return;

        this.assignState();

        this._extensionView?.detachExtension(ToolbarDisplayExtensionIds.CLUB_PROMO);
        this._extensionView?.attachExtension(
            ToolbarDisplayExtensionIds.VIP_QUESTS,
            this._window as unknown as IWindow,
            10
        );
    };

    // AS3: CitizenshipVipQuestsPromoExtension.as::createWindow()
    private createWindow(): IWindowContainer | null
    {
        const toolbar = this._toolbar;

        if(toolbar === null) return null;

        const asset = (toolbar.assets?.getAssetByName('vip_quests_promo_xml') as XmlAsset | null) ?? null;

        if(asset === null)
        {
            log.warn('Missing layout "vip_quests_promo_xml" — the VIP quests promo is not built');

            return null;
        }

        const window = (toolbar.windowManager?.buildFromXML(
            asset.content as unknown as string, 1
        ) as IWindowContainer | null) ?? null;

        if(window === null) return null;

        window.findChildByName('quests_button')?.addEventListener('WME_CLICK', this.onButtonClicked);
        window.findChildByName('minimize_region')?.addEventListener('WME_CLICK', this.onMinMax);
        window.findChildByName('maximize_region')?.addEventListener('WME_CLICK', this.onMinMax);

        this._expandedHeight = window.height;

        return window;
    }

    // AS3: CitizenshipVipQuestsPromoExtension.as::destroyWindow()
    private destroyWindow(): void
    {
        this._extensionView?.detachExtension(ToolbarDisplayExtensionIds.VIP_QUESTS);

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    /** Starting the campaign is the end of the promo — AS3 tears the strip down in the same click. */
    // AS3: CitizenshipVipQuestsPromoExtension.as::onButtonClicked()
    private onButtonClicked = (): void =>
    {
        this._toolbar?.connection?.send(new StartCampaignMessageComposer(this._vipQuestsCampaignName));

        this.destroyWindow();
    };

    // AS3: CitizenshipVipQuestsPromoExtension.as::onMinMax()
    private onMinMax = (): void =>
    {
        this._expanded = !this._expanded;

        this.assignState();
    };

    // AS3: CitizenshipVipQuestsPromoExtension.as::assignState()
    private assignState(): void
    {
        if(this._window === null) return;

        const content = this._window.findChildByName('content_itemlist');
        const image = this._window.findChildByName('promo_img');

        if(content !== null) content.visible = this._expanded;
        if(image !== null) image.visible = this._expanded;

        this._window.height = this._expanded
            ? this._expandedHeight
            : CitizenshipVipQuestsPromoExtension.COLLAPSED_HEIGHT;
    }

    // AS3: CitizenshipVipQuestsPromoExtension.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        if(this._promoEvent !== null)
        {
            this._toolbar?.connection?.removeMessageEvent(this._promoEvent);
            this._promoEvent = null;
        }

        this.destroyWindow();

        this._toolbar = null;
        this._extensionView = null;
        this._disposed = true;
    }
}
