/**
 * AvatarContextInfoButtonView — a ButtonMenuView carrying avatar identity
 * (userId/name/type/roomIndex). Base for OwnAvatarMenuView (which overrides
 * updateWindow to build its own `own_avatar_menu` layout).
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/avatarinfo/AvatarContextInfoButtonView.as
 */
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import {ButtonMenuView} from '../contextmenu/ButtonMenuView';
import type {IScreenRectangle} from '../contextmenu/ContextInfoView';

export class AvatarContextInfoButtonView extends ButtonMenuView
{
    protected _userId: number = 0;
    protected _userName: string = '';
    protected _userType: number = 0;
    protected _allowNameChange: boolean = false;
    protected _roomIndex: number = 0;
    protected _isBlocked: boolean = false;

    // AS3: AvatarContextInfoButtonView.as::setup()
    protected static setupButtonView(
        view: AvatarContextInfoButtonView,
        userId: number,
        userName: string,
        roomIndex: number,
        userType: number,
        allowNameChange: boolean = false,
        autoHide: boolean = false,
        blocked: boolean = false
    ): void
    {
        view._userId = userId;
        view._userName = userName;
        view._userType = userType;
        view._roomIndex = roomIndex;
        view._allowNameChange = allowNameChange;
        view._autoHideEnabled = autoHide;
        view._isBlocked = blocked;

        ButtonMenuView.setupContext(view);
    }

    // AS3: AvatarContextInfoButtonView.as::get userId()
    public get userId(): number
    {
        return this._userId;
    }

    // AS3: AvatarContextInfoButtonView.as::get userType()
    public get userType(): number
    {
        return this._userType;
    }

    // AS3: AvatarContextInfoButtonView.as::get roomIndex()
    public get roomIndex(): number
    {
        return this._roomIndex;
    }

    // AS3: AvatarContextInfoButtonView.as::get userName()
    public get userName(): string
    {
        return this._userName;
    }

    // AS3: AvatarContextInfoButtonView.as::get allowNameChange()
    public get allowNameChange(): boolean
    {
        return this._allowNameChange;
    }

    // AS3: AvatarContextInfoButtonView.as::get isBlocked()
    public get isBlocked(): boolean
    {
        return this._isBlocked;
    }

    // AS3: AvatarContextInfoButtonView.as::updateWindow() — the plain (non-own) avatar bubble.
    // OwnAvatarMenuView overrides this to build `own_avatar_menu` instead.
    protected override updateWindow(): void
    {
        if(!this._widget.assets || !this._widget.windowManager) return;

        if(!this._window)
        {
            this._window = this._widget.windowManager.buildWidgetLayout('avatar_info_widget') as IWindowContainer | null;

            if(!this._window) return;
        }

        const nameWindow = this._window.findChildByName('name') as ITextWindow | null;

        if(nameWindow)
        {
            if(this._isBlocked) nameWindow.caption = '${infostand.blocked_user}';
            else nameWindow.caption = this._userName;
        }

        this.updateRelationshipStatus();

        const changeNameContainer = this._window.findChildByName('change_name_container');

        if(changeNameContainer)
        {
            changeNameContainer.visible = this._allowNameChange;
        }

        this.activeView = this._window;
    }

    // AS3: AvatarContextInfoButtonView.as::getOffset()
    protected override getOffset(rect: IScreenRectangle): number
    {
        let offset = -(this._activeView?.height ?? 0);

        if(this._userType === 1 || this._userType === 3 || this._userType === 4)
        {
            offset += rect.height > 50 ? 25 : 0;
        }
        else
        {
            offset -= 4;
        }

        return offset;
    }

    // AS3: AvatarContextInfoButtonView.as::updateRelationshipStatus()
    // TODO(AS3): render the friend relationship badge (needs IHabboFriendList
    // status → asset uri + IStaticBitmapWrapperWindow.assetUri). Deferred.
    protected updateRelationshipStatus(): void
    {
    }
}
