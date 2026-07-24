import {ColorMatrixFilter} from 'pixi.js';

import type {IDisposable} from '@core/runtime/IDisposable';
import type {IUpdateReceiver} from '@core/runtime';
import {OrderedMap} from '@core/utils/OrderedMap';

import type {IRoomObject} from '@room/object/IRoomObject';
import type {IRoomObjectController} from '@room/object/IRoomObjectController';
import type {IRoomEngineServices} from '@habbo/room/IRoomEngineServices';
import {RoomEngineObjectEvent} from '@habbo/room/events/RoomEngineObjectEvent';

import type {HabboUserDefinedRoomEvents} from '../../../HabboUserDefinedRoomEvents';
import {RoomObjectHighLighter} from '../../../wired_setup/RoomObjectHighLighter';
import {VariableInfoBubbleView} from './VariableInfoBubbleView';

/**
 * VariableHoldersHighlighter — highlights every room object (furni or user/bot) currently holding a
 * given wired variable, and floats a VariableInfoBubbleView above each showing its value. Furni get a
 * ColorMatrixFilter tint; users get a `figure_highlight_variable_holder` model flag their avatar
 * visualization reads. Bubbles are pooled and reused; removed holders are un-highlighted and their
 * bubbles recycled.
 *
 * Port note: AS3 tints with a ColorMatrixFilter + a GlowFilter. The port has no GlowFilter (no
 * pixi-filters dependency), so only the ColorMatrixFilter is applied — the same secondary-effect gap
 * already documented for the wall glow in RoomObjectHighLighter. TODO(AS3): add the GlowFilter once a
 * PixiJS glow is available.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_variable_overview/VariableHoldersHighlighter.as
 */
export class VariableHoldersHighlighter implements IDisposable, IUpdateReceiver
{
    // AS3: VariableHoldersHighlighter.as::_disposed
    private _disposed: boolean = false;

    // AS3: VariableHoldersHighlighter.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: VariableHoldersHighlighter.as::_SafeStr_6141 (name derived: furni objectId -> value string)
    private _furniHighlights: Map<number, string | null>;

    // AS3: VariableHoldersHighlighter.as::_SafeStr_5963 (name derived: user index -> value string)
    private _userHighlights: Map<number, string | null>;

    // AS3: VariableHoldersHighlighter.as::_SafeStr_4691 (name derived: filter stack)
    private _filters: unknown[];

    // AS3: VariableHoldersHighlighter.as::_SafeStr_6146 (name derived: recycled bubble pool)
    private _bubblePool: VariableInfoBubbleView[];

    // AS3: VariableHoldersHighlighter.as::_assignedBubbles
    private _assignedBubbles: OrderedMap<IRoomObject, VariableInfoBubbleView>;

    // AS3: VariableHoldersHighlighter.as::VariableHoldersHighlighter()
    constructor(roomEvents: HabboUserDefinedRoomEvents)
    {
        this._roomEvents = roomEvents;
        this._furniHighlights = new Map<number, string | null>();
        this._userHighlights = new Map<number, string | null>();
        this._bubblePool = [];
        this._assignedBubbles = new OrderedMap<IRoomObject, VariableInfoBubbleView>();

        // AS3 ColorMatrixFilter [0.9,0,0,0,0, 0,1,0,0,40, 0,0,1,0,80, 0,0,0,0.85,0] — green/blue lift +
        // 0.85 alpha; the 0-255 offsets (40/80) become PixiJS 0-1 (÷255).
        const colorMatrix = new ColorMatrixFilter();
        colorMatrix.matrix = [
            0.9, 0, 0, 0, 0,
            0, 1, 0, 0, 0.1569,
            0, 0, 1, 0, 0.3137,
            0, 0, 0, 0.85, 0
        ];

        // TODO(AS3): AS3 also stacks a GlowFilter(12318714,1,4,4,4,1,true,false); the port has no
        // GlowFilter, so it is dropped (only the ColorMatrixFilter tints holders).
        this._filters = [colorMatrix];

        this._roomEvents.roomEngine?.events.on(RoomEngineObjectEvent.REOE_REMOVED, this._onRoomObjectRemoved);
    }

