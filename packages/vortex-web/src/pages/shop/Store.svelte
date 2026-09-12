<script lang="ts">
    // `/shop` — `shop/store/store.html` -> `store/inventory/inventory.html` -> `credits.html`, and
    // the page is an ACCORDION, which is the thing this port had missed entirely:
    //
    //   <header class="shop__header"><h1 translate="SHOP_TITLE">
    //   <section>
    //     <div class="main">
    //       <habbo-inventory>            one <section> per family, each an accordion grid
    //     <habbo-shop-cart>
    //     <habbo-purse            class="aside aside--box">
    //     <aside                  class="aside aside--box"><h3 translate="SHOP_REDEEM_TITLE">
    //                                                      <habbo-voucher-redeem>
    //     <habbo-web-pages key="common/box_mall_info" class="aside aside--box">
    //
    // A tile is `<habbo-accordion-item-preview>` and clicking it expands
    // `<habbo-accordion-item-content>` — `credit-payment-details.html`: the icon, the title, the
    // price at 32/36px, a paragraph, and the buy button. The grid is two columns
    // (`habbo-accordion-item{width:50%}`) and the expanded panel spans BOTH
    // (`habbo-accordion-item-content{width:200%}` with `margin-left:-100%` on the even column), so
    // it opens as a full-width band under the row its tile is in.
    //
    // The voucher form is on THIS page as well as on /shop/prepaid — `store.html` carries its own
    // `<aside>` for it under "Tu as un code?".
    //
    // DEVIATION: `<habbo-shop-cart>` is absent. It is `ng-show="cartEnabled && itemCount > 0"` on
    // habbo.com — a flagged feature, hidden until something is added — and one product here makes
    // one ORDER, because an order is one payment at one provider: a basket of four bundles is four
    // payments, not one. The buy button therefore sits in the expanded panel, which is exactly where
    // `payment-details` puts habbo.com's own.
    //
    // The price shown is DISPLAY only. Nothing on this page is sent back: the request carries a
    // product code and the server reads the amount off its own row — see lib/api.ts::startShopOrder.
    import {push} from 'svelte-spa-router';
    import ShopShell from './ShopShell.svelte';
    import Sprite from '../../components/Sprite.svelte';
    import Panel from '../../components/Panel.svelte';
    import FormError from '../../components/FormError.svelte';
    import Purse from '../../components/Purse.svelte';
    import VoucherRedeem from '../../components/VoucherRedeem.svelte';
    import WebPage from '../../components/WebPage.svelte';
    import * as api from '../../lib/api.js';
    import type {IShopCatalog, IShopProduct} from '../../lib/api.js';
    import {orderSections, priceTag, productDescription, productIcon, productName, sectionTitle} from '../../lib/shop.js';
    import {signedIn} from '../../lib/session.js';
    import {t} from '../../lib/i18n.js';

    const PRICE_TAG = new URL('../../assets/price_tag.png', import.meta.url).href;

    let catalog = $state<IShopCatalog | null>(null);
    let loadError = $state('');
    /** The expanded offer's code. One at a time, like the accordion. */
    let opened = $state('');
    let busy = $state('');
    let orderError = $state('');

    $effect(() =>
    {
        let cancelled = false;

        void api.getShopProducts()
            .then((answer) => !cancelled && (catalog = answer))
            .catch((error) => !cancelled && (loadError = (error as Error).message));

        return () => (cancelled = true);
    });

    const sections = $derived(orderSections(catalog?.sections ?? []));

    /**
     * The grid two at a time. habbo.com gets the full-width expanded panel out of floats and a 200%
     * width; a CSS grid reaches the same place by rendering the panel as a `col-span-2` cell after
     * the ROW its tile belongs to, which is why the products are walked in pairs.
     */
    function rowsOf(products: readonly IShopProduct[]): IShopProduct[][]
    {
        const rows: IShopProduct[][] = [];

        for(let index = 0; index < products.length; index += 2)
        {
            rows.push(products.slice(index, index + 2));
        }

        return rows;
    }

    async function buy(product: IShopProduct)
    {
        if(busy)
        {
            return;
        }

        busy = product.code;
        orderError = '';

        try
        {
            const start = await api.startShopOrder(product.code);

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
            busy = '';
        }
    }
