import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {CraftingWidget} from '../CraftingWidget';

/**
 * The "crafting in progress" bar shown over `btn_craft`: fills over ~3.5s (50 ticks of 70ms at
 * +0.02 progress each) and either completes into `CraftingWidget.doCrafting()` or is cancelled by
 * clicking it.
 *
 * `setProgress()`'s body is decompiler-corrupted in BOTH obfuscated trees (primary and
 * win63_version) — it reads `_loc3_ = null.parent; null.width = _loc2_.width * param1;`, which is
 * not executable AS3 (a property write through the literal `null`). The unobfuscated 2016
 * PRODUCTION tree has the same method with no such corruption — `container.findChildByName("bar")`
 * captured once, resized to `btn_cancel`'s width times the progress fraction — and explains the
 * corruption exactly: the primary/win63 decompilers only inlined that same lookup a second time and
 * lost the reference. This is a pure width calculation with no protocol or game-logic surface, so
 * PRODUCTION's body is used here rather than guessed at; see CLAUDE.md's "AS3 sources" section for
 * why PRODUCTION is normally cited for names only.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/crafting/controller/CraftingProgressBarController.as
 * (setProgress() body: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/ui/widget/crafting/controller/CraftingProgressBarController.as::_Str_11199())
 */
export class CraftingProgressBarController
{
    // AS3: .../controller/CraftingProgressBarController.as::_SafeStr_4549 (widget)
    private _widget: CraftingWidget | null;

    // AS3: .../controller/CraftingProgressBarController.as::_SafeStr_6031 (progress, 0..1)
    private _progress: number = 0;

    // AS3: .../controller/CraftingProgressBarController.as::_SafeStr_7201 (progressTimer)
    // TS-only: the AS3 `flash.utils.Timer` firing every 70ms becomes a `setInterval` handle here —
    // there is no ported Timer class in this port's runtime.
    private _progressTimer: ReturnType<typeof setInterval> | null = null;

    // AS3: .../controller/CraftingProgressBarController.as::CraftingProgressBarController()
    constructor(widget: CraftingWidget)
    {
        this._widget = widget;
    }

    // AS3: .../controller/CraftingProgressBarController.as::dispose()
    // AS3 never stops `_SafeStr_7201` here — only `hide()` does. Matched faithfully; `hide()` is
    // always called before a widget is torn down (`CraftingWidget.dispose()` -> `handler.dispose()`
    // -> ... -> `infoCtrl.cancelCrafting()` -> `hide()`).
    dispose(): void
    {
        this._widget = null;
    }

    // AS3: .../controller/CraftingProgressBarController.as::setProgress()
    private setProgress(value: number): void
    {
        const container = this.container;
        const cancelButton = container?.findChildByName('btn_cancel');
        const bar = container?.findChildByName('bar');

        if(bar && cancelButton) bar.width = cancelButton.width * value;
    }

    // AS3: .../controller/CraftingProgressBarController.as::onProgressTimerEvent()
    private onProgressTimerEvent = (): void =>
    {
        this._progress += 0.02;
        this.setProgress(this._progress);

        if(this._progress >= 1)
        {
            this.hide();
            this._widget?.infoCtrl?.onProgressBarComplete();
        }
    };

    // AS3: .../controller/CraftingProgressBarController.as::hide()
    hide(): void
    {
        if(this._progressTimer !== null)
        {
            clearInterval(this._progressTimer);
            this._progressTimer = null;
        }

        const container = this.container;

        if(container)
        {
            container.visible = false;
            container.procedure = null;
        }
    }

    // AS3: .../controller/CraftingProgressBarController.as::show()
    show(): void
    {
        this._progressTimer = setInterval(this.onProgressTimerEvent, 70);
        this._progress = 0;

        const container = this.container;

        if(container)
        {
            container.visible = true;
            container.procedure = this.onTriggered;
        }
    }

    // AS3: .../controller/CraftingProgressBarController.as::onTriggered()
    private onTriggered = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_DOWN') return;

        this._widget?.infoCtrl?.cancelCrafting();
    };

    // AS3: .../controller/CraftingProgressBarController.as::get container()
    private get container(): IWindowContainer | null
    {
        if(!this._widget || !this._widget.window) return null;

        return this._widget.window.findChildByName('progress_bar') as IWindowContainer | null;
    }
}
