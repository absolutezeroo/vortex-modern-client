/**
 * A line of Snow War chat, on its way from `SnowWarEngine` to the free-flow chat.
 *
 * The engine dispatches this on the game manager's own event bus and
 * `freeflowchat/data/ChatEventHandler` picks it up. It carries its own display identity —
 * figure, gender, name, colour and an x in screen space — because the speaker is a game object,
 * not a room user the chat layer could look up.
 *
 * AS3 extends `flash.events.Event` and takes the two `bubbles`/`cancelable` flags; the port has no
 * display-list event flow, so it keeps only the type, as every other ported event class does.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/events/GameChatEvent.as
 */
export class GameChatEvent
{
    // AS3: .../src/com/sulake/habbo/game/events/GameChatEvent.as::GAME_CHAT
    public static readonly GAME_CHAT: string = 'gce_game_chat';

    // AS3: .../src/com/sulake/habbo/game/events/GameChatEvent.as::GameChatEvent()
    constructor(
        type: string,
        userId: number,
        message: string,
        locX: number,
        color: number,
        figure: string,
        gender: string,
        name: string,
        teamId: number,
        notify: boolean
    )
    {
        this._type = type;
        this._userId = userId;
        this._message = message;
        this._locX = locX;
        this._color = color;
        this._figure = figure;
        this._gender = gender;
        this._name = name;
        this._teamId = teamId;
        this._notify = notify;
    }

    private readonly _type: string;
    private readonly _userId: number;
    private readonly _message: string;
    private readonly _locX: number;
    private readonly _color: number;
    private readonly _figure: string;
    private readonly _gender: string;
    private readonly _name: string;
    private readonly _teamId: number;
    private readonly _notify: boolean;

    // AS3: flash.events.Event::get type()
    public get type(): string
    {
        return this._type;
    }

    // AS3: .../src/com/sulake/habbo/game/events/GameChatEvent.as::get userId()
    public get userId(): number
    {
        return this._userId;
    }

    // AS3: .../src/com/sulake/habbo/game/events/GameChatEvent.as::get message()
    public get message(): string
    {
        return this._message;
    }

    /** Screen-space x the bubble is pinned to — the speaker has no room location. */
    // AS3: .../src/com/sulake/habbo/game/events/GameChatEvent.as::get locX()
    public get locX(): number
    {
        return this._locX;
    }

    // AS3: .../src/com/sulake/habbo/game/events/GameChatEvent.as::get color()
    public get color(): number
    {
        return this._color;
    }

    // AS3: .../src/com/sulake/habbo/game/events/GameChatEvent.as::get figure()
    public get figure(): string
    {
        return this._figure;
    }

    // AS3: .../src/com/sulake/habbo/game/events/GameChatEvent.as::get gender()
    public get gender(): string
    {
        return this._gender;
    }

    // AS3: .../src/com/sulake/habbo/game/events/GameChatEvent.as::get name()
    public get name(): string
    {
        return this._name;
    }

    /** 1 is the blue team; anything else renders red. See `ChatEventHandler.gameEventHandler()`. */
    // AS3: .../src/com/sulake/habbo/game/events/GameChatEvent.as::get teamId()
    public get teamId(): number
    {
        return this._teamId;
    }

    // AS3: .../src/com/sulake/habbo/game/events/GameChatEvent.as::get notify()
    public get notify(): boolean
    {
        return this._notify;
    }
}
