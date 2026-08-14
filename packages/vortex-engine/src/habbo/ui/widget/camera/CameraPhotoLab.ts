import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {CameraPublishStatusMessageEvent} from '@habbo/communication/messages/incoming/camera/CameraPublishStatusMessageEvent';
import type {CompetitionStatusMessageEvent} from '@habbo/communication/messages/incoming/camera/CompetitionStatusMessageEvent';
import {CameraEffect} from './CameraEffect';
import {CameraFxPreloader} from './CameraFxPreloader';
import {CameraFxStrengthSlider} from './CameraFxStrengthSlider';
import {PhotoPurchaseConfirmationDialog} from './PhotoPurchaseConfirmationDialog';
import type {CameraWidget} from './CameraWidget';

/**
 * The photo editor: filter grid, strength slider, caption field, zoom toggle and the entry point
 * into the purchase dialog.
 *
 * Two details are load-bearing. The filter buttons cannot be built until `CameraFxPreloader` has
 * finished, so `buildFilterButtons()` re-schedules itself every 200 ms — and, exactly as AS3, does
 * *not* return after doing so, meaning the first pass also runs to completion. And the effect
 * catalogue is gated by the player's `ACH_CameraPhotoCount` achievement level: below an effect's
 * level the button is built locked rather than omitted.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/camera/CameraPhotoLab.as
 */
export class CameraPhotoLab
{
    // AS3: .../ui/widget/camera/CameraPhotoLab.as::TEXT_WIDTH_MARGIN
    private static readonly TEXT_WIDTH_MARGIN: number = 6;

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::_SafeStr_4808
    private static _purchaseDialog: PhotoPurchaseConfirmationDialog | null = null;

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::_SafeStr_4549
    private _widget: CameraWidget | null;

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::_SafeStr_4794
    private _imageWindow: (IWindow & { bitmap?: ImageBitmap | null }) | null = null;

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::_SafeStr_7384
    private _originalImage: ImageBitmap | null = null;

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::_SafeStr_5289
    private _strengthSlider: CameraFxStrengthSlider | null = null;

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::_sliderEffectInfo
    private _sliderEffectInfo: IWindow | null = null;

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::_SafeStr_4917
    private _activeEffect: CameraEffect | null = null;

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::_SafeStr_5006
    private _effectButtons: Map<string, CameraEffect> | null = new Map();

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::_itemGrid
    private _itemGrid: IWindowContainer | null = null;

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::_SafeStr_6837
    private _typeButtons: Map<string, IWindow> | null = new Map();

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::_captionInputKeyEvents
    private _captionInputKeyEvents: number = 0;

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::_SafeStr_9339
    private _lastCaptionText: string = '';

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::_SafeStr_8068
    private _zoomed: boolean = false;

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::CameraPhotoLab()
    constructor(widget: CameraWidget)
    {
        this._widget = widget;
    }

