import {Exception} from '@core/runtime/exceptions/Exception';
import {LogLevel, Logger} from '@core/utils/Logger';
import {OrderedMap} from '@core/utils/OrderedMap';

import {QuickRandom} from '../utils/QuickRandom';
import {HumanGameObject} from '../gameobjects/HumanGameObject';
import {DefaultGameStage} from './DefaultGameStage';
import type {ISynchronizedGameObject} from './ISynchronizedGameObject';

const log = Logger.getLogger('habbo.game.snowwar.arena.SynchronizedGameStage');

/**
 * The objects in the arena, and the checksum that proves every client agrees about them.
 *
 * Removal happens in two steps on purpose. `putGameObjectOnDeleteList()` only deactivates and
 * queues; the object is not actually removed until the end of the current sub-turn, inside
 * `subturn()`. Removing it the moment an event asked would change what the *rest* of that
 * sub-turn's objects see, and two clients applying the same events in the same order would still
 * diverge depending on iteration order.
 *
 * The class name is recovered from the 2016 tree, where it is unobfuscated; the primary tree has it
 * as `_SafeCls_2603`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/arena/_SafeCls_2603.as
 * @see sources/PRODUCTION-201601012205-226667486/src/snowwar/_Str_231/SynchronizedGameStage.as
 */
export class SynchronizedGameStage extends DefaultGameStage
{
    /** Name recovered from the 2016 tree — `_SafeStr_4750` in the primary. */
    // AS3: _SafeCls_2603.as::_SafeStr_4750
    protected _gameObjects: OrderedMap<number, ISynchronizedGameObject> | null = new OrderedMap<number, ISynchronizedGameObject>();

    // AS3: _SafeCls_2603.as::_gameObjectsToBeDeleted
    private _gameObjectsToBeDeleted: ISynchronizedGameObject[] = [];

    /** Name recovered from the 2016 tree — `_SafeStr_5893` in the primary. */
    // AS3: _SafeCls_2603.as::_SafeStr_5893
    private _removedGameObjects: ISynchronizedGameObject[] = [];

    // AS3: _SafeCls_2603.as::zeroPad2digit()
    private static zeroPad2digit(value: number): string
    {
        if(value < 10)
        {
            return `0${value}`;
        }

        return value.toString();
    }

    // AS3: _SafeCls_2603.as::addGameObject()
    public addGameObject(id: number, gameObject: ISynchronizedGameObject): void
    {
        this._gameObjects?.add(id, gameObject);
        gameObject.isActive = true;
    }

    // AS3: _SafeCls_2603.as::addInactiveGameObject()
    public addInactiveGameObject(id: number, gameObject: ISynchronizedGameObject): void
    {
        this._gameObjects?.add(id, gameObject);
        gameObject.isActive = false;
    }

    /**
     * Adds under a key that must equal the object's own id — and throws when it does not, *after*
     * the object is already in the map. AS3 orders it that way and the port keeps it: the throw is
     * a programming-error assertion, not a recoverable path, so the half-done state never matters.
     */
    // AS3: _SafeCls_2603.as::addGameObjectById()
    public addGameObjectById(id: number, gameObject: ISynchronizedGameObject): void
    {
        this._gameObjects?.add(id, gameObject);
        gameObject.isActive = true;

        if(gameObject.gameObjectId !== id)
        {
            throw new Exception(`Could not add gameobject with id:${id}`);
        }
    }

    // AS3: _SafeCls_2603.as::removeGameObject()
    public removeGameObject(id: number): void
    {
        const gameObject = this._gameObjects?.remove(id) ?? null;

        if(gameObject)
        {
            gameObject.onRemove();
            this._removedGameObjects.push(gameObject);
        }
    }

    /**
     * Replaces the map rather than clearing it, which is what AS3 does — the removed objects are
     * still reachable through `resetRemovedGameObjects()` until whoever renders them has read them.
     */
    // AS3: _SafeCls_2603.as::removeAllGameObjects()
    public removeAllGameObjects(): void
    {
        for(const gameObject of this._gameObjects?.getValues() ?? [])
        {
            gameObject.onRemove();
            this._removedGameObjects.push(gameObject);
        }

        this._gameObjects = new OrderedMap<number, ISynchronizedGameObject>();
    }

    /**
     * Queues a removal for the end of the sub-turn and deactivates the object now, so it stops being
     * simulated and stops counting towards the checksum immediately.
     */
    // AS3: _SafeCls_2603.as::putGameObjectOnDeleteList()
    public putGameObjectOnDeleteList(gameObject: ISynchronizedGameObject | null): void
    {
        if(gameObject === null)
        {
            log.warn('Trying to put null in delete list.');

            return;
        }

        this._gameObjectsToBeDeleted.push(gameObject);
        gameObject.isActive = false;
    }

