import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

import {SnowWarGameObjectData} from './SnowWarGameObjectData';

// TS-only: side-effect imports. Each subclass registers itself with SnowWarGameObjectData at module
//   scope (see SnowWarGameObjectData.register()); without these five, `create()` finds an empty
//   table and every object in the arena reads as an unknown type.
import './SnowballGameObjectData';
import './TreeGameObjectData';
import './SnowballPileGameObjectData';
import './SnowballMachineGameObjectData';
import './HumanGameObjectData';

/**
 * Every object in the arena, in one block: a count, then a (type, id) pair per object followed by
 * that subclass's own variables.
 *
 * The type has to be read before the body because it is what decides how many integers the body is
 * — there is no length prefix per object. Get one type wrong and the rest of the packet is noise.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/game/snowwar/data/GameObjectsData.as
 */
export class GameObjectsData
{
    /** Derived name — `_SafeStr_4750`, from the `gameObjects` getter that reads it. */
    // AS3: GameObjectsData.as::_SafeStr_4750
    private _gameObjects: SnowWarGameObjectData[] = [];

    // AS3: GameObjectsData.as::GameObjectsData()
    public constructor(wrapper: IMessageDataWrapper)
    {
        this.parse(wrapper);
    }

    // AS3: GameObjectsData.as::parse()
    public parse(wrapper: IMessageDataWrapper): void
    {
        const count = wrapper.readInt();
        let index = 0;

        while(index < count)
        {
            const objectType = wrapper.readInt();
            const objectId = wrapper.readInt();
            const gameObject = SnowWarGameObjectData.create(objectType, objectId);

            if(!gameObject)
            {
                // AS3 does not guard this — it calls `parse()` on the null and the packet dies
                // there. The port stops the same way instead of pushing a hole into the list,
                // because only the subclass knows how many integers to consume: past an unknown
                // type the byte stream is unreadable either way.
                throw new Error(`Unknown snow-war game object type ${objectType}`);
            }

            gameObject.parse(wrapper);
            this._gameObjects.push(gameObject);
            index++;
        }
    }

    // AS3: GameObjectsData.as::get gameObjects()
    public get gameObjects(): SnowWarGameObjectData[]
    {
        return this._gameObjects;
    }
}
