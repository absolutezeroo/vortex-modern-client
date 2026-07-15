import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {GuildMembershipsController} from '../../guilds/GuildMembershipsController';
import type {GuildMembership} from '@habbo/communication/messages/incoming/users/GuildMembership';
import {GuildSelectorCatalogWidget} from './GuildSelectorCatalogWidget';
import {CatalogWidgetShowWarningTextEvent} from './events/CatalogWidgetShowWarningTextEvent';

/**
 * Subclass used on the guild-forum-buy catalog page: restricts the selectable groups to ones
 * the user can actually attach a forum to, and warns when the selected group already has one.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/GuildForumSelectorCatalogWidget.as
 */
export class GuildForumSelectorCatalogWidget extends GuildSelectorCatalogWidget
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/GuildForumSelectorCatalogWidget.as::GuildForumSelectorCatalogWidget()
    constructor(window: IWindowContainer, controller: GuildMembershipsController)
    {
        super(window, controller);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/GuildForumSelectorCatalogWidget.as::filterGroupMemberships()
    protected override filterGroupMemberships(memberships: GuildMembership[]): GuildMembership[]
    {
        const result: GuildMembership[] = [];
        const catalog = this._controller?.catalog ?? null;
        const userId = catalog?.sessionDataManager?.userId ?? -1;
        const hasSecurity4 = catalog?.sessionDataManager?.hasSecurity(4) ?? false;

        for(const membership of memberships)
        {
            if(!(!membership.hasForum && membership.ownerId !== userId && !hasSecurity4))
            {
                result.push(membership);
            }
        }

        return result;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/GuildForumSelectorCatalogWidget.as::selectGroup()
    protected override selectGroup(membership: GuildMembership): void
    {
        super.selectGroup(membership);

        this.events.emit(
            CatalogWidgetShowWarningTextEvent.CWE_SHOW_WARNING_TEXT,
            new CatalogWidgetShowWarningTextEvent(membership.hasForum ? '${catalog.alert.group_has_forum}' : '')
        );
    }
}
