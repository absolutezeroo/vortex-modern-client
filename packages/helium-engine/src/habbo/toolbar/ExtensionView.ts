import type {IExtensionView} from './IExtensionView';
import type {HabboToolbar} from './HabboToolbar';
import {ToolbarDisplayExtensionIds} from './ToolbarDisplayExtensionIds';
import type {IWindow} from '@core/window/IWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IHabboWindowManager} from '../window/IHabboWindowManager';
import {ExtensionViewEvent} from './events/ExtensionViewEvent';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('ExtensionView');

/**
 * Container for toolbar extensions (purse, settings, promos, etc.)
 *
 * Creates an IItemListWindow from the extension_grid layout and manages
 * extension panels added as list items. The container has params=0x40040
 * so it auto-repositions when the desktop resizes via updateScaleRelativeToParent.
 *
 * @see sources/win63_version/habbo/toolbar/ExtensionView.as
 */
// AS3: sources/win63_version/habbo/toolbar/ExtensionView.as::ExtensionView
export class ExtensionView implements IExtensionView 
{
    // AS3: sources/win63_version/habbo/toolbar/ExtensionView.as::MARGIN
    private static readonly MARGIN: number = 3;
    // AS3: sources/win63_version/habbo/toolbar/ExtensionView.as::PURSE_EXTENSION_OFFSET
    private static readonly PURSE_EXTENSION_OFFSET: number = -8;

    private _toolbar: HabboToolbar | null;
    private _var104: IItemListWindow | null = null;
    private _items: Map<string, IWindow> = new Map();
    private _orderedItems: IWindow[] = [];
    private _disposed: boolean = false;

    constructor(windowManager: IHabboWindowManager, toolbar: HabboToolbar) 
    {
        this._toolbar = toolbar;

        const container = windowManager.buildWidgetLayout('extension_grid_xml', 1);

        if(container) 
        {
            this._var104 = container as unknown as IItemListWindow;
            this._var104.clipping = false;
            const desktop = this._var104.desktop;

            if(desktop) 
            {
                this._var104.x = desktop.width - this._var104.width - ExtensionView.MARGIN - this._extraMargin;
                this._var104.y = ExtensionView.MARGIN;
                this._var104.visible = true;
            }
        }
        else 
        {
            log.error('Unable to initialize Toolbar Extension view window from xml asset');
        }
    }

    private _landingView: boolean = false;

    public get landingView(): boolean 
    {
        return this._landingView;
    }

    public set landingView(value: boolean) 
    {
        this._landingView = value;
        this.refreshItemWindow();
    }

    private _extraMargin: number = 0;

    public get extraMargin(): number 
    {
        return this._extraMargin;
    }

    public set extraMargin(value: number) 
    {
        this._extraMargin = value;

        if(this._var104) 
        {
            const desktop = this._var104.desktop;

            if(desktop) 
            {
                this._var104.x = desktop.width - this._var104.width - ExtensionView.MARGIN - this._extraMargin;
            }
        }
    }

    public get visible(): boolean 
    {
        return this._var104 !== null && this._var104.visible;
    }

    public set visible(value: boolean) 
    {
        if(this._var104) 
        {
            this._var104.visible = value;
        }
    }

    public get screenHeight(): number 
    {
        if(!this._var104) return 0;

        return this._var104.height + this._var104.y;
    }

    public attachExtension(id: string, element: unknown, index: number = -1, params: unknown[] | null = null): void 
    {
        if(this._disposed) return;

        if(this._items.has(id)) return;

        const window = element as IWindow;

        this._items.set(id, window);

        if(params !== null) 
        {
            index = this.resolveIndex(params as string[]);
        }

        if(index === -1) 
        {
            this._orderedItems.push(window);
        }
        else 
        {
            this._orderedItems.splice(index, 0, window);
        }

        if(this._var104) 
        {
            this.refreshItemWindow();
        }

        this.queueResizeEvent();
    }

