/**
 * The Discord manager's DI component interface.
 *
 * Empty in AS3 too: `HabboDiscordManager` implements it purely to be attachable under
 * `IIDHabboDiscordManager`, and nothing ever calls through it — the manager's two collaborators
 * hold a concrete reference instead.
 *
 * The interface is `_SafeCls_97` in the primary tree; the name is recovered from the IID class
 * `com/sulake/iid/IIDHabboDiscordManager.as`, which is unobfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/discord/_SafeCls_97.as
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IHabboDiscordManager
{
}
