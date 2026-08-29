import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {OrderedMap} from '@core/utils/OrderedMap';

import {SnowWarGameEventData} from './SnowWarGameEventData';

// TS-only: side-effect imports. Each subclass registers itself with SnowWarGameEventData at module
//   scope (see SnowWarGameEventData.register()); without these eight, `create()` finds an empty
//   table and every turn arrives with no events at all.
import './HumanLeftGameEventData';
import './NewMoveTargetEventData';
import './HumanThrowsSnowballAtHumanEventData';
import './HumanThrowsSnowballAtPositionEventData';
import './HumanStartsToMakeASnowballEventData';
import './CreateSnowballEventData';
import './MachineCreatesSnowballEventData';
import './HumanGetsSnowballsFromMachineEventData';

/**
 * One lock-step turn: which turn it is, the checksum the server expects every client's simulation to
 * agree on, and the inputs to replay — grouped by the sub-turn they belong to.
 *
 * The map is keyed by the loop counter, so key 0 is the first sub-turn in the packet and not a
 * player or an object id.
 *
 * Nothing here compares the checksum; it is carried for whatever runs the arena.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/game/snowwar/data/GameStatusData.as
 */
export class GameStatusData
{
    /** Derived name — `_SafeStr_4958`, from the `turn` getter that reads it. */
    // AS3: GameStatusData.as::_SafeStr_4958
    private _turn: number = 0;

    /** Derived name — `_SafeStr_9327`, from the `checksum` getter that reads it. */
    // AS3: GameStatusData.as::_SafeStr_9327
    private _checksum: number = 0;

    /** Derived name — `_SafeStr_8637`, from the `events` getter that reads it. */
    // AS3: GameStatusData.as::_SafeStr_8637
    private _events: OrderedMap<number, SnowWarGameEventData[]> = new OrderedMap<number, SnowWarGameEventData[]>();

    // AS3: GameStatusData.as::GameStatusData()
    public constructor(wrapper: IMessageDataWrapper)
    {
        this.parse(wrapper);
    }

    // AS3: GameStatusData.as::parse()
    public parse(wrapper: IMessageDataWrapper): void
    {
        this._turn = wrapper.readInt();
        this._checksum = wrapper.readInt();
        this._events = new OrderedMap<number, SnowWarGameEventData[]>();

        const subTurnCount = wrapper.readInt();
        let subTurn = 0;

        while(subTurn < subTurnCount)
        {
            const eventCount = wrapper.readInt();
            const events: SnowWarGameEventData[] = [];
            let eventIndex = 0;

            while(eventIndex < eventCount)
            {
                const eventType = wrapper.readInt();
                const event = SnowWarGameEventData.create(eventType);

                // An event type this build has no class for is dropped, not thrown: unlike a game
                // object it carries no length the reader depends on, so the stream stays readable.
                if(event)
                {
                    event.parse(wrapper);
                    events.push(event);
                }

                eventIndex++;
            }

            this._events.add(subTurn, events);
            subTurn++;
        }
    }

    // AS3: GameStatusData.as::get turn()
    public get turn(): number
    {
        return this._turn;
    }

    // AS3: GameStatusData.as::get checksum()
    public get checksum(): number
    {
        return this._checksum;
    }

    // AS3: GameStatusData.as::get events()
    public get events(): OrderedMap<number, SnowWarGameEventData[]>
    {
        return this._events;
    }
}
