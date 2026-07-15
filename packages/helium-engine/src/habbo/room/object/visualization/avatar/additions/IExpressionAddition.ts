/**
 * IExpressionAddition
 *
 * Extended interface for expression-based avatar additions.
 * Adds a type property to identify the expression kind.
 *
 * @see sources/PRODUCTION-201601012205-226667486/com/sulake/habbo/room/object/visualization/avatar/additions/IExpressionAddition.as
 */
import type {IAvatarAddition} from './IAvatarAddition';

export interface IExpressionAddition extends IAvatarAddition {
    readonly type: number;
}
