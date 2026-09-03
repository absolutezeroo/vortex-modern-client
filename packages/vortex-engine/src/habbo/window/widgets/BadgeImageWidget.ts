import type {IBadgeImageWidget} from './IBadgeImageWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IIterator} from '@core/window/utils/IIterator';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {EmptyIterator} from '@core/window/iterators/EmptyIterator';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';
import {BadgeImageType} from '../enum/BadgeImageType';
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
 * Renders a badge image (normal, group, or perk) from a badge identifier, and keeps a
 * group badge current by listening for the two group message events.
 *
 * Everything the layout writes under the `badge_image:` namespace other than `type` and
 * `badge_id` is forwarded, namespace stripped, to the bitmap inside the widget — that is
 * how `badge_image:pivot_point`, `badge_image:stretched_x` and the rest reach it.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as
 */
export class BadgeImageWidget implements IBadgeImageWidget
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::TYPE
    public static readonly TYPE: string = 'badge_image';

    // Derived name: the constant is obfuscated in every tree (`_Str_13540` in the
    // otherwise unobfuscated 2016 one), so `TYPE_KEY` is this port's name for it.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::TYPE_KEY
    private static readonly TYPE_KEY: string = 'badge_image:type';
    // Derived name: same as `TYPE_KEY` above — obfuscated in every tree.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::BADGE_ID_KEY
    private static readonly BADGE_ID_KEY: string = 'badge_image:badge_id';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::NO_GLOW_COLOR
    private static readonly NO_GLOW_COLOR: number = -1;

    // Derived name: obfuscated in every tree, like the two keys above.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::TYPE_DEFAULT
    private static readonly TYPE_DEFAULT: PropertyStruct =
        new PropertyStruct(BadgeImageWidget.TYPE_KEY, BadgeImageType.NORMAL, PropertyStruct.STRING, false, BadgeImageType.ALL);

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::ID_DEFAULT
    private static readonly ID_DEFAULT: PropertyStruct =
        new PropertyStruct(BadgeImageWidget.BADGE_ID_KEY, '', PropertyStruct.STRING);

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::_disposed
    private _disposed: boolean = false;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::_widgetWindow
    private _widgetWindow: IWidgetWindow | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::_refreshing
    private _refreshing: boolean = false;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::_root
    private _root: IWindowContainer | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::_bitmap
    private _bitmap: IStaticBitmapWrapperWindow | null = null;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::_region
    private _region: IRegionWindow | null = null;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::_type
    private _type: string = String(BadgeImageWidget.TYPE_DEFAULT.value);
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::_badgeId
    private _badgeId: string = String(BadgeImageWidget.ID_DEFAULT.value);
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::_groupId
    private _groupId: number = 0;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::_glowColor
    private _glowColor: number = BadgeImageWidget.NO_GLOW_COLOR;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::_groupDetailsChangedMessageEvent
    private _groupDetailsEvent: IMessageEvent | null = null;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::_habboGroupBadgesMessageEvent
    private _groupBadgesEvent: IMessageEvent | null = null;
    // TS-only: bound event handler ref for removeEventListener
    private _onClickBound: (event: WindowMouseEvent) => void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::BadgeImageWidget()
    constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
    {
        this._widgetWindow = window;
        this._windowManager = windowManager;
        this._onClickBound = this.onClick.bind(this);

        const root = this._windowManager.buildWidgetLayout('badge_image_xml') as IWindowContainer | null;

        if(root)
        {
            this._root = root;
            this._bitmap = root.findChildByName('bitmap') as IStaticBitmapWrapperWindow | null;
            this._region = root.findChildByName('region') as IRegionWindow | null;

            if(this._region) this._region.addEventListener(WindowMouseEvent.CLICK, this._onClickBound);

            this._widgetWindow.rootWindow = root;
            root.width = this._widgetWindow.width;
            root.height = this._widgetWindow.height;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get iterator()
    public iterator(): IIterator
    {
        return EmptyIterator.INSTANCE;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get properties()
    public get properties(): PropertyStruct[]
    {
        const props: PropertyStruct[] = [];

        if(this._disposed) return props;

        props.push(BadgeImageWidget.TYPE_DEFAULT.withValue(this._type));
        props.push(BadgeImageWidget.ID_DEFAULT.withValue(this._badgeId));

        for(const prop of (this._bitmap?.properties ?? []) as PropertyStruct[])
        {
            if(prop.key !== 'asset_uri') props.push(prop.withNameSpace('badge_image'));
        }

        return props;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::set properties()
    public set properties(values: PropertyStruct[])
    {
        this._refreshing = true;

        const forwarded: PropertyStruct[] = [];

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

            // The widget owns the asset URI — the bitmap must never be handed one from a
            // layout, or the badge would draw whatever the layout named instead.
            if(prop.key !== 'badge_image:asset_uri') forwarded.push(prop.withoutNameSpace());
        }

        if(this._bitmap) this._bitmap.properties = forwarded;

        this._refreshing = false;
        this.refresh();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get type()
    public get type(): string
    {
        return this._type;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::set type()
    public set type(value: string)
    {
        this._type = value;
        this.refresh();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get badgeId()
    public get badgeId(): string
    {
        return this._badgeId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::set badgeId()
    public set badgeId(value: string)
    {
        if(this._badgeId !== value)
        {
            this.clearGlow();
            this._glowColor = BadgeImageWidget.NO_GLOW_COLOR;
        }

        this._badgeId = value;
        this.refresh();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get groupId()
    public get groupId(): number
    {
        return this._groupId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::set groupId()
    public set groupId(value: number)
    {
        this._groupId = value;

        const shouldListen = this._type === BadgeImageType.GROUP && this._groupId > 0;
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get glowColor()
    public get glowColor(): number
    {
        return this._glowColor;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::set glowColor()
    public set glowColor(value: number)
    {
        this._glowColor = value;

        // AS3 also tests `_glowing || _pendingGlowAssetUri != null` here; both are always
        // false while `playGlow()` is the stub below, so the branch cannot fire yet.
        if(this._glowColor < 0) this.clearGlow();
    }

    /**
	 * Plays the one-shot glow animation over the badge.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::playGlow()
    // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as
    // ::playGlow()/receiveAsset()/startGlowAnimation()/applyGlowStrength()/cancelPendingGlow()
    // — AS3 pre-fetches the badge asset (5s timeout timer), then runs a 16ms timer for
    // `durationMs`, and on each tick writes three filters onto the widget window:
    // GlowFilter(color, 0.7*t, 4+4t, 4+4t, 1+1.2t, quality 2), an inner
    // GlowFilter(color, 0.22*t, 2+2t, 2+2t, 0.8+0.6t, quality 1, inner), and a
    // ColorMatrixFilter mixing 0.48*t of the tint with an 80*t offset, `t` following
    // `easeInOutCubic`.
    //
    // Blocked on one missing capability, re-verified 2026-09-03: **window filters are stored and
    // never rendered.** `WindowController.filters` writes them onto the graphic context and
    // `WindowComposite` never reads `getGraphicContext().filters` back — it sets `ctx.filter`
    // only for the modal darken and the dynamic-style colour transform. That `ctFilter`
    // assignment in `compositeWindow()` is the entry point: reading the window's own filter list
    // there and translating each to a CSS filter string (a glow becomes `drop-shadow`) is what
    // this widget is waiting for, and it would light up every other window filter at once.
    // Until then only the colour is kept, so `glowColor` reads back what was asked for.
    public playGlow(color: number, _durationMs: number = 500, _scale: number = 1.04): void
    {
        if(this._disposed || this._bitmap === null || this._widgetWindow === null) return;

        this._glowColor = color & 0xFFFFFF;
    }

    /**
	 * Stops the glow animation and restores the filters the widget had before it.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::clearGlow()
    // TODO(AS3): stops the two timers, restores `_glowRestoreFilters` onto the widget window
    // and calls `refresh()`. Nothing to stop or restore while `playGlow()` is the stub above.
    public clearGlow(): void
    {
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::refresh()
    // Public: ProductIconWidget calls (badgeImageWidget.widget as BadgeImageWidget).refresh()
    // directly after changing blend, matching AS3's external call into this method.
    public refresh(): void
    {
        if(this._refreshing) return;

        const bitmap = this._bitmap;

        if(!bitmap) return;

        bitmap.assetUri = this.assetUri;
        bitmap.blend = this._widgetWindow?.blend ?? 0;
        bitmap.invalidate();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get assetUri()
    private get assetUri(): string
    {
        if(!this._badgeId || this._badgeId.length === 0) return '';

        switch(this._type)
        {
            case BadgeImageType.NORMAL:
                // Both crypted trees (WIN63-202607011411 and win63_version) say ".png" here,
                // but the unobfuscated 2016 PRODUCTION tree says ".gif", and real badge
                // assets are gifs (confirmed empirically) - the crypted decompiler corrupted
                // this literal in both trees. Using the real extension, not the crypted one.
                return '${image.library.url}album1584/' + this._badgeId + '.gif';
            case BadgeImageType.GROUP: {
                // AS3: _windowManager.getProperty("group.badge.url").replace("%imagerdata%", _badgeId)
                const template = (this._windowManager as unknown as {
                    getProperty?: (k: string) => string
                }).getProperty?.('group.badge.url') ?? '';

                return template ? template.replace('%imagerdata%', this._badgeId) : this._badgeId;
            }
            case BadgeImageType.PERK:
                return '${image.library.url}perk/' + this._badgeId + '.png';
            default:
                return '';
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::onClick()
    private onClick(_event: WindowMouseEvent): void
    {
        if(this._groupId > 0 && this._windowManager?.communication?.connection)
        {
            this._windowManager.communication.connection.send(new GetHabboGroupDetailsMessageComposer(this._groupId, true));
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::onGroupDetailsChanged()
    private onGroupDetailsChanged(event: GroupDetailsChangedMessageEvent): void
    {
        this.forceRefresh(event.groupId, this._badgeId);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::onHabboGroupBadges()
    private onHabboGroupBadges(event: HabboGroupBadgesMessageEvent): void
    {
        const badge = event.badges?.get(this._groupId);

        if(badge !== undefined) this.forceRefresh(this._groupId, badge);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::forceRefresh()
    private forceRefresh(groupId: number, badgeId: string): void
    {
        if(groupId !== this._groupId) return;

        this._badgeId = badgeId;
        this._windowManager?.resourceManager?.removeAsset(this.assetUri);
        this.refresh();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get bitmapData()
    public get bitmapData(): ImageBitmap | null
    {
        return this._bitmap?.bitmapData ?? null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get pivotPoint()
    public get pivotPoint(): number
    {
        return this._bitmap?.pivotPoint ?? 0;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::set pivotPoint()
    public set pivotPoint(value: number)
    {
        if(!this._bitmap) return;

        this._bitmap.pivotPoint = value;
        this._bitmap.invalidate();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get stretchedX()
    public get stretchedX(): boolean
    {
        return this._bitmap?.stretchedX ?? false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::set stretchedX()
    public set stretchedX(value: boolean)
    {
        if(!this._bitmap) return;

        this._bitmap.stretchedX = value;
        this._bitmap.invalidate();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get stretchedY()
    public get stretchedY(): boolean
    {
        return this._bitmap?.stretchedY ?? false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::set stretchedY()
    public set stretchedY(value: boolean)
    {
        if(!this._bitmap) return;

        this._bitmap.stretchedY = value;
        this._bitmap.invalidate();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get zoomX()
    public get zoomX(): number
    {
        return this._bitmap?.zoomX ?? 1;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::set zoomX()
    public set zoomX(value: number)
    {
        if(!this._bitmap) return;

        this._bitmap.zoomX = value;
        this._bitmap.invalidate();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get zoomY()
    public get zoomY(): number
    {
        return this._bitmap?.zoomY ?? 1;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::set zoomY()
    public set zoomY(value: number)
    {
        if(!this._bitmap) return;

        this._bitmap.zoomY = value;
        this._bitmap.invalidate();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get greyscale()
    public get greyscale(): boolean
    {
        return this._bitmap?.greyscale ?? false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::set greyscale()
    public set greyscale(value: boolean)
    {
        if(!this._bitmap) return;

        this._bitmap.greyscale = value;
        this._bitmap.invalidate();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get etchingColor()
    public get etchingColor(): number
    {
        return this._bitmap?.etchingColor ?? 0;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::set etchingColor()
    public set etchingColor(value: number)
    {
        if(!this._bitmap) return;

        this._bitmap.etchingColor = value;
        this._bitmap.invalidate();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get fitSizeToContents()
    public get fitSizeToContents(): boolean
    {
        return this._bitmap?.fitSizeToContents ?? false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::set fitSizeToContents()
    public set fitSizeToContents(value: boolean)
    {
        if(!this._bitmap) return;

        this._bitmap.fitSizeToContents = value;
        this._bitmap.invalidate();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get etchingPoint()
    public get etchingPoint(): { x: number; y: number }
    {
        return {x: 0, y: 1};
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get wrapX()
    public get wrapX(): boolean
    {
        return false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::set wrapX()
    // Empty in AS3: a badge never tiles.
    public set wrapX(_value: boolean)
    {
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get wrapY()
    public get wrapY(): boolean
    {
        return false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::set wrapY()
    // Empty in AS3: a badge never tiles.
    public set wrapY(_value: boolean)
    {
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get flipX()
    public get flipX(): boolean
    {
        return this._bitmap?.flipX ?? false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::set flipX()
    public set flipX(value: boolean)
    {
        if(!this._bitmap) return;

        this._bitmap.flipX = value;
        this._bitmap.invalidate();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get flipY()
    public get flipY(): boolean
    {
        return this._bitmap?.flipY ?? false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::set flipY()
    public set flipY(value: boolean)
    {
        if(!this._bitmap) return;

        this._bitmap.flipY = value;
        this._bitmap.invalidate();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::get rotation()
    public get rotation(): number
    {
        return 0;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::set rotation()
    // Empty in AS3: a badge never rotates.
    public set rotation(_value: number)
    {
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this.clearGlow();
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
}
