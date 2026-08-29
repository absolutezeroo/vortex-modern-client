import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {Logger} from '@core/utils/Logger';

import {SnowWarGameObjectData} from './SnowWarGameObjectData';

const log = Logger.getLogger('habbo.communication.messages.parser.game.snowwar.data.HumanGameObjectData');

/**
 * A player (or a bot) in the arena.
 *
 * The only subclass whose `parse()` reads anything but variables: four strings follow the seventeen
 * integers, and they are the parts a simulation cannot derive — name, mission, figure and sex.
 * Everything the lock-step simulation actually advances lives in the integer slots.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1721/HumanGameObjectData.as
 */
export class HumanGameObjectData extends SnowWarGameObjectData
{
    /** Name recovered from the 2016 tree, where this class is unobfuscated. */
    // AS3: HumanGameObjectData.as::NUM_OF_VARIABLES
    public static readonly NUM_OF_VARIABLES: number = 19;

    // AS3: HumanGameObjectData.as::_name
    private _name: string = '';

    /** Derived name — `_SafeStr_7742`, from the `mission` getter that reads it. */
    // AS3: HumanGameObjectData.as::_SafeStr_7742
    private _mission: string = '';

    /** Derived name — `_SafeStr_5551`, from the `figure` getter that reads it. */
    // AS3: HumanGameObjectData.as::_SafeStr_5551
    private _figure: string = '';

    /** Derived name — `_SafeStr_5898`, from the `sex` getter that reads it. */
    // AS3: HumanGameObjectData.as::_SafeStr_5898
    private _sex: string = '';

    // AS3: HumanGameObjectData.as::HumanGameObjectData()
    public constructor(type: number, id: number)
    {
        super(type, id);
    }

    // AS3: HumanGameObjectData.as::parse()
    public override parse(wrapper: IMessageDataWrapper): void
    {
        this.parseVariables(wrapper, HumanGameObjectData.NUM_OF_VARIABLES);
        this._name = wrapper.readString();
        this._mission = wrapper.readString();
        this._figure = wrapper.readString();
        this._sex = wrapper.readString();
        log.trace(`Parsed human game object data, variables:${this._variables}`);
    }

    // AS3: HumanGameObjectData.as::get name()
    public get name(): string
    {
        return this._name;
    }

    // AS3: HumanGameObjectData.as::get mission()
    public get mission(): string
    {
        return this._mission;
    }

    // AS3: HumanGameObjectData.as::get figure()
    public get figure(): string
    {
        return this._figure;
    }

    // AS3: HumanGameObjectData.as::get sex()
    public get sex(): string
    {
        return this._sex;
    }

    // AS3: HumanGameObjectData.as::get currentLocationX()
    public get currentLocationX(): number
    {
        return this.getVariable(2);
    }

    // AS3: HumanGameObjectData.as::get currentLocationY()
    public get currentLocationY(): number
    {
        return this.getVariable(3);
    }

    // AS3: HumanGameObjectData.as::get currentTileX()
    public get currentTileX(): number
    {
        return this.getVariable(4);
    }

    // AS3: HumanGameObjectData.as::get currentTileY()
    public get currentTileY(): number
    {
        return this.getVariable(5);
    }

    // AS3: HumanGameObjectData.as::get bodyDirection()
    public get bodyDirection(): number
    {
        return this.getVariable(6);
    }

    // AS3: HumanGameObjectData.as::get hitPoints()
    public get hitPoints(): number
    {
        return this.getVariable(7);
    }

    // AS3: HumanGameObjectData.as::get snowBallCount()
    public get snowBallCount(): number
    {
        return this.getVariable(8);
    }

    /**
     * AS3 declares this `int`, not `Boolean` — the wire sends 0/1 and the arena tests it as a
     * number. Transcribed as declared.
     */
    // AS3: HumanGameObjectData.as::get isBot()
    public get isBot(): number
    {
        return this.getVariable(9);
    }

    // AS3: HumanGameObjectData.as::get activityTimer()
    public get activityTimer(): number
    {
        return this.getVariable(10);
    }

    // AS3: HumanGameObjectData.as::get activityState()
    public get activityState(): number
    {
        return this.getVariable(11);
    }

    // AS3: HumanGameObjectData.as::get nextTileX()
    public get nextTileX(): number
    {
        return this.getVariable(12);
    }

    // AS3: HumanGameObjectData.as::get nextTileY()
    public get nextTileY(): number
    {
        return this.getVariable(13);
    }

    // AS3: HumanGameObjectData.as::get moveTargetX()
    public get moveTargetX(): number
    {
        return this.getVariable(14);
    }

    // AS3: HumanGameObjectData.as::get moveTargetY()
    public get moveTargetY(): number
    {
        return this.getVariable(15);
    }

    // AS3: HumanGameObjectData.as::get score()
    public get score(): number
    {
        return this.getVariable(16);
    }

    // AS3: HumanGameObjectData.as::get team()
    public get team(): number
    {
        return this.getVariable(17);
    }

    // AS3: HumanGameObjectData.as::get userId()
    public get userId(): number
    {
        return this.getVariable(18);
    }
}

// TS-only: ESM cycle breaker — see SnowWarGameObjectData.register().
SnowWarGameObjectData.register(SnowWarGameObjectData.OBJECT_TYPE_HUMAN, HumanGameObjectData);
