import type EventEmitter from 'eventemitter3';
import type {IWindow} from '@core/window/IWindow';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IRoomWidgetHandler} from '../../../IRoomWidgetHandler';
import {ChooserWidgetBase} from '../ChooserWidgetBase';
import type {ChooserItem} from '../ChooserItem';
import {RoomWidgetChooserContentEvent} from '../../events/RoomWidgetChooserContentEvent';
import {RoomWidgetRoomObjectUpdateEvent} from '../../events/RoomWidgetRoomObjectUpdateEvent';
import {RoomWidgetRequestWidgetMessage} from '../../messages/RoomWidgetRequestWidgetMessage';
import {FurniView} from './FurniView';

/**
 * Owns the list behind the furni chooser.
 *
 * Where the user chooser re-asks for the *whole* list on any change, this one maintains it
 * incrementally: a removal is spliced out locally, and an addition asks the handler for that one
 * item. A room with hundreds of furni would make the user chooser's approach unusable.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/chooser/furni/FurniChooserWidget.as
 */
export class FurniChooserWidget extends ChooserWidgetBase
{
    // AS3: .../chooser/furni/FurniChooserWidget.as::_view
    private _view: FurniView | null = null;

    // AS3: .../chooser/furni/FurniChooserWidget.as::_items
    private _items: ChooserItem[] | null = null;

    // AS3: .../chooser/furni/FurniChooserWidget.as::_knownIds
    // Name DERIVED (`_SafeStr_7457`): the id set that makes the incremental add idempotent, so a
    // duplicate `RWCCE_FURNI_CHOOSER_CONTENT_ADD` cannot double-list an item.
    private _knownIds: Set<number> = new Set();

    // AS3: .../chooser/furni/FurniChooserWidget.as::FurniChooserWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null = null,
        localizations: IHabboLocalizationManager | null = null
    )
    {
        super(handler, windowManager, assets, localizations);
    }

    // AS3: .../chooser/furni/FurniChooserWidget.as::get items()
    get items(): ChooserItem[] | null
    {
        return this._items;
    }

    // AS3: .../chooser/furni/FurniChooserWidget.as::get mainWindow()
    // Not overridden in AS3 — the view places its own window against the parent's corner.
    override get mainWindow(): IWindow | null
    {
        return null;
    }

    // AS3: .../chooser/furni/FurniChooserWidget.as::registerUpdateEvents()
    override registerUpdateEvents(events: EventEmitter | null): void
    {
        if(events === null) return;

        events.on(RoomWidgetChooserContentEvent.FURNI_CHOOSER_CONTENT, this.onChooserContent);
        events.on(RoomWidgetChooserContentEvent.FURNI_CHOOSER_CONTENT_ADD, this.onChooserContentAdded);
        events.on(RoomWidgetRoomObjectUpdateEvent.FURNI_REMOVED, this.onUpdateFurniChooser);
        events.on(RoomWidgetRoomObjectUpdateEvent.FURNI_ADDED, this.onUpdateFurniChooser);

        super.registerUpdateEvents(events);
    }

    // AS3: .../chooser/furni/FurniChooserWidget.as::unregisterUpdateEvents()
    // No super call, as in AS3.
    override unregisterUpdateEvents(events: EventEmitter | null): void
    {
        if(events === null) return;

        events.off(RoomWidgetChooserContentEvent.FURNI_CHOOSER_CONTENT, this.onChooserContent);
        events.off(RoomWidgetChooserContentEvent.FURNI_CHOOSER_CONTENT_ADD, this.onChooserContentAdded);
        events.off(RoomWidgetRoomObjectUpdateEvent.FURNI_REMOVED, this.onUpdateFurniChooser);
        events.off(RoomWidgetRoomObjectUpdateEvent.FURNI_ADDED, this.onUpdateFurniChooser);
    }

    // AS3: .../chooser/furni/FurniChooserWidget.as::dispose()
    override dispose(): void
    {
        if(this._view !== null)
        {
            this._view.dispose();
            this._view = null;
        }

        super.dispose();
    }

    /**
     * Replaces the whole list. Items with a non-positive id are dropped — that is how the
     * placeholder objects the engine keeps for furni still loading stay out of the chooser.
     *
     * Sorted by lower-cased name then by id **descending**, matching the user chooser.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/chooser/furni/FurniChooserWidget.as::onChooserContent()
    private onChooserContent = (event: RoomWidgetChooserContentEvent): void =>
    {
        if(event === null || event === undefined || event.items === null) return;

        if(this._view === null) this._view = new FurniView(this, '${widget.chooser.furni.title}');

        this._items = [];
        this._knownIds = new Set();

        for(const item of event.items)
        {
            if(item.id <= 0) continue;

            this._items.push(item);
            this._knownIds.add(item.id);
        }

        this._items.sort((a, b) =>
        {
            if(a.lowerCaseName < b.lowerCaseName) return -1;

            if(a.lowerCaseName > b.lowerCaseName) return 1;

            return b.id - a.id;
        });

        this._view.onItemsChanged();
    };

    /**
     * The incremental half: appends only ids not already listed, and redraws **only if something
     * was actually added**. Note it does *not* re-sort — a newly placed item lands at the bottom
     * of the list until the next full refresh.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/chooser/furni/FurniChooserWidget.as::onChooserContentAdded()
    private onChooserContentAdded = (event: RoomWidgetChooserContentEvent): void =>
    {
        if(event === null || event === undefined || event.items === null) return;

        if(this._view === null || this._items === null) return;

        let added = false;

        for(const item of event.items)
        {
            if(item.id <= 0 || this._knownIds.has(item.id)) continue;

            this._items.push(item);
            this._knownIds.add(item.id);
            added = true;
        }

        if(added) this._view.onItemsChanged();
    };

    /**
     * A removal is handled locally — found by id **and** category, spliced out, redrawn, and the
     * loop returns rather than continuing, so only the first match goes.
     *
     * An addition cannot be: the widget has no way to build a `ChooserItem` from an id, so it
     * asks the handler for that one item and waits for `RWCCE_FURNI_CHOOSER_CONTENT_ADD`.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/chooser/furni/FurniChooserWidget.as::onUpdateFurniChooser()
    private onUpdateFurniChooser = (event: RoomWidgetRoomObjectUpdateEvent): void =>
    {
        if(this._view === null || !this._view.isOpen()) return;

        if(event.type === RoomWidgetRoomObjectUpdateEvent.FURNI_REMOVED)
        {
            if(this._items === null) return;

            for(let i = 0; i < this._items.length; i++)
            {
                const item = this._items[i];

                if(item === undefined || item.id !== event.id || item.category !== event.category) continue;

                this._items.splice(i, 1);
                this._knownIds.delete(item.id);
                this._view.onItemsChanged();

                return;
            }

            return;
        }

        if(event.type === RoomWidgetRoomObjectUpdateEvent.FURNI_ADDED)
        {
            this.messageListener?.processWidgetMessage(new RoomWidgetRequestWidgetMessage(
                RoomWidgetRequestWidgetMessage.REQUEST_FURNI_CHOOSER_ADD, event.id, event.category
            ));
        }
    };
}
