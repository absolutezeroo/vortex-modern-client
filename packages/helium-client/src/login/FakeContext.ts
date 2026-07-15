/**
 * FakeContext
 *
 * @see sources/PRODUCTION-201601012205-226667486/FakeContext.as
 *
 * Stub IContext implementation for standalone Components created outside the
 * main engine context. Used by LoginFlow.createFakeContext() to create
 * standalone HabboLocalizationManager and HabboCommunicationManager instances.
 *
 * All DI methods (queueInterface, attachComponent, etc.) are no-ops since
 * these standalone managers don't participate in the engine's dependency graph.
 */
import {EventEmitter} from 'eventemitter3';
import type {Component, IContext, ICoreConfiguration, IID, InterfaceCallback, IUpdateReceiver} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';

export class FakeContext implements IContext 
{
    private _events: EventEmitter = new EventEmitter();

    get events(): EventEmitter 
    {
        return this._events;
    }

    private _configuration: ICoreConfiguration | null = null;

    get configuration(): ICoreConfiguration | null 
    {
        return this._configuration;
    }

    set configuration(value: ICoreConfiguration | null) 
    {
        this._configuration = value;
    }

    private _disposed: boolean = false;

    get disposed(): boolean 
    {
        return this._disposed;
    }

    get root(): IContext 
    {
        return this;
    }

    get assets(): IAssetLibrary | null 
    {
        return null;
    }

    queueInterface<T>(_iid: IID<T>, _callback?: InterfaceCallback<T>): T | null 
    {
        return null;
    }

    attachComponent(_component: Component, _interfaces: IID[]): void 
    {
        // No-op
    }

    detachComponent(_component: Component): void 
    {
        // No-op
    }

    registerUpdateReceiver(_receiver: IUpdateReceiver, _priority: number): void 
    {
        // No-op
    }

    removeUpdateReceiver(_receiver: IUpdateReceiver): void 
    {
        // No-op
    }

    addLinkEventTracker(_tracker: ILinkEventTracker): void 
    {
        // No-op
    }

    removeLinkEventTracker(_tracker: ILinkEventTracker): void 
    {
        // No-op
    }

    createLinkEvent(_link: string): void 
    {
        // No-op
    }

    error(_message: string, _fatal?: boolean, _code?: number, _error?: Error): void 
    {
        // No-op
    }

    warning(_message: string): void 
    {
        // No-op
    }

    debug(_message: string): void 
    {
        // No-op
    }

    dispose(): void 
    {
        if(this._disposed) return;

        this._disposed = true;
        this._events.removeAllListeners();
        this._configuration = null;
    }
}
