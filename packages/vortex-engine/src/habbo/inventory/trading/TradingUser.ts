import type {GroupItem} from '../items/GroupItem';

/**
 * Trading user data
 */
export interface ITradingUser
{
    userId: number;
    userName: string;
    canTrade: boolean;
    accepts: boolean;
    numItems: number;
    numCredits: number;
    items: Map<string, GroupItem>;
}

/**
 * Create empty trading user
 */
export function createTradingUser(
    userId: number,
    userName: string,
    canTrade: boolean
): ITradingUser
{
    return {
        userId,
        userName,
        canTrade,
        accepts: false,
        numItems: 0,
        numCredits: 0,
        items: new Map(),
    };
}
