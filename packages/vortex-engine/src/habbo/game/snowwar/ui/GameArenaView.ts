import type {IDisposable} from '@core/runtime/IDisposable';
import type {IRoomObject} from '@room/object/IRoomObject';
import type {IRoomObjectController} from '@room/object/IRoomObjectController';
import type {IRoomObjectSpriteVisualization} from '@room/object/visualization/IRoomObjectSpriteVisualization';
import {Vector3d} from '@room/utils/Vector3d';
import {RoomPlaneParser} from '@habbo/room/object/RoomPlaneParser';
import type {SnowWarEngine} from '../SnowWarEngine';
import {SnowWarEngine as SnowWarEngineSounds} from '../SnowWarEngine';
import type {SnowWarGameStage} from '../SnowWarGameStage';
import type {SnowWarArenaExtension} from '../SnowWarArenaExtension';
import {Tile} from '../Tile';
import type {HumanGameObject} from '../gameobjects/HumanGameObject';
import {HumanGameObject as HumanGameObjectClass} from '../gameobjects/HumanGameObject';
import {SnowBallGameObject} from '../gameobjects/SnowBallGameObject';
import {SnowballMachineGameObject} from '../gameobjects/SnowballMachineGameObject';
import {SnowballPileGameObject} from '../gameobjects/SnowballPileGameObject';
import {TreeGameObject} from '../gameobjects/TreeGameObject';
import {Direction360} from '../utils/Direction360';
import {Direction8} from '../utils/Direction8';
import type {KeyboardControl} from '../KeyboardControl';
import {SnowWarUI} from './SnowWarUI';

/**
 * The arena as the room engine sees it: this is the class that turns the deterministic simulation
 * into room objects and keeps them in step with it, once per frame.
 *
 * The room it builds is **room 1**, always — the arena is not a hotel room and has no id of its own,
 * so `GAME_ROOM_ID` is hard-coded here exactly as in AS3. Its floor comes from the level's tile
 * grid pushed through a `RoomPlaneParser` (a missing tile becomes height -100, i.e. a hole), and its
 * scenery from the level's fuse objects placed as ordinary furniture.
 *
 * Three separate id lists are kept because the three kinds of object are disposed differently:
 * avatars (category 100), snowballs (201), and the splashes (202) that outlive the ball that made
 * them by half a second.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/ui/GameArenaView.as
 */
export class GameArenaView implements IDisposable
{
    // AS3: GameArenaView.as::GAME_ROOM_ID
    private static readonly GAME_ROOM_ID: number = 1;

    // AS3: GameArenaView.as::TILE_CURSOR_STATE_TEAM_1
    private static readonly TILE_CURSOR_STATE_TEAM_1: number = 3;

    // AS3: GameArenaView.as::TILE_CURSOR_STATE_TEAM_2
    private static readonly TILE_CURSOR_STATE_TEAM_2: number = 2;

    // AS3: GameArenaView.as::TILE_CURSOR_STATE_TEAM_3
    private static readonly TILE_CURSOR_STATE_TEAM_3: number = 4;

    // AS3: GameArenaView.as::TILE_CURSOR_STATE_TEAM_4
    private static readonly TILE_CURSOR_STATE_TEAM_4: number = 5;

    // AS3: GameArenaView.as::EFFECT_RED_TEAM
    private static readonly EFFECT_RED_TEAM: number = 95;

    // AS3: GameArenaView.as::EFFECT_BLUE_TEAM
    private static readonly EFFECT_BLUE_TEAM: number = 96;

    // AS3: GameArenaView.as::EFFECT_CROSSHAIR
    private static readonly EFFECT_CROSSHAIR: number = 98;

    // AS3: GameArenaView.as::SPLASH_LIFE_SPAN_TIME
    private static readonly SPLASH_LIFE_SPAN_TIME: number = 500;

    /** The room-object category snowballs live in, and the one their splashes live in. */
    // TS-only: AS3 spells both categories as bare 201/202 literals at every call site.
    private static readonly CATEGORY_SNOWBALL: number = 201;

