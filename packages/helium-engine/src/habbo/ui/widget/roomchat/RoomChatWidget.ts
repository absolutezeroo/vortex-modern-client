/**
 * RoomChatWidget
 *
 * @see sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as
 * @see sources/win63_2023_version/com/sulake/habbo/ui/widget/roomchat/RoomChatWidget.as (cross-checked for corruption)
 *
 * Container for chat bubbles: creates/positions RoomChatItems, animates them
 * upward as new messages arrive ("screen levels"), tracks the room camera to
 * reposition bubbles as it pans/zooms.
 *
 * TODO(AS3): the history viewer/pulldown (RoomChatHistoryViewer/
 * RoomChatHistoryPulldown, ~750 AS3 lines — drag-down-to-scroll-back UI) is
 * not ported. `_historyViewer` is always null here, matching AS3's own
 * null-guards (`_historyViewer?.active`, `if(_historyViewer != null)`) so the
 * core stacking/animation logic still runs correctly without it — you just
 * can't drag the chat area down to see older history yet.
 */
import type {EventEmitter} from 'eventemitter3';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IUpdateReceiver} from '@core/runtime/IContext';
import type {IRoomDesktop} from '@habbo/ui/IRoomDesktop';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import {RoomWidgetChatUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetChatUpdateEvent';
import {RoomWidgetRoomViewUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetRoomViewUpdateEvent';
import {RoomWidgetChatSelectAvatarMessage} from '@habbo/ui/widget/messages/RoomWidgetChatSelectAvatarMessage';
import {RoomWidgetRoomObjectMessage} from '@habbo/ui/widget/messages/RoomWidgetRoomObjectMessage';
import {RoomEnterEffect} from '@room/utils/RoomEnterEffect';
import type {ChatWidgetHandler} from '@habbo/ui/handler/ChatWidgetHandler';
import {ChatBubbleFactory} from './style/ChatBubbleFactory';
import {RoomChatItem} from './RoomChatItem';

/**
 * Minimal shape RoomChatWidget needs from its "context" constructor param —
 * AS3 passes RoomUI itself here (it duck-types via Component's pass-through
 * registerUpdateReceiver()/removeUpdateReceiver()), not a literal IContext.
 */
type UpdateReceiverContext = {
	registerUpdateReceiver(receiver: IUpdateReceiver, priority: number): void;
	removeUpdateReceiver(receiver: IUpdateReceiver): void;
};

const CHAT_AREA_MARGIN_BOTTOM = 23;
const ANIMATION_STEP_INTERVAL_MS = 25;
const ANIMATION_STEP_PIXELS = 3;
const ANIMATION_TIMEOUT_MS = 4000;
const ANIMATION_TIMEOUT_SLOW_MS = 6000;

let sharedChatBubbleFactory: ChatBubbleFactory | null = null;

export class RoomChatWidget extends RoomWidgetBase implements IUpdateReceiver
{
	private _timeoutTime: number = 0;
	private _stepAccumulated: number = 0;
	private _container: IWindow;
	private _contentList: IItemListWindow;
	private _activeContent: IWindow;
	private _itemList: RoomChatItem[] = [];
	private _buffer: RoomChatItem[] = [];
	private _movingItems: RoomChatItem[] = [];
	private _widgetId: number;
	private _itemCounter: number = 0;
	private _cameraScaleRatio: number = 1;
	private _siteUrl: string;
	private _historyMaxCount: number;
	private _cameraOffset: {x: number; y: number} = {x: 0, y: 0};
	private _animating: boolean = false;
	private _config: IHabboConfigurationManager;
	private _historyItemHeight: number = 150;
	private _chatAreaHeight: number;
	private _pendingSpacing: number = 19;
	private _referenceScale: number = 0;
	private _areaMarginLeft: number = 100;
	private _areaMarginRight: number = 205;
	private _baseAreaHeight: number;
	private _maxFastLevels: number;
	private _context: UpdateReceiverContext | null;

	// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as::RoomChatWidget()
	constructor(
		handler: IRoomWidgetHandler, windowManager: IHabboWindowManager, assets: IAssetLibrary | null,
		localizations: IHabboLocalizationManager | null, config: IHabboConfigurationManager, widgetId: number,
		context: UpdateReceiverContext | null
	)
	{
		super(handler, windowManager, assets, localizations);

		(handler as ChatWidgetHandler).widget = this;
		this._config = config;
		this._widgetId = widgetId;

		const desktopWindow = windowManager.getDesktop(1);
		const desktopHeight = desktopWindow?.height ?? 0;

		if(desktopHeight >= 1000)
		{
			this._baseAreaHeight = 247;
			this._maxFastLevels = 12;
		}
		else if(desktopHeight >= 750)
		{
			this._baseAreaHeight = 209;
			this._maxFastLevels = 10;
		}
		else
		{
			this._baseAreaHeight = 171;
			this._maxFastLevels = 12;
		}

		this._chatAreaHeight = this._baseAreaHeight + CHAT_AREA_MARGIN_BOTTOM;

		this._container = windowManager.createWindow('chat_container', '', 4, 0, 0, {x: 0, y: 0, width: 200, height: this._chatAreaHeight + 39}, null, 0);
		this._container.background = true;
		this._container.color = 33554431;
		this._container.tags.push('room_widget_chat');

		this._contentList = windowManager.createWindow('chat_contentlist', '', 50, 0, 0x10 | 0x0880, {x: 0, y: 0, width: 200, height: this._chatAreaHeight}, null, 0) as unknown as IItemListWindow;
		this._contentList.disableAutodrag = true;
		(this._container as unknown as IWindowContainer).addChild(this._contentList as unknown as IWindow);

		this._activeContent = windowManager.createWindow('chat_active_content', '', 4, 0, 16, {x: 0, y: 0, width: 200, height: this._chatAreaHeight}, null, 0);
		this._activeContent.clipping = false;
		this._contentList.addListItem(this._activeContent);

		this._siteUrl = config.getProperty('site.url') ?? '';
		this._historyMaxCount = config.getInteger('chat.history.item.max.count', 150);

		this._context = context;

		if(context)
		{
			context.registerUpdateReceiver(this, 1);
		}

		if(!sharedChatBubbleFactory && assets)
		{
			sharedChatBubbleFactory = new ChatBubbleFactory(assets, windowManager);
		}
	}

	public static get chatBubbleFactory(): ChatBubbleFactory | null
	{
		return sharedChatBubbleFactory;
	}

	public get chatBubbleFactory(): ChatBubbleFactory | null
	{
		return sharedChatBubbleFactory;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as::get mainWindow()
	public override get mainWindow(): IWindow | null
	{
		return this._container;
	}

	public get config(): IHabboConfigurationManager
	{
		return this._config;
	}

	public get handler(): ChatWidgetHandler
	{
		return this._handler as ChatWidgetHandler;
	}

	private clearChatItems(): void
	{
		this._movingItems = [];

		while(this._itemList.length > 0)
		{
			this._itemList.shift()?.dispose();
		}

		while(this._buffer.length > 0)
		{
			this._buffer.shift()?.dispose();
		}
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as::reuse()
	public override reuse(desktop: IRoomDesktop): void
	{
		super.reuse(desktop);
		this._container.background = true;
		this._container.color = 33554431;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as::release()
	public override release(): void
	{
		this.clearChatItems();
		super.release();
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as::dispose()
	public override dispose(): void
	{
		if(this.disposed) return;

		this.clearChatItems();
		this._container.dispose();

		if(this._context)
		{
			this._context.removeUpdateReceiver(this);
			this._context = null;
		}

		super.dispose();
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as::update()
	public update(deltaTime: number): void
	{
		const now = performance.now();

		if(now > this._timeoutTime && this._timeoutTime > 0)
		{
			this._timeoutTime = -1;
			this.animationStart();
		}

		if(this._animating)
		{
			let step = Math.floor(deltaTime / ANIMATION_STEP_INTERVAL_MS * ANIMATION_STEP_PIXELS);

			if(step + this._stepAccumulated > this._pendingSpacing)
			{
				step = this._pendingSpacing - this._stepAccumulated;
			}

			if(step > 0)
			{
				this.moveItemsUp(step);
				this._stepAccumulated += step;
			}

			if(this._stepAccumulated >= this._pendingSpacing)
			{
				this._pendingSpacing = 19;
				this._stepAccumulated = 0;
				this.animationStop();
				this.processBuffer();
				this._timeoutTime = now + ANIMATION_TIMEOUT_MS;
			}
		}
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as::registerUpdateEvents()
	public override registerUpdateEvents(dispatcher: EventEmitter): void
	{
		if(!dispatcher) return;

		dispatcher.on(RoomWidgetChatUpdateEvent.WIDGET_UPDATE_EVENT_CHAT, this.onChatMessage);
		dispatcher.on(RoomWidgetRoomViewUpdateEvent.ROOM_VIEW_SIZE_CHANGED, this.onRoomViewUpdate);
		dispatcher.on(RoomWidgetRoomViewUpdateEvent.ROOM_VIEW_POSITION_CHANGED, this.onRoomViewUpdate);
		dispatcher.on(RoomWidgetRoomViewUpdateEvent.ROOM_VIEW_SCALE_CHANGED, this.onRoomViewUpdate);
		super.registerUpdateEvents(dispatcher);
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as::unregisterUpdateEvents()
	public override unregisterUpdateEvents(dispatcher: EventEmitter): void
	{
		if(!dispatcher) return;

		dispatcher.off(RoomWidgetChatUpdateEvent.WIDGET_UPDATE_EVENT_CHAT, this.onChatMessage);
		dispatcher.off(RoomWidgetRoomViewUpdateEvent.ROOM_VIEW_SIZE_CHANGED, this.onRoomViewUpdate);
		dispatcher.off(RoomWidgetRoomViewUpdateEvent.ROOM_VIEW_POSITION_CHANGED, this.onRoomViewUpdate);
		dispatcher.off(RoomWidgetRoomViewUpdateEvent.ROOM_VIEW_SCALE_CHANGED, this.onRoomViewUpdate);
	}

	private onChatMessage = (event: RoomWidgetChatUpdateEvent): void =>
	{
		if(RoomEnterEffect.isRunning() && event.chatType !== 1) return;

		const item = new RoomChatItem(this, this.windowManager, this._assets, this.getFreeItemId(), this.localizations, this._siteUrl);

		item.define(event);
		this.addChatItem(item);
	};

	// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as::addChatMessage()
	public addChatMessage(message: string, senderName: string, senderX: number, senderImage: ImageBitmap | null, senderColor: number, notify: boolean): void
	{
		const item = new RoomChatItem(this, this.windowManager, this._assets, this.getFreeItemId(), this.localizations, this._siteUrl);

		item.message = message;
		item.senderName = senderName;
		item.senderX = senderX;
		item.senderImage = senderImage;
		item.senderColor = senderColor;

		if(notify) item.chatType = 5;

		item.renderView();
		this.addChatItem(item);
	}

	private addChatItem(item: RoomChatItem): void
	{
		if(this._cameraScaleRatio !== 1) item.senderX /= this._cameraScaleRatio;

		item.senderX -= this._cameraOffset.x;
		this.setChatItemLocHorizontal(item);
		this._buffer.push(item);
		this.processBuffer();
	}

	private onRoomViewUpdate = (event: RoomWidgetRoomViewUpdateEvent): void =>
	{
		if(event.scale > 0)
		{
			if(this._referenceScale === 0)
			{
				this._referenceScale = event.scale;
			}
			else
			{
				this._cameraScaleRatio = event.scale / this._referenceScale;
			}
		}

		if(event.positionDelta)
		{
			this._cameraOffset.x += event.positionDelta.x / this._cameraScaleRatio;
			this._cameraOffset.y += event.positionDelta.y / this._cameraScaleRatio;
		}

		if(event.rect)
		{
			this._container.width = event.rect.width;
			this._container.height = this._chatAreaHeight;
			this._contentList.width = this._container.width;
			this._contentList.height = this._chatAreaHeight;
			this._contentList.x = this._container.x;
			this._contentList.y = this._container.y;
			this._activeContent.width = this._container.width;
			this._activeContent.height = this._chatAreaHeight;

			if(this.historyViewerActive())
			{
				this.reAlignItemsToHistoryContent();
			}
		}

		this.alignItems();
	};

	private processBuffer(): void
	{
		if(this._animating) return;
		if(this._buffer.length === 0) return;

		while(this._buffer.length > 1 || (this.historyViewerActive() && this._buffer.length > 0))
		{
			this.activateItemFromBuffer();
		}

		let canAdd: boolean;

		if(this._itemList.length === 0)
		{
			canAdd = true;
		}
		else
		{
			canAdd = this.checkLastItemAllowsAdding(this._buffer[0]);
		}

		if(canAdd)
		{
			this.activateItemFromBuffer();
			this._timeoutTime = performance.now() + ANIMATION_TIMEOUT_MS;
		}
		else
		{
			if(this._itemList.length > 0 && this._buffer.length > 0)
			{
				this._pendingSpacing = this.getItemSpacing(this._itemList[this._itemList.length - 1], this._buffer[0]);
			}
			else
			{
				this._pendingSpacing = 19;
			}

			this.animationStart();
		}
	}

	private activateItemFromBuffer(): void
	{
		if(this._buffer.length === 0) return;

		if(this.historyViewerMinimized())
		{
			this.resetArea();
			this.hideHistoryViewer();
		}

		if(!this.checkLastItemAllowsAdding(this._buffer[0]))
		{
			this.selectItemsToMove();
			this.moveItemsUp(this.getItemSpacing(this._itemList[this._itemList.length - 1], this._buffer[0]));

			if(!this.checkLastItemAllowsAdding(this._buffer[0]))
			{
				this._activeContent.height += 19;
			}
		}

		const item = this._buffer.shift();

		if(!item) return;

		item.renderView();

		const view = item.view;

		if(view)
		{
			(this._activeContent as unknown as IWindowContainer).addChild(view as unknown as IWindow);
			item.timeStamp = Date.now();
			this._itemList.push(item);

			let lastLevel = 0;

			if(this._itemList.length > 1)
			{
				lastLevel = this._itemList[this._itemList.length - 2].screenLevel;

				if(this.historyViewerActive())
				{
					item.screenLevel = lastLevel + 1;
				}
				else
				{
					item.screenLevel = lastLevel + Math.max(this._pendingLevels, 1);
				}
			}
			else
			{
				item.screenLevel = 100;
			}

			item.aboveLevels = this._pendingLevels;

			if(item.aboveLevels > this._maxFastLevels + 2)
			{
				item.aboveLevels = this._maxFastLevels + 2;
			}

			this._pendingLevels = 0;
			this.setChatItemLocHorizontal(item);
			this.setChatItemLocVertical(item);
			this.setChatItemRenderable(item);
		}
	}

	private _pendingLevels: number = 1;

	private checkLastItemAllowsAdding(candidate: RoomChatItem): boolean
	{
		if(this._itemList.length === 0) return true;

		const last = this._itemList[this._itemList.length - 1];

		if(!candidate || !last) return false;
		if(!last.view) return true;

		if(this._activeContent.bottom - (this._activeContent.y + last.y + last.height) - CHAT_AREA_MARGIN_BOTTOM <= this.getItemSpacing(last, candidate))
		{
			return false;
		}

		return true;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as::alignItems()
	public alignItems(): void
	{
		for(let i = this._itemList.length - 1; i >= 0; i--)
		{
			const item = this._itemList[i];

			if(item)
			{
				this.setChatItemLocHorizontal(item);
				this.setChatItemLocVertical(item);
			}
		}

		for(let i = 0; i < this._itemList.length; i++)
		{
			const item = this._itemList[i];

			if(item) this.setChatItemRenderable(item);
		}

		for(let i = 0; i < this._buffer.length; i++)
		{
			const item = this._buffer[i];

			if(item) this.setChatItemLocHorizontal(item);
		}
	}

	private animationStart(): void
	{
		if(this._animating) return;

		this.selectItemsToMove();
		this._animating = true;
	}

	private animationStop(): void
	{
		this._animating = false;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as::selectItemsToMove()
	// (both decompiled sources are corrupted here — reconstructed from shared structure)
	private selectItemsToMove(): void
	{
		if(this._animating) return;

		this.purgeItems();
		this._movingItems = [];

		const now = Date.now();
		let lastLevel = 0;

		if(this._itemList.length === 0)
		{
			this._pendingLevels = 1;

			return;
		}

		if(this.historyViewerActive()) return;

		this._pendingLevels++;

		for(let i = this._itemList.length - 1; i >= 0; i--)
		{
			const item = this._itemList[i];

			if(item.view != null)
			{
				if(item.screenLevel > 0 || item.screenLevel === lastLevel - 1 || now - item.timeStamp >= ANIMATION_TIMEOUT_SLOW_MS)
				{
					item.timeStamp = now;
					lastLevel = item.screenLevel;
					item.screenLevel--;
					this._movingItems.push(item);
				}
			}
		}
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as::moveItemsUp()
	// (both decompiled sources are corrupted here — reconstructed from shared structure)
	private moveItemsUp(pixels: number): void
	{
		if(!this._movingItems || this._movingItems.length === 0) return;

		let listIndex = -1;

		for(let i = this._movingItems.length - 1; i >= 0; i--)
		{
			const item = this._movingItems[i];

			if(!item) continue;

			if(listIndex === -1)
			{
				listIndex = this._itemList.indexOf(item);
			}
			else
			{
				listIndex++;
			}

			let canMove = true;

			if(this.historyViewerActive())
			{
				if(item.y - pixels + item.height < 0) canMove = false;
			}

			if(listIndex > 0)
			{
				const below = this._itemList[listIndex - 1];

				if(below.view != null)
				{
					if(item.y - pixels - below.y < this.getItemSpacing(below, item)) canMove = false;
				}
			}

			if(canMove) item.y -= pixels;
		}
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as::setChatItemLocHorizontal()
	private setChatItemLocHorizontal(item: RoomChatItem): void
	{
		const screenX = (item.senderX + this._cameraOffset.x) * this._cameraScaleRatio;
		const left = screenX - item.width / 2;
		const right = left + item.width;
		const minX = -this._container.width / 2 - 20 + this._areaMarginLeft;
		const maxX = this._container.width / 2 + 20 - this._areaMarginRight;
		const leftInBounds = left >= minX && left <= maxX;
		const rightInBounds = right >= minX && right <= maxX;

		let x: number;

		if(leftInBounds && rightInBounds)
		{
			x = left;
		}
		else if(screenX >= 0)
		{
			x = maxX - item.width;
		}
		else
		{
			x = minX;
		}

		item.x = x + this._container.width / 2 + this._container.x;

		if(screenX < minX || screenX > maxX)
		{
			item.hidePointer();
		}
		else
		{
			item.setPointerOffset(left - x);
		}
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as::setChatItemLocVertical()
	private setChatItemLocVertical(item: RoomChatItem): void
	{
		const index = this._itemList.indexOf(item);
		const levels = this.historyViewerActive() ? 0 : this._pendingLevels;

		if(index === this._itemList.length - 1)
		{
			item.y = this.getAreaBottom() - (levels + 1) * 19 - CHAT_AREA_MARGIN_BOTTOM;
		}
		else
		{
			const next = this._itemList[index + 1];
			const nextAboveLevels = next.aboveLevels;

			if(nextAboveLevels < 2)
			{
				item.y = next.y - this.getItemSpacing(item, next);
			}
			else
			{
				item.y = next.y - nextAboveLevels * 19;
			}
		}
	}

	private setChatItemRenderable(item: RoomChatItem): void
	{
		if(item.y < -32)
		{
			if(item.view)
			{
				(this._activeContent as unknown as IWindowContainer).removeChild(item.view as unknown as IWindow);
				item.hideView();
			}
		}
		else if(!item.view)
		{
			item.renderView();

			if(item.view) (this._activeContent as unknown as IWindowContainer).addChild(item.view as unknown as IWindow);
		}
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as::getTotalContentHeight()
	public getTotalContentHeight(): number
	{
		let total = 0;

		for(let i = 0; i < this._itemList.length; i++)
		{
			const item = this._itemList[i];

			if(item)
			{
				if(i === 0)
				{
					total += 19;
				}
				else
				{
					total += this.getItemSpacing(this._itemList[i - 1], item);
				}

				total += (item.aboveLevels - 1) * 19;
			}
		}

		return total;
	}

	private getAreaBottom(): number
	{
		if(this.historyViewerActive()) return this._activeContent.height;

		return this._chatAreaHeight + this._container.y;
	}

	private getItemSpacing(a: RoomChatItem, b: RoomChatItem): number
	{
		const bubbleHeight = this.chatBubbleFactory?.getActualBubbleHeight(a.chatStyle) ?? 0;

		if(a.checkOverlap(bubbleHeight, b.x, a.y, b.width, b.height)) return 19;

		return 10;
	}

	private purgeItems(): void
	{
		if(this.historyViewerActive()) return;

		while(this._itemList.length > this._historyMaxCount)
		{
			const item = this._itemList.shift();

			if(!item) continue;

			const movingIndex = this._movingItems.indexOf(item);

			if(movingIndex > -1) this._movingItems.splice(movingIndex, 1);

			if(item.view)
			{
				(this._activeContent as unknown as IWindowContainer).removeChild(item.view as unknown as IWindow);
				item.hideView();
			}

			item.dispose();
		}

		let hasVisible = false;

		for(let i = 0; i < this._itemList.length; i++)
		{
			const item = this._itemList[i];

			if(!item) continue;

			if(item.y > -32)
			{
				hasVisible = true;

				break;
			}

			item.aboveLevels = 1;

			if(item.view)
			{
				const movingIndex = this._movingItems.indexOf(item);

				if(movingIndex > -1) this._movingItems.splice(movingIndex, 1);

				(this._activeContent as unknown as IWindowContainer).removeChild(item.view as unknown as IWindow);
				item.hideView();
			}
		}

		if(this._buffer.length > 0) hasVisible = true;

		if(this.getTotalContentHeight() > 19 && !hasVisible && !this.historyViewerActive())
		{
			// TODO(AS3): history viewer show/stretch not ported — see file header.
		}
	}

	private getFreeItemId(): string
	{
		return `chat_${this._widgetId}_item_${this._itemCounter++}`;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as::onItemMouseClick()
	public onItemMouseClick(userId: number, userName: string, userCategory: number, roomId: number, event: WindowMouseEvent): void
	{
		if(event.shiftKey)
		{
			// TODO(AS3): history viewer toggle not ported — see file header.
			return;
		}

		this.messageListener?.processWidgetMessage(new RoomWidgetRoomObjectMessage('RWROM_GET_OBJECT_INFO', userId, userCategory));
		this.messageListener?.processWidgetMessage(new RoomWidgetChatSelectAvatarMessage('RWCSAM_MESSAGE_SELECT_AVATAR', userId, userName, roomId));
	}

	public onItemMouseDown(_userId: number, _userCategory: number, _roomId: number, _event: WindowMouseEvent): void
	{
		// TODO(AS3): history viewer drag-to-scroll not ported.
	}

	public onItemMouseOver(_userId: number, _userCategory: number, _roomId: number, _event: WindowMouseEvent): void {}

	public onItemMouseOut(_userId: number, _userCategory: number, _roomId: number, _event: WindowMouseEvent): void {}

	public onPulldownMouseDown(_event: WindowMouseEvent): void {}

	public onPulldownCloseButtonClicked(_event: WindowMouseEvent): void {}

	// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as::stretchAreaBottomBy()
	public stretchAreaBottomBy(delta: number): void
	{
		this.stretchAreaBottomTo(this._container.bottom + delta - 39);
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as::stretchAreaBottomTo()
	public stretchAreaBottomTo(bottom: number): void
	{
		const max = (this._container.context.getDesktopWindow()?.height ?? 0) - 39 - 40;

		bottom = Math.min(bottom, max);
		this._chatAreaHeight = bottom - this._container.y;
		this._container.height = this._chatAreaHeight + 39;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as::resetArea()
	// AS3 always constructs a (possibly-disabled) history viewer, so this never
	// actually no-ops there — it's what shrinks the chat area back down after
	// stretchAreaBottomTo()/resizeContainerToLowestItem() grew it. Ported here
	// without the historyViewer-derived width/height terms (pulldownBarHeight,
	// scrollbarWidth), which are 0 since that widget isn't built — see file header.
	public resetArea(realign: boolean = true): void
	{
		this.animationStop();
		this._chatAreaHeight = this._baseAreaHeight + CHAT_AREA_MARGIN_BOTTOM;
		this._container.height = this._chatAreaHeight + 39;
		this._contentList.width = this._container.width;
		this._contentList.height = this._chatAreaHeight;
		this._activeContent.width = this._container.width;
		this._activeContent.height = this._chatAreaHeight;
		this._contentList.scrollV = 1;
		this.purgeItems();

		if(realign) this.alignItems();
	}

	private historyViewerActive(): boolean
	{
		return false;
	}

	private historyViewerVisible(): boolean
	{
		return false;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as::hideHistoryViewer()
	public hideHistoryViewer(): void
	{
		// TODO(AS3): no-op, history viewer not ported.
	}

	private historyViewerMinimized(): boolean
	{
		return this._contentList.height <= 1;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as::resizeContainerToLowestItem()
	public resizeContainerToLowestItem(): void
	{
		let lowest = 0;

		for(const item of this._itemList)
		{
			if(item.y > lowest) lowest = item.y;
		}

		for(const item of this._buffer)
		{
			if(item.y > lowest) lowest = item.y;
		}

		lowest += 32;
		lowest = Math.max(0, lowest);

		const previousBottom = this._container.bottom;

		this.stretchAreaBottomTo(this._container.top + lowest);

		const delta = previousBottom - this._container.bottom;

		if(Math.abs(delta) < 3)
		{
			this.resetArea();

			return;
		}

		for(const item of this._itemList) item.y += delta;
		for(const item of this._buffer) item.y += delta;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as::mouseUp()
	public mouseUp(): void
	{
		this._contentList.stopDragging();

		const bottom = this._container.bottom - 39;

		if(bottom < this._baseAreaHeight && bottom <= this._chatAreaHeight + this._container.y)
		{
			if(this.historyViewerActive()) this.hideHistoryViewer();

			this.resetArea();
		}
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatWidget.as::reAlignItemsToHistoryContent()
	public reAlignItemsToHistoryContent(): void
	{
		// TODO(AS3): no-op, history viewer not ported.
	}

	public enableDragTooltips(): void
	{
		for(const item of this._itemList) item.enableDragTooltip();
		for(const item of this._buffer) item.enableDragTooltip();
	}

	public disableDragTooltips(): void
	{
		for(const item of this._itemList) item.disableDragTooltip();
		for(const item of this._buffer) item.disableDragTooltip();
	}

	public get isGameSession(): boolean
	{
		return this.handler.container?.roomSession?.isGameSession ?? false;
	}
}