</script>

<!-- `.inventory-thumbnail`, and it is the component on this site that is easiest to get wrong.
     Cream 5px border, 15px radius and THREE stacked shadows — an inset cream highlight along the
     top, an inset ring of the panel colour just inside the border, and a hard 5px drop. Drop any of
     the three and the tile flattens.

     Its four parts, all from the template:
       __pricetag  104x146 HANGING off the top-left (left 24, top -14), holding the amount at 24px
                   in #a95219 over the currency at 18px in black — two lines, not one string
       __icon      fills the tile
       __tag       at right 18 / top -8: "Meilleure Offre" on #cc1600, "Avec" on #1580ff
       __banner    a black 50% bar across the BOTTOM with the offer's name, left-aligned at 20px of
                   padding, and a chevron that rotates 540deg when the item expands -->
{#snippet thumbnail(product: IShopProduct, isOpen: boolean)}
    {@const tag = priceTag(product.priceMinor, product.currency)}

    <button type="button" onclick={() => (opened = isOpen ? '' : product.code)}
            aria-expanded={isOpen}
            class="relative mx-auto flex h-[180px] w-full cursor-pointer items-center rounded-[15px] border-[5px] border-[#ffdfb5] bg-[#0d6395] text-[#ffdfb5] shadow-[inset_0_2px_#ffdfb5,inset_0_0_0_2px_#0d6395,0_5px_rgba(0,0,0,0.3)]">
        <span class="flex h-full w-full items-center justify-center">
            <Sprite name={productIcon(product)} />
        </span>

        <span class="absolute -top-3.5 left-6 flex h-[146px] w-[104px] flex-col items-center justify-center bg-contain bg-no-repeat [image-rendering:pixelated]"
              style="background-image:url({PRICE_TAG})">
            <span class="m-0 font-bold leading-normal text-[#a95219] {tag.condensed ? 'text-lg' : 'text-2xl'}">{tag.amount}</span>
            <span class="m-0 text-lg font-bold leading-normal text-black">{tag.currency}</span>
        </span>

        <span class="absolute -top-2 right-[18px] flex">
            {#if product.featured}
                <span class="ml-[5px] bg-[#cc1600] px-3 py-1 font-bold uppercase text-white shadow-[0_4px_rgba(0,0,0,0.2)]">
                    {t('SHOP_OFFERINGS_BEST_DEAL_TITLE')}
                </span>
            {/if}
        </span>

        <span class="absolute inset-x-0 bottom-0 rounded-b-[10px] bg-black/50 py-1.5 pl-5 text-left text-base font-bold text-white">
            {productName(product)}
            <Sprite name="shopChevron" className="absolute right-3 top-1/2 -mt-[9px] transition-transform duration-300 {isOpen ? 'rotate-[540deg]' : ''}" />
        </span>
    </button>
{/snippet}

<!-- `credit-payment-details.html`: the icon floated left, then the title beside the price, then the
     description, then the payment step. `.payment-details__price` is 32px rising to 36px and white,
     which is the biggest type on the page — deliberately, it is what you are agreeing to. -->
{#snippet details(product: IShopProduct)}
    <div class="mt-3 overflow-hidden rounded-[3px] bg-box p-6">
        <span class="float-left mr-3 hidden xs:block"><Sprite name={productIcon(product)} /></span>

        <div class="overflow-hidden">
            <header class="items-center md:flex">
                <h3 class="m-0 mr-3 normal-case">{productName(product)}</h3>
                <div class="mt-1.5 whitespace-nowrap text-[32px] leading-none text-white md:mt-0 md:ml-auto xs:text-4xl">
                    {priceTag(product.priceMinor, product.currency).amount}
                    {product.currency}
                </div>
            </header>

            {#if productDescription(product)}
                <p>{productDescription(product)}</p>
            {/if}

            {#if $signedIn}
                <!-- `.payment-button`'s ramp: #00813e on #8eda55, the shop's own green, and the one
                     that presses down 2px with its shadow dropping from 3px to 1px. -->
                <button type="button" onclick={() => buy(product)} disabled={busy === product.code}
                        class="mb-0 inline-block rounded-[5px] border-2 border-[#8eda55] bg-[#00813e] px-6 py-3 text-center text-base uppercase leading-[1.2] text-white shadow-[0_3px_0_1px_rgba(0,0,0,0.3)] hover:border-[#b9f373] hover:bg-[#00ab54] active:translate-y-[2px] active:border-[#5abb37] active:bg-[#006743] active:shadow-[0_1px_0_1px_rgba(0,0,0,0.3)] disabled:border-[#5abb37] disabled:bg-[#006743] disabled:opacity-40">
                    {busy === product.code ? t('SHOP_CART_LOADING') : t('SHOP_PAYMENT_BUTTON')}
                </button>
            {:else}
                <p>{t('SUBSCRIPTION-LOGINNEEDED')}</p>
            {/if}

            {#if orderError && busy !== product.code}
                <FormError inline>{orderError}</FormError>
            {/if}
        </div>
    </div>
{/snippet}

<ShopShell>
    <!-- `.shop__header{margin-bottom:24px}` with the title floated full width. -->
    <header class="mb-6">
        <h1 class="mt-0">{t('SHOP_TITLE')}</h1>
    </header>

    <section class="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div class="min-w-0 flex-1">
            {#if loadError}
                <p>{loadError}</p>
            {:else if catalog && !sections.length}
                <p>{t('EMPTY_RESULTS_TEXT')}</p>
            {/if}

            <!-- Each family is a BOX, not a bare heading over a grid: `habbo-shop-sections` is
                 `#103960`, rounded 3px, `padding: 24px 12px` widening to 24 from 532px, with 24px
                 under it. Without it the headings float on the page background and the three
                 families read as one long list. -->
            {#each sections as section (section.code)}
                <section class="mb-6 overflow-hidden rounded-[3px] bg-box px-3 py-6 last:mb-0 xs:px-6">
                    <!-- `.inventory__section__title{text-transform:none}` — the one heading on the
                         site that keeps its case. -->
                    <h3 class="mt-0 normal-case">{sectionTitle(section.code)}</h3>

                    <div class="-mt-3 grid grid-cols-1 gap-x-6 md:grid-cols-2">
                        {#each rowsOf(section.products) as row, index (index)}
                            {#each row as product (product.code)}
                                <div class="mt-6">{@render thumbnail(product, opened === product.code)}</div>
                            {/each}

                            <!-- The expanded panel spans the row, which is what habbo.com's 200%
                                 width and -100% margin add up to. -->
                            {#each row.filter((product) => opened === product.code) as product (product.code)}
                                <div class="md:col-span-2">{@render details(product)}</div>
                            {/each}
                        {/each}
                    </div>
                </section>
            {/each}
        </div>

        <aside class="w-full shrink-0 lg:w-[300px]">
            <!-- `<habbo-purse habbo-require-session class="aside aside--box">`. It carries its own
                 "Porte-monnaie" heading, so there is no wrapper title to invent here. -->
            <div class="mb-6"><Purse /></div>

            <!-- store.html's own `<aside>`: the voucher form lives on the store page too, not only
                 on /shop/prepaid. -->
            {#if $signedIn}
                <Panel title={t('SHOP_REDEEM_TITLE')} className="mb-6">
                    <VoucherRedeem />
                </Panel>
            {/if}

            <!-- `<habbo-web-pages key="common/box_mall_info" class="aside aside--box">` — the
                 "Info & aide" box. It was already mirrored into src/webpages/ and simply never
                 rendered; it is what tells a player that buying credits anywhere else is how you get
                 scammed and banned, so it is not filler. -->
            <WebPage key="common/box_mall_info" className="static-content--box overflow-hidden rounded-[3px] bg-card px-3 py-6 xs:px-6" />
        </aside>
    </section>
</ShopShell>
