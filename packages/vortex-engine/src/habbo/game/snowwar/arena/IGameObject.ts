import type {IDisposable} from '@core/runtime/IDisposable';

/**
 * Anything the arena simulates: a player, a snowball, a tree, a machine.
 *
 * The interface is three questions wide because that is all the *arena* needs to know. `isGhost`
 * and `ghostObjectId` are the lock-step machinery: a client predicts an action locally as a ghost
 * object and reconciles it when the server's copy of the same input comes back, and
 * `ghostObjectId` is what pairs the two.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/arena/IGameObject.as
 */
export interface IGameObject extends IDisposable
{
    // AS3: IGameObject.as::get gameObjectId()
    readonly gameObjectId: number;

    // AS3: IGameObject.as::get isGhost()
    readonly isGhost: boolean;

    // AS3: IGameObject.as::get ghostObjectId()
    readonly ghostObjectId: number;
}
