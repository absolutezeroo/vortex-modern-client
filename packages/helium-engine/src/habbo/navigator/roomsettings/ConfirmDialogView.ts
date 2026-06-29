import type { IWindowContainer } from '@core/window/IWindowContainer';
import type { WindowEvent } from '@core/window/events/WindowEvent';
import type { IHabboTransitionalNavigator } from '../IHabboTransitionalNavigator';
import { Util } from '../Util';

/**
 * Generic yes/no confirmation dialog for destructive room settings actions (e.g. delete room).
 *
 * @see sources/win63_version/habbo/navigator/roomsettings/ConfirmDialogView.as
 */
export class ConfirmDialogView
{
	private _window: IWindowContainer | null = null;
	private _callback: (() => void) | null = null;

	constructor(navigator: IHabboTransitionalNavigator, callback: () => void, title: string, message: string)
	{
		this._callback = callback;

		const win = navigator.getXmlWindow('ros_confirm') as IWindowContainer | null;

		if(win === null) return;

		this._window = win;

		const closeBtn = win.findChildByTag('close');

		if(closeBtn)
		{
			closeBtn.addEventListener('WME_CLICK', this._onCancel);
		}

		const okBtn = win.findChildByName('ok');

		if(okBtn)
		{
			okBtn.addEventListener('WME_CLICK', this._onOk);
		}

		win.caption = title;

		const messageEl = win.findChildByName('message');

		if(messageEl)
		{
			messageEl.caption = message;
		}

		const pos = Util.getLocationRelativeTo(win.desktop, win.width, win.height);

		win.x = pos.x;
		win.y = pos.y;
		win.visible = true;
		win.activate();
	}

	get disposed(): boolean
	{
		return this._window === null;
	}

	dispose(): void
	{
		if(this._window === null) return;

		this._window.destroy();
		this._window = null;
		this._callback = null;
	}

	private _onCancel = (_event: WindowEvent): void =>
	{
		this.dispose();
	};

	private _onOk = (_event: WindowEvent): void =>
	{
		if(this._callback !== null)
		{
			this._callback();
		}

		this.dispose();
	};
}
