import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITabButtonWindow} from '@core/window/components/ITabButtonWindow';
import type {ITabContextWindow} from '@core/window/components/ITabContextWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';

import type {WiredMenuController} from './WiredMenuController';
import type {IWiredMenuTab} from './tabs/IWiredMenuTab';
import type {WiredMenuTabConfig} from './tabs/WiredMenuTabConfig';
import {WiredMenuTabConfigs} from './tabs/WiredMenuTabConfigs';

/**
 * WiredMenuView — the wired-menu window shell. Builds the `wired_menu_view_xml` layout, owns the six
 * tab containers and their lazy-created tab instances, and routes tab selection / show / hide. The
 * active tab is created on demand (getOrCreateTab) and disposed on deselect unless its config is
 * reusable.
 *
 * Port note: AS3 builds the window via `windowManager.buildFromXML(XML(controller.assets
 * .getAssetByName("wired_menu_view_xml").content), 1)`. In this port the wired_menu_view_xml layout is
 * registered in the window manager's widget-layout registry (it ships in vortex-client), so
 * buildWidgetLayout('wired_menu_view_xml', 1) is the exact equivalent — the same path ClubCenterView
 * uses.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/WiredMenuView.as
 */
export class WiredMenuView
{
    // AS3: WiredMenuView.as::DESKTOP_WINDOW_LAYER
    static readonly DESKTOP_WINDOW_LAYER: number = 1;

    // AS3: WiredMenuView.as::_windowManager
    private _windowManager: IHabboWindowManager;

    // AS3: WiredMenuView.as::_SafeStr_4593 (name derived: the owning controller)
    private _controller: WiredMenuController;

    // AS3: WiredMenuView.as::_window
    private _window: IWindowContainer;

    // AS3: WiredMenuView.as::_SafeStr_9480 (name derived: the tab-config registry)
    private _tabConfigs: WiredMenuTabConfigs;

    // AS3: WiredMenuView.as::_SafeStr_5769 (name derived: disposed flag)
    private _disposed: boolean = false;

    // AS3: WiredMenuView.as::_SafeStr_5431 (name derived: created tabs by id — AS3 Dictionary)
    private _tabs: Map<string, IWiredMenuTab> = new Map<string, IWiredMenuTab>();

    // AS3: WiredMenuView.as::_SafeStr_5375 (name derived: active tab id)
    private _activeTabId: string | null = null;

    // AS3: WiredMenuView.as::_SafeStr_5622 (name derived: is-viewing flag)
    private _viewing: boolean = false;

    // AS3: WiredMenuView.as::WiredMenuView()
    constructor(controller: WiredMenuController, windowManager: IHabboWindowManager)
    {
        this._controller = controller;
        this._windowManager = windowManager;
        this._tabConfigs = new WiredMenuTabConfigs(controller);
        this._window = windowManager.buildWidgetLayout('wired_menu_view_xml', 1) as unknown as IWindowContainer;
        this.closeButton.addEventListener('WME_CLICK', this._onWindowClose);
        this.discordRegion.addEventListener('WME_CLICK', this._onClickDiscord);
    }

    // AS3: WiredMenuView.as::initialize()
    initialize(): void
    {
        this.initializeTabs();
    }

    // AS3: WiredMenuView.as::show()
    show(): void
    {
        if(this._windowManager != null && this._window != null && this._window.parent == null)
        {
            const desktop = this._windowManager.getDesktop(1) as unknown as IWindowContainer | null;

            if(desktop != null)
            {
                desktop.addChild(this._window);
            }
        }

        if(!this._viewing)
        {
            this.activeTab!.startViewing();
            this._viewing = true;
        }

        this._window.activate();
    }

    // AS3: WiredMenuView.as::isShowing()
    isShowing(): boolean
    {
        return this._windowManager != null && this._window != null && this._window.parent != null;
    }

