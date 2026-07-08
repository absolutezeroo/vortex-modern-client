import type {IWindow} from '@core/window/IWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {ILandingViewWidget} from '../interfaces/ILandingViewWidget';
import type {HabboLandingView} from '../HabboLandingView';
import type {UserObjectMessageParser} from '@habbo/communication/messages/parser/handshake/UserObjectMessageParser';
import type {UserChangeMessageEventParser} from '@habbo/communication/messages/parser/room/action/UserChangeMessageEventParser';
import type {AvatarImageWidget as GenericAvatarImageWidget} from '@habbo/window/widgets/AvatarImageWidget';
import {UserObjectMessageEvent} from '@habbo/communication/messages/incoming/handshake/UserObjectMessageEvent';
import {UserChangeMessageEvent} from '@habbo/communication/messages/incoming/room/action/UserChangeMessageEvent';
import type {AvatarUpdateEvent} from '@habbo/avatar/events/AvatarUpdateEvent';

/**
 * Renders the logged-in user's own avatar in a landing view slot. Refreshes
 * on login (`UserObjectMessageEvent`), figure change (`UserChangeMessageEvent`
 * with id `-1`, i.e. self), and live avatar-editor updates.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/AvatarImageWidget.as
 */
export class AvatarImageWidget implements ILandingViewWidget
{
    private _landingView: HabboLandingView | null;
    private _container: IWidgetWindow | null = null;
    private _userObjectEvent: UserObjectMessageEvent | null;
    private _userChangeEvent: UserChangeMessageEvent | null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/AvatarImageWidget.as::AvatarImageWidget()
    constructor(landingView: HabboLandingView)
    {
        this._landingView = landingView;
        this._userObjectEvent = new UserObjectMessageEvent(this.onUserObject);
        this._userChangeEvent = new UserChangeMessageEvent(this.onUserChange);

        landingView.communicationManager?.addHabboConnectionMessageEvent(this._userObjectEvent);
        landingView.communicationManager?.addHabboConnectionMessageEvent(this._userChangeEvent);

        // TODO(AS3): `landingView.avatarEditor` has no ported manager yet (see
        // HabboLandingView.ts::avatarEditor TODO) - AS3 listens for
        // AVATAR_FIGURE_UPDATED on it here. Nothing in the engine currently
        // emits that event, so this is a harmless no-op until HabboAvatarEditor
        // is implemented; guarded structurally rather than assuming a shape.
        const avatarEditor = landingView.avatarEditor as {events?: {on?: (type: string, cb: (e: AvatarUpdateEvent) => void) => void}} | null;

        avatarEditor?.events?.on?.('AVATAR_FIGURE_UPDATED', this.onAvatarFigureUpdated);
    }

    get container(): IWindow | null
    {
        return this._container;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/AvatarImageWidget.as::dispose()
    dispose(): void
    {
        if(this._userObjectEvent)
        {
            this._landingView?.communicationManager?.removeHabboConnectionMessageEvent(this._userObjectEvent);
            this._userObjectEvent = null;
        }

        if(this._userChangeEvent)
        {
            this._landingView?.communicationManager?.removeHabboConnectionMessageEvent(this._userChangeEvent);
            this._userChangeEvent = null;
        }

        this._landingView = null;
        this._container = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/AvatarImageWidget.as::initialize()
    initialize(): void
    {
        this._container = this._landingView!.getXmlWindow('avatar_image') as IWidgetWindow | null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/AvatarImageWidget.as::refresh()
    refresh(): void
    {
        this.refreshAvatarInfo();
    }

    get disposed(): boolean
    {
        return this._landingView === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/AvatarImageWidget.as::onUserObject()
    private onUserObject = (event: IMessageEvent): void =>
    {
        const parser = event.parser as UserObjectMessageParser | null;

        if(parser) this.refreshAvatarInfo(parser.figure);
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/AvatarImageWidget.as::onUserChange()
    private onUserChange = (event: IMessageEvent): void =>
    {
        const parser = event.parser as UserChangeMessageEventParser | null;

        if(!parser) return;

        if(parser.id === -1)
        {
            this.refreshAvatarInfo(parser.figure);
        }
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/AvatarImageWidget.as::onAvatarFigureUpdated()
    private onAvatarFigureUpdated = (event: AvatarUpdateEvent): void =>
    {
        this.refreshAvatarInfo(event.figure);
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/AvatarImageWidget.as::refreshAvatarInfo()
    private refreshAvatarInfo(figure: string | null = null): void
    {
        if(!figure && this._landingView?.sessionData)
        {
            figure = this._landingView.sessionData.figure;
        }

        if(!this._container || !figure) return;

        const widget = this._container.widget as GenericAvatarImageWidget | null;

        if(widget) widget.figure = figure;
    }
}
