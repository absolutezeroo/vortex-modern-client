import type {IUnknown} from '@core/runtime/IUnknown';

/**
 * The forum controller as the DI container sees it.
 *
 * AS3 declares this with no members of its own — it exists so `IIDHabboGroupForumController` has
 * something to resolve to, not to describe the controller. Everything that drives the forums
 * (`GroupForumView`, the list views, `ComposeMessageView`) holds a concrete `GroupForumController`
 * instead, which is why nothing here is worth widening.
 *
 * The name is recovered from the 2016 tree (`IGroupForumController.as`); the primary obfuscates it
 * to `_SafeCls_2182`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/groupforums/_SafeCls_2182.as
 */
export interface IGroupForumController extends IUnknown
{
}
