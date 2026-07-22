import {ConditionCodes} from './ConditionCodes';
import {DefaultConditionType} from './DefaultConditionType';

/**
 * StuffTypeMatches — the "furni is of a certain type" wired condition. Takes no form inputs; the furni
 * type is picked from the source selection. Exposes the negation (NOT_STUFF_TYPE_MATCHES) and a
 * per-selection furni title, and keeps the advanced source panel always visible.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/StuffTypeMatches.as
 */
export class StuffTypeMatches extends DefaultConditionType
{
    // AS3: StuffTypeMatches.as::get code()
    override get code(): number
    {
        return ConditionCodes.STUFF_TYPE_MATCHES;
    }

    // AS3: StuffTypeMatches.as::get negativeCode()
    override get negativeCode(): number
    {
        return ConditionCodes.NOT_STUFF_TYPE_MATCHES;
    }

    // AS3: StuffTypeMatches.as::furniSelectionTitle()
    override furniSelectionTitle(id: number): string
    {
        return 'wiredfurni.params.sources.furni.title.match.' + id;
    }

    // AS3: StuffTypeMatches.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }
}
