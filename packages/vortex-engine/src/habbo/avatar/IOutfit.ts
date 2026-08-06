/**
 * Interface representing an avatar outfit (figure + gender).
 *
 * @see sources/win63_version/habbo/avatar/IOutfit.as
 */
export interface IOutfit
{
    // AS3: sources/win63_version/habbo/avatar/IOutfit.as::get figure()
    readonly figure: string;
    // AS3: sources/win63_version/habbo/avatar/IOutfit.as::get gender()
    readonly gender: string;
}
