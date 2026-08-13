import type {IActiveActionData} from '../actions/IActiveActionData';

/**
 * Interface for animation layer data containing frame offsets and action reference.
 *
 * @see sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/avatar/animation/IAnimationLayerData.as (IAnimationLayerData)
 */
export interface IAnimationLayerData
{
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/avatar/animation/IAnimationLayerData.as::get id()
    readonly id: string;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/avatar/animation/IAnimationLayerData.as::get action()
    readonly action: IActiveActionData;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/avatar/animation/IAnimationLayerData.as::get animationFrame()
    readonly animationFrame: number;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/avatar/animation/IAnimationLayerData.as::get dx()
    readonly dx: number;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/avatar/animation/IAnimationLayerData.as::get dy()
    readonly dy: number;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/avatar/animation/IAnimationLayerData.as::get dz()
    readonly dz: number;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/avatar/animation/IAnimationLayerData.as::get dd()
    readonly dd: number;
}
