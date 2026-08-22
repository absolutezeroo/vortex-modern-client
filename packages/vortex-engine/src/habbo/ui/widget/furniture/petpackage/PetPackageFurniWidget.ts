/**
 * PetPackageFurniWidget
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/petpackage/PetPackageFurniWidget.as
 *
 * The "name your pet" dialog for a pet package. Unlike the other furni widgets it is not opened by
 * a click at all: the room session raises `RSOPPE_OPEN_PET_PACKAGE_REQUESTED` and the handler turns
 * that into the update this widget listens for.
 */
import type {EventEmitter} from 'eventemitter3';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import {RoomWidgetPetPackageUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetPetPackageUpdateEvent';
import {RoomWidgetOpenPetPackageMessage} from '@habbo/ui/widget/messages/RoomWidgetOpenPetPackageMessage';

/**
 * AS3: PetPackageFurniWidget.as::GNOME_SPECIES_TYPE_ID
 *
 * Declared and never read anywhere in the class. Kept because it is a named AS3 constant, not a
 * local — dropping it would hide that the gnome was once special-cased here.
 */
export const GNOME_SPECIES_TYPE_ID: number = 26;

export class PetPackageFurniWidget extends RoomWidgetBase
{
    /**
    * AS3: PetPackageFurniWidget.as::onObjectUpdate() — the nameValidationStatus switch.
    *
    * 0 means the name was accepted and the dialog simply closes; every other value maps to a
    * `catalog.alert.petname.*` key, with anything unrecognised falling back to "bobba".
    */
    private static readonly NAME_VALIDATION_OK: number = 0;

    private static readonly NAME_ERROR_BY_STATUS: Readonly<Record<number, string>> = {1: 'long', 2: 'short', 3: 'chars'};

    private static readonly NAME_ERROR_FALLBACK: string = 'bobba';

    // AS3: PetPackageFurniWidget.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: PetPackageFurniWidget.as::_SafeStr_8605
    private _typeId: number = -1;

    // AS3: PetPackageFurniWidget.as::_SafeStr_4841
    private _objectId: number = -1;

    // AS3: PetPackageFurniWidget.as::_SafeStr_5427
    private _petImage: ImageBitmap | null = null;

    /**
     * Set while a name is in flight. It blocks a second send and, on the way back, makes the widget
     * ignore a result it did not ask for.
     */
    // AS3: PetPackageFurniWidget.as::_SafeStr_6206
    private _waitingForResult: boolean = false;

    // AS3: PetPackageFurniWidget.as::PetPackageFurniWidget()
    constructor(
        // AS3: PetPackageFurniWidget.as::PetPackageFurniWidget() param1
        handler: IRoomWidgetHandler,
        // AS3: PetPackageFurniWidget.as::PetPackageFurniWidget() param2
        windowManager: IHabboWindowManager,
        // AS3: PetPackageFurniWidget.as::PetPackageFurniWidget() param3
        assets: IAssetLibrary | null,
        // AS3: PetPackageFurniWidget.as::PetPackageFurniWidget() param4
        localizations: IHabboLocalizationManager | null
    )
    {
        super(handler, windowManager, assets, localizations);
    }

    // AS3: PetPackageFurniWidget.as::registerUpdateEvents()
    public override registerUpdateEvents(dispatcher: EventEmitter): void
    {
        if(!dispatcher) return;

        dispatcher.on(RoomWidgetPetPackageUpdateEvent.OPEN_PET_PACKAGE_REQUESTED, this.onObjectUpdate, this);
        dispatcher.on(RoomWidgetPetPackageUpdateEvent.OPEN_PET_PACKAGE_RESULT, this.onObjectUpdate, this);
        dispatcher.on(RoomWidgetPetPackageUpdateEvent.OPEN_PET_PACKAGE_UPDATE_PET_IMAGE, this.onObjectUpdate, this);

        super.registerUpdateEvents(dispatcher);
    }

    // AS3: PetPackageFurniWidget.as::unregisterUpdateEvents()
    public override unregisterUpdateEvents(dispatcher: EventEmitter): void
    {
        if(!dispatcher) return;

        dispatcher.off(RoomWidgetPetPackageUpdateEvent.OPEN_PET_PACKAGE_REQUESTED, this.onObjectUpdate, this);
        dispatcher.off(RoomWidgetPetPackageUpdateEvent.OPEN_PET_PACKAGE_RESULT, this.onObjectUpdate, this);
        dispatcher.off(RoomWidgetPetPackageUpdateEvent.OPEN_PET_PACKAGE_UPDATE_PET_IMAGE, this.onObjectUpdate, this);

        super.unregisterUpdateEvents(dispatcher);
    }

    // AS3: PetPackageFurniWidget.as::onObjectUpdate()
    private onObjectUpdate(event: RoomWidgetPetPackageUpdateEvent): void
    {
        switch(event.type)
        {
            case RoomWidgetPetPackageUpdateEvent.OPEN_PET_PACKAGE_REQUESTED:
                this.hideInterface();

                this._objectId = event.objectId;
                this._petImage = event.image;
                this._typeId = event.typeId;

                this.showInterface();
                this.showPetImage();
                break;
            case RoomWidgetPetPackageUpdateEvent.OPEN_PET_PACKAGE_RESULT: {
                // A result nobody asked for is dropped — see _waitingForResult.
                if(!this._waitingForResult) return;

                this._waitingForResult = false;

                if(event.nameValidationStatus === PetPackageFurniWidget.NAME_VALIDATION_OK)
                {
                    this.hideInterface();

                    return;
                }

                const error = PetPackageFurniWidget.NAME_ERROR_BY_STATUS[event.nameValidationStatus] ?? PetPackageFurniWidget.NAME_ERROR_FALLBACK;

                this.windowManager.alert(
                    '${widgets.petpackage.alert.petname.title}',
                    this.constructErrorMessage(error, event.nameValidationInfo),
                    0,
                    (dialog) => dialog.dispose()
                );
                break;
            }
            case RoomWidgetPetPackageUpdateEvent.OPEN_PET_PACKAGE_UPDATE_PET_IMAGE:
                if(event.objectId !== this._objectId) return;

                this._petImage = event.image;

                this.showPetImage();
                break;
        }
    }

    /**
     * Prefers the `.additionalInfo` variant when the server sent something to put in it, and falls
     * back to the plain message otherwise — an empty additional-info string must not blank the
     * alert.
     */
    // AS3: PetPackageFurniWidget.as::constructErrorMessage()
    private constructErrorMessage(error: string, additionalInfo: string | null): string
    {
        const key = `catalog.alert.petname.${error}`;
        const additionalKey = `${key}.additionalInfo`;

        this.localizations?.registerParameter(additionalKey, 'additional_info', additionalInfo ?? '');

        const message = this.localizations?.getLocalization(key) ?? '';
        const additionalMessage = this.localizations?.getLocalization(additionalKey) ?? '';

        if(additionalInfo !== null && additionalInfo.length > 0 && additionalMessage.length > 0)
        {
            return additionalMessage;
        }

        return message;
    }

    // AS3: PetPackageFurniWidget.as::hideInterface()
    private hideInterface(): void
    {
        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        this._objectId = -1;
        this._waitingForResult = false;
        this._petImage = null;
    }

    /**
     * Two layouts: `petpackage` when a pet image is available, `petpackage_new` when it is not —
     * the latter has no preview slot, so a package whose figure has not resolved still shows a
     * usable dialog.
     */
    // AS3: PetPackageFurniWidget.as::showInterface()
    private showInterface(): void
    {
        if(this._objectId < 0) return;

        const layout = this._petImage !== null ? 'petpackage' : 'petpackage_new';

        if(!this.assets?.hasAsset(layout)) return;

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        this._window = this.windowManager.buildWidgetLayout(layout) as IWindowContainer | null;

        if(this._window === null) return;

        this._window.center();

        // AS3 looks for the close button inside the frame's header, not the window at large.
        const close = this._window.findChildByTag('close');

        if(close !== null) close.procedure = this.onWindowClose;

        const pickName = this._window.findChildByName('pick_name');

        if(pickName !== null) pickName.procedure = this.onMouseEvent;

        const cancel = this._window.findChildByName('cancel');

        if(cancel !== null) cancel.procedure = this.onMouseEvent;

        this._window.procedure = this.onMouseEvent;

        this.showPetImage();
    }

    /**
     * AS3 centres the pet by blitting it into a fresh BitmapData at a computed offset; this assigns
     * the bitmap and lets the wrapper's anchor centre it, as the ecotron box does.
     */
    // AS3: PetPackageFurniWidget.as::showPetImage()
    private showPetImage(): void
    {
        if(this._petImage === null || this._window === null) return;

        const image = this._window.findChildByName('pet_image') as IBitmapWrapperWindow | null;

        if(image !== null)
        {
            image.bitmap = this._petImage;
        }
    }

    // AS3: PetPackageFurniWidget.as::onWindowClose()
    private onWindowClose = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.hideInterface();
    };

    // AS3: PetPackageFurniWidget.as::onMouseEvent()
    private onMouseEvent = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        switch(window.name)
        {
            case 'pick_name':
                this.sendOpenPetPackage();
                break;
            case 'cancel':
                this.hideInterface();
                break;
        }
    };

    /**
     * An empty name is refused client-side with the same "too short" alert the server would send,
     * so the round trip is skipped entirely.
     */
    // AS3: PetPackageFurniWidget.as::sendOpenPetPackage()
    private sendOpenPetPackage(): void
    {
        if(this._waitingForResult || this._objectId === -1) return;

        const name = this.getName();

        if(name === null || name.length < 1)
        {
            this.windowManager.alert(
                '${widgets.petpackage.alert.petname.title}',
                '${catalog.alert.petname.short}',
                0,
                (dialog) => dialog.dispose()
            );

            return;
        }

        if(this.messageListener !== null)
        {
            this._waitingForResult = true;

            this.messageListener.processWidgetMessage(new RoomWidgetOpenPetPackageMessage(
                RoomWidgetOpenPetPackageMessage.WIDGET_MESSAGE_OPEN_PET_PACKAGE, this._objectId, name
            ));
        }
    }

    // AS3: PetPackageFurniWidget.as::getName()
    private getName(): string | null
    {
        if(this._window)
        {
            const input = this._window.findChildByName('input') as ITextFieldWindow | null;

            if(input) return input.text;
        }

        return null;
    }

    // AS3: PetPackageFurniWidget.as::dispose()
    public override dispose(): void
    {
        this.hideInterface();

        super.dispose();
    }
}
