import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {
    BotCommandConfigurationEvent
} from '@habbo/communication/messages/incoming/room/bot/BotCommandConfigurationEvent';
import type {
    BotCommandConfigurationParser
} from '@habbo/communication/messages/parser/room/bot/BotCommandConfigurationParser';
import {
    GetBotCommandConfigurationDataComposer
} from '@habbo/communication/messages/outgoing/room/bot/GetBotCommandConfigurationDataComposer';

import type {AvatarInfoWidget} from '../AvatarInfoWidget';
import type {IBotSkillConfigurationView} from './IBotSkillConfigurationView';

/**
 * BotSkillConfigurationViewBase — the shared half of every bot-skill editor: ask the server for the
 * skill's stored configuration, build the editor window from the subclass's layout, place it under
 * the menu that opened it, and keep it on screen.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/avatarinfo/botskills/BotSkillConfigurationViewBase.as
 */
export class BotSkillConfigurationViewBase implements IBotSkillConfigurationView
{
    // AS3: .../BotSkillConfigurationViewBase.as::_SafeStr_4549
    protected _widget: AvatarInfoWidget | null;
    // AS3: .../BotSkillConfigurationViewBase.as::_window
    protected _window: IWindowContainer | null = null;
    // AS3: .../BotSkillConfigurationViewBase.as::_SafeStr_6226
    protected _botId: number = -1;
    // AS3: .../BotSkillConfigurationViewBase.as::_SafeStr_6351 — the one-per-view subscription,
    // registered on first open and removed on dispose.
    private _configurationEvent: IMessageEvent | null = null;

    // AS3: .../BotSkillConfigurationViewBase.as::BotSkillConfigurationViewBase()
    constructor(widget: AvatarInfoWidget)
    {
        this._widget = widget;
    }

    // AS3: .../BotSkillConfigurationViewBase.as::get disposed()
    public get disposed(): boolean
    {
        return this._widget === null;
    }

    // AS3: .../BotSkillConfigurationViewBase.as::get windowAssetName()
    protected get windowAssetName(): string
    {
        return '';
    }

    // AS3: .../BotSkillConfigurationViewBase.as::get skillType()
    protected get skillType(): number
    {
        return -1;
    }

    // AS3: .../BotSkillConfigurationViewBase.as::open()
    public open(botId: number, position: {x: number; y: number} | null = null): void
    {
        const widget = this._widget;

        if(widget === null) return;

        this._botId = botId;

        const connection = widget.handler?.container?.connection ?? null;

        if(connection !== null && this._configurationEvent === null)
        {
            this._configurationEvent = new BotCommandConfigurationEvent(this.onBotCommandConfigurationEvent);
            connection.addMessageEvent(this._configurationEvent);
        }

        connection?.send(new GetBotCommandConfigurationDataComposer(this._botId, this.skillType));

        if(this._window === null)
        {
            // AS3 builds this at layer 1 (`buildFromXML(xml, 1)`) so the editor sits above the
            // room but below the modal layer; buildWidgetLayout() takes the same layer argument.
            this._window = widget.windowManager?.buildWidgetLayout(this.windowAssetName, 1) as IWindowContainer | null;

            if(this._window === null) return;
        }

        if(position !== null)
        {
            const rectangle = this._window.rectangle;

            this._window.x = position.x - rectangle.width / 2;
            this._window.y = position.y - rectangle.height;
        }

        this.fitToScreen();
        this._window.visible = true;
        this.deactivateInputs();
    }

    // AS3: .../BotSkillConfigurationViewBase.as::close()
    public close(): void
    {
        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    // AS3: .../BotSkillConfigurationViewBase.as::parseConfiguration()
    // Empty in the base; each editor fills its own fields from the string.
    public parseConfiguration(_data: string): void
    {
    }

    // AS3: .../BotSkillConfigurationViewBase.as::deactivateInputs()
    // Empty in the base. AS3 calls it at the end of open() so the editor comes up with no focused
    // text field — the fields only take focus once their value has been filled in.
    protected deactivateInputs(): void
    {
    }

    // AS3: .../BotSkillConfigurationViewBase.as::onBotCommandConfigurationEvent()
    private onBotCommandConfigurationEvent = (event: IMessageEvent): void =>
    {
        const parser = event.parser as BotCommandConfigurationParser | null;

        if(parser === null) return;

        if(parser.botId === this._botId && parser.commandId === this.skillType)
        {
            this.parseConfiguration(parser.data);
        }
    };

    // AS3: .../BotSkillConfigurationViewBase.as::fitToScreen()
    private fitToScreen(): void
    {
        if(this._window === null) return;

        const rectangle = {x: 0, y: 0, width: 0, height: 0};

        this._window.getGlobalRectangle(rectangle);

        const desktop = this._window.desktop;

        if(rectangle.y < 0) this._window.y += -rectangle.y;

        if(rectangle.x < 0) this._window.x += -rectangle.x;

        if(desktop === null) return;

        const right = rectangle.x + rectangle.width;
        const bottom = rectangle.y + rectangle.height;

        if(right > desktop.width) this._window.x -= right - desktop.width;

        if(bottom > desktop.height) this._window.y -= bottom - desktop.height;
    }

    // AS3: .../BotSkillConfigurationViewBase.as::dispose()
    public dispose(): void
    {
        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        if(this._widget !== null)
        {
            const connection = this._widget.handler?.container?.connection ?? null;

            if(connection !== null && this._configurationEvent !== null)
            {
                connection.removeMessageEvent(this._configurationEvent);
                this._configurationEvent = null;
            }

            this._widget = null;
        }

        this._botId = -1;
    }
}
