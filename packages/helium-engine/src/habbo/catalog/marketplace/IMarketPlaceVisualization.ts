/**
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceVisualization.as
 */
export interface IMarketPlaceVisualization
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceVisualization.as::displayMainView()
    displayMainView(): void;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceVisualization.as::listUpdatedNotify()
    listUpdatedNotify(): void;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceVisualization.as::removeOfferIds()
    removeOfferIds(offerIds: number[]): void;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlaceVisualization.as::updateStats()
    updateStats(): void;
}
