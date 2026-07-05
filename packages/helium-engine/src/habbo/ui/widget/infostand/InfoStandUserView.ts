/**
 * InfoStandUserView
 *
 * TODO(AS3): sources/win63_version/habbo/ui/widget/infostand/InfoStandUserView.as
 * Out of scope for the furni-only infostand port. This stub keeps InfoStandWidget's
 * structure/construction faithful to AS3 without building the user panel's window,
 * badges, motto, or relationship-status display. `window` always returns `null`, so
 * InfoStandWidget's `mainContainer.getChildByName(...)`-based `selectView()` never
 * finds this view (safe no-op) and it never shows.
 */
import type {IWindow} from '@core/window/IWindow';
import type {InfoStandWidget} from './InfoStandWidget';

export class InfoStandUserView
{
    constructor(_widget: InfoStandWidget, _name: string)
    {
    }

    public get window(): IWindow | null
    {
        return null;
    }

    public dispose(): void
    {
    }

    // TODO(AS3): InfoStandUserView.as::update() — param is RoomWidgetUserInfoUpdateEvent
    public update(_event: unknown): void
    {
    }

    // TODO(AS3): InfoStandUserView.as::setRelationshipStatuses()
    public setRelationshipStatuses(_statuses: unknown): void
    {
    }

    // TODO(AS3): InfoStandUserView.as::setFigure()
    public setFigure(_figure: string): void
    {
    }

    // TODO(AS3): InfoStandUserView.as::setMotto()
    public setMotto(_motto: string, _enabled: boolean): void
    {
    }

    // TODO(AS3): InfoStandUserView.as::set achievementScore()
    public set achievementScore(_value: number)
    {
    }

    // TODO(AS3): InfoStandUserView.as::clearBadges()
    public clearBadges(): void
    {
    }

    // TODO(AS3): InfoStandUserView.as::setBadge()
    public setBadge(_index: number, _badgeId: string): void
    {
    }

    // TODO(AS3): InfoStandUserView.as::setGroupBadge()
    public setGroupBadge(_badgeId: string | null): void
    {
    }

    // TODO(AS3): InfoStandUserView.as::clearGroupBadge()
    public clearGroupBadge(): void
    {
    }
}
