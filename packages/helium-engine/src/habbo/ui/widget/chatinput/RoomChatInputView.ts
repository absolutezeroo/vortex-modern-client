/**
 * RoomChatInputView
 *
 * @see sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputView.as
 *
 * TODO(AS3): scope-reduced for the first pass — custom chat styles
 * (ChatStyleSelector/chatStyleLibrary), the NUX first-time chat reminder
 * animation, the "chat dimmer" room-enter-effect overlay, and the help-button
 * hover tooltip are not ported. The core input box (create/position/focus/
 * type/send, whisper+shout mode parsing, typing indicator, flood control) is.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IFocusWindow} from '@core/window/components/IFocusWindow';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import {RoomWidgetChatTypingMessage} from '@habbo/ui/widget/messages/RoomWidgetChatTypingMessage';
import type {RoomChatInputWidget} from './RoomChatInputWidget';

const MARGIN_H = 12;

export class RoomChatInputView
{
	private _widget: RoomChatInputWidget | null;
	private _window: IWindowContainer | null = null;
	private _input: (ITextFieldWindow & IFocusWindow) | null = null;
	private _inputBorder: IWindow | null = null;
	private _blockText: IWindow | null = null;
	private _helpHoverRegion: IRegionWindow | null = null;
	private _bubbleCont: IWindowContainer | null = null;
	private _whisperModeId: string;
	private _shoutModeId: string;
	private _speakModeId: string;
	private _placeholderActive: boolean = false;
	private _lastText: string = '';
	private _isTyping: boolean = false;
	private _typingTimer: ReturnType<typeof setTimeout> | null = null;
	private _idleTimer: ReturnType<typeof setTimeout> | null = null;

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputView.as::RoomChatInputView()
	constructor(widget: RoomChatInputWidget)
	{
		this._widget = widget;
		this._whisperModeId = widget.localizations?.getLocalization('widgets.chatinput.mode.whisper', ':tell') ?? ':tell';
		this._shoutModeId = widget.localizations?.getLocalization('widgets.chatinput.mode.shout', ':shout') ?? ':shout';
		this._speakModeId = widget.localizations?.getLocalization('widgets.chatinput.mode.speak', ':speak') ?? ':speak';

		this.createWindow();
	}

	public get window(): IWindowContainer | null
	{
		return this._window;
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputView.as::dispose()
	public dispose(): void
	{
		this.clearTimers();

		if(this._input)
		{
			this._input.removeEventListener(WindowMouseEvent.DOWN, this.onInputMouseDown);
			this._input.removeEventListener(WindowKeyboardEvent.KEY_DOWN, this.onKeyDown);
			this._input.removeEventListener(WindowEvent.WE_CHANGE, this.onInputChanged);
			this._input = null;
		}

		if(this._window?.desktop)
		{
			(this._window.desktop as IWindowContainer).removeChild(this._window);
		}

		this._widget = null;
	}

	private clearTimers(): void
	{
		if(this._typingTimer !== null) { clearTimeout(this._typingTimer); this._typingTimer = null; }
		if(this._idleTimer !== null) { clearTimeout(this._idleTimer); this._idleTimer = null; }
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputView.as::createWindow()
	private createWindow(): void
	{
		if(!this._widget) return;

		this._window = this._widget.windowManager.buildWidgetLayout('chatinput_window_new') as IWindowContainer | null;

		if(!this._window) return;

		const desktop = this._window.desktop;

		if(desktop)
		{
			this._window.width = desktop.width;
			this._window.height = desktop.height;
		}

		this._bubbleCont = this._window.findChildByName('bubblecont') as IWindowContainer | null;

		if(this._bubbleCont)
		{
			this._bubbleCont.tags.push('room_widget_chatinput');
		}

		this._input = this._bubbleCont?.findChildByName('chat_input') as (ITextFieldWindow & IFocusWindow) | null;
		this._inputBorder = this._bubbleCont?.findChildByName('input_border') ?? null;
		this._blockText = this._bubbleCont?.findChildByName('block_text') ?? null;
		this._helpHoverRegion = this._bubbleCont?.findChildByName('helpbutton_show_hover_region') as IRegionWindow | null;

		this.updatePosition();

		if(this._input)
		{
			this._input.addEventListener(WindowMouseEvent.DOWN, this.onInputMouseDown);
			this._input.addEventListener(WindowKeyboardEvent.KEY_DOWN, this.onKeyDown);
			this._input.addEventListener(WindowEvent.WE_CHANGE, this.onInputChanged);
			this._input.toolTipDelay = 0;
			this._input.toolTipIsDynamic = true;
			this._placeholderActive = true;
		}

		this._window.addEventListener(WindowEvent.WE_PARENT_RESIZED, this.onParentResized);
	}

	private onParentResized = (): void => this.updatePosition();

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputView.as::updatePosition()
	public updatePosition(): void
	{
		if(!this._window || !this._bubbleCont || !this._widget) return;

		const desktop = this._window.desktop;

		if(!desktop) return;

		this._window.width = desktop.width;
		this._window.height = desktop.height;

		const toolbarWidth = this._widget.getToolBarWidth();
		const friendBarWidth = this._widget.getFriendBarWidth();
		const requiredWidth = this._bubbleCont.width + MARGIN_H;

		let centeredX = desktop.width / 2 - this._bubbleCont.width / 2;
		let leftBound: number;

		if(desktop.width - toolbarWidth - friendBarWidth > requiredWidth)
		{
			leftBound = toolbarWidth + MARGIN_H;
			this._bubbleCont.y = desktop.height - 104;

			if(centeredX + this._bubbleCont.width > desktop.width - friendBarWidth)
			{
				centeredX = 0;
			}
		}
		else
		{
			leftBound = this._widget.getRoomToolsWidth() + MARGIN_H;
			this._bubbleCont.y = desktop.height - 160;
		}

		this._bubbleCont.x = Math.max(centeredX, leftBound);
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputView.as::hideFloodBlocking()
	public hideFloodBlocking(): void
	{
		if(this._input) this._input.visible = true;
		if(this._blockText) this._blockText.visible = false;
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputView.as::showFloodBlocking()
	public showFloodBlocking(): void
	{
		if(this._input) this._input.visible = false;
		if(this._blockText) this._blockText.visible = true;
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputView.as::updateBlockText()
	public updateBlockText(seconds: number): void
	{
		if(!this._blockText || !this._widget) return;

		this._blockText.caption = this._widget.localizations?.registerParameter('chat.input.alert.flood', 'time', String(seconds)) ?? '';
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputView.as::displaySpecialChatMessage()
	public displaySpecialChatMessage(prefix: string, name: string = ''): void
	{
		if(!this._input) return;

		this._input.enable();
		this._input.selectable = true;
		this._input.text = '';
		this.setInputFieldFocus();
		this._input.text += `${prefix} `;

		if(name.length > 0)
		{
			this._input.text += `${name} `;
		}

		this._input.setSelection(this._input.text.length, this._input.text.length);
		this._lastText = this._input.text;
	}

	private onInputMouseDown = (): void =>
	{
		this.setInputFieldFocus();
	};

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputView.as::windowKeyEventProcessor()
	private onKeyDown = (event: WindowKeyboardEvent): void =>
	{
		if(!this._input || !this._widget || this._widget.floodBlocked) return;

		this.setInputFieldFocus();

		if(event.charCode === 32)
		{
			this.checkSpecialKeywordForInput();
		}

		if(event.charCode === 13)
		{
			this.sendChatFromInputField(event.shiftKey);
		}

		if(event.charCode === 8)
		{
			const parts = this._input.text.split(' ');

			if(parts[0] === this._whisperModeId && parts.length === 3 && parts[2] === '')
			{
				this._input.text = '';
				this._lastText = '';
			}
		}
	};

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputView.as::onInputChanged()
	private onInputChanged = (): void =>
	{
		if(!this._input || !this._widget) return;

		if(this._idleTimer !== null) { clearTimeout(this._idleTimer); this._idleTimer = null; }

		if(this._input.text.length === 0)
		{
			this._isTyping = false;

			if(this._typingTimer !== null) { clearTimeout(this._typingTimer); this._typingTimer = null; }

			this._typingTimer = setTimeout(() => this.onTypingTimerComplete(), 1000);
		}
		else
		{
			if(this._input.text.length > this._lastText.length + 1)
			{
				if(this._widget.allowPaste)
				{
					this._widget.setLastPasteTime();
				}
				else
				{
					this._input.text = '';
				}
			}

			this._lastText = this._input.text;

			if(!this._isTyping)
			{
				this._isTyping = true;

				if(this._typingTimer !== null) clearTimeout(this._typingTimer);

				this._typingTimer = setTimeout(() => this.onTypingTimerComplete(), 1000);
			}

			if(this._idleTimer !== null) clearTimeout(this._idleTimer);

			this._idleTimer = setTimeout(() => this.onIdleTimerComplete(), 10000);
		}
	};

	private checkSpecialKeywordForInput(): void
	{
		if(!this._input || !this._widget || this._input.text === '') return;

		const text = this._input.text;
		const selectedUserName = this._widget.selectedUserName;

		if(text === this._whisperModeId && selectedUserName.length > 0)
		{
			this._input.text += ` ${selectedUserName}`;
			this._input.setSelection(this._input.text.length, this._input.text.length);
			this._lastText = this._input.text;
		}
	}

	private onIdleTimerComplete(): void
	{
		this._isTyping = false;
		this.sendTypingMessage();
	}

	private onTypingTimerComplete(): void
	{
		this.sendTypingMessage();
	}

	private sendTypingMessage(): void
	{
		if(!this._widget || this._widget.floodBlocked) return;

		this._widget.messageListener?.processWidgetMessage(new RoomWidgetChatTypingMessage(this._isTyping));
	}

	private setInputFieldFocus(): void
	{
		if(!this._input) return;

		if(this._placeholderActive)
		{
			this._input.text = '';
			this._input.textColor = 0;
			this._placeholderActive = false;
			this._lastText = '';
		}

		this._input.focus();
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputView.as::setInputFieldColor()
	public setInputFieldColor(color: number): void
	{
		if(this._input) this._input.textColor = color;
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputView.as::sendChatFromInputField()
	private sendChatFromInputField(shiftKey: boolean = false): void
	{
		if(!this._input || !this._widget || this._input.text === '') return;

		let chatType = shiftKey ? 2 : 0;
		let text = this._input.text;
		const parts = text.split(' ');
		let recipientName = '';
		let restoreText = '';

		if(parts[0] === this._whisperModeId)
		{
			chatType = 1;
			recipientName = parts[1] ?? '';
			restoreText = `${this._whisperModeId} ${recipientName} `;
			parts.shift();
			parts.shift();
		}
		else if(parts[0] === this._shoutModeId)
		{
			chatType = 2;
			parts.shift();
		}
		else if(parts[0] === this._speakModeId)
		{
			chatType = 0;
			parts.shift();
		}

		text = parts.join(' ');

		if(this._typingTimer !== null) { clearTimeout(this._typingTimer); this._typingTimer = null; }
		if(this._idleTimer !== null) { clearTimeout(this._idleTimer); this._idleTimer = null; }

		this._widget.sendChat(text, chatType, recipientName, 0);
		this._isTyping = false;

		this._input.text = restoreText;
		this._lastText = restoreText;
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputView.as::getChatInputY()
	public getChatInputY(): number
	{
		const container = this._window?.findChildByName('chat_input_container');

		if(!container) return 0;

		const pos = {x: 0, y: 0};

		container.getGlobalPosition(pos);

		return pos.y;
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputView.as::getChatWindowElements()
	public getChatWindowElements(): IWindow[]
	{
		const elements: Array<IWindow | null> = [this._bubbleCont, this._input];

		return elements.filter((w): w is IWindow => w !== null);
	}
}
