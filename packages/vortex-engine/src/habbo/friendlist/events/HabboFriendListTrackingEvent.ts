/**
 * HabboFriendListTrackingEvent
 *
 * The event names the friend list dispatches for analytics — opening a tab, closing
 * the window, collapsing it. Constants only; the dispatch itself is a bare `Event`
 * with one of these types.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/events/HabboFriendListTrackingEvent.as
 */
export class HabboFriendListTrackingEvent
{
    // AS3: .../events/HabboFriendListTrackingEvent.as::HABBO_FRIENDLIST_TRACKING_EVENT_CLOSED
    static readonly HABBO_FRIENDLIST_TRACKING_EVENT_CLOSED: string = 'HABBO_FRIENDLIST_TRACKING_EVENT_CLOSED';

    // AS3: .../events/HabboFriendListTrackingEvent.as::HABBO_FRIENDLIST_TRACKING_EVENT_FRIENDS
    static readonly HABBO_FRIENDLIST_TRACKING_EVENT_FRIENDS: string = 'HABBO_FRIENDLIST_TRACKING_EVENT_FRIENDS';

    // AS3: .../events/HabboFriendListTrackingEvent.as::HABBO_FRIENDLIST_TRACKING_EVENT_SEARCH
    static readonly HABBO_FRIENDLIST_TRACKING_EVENT_SEARCH: string = 'HABBO_FRIENDLIST_TRACKING_EVENT_SEARCH';

    // AS3: .../events/HabboFriendListTrackingEvent.as::HABBO_FRIENDLIST_TRACKING_EVENT_REQUEST
    static readonly HABBO_FRIENDLIST_TRACKING_EVENT_REQUEST: string = 'HABBO_FRIENDLIST_TRACKING_EVENT_REQUEST';

    /**
     * The constant's own name is obfuscated in every tree; **`..._MINIMIZED` is
     * derived** from its value, which is readable and misspelt at source
     * ("MINIMZED"). The value is kept exactly as the client sends it.
     */
    // AS3: .../events/HabboFriendListTrackingEvent.as::HABBO_FRIENDLIST_TRACKING_EVENT_MINIMIZED
    static readonly HABBO_FRIENDLIST_TRACKING_EVENT_MINIMIZED: string = 'HABBO_FRIENDLIST_TRACKING_EVENT_MINIMZED';

    // AS3: .../events/HabboFriendListTrackingEvent.as::HABBO_FRIENDLIST_TRACKING_EVENT_MESSENGER
    static readonly HABBO_FRIENDLIST_TRACKING_EVENT_MESSENGER: string = 'HABBO_FRIENDLIST_TRACKING_EVENT_MESSENGER';
}