    /**
	 * Only composite and frame effects have a texture to fetch; colour-matrix ones are pure maths.
	 */
    // AS3: .../ui/widget/camera/CameraPhotoLab.as::preloadEffects()
    static preloadEffects(imageLibraryUrl: string, availableEffects: string, localizations: IHabboLocalizationManager): void
    {
        const names: string[] = [];
        const effects = CameraEffect.getEffects(availableEffects, localizations);

        for(const effect of effects.values())
        {
            if(effect.type === CameraEffect.TYPE_COMPOSITE || effect.type === CameraEffect.TYPE_FRAME)
            {
                names.push(effect.name);
            }
        }

        CameraFxPreloader.init(imageLibraryUrl, names);
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        CameraPhotoLab._purchaseDialog?.hide();

        CameraEffect.resetAllEffects();

        this._originalImage = null;
        this._widget = null;
        this._imageWindow = null;

        if(this._strengthSlider !== null)
        {
            this._strengthSlider.dispose();
            this._strengthSlider = null;
        }

        this._sliderEffectInfo = null;
        this._activeEffect = null;
        this._effectButtons = null;
        this._typeButtons = null;
        this._disposed = true;

        if(this._window)
        {
            this._window.dispose();
        }

        this._window = null;
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::setImageAndFilterButtons()
    private setImageAndFilterButtons(image: ImageBitmap | null): void
    {
        this._originalImage = image;

        if(this._imageWindow) this._imageWindow.bitmap = image;

        this.buildFilterButtons();
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::setSelectedFxValue()
    setSelectedFxValue(value: number): void
    {
        if(this._activeEffect)
        {
            this._activeEffect.value = value;
            this.updateSliderEffectInfo();
            this.renderAllEffects();
        }
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::updateSliderEffectInfo()
    private updateSliderEffectInfo(): void
    {
        if(this._sliderEffectInfo === null || this._activeEffect === null) return;

        this._sliderEffectInfo.caption = this._activeEffect.description + ' '
            + Math.trunc(this._activeEffect.getEffectStrength() * 100) + '%';
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::setCaptionText()
    setCaptionText(text: string): void
    {
        const input = this._window?.findChildByName('captionInput');

        if(input) input.caption = text;
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::buildTypeButtons()
    private buildTypeButtons(): void
    {
        const spacing = 6;

        if(this._typeButtons === null || this._typeButtons.size > 0 || this._window === null || this._itemGrid === null)
        {
            return;
        }

        const left = this._itemGrid.x;
        const colorButton = this.createTypeButton(CameraEffect.TYPE_COLORMATRIX, 'camera_icon_colorfilter');

        if(colorButton)
        {
            colorButton.x = left + (this._itemGrid.width - (2 * (colorButton.width + spacing) - spacing)) / 2;
            colorButton.y = 50;
            this._window.addChild(colorButton);
        }

        const compositeButton = this.createTypeButton(CameraEffect.TYPE_COMPOSITE, 'camera_icon_compositefilter');

        if(compositeButton && colorButton)
        {
            compositeButton.x = colorButton.x + colorButton.width + spacing;
            compositeButton.y = colorButton.y;
            this._window.addChild(compositeButton);
        }
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::buildFilterButtons()
    private buildFilterButtons(): void
    {
        // AS3 has no `return` here: the first call both schedules the retry and falls through, so
        // the buttons are built once immediately and rebuilt once the preloader reports finished.
        if(CameraFxPreloader.preloadFinished() === false)
        {
            setTimeout(() => this.buildFilterButtons(), 200);
        }

        if(this._widget === null || this._window === null) return;

        let achievementLevel = 0;
        const questEngine = this._widget.handler?.roomDesktop?.questEngine ?? null;

        if(questEngine !== null)
        {
            achievementLevel = questEngine.getAchievementLevel('explore', 'ACH_CameraPhotoCount');

            if(achievementLevel === 0)
            {
                achievementLevel = questEngine.getAchievementLevel('archive', 'ACH_CameraPhotoCount');
            }
        }

        const effects = CameraEffect.getEffects(
            this._widget.component?.getProperty('camera.available.effects') ?? null,
            this._widget.localizations as IHabboLocalizationManager
        );

        for(const effect of effects.values())
        {
            const button = this.createFxButton(effect, achievementLevel);

            if(button)
            {
                let tooltip = effect.description;

                if(achievementLevel < effect.achievementLevel)
                {
                    tooltip = (this._widget.localizations?.getLocalization('camera.effect.required.level') ?? '')
                        + ' ' + effect.achievementLevel;
                }

                (button as IWindow & { toolTipCaption?: string }).toolTipCaption = tooltip;
            }
        }

        const sliderContainer = this._window.findChildByName('slider_container') as IWindowContainer | null;

        if(sliderContainer)
        {
            this._strengthSlider = new CameraFxStrengthSlider(this, sliderContainer, this._widget.assets);
            this._strengthSlider.disable();
            CameraEffect.setMaxValue(this._strengthSlider.getScale());
        }

        this.setFilterType(CameraEffect.TYPE_COLORMATRIX);
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::createTypeButton()
    private createTypeButton(type: string, iconAssetName: string): IWindow | null
    {
        const button = this._widget?.getXmlWindow('camera_typebutton') ?? null;

        if(button === null) return null;

        const icon = (button as IWindowContainer).findChildByName('icon') as (IWindow & { bitmap?: ImageBitmap | null }) | null;

        if(icon)
        {
            icon.bitmap = (this._widget?.assets?.getAssetByName(iconAssetName)?.content ?? null) as ImageBitmap | null;
        }

        button.name = 'typebutton,' + type;
        (button as IWindow & { toolTipCaption?: string }).toolTipCaption = type;

        this._typeButtons?.set(type, button);

        return button;
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::createFxButton()
    private createFxButton(effect: CameraEffect, achievementLevel: number): IWindow | null
    {
        const button = this._widget?.getXmlWindow('camera_filterbutton') ?? null;

        if(button === null) return null;

        if(achievementLevel >= effect.achievementLevel)
        {
            // A composite or frame effect whose texture never loaded produces no button at all —
            // AS3 returns null and the effect silently drops out of the grid.
            if(effect.type !== CameraEffect.TYPE_COLORMATRIX && CameraFxPreloader.getImage(effect.name) === null)
            {
                return null;
            }

            // TODO(AS3): .../CameraPhotoLab.as::createFxButton()
            // AS3 renders a live preview into the button: a scaled copy of the photo with this one
            // effect applied (applyFilter for colormatrix, draw with the blend mode for composite,
            // plain draw for frame). That needs a mutable bitmap target and a colour-matrix filter
            // over BitmapData, neither of which the port's window components expose, so the button
            // is built without its thumbnail. Everything else — the lock state, the tooltip, the
            // click routing — is real.
            button.procedure = this.effectButtonClick;
        }
        else
        {
            const lock = (button as IWindowContainer).findChildByName('lock_indicator');

            if(lock) lock.visible = true;
        }

        button.name = effect.name;
        effect.button = button as IWindowContainer;
        this._effectButtons?.set(button.name, effect);

        return button;
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::openPhotoLab()
    openPhotoLab(image: ImageBitmap | null): void
    {
        if(this._widget === null) return;

        this._window = this._widget.getXmlWindow('camera_editor') as IWindowContainer | null;

        if(this._window === null) return;

        this._window.center();

        // With effects off the lab is never shown at all — the flow jumps straight to purchase.
        if(this._widget.component?.getProperty('camera.effects.enabled') !== 'true')
        {
            this.openPurchaseConfirmationDialog();

            return;
        }

        this._itemGrid = this._window.findChildByName('item_grid') as IWindowContainer | null;
        this._imageWindow = this._window.findChildByName('image') as (IWindow & { bitmap?: ImageBitmap | null }) | null;
        this._window.procedure = this.windowEventHandler;

        const captionInput = this._window.findChildByName('captionInput');

        if(captionInput) captionInput.procedure = this.captionProcedure;

        // AS3 lays a transparent Sprite over these two regions to catch clicks; the port routes
        // both through the window procedure below instead, which the layout already supports.
        this.buildTypeButtons();
        this.setImageAndFilterButtons(image);

        this._sliderEffectInfo = this._window.findChildByName('slider_effect_info');

        CameraEffect.resetAllEffects();
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::effectButtonClick()
    private effectButtonClick = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        if(window.name === 'remove_effect_button')
        {
            const parentName = window.parent?.name ?? '';

            if(this._effectButtons?.has(parentName))
            {
                const effect = this._effectButtons.get(parentName) as CameraEffect;

                effect.setChosen(false);

                if(this._activeEffect === effect)
                {
                    this._strengthSlider?.disable();
                    this._activeEffect = null;
                }

                this.renderAllEffects();

                return;
            }
        }

        if(this._effectButtons?.has(window.name))
        {
            this.setActiveEffect(this._effectButtons.get(window.name) as CameraEffect);
        }
    };

    /**
	 * Guards the caption against paste and IME input: a change that did not follow exactly one
	 * key-down is reverted to the last accepted text.
	 */
    // AS3: .../ui/widget/camera/CameraPhotoLab.as::captionProcedure()
    private captionProcedure = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type === 'WKE_KEY_DOWN')
        {
            const keyEvent = event as WindowKeyboardEvent;

            if(keyEvent.ctrlKey || keyEvent.charCode === 0)
            {
                this._captionInputKeyEvents = 0;
            }
            else
            {
                this._captionInputKeyEvents = this._captionInputKeyEvents + 1;
            }
        }
        else if(event.type === 'WKE_KEY_UP')
        {
            this._captionInputKeyEvents = 0;
        }
        else if(event.type === 'WE_CHANGE')
        {
            if(this._captionInputKeyEvents === 1)
            {
                this._lastCaptionText = this._window?.findChildByName('captionInput')?.caption ?? '';
            }
            else
            {
                this.setCaptionText(this._lastCaptionText);
            }

            this._captionInputKeyEvents = 0;
        }
    };

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::openPurchaseConfirmationDialog()
    private openPurchaseConfirmationDialog(): void
    {
        if(this._widget === null) return;

        CameraPhotoLab._purchaseDialog?.hide();

        if(this._widget.container?.sessionDataManager?.isAccountSafetyLocked())
        {
            this._widget.windowManager.alert('${generic.alert.title}', '${notifications.text.safety_locked}', 0, null);

            // With effects disabled the lab window is the dialog's only owner, so it goes too.
            if(this._widget.component?.getProperty('camera.effects.enabled') !== 'true')
            {
                this.dispose();
            }

            return;
        }

        const caption = this._window?.findChildByName('captionInput')?.caption ?? '';

        CameraPhotoLab._purchaseDialog = new PhotoPurchaseConfirmationDialog(this._widget, caption);

        const sent = this._widget.sendPhotoData();

        CameraPhotoLab._purchaseDialog.setPrices(
            this._widget.handler?.creditPrice ?? 0,
            this._widget.handler?.ducketPrice ?? 0,
            this._widget.handler?.publishDucketPrice ?? 0
        );

        if(!sent)
        {
            CameraPhotoLab._purchaseDialog.setRenderingFailed();
            this._widget.windowManager.alert('${generic.alert.title}', '${camera.alert.too_much_stuff}', 0, null);
        }

        this.hide();
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::hide()
    hide(): void
    {
        if(this._window) this._window.visible = false;
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::show()
    show(): void
    {
        if(this._window) this._window.visible = true;
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::closePurchaseConfirmation()
    closePurchaseConfirmation(): void
    {
        if(CameraPhotoLab._purchaseDialog)
        {
            CameraPhotoLab._purchaseDialog.hide();
            CameraPhotoLab._purchaseDialog = null;
        }
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::animateSuccessfulPurchase()
    animateSuccessfulPurchase(): void
    {
        CameraPhotoLab._purchaseDialog?.animateIconToToolbar();
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::publishingStatus()
    publishingStatus(event: CameraPublishStatusMessageEvent): void
    {
        CameraPhotoLab._purchaseDialog?.publishingStatus(event);
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::competitionStatus()
    competitionStatus(event: CompetitionStatusMessageEvent): void
    {
        CameraPhotoLab._purchaseDialog?.competitionStatus(event);
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::offerSaveAsFile()
    private offerSaveAsFile(): void
    {
        // TODO(AS3): .../CameraPhotoLab.as::offerSaveAsFile()
        // AS3 PNG-encodes the edited BitmapData and hands it to `FileReference.save()` as
        // `Habbo_yyyy-MM-dd_HH-mm-ss.png`. Both halves are missing here: the port has no mutable
        // bitmap to encode and no file-save bridge.
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::logChosenEffects()
    logChosenEffects(): void
    {
        // TODO(AS3): .../CameraPhotoLab.as::logChosenEffects()
        // AS3 sends one `stories.photo.effect.chosen` entry per active effect through
        // HabboTracking; the port has no tracking sink for the Stories category.
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::windowEventHandler()
    private windowEventHandler = (event: WindowEvent, window: IWindow): void =>
    {
        if(this._disposed || !this._window || event.type !== 'WME_CLICK')
        {
            return;
        }

        switch(window.name)
        {
            case 'cancel_button':
                this._widget?.startTakingPhoto('effectEditorCancel');
                this.dispose();
                break;

            case 'header_button_close':
                this.dispose();
                break;

            case 'help_button':
                this._widget?.component?.context?.createLinkEvent('habbopages/camera');
                break;

            case 'zoom_button':
                this._zoomed = !this._zoomed;
                this.renderAllEffects();
                break;

            case 'purchase_display_object':
                this.openPurchaseConfirmationDialog();
                break;

            case 'save_click_catcher':
                this.offerSaveAsFile();
                break;

            case 'save_button':
            case 'slider_container':
                break;

            default:
                // AS3 puts `default` in the middle of the switch: any click that is not one of the
                // named controls dismisses the slider and drops the active effect's highlight.
                this._strengthSlider?.disable();
                this._activeEffect?.turnOffHighlight();
                break;
        }

        if(window.name.indexOf('typebutton') !== -1)
        {
            this.setFilterType(window.name.split(',')[1]);
        }
    };

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::setActiveEffect()
    private setActiveEffect(effect: CameraEffect): void
    {
        this._activeEffect?.turnOffHighlight();

        this._activeEffect = effect;
        this._activeEffect.setChosen(true);

        if(effect.usesEffectStrength())
        {
            this._strengthSlider?.enable();
            this._strengthSlider?.setValue(effect.value);
            this.updateSliderEffectInfo();
        }
        else
        {
            this._strengthSlider?.disable();
        }

        if(effect.allowsOnlyOneInstance())
        {
            this.turnOffOtherEffectsOfSameType(effect);
        }

        this.renderAllEffects();
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::turnOffOtherEffectsOfSameType()
    private turnOffOtherEffectsOfSameType(effect: CameraEffect): void
    {
        if(this._effectButtons === null) return;

        for(const other of this._effectButtons.values())
        {
            if(other.type === effect.type && other !== effect)
            {
                other.setChosen(false);
            }
        }
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::setFilterType()
    private setFilterType(type: string): void
    {
        this._activeEffect?.turnOffHighlight();

        if(this._itemGrid === null || this._effectButtons === null) return;

        // TODO(AS3): .../CameraPhotoLab.as::setFilterType()
        // AS3 calls IScrollableGridWindow.removeGridItems()/addGridItem(); the port's containers
        // have no grid API, so the buttons are shown/hidden in place instead of being re-flowed.
        for(const effect of this._effectButtons.values())
        {
            if(effect.button) effect.button.visible = effect.type === type;
        }

        this.highlightSelectedButtonType(type);
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::highlightSelectedButtonType()
    private highlightSelectedButtonType(type: string): void
    {
        if(this._typeButtons === null) return;

        for(const button of this._typeButtons.values())
        {
            const border = (button as IWindowContainer).findChildByName('active_border');

            if(border) border.visible = button.name === 'typebutton,' + type;
        }
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::renderAllEffects()
    private renderAllEffects(): void
    {
        // TODO(AS3): .../CameraPhotoLab.as::renderAllEffects()
        // The heart of the editor and the one part that cannot be ported yet. AS3 clones the
        // original BitmapData, optionally 2x-zooms it through a Matrix, applies every active
        // colormatrix effect with applyFilter(), draws every active composite with its blend mode
        // and a ColorTransform alpha of the effect strength, then draws the frames last, and finally
        // assigns the result to the preview window. All four primitives are missing here:
        // BitmapData.clone/applyFilter/draw and ColorTransform. The effect *state* is fully tracked
        // — `getEffectDataJson()` below reports it to the server correctly, so the photo the server
        // renders does carry the chosen effects; only the local preview does not update.
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::setRenderedPhotoUrl()
    setRenderedPhotoUrl(url: string): void
    {
        CameraPhotoLab._purchaseDialog?.setImageUrl(url);
    }

    /**
	 * The effect list sent to the server with the render request. Frames come last and carry no
	 * alpha, because the server composites them over everything else.
	 */
    // AS3: .../ui/widget/camera/CameraPhotoLab.as::getEffectDataJson()
    getEffectDataJson(): string
    {
        const result: { name: string; alpha?: number }[] = [];

        if(this._effectButtons !== null)
        {
            for(const effect of this._effectButtons.values())
            {
                if(effect.isOn && effect.type !== CameraEffect.TYPE_FRAME)
                {
                    result.push({name: effect.name, alpha: Math.trunc(effect.getEffectStrength() * 255)});
                }
            }

            for(const effect of this._effectButtons.values())
            {
                if(effect.isOn && effect.type === CameraEffect.TYPE_FRAME)
                {
                    result.push({name: effect.name});
                }
            }
        }

        return JSON.stringify(result);
    }

    // AS3: .../ui/widget/camera/CameraPhotoLab.as::getZoom()
    getZoom(): number
    {
        return this._zoomed ? 2 : 1;
    }
}
