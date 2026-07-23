/**
 * EffectsWidgetHandler
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/_SafeCls_3455.as
 *
 * Handler for the RWE_EFFECTS widget (the me-menu effects flyout). Opens the
 * widget on the RWRWM_EFFECTS request and re-opens it whenever the owned-effects
 * list changes (HIEE_EFFECTS_CHANGED on the inventory).
 */
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {RoomWidgetMessage} from '@habbo/ui/widget/messages/RoomWidgetMessage';
import type {RoomWidgetUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetUpdateEvent';
import type {EffectsWidget} from '@habbo/ui/widget/effects/EffectsWidget';
import {HabboInventoryEffectsEvent} from '@habbo/inventory/events/HabboInventoryEffectsEvent';

export class EffectsWidgetHandler implements IRoomWidgetHandler
{
    private _disposed: boolean = false;
    private _container: IRoomWidgetHandlerContainer | null = null;
    private _widget: EffectsWidget | null = null;

    // AS3: _SafeCls_3455.as::set widget()
    public set widget(value: EffectsWidget | null)
    {
        this._widget = value;
    }

    // AS3: _SafeCls_3455.as::get type()
    public get type(): string
    {
        return 'RWE_EFFECTS';
    }

    // AS3: _SafeCls_3455.as::set container() / get container()
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container?.inventory?.events.off(
            HabboInventoryEffectsEvent.HIEE_EFFECTS_CHANGED,
            this.onEffectsChanged
        );

        this._container = value;

        this._container?.inventory?.events.on(
            HabboInventoryEffectsEvent.HIEE_EFFECTS_CHANGED,
            this.onEffectsChanged
        );
    }

    public get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    // AS3: _SafeCls_3455.as::onEffectsChanged()
    private onEffectsChanged = (): void =>
    {
        this._widget?.open();
    };

    // AS3: _SafeCls_3455.as::getWidgetMessages()
    public getWidgetMessages(): string[]
    {
        return ['RWRWM_EFFECTS'];
    }

    // AS3: _SafeCls_3455.as::getProcessedEvents()
    public getProcessedEvents(): string[]
    {
        return [];
    }

    // AS3: _SafeCls_3455.as::processWidgetMessage()
    public processWidgetMessage(message: RoomWidgetMessage): RoomWidgetUpdateEvent | null
    {
        if(!message) return null;

        if(message.type === 'RWRWM_EFFECTS')
        {
            this._widget?.open();
        }

        return null;
    }

    // AS3: _SafeCls_3455.as::processEvent()
    public processEvent(_event: unknown): void
    {
    }

    // AS3: _SafeCls_3455.as::update()
    public update(): void
    {
    }

    // AS3: _SafeCls_3455.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this.container = null;
        this._widget = null;
        this._disposed = true;
    }

    // AS3: _SafeCls_3455.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }
}
