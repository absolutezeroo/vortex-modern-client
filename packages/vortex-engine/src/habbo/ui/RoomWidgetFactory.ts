/**
 * RoomWidgetFactory
 *
 * @see sources/win63_version/habbo/ui/widget/RoomWidgetFactory.as
 *
 * TODO(AS3): only "RWE_INFOSTAND" is implemented so far; the AS3 factory
 * constructs ~35 other widget types (chat, me-menu, room tools, etc.).
 */
import {Logger} from '@core/utils/Logger';
import type {IRoomWidgetFactory} from './IRoomWidgetFactory';
import type {IRoomWidgetHandler} from './IRoomWidgetHandler';
import type {RoomUI} from './RoomUI';
import {InfoStandWidget} from './widget/infostand/InfoStandWidget';
import {RoomToolsWidget} from './widget/roomtools/RoomToolsWidget';
import {RoomChatInputWidget} from './widget/chatinput/RoomChatInputWidget';
import {RoomChatWidget} from './widget/roomchat/RoomChatWidget';
import {EffectsWidget} from './widget/effects/EffectsWidget';

const log = Logger.getLogger('RoomWidgetFactory');

export class RoomWidgetFactory implements IRoomWidgetFactory
{
    private _roomUI: RoomUI;
    private _disposed: boolean = false;
    // AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/RoomWidgetFactory.as::var_3743 (chat widget id counter)
    private _chatWidgetIdCounter: number = 0;

    constructor(roomUI: RoomUI)
    {
        this._roomUI = roomUI;
    }

    // AS3: sources/win63_version/habbo/ui/widget/RoomWidgetFactory.as::createWidget()
    public createWidget(type: string, handler: IRoomWidgetHandler): unknown | null
    {
        if(!this._roomUI || !this._roomUI.windowManager) return null;

        switch(type)
        {
            case 'RWE_INFOSTAND':
                return new InfoStandWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets,
                    this._roomUI.localization, this._roomUI.config, this._roomUI.catalog
                );
            case 'RWE_ROOM_TOOLS':
                return new RoomToolsWidget(handler, this._roomUI.windowManager, this._roomUI.assets, this._roomUI);
            case 'RWE_EFFECTS':
                return new EffectsWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets, this._roomUI.localization
                );
            case 'RWE_CHAT_INPUT_WIDGET':
                return new RoomChatInputWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets,
                    this._roomUI.localization, this._roomUI, this._roomUI.desktop
                );
            case 'RWE_CHAT_WIDGET':
                return new RoomChatWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets, this._roomUI.localization,
                    this._roomUI.config!, this._chatWidgetIdCounter++, this._roomUI
                );
            default:
                log.debug(`Widget creation requested: ${type} (stub — returning null)`);

                return null;
        }
    }

    public get disposed(): boolean
    {
        return this._disposed;
    }

    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._roomUI = null!;
    }
}
