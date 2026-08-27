/**
 * RoomWidgetFactory
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/RoomWidgetFactory.as
 *
 * TODO(AS3): 39 of the AS3 factory's 45 `RWE_*` cases are constructed here. The six that are
 * not each need a whole subsystem this port has no module for, so they fall through to the
 * default stub log rather than being listed as cases:
 *   - "RWE_CAMERA" / "RWE_ROOM_THUMBNAIL_CAMERA" — CameraWidget / RoomThumbnailCameraWidget
 *   - "RWE_CRAFTING" — CraftingWidget
 *   - "RWE_PLAYLIST_EDITOR_WIDGET" — PlayListEditorWidget (takes `_roomUI.soundManager`)
 *   - "RWE_YOUTUBE" / "RWE_VIMEO" — YoutubeDisplayWidget / VimeoDisplayWidget
 * "RWE_CHAT_WIDGET" used to be handled here and is gone. The 2026 client replaced the
 * widget-based chat bubbles with `habbo/freeflowchat` outright — the primary tree has no
 * `ui/widget/roomchat/` package and `RoomWidgetEnum` no longer declares the constant — so the
 * port's copy was tracing an architecture that no longer exists.
 */
import {Logger} from '@core/utils/Logger';
import type {IRoomWidgetFactory} from './IRoomWidgetFactory';
import type {IRoomWidgetHandler} from './IRoomWidgetHandler';
import type {RoomUI} from './RoomUI';
import {InfoStandWidget} from './widget/infostand/InfoStandWidget';
import {RoomToolsWidget} from './widget/roomtools/RoomToolsWidget';
import {RoomChatInputWidget} from './widget/chatinput/RoomChatInputWidget';
import {EffectsWidget} from './widget/effects/EffectsWidget';
import {AvatarInfoWidget} from './widget/avatarinfo/AvatarInfoWidget';
import {TrophyFurniWidget} from './widget/furniture/trophy/TrophyFurniWidget';
import {
    CustomUserNotificationWidget
} from './widget/furniture/requirementsmissing/CustomUserNotificationWidget';
import {
    RentableSpaceDisplayWidget
} from './widget/furniture/rentablespace/RentableSpaceDisplayWidget';
import {StickieFurniWidget} from './widget/furniture/stickie/StickieFurniWidget';
import {SpamWallPostItFurniWidget} from './widget/furniture/stickie/SpamWallPostItFurniWidget';
import {DimmerFurniWidget} from './widget/furniture/dimmer/DimmerFurniWidget';
import {PresentFurniWidget} from './widget/furniture/present/PresentFurniWidget';
import {MannequinWidget} from './widget/furniture/mannequin/MannequinWidget';
import {FriendFurniEngravingWidget} from './widget/furniture/friendfurni/FriendFurniEngravingWidget';
import {FriendFurniConfirmWidget} from './widget/furniture/friendfurni/FriendFurniConfirmWidget';
import {CustomStackHeightWidget} from './widget/furniture/CustomStackHeightWidget';
import {FurnitureRoomLinkWidget} from './widget/furniture/roomlink/FurnitureRoomLinkWidget';
import {ClothingChangeFurnitureWidget} from './widget/furniture/clothingchange/ClothingChangeFurnitureWidget';
import {PlaceholderWidget} from './widget/furniture/placeholder/PlaceholderWidget';
import {BackgroundColorFurniWidget} from './widget/furniture/backgroundcolor/BackgroundColorFurniWidget';
import {CreditFurniWidget} from './widget/furniture/credit/CreditFurniWidget';
import {EcotronBoxFurniWidget} from './widget/furniture/ecotronbox/EcotronBoxFurniWidget';
import {DoorbellWidget} from './widget/doorbell/DoorbellWidget';
import {RoomQueueWidget} from './widget/roomqueue/RoomQueueWidget';
import {LoadingBarWidget} from './widget/loadingbar/LoadingBarWidget';
import {AreaHideFurniWidget} from './widget/furniture/areahide/AreaHideFurniWidget';
import {PollWidget} from './widget/poll/PollWidget';
import {FriendRequestWidget} from './widget/friendrequest/FriendRequestWidget';
import {HighScoreDisplayWidget} from './widget/furniture/highscore/HighScoreDisplayWidget';
import {WordQuizWidget} from './widget/wordquiz/WordQuizWidget';
import {ExternalImageWidget} from './widget/furniture/externalimage/ExternalImageWidget';
import {UiHelpBubblesWidget} from './widget/uihelpbubbles/UiHelpBubblesWidget';
import {MeMenuWidget} from './widget/memenu/MeMenuWidget';
import {UsersChooserWidget} from './widget/chooser/users/UsersChooserWidget';
import {FurniChooserWidget} from './widget/chooser/furni/FurniChooserWidget';
import {AchievementResolutionTrophyFurniWidget} from './widget/furniture/trophy/AchievementResolutionTrophyFurniWidget';
import {RoomWidgetBase} from './widget/RoomWidgetBase';
import {PetPackageFurniWidget} from './widget/furniture/petpackage/PetPackageFurniWidget';
import {FurnitureContextMenuWidget} from './widget/furniture/contextmenu/FurnitureContextMenuWidget';
import {CraftingWidget} from './widget/crafting/CraftingWidget';
import {CameraWidget} from './widget/camera/CameraWidget';
import {RoomThumbnailCameraWidget} from './widget/camera/RoomThumbnailCameraWidget';
import {YoutubeDisplayWidget} from './widget/furniture/video/YoutubeDisplayWidget';
import {VimeoDisplayWidget} from './widget/furniture/video/VimeoDisplayWidget';
import {PlayListEditorWidget} from './widget/playlisteditor/PlayListEditorWidget';