    // TS-only: see CATEGORY_SNOWBALL.
    private static readonly CATEGORY_SNOW_SPLASH: number = 202;

    /** Derived name — `_SafeStr_4581`, the engine. */
    // AS3: GameArenaView.as::_SafeStr_4581
    private _engine: SnowWarEngine | null;

    /** Derived name — `_SafeStr_6176`; the game-object ids currently drawn as avatars. */
    // AS3: GameArenaView.as::_SafeStr_6176
    private _avatarIds: number[] = [];

    /** Derived name — `_SafeStr_6185`; the ids currently drawn as snowballs. */
    // AS3: GameArenaView.as::_SafeStr_6185
    private _snowballIds: number[] = [];

    /** Derived name — `_SafeStr_7222`; splashes waiting out their half-second, oldest first. */
    // AS3: GameArenaView.as::_SafeStr_7222
    private _splashes: {id: number; time: number; category: number}[] = [];

    /** Derived name — `_SafeStr_7046`. */
    // AS3: GameArenaView.as::_SafeStr_7046
    private _keyboardControl: KeyboardControl | null = null;

    // AS3: GameArenaView.as::_SafeStr_5769
    private _disposed: boolean = false;

    /** Derived name — `_SafeStr_4692`, the HUD. */
    // AS3: GameArenaView.as::_SafeStr_4692
    private _ui: SnowWarUI | null = null;

    /** Derived name — `_SafeStr_7015`; whether the walking loop is currently playing. */
    // AS3: GameArenaView.as::_SafeStr_7015
    private _walkSoundPlaying: boolean = false;

    // AS3: GameArenaView.as::GameArenaView()
    constructor(engine: SnowWarEngine)
    {
        this._engine = engine;
        this._engine.roomEngine?.addObjectUpdateCategory(GameArenaView.CATEGORY_SNOW_SPLASH);
    }

    // AS3: GameArenaView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * Builds room 1 out of the level: the floor from the tile grid, the scenery from the fuse
     * objects, and then hands the room over by switching the normal room UI off.
     *
     * AS3 passes `planeParser.getXML()` to `initializeRoom()`; this port's `initializeRoom()` takes
     * the parser itself — the XML round-trip exists in AS3 only because its room engine parses one.
     */
    // AS3: GameArenaView.as::init()
    public init(): void
    {
        const roomEngine = this._engine?.roomEngine ?? null;
        const stage = (this._engine?.gameArena?.getCurrentStage() ?? null) as SnowWarGameStage | null;

        if(!roomEngine || !stage) return;

        roomEngine.isGameMode = true;

        const level = stage.gameLevelData;

        if(!level) return;

        const tiles = stage.getTiles();
        const planeParser = new RoomPlaneParser();

        planeParser.initializeTileMap(level.width, level.height);

        for(let y = 0; y < level.height; y++)
        {
            for(let x = 0; x < level.width; x++)
            {
                planeParser.setTileHeight(x, y, tiles[y]?.[x] == null ? -100 : 0);
            }
        }

        planeParser.initializeFromTileData();
        roomEngine.initializeRoom(GameArenaView.GAME_ROOM_ID, planeParser);
        roomEngine.updateObjectRoomVisibilities(GameArenaView.GAME_ROOM_ID, false);
        planeParser.dispose();

        for(const fuseObject of level.fuseObjects)
        {
            const altitude = fuseObject.altitude / Tile.TILE_HALFWIDTH;
            const location = new Vector3d(fuseObject.x, fuseObject.y, altitude);
            const direction = new Vector3d(fuseObject.direction * 45);
            const typeId = roomEngine.getFurnitureTypeId(fuseObject.name);
            const stuffData = fuseObject.stuffData;
            const legacy = parseInt(stuffData?.getLegacyString() ?? '', 10);
            const state = Number.isNaN(legacy) ? 0 : legacy;

            // AS3 stops at the seventh argument; the eight after it are its own declared defaults
            // (`NaN, -1, 0, 0, "", true, true, -1`), which this port's signature makes required.
            roomEngine.addObjectFurniture(
                GameArenaView.GAME_ROOM_ID,
                fuseObject.id,
                typeId,
                location,
                direction,
                state,
                stuffData,
                NaN,
                -1,
                0,
                0,
                '',
                true,
                true,
                -1
            );
        }

        if(this._engine?.roomUI) this._engine.roomUI.visible = false;

        // TS-only: AS3 also subscribes to the Flash stage's `mouseMove` here, to keep a
        // `altKey || shiftKey` flag up to date. That flag is written and never read — in the
        // primary tree and in win63_version alike — so the listener has no port.
    }