    // AS3: WiredMenuView.as::onWindowClose()
    private _onWindowClose = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        this.hide();
    };

    // AS3: WiredMenuView.as::hide()
    hide(): void
    {
        if(this.isShowing())
        {
            const desktop = this._windowManager.getDesktop(1) as unknown as IWindowContainer | null;

            if(desktop != null)
            {
                desktop.removeChild(this._window);
            }

            if(this._viewing)
            {
                this.activeTab!.stopViewing();
                this._viewing = false;
            }
        }
    }

    // AS3: WiredMenuView.as::initializeTabs()
    private initializeTabs(): void
    {
        this._tabs = new Map<string, IWiredMenuTab>();
        let firstEnabled: WiredMenuTabConfig | null = null;

        for(const config of this.tabConfigs)
        {
            if(config.isCreateImmediately)
            {
                this.getOrCreateTab(config.id);
            }

            if(firstEnabled == null && config.isEnabled)
            {
                firstEnabled = config;
            }

            const tabButton = this._window.findChildByName(config.tabButtonName) as unknown as ITabButtonWindow;
            tabButton.addEventListener('WE_SELECTED', this._onTabSelected);
            this._window.findChildByName(config.containerName)!.visible = false;
        }

        this.selectTab(firstEnabled!.id);
        this.alignTabs();
    }

    // AS3: WiredMenuView.as::selectTab()
    selectTab(id: string): void
    {
        const config = this.getTabConfigById(id);

        if(config == null || !config.isEnabled)
        {
            return;
        }

        this.tabContext.selector!.setSelected(this._window.findChildByName(config.tabButtonName) as unknown as ISelectableWindow);
    }

    // AS3: WiredMenuView.as::alignTabs()
    private alignTabs(): void
    {
        let enabledCount = 0;

        for(let i = 0; i < this.tabContext.numTabItems; i++)
        {
            const tabItem = this.tabContext.getTabItemAt(i)!;
            const config = this.getTabConfigByTabName(tabItem.name);

            if(config!.isEnabled)
            {
                enabledCount += 1;
            }
            else
            {
                tabItem.visible = false;
                tabItem.width = 0;
            }
        }

        for(let i = 0; i < this.tabContext.numTabItems; i++)
        {
            const tabItem = this.tabContext.getTabItemAt(i)!;

            if(tabItem.visible)
            {
                tabItem.width = tabItem.parent!.width / enabledCount;
            }
        }
    }

    // AS3: WiredMenuView.as::onTabSelected()
    private _onTabSelected = (event: WindowEvent): void =>
    {
        const target = event.target;
        let id: string | null = null;

        for(const config of this.tabConfigs)
        {
            if(target != null && config.tabButtonName === target.name)
            {
                id = config.id;
                break;
            }
        }

        if(id != null)
        {
            this.setActiveTab(id);
        }
    };

    // AS3: WiredMenuView.as::setActiveTab()
    private setActiveTab(id: string): void
    {
        const newConfig = this.getTabConfigById(id)!;

        if(newConfig.id === this._activeTabId)
        {
            return;
        }

        if(this._activeTabId != null)
        {
            const oldTab = this.getTabById(this._activeTabId)!;
            const oldConfig = this.getTabConfigById(this._activeTabId)!;

            if(this._viewing)
            {
                oldTab.stopViewing();
            }

            oldTab.setTabInactive();

            if(!oldConfig.isReusable)
            {
                oldTab.dispose();
                this._tabs.delete(this._activeTabId);
            }

            this._window.findChildByName(oldConfig.containerName)!.visible = false;
        }

        this._activeTabId = id;
        const newTab = this.getOrCreateTab(id);
        this._window.findChildByName(newConfig.containerName)!.visible = true;
        newTab.setTabActive();

        if(this._viewing)
        {
            newTab.startViewing();
        }

        this.headerTitle.text = this._controller.localizationManager.getLocalization(newConfig.titleLocalizationKey, newConfig.id);
    }

    // AS3: WiredMenuView.as::permissionsUpdated()
    permissionsUpdated(): void
    {
        for(const tab of this._tabs.values())
        {
            tab.permissionsUpdated();
        }
    }

    // AS3: WiredMenuView.as::get tabConfigs()
    private get tabConfigs(): WiredMenuTabConfig[]
    {
        return this._tabConfigs.menuTabs;
    }

    // AS3: WiredMenuView.as::getTabConfigById()
    private getTabConfigById(id: string): WiredMenuTabConfig | null
    {
        for(const config of this.tabConfigs)
        {
            if(config.id === id)
            {
                return config;
            }
        }

        return null;
    }

    // AS3: WiredMenuView.as::getTabConfigByTabName()
    private getTabConfigByTabName(tabButtonName: string): WiredMenuTabConfig | null
    {
        for(const config of this.tabConfigs)
        {
            if(config.tabButtonName === tabButtonName)
            {
                return config;
            }
        }

        return null;
    }

    // AS3: WiredMenuView.as::getTabById()
    private getTabById(id: string): IWiredMenuTab | null
    {
        return this._tabs.get(id) ?? null;
    }

    // AS3: WiredMenuView.as::get activeTab()
    get activeTab(): IWiredMenuTab | null
    {
        return this._activeTabId == null ? null : this.getTabById(this._activeTabId);
    }

    // AS3: WiredMenuView.as::get activeTabId()
    get activeTabId(): string | null
    {
        return this._activeTabId;
    }

    // AS3: WiredMenuView.as::getOrCreateTab()
    private getOrCreateTab(id: string): IWiredMenuTab
    {
        const config = this.getTabConfigById(id)!;
        let tab = this._tabs.get(id) ?? null;

        if(tab == null)
        {
            tab = config.createTab(this._controller, this._window.findChildByName(config.containerName) as unknown as IWindowContainer);
            this._tabs.set(id, tab);
        }

        return tab;
    }

    // AS3: WiredMenuView.as::onClickDiscord()
    private _onClickDiscord = (_event: WindowMouseEvent): void =>
    {
        HabboWebTools.openWebPageAndMinimizeClient(this._controller.getProperty('wired.discord.link'));
    };

    // AS3: WiredMenuView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this.hide();
        this.closeButton.removeEventListener('WME_CLICK', this._onWindowClose);

        for(const config of this.tabConfigs)
        {
            const tab = this.getTabById(config.id);

            if(tab != null)
            {
                if(config.id === this._activeTabId)
                {
                    if(this._viewing)
                    {
                        tab.stopViewing();
                    }

                    tab.setTabInactive();
                }

                tab.dispose();
            }

            const tabButton = this._window.findChildByName(config.tabButtonName) as unknown as ITabButtonWindow;
            tabButton.removeEventListener('WE_SELECTED', this._onTabSelected);
        }

        this._tabs = null as unknown as Map<string, IWiredMenuTab>;
        this._activeTabId = null;
        this._viewing = false;
        this._window.dispose();
        this._window = null as unknown as IWindowContainer;
        this._disposed = true;
    }

    // AS3: WiredMenuView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: WiredMenuView.as::get closeButton()
    private get closeButton(): IWindow
    {
        return this._window.findChildByName('header_button_close')!;
    }

    // AS3: WiredMenuView.as::get tabContext()
    private get tabContext(): ITabContextWindow
    {
        return this._window.findChildByName('tab_context') as unknown as ITabContextWindow;
    }

    // AS3: WiredMenuView.as::get headerTitle()
    private get headerTitle(): ITextWindow
    {
        return this._window.findChildByName('header_title') as unknown as ITextWindow;
    }

    // AS3: WiredMenuView.as::get loadingContainer()
    get loadingContainer(): IWindowContainer
    {
        return this._window.findChildByName('loading_view') as unknown as IWindowContainer;
    }

    // AS3: WiredMenuView.as::get discordRegion()
    get discordRegion(): IRegionWindow
    {
        return this._window.findChildByName('discord_region') as unknown as IRegionWindow;
    }

    // AS3: WiredMenuView.as::get window()
    get window(): IWindowContainer
    {
        return this._window;
    }
}
