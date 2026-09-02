/**
 * Fired on the widget event bus when the server restates the player's Builders Club standing —
 * the subscription status packet or the furni count — so `BuilderSubscriptionCatalogWidget` can
 * re-pick which of its four buttons to show.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetBuilderSubscriptionUpdatedEvent.as
 */
export class CatalogWidgetBuilderSubscriptionUpdatedEvent
{
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetEventEnum.as::_SafeStr_11708
    // Name DERIVED from the constant's value; the AS3 identifier is obfuscated in every tree.
    static readonly CWE_BUILDER_SUBSCRIPTION_UPDATED: string = 'CWE_BUILDER_SUBSCRIPTION_UPDATED';

    // TS-only: AS3 gets `type` from `flash.events.Event`; these events travel on an EventEmitter.
    get type(): string
    {
        return CatalogWidgetBuilderSubscriptionUpdatedEvent.CWE_BUILDER_SUBSCRIPTION_UPDATED;
    }
}
