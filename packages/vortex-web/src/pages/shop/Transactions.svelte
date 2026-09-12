<script lang="ts">
    // `/shop/history` — `shop/transactions/transactions.html`:
    //
    //   <header class="shop__header"><h1 class="shop__header__title shop__header__title--single">
    //   <section><habbo-transactions-list class="main"><habbo-purse class="aside aside--box">
    //
    // So this page has the purse beside the list, where the store has it beside the chosen offer — a
    // different layout, not a different branch of the same one.
    //
    // Real since 2026-09-12: `GET /api/user/shop/orders`, the SELECTED avatar's orders, newest
    // first. Signed out it is a 401 and the page says so rather than showing an empty list, which
    // would read as "you have never bought anything".
    import {link} from 'svelte-spa-router';
    import ShopShell from './ShopShell.svelte';
    import Panel from '../../components/Panel.svelte';
    import Purse from '../../components/Purse.svelte';
    import * as api from '../../lib/api.js';
    import type {IShopOrder} from '../../lib/api.js';
    import {formatDate, formatPrice, orderLabel, productName} from '../../lib/shop.js';
    import {signedIn} from '../../lib/session.js';
    import {t} from '../../lib/i18n.js';

    let orders = $state<IShopOrder[]>([]);
    let loaded = $state(false);
    let error = $state('');

    $effect(() =>
    {
        // Read so the list refetches on sign-in rather than staying on whatever it had.
        const isIn = $signedIn;
        let cancelled = false;

        if(!isIn)
        {
            orders = [];
            loaded = true;

            return;
        }

        void api.getShopOrders()
            .then((answer) => !cancelled && (orders = answer))
            .catch((failure) => !cancelled && (error = (failure as Error).message))
            .finally(() => !cancelled && (loaded = true));

        return () => (cancelled = true);
    });
</script>

<ShopShell>
    <header>
        <h1 class="mt-0">{t('SHOP_TRANSACTIONS_TITLE')}</h1>
    </header>

    <section class="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div class="min-w-0 flex-1">
            {#if error}
                <p>{error}</p>
            {:else if !$signedIn}
                <p>{t('SUBSCRIPTION-LOGINNEEDED')}</p>
            {:else if loaded && !orders.length}
                <p>{t('EMPTY_RESULTS_TEXT')}</p>
            {:else}
                <ul class="space-y-1.5">
                    {#each orders as order (order.id)}
                        <li class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-page/40 py-1.5 last:border-0">
                            <span class="min-w-0">
                                <a href="/shop/order/{order.id}" use:link class="block truncate font-condensed text-base uppercase">{productName(order)}</a>
                                <span class="block text-xs">{formatDate(order.createdAt)} — {orderLabel(order)}</span>
                            </span>
                            <span class="whitespace-nowrap text-white">{formatPrice(order.priceMinor, order.currency)}</span>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>

        <aside class="w-full shrink-0 lg:w-[300px]">
            <Panel title="Mon compte">
                <Purse />
            </Panel>
        </aside>
    </section>
</ShopShell>