    // AS3: GameArenaView.as::initGameUI()
    public initGameUI(_countDown: number): void
    {
        if(!this._engine) return;

        this._ui = new SnowWarUI(this._engine);
        this._ui.init();
        this.initCountDown();
    }

    // AS3: GameArenaView.as::removeGameUI()
    public removeGameUI(): void
    {
        if(this._ui)
        {
            this._ui.dispose();
            this._ui = null;
        }
    }

    /**
     * One frame: drain what the simulation removed, expire old splashes, then push every live game
     * object into the room engine.
     *
     * `isNewTurn` is only true on the first sub-turn of a turn, and it is the one moment a held
     * arrow key is turned into a move — the keyboard cannot outrun the lock-step clock.
     */
    // AS3: GameArenaView.as::update()
    public update(elapsed: number, isNewTurn: boolean = false): void
    {
        const engine = this._engine;
        const arena = engine?.gameArena ?? null;
        const stage = arena?.getCurrentStage() ?? null;
        const roomEngine = engine?.roomEngine ?? null;

        if(!engine || !arena || !stage || !roomEngine) return;

        if(isNewTurn && this._keyboardControl)
        {
            const direction = this._keyboardControl.direction;

            if(direction)
            {
                const own = stage.getGameObject(engine.ownId) as HumanGameObject | null;

                if(own)
                {
                    const x = own.currentLocation.x / 3200 + direction.getUnitVectorXcomponent() * 2;
                    const y = own.currentLocation.y / 3200 + direction.getUnitVectorYcomponent() * 2;

                    engine.moveOwnAvatarTo(x, y);
                }
            }
        }

        const now = Math.floor(performance.now());

        for(const removed of stage.resetRemovedGameObjects())
        {
            const id = removed.gameObjectId;
            const avatarIndex = this._avatarIds.indexOf(id);

            if(avatarIndex > -1)
            {
                roomEngine.disposeObjectUser(GameArenaView.GAME_ROOM_ID, id);
                this._avatarIds.splice(avatarIndex, 1);
            }

            const snowballIndex = this._snowballIds.indexOf(id);

            if(snowballIndex > -1)
            {
                const object = roomEngine.getRoomObject(
                    GameArenaView.GAME_ROOM_ID, id, GameArenaView.CATEGORY_SNOWBALL
                );
                const location = object?.getLocation() ?? null;

                roomEngine.disposeObjectSnowWar(GameArenaView.GAME_ROOM_ID, id, GameArenaView.CATEGORY_SNOWBALL);
                this._snowballIds.splice(snowballIndex, 1);

                // A ball that is gone *and* inactive was destroyed rather than caught: it leaves a
                // splash where it stopped. One that is still active was picked up.
                if(!removed.isActive && location)
                {
                    roomEngine.addObjectSnowWar(
                        GameArenaView.GAME_ROOM_ID, id, location, GameArenaView.CATEGORY_SNOW_SPLASH
                    );
                    this._splashes.push({id, time: now, category: GameArenaView.CATEGORY_SNOW_SPLASH});
                }
            }
        }

        for(let i = this._splashes.length - 1; i > -1; i--)
        {
            const splash = this._splashes[i];

            if(now - splash.time >= GameArenaView.SPLASH_LIFE_SPAN_TIME)
            {
                roomEngine.disposeObjectSnowWar(GameArenaView.GAME_ROOM_ID, splash.id, splash.category);
                this._splashes.splice(i, 1);
            }
        }

        let anyoneRunning = false;

        for(const object of stage.getGameObjects())
        {
            if(object instanceof HumanGameObjectClass)
            {
                anyoneRunning = anyoneRunning || object.posture === 'swrun';

                this.updateHumanGameObject(object);

                if(object.gameObjectId === engine.ownId && this._ui)
                {
                    const pulseInterval = (arena.getExtension() as SnowWarArenaExtension).getPulseInterval();

                    this._ui.setTimer(engine.stageLength - engine.currentSubTurn * pulseInterval / 1000);
                    this._ui.setOwnScore(object.score);
                    this._ui.setSnowballs(object.snowballs);
                    this._ui.setHitPoints(object.hitPoints);
                }
            }

            if(object instanceof SnowBallGameObject) this.updateSnowballGameObject(object);
            if(object instanceof SnowballMachineGameObject) this.updateSnowballMachineGameObject(object);
            if(object instanceof SnowballPileGameObject) this.updateSnowballPileGameObject(object);
            if(object instanceof TreeGameObject) this.updateTreeGameObject(object);
        }

        this._ui?.update(elapsed);

        if(anyoneRunning && !this._walkSoundPlaying)
        {
            this._walkSoundPlaying = true;
            SnowWarEngineSounds.playSound('HBSTG_snowwar_walk', 2147483647);
        }
        else if(!anyoneRunning && this._walkSoundPlaying)
        {
            this._walkSoundPlaying = false;
            SnowWarEngineSounds.stopSound('HBSTG_snowwar_walk');
        }

        const own = engine.getCurrentPlayer();

        if(own)
        {
            roomEngine.updateObjectUserEffect(
                GameArenaView.GAME_ROOM_ID,
                own.gameObjectId,
                own.team === 1 ? GameArenaView.EFFECT_BLUE_TEAM : GameArenaView.EFFECT_RED_TEAM,
                0
            );
        }
    }

