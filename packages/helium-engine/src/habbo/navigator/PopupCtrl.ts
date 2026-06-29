import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboTransitionalNavigator} from './IHabboTransitionalNavigator';
import {Util} from './Util';

/**
 * Base class for tooltip-style popups with auto-positioning and delayed show/hide.
 *
 * Shows a popup positioned relative to a trigger window after a 500ms delay.
 * Hides after a 100ms delay when mouse leaves. Supports left/right arrow placement.
 *
 * @see sources/win63_version/habbo/navigator/PopupCtrl.as
 */
export class PopupCtrl
{
	private _xmlFileName: string;
	private _offsetXLeft: number;
	private _offsetXRight: number;
	private _displayTimer: ReturnType<typeof setTimeout> | null = null;
	private _hideTimer: ReturnType<typeof setTimeout> | null = null;
	private _popup: IWindowContainer | null = null;

	constructor(navigator: IHabboTransitionalNavigator, offsetX: number, offsetY: number, xmlFileName: string)
	{
		this._navigator = navigator;
		this._xmlFileName = xmlFileName;
		this._offsetXLeft = offsetX;
		this._offsetXRight = offsetY;
	}

	private _navigator: IHabboTransitionalNavigator | null;

	get navigator(): IHabboTransitionalNavigator | null
	{
		return this._navigator;
	}

	get visible(): boolean
	{
		return this._popup !== null && this._popup.visible;
	}

	/**
	 * Shows the popup positioned relative to the trigger window.
	 *
	 * @param triggerWindow - The window that triggered the popup
	 */
	showPopup(triggerWindow: IWindow): void
	{
		if (!this._navigator) return;

		if (!this._popup)
		{
			const xmlWindow = this._navigator.getXmlWindow(this._xmlFileName);

			if (!xmlWindow) return;

			this._popup = xmlWindow as unknown as IWindowContainer;
			this._popup.visible = false;
			this._popup.setParamFlag(1, true);
			this._popup.procedure = this.onPopup;
		}

		Util.hideChildren(this._popup);
		this.refreshContent(this._popup);
		this._popup.height = Util.getLowestPoint(this._popup) + 5;

		const triggerPos = {x: 0, y: 0};

		triggerWindow.getGlobalPosition(triggerPos);
		this._popup.x = triggerPos.x + this._offsetXLeft + triggerWindow.width;
		this._popup.y = triggerPos.y - this._popup.height * 0.5 + triggerWindow.height * 0.5;

		const popupPos = {x: 0, y: 0};

		this._popup.getGlobalPosition(popupPos);

		const desktop = this._popup.desktop;

		if (desktop && popupPos.x + this._popup.width > desktop.width)
		{
			this._popup.x = -this._popup.width + triggerPos.x + this._offsetXRight;
			this.refreshPopupArrows(this._popup, false);
		}
		else
		{
			this.refreshPopupArrows(this._popup, true);
		}

		if (!this._popup.visible)
		{
			this.resetDisplayTimer();
			this._displayTimer = setTimeout(() => this.onDisplayTimer(), 500);
		}

		this.resetHideTimer();
		this._popup.activate();
	}

	/**
	 * Starts the hide timer (100ms delay).
	 */
	closePopup(): void
	{
		this.resetHideTimer();
		this.resetDisplayTimer();
		this._hideTimer = setTimeout(() => this.onHideTimer(), 100);
	}

	/**
	 * Hides the popup immediately without delay.
	 */
	hideInstantly(): void
	{
		if (this._popup)
		{
			this._popup.visible = false;
		}

		this.resetDisplayTimer();
		this.resetHideTimer();
	}

	/**
	 * Override in subclasses to populate popup content.
	 *
	 * @param _popup - The popup container
	 */
	refreshContent(_popup: IWindowContainer): void
	{
		// Override in subclasses
	}

	dispose(): void
	{
		this._navigator = null;
		this.resetDisplayTimer();
		this.resetHideTimer();
	}

	private refreshPopupArrows(container: IWindowContainer, showLeft: boolean): void
	{
		this.refreshPopupArrow(container, true, showLeft);
		this.refreshPopupArrow(container, false, !showLeft);
	}

	private refreshPopupArrow(container: IWindowContainer, isLeft: boolean, show: boolean): void
	{
		const name = 'popup_arrow_' + (isLeft ? 'left' : 'right');
		let arrow = container.findChildByName(name);

		if (!show)
		{
			if (arrow)
			{
				arrow.visible = false;
			}

			return;
		}

		if (!arrow && this._navigator)
		{
			const buttonWindow = this._navigator.getButton(name, name, () =>
			{
			});

			if (buttonWindow)
			{
				(buttonWindow as IWindow).setParamFlag(16, false);
				container.addChild(buttonWindow as IWindow);
				arrow = buttonWindow as IWindow;
			}
		}

		if (arrow)
		{
			arrow.visible = true;
			arrow.y = container.height * 0.5 - arrow.height * 0.5;
			arrow.x = isLeft ? 1 - arrow.width : container.width - 1;
		}
	}

	private onDisplayTimer(): void
	{
		if (this._popup)
		{
			this._popup.visible = true;
			this._popup.activate();
		}
	}

	private onHideTimer(): void
	{
		if (this._popup)
		{
			this._popup.visible = false;
		}
	}

	private onPopup = (event: WindowEvent, _window: IWindow): void =>
	{
		if (event.type === 'WME_OVER')
		{
			this.resetHideTimer();
		}
		else if (event.type === 'WME_OUT')
		{
			if (this._popup && !Util.containsMouse(this._popup))
			{
				this.closePopup();
			}
		}
	};

	private resetDisplayTimer(): void
	{
		if (this._displayTimer !== null)
		{
			clearTimeout(this._displayTimer);
			this._displayTimer = null;
		}
	}

	private resetHideTimer(): void
	{
		if (this._hideTimer !== null)
		{
			clearTimeout(this._hideTimer);
			this._hideTimer = null;
		}
	}
}
