import {FriendListTabEnum} from './FriendListTabEnum';

/**
 * FriendListLookAndFeel
 *
 * Every colour the friend list paints, in one place — the manager exposes it as
 * `laf` and the views ask it rather than carrying constants of their own.
 *
 * Several methods ignore an argument they still take (`getFriendTextColor`'s flag,
 * `getRowShadingColor`'s tab id for tabs 1 and 2): the theme they were written for
 * collapsed to a single colour, and the parameter was left in place. That is verbatim
 * from AS3, not a simplification made here.
 *
 * The primary tree obfuscates this class to `_SafeCls_2281` and no tree recovers it —
 * the 2016 PRODUCTION build obfuscates it too. **The name `FriendListLookAndFeel` is
 * derived**, from `HabboFriendList.laf`, the only accessor it is reached through.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/_SafeCls_2281.as
 */
export class FriendListLookAndFeel
{
    // AS3: .../_SafeCls_2281.as::getSelectedEntryBgColor()
    getSelectedEntryBgColor(): number
    {
        return 0xFFB8E2FC;
    }

    // AS3: .../_SafeCls_2281.as::getFriendTextColor()
    getFriendTextColor(_online: boolean): number
    {
        return 0xFF000000;
    }

    // AS3: .../_SafeCls_2281.as::getTabFooterTextColor()
    getTabFooterTextColor(enabled: boolean): number
    {
        return enabled ? 0xFFEEEEEE : 0xFFB2B09F;
    }

    /**
     * Alternating row background. The friends and requests tabs shade white/grey; the
     * search tab, being on a darker panel, shades two greys instead.
     */
    // AS3: .../_SafeCls_2281.as::getRowShadingColor()
    getRowShadingColor(tabId: number, unshaded: boolean): number
    {
        if(tabId === FriendListTabEnum.TABID_FRIENDS)
        {
            return unshaded ? 0xFFFFFFFF : 0xFFEEEEEE;
        }

        if(tabId === FriendListTabEnum.TABID_FRIEND_REQUESTS)
        {
            return unshaded ? 0xFFFFFFFF : 0xFFEEEEEE;
        }

        return unshaded ? 0xFFB6B6B6 : 0xFF9F9F9F;
    }

    // AS3: .../_SafeCls_2281.as::getTabTextColor()
    getTabTextColor(newMessageArrived: boolean, tabId: number): number
    {
        if(newMessageArrived)
        {
            return 0xFFFFFFFF;
        }

        if(tabId === FriendListTabEnum.TABID_FRIENDS)
        {
            return 0xFF000000;
        }

        if(tabId === FriendListTabEnum.TABID_FRIEND_REQUESTS)
        {
            return 0xFFF6F6F6;
        }

        return 0xFFEFEFEF;
    }

    // AS3: .../_SafeCls_2281.as::getTabBgColor()
    getTabBgColor(tabId: number): number
    {
        if(tabId === FriendListTabEnum.TABID_FRIENDS)
        {
            return 0xFFFFFFFF;
        }

        if(tabId === FriendListTabEnum.TABID_FRIEND_REQUESTS)
        {
            return 0xFFFFFFFF;
        }

        return 0xFFB6B6B6;
    }
}