    // AS3: VariableHoldersHighlighter.as::highlightObject()
    highlightObject(objectId: number, value: string | null): void
    {
        let isNew = true;

        if(this._furniHighlights.has(objectId))
        {
            if(this._furniHighlights.get(objectId) === value)
            {
                return;
            }

            isNew = false;
        }

        const object = this.getFurniRoomObject(objectId);

        if(object == null)
        {
            return;
        }

        this.setFurniObjectHighlightAndValue(isNew, object, value);
        this._furniHighlights.set(objectId, value);
    }

    // AS3: VariableHoldersHighlighter.as::highlightUser()
    highlightUser(index: number, value: string | null): void
    {
        let isNew = true;

        if(this._userHighlights.has(index))
        {
            if(this._userHighlights.get(index) === value)
            {
                return;
            }

            isNew = false;
        }

        const userData = this._roomEvents.roomSession?.userDataManager.getUserDataByIndex(index);

        if(userData == null)
        {
            return;
        }

        const object = this.getUserRoomObject(index);

        if(object == null)
        {
            return;
        }

        if(userData.type === 2)
        {
            this.setFurniObjectHighlightAndValue(isNew, object, value);
        }
        else
        {
            this.setUserObjectHighlightAndValue(isNew, object, value);
        }

        this._userHighlights.set(index, value);
    }

    // AS3: VariableHoldersHighlighter.as::removeRemovedHolders()
    removeRemovedHolders(keepFurni: Set<number>, keepUser: Set<number>): void
    {
        const removedFurni: number[] = [];

        for(const objectId of this._furniHighlights.keys())
        {
            if(!keepFurni.has(objectId))
            {
                const object = this.getFurniRoomObject(objectId);

                if(object != null)
                {
                    this.removeFurniObjectHighlightAndValue(object);
                    RoomObjectHighLighter.removeFiltersFromFurni(object, this._filters);
                }

                removedFurni.push(objectId);
            }
        }

        for(const objectId of removedFurni)
        {
            this._furniHighlights.delete(objectId);
        }

        const removedUsers: number[] = [];

        for(const index of this._userHighlights.keys())
        {
            if(!keepUser.has(index))
            {
                const object = this.getUserRoomObject(index);
                const userData = this._roomEvents.roomSession?.userDataManager.getUserDataByIndex(index);

                if(object != null && userData != null)
                {
                    if(userData.type === 2)
                    {
                        this.removeFurniObjectHighlightAndValue(object);
                    }
                    else
                    {
                        this.removeUserObjectHighlightAndValue(object);
                    }
                }

                removedUsers.push(index);
            }
        }

        for(const index of removedUsers)
        {
            this._userHighlights.delete(index);
        }
    }

    // AS3: VariableHoldersHighlighter.as::setFurniObjectHighlightAndValue()
    private setFurniObjectHighlightAndValue(isNew: boolean, object: IRoomObject, value: string | null): void
    {
        if(isNew)
        {
            RoomObjectHighLighter.addFiltersToFurni(object, this._filters);
        }

        this.updateBubbleForObject(object, value);
    }

    // AS3: VariableHoldersHighlighter.as::setUserObjectHighlightAndValue()
    private setUserObjectHighlightAndValue(isNew: boolean, object: IRoomObject, value: string | null): void
    {
        if(isNew)
        {
            (object as unknown as IRoomObjectController).getModelController().setNumber('figure_highlight_variable_holder', 1);
        }

        this.updateBubbleForObject(object, value, true);
    }

    // AS3: VariableHoldersHighlighter.as::onRoomObjectRemoved()
    private _onRoomObjectRemoved = (event: RoomEngineObjectEvent): void =>
    {
        // Preserved verbatim from AS3, including its index increment after a remove (which shifts the
        // list) — a latent quirk that can skip an entry, kept faithful.
        let index = 0;

        while(index < this._assignedBubbles.length)
        {
            const bubble = this._assignedBubbles.getWithIndex(index);

            if(bubble != null && bubble.objectId === event.objectId && bubble.category === event.category)
            {
                this._assignedBubbles.remove(this._assignedBubbles.getKey(index)!);
                bubble.setInactive();
                this._bubblePool.push(bubble);
            }

            index += 1;
        }
    };

