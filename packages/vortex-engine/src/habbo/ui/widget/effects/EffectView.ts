/**
 * EffectView — one row in the me-menu EffectsWidget list.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/effects/EffectView.as
 *
 * Builds a row from memenu_effect_{selected|unselected|inactive} depending on
 * the effect state, shows the icon/name/amount, a live countdown bar for active
 * effects, and forwards clicks to the widget (select/deselect).
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {BitmapDataAsset} from '@core/assets/BitmapDataAsset';
import type {Effect} from '@habbo/inventory/effects/Effect';
import type {EffectsWidget} from './EffectsWidget';

const UPDATE_TIMER_MS: number = 1000;

export class EffectView
{
    private _widget: EffectsWidget;
    private _window: IWindowContainer | null = null;
    private _effect: Effect;
    private _bar: IWindow | null = null;
    private _maxWidth: number = 0;
    private _timeLeftText: ITextWindow | null = null;
    private _timer: ReturnType<typeof setInterval> | null = null;
    private _hilite: IWindow | null = null;

    // AS3: EffectView.as::EffectView()
    constructor(widget: EffectsWidget, effect: Effect)
    {
        this._effect = effect;
        this._widget = widget;
        this.update();
    }

    // AS3: EffectView.as::get effect()
    get effect(): Effect
    {
        return this._effect;
    }

    // AS3: EffectView.as::get window()
    get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: EffectView.as::update()
    update(): void
    {
        if(!this._window)
        {
            this._window = this._widget.windowManager.createWindow('', '', 4, 0, 16) as IWindowContainer;
            this._window.procedure = this.windowProc;
        }

        while(this._window.numChildren > 0)
        {
            const child = this._window.removeChildAt(0);

            child?.dispose();
        }

        this.stopTimer();
        this._bar = null;
        this._hilite = null;
        this._timeLeftText = null;

        let layoutName: string;

        if(this._effect.isInUse)
        {
            layoutName = 'memenu_effect_selected';
        }
        else if(this._effect.isActive)
        {
            layoutName = 'memenu_effect_unselected';
        }
        else
        {
            layoutName = 'memenu_effect_inactive';
        }

        const inner = this._widget.windowManager.buildWidgetLayout(layoutName) as IWindowContainer | null;

        if(!inner) return;

        this._window.addChild(inner);

        const nameWindow = this._window.findChildByName('effect_name') as ITextWindow | null;

        if(nameWindow)
        {
            nameWindow.caption = '${fx_' + this._effect.type + '}';
        }

        const amountWindow = this._window.findChildByName('effect_amount') as ITextWindow | null;

        if(amountWindow)
        {
            amountWindow.caption = `${this._effect.amountInInventory}`;
        }

        const amountBg = this._window.findChildByName('effect_amount_bg1');

        if(this._effect.amountInInventory < 2 && amountBg)
        {
            amountBg.visible = false;
        }

        if(!this._effect.isActive)
        {
            // Inactive: only the row/activate button is clickable (WME_CLICK bubbles
            // to windowProc). AS3 wires the "activate_effect" button explicitly.
        }
        else
        {
            if(this._effect.isInUse)
            {
                this.setElementImage('effect_hilite', 'memenu_fx_pause');
            }
            else
            {
                this.setElementImage('effect_hilite', 'memenu_fx_play');
            }

            this._hilite = this._window.findChildByName('effect_hilite');

            if(this._hilite)
            {
                this._hilite.visible = false;
            }
        }

        this.setTimeLeft();

        this._bar = this._window.findChildByName('loader_bar');

        if(this._bar)
        {
            this._maxWidth = this._bar.width;
            this.startTimer();
            this.onUpdate();
        }

        if(this._effect.icon)
        {
            this.setElementBitmap('effect_icon', this._effect.icon);
        }
        else
        {
            // AS3 preloads the icon in EffectsModel.addEffect; this port loads it
            // lazily from the asset library here (see App.ts fx_icon_* decode).
            this.setElementImage('effect_icon', 'fx_icon_' + this._effect.type);
        }

        this._window.width = inner.width;
        this._window.height = inner.height;
    }

    // AS3: EffectView.as::onUpdate()
    private onUpdate = (): void =>
    {
        if(!this._bar)
        {
            this.stopTimer();

            return;
        }

        if(this._effect.isActive && this._effect.duration > 0)
        {
            const ratio = this._effect.secondsLeft / this._effect.duration;

            this._bar.width = ratio * this._maxWidth;
        }
        else
        {
            this._bar.width = 0;
            this.stopTimer();
        }

        this.setTimeLeft();
    };

    // AS3: EffectView.as::setTimeLeft()
    private setTimeLeft(): void
    {
        if(!this._timeLeftText)
        {
            this._timeLeftText = this._window?.findChildByName('time_left') as ITextWindow | null;

            if(!this._timeLeftText) return;
        }

        if(!this._effect.isActive)
        {
            this._timeLeftText.caption = '${widgets.memenu.effects.activate}';

            return;
        }

        if(this._effect.secondsLeft > 86400)
        {
            this._timeLeftText.caption = '${widgets.memenu.effects.active.daysleft}';

            const days = Math.floor(this._effect.secondsLeft / 86400);

            this._timeLeftText.text = this._timeLeftText.text.replace('%days_left%', `${days}`);
        }
        else
        {
            this._timeLeftText.caption = '${widgets.memenu.effects.active.timeleft}';

            const total = this._effect.secondsLeft;
            const hours = Math.floor(total / 3600);
            const minutes = Math.floor(total / 60) % 60;
            const seconds = total % 60;
            const hh = hours < 10 ? '0' : '';
            const mm = minutes < 10 ? '0' : '';
            const ss = seconds < 10 ? '0' : '';

            const formatted = hours > 0
                ? `${hh}${hours}:${mm}${minutes}:${ss}${seconds}`
                : `${mm}${minutes}:${ss}${seconds}`;

            this._timeLeftText.text = this._timeLeftText.text.replace('%time_left%', formatted);
        }
    }

    // AS3: EffectView.as::setElementBitmap()
    private setElementBitmap(name: string, image: ImageBitmap): void
    {
        const element = this._window?.findChildByName(name) as (IWindow & { bitmap: ImageBitmap | null }) | null;

        if(element)
        {
            element.bitmap = image;
        }
    }

    // AS3: EffectView.as::setElementImage()
    private setElementImage(name: string, assetName: string): void
    {
        const asset = this._widget.assets?.getAssetByName(assetName) as BitmapDataAsset | null;
        const content = asset?.content as ImageBitmap | null;

        if(content)
        {
            this.setElementBitmap(name, content);
        }
    }

    // AS3: EffectView.as::onMouseEvent()
    private windowProc = (event: WindowEvent, _window: IWindow): void =>
    {
        switch(event.type)
        {
            case 'WME_OVER':
                if(this._hilite) this._hilite.visible = true;
                break;
            case 'WME_OUT':
                if(this._hilite) this._hilite.visible = false;
                break;
            case 'WME_CLICK':
                this._widget.selectEffect(this._effect.type, this._effect.isInUse);
                break;
        }
    };

    private startTimer(): void
    {
        if(this._timer !== null) return;

        this._timer = setInterval(this.onUpdate, UPDATE_TIMER_MS);
    }

    private stopTimer(): void
    {
        if(this._timer !== null)
        {
            clearInterval(this._timer);
            this._timer = null;
        }
    }

    // AS3: EffectView.as::dispose()
    dispose(): void
    {
        this.stopTimer();

        this._bar = null;
        this._hilite = null;
        this._timeLeftText = null;

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }
    }
}
