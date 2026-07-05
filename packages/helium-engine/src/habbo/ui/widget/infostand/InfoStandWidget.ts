
/**
 * InfoStandWidget
 *
 * @see sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as
 *
 * Container for all infostand sub-views (furni/user/pet/bot/rentable-bot/
 * jukebox/crackable-furni/song-disk). Only the furni-facing views are fully
 * ported; the rest are inert stubs (see InfoStandUserView.ts and siblings) —
 * this class still constructs and wires all of them to match AS3's structure,
 * so `selectView()`/`hideChildren()` naturally no-op for the stubbed views
 * (their `window` is always `null`, so `mainContainer.getChildByName(...)`
 * never finds them).
 */
import type {EventEmitter} from 'eventemitter3';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import {RoomWidgetRoomObjectUpdateEvent} from '../events/RoomWidgetRoomObjectUpdateEvent';
import {RoomWidgetFurniInfoUpdateEvent} from '../events/RoomWidgetFurniInfoUpdateEvent';
import {RoomWidgetInfostandExtraParamEnum} from '../enums/RoomWidgetInfostandExtraParamEnum';
import {RoomWidgetRoomObjectMessage} from '../messages/RoomWidgetRoomObjectMessage';
import type {InfoStandWidgetHandler} from '@habbo/ui/handler/InfoStandWidgetHandler';
import {InfoStandFurniView} from './InfoStandFurniView';
import {InfoStandCrackableFurniView} from './InfoStandCrackableFurniView';
import {InfoStandUserView} from './InfoStandUserView';
import {InfoStandPetView} from './InfoStandPetView';
import {InfoStandBotView} from './InfoStandBotView';
import {InfoStandRentableBotView} from './InfoStandRentableBotView';
import {InfoStandJukeboxView} from './InfoStandJukeboxView';
import {InfoStandSongDiskView} from './InfoStandSongDiskView';
import {InfoStandFurniData} from './InfoStandFurniData';
import {InfoStandUserData} from './InfoStandUserData';
import {InfoStandPetData} from './InfoStandPetData';
import {InfoStandRentableBotData} from './InfoStandRentableBotData';

// AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::USER_VIEW / const_529 / PET_VIEW / ...
const VIEW_NAME =
    {
        USER: 'infostand_user_view',
        FURNI: 'infostand_furni_view',
        PET: 'infostand_pet_view',
        BOT: 'infostand_bot_view',
        RENTABLE_BOT: 'infostand_rentable_bot_view',
        JUKEBOX: 'infostand_jukebox_view',
        CRACKABLE_FURNI: 'infostand_crackable_furni_view',
        SONGDISK: 'infostand_songdisk_view',
    } as const;

export class InfoStandWidget extends RoomWidgetBase
{
    private readonly _furniView: InfoStandFurniView;
    private readonly _userView: InfoStandUserView;
    private readonly _petView: InfoStandPetView;
    private readonly _botView: InfoStandBotView;
    private readonly _rentableBotView: InfoStandRentableBotView;
    private readonly _jukeboxView: InfoStandJukeboxView;
    private readonly _crackableFurniView: InfoStandCrackableFurniView;
    private readonly _songDiskView: InfoStandSongDiskView;

    private readonly _userData: InfoStandUserData;
    private readonly _furniData: InfoStandFurniData;
    private readonly _petData: InfoStandPetData;
    private readonly _rentableBotData: InfoStandRentableBotData;

