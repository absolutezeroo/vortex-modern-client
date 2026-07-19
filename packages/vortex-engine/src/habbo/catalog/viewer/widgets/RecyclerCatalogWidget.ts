import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IIconWindow} from '@core/window/components/IIconWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {ImageResult} from '@habbo/room/ImageResult';
import type {ISelectedRoomObjectData} from '@habbo/room/ISelectedRoomObjectData';
import type {HabboCatalog} from '../../HabboCatalog';
import {HabboCatalogUtils} from '../../HabboCatalogUtils';
import type {IRecycler} from '../../recycler/IRecycler';
import type {IRecyclerVisualization} from '../../recycler/IRecyclerVisualization';
import type {FurniSlotItem} from '../../recycler/FurniSlotItem';
import {CatalogObjectMover} from '../CatalogObjectMover';
import {CatalogWidget} from './CatalogWidget';
import {CatalogWidgetName} from './CatalogWidgetName';
import {FrankRecyclerEmotion} from './franksemotions/FrankRecyclerEmotion';
import {RecyclerEngineAnimator} from './utils/RecyclerEngineAnimator';

/**
 * The recycler machine widget: slot pool UI, ducket cost, spin-the-arrow animation, prize payoff.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/RecyclerCatalogWidget.as
 */
export class RecyclerCatalogWidget extends CatalogWidget implements IRecyclerVisualization, IGetImageListener
{
    private _mover: CatalogObjectMover | null = null;

    private _awaitingImages: Map<number, number> | null = null;

    private _animator: RecyclerEngineAnimator | null = null;

    private _timer: ReturnType<typeof setInterval> | null = null;

