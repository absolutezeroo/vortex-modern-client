import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WiredMenuController} from '../WiredMenuController';
import type {IWiredMenuTab} from './IWiredMenuTab';

/**
 * WiredMenuTabConfig — declarative descriptor for a single wired-menu tab: its id (which derives the
 * tab button, container, and title-localization key names), the tab class to instantiate, and three
 * lifecycle flags (create-immediately, reusable, enabled). createTab() constructs the concrete tab
 * from the stored class reference.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/WiredMenuTabConfig.as
 */
type WiredMenuTabConstructor = new (controller: WiredMenuController, window: IWindowContainer) => IWiredMenuTab;

export class WiredMenuTabConfig
{
    // AS3: WiredMenuTabConfig.as::_SafeStr_4872 (name derived: tab id)
    private _id: string;

    // AS3: WiredMenuTabConfig.as::_SafeStr_8424 (name derived: tab class)
    private _tabClass: WiredMenuTabConstructor;

    // AS3: WiredMenuTabConfig.as::_SafeStr_9508 (name derived: create-immediately flag)
    private _isCreateImmediately: boolean;

    // AS3: WiredMenuTabConfig.as::_SafeStr_8895 (name derived: reusable flag)
    private _isReusable: boolean;

    // AS3: WiredMenuTabConfig.as::_SafeStr_7700 (name derived: enabled flag)
    private _isEnabled: boolean;

    // AS3: WiredMenuTabConfig.as::WiredMenuTabConfig()
    constructor(id: string, tabClass: WiredMenuTabConstructor, isCreateImmediately: boolean = true, isReusable: boolean = true, isEnabled: boolean = true)
    {
        this._id = id;
        this._tabClass = tabClass;
        this._isCreateImmediately = isCreateImmediately;
        this._isReusable = isReusable;
        this._isEnabled = isEnabled;
    }

    // AS3: WiredMenuTabConfig.as::get id()
    get id(): string
    {
        return this._id;
    }

    // AS3: WiredMenuTabConfig.as::get tabButtonName()
    get tabButtonName(): string
    {
        return 'top_view_' + this._id + '_button';
    }

    // AS3: WiredMenuTabConfig.as::get containerName()
    get containerName(): string
    {
        return this._id + '_container';
    }

    // AS3: WiredMenuTabConfig.as::get titleLocalizationKey()
    get titleLocalizationKey(): string
    {
        return 'wiredmenu.' + this._id + '.title';
    }

    // AS3: WiredMenuTabConfig.as::createTab()
    createTab(controller: WiredMenuController, window: IWindowContainer): IWiredMenuTab
    {
        return new this._tabClass(controller, window);
    }

    // AS3: WiredMenuTabConfig.as::get isCreateImmediately()
    get isCreateImmediately(): boolean
    {
        return this._isCreateImmediately;
    }

    // AS3: WiredMenuTabConfig.as::get isReusable()
    get isReusable(): boolean
    {
        return this._isReusable;
    }

    // AS3: WiredMenuTabConfig.as::get isEnabled()
    get isEnabled(): boolean
    {
        return this._isEnabled;
    }
}
