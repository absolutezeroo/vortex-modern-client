/**
 * InfoStandSongDiskView
 *
 * TODO(AS3): sources/win63_version/habbo/ui/widget/infostand/InfoStandSongDiskView.as
 * Out of scope for the furni-only infostand port — see InfoStandUserView.ts for
 * the general rationale (thin stub, `window` always `null`).
 */
import type {IWindow} from '@core/window/IWindow';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {InfoStandWidget} from './InfoStandWidget';

export class InfoStandSongDiskView
{
    constructor(_widget: InfoStandWidget, _name: string, _catalog: IHabboCatalog | null)
    {
    }

    public get window(): IWindow | null
    {
        return null;
    }

    public dispose(): void
    {
    }

    // TODO(AS3): InfoStandSongDiskView.as::update() — param is RoomWidgetFurniInfoUpdateEvent
    public update(_event: unknown): void
    {
    }

    // TODO(AS3): InfoStandSongDiskView.as::updateSongInfo() — param is RoomWidgetSongUpdateEvent
    public updateSongInfo(_event: unknown): void
    {
    }
}