    private get recycler(): IRecycler | null
    {
        return (this.page?.viewer?.catalog as HabboCatalog | null)?.getRecycler() ?? null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/RecyclerCatalogWidget.as::dispose()
    override dispose(): void
    {
        if(this._mover != null)
        {
            this._mover.dispose();
            this._mover = null;
        }

        this.recycler?.cancel();

        if(this._animator != null)
        {
            this._animator.dispose();
            this._animator = null;
        }

        this.stopTimer();
        super.dispose();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/RecyclerCatalogWidget.as::init()
    override init(): boolean
    {
        if(!super.init()) return false;

        this.attachWidgetView(CatalogWidgetName.RECYCLER);
        this.renderSlotGraphics();
        this.renderDucketCost();

        this.window.findChildByName('recycler_recycle')?.addEventListener('WME_CLICK', this.onRecycleButtonClick);
        this.window.findChildByName('abort_region')?.addEventListener('WME_CLICK', this.onAbortClick);
        this.patFrankButton?.addEventListener('WME_CLICK', this.onPatFrank);
        this.abortButtonVisible = false;

        const arrow = this.window.findChildByName('pointer_arrow') as unknown as IStaticBitmapWrapperWindow | null;
        const recycleMachine = (this.window.parent as unknown as IWindowContainer | null)
            ?.findChildByName('recycle_machine') as unknown as IStaticBitmapWrapperWindow | null;

        if(arrow != null && recycleMachine != null)
        {
            this._animator = new RecyclerEngineAnimator(arrow, recycleMachine, this.onAnimationComplete);
        }

        if(this.recycler == null) return false;

        this.recycler.init(this);

        return true;
    }

    private onPatFrank = (_event: WindowEvent): void =>
    {
        if(this.emoji2BitmapTemplate == null) return;

        const emotion = new FrankRecyclerEmotion(this.emoji2BitmapTemplate);

        if(this.disabledBorder != null) emotion.start(this.disabledBorder);
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/RecyclerCatalogWidget.as::updateUI()
    updateUI(): void
    {
        let window: IWindow | null = this.window;

        while(window != null)
        {
            window.procedure = this.onMainContainerEvent;
            window.mouseThreshold = 0;
            window = window.parent;
        }

        const description = (this.window.parent as unknown as IWindowContainer | null)?.findChildByName('catalog.header.description');

        if(description != null) description.caption = '${recycler.info.ready}';

        if(this.disabledBorder != null && this.recycler != null) this.disabledBorder.visible = this.recycler.recyclerDisabled;

        this.updateRecycleButton();
    }

    private startTimer(): void
    {
        this._timer = setInterval(() => this.onTimerTick(), 1000);
    }

    private stopTimer(): void
    {
        if(this._timer != null)
        {
            clearInterval(this._timer);
            this._timer = null;
        }
    }

    private onTimerTick(): void
    {
        this.updateRecycleButton();

        if((this.recycler?.secondsToWait() ?? 0) <= 0) this.stopTimer();
    }

    private renderSlotGraphics(): void
    {
        const slotBg = this.getAssetBitmapData('ctlg_recycler_slot_bg');

        if(slotBg == null || this.recycler == null) return;

        for(let i = 1; i <= this.recycler.numberOfSlots; i++)
        {
            const bg = this.window.findChildByName(`slot_bg_${i}`) as unknown as IBitmapWrapperWindow | null;

            if(bg != null)
            {
                bg.bitmap = slotBg;
                bg.procedure = this.onSlotMouseEvent;
                bg.mouseThreshold = 0;
            }
        }

        for(let i = 1; i <= this.recycler.numberOfSlots; i++)
        {
            const img = this.window.findChildByName(`slot_img_${i}`) as unknown as IBitmapWrapperWindow | null;

            if(img != null)
            {
                img.bitmap = slotBg;
                img.procedure = this.onSlotMouseEvent;
                img.mouseThreshold = 0;
            }
        }
    }

    private renderDucketCost(): void
    {
        if(this.window == null || this.recycler == null) return;

        const text = this.window.findChildByName('ducket_cost') as unknown as ITextWindow | null;
        const icon = this.window.findChildByName('ducket_icon') as unknown as IIconWindow | null;
        const cost = this.recycler.ducketCost;

        if(cost === 0)
        {
            if(text != null) text.visible = false;
            if(icon != null) icon.visible = false;
        }
        else
        {
            if(text != null)
            {
                text.visible = true;
                text.text = String(cost);
            }

            if(icon != null) icon.visible = true;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/RecyclerCatalogWidget.as::updateSlots()
    updateSlots(): void
    {
        if(this.window == null || this.recycler == null) return;

        this._awaitingImages = new Map<number, number>();

        for(let i = 0; i < this.recycler.numberOfSlots; i++)
        {
            const img = this.window.findChildByName(`slot_img_${i + 1}`) as unknown as IBitmapWrapperWindow | null;

            if(img == null) return;

            const slot = this.recycler.getSlotContent(i);

            if(slot == null)
            {
                img.bitmap = null;
            }
            else
            {
                const result = this.getFurniImageResult(slot);

                if(result != null)
                {
                    if(result.data != null)
                    {
                        this.updateImage(result.data, img);
                    }
                    else
                    {
                        this._awaitingImages.set(result.id, i);
                    }
                }
            }
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/RecyclerCatalogWidget.as::updateImage()
    // TS deviation: AS3 composites the icon into a fresh white-filled BitmapData, centered by
    // hand, then disposes the source; ImageBitmap is immutable in the browser, so this reuses
    // the same HabboCatalogUtils.replaceCenteredImage() substitution already established
    // elsewhere in this module (see MarketPlaceCatalogWidget/DealPrizeContainer).
    private updateImage(data: ImageBitmap, target: IBitmapWrapperWindow): void
    {
        HabboCatalogUtils.replaceCenteredImage(target, data);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/RecyclerCatalogWidget.as::imageReady()
    imageReady(id: number, data: ImageBitmap | null): void
    {
        if(this._awaitingImages == null || data == null) return;

        const slotIndex = this._awaitingImages.get(id);

        if(slotIndex == null) return;

        this._awaitingImages.delete(id);

        const img = this.window.findChildByName(`slot_img_${slotIndex + 1}`) as unknown as IBitmapWrapperWindow | null;

        if(img == null) return;

        this.updateImage(data, img);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/RecyclerCatalogWidget.as::imageFailed()
    imageFailed(id: number): void
    {
        this._awaitingImages?.delete(id);
    }

    private getFurniImageResult(slot: FurniSlotItem): ImageResult | null
    {
        const roomEngine = this.page?.viewer?.roomEngine;

        if(!slot || !roomEngine) return null;

        if(slot.category === 10) return roomEngine.getFurnitureIcon(slot.typeId, this);
        if(slot.category === 20) return roomEngine.getWallItemIcon(slot.typeId, this, slot.xxxExtra);

        return null;
    }

    private get easterEggMode(): boolean
    {
        const roomEngine = this.page?.viewer?.roomEngine;

        if(this.recycler == null || !roomEngine) return false;

        for(let i = 0; i < this.recycler.numberOfSlots; i++)
        {
            const slot = this.recycler.getSlotContent(i);

            if(slot != null && roomEngine.getFurnitureType(slot.typeId) === 'wf_act_reset_timers') return true;
        }

        return false;
    }

    private onMainContainerEvent = (event: WindowEvent, window?: IWindow): void =>
    {
        const roomEngine = this.page?.viewer?.roomEngine;

        if(!this.page || !this.page.viewer || !roomEngine) return;

        const objectData: ISelectedRoomObjectData | null = roomEngine.getSelectedObjectData(roomEngine.activeRoomId);

        switch(event.type)
        {
            case 'WME_OUT':
            case 'WME_MOVE':
                this._mover?.onMainContainerEvent(event, window, objectData);
                break;

            case 'WME_OVER':
                if(this._mover == null)
                {
                    this._mover = new CatalogObjectMover();
                    this._mover.mainContainer = this.window;
                    this._mover.roomEngine = roomEngine;
                }
        }

        const moving = this._mover != null && this._mover.state;

        if(moving && roomEngine.getObjectMoverIconSpriteVisible())
        {
            roomEngine.setObjectMoverIconSpriteVisible(false);
        }
    };

    private onSlotMouseEvent = (event: WindowEvent, window?: IWindow): void =>
    {
        const mouseEvent = event as WindowMouseEvent;
        const roomEngine = this.page?.viewer?.roomEngine;

        if(!roomEngine || this.recycler == null) return;

        const objectData = roomEngine.getSelectedObjectData(roomEngine.activeRoomId);

        if(event.type === 'WME_UP')
        {
            const name = mouseEvent.window?.name ?? '';

            if(name.indexOf('slot_') === 0)
            {
                const slotId = parseInt(name.charAt(name.length - 1), 10) - 1;

                if(objectData != null)
                {
                    if(objectData.operation !== 'OBJECT_PLACE')
                    {
                        this.page.viewer.catalog.windowManager?.alert(
                            '${generic.alert.title}', '${catalog.alert.recycler.inventory}', 0, (dialog) => dialog.dispose());

                        return;
                    }

                    this.recycler.placeObjectAtSlot(slotId, objectData.id, objectData.category, objectData.typeId, objectData.instanceData);
                }
                else
                {
                    this.recycler.releaseSlot(slotId);
                }

                roomEngine.cancelRoomObjectInsert();
                this._mover?.resetIcon();

                return;
            }
        }

        if(event.type === 'WME_MOVE' && window) this.onMainContainerEvent(event, window);
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/RecyclerCatalogWidget.as::updateRecycleButton()
    updateRecycleButton(): void
    {
        if(this.disposed || this.window == null || this.recycler == null || this._animator == null) return;

        const button = this.window.findChildByName('recycler_recycle');

        if(button == null) return;

        const secondsToWait = this.recycler.secondsToWait();

        if(secondsToWait > 0)
        {
            button.caption = this.page.viewer.catalog.localization
                ?.getLocalizationWithParams('catalog.recycler.button.wait', '', 's', String(secondsToWait)) ?? '';
        }
        else
        {
            button.caption = '${catalog.recycler.button.recycle}';
        }

        if(this.recycler.isReadyToRecycle() && !this._animator.isBusy() && secondsToWait <= 0)
        {
            button.enable();
        }
        else
        {
            button.disable();
        }

        if(this._timer == null && this.recycler.secondsToWait() > 0) this.startTimer();
    }

    private onRecycleButtonClick = (_event: WindowEvent): void =>
    {
        if(this.recycler == null || this._animator == null) return;

        if(!this.recycler.hasEnoughDuckets())
        {
            this.page.viewer.catalog.windowManager?.alert(
                '${generic.alert.title}', '${catalog.alert.notenough.activitypoints.title.0}', 0, (dialog) => dialog.dispose());

            return;
        }

        this._animator.start(this.easterEggMode);
        this.updateRecycleButton();
        this.abortButtonVisible = true;
    };

    private onAbortClick = (_event: WindowEvent): void =>
    {
        this.abortButtonVisible = false;
        this._animator?.stop();
        this.updateRecycleButton();
        setTimeout(() => this.resetAnimation(), 650);
    };

    private onAnimationComplete = (): void =>
    {
        if(this.recycler != null)
        {
            this.recycler.executeRecycler();
            this.recycler.setNextRecycleAllowedTimestamp(performance.now() + this.recycler.timeout * 1000);
        }

        this.updateRecycleButton();
        setTimeout(() => this.resetAnimation(), 1000);
        this.abortButtonVisible = false;
    };

    private resetAnimation(): void
    {
        this._animator?.reset();
    }

    private set abortButtonVisible(value: boolean)
    {
        const region = this.window.findChildByName('abort_region');

        if(region != null) region.visible = value;
    }

    private get disabledBorder(): IWindowContainer | null
    {
        return this.window.findChildByName('disabled_border') as unknown as IWindowContainer | null;
    }

    private get patFrankButton(): IWindow | null
    {
        return this.window.findChildByName('pat_frank_btn');
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/RecyclerCatalogWidget.as::get emoji1Bitmap()
    // Unused in AS3 itself (only emoji2BitmapTemplate is ever read, from onPatFrank()) - ported
    // for member-level fidelity, not because anything calls it.
    private get emoji1Bitmap(): IStaticBitmapWrapperWindow | null
    {
        return this.window.findChildByName('emoji_1') as unknown as IStaticBitmapWrapperWindow | null;
    }

    private get emoji2BitmapTemplate(): IStaticBitmapWrapperWindow | null
    {
        return this.window.findChildByName('emoji_2_template') as unknown as IStaticBitmapWrapperWindow | null;
    }
}