const log = Logger.getLogger('habbo.ui.RoomWidgetFactory');

export class RoomWidgetFactory implements IRoomWidgetFactory
{
    // AS3: .../src/com/sulake/habbo/ui/widget/RoomWidgetFactory.as::_roomUI
    private _roomUI: RoomUI;
    private _disposed: boolean = false;

    constructor(roomUI: RoomUI)
    {
        this._roomUI = roomUI;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/RoomWidgetFactory.as::createWidget()
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
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_ROOM_QUEUE"
            case 'RWE_ROOM_QUEUE':
                return new RoomQueueWidget(
                    handler,
                    this._roomUI.windowManager,
                    this._roomUI.assets,
                    this._roomUI.localization,
                    // AS3 passes `_roomUI` itself here: the parameter is typed as core's
                    // configuration interface, which every Component implements. This port's
                    // RoomUI exposes the manager it resolved instead, which is the same object.
                    this._roomUI.config
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_FURNI_ACHIEVEMENT_RESOLUTION_ENGRAVING"
            case 'RWE_FURNI_ACHIEVEMENT_RESOLUTION_ENGRAVING':
                return new AchievementResolutionTrophyFurniWidget(
                    handler,
                    this._roomUI.windowManager,
                    this._roomUI.assets,
                    this._roomUI.localization,
                    this._roomUI.config
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_FURNI_CHOOSER"
            case 'RWE_FURNI_CHOOSER':
                return new FurniChooserWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets, this._roomUI.localization
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_USER_CHOOSER"
            case 'RWE_USER_CHOOSER':
                return new UsersChooserWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets, this._roomUI.localization
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_ME_MENU"
            case 'RWE_ME_MENU':
                return new MeMenuWidget(
                    handler,
                    this._roomUI.windowManager,
                    this._roomUI.assets,
                    this._roomUI.localization,
                    // AS3 passes `_roomUI` itself, typed as core's configuration interface. This
                    // port hands over the manager it resolved, which is the same object.
                    this._roomUI.config
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_UI_HELP_BUBBLE"
            case 'RWE_UI_HELP_BUBBLE':
                return new UiHelpBubblesWidget(
                    handler,
                    this._roomUI.windowManager,
                    this._roomUI.assets,
                    this._roomUI.localization,
                    this._roomUI.friendBarView,
                    this._roomUI.toolbar,
                    this._roomUI.desktop,
                    this._roomUI
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_EXTERNAL_IMAGE"
            case 'RWE_EXTERNAL_IMAGE':
                return new ExternalImageWidget(
                    handler,
                    this._roomUI.windowManager,
                    this._roomUI.assets,
                    this._roomUI.localization,
                    this._roomUI.inventory,
                    this._roomUI.habboHelp,
                    this._roomUI.roomEngine,
                    // AS3 passes `_roomUI` twice here — once as the IRoomEngine holder above and
                    // once as the plain Component this widget reads config and the stage off.
                    this._roomUI
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_WORD_QUIZZ"
            case 'RWE_WORD_QUIZZ':
                return new WordQuizWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets, this._roomUI.localization
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_HIGH_SCORE_DISPLAY"
            case 'RWE_HIGH_SCORE_DISPLAY':
                return new HighScoreDisplayWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets, this._roomUI.localization
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_FRIEND_REQUEST"
            case 'RWE_FRIEND_REQUEST':
                return new FriendRequestWidget(
                    handler,
                    this._roomUI.windowManager,
                    this._roomUI.assets,
                    this._roomUI.localization,
                    this._roomUI
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_ROOM_POLL"
            case 'RWE_ROOM_POLL':
                return new PollWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets, this._roomUI.localization
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_AREA_HIDE"
            case 'RWE_AREA_HIDE':
                return new AreaHideFurniWidget(
                    handler,
                    this._roomUI.windowManager,
                    this._roomUI.assets,
                    this._roomUI.localization,
                    this._roomUI.roomEngine
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_LOADINGBAR"
            case 'RWE_LOADINGBAR':
                return new LoadingBarWidget(
                    handler,
                    this._roomUI.windowManager,
                    this._roomUI.assets,
                    this._roomUI.localization,
                    this._roomUI.config
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_CONVERSION_TRACKING" — a bare
            // RoomWidgetBase, with no window and no behaviour. It exists only so createWidget()
            // returns non-null; the handler is the feature.
            case 'RWE_CONVERSION_TRACKING':
                return new RoomWidgetBase(handler, this._roomUI.windowManager);
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_DOORBELL"
            case 'RWE_DOORBELL':
                return new DoorbellWidget(
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
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_SPAMWALL_POSTIT_WIDGET"
            case 'RWE_SPAMWALL_POSTIT_WIDGET':
                return new SpamWallPostItFurniWidget(handler, this._roomUI.windowManager, this._roomUI.assets);
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_CLOTHING_CHANGE"
            case 'RWE_CLOTHING_CHANGE':
                return new ClothingChangeFurnitureWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets, this._roomUI.localization
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_ROOM_LINK"
            case 'RWE_ROOM_LINK':
                return new FurnitureRoomLinkWidget(handler, this._roomUI.windowManager);
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_CUSTOM_STACK_HEIGHT"
            case 'RWE_CUSTOM_STACK_HEIGHT':
                return new CustomStackHeightWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets, this._roomUI.localization
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_FRIEND_FURNI_CONFIRM"
            case 'RWE_FRIEND_FURNI_CONFIRM':
                return new FriendFurniConfirmWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets, this._roomUI.localization
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_FRIEND_FURNI_ENGRAVING"
            case 'RWE_FRIEND_FURNI_ENGRAVING':
                return new FriendFurniEngravingWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets, this._roomUI.localization
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_MANNEQUIN"
            case 'RWE_MANNEQUIN':
                return new MannequinWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets, this._roomUI.localization
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_FURNI_PRESENT_WIDGET"
            case 'RWE_FURNI_PRESENT_WIDGET':
                return new PresentFurniWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets, this._roomUI.localization,
                    this._roomUI.config, this._roomUI.catalog, this._roomUI.inventory, this._roomUI.roomEngine
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_ROOM_DIMMER"
            case 'RWE_ROOM_DIMMER':
                return new DimmerFurniWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets, this._roomUI.localization
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_FURNI_TROPHY_WIDGET"
            case 'RWE_FURNI_TROPHY_WIDGET':
                return new TrophyFurniWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets,
                    this._roomUI.localization, this._roomUI.config
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_CUSTOM_USER_NOTIFICATION"
            case 'RWE_CUSTOM_USER_NOTIFICATION':
                return new CustomUserNotificationWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_RENTABLESPACE"
            case 'RWE_RENTABLESPACE':
                return new RentableSpaceDisplayWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets, this._roomUI.localization
                );
            // AS3: RoomWidgetFactory.as::createWidget() "RWE_FURNITURE_CONTEXT_MENU"
            case 'RWE_FURNITURE_CONTEXT_MENU':
                return new FurnitureContextMenuWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets,
                    this._roomUI.localization, this._roomUI.habboGroupsManager, this._roomUI.catalog
                );
            // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/RoomWidgetFactory.as:133-134
            case 'RWE_CAMERA':
                return new CameraWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets, this._roomUI.localization, this._roomUI
                );
            // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/RoomWidgetFactory.as:163-164
            case 'RWE_ROOM_THUMBNAIL_CAMERA':
                return new RoomThumbnailCameraWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets, this._roomUI.localization, this._roomUI
                );
            case 'RWE_YOUTUBE':
                return new YoutubeDisplayWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets,
                    this._roomUI.localization, this._roomUI.habboTracking
                );
            case 'RWE_VIMEO':
                return new VimeoDisplayWidget(
                    handler, this._roomUI.windowManager, this._roomUI.assets, this._roomUI.localization
                );
            case 'RWE_CRAFTING':
                return new CraftingWidget(handler, this._roomUI.windowManager, this._roomUI);
            case 'RWE_PLAYLIST_EDITOR_WIDGET':
            {
                // The editor is driven entirely by the music controller — with no sound manager
                // there is nothing for it to read a playlist from, so it is not built at all
                // rather than opened empty.
                const soundManager = this._roomUI.soundManager;

                if(soundManager === null)
                {
                    log.warn('RWE_PLAYLIST_EDITOR_WIDGET requested before the sound manager resolved');

                    return null;
                }

                return new PlayListEditorWidget(
                    handler, this._roomUI.windowManager, soundManager,
                    this._roomUI.assets, this._roomUI.localization, this._roomUI.config,
                    this._roomUI.catalog
                );
            }
            default:
                log.debug(`Widget creation requested: ${type} (stub — returning null)`);

                return null;
        }
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/RoomWidgetFactory.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/RoomWidgetFactory.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._roomUI = null!;
    }
}
