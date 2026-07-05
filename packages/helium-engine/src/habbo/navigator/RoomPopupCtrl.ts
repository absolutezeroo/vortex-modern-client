import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {GuestRoomData} from '../communication/messages/incoming/navigator';
import type {IHabboTransitionalNavigator} from './IHabboTransitionalNavigator';
import {PopupCtrl} from './PopupCtrl';
import {TagRenderer} from './TagRenderer';
import {GuildInfoCtrl} from './GuildInfoCtrl';
import {Util} from './Util';

/**
 * Room details popup showing name, owner, description, tags, settings, guild info.
 *
 * Extends PopupCtrl to display detailed room information on hover/click.
 *
 * @see sources/win63_version/habbo/navigator/RoomPopupCtrl.as
 */
export class RoomPopupCtrl extends PopupCtrl
{
    private _details: IWindowContainer | null = null;
    private _roomData: GuestRoomData | null = null;
    private _tagRenderer: TagRenderer;
    private _transitionalNavigator: IHabboTransitionalNavigator;
    private _guildInfoCtrl: GuildInfoCtrl;

    constructor(navigator: IHabboTransitionalNavigator, offsetX: number, offsetY: number)
    {
        super(navigator, offsetX, offsetY, 'grs_guest_room_details_long');
        this._transitionalNavigator = navigator;
        this._tagRenderer = new TagRenderer(navigator, () => this.hideInstantly());
        this._guildInfoCtrl = new GuildInfoCtrl(navigator);
    }

    set room(data: GuestRoomData)
    {
        this._roomData = data;
    }

    override refreshContent(popup: IWindowContainer): void
    {
        if(!this._roomData) return;

        if(!this._details)
        {
            this._details = popup.findChildByName('details_container') as IWindowContainer | null;
        }

        if(!this._details) return;

        this._details.visible = true;
        this._tagRenderer.useHashTags = true;
        Util.hideChildren(this._details);
        this._guildInfoCtrl.refresh(this._details, this._roomData);
        this.refreshRoomName(this._details, this._roomData);
        this.refreshOwnerName();
        this.refreshTextWithCaption('roomctg', this._details, this.getRoomCtg(this._roomData.categoryId));
        this.refreshRoomDesc(this._details, this._roomData);
        this.refreshExtraCont();
        this.refreshEventInfo(this._roomData);
        this.refreshRoomSettings();
        this.refreshInfo(this._details, 'trading_allowed', this._roomData.tradeMode === 2);
        this.refreshInfo(this._details, 'doormode_doorbell', this._roomData.doorMode === 1);
        this.refreshInfo(this._details, 'doormode_password', this._roomData.doorMode === 2);
        this.refreshInfo(this._details, 'doormode_invisible', this._roomData.doorMode === 3);

        Util.moveChildrenToColumn(
            this._details,
            ['guild_info', 'roomname', 'roomctg_cont', 'roomowner_cont', 'roomdesc', 'extra_cont', 'doormode_doorbell', 'doormode_password', 'doormode_invisible', 'trading_allowed', 'eventinfo_cont', 'roomsettings_cont'],
            0, 0
        );

        const guildInfo = this._details.findChildByName('guild_info');

        if(guildInfo)
        {
            guildInfo.x = 2;
        }

        this._details.height = Util.getLowestPoint(this._details);
    }

    override dispose(): void
    {
        this._tagRenderer.dispose();
        this._guildInfoCtrl.dispose();
        super.dispose();
    }

    private refreshOwnerName(): void
    {
        if(!this._details || !this._roomData) return;

        const ownerText = this._details.findChildByName('roomowner') as ITextWindow | null;
        const ownerCont = this._details.findChildByName('roomowner_cont');

        if(!ownerCont) return;

        ownerCont.procedure = this.onOwnerName;

        if(ownerText)
        {
            ownerText.caption = this._roomData.showOwner ? this._roomData.ownerName : '';
        }

        ownerCont.visible = this._roomData.showOwner && this._roomData.ownerName !== '' && this._roomData.ownerName !== '-';
        Util.layoutChildrenInArea(ownerCont as IWindowContainer, 1000, 10, 2);
    }

    private refreshRoomSettings(): void
    {
        if(!this._details || !this._roomData) return;

        const settingsCont = this._details.findChildByName('roomsettings_cont');

        if(!settingsCont) return;

        settingsCont.procedure = this.onRoomSettings;
        settingsCont.visible = true;
        Util.layoutChildrenInArea(settingsCont as IWindowContainer, 1000, 10, 2);
    }

