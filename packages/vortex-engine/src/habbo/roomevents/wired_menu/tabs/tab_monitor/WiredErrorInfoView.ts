import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {WiredErrorData} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredErrorData';
import type {WiredMenuController} from '../../WiredMenuController';

/**
 * WiredErrorInfoView — a small popup describing a single wired error (name, category icon, localized
 * description), opened from the monitor tab's error table. Sizes itself to its contents and pins to
 * the top-left corner of the desktop.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_monitor/WiredErrorInfoView.as
 */
export class WiredErrorInfoView implements IDisposable
{
    // AS3: WiredErrorInfoView.as::_disposed
    private _disposed: boolean = false;

    // AS3: WiredErrorInfoView.as::_window
    private _window: IWindowContainer;

    // AS3: WiredErrorInfoView.as::_SafeStr_4593 (name derived: owning controller)
    private _controller: WiredMenuController;

    // AS3: WiredErrorInfoView.as::_windowManager
    private _windowManager: IHabboWindowManager;

    // AS3: WiredErrorInfoView.as::WiredErrorInfoView()
    constructor(controller: WiredMenuController)
    {
        this._controller = controller;
        this._windowManager = controller.windowManager!;
        this._window = this._windowManager.buildWidgetLayout('error_info_view_xml', 1) as unknown as IWindowContainer;
        this.closeButton.addEventListener('WME_CLICK', this._onWindowClose);
    }

    // AS3: WiredErrorInfoView.as::initialize()
    initialize(error: WiredErrorData): void
    {
        this.errorName.text = error.errorName;
        this.typeIcon.assetUri = 'icon_wired_' + error.category.toLowerCase() + '_png';
        this.errorText.text = this._controller.localizationManager.getLocalization('wiredmenu.error_info.' + error.errorId);
        this._window.height = this.contentsContainer.height + 48;
    }

    // AS3: WiredErrorInfoView.as::show()
    show(): void
    {
        this._window.x = Math.max(this._window.x, 0);
        this._window.y = Math.max(this._window.y, 0);

        if(this._windowManager != null && this._window != null && this._window.parent == null)
        {
            const desktop = this._windowManager.getDesktop(1) as unknown as IWindowContainer | null;

            if(desktop != null)
            {
                desktop.addChild(this._window);
            }
        }

        this._window.activate();
    }

    // AS3: WiredErrorInfoView.as::hide()
    private hide(): void
    {
        if(this._windowManager != null && this._window != null && this._window.parent != null)
        {
            const desktop = this._windowManager.getDesktop(1) as unknown as IWindowContainer | null;

            if(desktop != null)
            {
                desktop.removeChild(this._window);
            }
        }
    }

    // AS3: WiredErrorInfoView.as::onWindowClose()
    private _onWindowClose = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        this.hide();
    };

    // AS3: WiredErrorInfoView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this.hide();
        this._window.dispose();
        this._window = null as unknown as IWindowContainer;
        this._windowManager = null as unknown as IHabboWindowManager;
        this._controller = null as unknown as WiredMenuController;
        this._disposed = true;
    }

    // AS3: WiredErrorInfoView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: WiredErrorInfoView.as::get closeButton()
    private get closeButton(): IWindow
    {
        return this._window.findChildByName('header_button_close')!;
    }

    // AS3: WiredErrorInfoView.as::get errorName()
    private get errorName(): ITextWindow
    {
        return this._window.findChildByName('error_name') as unknown as ITextWindow;
    }

    // AS3: WiredErrorInfoView.as::get errorText()
    private get errorText(): ITextWindow
    {
        return this._window.findChildByName('error_text') as unknown as ITextWindow;
    }

    // AS3: WiredErrorInfoView.as::get contentsContainer()
    private get contentsContainer(): IWindowContainer
    {
        return this._window.findChildByName('contents') as unknown as IWindowContainer;
    }

    // AS3: WiredErrorInfoView.as::get typeIcon()
    private get typeIcon(): IStaticBitmapWrapperWindow
    {
        return this._window.findChildByName('type_icon') as unknown as IStaticBitmapWrapperWindow;
    }
}
