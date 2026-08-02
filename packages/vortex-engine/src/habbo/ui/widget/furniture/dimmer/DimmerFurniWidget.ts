import type {EventEmitter} from 'eventemitter3';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import {RoomWidgetDimmerStateUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetDimmerStateUpdateEvent';
import {RoomWidgetDimmerUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetDimmerUpdateEvent';
import {RoomWidgetDimmerChangeStateMessage} from '@habbo/ui/widget/messages/RoomWidgetDimmerChangeStateMessage';
import {RoomWidgetDimmerPreviewMessage} from '@habbo/ui/widget/messages/RoomWidgetDimmerPreviewMessage';
import {RoomWidgetDimmerSavePresetMessage} from '@habbo/ui/widget/messages/RoomWidgetDimmerSavePresetMessage';
import {DimmerFurniWidgetPresetItem} from './DimmerFurniWidgetPresetItem';
import {DimmerView} from './DimmerView';

/**
 * DimmerFurniWidget
 *
 * The moodlight: three presets, seven fixed colours, a brightness slider and a
 * whole-room / background-only switch.
 *
 * The widget holds the state and the view holds the window — every user action lands here
 * as a `RoomWidget*Message` and every server answer arrives as a `RoomWidget*UpdateEvent`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/dimmer/DimmerFurniWidget.as
 */
export class DimmerFurniWidget extends RoomWidgetBase
{
    /** The seven colours the UI offers, in grid order. Not configurable, not from the server. */
    // AS3: .../dimmer/DimmerFurniWidget.as::AVAILABLE_COLORS
    private static readonly AVAILABLE_COLORS: number[] = [7665141, 21495, 15161822, 15353138, 15923281, 8581961, 0];

    /**
     * Minimum brightness per effect type, indexed by `type - 1`. Both are 76: below that the
     * room would be unreadably dark.
     */
    // AS3: .../dimmer/DimmerFurniWidget.as::_SafeStr_7879
    private static readonly MIN_LIGHTS: number[] = [76, 76];

    // AS3: .../dimmer/DimmerFurniWidget.as::DimmerFurniWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null = null,
        localizations: IHabboLocalizationManager | null = null
    )
    {
        super(handler, windowManager, assets, localizations);
    }

    // AS3: .../dimmer/DimmerFurniWidget.as::_SafeStr_4550
    private _view: DimmerView | null = null;

    // AS3: .../dimmer/DimmerFurniWidget.as::_SafeStr_5957
    private _presets: DimmerFurniWidgetPresetItem[] | null = null;

    // AS3: .../dimmer/DimmerFurniWidget.as::_SafeStr_6488
    private _selectedPresetIndex: number = 0;

    /** The object whose *state* is being tracked, which is not always the one being edited. */
    // AS3: .../dimmer/DimmerFurniWidget.as::_SafeStr_10099
    private _stateObjectId: number = 0;

    // AS3: .../dimmer/DimmerFurniWidget.as::_SafeStr_7207
    private _effectId: number = 0;

    // AS3: .../dimmer/DimmerFurniWidget.as::_color
    private _color: number = 16777215;

    // AS3: .../dimmer/DimmerFurniWidget.as::_SafeStr_7330
    private _brightness: number = 255;

    // AS3: .../dimmer/DimmerFurniWidget.as::_SafeStr_7108
    private _itemId: number = 0;

    // AS3: .../dimmer/DimmerFurniWidget.as::_SafeStr_6008
    private _isOn: boolean = false;

    // AS3: .../dimmer/DimmerFurniWidget.as::get isOn()
    public get isOn(): boolean
    {
        return this._isOn;
    }

    // AS3: .../dimmer/DimmerFurniWidget.as::get presets()
    public get presets(): DimmerFurniWidgetPresetItem[] | null
    {
        return this._presets;
    }

    // AS3: .../dimmer/DimmerFurniWidget.as::get colors()
    public get colors(): number[]
    {
        return DimmerFurniWidget.AVAILABLE_COLORS;
    }

    // AS3: .../dimmer/DimmerFurniWidget.as::get minLights()
    public get minLights(): number[]
    {
        return DimmerFurniWidget.MIN_LIGHTS;
    }

    // AS3: .../dimmer/DimmerFurniWidget.as::get selectedPresetIndex()
    public get selectedPresetIndex(): number
    {
        return this._selectedPresetIndex;
    }

    // AS3: .../dimmer/DimmerFurniWidget.as::set selectedPresetIndex()
    public set selectedPresetIndex(value: number)
    {
        this._selectedPresetIndex = value;
    }

    // AS3: .../dimmer/DimmerFurniWidget.as::registerUpdateEvents()
    public override registerUpdateEvents(dispatcher: EventEmitter): void
    {
        if(dispatcher === null) return;

        dispatcher.on(RoomWidgetDimmerUpdateEvent.PRESETS, this.onPresets);
        dispatcher.on(RoomWidgetDimmerUpdateEvent.DIMMER_HIDE, this.onHide);
        dispatcher.on(RoomWidgetDimmerStateUpdateEvent.DIMMER_STATE, this.onDimmerState);

        super.registerUpdateEvents(dispatcher);
    }

    // AS3: .../dimmer/DimmerFurniWidget.as::unregisterUpdateEvents()
    public override unregisterUpdateEvents(dispatcher: EventEmitter): void
    {
        if(dispatcher === null) return;

        dispatcher.off(RoomWidgetDimmerUpdateEvent.PRESETS, this.onPresets);
        dispatcher.off(RoomWidgetDimmerUpdateEvent.DIMMER_HIDE, this.onHide);
        dispatcher.off(RoomWidgetDimmerStateUpdateEvent.DIMMER_STATE, this.onDimmerState);
    }

    /** The presets answer is also what opens the window — there is no separate open message. */
    // AS3: .../dimmer/DimmerFurniWidget.as::onPresets()
    private onPresets = (event: RoomWidgetDimmerUpdateEvent): void =>
    {
        this._itemId = event.itemId;
        this._isOn = event.isOn;
        this._selectedPresetIndex = event.selectedPresetId - 1;
        this._presets = [];

        for(const preset of event.presets)
        {
            this._presets.push(new DimmerFurniWidgetPresetItem(preset.id, preset.type, preset.color, preset.light));
        }

        this.showInterface();
    };

    // AS3: .../dimmer/DimmerFurniWidget.as::onHide()
    private onHide = (event: RoomWidgetDimmerUpdateEvent): void =>
    {
        if(this._itemId === event.itemId)
        {
            this.disposeInterface();
        }
    };

    /**
     * Both the live state and the preview run through here: the engine reports what the room
     * is showing, and the widget echoes it straight back as a preview so the room keeps that
     * colour while the window is open.
     */
    // AS3: .../dimmer/DimmerFurniWidget.as::onDimmerState()
    private onDimmerState = (event: RoomWidgetDimmerStateUpdateEvent): void =>
    {
        if(event === null) return;

        if(event.state > 0)
        {
            this._stateObjectId = event.objectId;
        }

        if(this._stateObjectId === event.objectId)
        {
            this._effectId = event.effectId;
            this._color = event.color;
            this._brightness = event.brightness;
        }

        if(this._itemId === event.objectId)
        {
            this._isOn = event.state > 0;
        }

        this._view?.update();

        if(!DimmerFurniWidget.validateBrightness())
        {
            return;
        }

        this.messageListener?.processWidgetMessage(
            new RoomWidgetDimmerPreviewMessage(this._color, this._brightness, this._effectId === 2)
        );
    };

    // AS3: .../dimmer/DimmerFurniWidget.as::showInterface()
    private showInterface(): void
    {
        if(this._view === null)
        {
            this._view = new DimmerView(this);
        }

        this._view.showInterface();
    }

    // AS3: .../dimmer/DimmerFurniWidget.as::disposeInterface()
    private disposeInterface(): void
    {
        if(this._view !== null)
        {
            this._view.dispose();
            this._view = null;
        }
    }

    /**
     * `force` is the Apply button; without it a preset that has not actually changed is not
     * re-sent. AS3 writes the edit back into the local preset *before* the unchanged check
     * can matter, so the widget's copy is current either way.
     */
    // AS3: .../dimmer/DimmerFurniWidget.as::storeCurrentSetting()
    public storeCurrentSetting(force: boolean): void
    {
        if(!this._isOn || this.messageListener === null || this._view === null) return;

        const presetNumber = this._selectedPresetIndex + 1;

        if(this._presets === null || presetNumber < 0 || presetNumber > this._presets.length) return;

        const type = this._view.selectedType;
        const color = this.colors[this._view.selectedColorIndex] ?? 0;
        const brightness = this._view.selectedBrightness;
        const preset = this._presets[this._selectedPresetIndex] ?? null;

        if(preset !== null && preset.type === type && preset.color === color && preset.light === brightness && !force)
        {
            return;
        }

        // AS3 dereferences `_loc2_` unguarded here — it has already returned above when the
        // index is out of range, so a null preset means the array had a hole.
        if(preset === null) return;

        preset.type = type;
        preset.color = color;
        preset.light = brightness;

        if(!DimmerFurniWidget.validateBrightness()) return;

        this.messageListener.processWidgetMessage(
            new RoomWidgetDimmerSavePresetMessage(presetNumber, type, color, brightness, force, this._itemId)
        );
    }

    // AS3: .../dimmer/DimmerFurniWidget.as::previewCurrentSetting()
    public previewCurrentSetting(): void
    {
        if(!this._isOn || this.messageListener === null || this._view === null) return;

        if(!DimmerFurniWidget.validateBrightness()) return;

        this.messageListener.processWidgetMessage(new RoomWidgetDimmerPreviewMessage(
            this.colors[this._view.selectedColorIndex] ?? 0,
            this._view.selectedBrightness,
            this._view.selectedType === 2
        ));
    }

    // AS3: .../dimmer/DimmerFurniWidget.as::changeRoomDimmerState()
    public changeRoomDimmerState(): void
    {
        this.messageListener?.processWidgetMessage(new RoomWidgetDimmerChangeStateMessage(this._itemId));
    }

    /** Repaints the room with the *stored* setting, undoing an unapplied preview. */
    // AS3: .../dimmer/DimmerFurniWidget.as::removePreview()
    public removePreview(): void
    {
        if(this.messageListener === null) return;

        if(!DimmerFurniWidget.validateBrightness()) return;

        this.messageListener.processWidgetMessage(
            new RoomWidgetDimmerPreviewMessage(this._color, this._brightness, this._effectId === 2)
        );
    }

    /**
     * Unconditionally true in AS3 — the body is `return true`, with both arguments ignored.
     * Kept as the gate it is at all four call sites rather than inlined away, because the
     * name says what it was for and a real check would go here.
     */
    // AS3: .../dimmer/DimmerFurniWidget.as::validateBrightness()
    private static validateBrightness(): boolean
    {
        return true;
    }

    // AS3: .../dimmer/DimmerFurniWidget.as::dispose()
    public override dispose(): void
    {
        this.disposeInterface();

        this._presets = null;

        super.dispose();
    }
}
