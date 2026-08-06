import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ILandingViewWidget} from '../interfaces/ILandingViewWidget';
import type {ISettingsAwareWidget} from '../interfaces/ISettingsAwareWidget';
import type {HabboLandingView} from '../HabboLandingView';
import type {CommonWidgetSettings} from '../layout/CommonWidgetSettings';
import {WidgetContainerLayout} from '../layout/WidgetContainerLayout';

/**
 * Promo card forwarding into a configured room-hopper network.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/RoomHopperNetworkWidget.as
 */
export class RoomHopperNetworkWidget implements ILandingViewWidget, ISettingsAwareWidget
{
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/RoomHopperNetworkWidget.as::_landingView
    private _landingView: HabboLandingView | null;
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/RoomHopperNetworkWidget.as::_container
    private _container: IWindowContainer | null = null;
    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/RoomHopperNetworkWidget.as::_disposed
    private _disposed: boolean = false;
    private _networkId: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/RoomHopperNetworkWidget.as::RoomHopperNetworkWidget()
    constructor(landingView: HabboLandingView)
    {
        this._landingView = landingView;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/RoomHopperNetworkWidget.as::initialize()
    initialize(): void
    {
        this._container = this._landingView!.getXmlWindow('room_hopper_network') as IWindowContainer | null;
        this._networkId = this._landingView!.getInteger('landing.view.roomhopper.network.id', 0);

        const bitmap = this._container?.findChildByName('bitmap') as IStaticBitmapWrapperWindow | null;

        if(bitmap) bitmap.assetUri = this._landingView!.getProperty('landing.view.roomhopper.image.uri');

        const button = this._container?.findChildByName('button');

        if(button) button.procedure = this.onRoomForwardButton;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/RoomHopperNetworkWidget.as::refresh()
    refresh(): void
    {
    }

    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/RoomHopperNetworkWidget.as::get container()
    get container(): IWindow | null
    {
        return this._container;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/RoomHopperNetworkWidget.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        if(this._container)
        {
            this._container.dispose();
            this._container = null;
        }

        this._disposed = true;
    }

    // AS3: .../src/com/sulake/habbo/friendbar/landingview/widget/RoomHopperNetworkWidget.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/RoomHopperNetworkWidget.as::set settings()
    set settings(value: CommonWidgetSettings)
    {
        if(this._container) WidgetContainerLayout.applyCommonWidgetSettings(this._container, value);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/widget/RoomHopperNetworkWidget.as::onRoomForwardButton()
    private onRoomForwardButton = (event: WindowEvent): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this._landingView?.navigator?.goToRoomNetwork(this._networkId, false);
    };
}
