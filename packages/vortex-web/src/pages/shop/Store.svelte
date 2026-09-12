<script lang="ts">
    // `/shop` — `shop/store/store.html` + `shop/store/inventory/…`:
    //
    //   <header class="shop__header"><h1 class="shop__header__title">Acheter des crédits Habbo et plus
    //   the inventory grid of `.inventory-thumbnail` tiles
    //   the purse and the selected offer down the side
    //
    // `.inventory-thumbnail` is the most distinctive component on the site and the easiest to get
    // wrong: cream 5px border, 15px radius, and THREE stacked shadows — an inset cream highlight
    // along the top, an inset ring of the panel colour just inside the border, and a hard 5px drop.
    // Drop any of the three and the tile flattens.
    //
    // Real since 2026-09-12: `GET /api/public/shop/products` (anonymous, so the grid renders for a
    // signed-out visitor the way habbo.com's does) and `POST /api/user/shop/orders`.
    //
    // DEVIATION: habbo.com's template has a cart with quantities. This posts ONE product code and
    // gets one order back, because that is what a payment is — the hotel opens a payment per order
    // at the provider, and a basket of four bundles is four payments, not one. The aside therefore
    // holds the chosen offer rather than a list.
    //
    // The price shown here is DISPLAY only. Nothing on this page is sent back: the request carries a
    // product code and the server reads the amount off its own row — see lib/api.ts::startShopOrder.
    import {push} from 'svelte-spa-router';
    import ShopShell from './ShopShell.svelte';
    import Sprite from '../../components/Sprite.svelte';
    import Panel from '../../components/Panel.svelte';
    import Button from '../../components/Button.svelte';
    import FormError from '../../components/FormError.svelte';
    import Purse from '../../components/Purse.svelte';
    import * as api from '../../lib/api.js';
    import type {IShopCatalog, IShopProduct} from '../../lib/api.js';
    import {formatPrice, productIcon, productName, sectionTitle} from '../../lib/shop.js';
    import {signedIn} from '../../lib/session.js';
    import {t} from '../../lib/i18n.js';

    const PRICE_TAG = new URL('../../assets/price_tag.png', import.meta.url).href;

    let catalog = $state<IShopCatalog | null>(null);
    let loadError = $state('');
    let chosen = $state<IShopProduct | null>(null);
    let busy = $state(false);
    let orderError = $state('');

    $effect(() =>
    {
        let cancelled = false;

        void api.getShopProducts()
            .then((answer) => !cancelled && (catalog = answer))
            .catch((error) => !cancelled && (loadError = (error as Error).message));

        return () => (cancelled = true);
    });

    const sections = $derived(catalog?.sections ?? []);

    async function buy()
    {
        if(!chosen || busy)
        {
            return;
        }

        busy = true;
        orderError = '';

        try
        {
            const start = await api.startShopOrder(chosen.code);

            // The provider's hosted page, when it has one. Leaving the site is the whole point: the
            // hotel never sees a card number, and nothing that happens over there grants anything —
            // the credits arrive on a signed webhook the browser has no part in.
            if(start.redirectUrl)
            {
                window.location.href = start.redirectUrl;

                return;
            }

            await push(`/shop/order/${start.order.id}`);
        }
        catch (error)
        {
            orderError = (error as Error).message;
        }
        finally
        {
            busy = false;
        }
    }
</script>

<ShopShell>
    <div class="flex flex-col gap-6 lg:flex-row">
        <div class="min-w-0 flex-1">
            <h1 class="mt-0">{t('SHOP_TITLE')}</h1>

            {#if loadError}
                <p>{loadError}</p>
            {:else if catalog && !sections.length}
                <p>{t('EMPTY_RESULTS_TEXT')}</p>
            {/if}

            {#each sections as section (section.code)}
                <h3>{sectionTitle(section.code)}</h3>

                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {#each section.products as product (product.code)}
                        <button type="button" onclick={() => (chosen = product)}
                                aria-pressed={chosen?.code === product.code}
                                class="relative mx-auto flex min-h-[230px] w-full flex-col items-center justify-end gap-1.5 rounded-[15px] border-[5px] border-[#ffdfb5] bg-[#0d6395] p-3 text-center text-[#ffdfb5] shadow-[inset_0_2px_#ffdfb5,inset_0_0_0_2px_#0d6395,0_5px_rgba(0,0,0,0.3)] aria-pressed:border-play">
                            <!-- Product right, ribbon left, title underneath — habbo.com's own
                                 arrangement, and the reason the icon is not centred. -->
                            <Sprite name={productIcon(product)} className="mt-auto mr-1 ml-auto" />

                            <span class="block font-condensed text-lg uppercase">{productName(product)}</span>

                            <!-- The price sits on habbo.com's own price-tag bitmap, which is why the
                                 label is brown (#a95219) and not the tile's cream. The ribbon HANGS
                                 off the tile's top-left corner (104x146 at left 24px / top -14px)
                                 rather than sitting inside it. -->
                            <span class="absolute -top-3.5 left-6 flex h-[146px] w-[104px] justify-center bg-contain bg-top bg-no-repeat pt-7"
                                  style="background-image:url({PRICE_TAG})">
                                <span class="whitespace-nowrap text-base font-bold text-[#a95219]">{formatPrice(product.priceMinor, product.currency)}</span>
                            </span>

                            {#if product.featured}
                                <span class="absolute -top-3 right-3 rounded-[3px] bg-play px-1.5 py-0.5 font-condensed text-xs uppercase text-white">{t('SHOP_OFFERINGS_BEST_DEAL_TITLE')}</span>
                            {/if}
                        </button>
                    {/each}
                </div>
            {/each}
        </div>

        <aside class="w-full shrink-0 lg:w-[300px]">
            <!-- `shop/purse/purse.html` is a SHOP component: the counters belong here. -->
            <Panel title="Mon compte" className="mb-6">
                <Purse />
            </Panel>

            <Panel title="Ta commande">
                {#if !chosen}
                    <p class="text-sm">Choisis une offre pour continuer.</p>
                {:else}
                    <p class="font-condensed text-lg uppercase text-white">{productName(chosen)}</p>
                    <p class="text-sm">{formatPrice(chosen.priceMinor, chosen.currency)}</p>

                    {#if $signedIn}
                        <Button variant="green" disabled={busy} onclick={buy} className="mt-3 w-full">
                            {busy ? t('SHOP_CART_LOADING') : t('SHOP_PAYMENT_BUTTON')}
                        </Button>
                    {:else}
                        <p class="mt-3 text-sm">{t('SUBSCRIPTION-LOGINNEEDED')}</p>
                    {/if}

                    {#if orderError}
                        <FormError inline>{orderError}</FormError>
                    {/if}
                {/if}
            </Panel>
        </aside>
    </div>
</ShopShell>
