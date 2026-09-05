/**
 * FakeContext
 *
 * @see sources/WIN63-202607011411-782849652/src/binaryData/FakeContext.as
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

    // AS3: .../src/binaryData/FakeContext.as::get events()
    get events(): EventEmitter 
    {
        return this._events;
    }

    private _configuration: ICoreConfiguration | null = null;

    // AS3: .../src/binaryData/FakeContext.as::get configuration()
    get configuration(): ICoreConfiguration | null 
    {
        return this._configuration;
    }

    // AS3: .../src/binaryData/FakeContext.as::set configuration()
    set configuration(value: ICoreConfiguration | null) 
    {
        this._configuration = value;
    }

    private _disposed: boolean = false;

    // AS3: .../src/binaryData/FakeContext.as::get disposed()
    get disposed(): boolean 
    {
        return this._disposed;
    }

    // AS3: .../src/binaryData/FakeContext.as::get root()
    get root(): IContext 
    {
        return this;
    }

    // AS3: .../src/binaryData/FakeContext.as::get assets()
    get assets(): IAssetLibrary | null 
    {
        return null;
    }

    // AS3: .../src/binaryData/FakeContext.as::queueInterface()
    queueInterface<T>(_iid: IID<T>, _callback?: InterfaceCallback<T>): T | null 
    {
        return null;
    }

    // AS3: .../src/binaryData/FakeContext.as::attachComponent()
    attachComponent(_component: Component, _interfaces: IID[]): void 
    {
        // No-op
    }

    // AS3: .../src/binaryData/FakeContext.as::detachComponent()
    detachComponent(_component: Component): void 
    {
        // No-op
    }

    // AS3: .../src/binaryData/FakeContext.as::registerUpdateReceiver()
    registerUpdateReceiver(_receiver: IUpdateReceiver, _priority: number): void 
    {
        // No-op
    }

    // AS3: .../src/binaryData/FakeContext.as::removeUpdateReceiver()
    removeUpdateReceiver(_receiver: IUpdateReceiver): void 
    {
        // No-op
    }

    /**
	 * AS3 returns `null` here, not an empty vector — a caller iterating it would throw. Returning
	 * `[]` instead, since AS3's own `for each (… in null)` is a silent no-op and this port's is
	 * not; the one caller, `HTMLTextController`, walks it directly.
	 */
    // AS3: .../src/binaryData/FakeContext.as::get linkEventTrackers()
    get linkEventTrackers(): readonly ILinkEventTracker[]
    {
        return [];
    }

    // AS3: .../src/binaryData/FakeContext.as::addLinkEventTracker()
    addLinkEventTracker(_tracker: ILinkEventTracker): void
    {
        // No-op
    }

    // AS3: .../src/binaryData/FakeContext.as::removeLinkEventTracker()
    removeLinkEventTracker(_tracker: ILinkEventTracker): void 
    {
        // No-op
    }

    // AS3: .../src/binaryData/FakeContext.as::createLinkEvent()
    createLinkEvent(_link: string): void 
    {
        // No-op
    }

    // Returns false: this fake never disposes itself, so a caller must never
    // treat an error here as "the context tore itself down, stop what you were
    // doing" (see IContext.error()).
    // AS3: .../src/binaryData/FakeContext.as::error()
    error(_message: string, _fatal?: boolean, _code?: number, _error?: Error): boolean
    {
        return false;
    }

    // AS3: .../src/binaryData/FakeContext.as::warning()
    warning(_message: string): void 
    {
        // No-op
    }

    // AS3: .../src/binaryData/FakeContext.as::debug()
    debug(_message: string): void
    {
        // No-op
    }

    // The three message-history getters and prepareAssetLibrary are stubs in AS3 too — this
    // context logs nothing and owns no asset library, so it has nothing to hand back.
    // AS3: .../src/binaryData/FakeContext.as::getLastErrorMessage()
    getLastErrorMessage(): string
    {
        return '';
    }

    // AS3: .../src/binaryData/FakeContext.as::getLastDebugMessage()
    getLastDebugMessage(): string
    {
        return '';
    }

    // AS3: .../src/binaryData/FakeContext.as::getLastWarningMessage()
    getLastWarningMessage(): string
    {
        return '';
    }

    // AS3: .../src/binaryData/FakeContext.as::prepareAssetLibrary()
    prepareAssetLibrary(_manifest: object, _resourceData: unknown): boolean
    {
        return false;
    }

    // AS3: .../src/binaryData/FakeContext.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._events.removeAllListeners();
        this._configuration = null;
    }

    // DEVIATION: AS3's FakeContext implements `_SafeCls_57` — the *full* core interface — and the
    //   thirty members below are its shims for that: every one returns `null`, `false`, `""`, `0`
    //   or an empty `Dictionary`, and none is ever called. It implements them because ActionScript
    //   has no way to implement half an interface, not because a caller wants them.
    //
    //   The check, and it is the one that decides this: `Component`'s constructor takes
    //   `_SafeCls_54` (`public function _SafeCls_50(param1:_SafeCls_54, …)`), not `_SafeCls_57` —
    //   so every consumer of this object, in AS3 as here, only ever sees the `IContext` half.
    //   `LoginFlow.createFakeContext()` builds a localization manager, a communication manager and
    //   a separate configuration object from it; not one of them reaches past `IContext`.
    //   `IContext.ts`'s own header records the same decision for the interface side, checked on
    //   2026-08-27 and again on 2026-09-05: the seventeen `_SafeCls_57` extras are AIR plumbing
    //   with zero callers outside `core/runtime`, and a browser has no file proxy. The four
    //   `_SafeCls_54` members left out — `displayObjectContainer`, `loadFromFile`,
    //   `prepareComponent`, `toXMLString` — each carry their own `DEVIATION:` on
    //   `ComponentContext`, which is the class that would have to mean something by them.
    //
    //   `injectDependencies` is declared on no interface in any tree; it is FakeContext's own.
    // AS3: .../src/binaryData/FakeContext.as::get displayObjectContainer()
    // AS3: .../src/binaryData/FakeContext.as::loadFromFile()
    // AS3: .../src/binaryData/FakeContext.as::prepareComponent()
    // AS3: .../src/binaryData/FakeContext.as::toXMLString()
    // AS3: .../src/binaryData/FakeContext.as::release()
    // AS3: .../src/binaryData/FakeContext.as::injectDependencies()
    // AS3: .../src/binaryData/FakeContext.as::initialize()
    // AS3: .../src/binaryData/FakeContext.as::purge()
    // AS3: .../src/binaryData/FakeContext.as::hibernate()
    // AS3: .../src/binaryData/FakeContext.as::resume()
    // AS3: .../src/binaryData/FakeContext.as::readConfigDocument()
    // AS3: .../src/binaryData/FakeContext.as::writeDictionaryToProxy()
    // AS3: .../src/binaryData/FakeContext.as::readDictionaryFromProxy()
    // AS3: .../src/binaryData/FakeContext.as::writeXMLToProxy()
    // AS3: .../src/binaryData/FakeContext.as::readXMLFromProxy()
    // AS3: .../src/binaryData/FakeContext.as::readStringFromProxy()
    // AS3: .../src/binaryData/FakeContext.as::writeStringToProxy()
    // AS3: .../src/binaryData/FakeContext.as::getNumberOfFilesPending()
    // AS3: .../src/binaryData/FakeContext.as::getNumberOfFilesLoaded()
    // AS3: .../src/binaryData/FakeContext.as::setProfilerMode()
    // AS3: .../src/binaryData/FakeContext.as::get arguments()
    // AS3: .../src/binaryData/FakeContext.as::clearArguments()
    // AS3: .../src/binaryData/FakeContext.as::propertyExists()
    // AS3: .../src/binaryData/FakeContext.as::getProperty()
    // AS3: .../src/binaryData/FakeContext.as::setProperty()
    // AS3: .../src/binaryData/FakeContext.as::getBoolean()
    // AS3: .../src/binaryData/FakeContext.as::getInteger()
    // AS3: .../src/binaryData/FakeContext.as::interpolate()
    // AS3: .../src/binaryData/FakeContext.as::updateUrlProtocol()
    // AS3: .../src/binaryData/FakeContext.as::get fileProxy()
}
