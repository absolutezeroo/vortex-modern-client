import type {IWindow} from '@core/window/IWindow';
import type {HabboLandingView} from '../../HabboLandingView';
import type {GenericWidget} from '../GenericWidget';
import {ButtonElementHandler} from './ButtonElementHandler';
import {GetIsUserPartOfCompetitionMessageComposer} from '@habbo/communication/messages/outgoing/competition/GetIsUserPartOfCompetitionMessageComposer';
import {ForwardToASubmittableRoomMessageComposer} from '@habbo/communication/messages/outgoing/competition/ForwardToASubmittableRoomMessageComposer';
import {IsUserPartOfCompetitionMessageEvent} from '@habbo/communication/messages/incoming/competition/IsUserPartOfCompetitionMessageEvent';
import type {IsUserPartOfCompetitionMessageEventParser} from '@habbo/communication/messages/parser/competition/IsUserPartOfCompetitionMessageEventParser';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';

/**
 * Button that either submits the user's current room to a competition, or -
 * if already submitted - forwards them back into it.
 *
 * AS3 identifier recovered from sources/win63_version/habbo/friendbar/landingview/widget/elements/class_4150.as
 * (obfuscated as `_SafeCls_4528` in the primary source).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4528.as
 */
export class SubmitCompetitionRoomElementHandler extends ButtonElementHandler
{
    private _submittedKey: string = '';
    private _goalCode: string = '';
    private _isPartOf: boolean = false;
    private _targetId: number = 0;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4528.as::initialize()
    override initialize(landingView: HabboLandingView, window: IWindow, params: string[], ownerWidget: GenericWidget): void
    {
        super.initialize(landingView, window, params, ownerWidget);

        this._submittedKey = params[2];
        this._goalCode = params[3];

        landingView.communicationManager?.addHabboConnectionMessageEvent(new IsUserPartOfCompetitionMessageEvent(this.onInfo));
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4528.as::refresh()
    override refresh(): void
    {
        super.refresh();
        this.landingView?.send(new GetIsUserPartOfCompetitionMessageComposer(this._goalCode));
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/elements/_SafeCls_4528.as::onClick()
    protected override onClick(): void
    {
        this.landingView?.questEngine?.reenableRoomCompetitionWindow();

        if(this._isPartOf)
        {
            this.landingView?.navigator?.goToPrivateRoom(this._targetId);
            this.landingView?.tracking?.trackGoogle('landingView', 'click_submittedroom');
        }
        else
        {
            this.landingView?.send(new ForwardToASubmittableRoomMessageComposer());
            this.landingView?.tracking?.trackGoogle('landingView', 'click_startsubmit');
        }
    }

    private onInfo = (event: IMessageEvent): void =>
    {
        const parser = event.parser as IsUserPartOfCompetitionMessageEventParser | null;

        if(!parser) return;

        this._isPartOf = parser.isPartOf;
        this._targetId = parser.targetId;

        if(this._isPartOf && this.window)
        {
            this.window.caption = '${' + this._submittedKey + '}';
        }
    };
}