    // AS3: _SafeCls_2603.as::getGameObject()
    public getGameObject(id: number): ISynchronizedGameObject | null
    {
        return this._gameObjects?.getValue(id) ?? null;
    }

    // AS3: _SafeCls_2603.as::getGameObjects()
    public getGameObjects(): ISynchronizedGameObject[]
    {
        return this._gameObjects?.getValues() ?? [];
    }

    /**
     * Advances every object by one sub-turn, then drains the delete list. The drain is last, and the
     * list is emptied in one go rather than per removal — see the class comment.
     */
    // AS3: _SafeCls_2603.as::subturn()
    public subturn(): void
    {
        for(const gameObject of this._gameObjects?.getValues() ?? [])
        {
            gameObject.subturn(this);
        }

        if(this._gameObjectsToBeDeleted.length > 0)
        {
            for(const gameObject of this._gameObjectsToBeDeleted)
            {
                this.removeGameObject(gameObject.gameObjectId);
            }

            this._gameObjectsToBeDeleted = [];
        }
    }

    /**
     * Folds every active, non-ghost object's variables into a seed the server computed the same way.
     *
     * The weight starts at 1 **per object** and increments per variable, so it is not a positional
     * hash over the whole set — two objects with the same variables contribute the same amount
     * regardless of where they sit in the map. Ghosts are excluded because they are this client's
     * own prediction and no other client has them.
     *
     * `turn % 1` is a constant-folded log interval of 1: it is true on every turn. Transcribed
     * rather than dropped, so the shape still matches the source it came from.
     */
    // AS3: _SafeCls_2603.as::calculateChecksum()
    public calculateChecksum(turn: number): number
    {
        const logging = log.isEnabled(LogLevel.TRACE) && turn % 1 === 0;
        let checksum = QuickRandom.iterateSeed(turn);
        let objectIndex = 0;
        let report = '';
        let variables = '';

        if(logging)
        {
            report += `\nturn ### ${turn} ###\n`;
            report += `seed ${checksum}\n`;
        }

        for(const gameObject of this._gameObjects?.getValues() ?? [])
        {
            if(gameObject.isGhost)
            {
                // A ghost contributes nothing to the checksum, but a *human* ghost records where
                // the prediction put it this turn, so the server's copy of the same input can be
                // reconciled against it later.
                // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/arena/_SafeCls_2603.as::calculateChecksum()
                if(gameObject instanceof HumanGameObject) gameObject.addGhostLocation(turn);

                continue;
            }

            if(!gameObject.isActive)
            {
                continue;
            }

            let weight = 1;
            const count = gameObject.numberOfVariables;
            let index = 0;

            while(index < count)
            {
                checksum += gameObject.getVariable(index) * weight;
                weight++;

                if(logging)
                {
                    variables += gameObject.getVariable(index);

                    if(index < count - 1)
                    {
                        variables += ',';
                    }
                }

                index++;
            }

            if(logging)
            {
                report += `++ "O${SynchronizedGameStage.zeroPad2digit(objectIndex + 1)}-CS:${checksum} Parms:${variables}"\n`;
                variables = '';
                objectIndex++;
            }
        }

        log.trace(report);

        return checksum;
    }

    /**
     * Dead in every tree: it writes the count of active objects and then walks them a second time
     * with an empty body, and no caller exists in the 2026 client, the 2016 one, or `win63_version`.
     * Ported because it is part of the class, and said to be dead here so nobody spends an afternoon
     * working out what the second loop was supposed to append.
     */
    // AS3: _SafeCls_2603.as::appendGameObjects()
    public appendGameObjects(target: {writeInt(value: number): void}): void
    {
        let activeCount = 0;

        for(const gameObject of this._gameObjects?.getValues() ?? [])
        {
            if(gameObject.isActive)
            {
                activeCount++;
            }
        }

        target.writeInt(activeCount);

        /* eslint-disable no-empty -- the body is empty in all three AS3 trees; see the method comment. */
        for(const gameObject of this._gameObjects?.getValues() ?? [])
        {
            if(gameObject.isActive)
            {
            }
        }
        /* eslint-enable no-empty */
    }

    /**
     * Hands over everything removed since the last call and starts a fresh list — the renderer's
     * cue to tear those objects' visuals down.
     */
    // AS3: _SafeCls_2603.as::resetRemovedGameObjects()
    public resetRemovedGameObjects(): ISynchronizedGameObject[]
    {
        const removed = this._removedGameObjects;

        this._removedGameObjects = [];

        return removed;
    }

    // AS3: _SafeCls_2603.as::dispose()
    public override dispose(): void
    {
        super.dispose();

        if(this._gameObjects !== null)
        {
            for(const gameObject of this._gameObjects.getValues())
            {
                gameObject.dispose();
            }

            this._gameObjects.dispose();
            this._gameObjects = null;
        }

        this._gameObjectsToBeDeleted = [];
        this._removedGameObjects = [];
    }
}
