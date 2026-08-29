import type {IDisposable} from '@core/runtime/IDisposable';

import type {IGameObject} from './IGameObject';
import type {SynchronizedGameStage} from './SynchronizedGameStage';

/**
 * A game object as the stage drives it.
 *
 * `numberOfVariables`/`getVariable()` are not a convenience accessor pair — they are how the
 * checksum is computed. The stage walks every active object's variables in index order and folds
 * them into a running seed, so the *set* and the *order* of what an object exposes here is part of
 * the wire contract with the server, not an implementation detail.
 *
 * `isActive` decides whether an object is simulated and counted; a ghost (a locally predicted
 * action awaiting the server's copy) is deliberately left out of the checksum.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/arena/ISynchronizedGameObject.as
 */
export interface ISynchronizedGameObject extends IGameObject, IDisposable
{
    // AS3: ISynchronizedGameObject.as::get isActive()
    isActive: boolean;

    // AS3: ISynchronizedGameObject.as::get numberOfVariables()
    readonly numberOfVariables: number;

    // AS3: ISynchronizedGameObject.as::getVariable()
    getVariable(index: number): number;

    // AS3: ISynchronizedGameObject.as::subturn()
    subturn(stage: SynchronizedGameStage): void;

    // AS3: ISynchronizedGameObject.as::onRemove()
    onRemove(): void;
}
