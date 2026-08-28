/**
 * The two events the catalog raises for the tracking module, which flips an error-context flag on
 * each — `HabboTracking.onCatalogTrackingEvent()` sets flag 9 to 1 on open and 0 on close, so a
 * crash report says whether the catalog was up.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/enum/HabboCatalogTrackingEvent.as
 */
export const HabboCatalogTrackingEvent = {
    // AS3: HabboCatalogTrackingEvent.as::HABBO_CATALOG_TRACKING_EVENT_OPEN
    HABBO_CATALOG_TRACKING_EVENT_OPEN: 'HABBO_CATALOG_TRACKING_EVENT_OPEN',

    // AS3: HabboCatalogTrackingEvent.as::HABBO_CATALOG_TRACKING_EVENT_CLOSE
    HABBO_CATALOG_TRACKING_EVENT_CLOSE: 'HABBO_CATALOG_TRACKING_EVENT_CLOSE',
} as const;

export type HabboCatalogTrackingEventValue =
    typeof HabboCatalogTrackingEvent[keyof typeof HabboCatalogTrackingEvent];
