import type {ChatBubbleSimulationEntity} from './ChatBubbleSimulationEntity';

/**
 * ChatBubbleCollisionEvent
 *
 * Small pairwise wrapper over two intersecting ChatBubbleSimulationEntity
 * instances, built fresh every simulate() iteration for each colliding pair -
 * exposes ordering helpers (top/bottom/left/right/older) so simulate() can
 * decide which bubble absorbs the resolution impulse without repeating the
 * same comparisons inline.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleCollisionEvent.as
 */
export class ChatBubbleCollisionEvent
{
    private readonly _first: ChatBubbleSimulationEntity;
    private readonly _second: ChatBubbleSimulationEntity;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleCollisionEvent.as::ChatBubbleCollisionEvent()
    constructor(first: ChatBubbleSimulationEntity, second: ChatBubbleSimulationEntity)
    {
        this._first = first;
        this._second = second;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleCollisionEvent.as::get first()
    get first(): ChatBubbleSimulationEntity
    {
        return this._first;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleCollisionEvent.as::get second()
    get second(): ChatBubbleSimulationEntity
    {
        return this._second;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleCollisionEvent.as::get top()
    get top(): ChatBubbleSimulationEntity
    {
        return this._first.y < this._second.y ? this._first : this._second;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleCollisionEvent.as::get bottom()
    get bottom(): ChatBubbleSimulationEntity
    {
        return this._first.y >= this._second.y ? this._first : this._second;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleCollisionEvent.as::get left()
    get left(): ChatBubbleSimulationEntity
    {
        return this._first.x < this._second.x ? this._first : this._second;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleCollisionEvent.as::get right()
    get right(): ChatBubbleSimulationEntity
    {
        return this._first.x >= this._second.x ? this._first : this._second;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleCollisionEvent.as::get areSameY()
    get areSameY(): boolean
    {
        return Math.trunc(this._first.y) === Math.trunc(this._second.y);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleCollisionEvent.as::get older()
    get older(): ChatBubbleSimulationEntity
    {
        return this._first.timeStamp < this._second.timeStamp ? this._first : this._second;
    }
}
