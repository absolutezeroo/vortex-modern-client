import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';
import type {GuildMembershipsController} from '../../guilds/GuildMembershipsController';
import {CatalogWidget} from './CatalogWidget';
import {CatalogWidgetName} from './CatalogWidgetName';
import type {CatalogWidgetGuildSelectedEvent} from './events/CatalogWidgetGuildSelectedEvent';

/**
 * Display-only widget showing the badge preview for whichever guild is currently selected on
 * GuildSelectorCatalogWidget.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/GuildBadgeViewCatalogWidget.as
 */
export class GuildBadgeViewCatalogWidget extends CatalogWidget
{
    // AS3's constructor takes this controller but never calls a method on it at runtime - only
    // nulled in dispose(). Kept for signature fidelity with CatalogPage.createWidget()'s call site.
    private _controller: GuildMembershipsController | null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/GuildBadgeViewCatalogWidget.as::GuildBadgeViewCatalogWidget()
    constructor(window: IWindowContainer, controller: GuildMembershipsController)
    {
        super(window);

        this._controller = controller;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/GuildBadgeViewCatalogWidget.as::dispose()
    override dispose(): void
    {
        if(this.disposed) return;

        this._controller = null;

        super.dispose();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/GuildBadgeViewCatalogWidget.as::init()
    override init(): boolean
    {
        if(!super.init()) return false;

        this.attachWidgetView(CatalogWidgetName.GUILD_BADGE_VIEW);
        this.events.on('GUILD_SELECTED', this.onGuildSelected);

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/GuildBadgeViewCatalogWidget.as::onGuildSelected()
    private onGuildSelected = (event: CatalogWidgetGuildSelectedEvent): void =>
    {
        if(this.disposed) return;

        const badge = this.window.findChildByName('badge') as unknown as IWidgetWindow | null;
        const widget = (badge?.widget ?? null) as IBadgeImageWidget | null;

        if(widget != null)
        {
            widget.badgeId = event.badgeCode;
            widget.groupId = event.guildId;
        }
    };
}
