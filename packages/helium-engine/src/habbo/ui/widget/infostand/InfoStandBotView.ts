/**
 * InfoStandBotView
 *
 * TODO(AS3): sources/win63_version/habbo/ui/widget/infostand/InfoStandBotView.as
 * Out of scope for the furni-only infostand port — see InfoStandUserView.ts for
 * the general rationale (thin stub, `window` always `null`).
 */
import type {IWindow} from '@core/window/IWindow';
import type {InfoStandWidget} from './InfoStandWidget';

export class InfoStandBotView
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

	// TODO(AS3): InfoStandBotView.as::update() — param is RoomWidgetUserInfoUpdateEvent
	public update(_event: unknown): void
	{
	}

	// TODO(AS3): InfoStandBotView.as::setFigure()
	public setFigure(_figure: string): void
	{
	}

	// TODO(AS3): InfoStandBotView.as::clearBadges()
	public clearBadges(): void
	{
	}

	// TODO(AS3): InfoStandBotView.as::setBadge()
	public setBadge(_index: number, _badgeId: string): void
	{
	}
}
