// What the shop's numbers mean on screen.
//
// The API answers a product as a KIND and an AMOUNT — `{kind: 0, amount: 100}` — and never a label,
// because a label is a language and the hotel has several. The wording is assembled here, from
// habbo.com's own keys where one exists (`SHOP_CREDITS_TITLE`, `SHOP_OFFERINGS_HABBO_CLUB_TITLE`),
// so a second language is a translation and not a second copy of this logic.
//
// Prices are integer MINOR units with an ISO currency beside them — 450 EUR-minor is 4,50 € — which
// is the only representation of money that does not eventually lose a cent. `Intl.NumberFormat`
// turns that into the visitor's own notation, so nothing here formats a currency by hand.
import {SHOP_KIND, SHOP_ORDER} from './api.js';
import type {IShopProduct, IShopOrder} from './api.js';
import {t} from './i18n.js';

/**
 * The unit a kind is counted in: "crédits" for currency, "mois" for the two club kinds — an amount
 * of 3 on a club product is three MONTHS, not three of anything spendable.
 */
export function productName(product: IShopProduct | IShopOrder): string
{
    switch(product.kind)
    {
        case SHOP_KIND.CREDITS:
            return `${product.amount} ${t('SHOP_CREDITS_TITLE').toLowerCase()}`;
        case SHOP_KIND.DUCKETS:
            return `${product.amount} duckets`;
        case SHOP_KIND.DIAMONDS:
            return `${product.amount} diamants`;
        case SHOP_KIND.CLUB:
        case SHOP_KIND.CLUB_VIP:
            return `${product.amount} mois de ${t('SHOP_OFFERINGS_HABBO_CLUB_TITLE')}`;
        default:
            // A kind this build has no wording for. The code is the honest fallback: it says a
            // product exists and that the site is behind the hotel, where a blank tile says nothing.
            // A product calls it `code` and an order — which snapshots it — calls it `productCode`.
            return 'code' in product ? product.code : product.productCode;
    }
}

/** Which shop sprite a product's tile draws. The API carries the number; club has no sprite of its own. */
export function productIcon(product: IShopProduct): string
{
    return `credit${product.icon}`;
}

// The section's heading. `code` is whatever the operator typed in the product row, so an unknown one
// is shown as itself rather than dropped — a section with no heading looks like a rendering bug, and
// a section that vanishes looks like nothing at all.
const SECTION_TITLES: Record<string, string> = {
    credits: 'SHOP_CREDITS_TITLE',
    club: 'SHOP_OFFERINGS_HABBO_CLUB_TITLE',
};

export function sectionTitle(code: string): string
{
    const key = SECTION_TITLES[code];

    return key ? t(key) : code;
}

export function formatPrice(priceMinor: number, currency: string): string
{
    // `minimumFractionDigits` is deliberately left to the currency: a yen price has none, and
    // dividing by 100 for every currency is the bug that produces "¥ 4.50".
    return new Intl.NumberFormat('fr-FR', {style: 'currency', currency}).format(priceMinor / 100);
}

export function formatDate(iso: string): string
{
    return new Intl.DateTimeFormat('fr-FR', {dateStyle: 'long', timeStyle: 'short'}).format(new Date(iso));
}

/** What an order's state is called, and whether it is still going anywhere. */
export const ORDER_LABELS: Record<number, string> = {
    [SHOP_ORDER.PENDING]: 'En attente de paiement',
    [SHOP_ORDER.PAID]: 'Payee, livraison en cours',
    [SHOP_ORDER.FULFILLED]: 'Livree',
    [SHOP_ORDER.CANCELLED]: 'Annulee',
    // Deliberately not "échouée": the money WAS taken, and the hotel owes the goods. Telling a
    // player their payment failed when it did not is how a support ticket becomes a chargeback.
    [SHOP_ORDER.NEEDS_INTERVENTION]: 'Payee — en cours de verification',
};

export function orderLabel(order: IShopOrder): string
{
    return ORDER_LABELS[order.state] ?? 'Inconnue';
}

/** True while an order can still change on its own, which is what the order page polls on. */
export function orderIsOpen(order: IShopOrder): boolean
{
    return order.state === SHOP_ORDER.PENDING || order.state === SHOP_ORDER.PAID;
}