    /**
     * Creates or moves one player's avatar.
     *
     * The first time it is seen the figure is rebuilt with the team's jumper (`ch` 20000/20001) and
     * with the `cc` part removed, so both teams are told apart at a glance. From then on it is only
     * moved, and `figure_is_playing_game` is switched off while the player is down — that action is
     * what keeps a live player's arms in the throwing pose.
     */
    // AS3: GameArenaView.as::updateHumanGameObject()
    private updateHumanGameObject(human: HumanGameObject): void
    {
        const engine = this._engine;
        const roomEngine = engine?.roomEngine ?? null;

        if(!engine || !roomEngine) return;

        const x = human.currentLocation.x / 3200;
        const y = human.currentLocation.y / 3200;
        const id = human.gameObjectId;
        const bodyDirection = human.getBodyDirection();
        const direction8 = Direction8.getDirection8(bodyDirection);

        if(direction8 === null) return;

        const direction360 = Direction360.direction8ToDirection360Value(direction8);
        const direction = new Vector3d(direction360, 0, 0);

        if(this._avatarIds.indexOf(id) === -1)
        {
            const figure = engine.avatarManager?.createFigureContainer(human.figure) ?? null;

            if(figure)
            {
                switch(human.team)
                {
                    case 1:
                        figure.updatePart('ch', 20000, [1]);
                        break;
                    case 2:
                        figure.updatePart('ch', 20001, [1]);
                        break;
                    default:
                        figure.updatePart('ch', 20000, [1]);
                }

                figure.removePart('cc');

                roomEngine.addObjectUser(
                    GameArenaView.GAME_ROOM_ID,
                    id,
                    new Vector3d(x, y, 0),
                    direction,
                    direction360,
                    1,
                    figure.getFigureString()
                );
            }

            roomEngine.updateObjectUserPosture(GameArenaView.GAME_ROOM_ID, id, 'std', '');
            roomEngine.updateObjectUserAction(GameArenaView.GAME_ROOM_ID, id, 'figure_is_playing_game', 1);
            this._avatarIds.push(id);

            switch(human.visualizationMode)
            {
                case 1:
                    this.visualizeAsGhost(this.getRoomUserObject(id));
                    break;
                case 2:
                    this.hideVisualization(this.getRoomUserObject(id));
                    break;
            }
        }
        else
        {
            roomEngine.updateObjectUser(
                GameArenaView.GAME_ROOM_ID,
                id,
                new Vector3d(x, y, 0),
                new Vector3d(x, y, 0),
                false,
                0,
                direction,
                direction360
            );
            roomEngine.updateObjectUserPosture(GameArenaView.GAME_ROOM_ID, id, human.posture, '');

            const alive = human.posture !== 'swdieback' && human.posture !== 'swdiefront';

            roomEngine.updateObjectUserAction(
                GameArenaView.GAME_ROOM_ID, id, 'figure_is_playing_game', alive ? 1 : 0
            );
        }

        const object = this.getRoomUserObject(id);

        if(object === null) return;

        const visualization = object.getVisualization() as IRoomObjectSpriteVisualization | null;
        const sprite = visualization?.getSprite(0) ?? null;

        // Invincible players are drawn semi-transparent — AS3's 100 and 255 are 0-255 alpha.
        if(sprite) sprite.alpha = human.invincible ? 100 : 255;

        const isOpponent = human.team !== (this._engine?.getCurrentPlayer()?.team ?? human.team);

        if(!isOpponent) return;

        const underCursor = roomEngine.playerUnderCursor === id && !human.invincible && !human.isStunned();

        roomEngine.updateObjectUserEffect(
            GameArenaView.GAME_ROOM_ID, id, underCursor ? GameArenaView.EFFECT_CROSSHAIR : 0, 0
        );
    }

