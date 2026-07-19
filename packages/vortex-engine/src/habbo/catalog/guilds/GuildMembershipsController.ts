import {Logger} from '@core/utils/Logger';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {HabboCatalog} from '../HabboCatalog';
import type {GuildSelectorCatalogWidget} from '../viewer/widgets/GuildSelectorCatalogWidget';
import type {GuildMembershipsMessageEventParser} from '@habbo/communication/messages/parser/users/GuildMembershipsMessageEventParser';
import {GetGuildMembershipsMessageComposer} from '@habbo/communication/messages/outgoing/users/GetGuildMembershipsMessageComposer';

const log = Logger.getLogger('GuildMembershipsController');

/**
 * Mediator owned by HabboCatalog: fetches the current user's guild memberships and feeds them
 * to whichever GuildSelectorCatalogWidget (or its GuildForumSelectorCatalogWidget subclass) is
 * currently open on the catalog page. Only one selector widget can be registered at a time,
 * matching AS3 (only one catalog page is ever open at once).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/guilds/GuildMembershipsController.as
 */
export class GuildMembershipsController
{
    private _catalog: HabboCatalog | null;

    private _selectorWidget: GuildSelectorCatalogWidget | null = null;

    private _disposed: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/guilds/GuildMembershipsController.as::GuildMembershipsController()
    constructor(catalog: HabboCatalog)
    {
        this._catalog = catalog;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/guilds/GuildMembershipsController.as::get catalog()
    get catalog(): HabboCatalog | null
    {
        return this._catalog;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/guilds/GuildMembershipsController.as::registerGuildSelectorWidget()
    registerGuildSelectorWidget(widget: GuildSelectorCatalogWidget): void
    {
        this._selectorWidget = widget;
        this._catalog?.connection?.send(new GetGuildMembershipsMessageComposer());
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/guilds/GuildMembershipsController.as::unregisterGuildSelectorWidget()
    unregisterGuildSelectorWidget(widget: GuildSelectorCatalogWidget): void
    {
        if(this._selectorWidget === widget)
        {
            this._selectorWidget = null;
        }
        else
        {
            log.error('Tried to unregister a nonregistered group selector catalog widget');
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/guilds/GuildMembershipsController.as::onGuildMembershipsMessageEvent()
    // Takes the raw incoming event (not pre-extracted data) and pulls the parser itself, matching
    // this port's existing ClubExtendController.onOffer() precedent for this exact AS3 shape
    // (HabboCatalog.onGuildMemberships() forwards the event straight through, unlike
    // onHabboClubOffers()/ClubBuyController.onOffers() where HabboCatalog itself unwraps first).
    onGuildMembershipsMessageEvent(event: IMessageEvent): void
    {
        const parser = event.parser as GuildMembershipsMessageEventParser | null;

        if(!parser) return;

        const guilds = parser.guilds.slice(0, parser.guilds.length);

        if(this._selectorWidget != null && !this._selectorWidget.disposed)
        {
            this._selectorWidget.populateAndSelectFavorite(guilds);
            this._selectorWidget.selectFirstOffer();
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/guilds/GuildMembershipsController.as::onGuildVisualSettingsChanged()
    // AS3 parameter (the changed guild's id) is accepted but unused - re-fetching is only
    // gated on "is a selector widget currently open", not filtered by which guild changed.
    onGuildVisualSettingsChanged(_guildId: number): void
    {
        if(this._selectorWidget != null)
        {
            this._catalog?.connection?.send(new GetGuildMembershipsMessageComposer());
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/guilds/GuildMembershipsController.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._catalog = null;
        this._selectorWidget = null;
        this._disposed = true;
    }
}
