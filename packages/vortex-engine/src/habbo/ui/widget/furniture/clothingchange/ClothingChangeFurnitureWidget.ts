import type {EventEmitter} from 'eventemitter3';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';

import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import {
    RoomWidgetClothingChangeUpdateEvent
} from '@habbo/ui/widget/events/RoomWidgetClothingChangeUpdateEvent';
import {
    RoomWidgetClothingChangeMessage
} from '@habbo/ui/widget/messages/RoomWidgetClothingChangeMessage';

const log = Logger.getLogger('habbo.ui.widget.furniture.clothingchange.ClothingChangeFurnitureWidget');

/**
 * ClothingChangeFurnitureWidget
 *
 * The boy/girl chooser a clothing-change furni opens. Picking a side sends
 * `RWCCM_REQUEST_EDITOR` with that gender and closes; the editor itself is somebody else's
 * job (`RWCCUE_SHOW_CLOTHING_EDITOR` is registered but, as in AS3, does nothing here).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/clothingchange/ClothingChangeFurnitureWidget.as
 */
export class ClothingChangeFurnitureWidget extends RoomWidgetBase
{
    // AS3: .../clothingchange/ClothingChangeFurnitureWidget.as::_SafeStr_11191
    private static readonly BUTTON_BOY: string = 'Boy';

    // AS3: .../clothingchange/ClothingChangeFurnitureWidget.as::_SafeStr_11242
    private static readonly BUTTON_GIRL: string = 'Girl';

    // AS3: .../clothingchange/ClothingChangeFurnitureWidget.as::ClothingChangeFurnitureWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null = null,
        localizations: IHabboLocalizationManager | null = null
    )
    {
        super(handler, windowManager, assets, localizations);
    }

    // AS3: .../clothingchange/ClothingChangeFurnitureWidget.as::_SafeStr_5449
    private _window: IWindowContainer | null = null;

    // AS3: .../clothingchange/ClothingChangeFurnitureWidget.as::_SafeStr_4841
    private _objectId: number = 0;

    // AS3: .../clothingchange/ClothingChangeFurnitureWidget.as::_SafeStr_8829
    private _objectCategory: number = 0;

    // AS3: .../clothingchange/ClothingChangeFurnitureWidget.as::_SafeStr_6722
    private _roomId: number = 0;

    // AS3: .../clothingchange/ClothingChangeFurnitureWidget.as::registerUpdateEvents()
    public override registerUpdateEvents(dispatcher: EventEmitter): void
    {
        if(dispatcher === null) return;

        dispatcher.on(RoomWidgetClothingChangeUpdateEvent.SHOW_GENDER_SELECTION, this.onUpdate);
        dispatcher.on(RoomWidgetClothingChangeUpdateEvent.SHOW_CLOTHING_EDITOR, this.onUpdate);

        super.registerUpdateEvents(dispatcher);
    }

    // AS3: .../clothingchange/ClothingChangeFurnitureWidget.as::unregisterUpdateEvents()
    public override unregisterUpdateEvents(dispatcher: EventEmitter): void
    {
        if(dispatcher === null) return;

        dispatcher.off(RoomWidgetClothingChangeUpdateEvent.SHOW_GENDER_SELECTION, this.onUpdate);
        dispatcher.off(RoomWidgetClothingChangeUpdateEvent.SHOW_CLOTHING_EDITOR, this.onUpdate);
    }

    /** Only the gender selection is handled; AS3's switch has no editor branch either. */
    // AS3: .../clothingchange/ClothingChangeFurnitureWidget.as::onUpdate()
    private onUpdate = (event: RoomWidgetClothingChangeUpdateEvent): void =>
    {
        if(event.type === RoomWidgetClothingChangeUpdateEvent.SHOW_GENDER_SELECTION)
        {
            this.showGenderSelectionInterface(event);
        }
    };

    // AS3: .../clothingchange/ClothingChangeFurnitureWidget.as::showGenderSelectionInterface()
    private showGenderSelectionInterface(event: RoomWidgetClothingChangeUpdateEvent): void
    {
        this.hideGenderSelectionInterface();

        this._objectId = event.objectId;
        this._objectCategory = event.objectCategory;
        this._roomId = event.roomId;

        const asset = this.assets?.getAssetByName('boygirl') as XmlAsset | null;

        if(asset === null || asset === undefined)
        {
            log.warn('Missing layout "boygirl" - the gender chooser cannot open');

            return;
        }

        this._window = this.windowManager.buildFromXML(asset.content as unknown as string) as IWindowContainer | null;

        if(this._window === null) return;

        this._window.addEventListener('WME_CLICK', this.onGenderSelectionMouseEvent);
        this._window.center();

        const closeButton = this._window.findChildByTag('close');

        if(closeButton !== null)
        {
            closeButton.procedure = this.onGenderSelectionWindowClose;
        }

        for(const name of [ClothingChangeFurnitureWidget.BUTTON_BOY, ClothingChangeFurnitureWidget.BUTTON_GIRL])
        {
            this._window.findChildByName(name)?.addEventListener('WME_CLICK', this.onGenderSelectionMouseEvent);
        }
    }

    // AS3: .../clothingchange/ClothingChangeFurnitureWidget.as::hideGenderSelectionInterface()
    private hideGenderSelectionInterface(): void
    {
        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    // AS3: .../clothingchange/ClothingChangeFurnitureWidget.as::onGenderSelectionWindowClose()
    private onGenderSelectionWindowClose = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.hideGenderSelectionInterface();
    };

    // AS3: .../clothingchange/ClothingChangeFurnitureWidget.as::onGenderSelectionMouseEvent()
    private onGenderSelectionMouseEvent = (event: WindowMouseEvent): void =>
    {
        const name = (event.target as IWindow | null)?.name ?? '';

        switch(name)
        {
            case ClothingChangeFurnitureWidget.BUTTON_BOY:
                this.requestEditor('M');
                this.hideGenderSelectionInterface();
                break;
            case ClothingChangeFurnitureWidget.BUTTON_GIRL:
                this.requestEditor('F');
                this.hideGenderSelectionInterface();
                break;
            case 'close':
            case 'close_btn':
                this.hideGenderSelectionInterface();
                break;
        }
    };

    // AS3: .../clothingchange/ClothingChangeFurnitureWidget.as::requestEditor()
    private requestEditor(gender: string): void
    {
        this.messageListener?.processWidgetMessage(new RoomWidgetClothingChangeMessage(
            RoomWidgetClothingChangeMessage.REQUEST_EDITOR, gender, this._objectId, this._objectCategory, this._roomId
        ));
    }

    // AS3: .../clothingchange/ClothingChangeFurnitureWidget.as::dispose()
    public override dispose(): void
    {
        this.hideGenderSelectionInterface();

        super.dispose();
    }
}