    // AS3: GameArenaView.as::updateSnowballGameObject()
    private updateSnowballGameObject(snowball: SnowBallGameObject): void
    {
        const roomEngine = this._engine?.roomEngine ?? null;

        if(!roomEngine) return;

        const location = new Vector3d(
            snowball.location3D.x / 3200,
            snowball.location3D.y / 3200,
            snowball.location3D.z / Tile.TILE_HALFWIDTH
        );
        const id = snowball.gameObjectId;

        if(this._snowballIds.indexOf(id) === -1)
        {
            roomEngine.addObjectSnowWar(GameArenaView.GAME_ROOM_ID, id, location, GameArenaView.CATEGORY_SNOWBALL);
            this._snowballIds.push(id);
        }
        else
        {
            roomEngine.updateObjectSnowWar(GameArenaView.GAME_ROOM_ID, id, location, GameArenaView.CATEGORY_SNOWBALL);
        }
    }

    /** A machine's furniture state *is* its stock, so the two are pushed together. */
    // AS3: GameArenaView.as::updateSnowballMachineGameObject()
    private updateSnowballMachineGameObject(machine: SnowballMachineGameObject): void
    {
        this.updateFurnitureState(machine.fuseObjectId, machine.snowballCount);
    }

    /** A pile counts *down*: its state is how much has been taken, not how much is left. */
    // AS3: GameArenaView.as::updateSnowballPileGameObject()
    private updateSnowballPileGameObject(pile: SnowballPileGameObject): void
    {
        this.updateFurnitureState(pile.fuseObjectId, pile.maxSnowballs - pile.snowballCount);
    }

    // AS3: GameArenaView.as::updateTreeGameObject()
    private updateTreeGameObject(tree: TreeGameObject): void
    {
        this.updateFurnitureState(tree.fuseObjectId, tree.hits);
    }

