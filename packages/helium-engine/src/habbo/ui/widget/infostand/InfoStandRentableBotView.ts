/**
 * InfoStandRentableBotView
 *
 * TODO(AS3): sources/win63_version/habbo/ui/widget/infostand/InfoStandRentableBotView.as
 * Out of scope for the furni-only infostand port — see InfoStandUserView.ts for
 * the general rationale (thin stub, `window` always `null`).
 */
import type {IWindow} from '@core/window/IWindow';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {InfoStandWidget} from './InfoStandWidget';

export class InfoStandRentableBotView
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

	// TODO(AS3): InfoStandRentableBotView.as::update() — param is RoomWidgetRentableBotInfoUpdateEvent
	public update(_event: unknown): void
	{
	}
}
