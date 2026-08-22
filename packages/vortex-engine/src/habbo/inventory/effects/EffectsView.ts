import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';

import {ThumbListManager} from '../common/ThumbListManager';
import type {IThumbListDataProvider} from '../common/IThumbListDataProvider';
import type {EffectsModel} from './EffectsModel';
import {EffectFilter} from './IEffectsModel';

const log = Logger.getLogger('habbo.inventory.effects.EffectsView');

/**
 * EffectsView — the effects-inventory tab.
 *
 * Two thumbnail strips composited by `ThumbListManager` (active effects and inactive ones),
 * each drawn into a bitmap window; a click is resolved back to an index by the strip's own
 * geometry. The panel beside them shows the selected effect's icon, its state text with the
 * remaining/total time, and the activate button.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectsView.as
 */
export class EffectsView
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectsView.as::_windowManager
    private _windowManager: IHabboWindowManager | null;
    // Derived name: obfuscated in the primary tree; named for what it holds.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectsView.as::_window
    private _window: IWindowContainer | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectsView.as::_model
    private _model: EffectsModel | null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectsView.as::_activeThumbList
    // Derived name: obfuscated in the primary tree.
    private _activeThumbList: ThumbListManager | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectsView.as::_inactiveThumbList
    // Derived name: obfuscated in the primary tree.
    private _inactiveThumbList: ThumbListManager | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectsView.as::_disposed
    private _disposed: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectsView.as::EffectsView()
    constructor(
        model: EffectsModel,
        windowManager: IHabboWindowManager | null,
        activeProvider: IThumbListDataProvider,
        inactiveProvider: IThumbListDataProvider
    )
    {
        this._model = model;
        this._windowManager = windowManager;

        this._window = this._windowManager?.buildWidgetLayout('inventory_effects_xml') as IWindowContainer | null ?? null;

        if(this._window === null)
        {
            log.warn('Effects tab layout "inventory_effects_xml" could not be built');

            return;
        }

        this._window.visible = false;
        this._window.procedure = this.windowEventProc;

        const resourceManager = this._windowManager?.resourceManager ?? null;

        this._activeThumbList = new ThumbListManager(
            resourceManager, activeProvider, 'thumb_bg_png', 'thumb_bg_selected_png',
            this.getActiveThumbListImageWidth(), this.getActiveThumbListImageHeight()
        );
        this._inactiveThumbList = new ThumbListManager(
            resourceManager, inactiveProvider, 'thumb_bg_png', 'thumb_bg_selected_png',
            this.getActiveThumbListImageWidth(), this.getActiveThumbListImageHeight()
        );

        const activeImage = this._window.findChildByName('active_items_image');

        if(activeImage !== null) activeImage.procedure = this.activeThumbListEventProc;

        const inactiveImage = this._window.findChildByName('inactive_items_image');

        if(inactiveImage !== null) inactiveImage.procedure = this.inactiveThumbListEventProc;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectsView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectsView.as::getActiveThumbListImageWidth()
    getActiveThumbListImageWidth(): number
    {
        return this._window?.findChildByName('active_items_image')?.width ?? 0;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectsView.as::getActiveThumbListImageHeight()
    getActiveThumbListImageHeight(): number
    {
        return this._window?.findChildByName('active_items_image')?.height ?? 0;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectsView.as::getInactiveThumbListImageWidth()
    getInactiveThumbListImageWidth(): number
    {
        return this._window?.findChildByName('inactive_items_image')?.width ?? 0;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectsView.as::getInactiveThumbListImageHeight()
    getInactiveThumbListImageHeight(): number
    {
        return this._window?.findChildByName('inactive_items_image')?.height ?? 0;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectsView.as::getWindowContainer()
    getWindowContainer(): IWindowContainer | null
    {
        if(this._window === null || this._window.disposed) return null;

        return this._window;
    }

    /**
	 * Recomposites both strips and blits each onto its bitmap window, resizing the window to
	 * the strip — that is how the list scrolls: the image is taller than the viewport.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectsView.as::updateListViews()
    updateListViews(): void
    {
        if(this._window === null || this._window.disposed) return;

        this._inactiveThumbList?.updateImageFromList();
        this._activeThumbList?.updateImageFromList();

        this.applyStrip('inactive_items_image', this._inactiveThumbList);
        this.applyStrip('active_items_image', this._activeThumbList);
    }

    // TS-only: the two identical blits AS3 writes out twice in updateListViews().
    private applyStrip(name: string, list: ThumbListManager | null): void
    {
        const window = this._window?.findChildByName(name) as IBitmapWrapperWindow | null;
        const image = list?.getListImage() ?? null;

        if(!window || image === null) return;

        window.bitmap = image;
        window.width = image.width;
        window.height = image.height;
        window.invalidate();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectsView.as::updateActionView()
    updateActionView(): void
    {
        if(this._window === null || this._window.disposed || this._model === null) return;

        const button = this._window.findChildByName('activateEffect_button');
        const description = this._window.findChildByName('effectDescriptionText') as ITextWindow | null;

        if(button === null || description === null) return;

        const effect = this._model.getSelectedEffect(EffectFilter.ALL);

        if(effect === null)
        {
            button.disable();
            this.setEffectDescriptionImage(null);
            description.text = '${inventory.effects.defaultdescription}';

            return;
        }

        if(effect.isActive)
        {
            button.disable();
            this.setEffectDescriptionImage(effect.iconImage);
            description.text = '${inventory.effects.active}';

            this._windowManager?.registerLocalizationParameter('inventory.effects.active', 'timeleft', EffectsView.convertSecondsToTime(effect.secondsLeft));
            this._windowManager?.registerLocalizationParameter('inventory.effects.active', 'duration', EffectsView.convertSecondsToTime(effect.duration));
            this._windowManager?.registerLocalizationParameter('inventory.effects.active', 'itemcount', String(effect.amountInInventory));

            return;
        }

        button.enable();
        this.setEffectDescriptionImage(effect.iconImage);
        description.text = '${inventory.effects.inactive}';

        this._windowManager?.registerLocalizationParameter('inventory.effects.inactive', 'duration', EffectsView.convertSecondsToTime(effect.duration));
        this._windowManager?.registerLocalizationParameter('inventory.effects.inactive', 'itemcount', String(effect.amountInInventory));
    }

    /**
	 * Centres the effect's icon in the description slot. AS3 copyPixels into the window's own
	 * BitmapData; here the slot is redrawn, which `drawIntoBitmapSlot()` already does.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectsView.as::setEffectDescriptionImage()
    private setEffectDescriptionImage(icon: ImageBitmap | null): void
    {
        if(this._window === null || this._window.disposed) return;

        const slot = this._window.findChildByName('effectDescriptionImage') as IBitmapWrapperWindow | null;

        if(!slot) return;

        const canvas = new OffscreenCanvas(Math.max(1, slot.width), Math.max(1, slot.height));
        const context = canvas.getContext('2d');

        if(context === null) return;

        if(icon !== null)
        {
            context.drawImage(
                icon,
                Math.floor((canvas.width - icon.width) / 2),
                Math.floor((canvas.height - icon.height) / 2)
            );
        }

        slot.bitmap = canvas.transferToImageBitmap();
        slot.invalidate();
    }

    /**
	 * `h:mm:ss`, with the hour dropped when it is zero — AS3's exact shape.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectsView.as::convertSecondsToTime()
    private static convertSecondsToTime(totalSeconds: number): string
    {
        const hours = Math.floor(totalSeconds / 60 / 60);
        const minutes = Math.floor((totalSeconds - hours * 60 * 60) / 60);
        const seconds = totalSeconds - hours * 60 * 60 - minutes * 60;

        let result = hours > 0 ? `${hours}:` : '';

        result += minutes < 10 ? `0${minutes}` : `${minutes}`;
        result += ':';

        return result + (seconds < 10 ? `0${seconds}` : `${seconds}`);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectsView.as::activeThumbListEventProc()
    private activeThumbListEventProc = (event: WindowEvent, _target: IWindow): void =>
    {
        this.handleThumbListClick(event, this._activeThumbList, EffectFilter.ACTIVE);
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectsView.as::inactiveThumbListEventProc()
    private inactiveThumbListEventProc = (event: WindowEvent, _target: IWindow): void =>
    {
        this.handleThumbListClick(event, this._inactiveThumbList, EffectFilter.INACTIVE);
    };

    // TS-only: the two thumb-list handlers differ only by strip and filter.
    private handleThumbListClick(event: WindowEvent, list: ThumbListManager | null, filter: number): void
    {
        if(event.type !== WindowMouseEvent.CLICK || list === null || this._model === null) return;

        const mouse = event as WindowMouseEvent;
        const index = list.resolveIndexFromImageLocation({x: mouse.localX, y: mouse.localY});
        const effect = this._model.getItemInIndex(index, filter as never);

        if(effect !== null) this._model.toggleEffectSelected(effect.type);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectsView.as::windowEventProc()
    private windowEventProc = (event: WindowEvent, target: IWindow): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK || target.name !== 'activateEffect_button') return;

        const effect = this._model?.getSelectedEffect(EffectFilter.INACTIVE) ?? null;

        if(effect !== null) this._model?.requestEffectActivated(effect.type);
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/EffectsView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._windowManager = null;
        this._model = null;
        this._window = null;

        if(this._activeThumbList !== null)
        {
            this._activeThumbList.dispose();
            this._activeThumbList = null;
        }

        if(this._inactiveThumbList !== null)
        {
            this._inactiveThumbList.dispose();
            this._inactiveThumbList = null;
        }

        this._disposed = true;
    }
}