    // TS-only: the three `update*GameObject()` bodies above are the same four lines with a
    // different number, and AS3 repeats them verbatim in three methods.
    private updateFurnitureState(fuseObjectId: number, state: number): void
    {
        const roomEngine = this._engine?.roomEngine ?? null;

        if(!roomEngine) return;

        const object = roomEngine.getRoomObject(GameArenaView.GAME_ROOM_ID, fuseObjectId, 10) as IRoomObjectController | null;

        if(!object || object.getState(0) === state) return;

        roomEngine.updateObjectFurniture(GameArenaView.GAME_ROOM_ID, fuseObjectId, null, null, state, null);
        object.setState(state, 0);
    }

    // AS3: GameArenaView.as::getRoomUserObject()
    private getRoomUserObject(id: number): IRoomObject | null
    {
        return this._engine?.roomEngine?.getRoomObject(GameArenaView.GAME_ROOM_ID, id, 100) ?? null;
    }

    /** Your own avatar, when the ghost is visualised: every sprite drawn in hard-light. */
    // AS3: GameArenaView.as::visualizeAsGhost()
    private visualizeAsGhost(object: IRoomObject | null): void
    {
        if(!object) return;

        const visualization = object.getVisualization() as IRoomObjectSpriteVisualization | null;

        if(!visualization) return;

        for(let i = 0; i < visualization.spriteCount; i++)
        {
            const sprite = visualization.getSprite(i);

            if(sprite) sprite.blendMode = 'hardlight';
        }
    }

    // AS3: GameArenaView.as::hideVisualization()
    private hideVisualization(object: IRoomObject | null): void
    {
        if(!object) return;

        const visualization = object.getVisualization() as IRoomObjectSpriteVisualization | null;

        if(!visualization) return;

        for(let i = 0; i < visualization.spriteCount; i++)
        {
            const sprite = visualization.getSprite(i);

            if(sprite) sprite.visible = false;
        }
    }

    // AS3: GameArenaView.as::showChecksumError()
    public showChecksumError(color: number): void
    {
        this._ui?.showChecksumError(color);
    }

    // AS3: GameArenaView.as::initCountDown()
    private initCountDown(): void
    {
        this._ui?.initCounter();
        this._ui?.update(1000);
    }

    /** Paints the tile cursor in the hovered player's team colour, or clears it. */
    // AS3: GameArenaView.as::updateTileCursor()
    public updateTileCursor(team: number): void
    {
        let state: number;

        switch(team)
        {
            case 1:
                state = GameArenaView.TILE_CURSOR_STATE_TEAM_1;
                break;
            case 2:
                state = GameArenaView.TILE_CURSOR_STATE_TEAM_2;
                break;
            case 3:
                state = GameArenaView.TILE_CURSOR_STATE_TEAM_3;
                break;
            case 4:
                state = GameArenaView.TILE_CURSOR_STATE_TEAM_4;
                break;
            default:
                state = 0;
        }

        this._engine?.roomEngine?.setTileCursorState(GameArenaView.GAME_ROOM_ID, state);
    }

    // AS3: GameArenaView.as::stopWaitingForSnowball()
    public stopWaitingForSnowball(): void
    {
        this._ui?.stopWaitingForSnowball();
    }

    // AS3: GameArenaView.as::startWaitingForSnowball()
    public startWaitingForSnowball(): void
    {
        this._ui?.startWaitingForSnowball();
    }

    // AS3: GameArenaView.as::flashOwnScore()
    public flashOwnScore(gained: boolean): void
    {
        this._ui?.flashOwnScore(gained);
    }

    // AS3: GameArenaView.as::dispose()
    public dispose(): void
    {
        this._engine?.roomEngine?.disposeRoom(GameArenaView.GAME_ROOM_ID);
        this._engine?.roomEngine?.removeObjectUpdateCategory(GameArenaView.CATEGORY_SNOW_SPLASH);

        if(this._keyboardControl)
        {
            this._keyboardControl.dispose();
            this._keyboardControl = null;
        }

        this._engine = null;
        this._avatarIds = [];
        this._snowballIds = [];

        if(this._ui)
        {
            this._ui.dispose();
            this._ui = null;
        }

        this._disposed = true;
    }
}
