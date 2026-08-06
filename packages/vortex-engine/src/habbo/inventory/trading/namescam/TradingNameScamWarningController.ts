import type {IDisposable} from '@core/runtime/IDisposable';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IAssetLibrary} from '@core/assets';
import {
    GetExtendedProfileMessageComposer
} from '@habbo/communication/messages/outgoing/users/GetExtendedProfileMessageComposer';
import {TradingNameScamWarningView} from './TradingNameScamWarningView';
import type {TradingNameScamWarningData} from './TradingNameScamWarningData';

/**
 * Owns the name-scam warning window: builds it on first use, rebuilds it if it was disposed, and
 * carries the one action it offers — opening the other trader's profile.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/namescam/TradingNameScamWarningController.as
 */
export class TradingNameScamWarningController implements IDisposable
{
    // AS3: .../TradingNameScamWarningController.as::_windowManager
    private _windowManager: IHabboWindowManager | null;

    // AS3: .../TradingNameScamWarningController.as::_assets
    private _assets: IAssetLibrary | null;

    // AS3: .../TradingNameScamWarningController.as::_localization
    private _localization: IHabboLocalizationManager | null;

    // AS3: .../TradingNameScamWarningController.as::_communication
    private _communication: IHabboCommunicationManager | null;

    // AS3: .../TradingNameScamWarningController.as::_view
    private _view: TradingNameScamWarningView | null = null;

    private _disposed: boolean = false;

    // AS3: .../TradingNameScamWarningController.as::TradingNameScamWarningController()
    constructor(
        windowManager: IHabboWindowManager | null,
        assets: IAssetLibrary | null,
        localization: IHabboLocalizationManager | null,
        communication: IHabboCommunicationManager | null
    )
    {
        this._windowManager = windowManager;
        this._assets = assets;
        this._localization = localization;
        this._communication = communication;
    }

    // AS3: .../TradingNameScamWarningController.as::show()
    // A disposed view is replaced rather than reused — the window went with it.
    show(data: TradingNameScamWarningData | null): void
    {
        if(this._disposed || data === null) return;

        if(this._view === null || this._view.disposed)
        {
            this._view = new TradingNameScamWarningView(this, this._windowManager, this._assets, this._localization);
        }

        this._view.show(data);
    }

    // AS3: .../TradingNameScamWarningController.as::hide()
    hide(): void
    {
        if(this._view !== null && !this._view.disposed)
        {
            this._view.hide();
        }
    }

    // AS3: .../TradingNameScamWarningController.as::openProfile()
    openProfile(userId: number): void
    {
        if(this._disposed || userId <= 0 || this._communication?.connection == null) return;

        this._communication.connection.send(new GetExtendedProfileMessageComposer(userId));
    }

    // AS3: .../TradingNameScamWarningController.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../TradingNameScamWarningController.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        if(this._view !== null)
        {
            this._view.dispose();
            this._view = null;
        }

        this._windowManager = null;
        this._assets = null;
        this._localization = null;
        this._communication = null;
        this._disposed = true;
    }
}