    private _mainContainer: IWindowContainer | null = null;
    private readonly _config: IHabboConfigurationManager | null;

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::InfoStandWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null,
        localizations: IHabboLocalizationManager | null,
        config: IHabboConfigurationManager | null,
        catalog: IHabboCatalog | null
    )
    {
        super(handler, windowManager, assets, localizations);

        this._config = config;
        this._furniView = new InfoStandFurniView(this, VIEW_NAME.FURNI, catalog);
        this._userView = new InfoStandUserView(this, VIEW_NAME.USER);
        this._petView = new InfoStandPetView(this, VIEW_NAME.PET, catalog);
        this._botView = new InfoStandBotView(this, VIEW_NAME.BOT);
        this._rentableBotView = new InfoStandRentableBotView(this, VIEW_NAME.RENTABLE_BOT, catalog);
        this._jukeboxView = new InfoStandJukeboxView(this, VIEW_NAME.JUKEBOX, catalog);
        this._crackableFurniView = new InfoStandCrackableFurniView(this, VIEW_NAME.CRACKABLE_FURNI, catalog);
        this._songDiskView = new InfoStandSongDiskView(this, VIEW_NAME.SONGDISK, catalog);
        this._userData = new InfoStandUserData();
        this._furniData = new InfoStandFurniData();
        this._petData = new InfoStandPetData();
        this._rentableBotData = new InfoStandRentableBotData();

        this.mainContainer.visible = false;
        this.handler.widget = this;
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::get handler()
    public get handler(): InfoStandWidgetHandler
    {
        return this._handler as InfoStandWidgetHandler;
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::get furniView()
    public get furniView(): InfoStandFurniView
    {
        return this._furniView;
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::get mainWindow()
    public override get mainWindow(): IWindow | null
    {
        return this.mainContainer;
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::get config()
    public get config(): IHabboConfigurationManager | null
    {
        return this._config;
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::get mainContainer()
    public get mainContainer(): IWindowContainer
    {
        if(!this._mainContainer)
        {
            this._mainContainer = this.windowManager.createWindow(
                'infostand_main_container', '', 4, 0, 0, {x: 0, y: 0, width: 50, height: 100}
            ) as IWindowContainer;
            this._mainContainer.tags.push('room_widget_infostand');
            this._mainContainer.background = true;
            this._mainContainer.color = 0;
        }

        return this._mainContainer;
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::favouriteGroupUpdated()
    // TODO(AS3): userView is a stub (see InfoStandUserView.ts) — this naturally no-ops
    // because `mainContainer.getChildByName('infostand_user_view')` never finds a child
    // (the stub view never adds itself), matching AS3's own visibility guard.
    public favouriteGroupUpdated(userRoomId: number, groupId: number, _webId: number, groupName: string): void
    {
        if(this._userData.userRoomId !== userRoomId) return;

        const userViewWindow = this._mainContainer?.findChildByName(VIEW_NAME.USER);

        if(!userViewWindow || !userViewWindow.visible) return;

        this._userView.clearGroupBadge();

        if(groupId !== -1)
        {
            this._userData.groupId = groupId;
            this._userData.groupBadgeId = this.handler.container?.sessionDataManager?.getGroupBadgeId(groupId) ?? '';
            this._userData.groupName = groupName;
            this._userView.setGroupBadge(this._userData.groupBadgeId);
        }
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::getXmlWindow()
    public getXmlWindow(name: string): IWindow | null
    {
        const window = this.windowManager.buildWidgetLayout(name);

        return window;
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::setRelationshipStatus()
    public setRelationshipStatus(userId: number, statuses: unknown): void
    {
        if(this._userData.userId === userId)
        {
            this._userView.setRelationshipStatuses(statuses);
        }
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::dispose()
    public override dispose(): void
    {
        this._userView.dispose();
        this._furniView.dispose();
        this._botView.dispose();
        this._rentableBotView.dispose();
        this._petView.dispose();
        this._jukeboxView.dispose();
        this._crackableFurniView.dispose();
        this._songDiskView.dispose();
        super.dispose();
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::registerUpdateEvents()
    public override registerUpdateEvents(dispatcher: EventEmitter): void
    {
        if(!dispatcher) return;

        dispatcher.on(RoomWidgetRoomObjectUpdateEvent.OBJECT_SELECTED, this.onRoomObjectSelected);
        dispatcher.on(RoomWidgetRoomObjectUpdateEvent.OBJECT_DESELECTED, this.onClose);
        dispatcher.on(RoomWidgetRoomObjectUpdateEvent.USER_REMOVED, this.onRoomObjectRemoved);
        dispatcher.on(RoomWidgetRoomObjectUpdateEvent.FURNI_REMOVED, this.onRoomObjectRemoved);
        dispatcher.on('RWROUE_OBJECT_PLACED', this.onRoomObjectPlaced);
        dispatcher.on('RWUIUE_OWN_USER', this.onUserInfo);
        dispatcher.on('RWUIUE_PEER', this.onUserInfo);
        dispatcher.on('RWUIUE_BOT', this.onBotInfo);
        dispatcher.on(RoomWidgetFurniInfoUpdateEvent.FURNI, this.onFurniInfo);
        dispatcher.on('RWRBIUE_RENTABLE_BOT', this.onRentableBotInfo);
        dispatcher.on('RWPIUE_PET_INFO', this.onPetInfo);
        dispatcher.on('RWPCUE_PET_COMMANDS', this.onPetCommands);
        dispatcher.on('RWPCUE_OPEN_PET_TRAINING', this.onOpenPetTraining);
        dispatcher.on('RWPCUE_CLOSE_PET_TRAINING', this.onClosePetTraining);
        dispatcher.on('RWSUE_PLAYING_CHANGED', this.onSongUpdate);
        dispatcher.on('RWSUE_DATA_RECEIVED', this.onSongUpdate);
        dispatcher.on('RWPIUE_PET_FIGURE_UPDATE', this.onPetFigureUpdate);

        super.registerUpdateEvents(dispatcher);
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::unregisterUpdateEvents()
    public override unregisterUpdateEvents(dispatcher: EventEmitter): void
    {
        if(!dispatcher) return;

        dispatcher.off(RoomWidgetRoomObjectUpdateEvent.OBJECT_SELECTED, this.onRoomObjectSelected);
        dispatcher.off(RoomWidgetRoomObjectUpdateEvent.OBJECT_DESELECTED, this.onClose);
        dispatcher.off(RoomWidgetRoomObjectUpdateEvent.USER_REMOVED, this.onRoomObjectRemoved);
        dispatcher.off(RoomWidgetRoomObjectUpdateEvent.FURNI_REMOVED, this.onRoomObjectRemoved);
        dispatcher.off('RWROUE_OBJECT_PLACED', this.onRoomObjectPlaced);
        dispatcher.off('RWUIUE_OWN_USER', this.onUserInfo);
        dispatcher.off('RWUIUE_PEER', this.onUserInfo);
        dispatcher.off('RWUIUE_BOT', this.onBotInfo);
        dispatcher.off(RoomWidgetFurniInfoUpdateEvent.FURNI, this.onFurniInfo);
        dispatcher.off('RWPIUE_PET_INFO', this.onPetInfo);
        dispatcher.off('RWPCUE_PET_COMMANDS', this.onPetCommands);
        dispatcher.off('RWPCUE_OPEN_PET_TRAINING', this.onOpenPetTraining);
        dispatcher.off('RWPCUE_CLOSE_PET_TRAINING', this.onClosePetTraining);
        dispatcher.off('RWSUE_PLAYING_CHANGED', this.onSongUpdate);
        dispatcher.off('RWSUE_DATA_RECEIVED', this.onSongUpdate);
        dispatcher.off('RWPIUE_PET_FIGURE_UPDATE', this.onPetFigureUpdate);
    }

    public get rentableBotData(): InfoStandRentableBotData
    {
        return this._rentableBotData;
    }

    public get userData(): InfoStandUserData
    {
        return this._userData;
    }

    public get furniData(): InfoStandFurniData
    {
        return this._furniData;
    }

    public get petData(): InfoStandPetData
    {
        return this._petData;
    }

    // TODO(AS3): InfoStandWidget.as::onUpdateTimer() — periodic pet-info refresh,
    // deferred with the rest of the pet view (see InfoStandPetView.ts).

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::onUserInfo()
    // TODO(AS3): param is RoomWidgetUserInfoUpdateEvent (not yet ported — user view is
    // a stub, see InfoStandUserView.ts). Real behavior: userData.setData(event); bail if
    // sessionDataManager.isBlocked(event.webID); userView.update(event); selectView(USER).
    private onUserInfo = (_event: unknown): void =>
    {
    };

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::onBotInfo()
    // TODO(AS3): param is RoomWidgetUserInfoUpdateEvent — bot view is a stub.
    private onBotInfo = (_event: unknown): void =>
    {
    };

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::onRentableBotInfo()
    // TODO(AS3): param is RoomWidgetRentableBotInfoUpdateEvent — rentable bot view is a stub.
    private onRentableBotInfo = (_event: unknown): void =>
    {
    };

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::onFurniInfo()
    private onFurniInfo = (event: RoomWidgetFurniInfoUpdateEvent): void =>
    {
        this._furniData.setData(event);

        if(event.extraParam === RoomWidgetInfostandExtraParamEnum.INFOSTAND_EXTRAPARAM_JUKEBOX)
        {
            this._jukeboxView.update(event);
            this.selectView(VIEW_NAME.JUKEBOX);
        }
        else if(event.extraParam.indexOf(RoomWidgetInfostandExtraParamEnum.INFOSTAND_EXTRAPARAM_SONGDISK) !== -1)
        {
            this._songDiskView.update(event);
            this.selectView(VIEW_NAME.SONGDISK);
        }
        else if(event.extraParam.indexOf(RoomWidgetInfostandExtraParamEnum.INFOSTAND_EXTRAPARAM_CRACKABLE_FURNI) !== -1)
        {
            this._crackableFurniView.update(event);
            this.selectView(VIEW_NAME.CRACKABLE_FURNI);
        }
        else
        {
            this._furniView.update(event);
            this.selectView(VIEW_NAME.FURNI);
        }
    };

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::onPetInfo()
    // TODO(AS3): param is RoomWidgetPetInfoUpdateEvent — pet view is a stub.
    private onPetInfo = (_event: unknown): void =>
    {
    };

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::onPetFigureUpdate()
    // TODO(AS3): param is RoomWidgetPetFigureUpdateEvent — pet view is a stub.
    private onPetFigureUpdate = (_event: unknown): void =>
    {
    };

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::onPetCommands()
    // TODO(AS3): param is RoomWidgetPetCommandsUpdateEvent — pet view is a stub.
    private onPetCommands = (_event: unknown): void =>
    {
    };

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::onOpenPetTraining()
    private onOpenPetTraining = (_event: unknown): void =>
    {
        this._petView.openTrainView();
    };

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::onClosePetTraining()
    private onClosePetTraining = (_event: unknown): void =>
    {
        this._petView.closeTrainView();
    };

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::updateUserData()
    // TODO(AS3): user/bot views are stubs — this naturally no-ops (setFigure/setMotto are
    // inert on the stub views).
    public updateUserData(userId: number, figure: string, achievementScore: number, motto: string, mottoEnabled: boolean): void
    {
        if(userId !== this._userData.userId) return;

        if(this._userData.isBot())
        {
            this._botView.setFigure(figure);
        }
        else
        {
            this._userView.setFigure(figure);
            this._userView.setMotto(motto, mottoEnabled);

            if(this.handler.isActivityDisplayEnabled)
            {
                this._userView.achievementScore = achievementScore;
            }
        }
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::refreshBadges()
    public refreshBadges(userId: number, badges: string[]): void
    {
        if(userId !== this._userData.userId) return;

        this._userData.badges = badges;

        if(this._userData.isBot())
        {
            this._botView.clearBadges();
        }
        else
        {
            this._userView.clearBadges();
        }

        for(const badgeId of badges)
        {
            this.refreshBadge(badgeId);
        }
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::refreshBadge()
    public refreshBadge(badgeId: string): void
    {
        const index = this._userData.badges.indexOf(badgeId);

        if(index >= 0)
        {
            if(this._userData.isBot())
            {
                this._botView.setBadge(index, badgeId);
            }
            else
            {
                this._userView.setBadge(index, badgeId);
            }

            return;
        }

        if(badgeId === this._userData.groupBadgeId)
        {
            this._userView.setGroupBadge(badgeId);
        }
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::onRoomObjectPlaced()
    // TODO(AS3): the Builder's Club "place from infostand" flow (BuildersClubPlaceRoomItemMessageComposer
    // / BuildersClubPlaceWallItemMessageComposer) isn't ported yet — out of scope for the furni-only port.
    private onRoomObjectPlaced = (_event: unknown): void =>
    {
    };

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::requestItemToMover()
    public requestItemToMover(): void
    {
        this.handler.container?.roomEngine?.initializeRoomObjectInsert(
            'info_stand', -this._furniData.bcOfferId, this._furniData.category,
            this._furniData.classId, this._furniData.extraParam, null
        );
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::onRoomObjectSelected()
    private onRoomObjectSelected = (event: RoomWidgetRoomObjectUpdateEvent): void =>
    {
        this.messageListener?.processWidgetMessage(
            new RoomWidgetRoomObjectMessage(RoomWidgetRoomObjectMessage.GET_OBJECT_INFO, event.id, event.category)
        );
    };

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::onRoomObjectRemoved()
    private onRoomObjectRemoved = (event: RoomWidgetRoomObjectUpdateEvent): void =>
    {
        let shouldClose = false;

        switch(event.type)
        {
            case RoomWidgetRoomObjectUpdateEvent.FURNI_REMOVED:
                shouldClose = event.id === this._furniData.id;
                break;
            case RoomWidgetRoomObjectUpdateEvent.USER_REMOVED:
                if(this._userView.window?.visible)
                {
                    shouldClose = event.id === this._userData.userRoomId;
                    break;
                }

                if(this._petView.window?.visible)
                {
                    shouldClose = event.id === this._petData.roomIndex;
                    break;
                }

                if(this._botView.window?.visible)
                {
                    shouldClose = event.id === this._userData.userRoomId;
                    break;
                }

                if(this._rentableBotView.window?.visible)
                {
                    shouldClose = event.id === this._rentableBotData.userRoomId;
                }

                break;
        }

        if(shouldClose)
        {
            this.close();
        }
    };

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::onSongUpdate()
    // TODO(AS3): param is RoomWidgetSongUpdateEvent — jukebox/song-disk views are stubs.
    private onSongUpdate = (_event: unknown): void =>
    {
    };

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::close()
    public close(): void
    {
        this.hideChildren();
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::onClose()
    private onClose = (_event: unknown): void =>
    {
        this.close();
    };

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::hideChildren()
    private hideChildren(): void
    {
        if(!this._mainContainer) return;

        for(let i = 0; i < this._mainContainer.numChildren; i++)
        {
            const child = this._mainContainer.getChildAt(i);

            if(child) child.visible = false;
        }
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::isFurniViewVisible()
    public isFurniViewVisible(): boolean
    {
        const child = this._mainContainer?.getChildByName(VIEW_NAME.FURNI);

        return child?.visible ?? false;
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::selectView()
    private selectView(name: string): void
    {
        this.hideChildren();

        const child = this.mainContainer.getChildByName(name);

        if(!child) return;

        child.visible = true;
        this.mainContainer.visible = true;
        this.mainContainer.width = child.width;
        this.mainContainer.height = child.height;
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::refreshContainer()
    public refreshContainer(): void
    {
        for(let i = 0; i < this.mainContainer.numChildren; i++)
        {
            const child = this.mainContainer.getChildAt(i);

            if(child?.visible)
            {
                this.mainContainer.width = child.width;
                this.mainContainer.height = child.height;
            }
        }
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandWidget.as::release()
    public override release(): void
    {
        this.close();
        super.release();
    }
}