    private refreshExtraCont(): void
    {
        if(!this._details || !this._roomData) return;

        const extraCont = this._details.findChildByName('extra_cont') as IWindowContainer | null;

        if(!extraCont) return;

        Util.hideChildren(extraCont);
        this._tagRenderer.refreshTags(extraCont, this._roomData.tags);

        if(this._roomData.score > 0)
        {
            this.refreshTextWithCaption('rating', extraCont, '' + this._roomData.score);

            const ratingCont = extraCont.findChildByName('rating_cont');

            if(ratingCont)
            {
                ratingCont.visible = true;
            }
        }

        if(Util.hasVisibleChildren(extraCont))
        {
            Util.moveChildrenToColumn(extraCont, ['tags', 'startedat_cont', 'rating_cont'], 0, 3);
            extraCont.height = Util.getLowestPoint(extraCont) + 4;
            extraCont.visible = true;
        }
    }

    private refreshEventInfo(roomData: GuestRoomData): void
    {
        if(!this._details) return;

        if(!roomData.roomAdName || roomData.roomAdName.length === 0) return;

        const eventCont = this._details.findChildByName('eventinfo_cont') as IWindowContainer | null;

        if(!eventCont) return;

        Util.hideChildren(eventCont);

        const eventName = eventCont.findChildByName('eventinfo_name') as ITextWindow | null;
        const eventDesc = eventCont.findChildByName('eventinfo_desc') as ITextWindow | null;
        const eventExpiry = eventCont.findChildByName('eventinfo_expirationtime') as ITextWindow | null;
        const eventCaption = eventCont.findChildByName('eventinfo.caption') as ITextWindow | null;

        if(eventName) eventName.caption = roomData.roomAdName;
        if(eventDesc)
        {
            eventDesc.caption = roomData.roomAdDescription || '';
            eventDesc.height = eventDesc.textHeight + 10;

            if(eventExpiry)
            {
                eventExpiry.caption = '' + (roomData.roomAdExpiresInMin || 0) * 60;
                eventExpiry.y = eventDesc.y + eventDesc.height;
            }

            eventCont.height = (eventName?.height || 0) + eventDesc.height + (eventExpiry?.height || 0) + 20;
        }

        const childContainer = eventCont.findChildByName('eventinfo_child_container') as IWindowContainer | null;

        if(childContainer && eventCaption)
        {
            childContainer.x = eventCaption.textWidth + 5;
            childContainer.height = Util.getLowestPoint(childContainer) + 5;
            childContainer.visible = true;
        }

        eventCont.visible = true;
        if(eventCaption) eventCaption.visible = true;
    }

    private refreshRoomName(container: IWindowContainer, roomData: GuestRoomData): void
    {
        const nameText = container.getChildByName('roomname') as ITextWindow | null;

        if(nameText)
        {
            nameText.visible = true;
            nameText.text = roomData.roomName;
            nameText.height = nameText.textHeight + 3;
        }
    }

    private refreshRoomDesc(container: IWindowContainer, roomData: GuestRoomData): void
    {
        if(roomData.description === '') return;

        const descText = container.getChildByName('roomdesc') as ITextWindow | null;

        if(descText)
        {
            descText.text = roomData.description;
            descText.height = descText.textHeight + 10;
            descText.y = Util.getLowestPoint(container);
            descText.visible = true;
        }
    }

    private refreshTextWithCaption(name: string, container: IWindowContainer, text: string): void
    {
        const cont = container.findChildByName(name + '_cont') as IWindowContainer | null;

        if(!cont) return;

        cont.visible = true;

        const textWindow = cont.getChildByName(name) as ITextWindow | null;
        const captionWindow = cont.getChildByName(name + '.caption') as ITextWindow | null;

        if(textWindow)
        {
            textWindow.text = text;
        }

        if(captionWindow)
        {
            Util.moveChildrenToRow(cont, [name + '.caption', name], captionWindow.x, 0, 2);
        }
    }

    private refreshInfo(container: IWindowContainer, name: string, show: boolean): void
    {
        if(!show) return;

        const infoWindow = container.findChildByName(name) as IWindowContainer | null;

        if(infoWindow)
        {
            infoWindow.visible = true;
            this._transitionalNavigator.refreshButton(infoWindow, name, true, () =>
            {
            }, 0);
        }
    }

    private getRoomCtg(categoryId: number): string
    {
        for(const category of this._transitionalNavigator.data.allCategories)
        {
            if(category.nodeId === categoryId)
            {
                return category.nodeName;
            }
        }

        return '';
    }

    private onOwnerName = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type === 'WME_CLICK' && this._roomData)
        {
            this._transitionalNavigator.trackGoogle('extendedProfile', 'navigator_roomPopup');
            this.hideInstantly();
        }
    };

    private onRoomSettings = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type === 'WME_CLICK' && this._roomData)
        {
            this._transitionalNavigator.trackGoogle('roomInfo', 'editRoomSettings');

            if(this._transitionalNavigator.roomSettingsCtrl)
            {
                this._transitionalNavigator.roomSettingsCtrl.startRoomSettingsEditFromNavigator(this._roomData.flatId, this._roomData.habboGroupId);
            }

            this.hideInstantly();
        }
    };
}
