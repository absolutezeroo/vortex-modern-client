/**
 * The typed form of a Discord IPC callback, built by `DiscordRichPresence` out of the JSON payload
 * the native extension hands back on a raw `StatusEvent`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/discord/events/DiscordRichPresenceEvent.as
 */
export class DiscordRichPresenceEvent
{
    // AS3: .../discord/events/DiscordRichPresenceEvent.as::JOIN
    public static readonly JOIN: string = 'discordActivityJoin';

    // AS3: .../discord/events/DiscordRichPresenceEvent.as::JOIN_REQUEST
    public static readonly JOIN_REQUEST: string = 'discordActivityJoinRequest';

    // AS3: .../discord/events/DiscordRichPresenceEvent.as::_SafeStr_11041
    // (name derived from its value — the constant is referenced only through the string literal
    //  `"discordActivitySpectate"` in `DiscordRichPresence`, so no tree names it.)
    public static readonly SPECTATE: string = 'discordActivitySpectate';

    // AS3: .../discord/events/DiscordRichPresenceEvent.as::type
    public readonly type: string;

    // AS3: .../discord/events/DiscordRichPresenceEvent.as::secret
    public secret: string;

    // AS3: .../discord/events/DiscordRichPresenceEvent.as::user
    public user: Record<string, unknown> | null;

    // AS3: .../discord/events/DiscordRichPresenceEvent.as::payload
    public payload: Record<string, unknown> | null;

    // AS3: .../discord/events/DiscordRichPresenceEvent.as::DiscordRichPresenceEvent()
    constructor(
        type: string,
        secret: string,
        user: Record<string, unknown> | null = null,
        payload: Record<string, unknown> | null = null
    )
    {
        this.type = type;
        this.secret = secret;
        this.user = user;
        this.payload = payload;
    }

    // AS3: .../discord/events/DiscordRichPresenceEvent.as::clone()
    clone(): DiscordRichPresenceEvent
    {
        return new DiscordRichPresenceEvent(this.type, this.secret, this.user, this.payload);
    }
}
