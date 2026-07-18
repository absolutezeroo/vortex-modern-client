import type {IBadgeImageWidget} from './IBadgeImageWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';
import {
    GroupDetailsChangedMessageEvent
} from '@habbo/communication/messages/incoming/users/GroupDetailsChangedMessageEvent';
import {HabboGroupBadgesMessageEvent} from '@habbo/communication/messages/incoming/users/HabboGroupBadgesMessageEvent';
import {
    GetHabboGroupDetailsMessageComposer
} from '@habbo/communication/messages/outgoing/users/GetHabboGroupDetailsMessageComposer';

/**
 * Badge image rendering widget.
 *
 * Renders a badge image (normal, group, or perk) from a badge identifier.
 * Supports group badge live-refresh via message events.
 *
 * In the AS3 version, uses IStaticBitmapWrapperWindow for rendering
 * and listens for GroupDetailsChangedMessageEvent / HabboGroupBadgesMessageEvent.
 * In the TypeScript port, badge data is stored for the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/BadgeImageWidget.as
 */
export class BadgeImageWidget implements IBadgeImageWidget 
{
    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::TYPE
    public static readonly TYPE: string = 'badge_image';

    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::TYPE_KEY
    private static readonly TYPE_KEY: string = 'badge_image:type';
    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::BADGE_ID_KEY
    private static readonly BADGE_ID_KEY: string = 'badge_image:badge_id';
    // TS-only: batch-update guard to avoid redundant refresh() calls during set properties
    private _batchUpdate: boolean = false;

    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::_widgetWindow
    private _widgetWindow: IWidgetWindow | null = null;
    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;
    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::_root
    private _root: IWindowContainer | null = null;
    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::_bitmap (IStaticBitmapWrapperWindow in AS3)
    private _bitmap: IWindow | null = null;
    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::_region
    private _region: IWindow | null = null;
    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::var_2554
    private _groupDetailsEvent: IMessageEvent | null = null;
    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::var_1600
    private _groupBadgesEvent: IMessageEvent | null = null;
    // TS-only: bound event handler ref for removeEventListener
    private _onClickBound: (event: WindowMouseEvent) => void;

    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::BadgeImageWidget()
    constructor(window: IWidgetWindow, windowManager: IHabboWindowManager) 
    {
        this._widgetWindow = window;
        this._windowManager = windowManager;
        this._onClickBound = this.onClick.bind(this);

        const root = this._windowManager.buildWidgetLayout('badge_image_xml') as IWindowContainer;

        if(root) 
        {
            this._root = root;
            this._bitmap = root.findChildByName('bitmap');
            this._region = root.findChildByName('region');

            if(this._region) 
            {
                this._region.addEventListener(WindowMouseEvent.CLICK, this._onClickBound);
            }

            this._widgetWindow.rootWindow = root;
            root.width = this._widgetWindow.width;
            root.height = this._widgetWindow.height;
        }
    }

    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::_disposed
    private _disposed: boolean = false;

    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::get disposed()
    public get disposed(): boolean 
    {
        return this._disposed;
    }

    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::_type
    private _type: string = 'normal';

    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::get type()
    public get type(): string 
    {
        return this._type;
    }

    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::set type()
    public set type(value: string) 
    {
        this._type = value;
    }

    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::_badgeId
    private _badgeId: string = '';

    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::get badgeId()
    public get badgeId(): string 
    {
        return this._badgeId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::set badgeId()
    public set badgeId(value: string)
    {
        // TODO(AS3): AS3 also clears glow state here (clearGlow(); _glowColor = -1) when the
        // badge id actually changes. Glow (playGlow/clearGlow/glowColor) is not ported.
        this._badgeId = value;
        this.refresh();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get greyscale()
    public get greyscale(): boolean
    {
        return (this._bitmap as unknown as IStaticBitmapWrapperWindow | null)?.greyscale ?? false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::set greyscale()
    public set greyscale(value: boolean)
    {
        const bitmap = this._bitmap as unknown as IStaticBitmapWrapperWindow | null;

        if(!bitmap) return;

        bitmap.greyscale = value;
        bitmap.invalidate();
    }

    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::_groupId
    private _groupId: number = 0;

    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::get groupId()
    public get groupId(): number 
    {
        return this._groupId;
    }

    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::set groupId()
    public set groupId(value: number) 
    {
        this._groupId = value;

        const shouldListen = this._type === 'group' && this._groupId > 0;
        const comm = this._windowManager?.communication ?? null;

        if(comm) 
        {
            if(!shouldListen && this._groupBadgesEvent !== null) 
            {
                comm.removeHabboConnectionMessageEvent(this._groupDetailsEvent!);
                comm.removeHabboConnectionMessageEvent(this._groupBadgesEvent!);
                this._groupDetailsEvent = null;
                this._groupBadgesEvent = null;
            }
            else if(shouldListen && this._groupBadgesEvent === null) 
            {
                this._groupDetailsEvent = new GroupDetailsChangedMessageEvent((e) => this.onGroupDetailsChanged(e as GroupDetailsChangedMessageEvent));
                this._groupBadgesEvent = new HabboGroupBadgesMessageEvent((e) => this.onHabboGroupBadges(e as HabboGroupBadgesMessageEvent));
                comm.addHabboConnectionMessageEvent(this._groupDetailsEvent);
                comm.addHabboConnectionMessageEvent(this._groupBadgesEvent);
            }
        }
    }

    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::get assetUri()
    public get assetUri(): string
    {
        if(!this._badgeId || this._badgeId.length === 0) return '';

        switch(this._type)
        {
            case 'normal':
                // Both crypted trees (WIN63-202607011411 and win63_version) say ".png" here,
                // but the unobfuscated 2016 PRODUCTION tree says ".gif", and real badge
                // assets are gifs (confirmed empirically) - the crypted decompiler corrupted
                // this literal in both trees. Using the real extension, not the crypted one.
                return '${image.library.url}album1584/' + this._badgeId + '.gif';
            case 'group': {
                // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::get assetUri()
                // AS3: _windowManager.getProperty("group.badge.url").replace("%imagerdata%", _badgeId)
                const template = (this._windowManager as unknown as {
                    getProperty?: (k: string) => string
                }).getProperty?.('group.badge.url') ?? '';
                return template ? template.replace('%imagerdata%', this._badgeId) : this._badgeId;
            }
            case 'perk':
                return '${image.library.url}perk/' + this._badgeId + '.png';
            default:
                return '';
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get pivotPoint()
    public get pivotPoint(): number
    {
        return (this._bitmap as unknown as IStaticBitmapWrapperWindow | null)?.pivotPoint ?? 0;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::set pivotPoint()
    public set pivotPoint(value: number)
    {
        const bitmap = this._bitmap as unknown as IStaticBitmapWrapperWindow | null;

        if(!bitmap) return;

        bitmap.pivotPoint = value;
        bitmap.invalidate();
    }

    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::get properties()
    public get properties(): PropertyStruct[] 
    {
        if(this._disposed) return [];

        return [
            new PropertyStruct(BadgeImageWidget.TYPE_KEY, this._type),
            new PropertyStruct(BadgeImageWidget.BADGE_ID_KEY, this._badgeId),
        ];
    }

    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::set properties()
    public set properties(values: PropertyStruct[]) 
    {
        this._batchUpdate = true;

        for(const prop of values) 
        {
            switch(prop.key) 
            {
                case BadgeImageWidget.TYPE_KEY:
                    this.type = String(prop.value);
                    break;
                case BadgeImageWidget.BADGE_ID_KEY:
                    this.badgeId = String(prop.value);
                    break;
            }
        }

        if(this._bitmap) 
        {
            this._bitmap.properties = values as unknown[];
        }

        this._batchUpdate = false;
        this.refresh();
    }

    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::dispose()
    public dispose(): void 
    {
        if(this._disposed) return;

        this.groupId = 0;

        if(this._region) 
        {
            this._region.removeEventListener(WindowMouseEvent.CLICK, this._onClickBound);
            this._region.dispose();
            this._region = null;
        }

        this._bitmap = null;

        if(this._root) 
        {
            this._root.dispose();
            this._root = null;
        }

        if(this._widgetWindow) 
        {
            this._widgetWindow.rootWindow = null;
            this._widgetWindow = null;
        }

        this._windowManager = null;
        this._disposed = true;
    }

    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::onGroupDetailsChanged()
    private onGroupDetailsChanged(event: GroupDetailsChangedMessageEvent): void 
    {
        this.forceRefresh(event.groupId, this._badgeId);
    }

    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::onHabboGroupBadges()
    private onHabboGroupBadges(event: HabboGroupBadgesMessageEvent): void 
    {
        const badge = event.badges?.get(this._groupId);

        if(badge !== undefined) 
        {
            this.forceRefresh(this._groupId, badge);
        }
    }

    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::forceRefresh()
    private forceRefresh(groupId: number, badgeId: string): void 
    {
        if(groupId !== this._groupId) return;

        this._badgeId = badgeId;
        (this._windowManager?.resourceManager as unknown as {
            removeAsset?: (uri: string) => void
        })?.removeAsset?.(this.assetUri);
        this.refresh();
    }

    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::refresh()
    // Public: ProductIconWidget calls (badgeImageWidget.widget as BadgeImageWidget).refresh()
    // directly after changing blend, matching AS3's external call into this method.
    public refresh(): void
    {
        if(this._batchUpdate) return;

        const bitmap = this._bitmap as unknown as IStaticBitmapWrapperWindow;

        if(bitmap) 
        {
            bitmap.assetUri = this.assetUri;
            (bitmap as unknown as { blend: number }).blend = this._widgetWindow?.blend ?? 0;
            bitmap.invalidate();
        }
    }

    // AS3: sources/win63_version/habbo/window/widgets/BadgeImageWidget.as::onClick()
    private onClick(_event: WindowMouseEvent): void 
    {
        if(this._groupId > 0 && this._windowManager?.communication?.connection) 
        {
            this._windowManager.communication.connection.send(new GetHabboGroupDetailsMessageComposer(this._groupId, true));
        }
    }
}
