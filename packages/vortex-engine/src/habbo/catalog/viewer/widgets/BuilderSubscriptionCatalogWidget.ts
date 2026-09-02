import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {HabboCatalog} from '../../HabboCatalog';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';
import {CatalogWidgetBuilderSubscriptionUpdatedEvent} from './events/CatalogWidgetBuilderSubscriptionUpdatedEvent';
import {CatalogWidget} from './CatalogWidget';

/**
 * The Builders Club subscription panel: picks which of four buttons to show — subscribe, subscribe
 * by SMS, the big subscribe, or "try it" — from the player's remaining subscription time and from
 * whether the club's try page exists in the BUILDERS_CLUB navigator.
 *
 * `subscribe_button` is never made visible by this class: every branch below sets it to false. That
 * is the AS3's own arithmetic, not a gap — the big variant is the one the layouts ship.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/BuilderSubscriptionCatalogWidget.as
 */
export class BuilderSubscriptionCatalogWidget extends CatalogWidget
{
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/BuilderSubscriptionCatalogWidget.as::_catalog
    private _catalog: HabboCatalog | null;

    // The SMS purchase page, read once at init.
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/BuilderSubscriptionCatalogWidget.as::_SafeStr_8001
    private _buyMembershipPage: string = '';

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/BuilderSubscriptionCatalogWidget.as::BuilderSubscriptionCatalogWidget()
    constructor(window: IWindowContainer, catalog: HabboCatalog)
    {
        super(window);

        this._catalog = catalog;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/BuilderSubscriptionCatalogWidget.as::init()
    override init(): boolean
    {
        if(!super.init()) return false;

        this._buyMembershipPage = this._catalog?.getProperty('builders_club.buy_membership_page') ?? '';
        this.updateSubscriptionInfo();
        this.window.procedure = this.windowProcedure;
        this.events.on(
            CatalogWidgetBuilderSubscriptionUpdatedEvent.CWE_BUILDER_SUBSCRIPTION_UPDATED,
            this.onBuilderSubscriptionUpdated
        );

        return true;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/BuilderSubscriptionCatalogWidget.as::updateSubscriptionInfo()
    private updateSubscriptionInfo(): void
    {
        const secondsLeft = this._catalog?.builderSecondsLeft ?? 0;
        const subscribe = this.window.findChildByName('subscribe_button');
        const subscribeSms = this.window.findChildByName('subscribe_button_sms');
        const subscribeBig = this.window.findChildByName('subscribe_button_big');
        const tryButton = this.window.findChildByName('try_button');

        // AS3 guards on three of the four and then dereferences `subscribe_button_sms`
        // unconditionally below; the port keeps the same three-way guard and tolerates a missing
        // SMS button instead of throwing on a layout that omits it.
        if(tryButton == null || subscribe == null || subscribeBig == null) return;

        const tryPage = this._catalog?.getProperty('builders_club.try_page') ?? '';
        const hasTryPage = this._catalog?.getCatalogNavigator('BUILDERS_CLUB')?.getOptionalNodeByName(tryPage) != null;

        if(secondsLeft > 0 || !hasTryPage)
        {
            subscribeBig.visible = true;
            subscribe.visible = false;
            tryButton.visible = false;

            if(subscribeSms) subscribeSms.visible = false;
        }
        else
        {
            subscribeBig.visible = false;
            subscribe.visible = false;
            tryButton.visible = true;

            if(subscribeSms) subscribeSms.visible = false;
        }

        if(this._buyMembershipPage !== '' && subscribeSms)
        {
            subscribeSms.visible = true;

            // Takes the try button's slot when that one is hidden.
            if(!tryButton.visible)
            {
                subscribeSms.x = tryButton.x;
                subscribeSms.y = tryButton.y;
            }

            if(subscribeBig.visible)
            {
                subscribeBig.visible = false;
                subscribe.visible = false;
            }
        }
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/BuilderSubscriptionCatalogWidget.as::onBuilderSubscriptionUpdated()
    private onBuilderSubscriptionUpdated = (_event: CatalogWidgetBuilderSubscriptionUpdatedEvent): void =>
    {
        this.updateSubscriptionInfo();
    };

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/BuilderSubscriptionCatalogWidget.as::windowProcedure()
    private windowProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        switch(window.name)
        {
            case 'subscribe_button_big':
            case 'subscribe_button':
                HabboWebTools.openWebPageAndMinimizeClient(
                    this._catalog?.getProperty('web.shop.subscription.relativeUrl') ?? ''
                );
                break;
            case 'subscribe_button_sms':
                HabboWebTools.openWebPageAndMinimizeClient(this._buyMembershipPage);
                break;
            case 'try_button':
                this._catalog?.openCatalogPage(
                    this._catalog.getProperty('builders_club.try_page'),
                    'BUILDERS_CLUB'
                );
                break;
        }
    };

    override dispose(): void
    {
        if(this.disposed) return;

        this.events.off(
            CatalogWidgetBuilderSubscriptionUpdatedEvent.CWE_BUILDER_SUBSCRIPTION_UPDATED,
            this.onBuilderSubscriptionUpdated
        );
        this._catalog = null;
        super.dispose();
    }
}
