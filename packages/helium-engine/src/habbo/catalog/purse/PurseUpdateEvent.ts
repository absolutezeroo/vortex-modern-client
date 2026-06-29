/**
 * Catalog purse update event.
 *
 * @see sources/win63_version/habbo/catalog/purse/PurseUpdateEvent.as
 */
export class PurseUpdateEvent
{
    public static readonly UPDATE: string = 'catalog_purse_update';

    get type(): string
    {
        return PurseUpdateEvent.UPDATE;
    }
}