    // AS3: VariableHoldersHighlighter.as::updateBubbleForObject()
    private updateBubbleForObject(object: IRoomObject, value: string | null, isUser: boolean = false): void
    {
        const bubble = this._assignedBubbles.getValue(object);

        if(value == null && bubble != null)
        {
            this.recycleBubbleForObject(object);
        }
        else if(value != null && bubble != null)
        {
            bubble.updateValue(value);
        }
        else if(value != null && bubble == null)
        {
            this.reuseOrCreateBubble(value, object, object.getId(), this.roomEngineServices.getRoomObjectCategory(object.getType()), isUser);
        }
    }

    // AS3: VariableHoldersHighlighter.as::get roomEngineServices()
    private get roomEngineServices(): IRoomEngineServices
    {
        return this._roomEvents.roomEngine as unknown as IRoomEngineServices;
    }

    // AS3: VariableHoldersHighlighter.as::removeFurniObjectHighlightAndValue()
    private removeFurniObjectHighlightAndValue(object: IRoomObject): void
    {
        RoomObjectHighLighter.removeFiltersFromFurni(object, this._filters);
        this.recycleBubbleForObject(object);
    }

    // AS3: VariableHoldersHighlighter.as::removeUserObjectHighlightAndValue()
    private removeUserObjectHighlightAndValue(object: IRoomObject): void
    {
        (object as unknown as IRoomObjectController).getModelController().setNumber('figure_highlight_variable_holder', 0);
        this.recycleBubbleForObject(object);
    }

    // AS3: VariableHoldersHighlighter.as::recycleBubbleForObject()
    private recycleBubbleForObject(object: IRoomObject): void
    {
        const bubble = this._assignedBubbles.remove(object);

        if(bubble != null)
        {
            bubble.setInactive();
            this._bubblePool.push(bubble);
        }
    }

    // AS3: VariableHoldersHighlighter.as::reuseOrCreateBubble()
    private reuseOrCreateBubble(value: string, object: IRoomObject, objectId: number, category: number, isUser: boolean): VariableInfoBubbleView
    {
        let bubble: VariableInfoBubbleView;

        if(this._bubblePool.length > 0)
        {
            bubble = this._bubblePool.pop()!;
        }
        else
        {
            bubble = new VariableInfoBubbleView(this._roomEvents);
        }

        this._assignedBubbles.add(object, bubble);
        bubble.setActive(value, objectId, category, isUser);
        return bubble;
    }

    // AS3: VariableHoldersHighlighter.as::clear()
    clear(): void
    {
        const empty = new Set<number>();
        this.removeRemovedHolders(empty, empty);
    }

    // AS3: VariableHoldersHighlighter.as::getFurniRoomObject()
    private getFurniRoomObject(objectId: number): IRoomObject | null
    {
        const engine = this._roomEvents.roomEngine;

        if(engine == null)
        {
            return null;
        }

        if(objectId < 0)
        {
            return engine.getRoomObject(this._roomEvents.roomId, -objectId, 20);
        }

        return engine.getRoomObject(this._roomEvents.roomId, objectId, 10);
    }

    // AS3: VariableHoldersHighlighter.as::getUserRoomObject()
    private getUserRoomObject(index: number): IRoomObject | null
    {
        return this._roomEvents.roomEngine?.getRoomObject(this._roomEvents.roomId, index, 100) ?? null;
    }

    // AS3: VariableHoldersHighlighter.as::update()
    update(deltaTime: number): void
    {
        for(const bubble of this._assignedBubbles.getValues())
        {
            bubble.update(deltaTime);
        }
    }

    // AS3: VariableHoldersHighlighter.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this.clear();
        this._roomEvents.roomEngine?.events.off(RoomEngineObjectEvent.REOE_REMOVED, this._onRoomObjectRemoved);

        for(const bubble of this._bubblePool)
        {
            bubble.dispose();
        }

        for(const bubble of this._assignedBubbles.getValues())
        {
            bubble.dispose();
        }

        this._bubblePool = null as unknown as VariableInfoBubbleView[];
        this._assignedBubbles = null as unknown as OrderedMap<IRoomObject, VariableInfoBubbleView>;
        this._furniHighlights = null as unknown as Map<number, string | null>;
        this._userHighlights = null as unknown as Map<number, string | null>;
        this._disposed = true;
    }

    // AS3: VariableHoldersHighlighter.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }
}
