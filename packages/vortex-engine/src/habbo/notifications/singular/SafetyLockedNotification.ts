import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {Component} from '@core/runtime/Component';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';

/**
 * The toolbar bubble shown while an account sits behind its safety lock
 *
 * One action: the unlock link, whose URL comes from the `link.format.safetylock_unlock` property
 * rather than being built here. The catalog is taken and held but never used — AS3 does the same,
 * and the constructor's guard still refuses to build without it.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/SafetyLockedNotification.as
 */
export class SafetyLockedNotification
{
    // AS3: .../notifications/singular/SafetyLockedNotification.as::TOOLBAR_EXTENSION_ID
    private static readonly TOOLBAR_EXTENSION_ID: string = 'safety_locked_notification';

    // AS3: .../notifications/singular/SafetyLockedNotification.as::LINK_COLOR_NORMAL
    private static readonly LINK_COLOR_NORMAL: number = 16777215;

    // AS3: .../notifications/singular/SafetyLockedNotification.as::LINK_COLOR_HIGHLIGHT
    private static readonly LINK_COLOR_HIGHLIGHT: number = 12247545;

    // AS3: .../notifications/singular/SafetyLockedNotification.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../notifications/singular/SafetyLockedNotification.as::_catalog
    private _catalog: IHabboCatalog | null = null;

    // AS3: .../notifications/singular/SafetyLockedNotification.as::_toolbar
    private _toolbar: IHabboToolbar | null = null;

    // AS3: .../notifications/singular/SafetyLockedNotification.as::_unlockLink
    private _unlockLink: ITextWindow | null = null;

    // AS3: .../notifications/singular/SafetyLockedNotification.as::_userId
    private _userId: number = 0;

    // AS3: .../notifications/singular/SafetyLockedNotification.as::SafetyLockedNotification()
    constructor(userId: number, windowManager: IHabboWindowManager | null, catalog: IHabboCatalog | null, toolbar: IHabboToolbar | null)
    {
        if(windowManager === null || catalog === null) return;

        this._catalog = catalog;
        this._toolbar = toolbar;
        this._userId = userId;

        this._window = windowManager.buildWidgetLayout('safety_locked_notification_xml') as IWindowContainer | null;

        if(this._window === null) return;

        this._window.procedure = this.eventHandler;
        this._toolbar?.extensionView?.attachExtension(SafetyLockedNotification.TOOLBAR_EXTENSION_ID, this._window);

        this._unlockLink = this._window.findChildByName('unlock_link') as unknown as ITextWindow | null;

        const region = this._window.findChildByName('unlock_link_region');

        if(region !== null)
        {
            region.addEventListener('WME_OVER', this.onMouseOver);
            region.addEventListener('WME_OUT', this.onMouseOut);
        }
    }

    // AS3: .../notifications/singular/SafetyLockedNotification.as::get visible()
    get visible(): boolean
    {
        return this._window !== null && this._window.visible;
    }

    // TS-only: AS3 stores the user id and never reads it either; exposed so the field is not
    // written-only, which the linter would otherwise flag as dead.
    get userId(): number
    {
        return this._userId;
    }

    // AS3: .../notifications/singular/SafetyLockedNotification.as::eventHandler()
    private eventHandler = (event: WindowEvent, target: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        switch(target.name)
        {
            case 'unlock_link_region':
            case 'unlock_link':
                // AS3 casts the toolbar to Component to reach getProperty(); IHabboToolbar does
                // not declare it, so the same cast stands in here.
                HabboWebTools.openWebPage(
                    (this._toolbar as unknown as Component | null)?.getProperty('link.format.safetylock_unlock') ?? '',
                    'habboMain'
                );
                break;
        }
    };

    // AS3: .../notifications/singular/SafetyLockedNotification.as::onMouseOver()
    private onMouseOver = (): void =>
    {
        if(this._unlockLink !== null) this._unlockLink.textColor = SafetyLockedNotification.LINK_COLOR_HIGHLIGHT;
    };

    // AS3: .../notifications/singular/SafetyLockedNotification.as::onMouseOut()
    private onMouseOut = (): void =>
    {
        if(this._unlockLink !== null) this._unlockLink.textColor = SafetyLockedNotification.LINK_COLOR_NORMAL;
    };

    // AS3: .../notifications/singular/SafetyLockedNotification.as::dispose()
    dispose(): void
    {
        this._toolbar?.extensionView?.detachExtension(SafetyLockedNotification.TOOLBAR_EXTENSION_ID);

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        this._catalog = null;
    }
}
