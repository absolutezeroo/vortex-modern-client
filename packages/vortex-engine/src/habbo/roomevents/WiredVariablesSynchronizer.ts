import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {AllVariablesHashMessageEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/AllVariablesHashMessageEvent';
import {AllVariablesDiffMessageEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/AllVariablesDiffMessageEvent';
import type {AllVariablesHashMessageParser} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/AllVariablesHashMessageParser';
import type {AllVariablesDiffMessageParser} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/AllVariablesDiffMessageParser';
import {GetAllVariablesMessageComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/GetAllVariablesMessageComposer';
import {GetAllVariablesDiffMessageComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/GetAllVariablesDiffMessageComposer';

import type {HabboUserDefinedRoomEvents} from './HabboUserDefinedRoomEvents';
import {Util} from './Util';

type VariablesCallback = (variables: WiredVariable[]) => void;

/**
 * WiredVariablesSynchronizer — keeps a cache of the room's wired variables fresh via a hash/diff
 * protocol. getAllVariables() debounces requests, compares the server's hash to the cached one, and
 * fetches only the delta when they differ; listeners are notified with the sorted variable list once a
 * fetch completes.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/WiredVariablesSynchronizer.as
 */
export class WiredVariablesSynchronizer
{
    // AS3: WiredVariablesSynchronizer.as::STATUS_IDLE
    private static readonly STATUS_IDLE: number = 0;

    // AS3: WiredVariablesSynchronizer.as::STATUS_AWAIT_HASH
    private static readonly STATUS_AWAIT_HASH: number = 1;

    // AS3: WiredVariablesSynchronizer.as::STATUS_AWAIT_DIFFS
    private static readonly STATUS_AWAIT_DIFFS: number = 2;

    // AS3: WiredVariablesSynchronizer.as::REQUEST_OFFSET
    private static readonly REQUEST_OFFSET: number = 800;

    // AS3: WiredVariablesSynchronizer.as::INVALIDATE_REQUEST_OFFSET
    private static readonly INVALIDATE_REQUEST_OFFSET: number = 4000;

    // AS3: WiredVariablesSynchronizer.as::_disposed
    private _disposed: boolean = false;

    // AS3: WiredVariablesSynchronizer.as::_SafeStr_5407 (name derived: last request timestamp, ms)
    private _lastRequestTime: number = -1;

    // AS3: WiredVariablesSynchronizer.as::_status
    private _status: number = WiredVariablesSynchronizer.STATUS_IDLE;

    // AS3: WiredVariablesSynchronizer.as::_allVariablesHash
    private _allVariablesHash: number = 0;

    // AS3: WiredVariablesSynchronizer.as::_SafeStr_5119 (name derived: variableId -> variable cache)
    private _variableCache: Map<string, WiredVariable> | null = null;

    // AS3: WiredVariablesSynchronizer.as::_variableIdToHash
    private _variableIdToHash: Map<string, number> | null = null;

    // AS3: WiredVariablesSynchronizer.as::_listeners
    private _listeners: VariablesCallback[] = [];

    // AS3: WiredVariablesSynchronizer.as::_SafeStr_4546 (name derived: the roomevents component)
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: WiredVariablesSynchronizer.as::_messageEvents
    private _messageEvents: IMessageEvent[];

    // AS3: WiredVariablesSynchronizer.as::WiredVariablesSynchronizer()
    constructor(roomEvents: HabboUserDefinedRoomEvents)
    {
        this._roomEvents = roomEvents;
        this._messageEvents = [];
        this._messageEvents.push(new AllVariablesHashMessageEvent((event) => this.onAllVariablesHashEvent(event)));
        this._messageEvents.push(new AllVariablesDiffMessageEvent((event) => this.onAllVariablesDiffEvent(event)));

        for(const messageEvent of this._messageEvents)
        {
            this._roomEvents.communication?.addHabboConnectionMessageEvent(messageEvent);
        }
    }

    // AS3: WiredVariablesSynchronizer.as::getAllVariables()
    getAllVariables(callback: VariablesCallback, forceFetch: boolean = true, hashOverride: number = 0): boolean
    {
        const now = performance.now();

        if(this._status !== WiredVariablesSynchronizer.STATUS_IDLE && this._lastRequestTime < now - WiredVariablesSynchronizer.INVALIDATE_REQUEST_OFFSET)
        {
            this._status = WiredVariablesSynchronizer.STATUS_IDLE;
        }

        if(this._status !== WiredVariablesSynchronizer.STATUS_IDLE)
        {
            this.addListener(callback);
            return false;
        }

        if(this._lastRequestTime > now - WiredVariablesSynchronizer.REQUEST_OFFSET)
        {
            callback(this.sortedCachedVariables);
            return true;
        }

        if(!forceFetch && this._variableCache !== null)
        {
            callback(this.sortedCachedVariables);
            return true;
        }

        this._lastRequestTime = now;
        this._status = WiredVariablesSynchronizer.STATUS_AWAIT_HASH;
        this.addListener(callback);

        if(hashOverride !== 0)
        {
            this.onAllVariablesHash(hashOverride);
        }
        else
        {
            this._roomEvents.send(new GetAllVariablesMessageComposer());
        }

        return false;
    }

    // AS3: WiredVariablesSynchronizer.as::getCachedVariableById()
    getCachedVariableById(variableId: string): WiredVariable | null
    {
        return this._variableCache?.get(variableId) ?? null;
    }

    // AS3: WiredVariablesSynchronizer.as::onAllVariablesHashEvent()
    private onAllVariablesHashEvent(event: IMessageEvent): void
    {
        this.onAllVariablesHash((event.parser as AllVariablesHashMessageParser).allVariablesHash);
    }

    // AS3: WiredVariablesSynchronizer.as::onAllVariablesHash()
    private onAllVariablesHash(hash: number): void
    {
        if(this._status !== WiredVariablesSynchronizer.STATUS_AWAIT_HASH)
        {
            return;
        }

        this._lastRequestTime = performance.now();

        if(hash === this._allVariablesHash)
        {
            this.updateListeners();
            this._status = WiredVariablesSynchronizer.STATUS_IDLE;
        }
        else
        {
            this._allVariablesHash = hash;
            this._status = WiredVariablesSynchronizer.STATUS_AWAIT_DIFFS;
            this._roomEvents.send(new GetAllVariablesDiffMessageComposer(this._variableIdToHash));
        }
    }

    // AS3: WiredVariablesSynchronizer.as::onAllVariablesDiffEvent()
    private onAllVariablesDiffEvent(event: IMessageEvent): void
    {
        if(this._status !== WiredVariablesSynchronizer.STATUS_AWAIT_DIFFS)
        {
            return;
        }

        this._lastRequestTime = performance.now();
        const parser = event.parser as AllVariablesDiffMessageParser;
        this._allVariablesHash = parser.allVariablesHash;

        if(this._variableCache === null)
        {
            this._variableCache = new Map<string, WiredVariable>();
            this._variableIdToHash = new Map<string, number>();
        }

        this.deleteVariablesInCache(parser.removedVariables);
        this.updateVariablesInCache(parser.addedOrUpdated);

        if(parser.isLastChunk)
        {
            this.updateListeners();
            this._status = WiredVariablesSynchronizer.STATUS_IDLE;
        }
    }

    // AS3: WiredVariablesSynchronizer.as::deleteVariablesInCache()
    private deleteVariablesInCache(removed: string[]): void
    {
        for(const variableId of removed)
        {
            if(this._variableCache!.has(variableId))
            {
                this._variableCache!.delete(variableId);
                this._variableIdToHash!.delete(variableId);
            }
        }
    }

    // AS3: WiredVariablesSynchronizer.as::updateVariablesInCache()
    private updateVariablesInCache(addedOrUpdated: Map<WiredVariable, number>): void
    {
        for(const [variable, hash] of addedOrUpdated)
        {
            this._variableCache!.set(variable.variableId, variable);
            this._variableIdToHash!.set(variable.variableId, hash);
        }
    }

    // AS3: WiredVariablesSynchronizer.as::get sortedCachedVariables()
    private get sortedCachedVariables(): WiredVariable[]
    {
        if(this._variableCache === null)
        {
            return [];
        }

        const variables = [...this._variableCache.values()];
        Util.sortVariables(variables);
        return variables;
    }

    // AS3: WiredVariablesSynchronizer.as::addListener()
    private addListener(callback: VariablesCallback): void
    {
        if(this._listeners.indexOf(callback) === -1)
        {
            this._listeners.push(callback);
        }
    }

    // AS3: WiredVariablesSynchronizer.as::removeListener()
    removeListener(callback: VariablesCallback): void
    {
        const index = this._listeners.indexOf(callback);

        if(index !== -1)
        {
            this._listeners.splice(index, 1);
        }
    }

    // AS3: WiredVariablesSynchronizer.as::updateListeners()
    private updateListeners(): void
    {
        const variables = this.sortedCachedVariables;

        for(const listener of this._listeners)
        {
            listener(variables);
        }

        this._listeners = [];
    }

    // AS3: WiredVariablesSynchronizer.as::clear()
    clear(): void
    {
        this._listeners = [];
        this._variableCache = null;
        this._variableIdToHash = null;
        this._allVariablesHash = 0;
        this._lastRequestTime = -1;
        this._status = WiredVariablesSynchronizer.STATUS_IDLE;
    }

    // AS3: WiredVariablesSynchronizer.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._disposed = true;
        this._lastRequestTime = -1;
        this._status = WiredVariablesSynchronizer.STATUS_IDLE;
        this._allVariablesHash = 0;
        this._variableCache = null;
        this._variableIdToHash = null;

        for(const messageEvent of this._messageEvents)
        {
            this._roomEvents.communication?.removeHabboConnectionMessageEvent(messageEvent);
        }

        this._messageEvents = null as unknown as IMessageEvent[];
        this._roomEvents = null as unknown as HabboUserDefinedRoomEvents;
    }

    // AS3: WiredVariablesSynchronizer.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }
}
