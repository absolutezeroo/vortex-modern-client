import type {ILandingViewWidget} from '../interfaces/ILandingViewWidget';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IAvatarImageWidget} from '@habbo/window/widgets/IAvatarImageWidget';
import type {HabboLandingView} from '../HabboLandingView';
import type {HallOfFameEntryData} from '@habbo/communication/messages/parser/quest/HallOfFameEntryData';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {GetExtendedProfileMessageComposer} from '@habbo/communication/messages/outgoing/users/GetExtendedProfileMessageComposer';

/**
 * Base class for avatar-row leaderboard widgets in the landing view.
 * Renders up to 10 avatar entries with per-slot vertical offset/direction
 * variation, a hover popup, and an extended-profile lookup on click.
 * Subclasses supply the actual `users` data and popup content.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as
 */
export class UserListWidget implements ILandingViewWidget
{
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::_landingView
    protected _landingView: HabboLandingView | null;
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::_container
    private _container: IWindowContainer | null = null;
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::_popup
    private _popup: IWindowContainer | null = null;
    private _startOffset: number = 150;
    private _avatarOffsetsY: number[] = [0, 10, 5, 0, 5, 10, 0, 10, 5, 10];
    private _avatarContainerWidths: number[] = [];
    private _avatarDirections: number[] = [2, 4, 2, 2, 4, 2, 2, 2, 4, 2];

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::UserListWidget()
    constructor(landingView: HabboLandingView)
    {
        this._landingView = landingView;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::get container()
    get container(): IWindow | null
    {
        return this._container;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::dispose()
    dispose(): void
    {
        this._landingView = null;
        this._container = null;

        if(this._popup)
        {
            this._popup.dispose();
            this._popup = null;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::initialize()
    initialize(): void
    {
        this._container = this._landingView!.getXmlWindow('user_list') as IWindowContainer | null;
        this.registerMessageListeners();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::refresh()
    refresh(): void
    {
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::get disposed()
    get disposed(): boolean
    {
        return this._landingView === null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::refreshContent()
    refreshContent(): void
    {
        if(!this._container) return;

        if(this.users === null)
        {
            this._container.visible = false;
            return;
        }

        this._container.visible = true;
        this.refreshList();
        this.backToDefaultPopup();
    }

    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::refreshList()
    private refreshList(): void
    {
        if(!this._container) return;

        let x = this._startOffset;

        for(let i = 0; i < 10; i++)
        {
            let entryContainer = this.getAvatarContainer(i);

            if(!entryContainer)
            {
                entryContainer = this.createAvatarContainer(i);
                this._container.addChild(entryContainer);
                entryContainer.x = x;
                x += entryContainer.width;
            }

            const entry = this.users?.[i] ?? null;

            entryContainer.visible = entry !== null;

            if(entry)
            {
                const avatarWidgetWindow = entryContainer.findChildByName('avatar_image_widget') as IWidgetWindow | null;
                const avatarWidget = (avatarWidgetWindow?.widget ?? null) as IAvatarImageWidget | null;

                if(avatarWidget)
                {
                    avatarWidget.figure = entry.figure;
                }
            }
        }
    }

    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::getAvatarContainer()
    private getAvatarContainer(index: number): IWindowContainer | null
    {
        return this._container?.getChildByID(index) as IWindowContainer | null ?? null;
    }

    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::createAvatarContainer()
    private createAvatarContainer(index: number): IWindowContainer
    {
        const entryContainer = this._landingView!.getXmlWindow('user_entry') as IWindowContainer;

        this.setupVariation(entryContainer, index);
        entryContainer.procedure = this.onEntry;
        entryContainer.id = index;

        if(this._avatarContainerWidths.length > index)
        {
            entryContainer.width = this._avatarContainerWidths[index];
        }

        const extraLinkRegion = entryContainer.findChildByName('extra_link_region');

        if(extraLinkRegion)
        {
            extraLinkRegion.visible = this.hasExtraLink();
            extraLinkRegion.procedure = this.onExtraLink;
            extraLinkRegion.id = index;
        }

        return entryContainer;
    }

    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::setupVariation()
    private setupVariation(entryContainer: IWindowContainer, index: number): void
    {
        const avatarWidgetWindow = entryContainer.findChildByName('avatar_image_widget') as IWidgetWindow | null;
        const avatarWidget = (avatarWidgetWindow?.widget ?? null) as IAvatarImageWidget | null;
        const offsetY = this._avatarOffsetsY[index];

        entryContainer.y += offsetY + 70;

        if(offsetY < 0)
        {
            entryContainer.height += -offsetY;
        }

        if(avatarWidget)
        {
            avatarWidget.direction = this._avatarDirections[index];
        }

        const extraLinkRegion = entryContainer.findChildByName('extra_link_region');

        if(extraLinkRegion)
        {
            extraLinkRegion.y = extraLinkRegion.y - offsetY;
        }
    }

    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::getEntry()
    private getEntry(window: IWindow): HallOfFameEntryData | null
    {
        return this.users?.[window.id] ?? null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::onEntry()
    private onEntry = (event: WindowEvent, window: IWindow): void =>
    {
        const entry = this.getEntry(window);

        if(!entry) return;

        if(event.type === WindowMouseEvent.CLICK)
        {
            this._landingView?.send(new GetExtendedProfileMessageComposer(entry.userId));
        }
        else if(event.type === WindowMouseEvent.OVER)
        {
            this.showPopup(entry, window);
        }
        else if(event.type === WindowMouseEvent.OUT)
        {
            this.backToDefaultPopup();
        }
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::onExtraLink()
    private onExtraLink = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type === WindowMouseEvent.CLICK)
        {
            const entry = this.getEntry(window);

            if(!entry) return;

            this.extraLinkClicked(entry);
        }
        else if(window.parent)
        {
            this.onEntry(event, window.parent);
        }
    };

    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::showPopup()
    private showPopup(entry: HallOfFameEntryData, anchor: IWindow): void
    {
        if(!this._container) return;

        if(!this._popup)
        {
            const popupXml = this.getPopupXml();

            if(!popupXml) return;

            this._popup = this._landingView!.getXmlWindow(popupXml) as IWindowContainer | null;

            if(!this._popup) return;

            this._container.addChild(this._popup);
        }

        this.refreshPopup(entry, this._popup);
        this._popup.y = Math.max(0, 79 - this._popup.height);
        this._popup.x = anchor.x + (anchor.width - this._popup.width) / 2;
        this._popup.visible = true;
    }

    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::backToDefaultPopup()
    private backToDefaultPopup(): void
    {
        if(!this._container) return;

        const users = this.users;

        if(users && users.length > 0)
        {
            const firstEntryContainer = this._container.getChildByID(0);

            if(firstEntryContainer)
            {
                this.showPopup(users[0], firstEntryContainer);
            }
        }
        else if(this._popup)
        {
            this._popup.visible = false;
        }
    }

    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::get landingView()
    protected get landingView(): HabboLandingView | null
    {
        return this._landingView;
    }

    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::getText()
    protected getText(key: string): string
    {
        return '${' + key + '}';
    }

    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::registerMessageListeners()
    protected registerMessageListeners(): void
    {
    }

    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::get users()
    protected get users(): HallOfFameEntryData[] | null
    {
        return null;
    }

    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::refreshPopup()
    protected refreshPopup(_entry: HallOfFameEntryData, _popup: IWindowContainer): void
    {
    }

    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::getPopupXml()
    protected getPopupXml(): string | null
    {
        return null;
    }

    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::hasExtraLink()
    protected hasExtraLink(): boolean
    {
        return false;
    }

    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::extraLinkClicked()
    protected extraLinkClicked(_entry: HallOfFameEntryData): void
    {
    }

    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::set avatarOffsetsY()
    protected set avatarOffsetsY(value: number[])
    {
        this._avatarOffsetsY = value;
    }

    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::set avatarContainerWidths()
    protected set avatarContainerWidths(value: number[])
    {
        this._avatarContainerWidths = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/UserListWidget.as::set startOffset()
    set startOffset(value: number)
    {
        this._startOffset = value;
    }
}
