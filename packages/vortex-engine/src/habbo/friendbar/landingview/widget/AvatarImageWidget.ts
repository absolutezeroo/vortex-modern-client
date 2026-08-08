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
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/AvatarImageWidget.as
 */
export class AvatarImageWidget implements ILandingViewWidget
{
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/AvatarImageWidget.as::_landingView
    private _landingView: HabboLandingView | null;
    private _container: IWidgetWindow | null = null;
    private _userObjectEvent: UserObjectMessageEvent | null;
    private _userChangeEvent: UserChangeMessageEvent | null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/AvatarImageWidget.as::AvatarImageWidget()
    constructor(landingView: HabboLandingView)
    {
        this._landingView = landingView;
        this._userObjectEvent = new UserObjectMessageEvent(this.onUserObject);
        this._userChangeEvent = new UserChangeMessageEvent(this.onUserChange);

        landingView.communicationManager?.addHabboConnectionMessageEvent(this._userObjectEvent);
        landingView.communicationManager?.addHabboConnectionMessageEvent(this._userChangeEvent);

        // AS3: .../landingview/widget/AvatarImageWidget.as:32 — refreshes the landing-view avatar
        // when the editor saves.
        //
        // ⚠ AS3 listens for **"AVATAR_FIGURE_UPDATED"**, and `HabboAvatarEditor.saveCurrentSelection()`
        // raises `AvatarUpdateEvent`, whose type is **"AVATAR_UPDATE"**. The two strings do not
        // match in the source either, so this listener never fires in AS3 — the landing-view
        // avatar is refreshed by the figure-update *packet* instead. Kept verbatim rather than
        // "corrected": pointing it at AVATAR_UPDATE would add a redraw AS3 does not do.
        landingView.avatarEditor?.events?.on('AVATAR_FIGURE_UPDATED', this.onAvatarFigureUpdated);
    }

    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/AvatarImageWidget.as::get container()
    get container(): IWindow | null
    {
        return this._container;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/AvatarImageWidget.as::dispose()
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

        // AS3 removes the same AVATAR_FIGURE_UPDATED listener here — see the note where it is
        // attached: the string does not match what the editor raises, so neither call does
        // anything, but both are kept so the pair stays symmetric.
        this._landingView?.avatarEditor?.events?.off('AVATAR_FIGURE_UPDATED', this.onAvatarFigureUpdated);

        this._landingView = null;
        this._container = null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/AvatarImageWidget.as::initialize()
    initialize(): void
    {
        // AS3 resolves "avatar_image_xml" against the friendbar component's own asset
        // library. HabboWindowManager declares a different embed under the same name
        // (see habbo/window/widgets/AvatarImageWidget.ts), so the qualified, disambiguated
        // asset name has to be used directly here - HabboLandingView.getXmlWindow()'s bare
        // "avatar_image" resolves to the unqualified "avatar_image_xml" key, which no longer
        // exists once the two same-named embeds were split apart, and the widget placeholder
        // (widget_placeholder_avatarimage) never gets replaced.
        this._container = (this._landingView!.windowManager?.buildWidgetLayout('HabboFriendBar_avatar_image_xml') ?? null) as IWidgetWindow | null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/AvatarImageWidget.as::refresh()
    refresh(): void
    {
        this.refreshAvatarInfo();
    }

    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/AvatarImageWidget.as::get disposed()
    get disposed(): boolean
    {
        return this._landingView === null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/AvatarImageWidget.as::onUserObject()
    private onUserObject = (event: IMessageEvent): void =>
    {
        const parser = event.parser as UserObjectMessageParser | null;

        if(parser) this.refreshAvatarInfo(parser.figure);
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/AvatarImageWidget.as::onUserChange()
    private onUserChange = (event: IMessageEvent): void =>
    {
        const parser = event.parser as UserChangeMessageEventParser | null;

        if(!parser) return;

        if(parser.id === -1)
        {
            this.refreshAvatarInfo(parser.figure);
        }
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/AvatarImageWidget.as::onAvatarFigureUpdated()
    private onAvatarFigureUpdated = (event: AvatarUpdateEvent): void =>
    {
        this.refreshAvatarInfo(event.figure);
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/AvatarImageWidget.as::refreshAvatarInfo()
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
