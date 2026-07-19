import {EventEmitter} from 'eventemitter3';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboLandingView} from '../HabboLandingView';
import type {BackgroundObject} from './backgroundobjects/BackgroundObject';
import {LinearMovingBackgroundObject} from './backgroundobjects/LinearMovingBackgroundObject';
import {SpiralMovingBackgroundObject} from './backgroundobjects/SpiralMovingBackgroundObject';
import {RandomWalkMovingBackgroundObject} from './backgroundobjects/RandomWalkMovingBackgroundObject';
import {StaticAnimatedBackgroundObject} from './backgroundobjects/StaticAnimatedBackgroundObject';
import {BackgroundObjectType} from './backgroundobjects/BackgroundObjectType';

type BackgroundObjectConstructor = new (
    id: number,
    container: IWindowContainer,
    events: EventEmitter,
    landingView: HabboLandingView,
    dataContent: string
) => BackgroundObject;

/**
 * Manages up to 20 parallax background decorations, spawned from
 * `landing.view.bgobject.<N>` (or `landing.view.<timingCode>.bgobject.<N>`)
 * config strings, and ticks them every frame.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/MovingBackgroundObjects.as
 */
export class MovingBackgroundObjects implements IDisposable
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/MovingBackgroundObjects.as::MAX_OBJECTS
    private static readonly MAX_OBJECTS: number = 20;

    private _landingView: HabboLandingView | null;
    private _objects: BackgroundObject[] = [];
    private _typeMap: Map<string, BackgroundObjectConstructor> = new Map();
    private _events: EventEmitter = new EventEmitter();
    private _timingCode: string = '';

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/MovingBackgroundObjects.as::MovingBackgroundObjects()
    constructor(landingView: HabboLandingView)
    {
        this._landingView = landingView;
        this.initializeObjectTypeMapping();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/MovingBackgroundObjects.as::initializeObjectTypeMapping()
    private initializeObjectTypeMapping(): void
    {
        this._typeMap.set(BackgroundObjectType.LINEAR, LinearMovingBackgroundObject);
        this._typeMap.set(BackgroundObjectType.SPIRAL, SpiralMovingBackgroundObject);
        this._typeMap.set(BackgroundObjectType.STATIC_ANIMATED, StaticAnimatedBackgroundObject);
        this._typeMap.set(BackgroundObjectType.RANDOM_WALK, RandomWalkMovingBackgroundObject);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/MovingBackgroundObjects.as::dispose()
    dispose(): void
    {
        this._landingView = null;

        for(const object of this._objects)
        {
            object.dispose();
        }

        this._objects.length = 0;
        this._typeMap.clear();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/MovingBackgroundObjects.as::get disposed()
    get disposed(): boolean
    {
        return this._landingView === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/MovingBackgroundObjects.as::initialize()
    initialize(root: IWindowContainer): void
    {
        const container = root.findChildByName('moving_objects_container') as IWindowContainer | null;

        if(!container) return;
        if(this._objects.length > 0) return;
        if(!this._landingView) return;

        for(let i = 1; i <= MovingBackgroundObjects.MAX_OBJECTS; i++)
        {
            const key = this._timingCode === ''
                ? `landing.view.bgobject.${i}`
                : `landing.view.${this._timingCode}.bgobject.${i}`;

            const dataContent = this._landingView.getProperty(key);

            if(dataContent !== '')
            {
                const object = this.getObjectByDataContent(i, dataContent, container);

                if(object)
                {
                    this._objects.push(object);
                }
            }
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/MovingBackgroundObjects.as::update()
    update(elapsedTime: number): void
    {
        for(const object of this._objects)
        {
            object.update(elapsedTime);
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/MovingBackgroundObjects.as::getObjectByDataContent()
    private getObjectByDataContent(id: number, dataContent: string, container: IWindowContainer): BackgroundObject | null
    {
        const parts = dataContent.split(';');

        if(parts.length >= 2 && this._landingView)
        {
            const typeKey = parts[1];
            const ctor = this._typeMap.get(typeKey);

            if(ctor)
            {
                return new ctor(id, container, this._events, this._landingView, dataContent);
            }
        }

        return null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/MovingBackgroundObjects.as::set timingCode()
    set timingCode(value: string)
    {
        this._timingCode = value;
    }
}
