import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboTransitionalNavigator} from './IHabboTransitionalNavigator';
import {AlertView} from './AlertView';

/**
 * Simple alert with title, body text, and OK button.
 *
 * @see sources/win63_version/habbo/navigator/SimpleAlertView.as
 */
export class SimpleAlertView extends AlertView
{
	private _text: string;

	constructor(navigator: IHabboTransitionalNavigator, caption: string, text: string)
	{
		super(navigator, 'nav_simple_alert', caption);
		this._text = text;
	}

	protected override setupAlertWindow(window: IWindow): void
	{
		const content = (window as any).content as IWindowContainer;

		if (!content) return;

		const bodyText = content.findChildByName('body_text') as ITextWindow | null;

		if (bodyText)
		{
			bodyText.text = this._text;
		}

		const okButton = content.findChildByName('ok');

		if (okButton)
		{
			okButton.addEventListener('WME_CLICK', this.onOk);
		}

		window.tags.push('SimpleAlertView');
	}

	private onOk = (_event: WindowEvent): void =>
	{
		this.dispose();
	};
}
