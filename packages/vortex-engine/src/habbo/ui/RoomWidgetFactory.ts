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
import {AvatarInfoWidget} from './widget/avatarinfo/AvatarInfoWidget';
import {TrophyFurniWidget} from './widget/furniture/trophy/TrophyFurniWidget';
import {StickieFurniWidget} from './widget/furniture/stickie/StickieFurniWidget';
import {PlaceholderWidget} from './widget/furniture/placeholder/PlaceholderWidget';
import {BackgroundColorFurniWidget} from './widget/furniture/backgroundcolor/BackgroundColorFurniWidget';
import {CreditFurniWidget} from './widget/furniture/credit/CreditFurniWidget';
import {EcotronBoxFurniWidget} from './widget/furniture/ecotronbox/EcotronBoxFurniWidget';
import {PetPackageFurniWidget} from './widget/furniture/petpackage/PetPackageFurniWidget';
import {FurnitureContextMenuWidget} from './widget/furniture/contextmenu/FurnitureContextMenuWidget';

const log = Logger.getLogger('habbo.ui.RoomWidgetFactory');

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
            case 'RWE_AVATAR_INFO':
                return new AvatarInfoWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets,
                    this._roomUI.localization, this._roomUI.config, this._roomUI.catalog
                );
            case 'RWE_CHAT_INPUT_WIDGET':
                return new RoomChatInputWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets,
                    this._roomUI.localization, this._roomUI, this._roomUI.desktop
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_FURNI_PET_PACKAGE_WIDGET"
            case 'RWE_FURNI_PET_PACKAGE_WIDGET':
                return new PetPackageFurniWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets, this._roomUI.localization
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_FURNI_ECOTRONBOX_WIDGET"
            case 'RWE_FURNI_ECOTRONBOX_WIDGET':
                return new EcotronBoxFurniWidget(handler, this._roomUI.windowManager, this._roomUI.assets);
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_FURNI_CREDIT_WIDGET"
            case 'RWE_FURNI_CREDIT_WIDGET':
                return new CreditFurniWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets, this._roomUI.localization
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_ROOM_BACKGROUND_COLOR"
            case 'RWE_ROOM_BACKGROUND_COLOR':
                return new BackgroundColorFurniWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets, this._roomUI.localization
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_FURNI_PLACEHOLDER"
            case 'RWE_FURNI_PLACEHOLDER':
                return new PlaceholderWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets, this._roomUI.localization
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_FURNI_STICKIE_WIDGET"
            case 'RWE_FURNI_STICKIE_WIDGET':
                return new StickieFurniWidget(handler, this._roomUI.windowManager, this._roomUI.assets);
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_FURNI_TROPHY_WIDGET"
            case 'RWE_FURNI_TROPHY_WIDGET':
                return new TrophyFurniWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets,
                    this._roomUI.localization, this._roomUI.config
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_FURNITURE_CONTEXT_MENU"
            case 'RWE_FURNITURE_CONTEXT_MENU':
                return new FurnitureContextMenuWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets,
                    this._roomUI.localization, this._roomUI.catalog
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
