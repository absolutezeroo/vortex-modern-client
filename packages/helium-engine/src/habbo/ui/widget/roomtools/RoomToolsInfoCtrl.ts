/**
 * RoomToolsInfoCtrl
 *
 * @see sources/win63_version/habbo/ui/widget/roomtools/RoomToolsInfoCtrl.as
 *
 * Room name/owner/tags popup that slides out next to the room-tools
 * toolbar. Lazily built on the first showRoomInfo() call, matching AS3.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {Motion} from '@core/window/motion/Motion';
import {EaseOut} from '@core/window/motion/EaseOut';
import {MoveTo} from '@core/window/motion/MoveTo';
import {Queue} from '@core/window/motion/Queue';
import {Callback} from '@core/window/motion/Callback';
import {Motions} from '@core/window/motion/Motions';
import {RoomToolsCtrlBase} from './RoomToolsCtrlBase';
import type {RoomToolsWidget} from './RoomToolsWidget';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';

const MARGIN = 12;
const TAG_COLOR = 1800619;
const TAG_COLOR_HOVER = 4696294;

export class RoomToolsInfoCtrl extends RoomToolsCtrlBase
{
	private _tags: string[] = [];
	private _motion: Motion | null = null;

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsInfoCtrl.as::RoomToolsInfoCtrl()
	constructor(widget: RoomToolsWidget, windowManager: IHabboWindowManager, assets: IAssetLibrary | null)
	{
		super(widget, windowManager, assets);
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsInfoCtrl.as::showRoomInfo()
	public showRoomInfo(_isOwner: boolean, roomName: string, ownerLine: string, tags: string[] | null): void
	{
		if(!this._window)
		{
			this._window = this._windowManager.buildWidgetLayout('room_tools_info') as IWindowContainer | null;

			if(this._window)
			{
				this._window.procedure = this.onWindowEvent;
				this._window.addEventListener(WindowMouseEvent.OVER, this.onWindowEvent);
				this._window.addEventListener(WindowMouseEvent.OUT, this.onWindowEvent);
			}
		}

		if(!this._window) return;

		this.updatePosition();

		const nameLabel = this._window.findChildByName('room_name');
		const ownerLabel = this._window.findChildByName('room_owner');

		if(nameLabel) nameLabel.caption = roomName;
		if(ownerLabel) ownerLabel.caption = ownerLine;

		if(tags === null) return;

		this._tags = tags;

		const tag1Border = this._window.findChildByName('tag1_border');
		const tag2Border = this._window.findChildByName('tag2_border');

		if(tag1Border) tag1Border.visible = tags.length >= 1;
		if(tag2Border) tag2Border.visible = tags.length >= 2;

		if(tags.length >= 1)
		{
			const tag1 = this._window.findChildByName('tag1');

			if(tag1) tag1.caption = `#${this.trimTag(tags[0])}`;
		}

		if(tags.length >= 2)
		{
			const tag2 = this._window.findChildByName('tag2');

			if(tag2) tag2.caption = `#${this.trimTag(tags[1])}`;
		}

		this.setCollapsed(false);
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsInfoCtrl.as::updatePosition()
	public updatePosition(): void
	{
		if(!this._window) return;

		const x = (this._collapsed ? -this._window.width : 0) + (this._widget?.getRoomToolbarRight() ?? 0) + MARGIN;
		let y = (this._window.desktop?.height ?? 0) - RoomToolsCtrlBase.DISTANCE_FROM_BOTTOM - this._window.height;

		const chatInputY = this._widget?.getChatInputY() ?? 0;

		if(chatInputY < y + this._window.height)
		{
			y = chatInputY - this._window.height - MARGIN;
		}

		this._window.position = {x, y};
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsInfoCtrl.as::hide()
	public hide(): void
	{
		this.cancelCurrentMotion();
		this._collapsed = true;
		this.updatePosition();

		if(this._window && this._window.visible)
		{
			this._window.visible = false;
		}
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsInfoCtrl.as::setCollapsed()
	public override setCollapsed(value: boolean): void
	{
		if(this._collapsed === value) return;

		this._collapsed = value;

		if(!this._collapsed)
		{
			this.collapseAfterDelay();
		}

		if(!this._window) return;

		this._window.visible = true;

		const x = (this._collapsed ? -this._window.width : 0) + (this._widget?.getRoomToolbarRight() ?? 0) + MARGIN;

		this.cancelCurrentMotion();
		this._motion = new Queue(new EaseOut(new MoveTo(this._window, 100, x, this._window.y), 1), new Callback(this.motionComplete));
		Motions.runMotion(this._motion);
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsInfoCtrl.as::setToolbarCollapsed()
	public setToolbarCollapsed(value: boolean): void
	{
		if(!this._window) return;

		this.setCollapsed(value);
		this.cancelCurrentMotion();

		this._motion = new EaseOut(new MoveTo(this._window, 100, (this._widget?.getRoomToolbarRight() ?? 0) + MARGIN, this._window.y), 1);
		Motions.runMotion(this._motion);
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsInfoCtrl.as::cancelCurrentMotion()
	private cancelCurrentMotion(): void
	{
		if(this._motion !== null)
		{
			Motions.removeMotion(this._motion);
			this._motion = null;
		}
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsInfoCtrl.as::motionComplete()
	private motionComplete = (): void =>
	{
		this._motion = null;

		if(this._collapsed && this._window)
		{
			this._window.visible = false;
		}
	};

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsInfoCtrl.as::trimTag()
	private trimTag(tag: string): string
	{
		if(tag.length > 16)
		{
			return `${tag.substring(0, 16)}...`;
		}

		return tag;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsInfoCtrl.as::onWindowEvent()
	private onWindowEvent = (event: WindowEvent, target: IWindow): void =>
	{
		if(event.type === 'WE_PARENT_RESIZED')
		{
			this.updatePosition();

			return;
		}

		switch(event.type)
		{
			case WindowMouseEvent.CLICK:
				this.setCollapsed(true);
				break;
			case WindowMouseEvent.OVER:
				this.cancelWindowCollapse();
				break;
			case WindowMouseEvent.OUT:
				this.collapseIfPending();
				break;
		}

		if(!(event instanceof WindowMouseEvent)) return;

		let tagLabel: ITextWindow | null = null;
		let tagValue = '';

		if(target.name === 'tag1_region')
		{
			tagLabel = this._window?.findChildByName('tag1') as ITextWindow | null;
			tagValue = this._tags[0] ?? '';
		}

		if(target.name === 'tag2_region')
		{
			tagLabel = this._window?.findChildByName('tag2') as ITextWindow | null;
			tagValue = this._tags[1] ?? '';
		}

		if(!tagLabel) return;

		switch(event.type)
		{
			case WindowMouseEvent.OVER:
				tagLabel.textColor = TAG_COLOR_HOVER;
				break;
			case WindowMouseEvent.OUT:
				tagLabel.textColor = TAG_COLOR;
				break;
			case WindowMouseEvent.CLICK:
				this.handler?.navigator?.performTagSearch(tagValue);
				break;
		}
	};

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsInfoCtrl.as::get right()
	public get right(): number
	{
		return this._window ? this._window.width + this._window.x : 0;
	}
}
