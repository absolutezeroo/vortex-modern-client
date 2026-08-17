import type {IUnknown} from '@core/runtime/IUnknown';

/**
 * The talent-track component's public face.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/IHabboTalent.as
 *
 * AS3's interface is empty beyond `IUnknown` — the component is announced under
 * `IIDHabboTalent` so other components can wait for it, and everything the four controllers use
 * they reach through the concrete `HabboTalent`.
 */
export interface IHabboTalent extends IUnknown
{
}
