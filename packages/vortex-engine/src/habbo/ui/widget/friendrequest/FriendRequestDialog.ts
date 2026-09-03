import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IIconWindow} from '@core/window/components/IIconWindow';
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {BitmapDataAsset} from '@core/assets/BitmapDataAsset';
import type {IRoomEngineRectangle} from '@habbo/room/RoomEngine';
import {Logger} from '@core/utils/Logger';
import type {FriendRequestWidget} from './FriendRequestWidget';

const log = Logger.getLogger('habbo.ui.widget.friendrequest.FriendRequestDialog');

/**
 * One "X wants to be your friend" bubble, floating above the sender's avatar.
 *
 * The window is built lazily by the **first position update**, not by the constructor — a request
 * from someone who is not in the room never draws anything, and is dropped instead (`targetRect`
 * with a null rectangle calls `ignoreRequest`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/friendrequest/FriendRequestDialog.as
 */
export class FriendRequestDialog
{
    // AS3: .../widget/friendrequest/FriendRequestDialog.as::PARAM_FLAG_MOUSE_CLICK
    // Name DERIVED: AS3 calls `setParamFlag(1, true)` inline before adding a click listener.
    private static readonly PARAM_FLAG_MOUSE_CLICK: number = 1;

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::ICON_STYLE_OVER
    // Name DERIVED: AS3 swaps the profile icon between styles 22 and 21 on hover.
    private static readonly ICON_STYLE_OVER: number = 22;

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::ICON_STYLE_OUT
    private static readonly ICON_STYLE_OUT: number = 21;

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::MOVE_SNAP_DISTANCE
    // Name DERIVED: AS3 compares the distance to 5 inline. Below it the window jumps; above it,
    // it eases halfway, which is what makes the bubble trail a walking avatar.
    private static readonly MOVE_SNAP_DISTANCE: number = 5;

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::VERTICAL_OVERLAP
    // Name DERIVED: the `+ 10` that lets the bubble overlap the avatar's head slightly.
    private static readonly VERTICAL_OVERLAP: number = 10;

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::_widget
    private _widget: FriendRequestWidget | null;

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::_requestId
    private _requestId: number;

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::_userId
    private _userId: number;

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::_userName
    private _userName: string;

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::_isOver
    // Name DERIVED (`_SafeStr_4722`): the bubble freezes in place while the pointer is on it, so
    // it cannot walk out from under a click.
    private _isOver: boolean = false;

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::_isDown
    // Name DERIVED (`_SafeStr_8236`): same freeze while a button is held.
    private _isDown: boolean = false;

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::_needsReactivate
    // Name DERIVED (`_SafeStr_7974`): raised when the window loses focus, so the next position
    // update re-activates it rather than leaving it behind another window.
    private _needsReactivate: boolean = false;

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::FriendRequestDialog()
    // Builds nothing — see the class note.
    constructor(widget: FriendRequestWidget, requestId: number, userId: number, userName: string)
    {
        this._widget = widget;
        this._requestId = requestId;
        this._userId = userId;
        this._userName = userName;
    }

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    /**
     * Paints one named asset onto a bitmap window, at the window's size and at (0,0).
     *
     * Unlike `ContextInfoView`'s two-argument sibling this one never centres: AS3 allocates a
     * bitmap the size of the target and `draw()`s the asset straight into its corner, so an
     * asset smaller than the window sits top-left, not in the middle.
     *
     * Dead in AS3 itself — a repo-wide grep finds no caller for this class's copy, only for
     * ContextInfoView's differently-signed one — but it is a real member of the class, so it is
     * ported rather than left as a hole.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/friendrequest/FriendRequestDialog.as::setImageAsset()
    setImageAsset(target: IWindow | null, assetName: string): void
    {
        if(!target || !this._widget?.assets) return;

        const asset = this._widget.assets.getAssetByName(assetName) as BitmapDataAsset | null;
        const content = asset?.content as ImageBitmap | null;

        if(!content) return;

        const bitmapTarget = target as IWindow & { bitmap: ImageBitmap | null };

        bitmapTarget.bitmap?.close();

        const canvas = new OffscreenCanvas(Math.max(1, target.width), Math.max(1, target.height));
        const ctx = canvas.getContext('2d');

        if(ctx === null) return;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(content, 0, 0);

        bitmapTarget.bitmap = canvas.transferToImageBitmap();
    }

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::show()
    show(): void
    {
        if(this._window === null) return;

        this._window.visible = true;
        this._window.activate();
    }

    /**
     * Where the sender is on screen, once per frame. A null rectangle means the user is not in
     * the room, and the request is dropped rather than left floating.
     *
     * The easing is the only animation: on the first placement, and whenever the target has moved
     * less than 5px, the window jumps; otherwise it moves halfway there, so it trails an avatar
     * that is walking.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/friendrequest/FriendRequestDialog.as::set targetRect()
    set targetRect(rect: IRoomEngineRectangle | null)
    {
        if(rect === null)
        {
            this._widget?.ignoreRequest(this._requestId);

            return;
        }

        if(this._isOver || this._isDown) return;

        // AS3 names this "already existed"; it is false only on the frame that builds the window,
        // which is what makes the first placement a jump rather than a half-step.
        let existed = true;

        if(this._window === null)
        {
            this.createWindow();
            existed = false;
        }

        if(this._window === null) return;

        const targetX = rect.left + rect.width / 2 - this._window.width / 2;
        const targetY = rect.top - this._window.height + FriendRequestDialog.VERTICAL_OVERLAP;

        const dx = targetX - this._window.x;
        const dy = targetY - this._window.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if(existed && distance > FriendRequestDialog.MOVE_SNAP_DISTANCE)
        {
            this._window.x = this._window.x + dx * 0.5;
            this._window.y = this._window.y + dy * 0.5;
        }
        else
        {
            this._window.x = targetX;
            this._window.y = targetY;
        }

        if(!this._window.visible) this.show();

        if(this._needsReactivate)
        {
            this.show();
            this._needsReactivate = false;
        }
    }

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::dispose()
    // The widget reference is cleared *before* the window, as in AS3.
    dispose(): void
    {
        this._widget = null;

        if(this._window !== null) this._window.dispose();

        this._window = null;
    }

    /**
     * Built on layer 0 — behind the ordinary windows, because it belongs to the room rather than
     * to the UI. It starts invisible; the position update that built it is what shows it.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/friendrequest/FriendRequestDialog.as::createWindow()
    private createWindow(): void
    {
        const widget = this._widget;

        if(widget === null) return;

        this._window = widget.windowManager.buildWidgetLayout('instant_friend_request', 0) as IWindowContainer | null;

        if(this._window === null || this._window === undefined)
        {
            log.warn('instant_friend_request did not build — the friend request cannot be shown');
            this._window = null;

            return;
        }

        this._window.addEventListener('WE_DEACTIVATED', this.onDeactivated);

        // Typed as the interactive window rather than IWindow: the tooltip pair lives there,
        // as it does on AS3's IRegionWindow.
        const profileRegion = this._window.findChildByName('profile_region') as IInteractiveWindow | null;

        if(profileRegion !== null && profileRegion !== undefined)
        {
            profileRegion.procedure = this.onProfile;
            profileRegion.toolTipCaption = widget.localizations?.getLocalization('infostand.profile.link.tooltip', '') ?? '';
            profileRegion.toolTipDelay = 100;
        }

        const text = this._window.findChildByName('text') as ITextWindow | null;

        if(text !== null && text !== undefined)
        {
            text.text = widget.localizations?.registerParameter('widget.friendrequest.from', 'username', this._userName) ?? '';
        }

        this.addMouseClickListener(this._window.findChildByName('accept_button'), this.onAccept);
        this.addMouseClickListener(this._window.findChildByName('decline_button'), this.onDecline);
        this.addMouseClickListener(this._window.findChildByName('close_button'), this.onClose);

        // AS3 does not null-check this one and would throw on a layout without the icon.
        const profileIcon = this._window.findChildByName('profile_icon') as IIconWindow | null;

        if(profileIcon !== null && profileIcon !== undefined) profileIcon.procedure = this.onProfileIcon;

        this._window.procedure = this.windowEventHandler;
        this._window.visible = false;
    }

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::addMouseClickListener()
    // The param flag is what makes the child take the click rather than pass it to the window.
    private addMouseClickListener(window: IWindow | null, handler: () => void): void
    {
        if(window === null) return;

        window.setParamFlag(FriendRequestDialog.PARAM_FLAG_MOUSE_CLICK, true);
        window.addEventListener('WME_CLICK', handler);
    }

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::windowEventHandler()
    // Tracks hover and press only, to freeze the bubble under the pointer.
    private windowEventHandler = (event: {type: string}): void =>
    {
        switch(event.type)
        {
            case 'WME_OVER':
                this._isOver = true;
                break;

            case 'WME_OUT':
                this._isOver = false;
                break;

            case 'WME_DOWN':
                this._isDown = true;
                break;

            case 'WME_UP':
            case 'WME_UP_OUTSIDE':
                this._isDown = false;
                break;
        }
    };

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::onDeactivated()
    private onDeactivated = (): void =>
    {
        this._needsReactivate = true;
    };

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::onClose()
    // Closing is not declining — it drops the bubble and tells the server nothing.
    private onClose = (): void =>
    {
        this._widget?.ignoreRequest(this._requestId);
    };

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::onAccept()
    private onAccept = (): void =>
    {
        this._widget?.acceptRequest(this._requestId);
    };

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::onDecline()
    private onDecline = (): void =>
    {
        this._widget?.declineRequest(this._requestId);
    };

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::onProfile()
    // The name underlines on hover; the click reports which half was used, so the two call sites
    // are distinguishable in tracking.
    private onProfile = (event: {type: string}): void =>
    {
        if(event.type === 'WME_CLICK') this._widget?.showProfile(this._userId, 'instantFriendRequest_name');

        if(event.type === 'WME_OVER' || event.type === 'WME_OUT')
        {
            const text = this._window?.findChildByName('text') as ITextWindow | null;

            if(text !== null && text !== undefined) text.underline = event.type === 'WME_OVER';
        }
    };

    // AS3: .../widget/friendrequest/FriendRequestDialog.as::onProfileIcon()
    private onProfileIcon = (event: {type: string}): void =>
    {
        if(event.type === 'WME_CLICK') this._widget?.showProfile(this._userId, 'instantFriendRequest_icon');

        if(event.type === 'WME_OVER' || event.type === 'WME_OUT')
        {
            const icon = this._window?.findChildByName('profile_icon') as IIconWindow | null;

            if(icon === null || icon === undefined) return;

            icon.style = event.type === 'WME_OVER'
                ? FriendRequestDialog.ICON_STYLE_OVER
                : FriendRequestDialog.ICON_STYLE_OUT;
            icon.invalidate();
        }
    };
}
