/**
 * EffectsWidget — the in-room me-menu effects flyout.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/effects/EffectsWidget.as
 *
 * Lists the effects the player owns (from the inventory EffectsModel) as
 * EffectView rows; clicking a row wears/stops the effect. Opened by the
 * EffectsWidgetHandler on RWRWM_EFFECTS and re-opened on HIEE_EFFECTS_CHANGED.
 */
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IScrollableListWindow} from '@core/window/components/IScrollableListWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IWindow} from '@core/window/IWindow';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import type {EffectsWidgetHandler} from '@habbo/ui/handler/EffectsWidgetHandler';
import {EffectView} from './EffectView';

const LIST_HEIGHT_MAX: number = 320;
const LIST_HEIGHT_MIN: number = 48;
const TOOLBAR_MARGIN: number = 2;

export class EffectsWidget extends RoomWidgetBase
{
    private _window: IWindowContainer | null = null;
    private _list: IScrollableListWindow | null = null;
    private _effectViews: Map<number, EffectView> = new Map();

    // AS3: EffectsWidget.as::EffectsWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null = null,
        localizations: IHabboLocalizationManager | null = null
    )
    {
        super(handler, windowManager, assets, localizations);

        this.handler.widget = this;
    }

    // AS3: EffectsWidget.as::get handler()
    public get handler(): EffectsWidgetHandler
    {
        return this.widgetHandler as EffectsWidgetHandler;
    }

    // AS3: EffectsWidget.as::open()
    public open(): void
    {
        if(!this._window)
        {
            this._window = this.windowManager.buildWidgetLayout('effects_widget') as IWindowContainer | null;

            if(!this._window) return;

            const rect = this.handler.container?.toolbar?.getRect();

            if(rect)
            {
                this._window.x = rect.x + rect.width + TOOLBAR_MARGIN;
                this._window.y = rect.y + rect.height - this._window.height;
            }

            this._list = this._window.findChildByName('list') as IScrollableListWindow | null;

            const close = this._window.findChildByName('close');

            if(close) close.procedure = this.onClose;
        }

        this.update();
        this._window.visible = true;
    }

    // AS3: EffectsWidget.as::update()
    public update(): void
    {
        if(!this._window || !this._list) return;

        const effects = this.handler.container?.inventory?.getAvatarEffects() ?? [];
        const presentTypes = new Set<number>();

        for(const effect of effects)
        {
            presentTypes.add(effect.type);

            const existing = this._effectViews.get(effect.type);

            if(existing)
            {
                existing.update();
            }
            else
            {
                const view = new EffectView(this, effect);

                this._effectViews.set(effect.type, view);

                if(view.window) this._list.addListItem(view.window);
            }
        }

        for(const [type, view] of [...this._effectViews])
        {
            if(!presentTypes.has(type))
            {
                if(view.window) this._list.removeListItem(view.window);

                this._effectViews.delete(type);
                view.dispose();
            }
        }

        const regionHeight = this._list.scrollableRegion?.height ?? 0;

        this._list.height = Math.max(Math.min(regionHeight, LIST_HEIGHT_MAX), LIST_HEIGHT_MIN);

        const noEffects = this._window.findChildByName('no_effects');

        if(noEffects) noEffects.visible = effects.length === 0;
    }

    // AS3: EffectsWidget.as::selectEffect()
    public selectEffect(type: number, isInUse: boolean): void
    {
        const inventory = this.handler.container?.inventory;

        if(!inventory) return;

        if(isInUse)
        {
            inventory.setEffectDeselected(type);
        }
        else
        {
            inventory.setEffectSelected(type);
        }
    }

    // AS3: EffectsWidget.as::onClose()
    private onClose = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type === 'WME_CLICK' && this._window)
        {
            this._window.visible = false;
        }
    };

    // AS3: EffectsWidget.as::dispose()
    public override dispose(): void
    {
        if(this.disposed) return;

        for(const view of this._effectViews.values())
        {
            view.dispose();
        }

        this._effectViews.clear();
        this._list = null;

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        super.dispose();
    }
}