    public hasExtension(id: string): boolean 
    {
        return this._items.has(id);
    }

    // AS3: sources/win63_version/habbo/toolbar/ExtensionView.as::refreshItemWindow()
    public refreshItemWindow(): void 
    {
        if(!this._var104) return;

        this._var104.removeListItems();

        for(const window of this._orderedItems) 
        {
            const key = this.getKeyForWindow(window);

            if(key.indexOf(ToolbarDisplayExtensionIds.NEW_FEATURE) === 0) 
            {
                this._var104.addListItem(window);
                continue;
            }

            switch(key) 
            {
                case 'logout_tools':
                case 'purse_credits':
                case 'purse_engagement_currency':
                case 'purse_habbo_club':
                case 'purse_seasonal_currency':
                case 'talent_promo':
                case 'club_promo':
                case 'vip_quests':
                case 'video_offers':
                case 'settings':
                case 'phone_number':
                case 'verification_code':
                case 'return_gift':
                case ToolbarDisplayExtensionIds.NEW_FEATURE:
                case 'targeted_offer':
                    this._var104.addListItem(window);
                    break;
                case 'purse':
                    this._var104.addListItem(window);
                    {
                        const targetY = ExtensionView.MARGIN + ExtensionView.PURSE_EXTENSION_OFFSET;

                        // AS3 target is -5; keep the offset calculation but avoid clipping outside the Pixi canvas.
                        this._var104.y = Math.max(0, targetY);
                    }
                    break;
                default:
                    if(!this._landingView) 
                    {
                        this._var104.addListItem(window);
                    }
            }
        }

        this._var104.arrangeListItems();
        this._var104.invalidate();
    }

    public detachExtension(id: string): void 
    {
        if(this._disposed) return;

        this._items.delete(id);
        this.queueResizeEvent();
    }

    public getIconLocation(iconId: string): { x: number; y: number; width: number; height: number } | null 
    {
        if(iconId === 'HTIE_EXT_GROUP') 
        {
            const window = this._items.get('room_group_info') ?? null;

            if(window !== null && window.visible) 
            {
                const rect = {x: 0, y: 0, width: 0, height: 0};
                window.getGlobalRectangle(rect);
                return rect;
            }
        }

        return null;
    }

    public removeDimmers(): void 
    {
        // Dimmer management is a Flash-specific concept not ported to Helium
    }

    public getOrderedExtensionIds(): string[] 
    {
        const result: string[] = [];

        for(const window of this._orderedItems) 
        {
            const key = this.getKeyForWindow(window);

            if(key !== '') result.push(key);
        }

        return result;
    }

    public dispose(): void 
    {
        if(this._disposed) return;

        const keys = Array.from(this._items.keys());

        for(const key of keys) 
        {
            this.detachExtension(key);
        }

        if(this._var104) 
        {
            (this._var104 as unknown as { dispose(): void }).dispose();
            this._var104 = null;
        }

        this._orderedItems = [];
        this._toolbar = null;
        this._items.clear();
        this._disposed = true;
    }

    private getKeyForWindow(window: IWindow): string 
    {
        for(const [key, value] of this._items) 
        {
            if(value === window) return key;
        }

        return '';
    }

    private resolveIndex(params: string[]): number 
    {
        for(let i = 0; i < this._orderedItems.length; i++) 
        {
            if(params.indexOf(this._orderedItems[i].name) > -1) 
            {
                return i;
            }
        }

        return -1;
    }

    private queueResizeEvent(): void 
    {
        setTimeout(() => 
        {
            if(this._toolbar) 
            {
                const event = new ExtensionViewEvent(ExtensionViewEvent.EXTENSION_VIEW_RESIZED);
                this._toolbar.toolbarEvents.emit(ExtensionViewEvent.EXTENSION_VIEW_RESIZED, event);
            }
        }, 25);
    }
}
