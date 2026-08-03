import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';

import type {HabboToolbar} from '../../HabboToolbar';

const log = Logger.getLogger('habbo.toolbar.extensions.settings.ChatSettingsView');

/**
 * ChatSettingsView
 *
 * Three drop menus — chat mode, bubble width, scroll speed — writing straight through to
 * `HabboFreeFlowChat`. There is no save button: every selection commits immediately, and
 * closing commits once more.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/extensions/settings/ChatSettingsView.as
 */
export class ChatSettingsView
{
    // AS3: .../ChatSettingsView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../ChatSettingsView.as::_toolbar
    private _toolbar: HabboToolbar | null;

    // AS3: .../ChatSettingsView.as::_SafeStr_6095
    private _chatMode: IDropMenuWindow | null = null;

    // AS3: .../ChatSettingsView.as::_SafeStr_5979
    private _chatBubbleWidth: IDropMenuWindow | null = null;

    // AS3: .../ChatSettingsView.as::_SafeStr_6131
    private _chatScrollSpeed: IDropMenuWindow | null = null;

    /** Raised while the menus are being filled, so populating cannot look like a choice. */
    // AS3: .../ChatSettingsView.as::_SafeStr_7863
    private _populating: boolean = false;

    // AS3: .../ChatSettingsView.as::ChatSettingsView()
    constructor(toolbar: HabboToolbar)
    {
        this._toolbar = toolbar;

        this.createWindow();
    }

    // AS3: .../ChatSettingsView.as::get window()
    get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: .../ChatSettingsView.as::createWindow()
    private createWindow(): void
    {
        const asset = this._toolbar?.assets?.getAssetByName('toolbar_chat_settings_xml') as XmlAsset | null;

        if(asset === null || asset === undefined)
        {
            log.warn('Missing layout "toolbar_chat_settings_xml" - chat settings cannot open');

            return;
        }

        this._window = this._toolbar?.windowManager?.buildFromXML(
            asset.content as unknown as string
        ) as IWindowContainer | null;

        if(this._window === null) return;

        this._window.procedure = this.onWindowEvent;

        this._chatMode = this._window.findChildByName('chat_mode') as IDropMenuWindow | null;
        this._chatBubbleWidth = this._window.findChildByName('chat_bubble_width') as IDropMenuWindow | null;
        this._chatScrollSpeed = this._window.findChildByName('chat_scroll_speed') as IDropMenuWindow | null;

        for(const menu of [this._chatMode, this._chatBubbleWidth, this._chatScrollSpeed])
        {
            menu?.addEventListener('WE_SELECTED', this.onDropMenuSelectionChanged);
        }

        this._populating = true;

        this.populateTexts();
        this.populateDropMenus();
        this.updateSelections();

        this._populating = false;
    }

    // AS3: .../ChatSettingsView.as::populateTexts()
    private populateTexts(): void
    {
        this.setCaption('settings_title', 'toolbar.chat.settings.title', 'Chat settings');
        this.setCaption('chat_settings_info', 'toolbar.chat.settings.info', 'Choose how chat appears for you.');
        this.setCaption('chat_mode_label', 'toolbar.chat.settings.mode', 'Chat mode');
        this.setCaption('chat_bubble_width_label', 'toolbar.chat.settings.bubble_width', 'Bubble width');
        this.setCaption('chat_scroll_speed_label', 'toolbar.chat.settings.scroll_speed', 'Scroll speed');
    }

    // TS-only: the four AS3 lines above are identical bar their arguments.
    private setCaption(name: string, key: string, fallback: string): void
    {
        const field = this._window?.findChildByName(name) as unknown as ITextWindow | null;

        if(field !== null && field !== undefined) field.caption = this.localize(key, fallback);
    }

    /** The options reuse the room-settings keys — same three choices, same order. */
    // AS3: .../ChatSettingsView.as::populateDropMenus()
    private populateDropMenus(): void
    {
        this._chatMode?.populate([
            this.localize('navigator.roomsettings.chat.mode.free.flow', 'Free flow'),
            this.localize('navigator.roomsettings.chat.mode.line.by.line', 'Line by line')
        ]);

        this._chatBubbleWidth?.populate([
            this.localize('navigator.roomsettings.chat.bubbles.width.wide', 'Wide'),
            this.localize('navigator.roomsettings.chat.bubbles.width.normal', 'Normal'),
            this.localize('navigator.roomsettings.chat.bubbles.width.thin', 'Thin')
        ]);

        this._chatScrollSpeed?.populate([
            this.localize('navigator.roomsettings.chat.speed.fast', 'Fast'),
            this.localize('navigator.roomsettings.chat.speed.normal', 'Normal'),
            this.localize('navigator.roomsettings.chat.speed.slow', 'Slow')
        ]);
    }

    // AS3: .../ChatSettingsView.as::updateSelections()
    private updateSelections(): void
    {
        const freeFlowChat = this._toolbar?.freeFlowChat ?? null;

        if(freeFlowChat === null) return;

        if(this._chatMode !== null) this._chatMode.selection = freeFlowChat.chatMode;
        if(this._chatBubbleWidth !== null) this._chatBubbleWidth.selection = freeFlowChat.chatBubbleWidth;
        if(this._chatScrollSpeed !== null) this._chatScrollSpeed.selection = freeFlowChat.chatScrollSpeed;
    }

    // AS3: .../ChatSettingsView.as::saveSettings()
    private saveSettings(): void
    {
        const freeFlowChat = this._toolbar?.freeFlowChat ?? null;

        if(freeFlowChat === null || this._chatMode === null || this._chatBubbleWidth === null || this._chatScrollSpeed === null)
        {
            return;
        }

        freeFlowChat.updateChatPreferences(
            ChatSettingsView.clampSelection(this._chatMode.selection, 0),
            ChatSettingsView.clampSelection(this._chatBubbleWidth.selection, 1),
            ChatSettingsView.clampSelection(this._chatScrollSpeed.selection, 1)
        );
    }

    /** An empty menu answers -1; the fallback is that setting's own default. */
    // AS3: .../ChatSettingsView.as::clampSelection()
    private static clampSelection(selection: number, fallback: number): number
    {
        return selection >= 0 ? selection : fallback;
    }

    // AS3: .../ChatSettingsView.as::onDropMenuSelectionChanged()
    private onDropMenuSelectionChanged = (_event: WindowEvent): void =>
    {
        if(this._populating) return;

        this.saveSettings();
    };

    // AS3: .../ChatSettingsView.as::onWindowEvent()
    private onWindowEvent = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        if(window.name === 'back_btn') this.dispose();
    };

    // AS3: .../ChatSettingsView.as::localize()
    private localize(key: string, fallback: string): string
    {
        return this._toolbar?.localization?.getLocalization(key, fallback) ?? fallback;
    }

    /** Closing saves: the drop menus commit on change, but a drag may not have fired. */
    // AS3: .../ChatSettingsView.as::dispose()
    dispose(): void
    {
        if(this._window === null) return;

        this.saveSettings();

        this._window.dispose();
        this._window = null;
        this._chatMode = null;
        this._chatBubbleWidth = null;
        this._chatScrollSpeed = null;
    }
}
