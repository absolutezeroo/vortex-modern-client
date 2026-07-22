import {DefaultActionType} from './DefaultActionType';

/**
 * DefaultBotActionType — the base for the bot-related wired action types (move/teleport/talk/change
 * figure/follow/give-hand-item/talk-to-avatar). It has no code of its own; it only relabels the user
 * source selection as "bots".
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4126`; the name follows its role as the bot
 * action base (its subclasses are the BOT_* action types).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4126.as
 */
export class DefaultBotActionType extends DefaultActionType
{
    // AS3: _SafeCls_4126.as::userSelectionTitle()
    override userSelectionTitle(id: number): string
    {
        if(id === 0)
        {
            return 'wiredfurni.params.sources.users.title.bots';
        }

        return super.userSelectionTitle(id);
    }
}
