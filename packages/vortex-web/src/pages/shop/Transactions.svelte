<script>
    // `/shop/history` — `shop/transactions/transactions.html`:
    //
    //   <header class="shop__header"><h1 class="shop__header__title shop__header__title--single">
    //   <section><habbo-transactions-list class="main"><habbo-purse class="aside aside--box">
    //
    // So this page has the purse beside the list, where the store has it beside the cart — a
    // different layout, not a different branch of the same one.
    //
    // Empty: the boutique is not connected to a payment provider, so there is nothing to list.
    import ShopShell from './ShopShell.svelte';
    import Panel from '../../components/Panel.svelte';
    import Purse from '../../components/Purse.svelte';
    import {t} from '../../lib/i18n.js';
</script>

<ShopShell>
    <header>
        <h1 class="mt-0">{t('SHOP_TRANSACTIONS_TITLE')}</h1>
    </header>

    <section class="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div class="min-w-0 flex-1">
            <p>{t('EMPTY_RESULTS_TEXT')}</p>
            <p class="text-sm text-footer-copy">
                La boutique n'est pas branchée sur un moyen de paiement.
            </p>
        </div>

        <aside class="w-full shrink-0 lg:w-[300px]">
            <Panel title="Mon compte">
                <Purse />
            </Panel>
        </aside>
    </section>
</ShopShell>
