/**
 * HabboEpicPopupView — the server-pushed promo image popup.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/popup/HabboEpicPopupView.as
 *
 * The whole component is one message and one layout: `EpicPopup` carries a URI, the frame carries a
 * `static_bitmap` whose `assetUri` loads it, and the close button throws the frame away. It is
 * attached from `HabboFriendBar`'s constructor like the bar's other views, and until now it was the
 * one of them nobody built — the message was registered and parsed, and its only consumer did not
 * exist, so every `EpicPopup` the server sent was decoded and dropped.
 */
import type {IContext} from '@core/runtime';
import {ComponentDependency} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IWindow} from '@core/window/IWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import {EpicPopupMessageEvent} from '@habbo/communication/messages/incoming/quest/EpicPopupMessageEvent';
import type {EpicPopupMessageParser} from '@habbo/communication/messages/parser/quest/EpicPopupMessageParser';
import {Logger} from '@core/utils/Logger';
import {AbstractView} from '../view/AbstractView';
import type {IHabboEpicPopupView} from '../IHabboEpicPopupView';

const log = Logger.getLogger('habbo.friendbar.popup.HabboEpicPopupView');

export class HabboEpicPopupView extends AbstractView implements IHabboEpicPopupView
{
    // AS3: HabboEpicPopupView.as::_communicationManager
    private _communicationManager: IHabboCommunicationManager | null = null;

    // AS3: HabboEpicPopupView.as::_activeFrame
    private _activeFrame: IFrameWindow | null = null;

    // AS3: HabboEpicPopupView.as::HabboEpicPopupView()
    constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
    {
        super(context, flags, assetLibrary);
    }

    // AS3: HabboEpicPopupView.as::get dependencies()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- variance: typed ComponentDependency<T> is contravariant in T
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return super.dependencies.concat([
            new ComponentDependency(IID_HabboCommunicationManager, (manager: IHabboCommunicationManager | null) =>
            {
                this._communicationManager = manager;
            }),
        ]);
    }

    // AS3: HabboEpicPopupView.as::initComponent()
    protected override initComponent(): void
    {
        this._communicationManager?.addHabboConnectionMessageEvent(
            new EpicPopupMessageEvent(this.onEpicPopupMessageEvent)
        );
    }

    // AS3: HabboEpicPopupView.as::onEpicPopupMessageEvent()
    private onEpicPopupMessageEvent = (event: IMessageEvent): void =>
    {
        this.showPopup((event.parser as EpicPopupMessageParser).imageUri);
    };

    // AS3: HabboEpicPopupView.as::showPopup()
    public showPopup(imageUri: string): void
    {
        if(this._activeFrame !== null)
        {
            this._activeFrame.dispose();
        }

        // AS3 reads `epic_popup_frame_xml` off its own asset library and hands it to
        // `buildFromXML()`; this port's layouts live in the window manager's map instead.
        this._activeFrame = this._windowManager?.buildWidgetLayout('epic_popup_frame_xml') as IFrameWindow | null ?? null;

        if(this._activeFrame === null)
        {
            log.warn('epic_popup_frame_xml is not in the asset library — the popup cannot be built');

            return;
        }

        const content = this._activeFrame.findChildByName('content_static_bitmap') as IStaticBitmapWrapperWindow | null;

        if(content !== null) content.assetUri = imageUri;

        this._activeFrame.procedure = this.windowProc;
        this._activeFrame.center();
    }

    // AS3: HabboEpicPopupView.as::windowProc()
    private windowProc = (event: WindowEvent, _window: IWindow): void =>
    {
        if(this._activeFrame === null || event.type !== 'WME_CLICK') return;

        switch(event.target?.name)
        {
            case 'close_button':
            case 'header_button_close':
                this._activeFrame.dispose();
                this._activeFrame = null;
        }
    };

    // AS3: HabboEpicPopupView.as::dispose()
    public override dispose(): void
    {
        if(this._activeFrame !== null)
        {
            this._activeFrame.dispose();
            this._activeFrame = null;
        }

        super.dispose();
    }
}
