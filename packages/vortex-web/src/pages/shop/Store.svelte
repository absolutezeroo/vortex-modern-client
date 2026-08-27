<script>
    // `/shop` — `shop/store/store.html` + `shop/store/inventory/…`:
    //
    //   <header class="shop__header"><h1 class="shop__header__title">Acheter des crédits Habbo et plus
    //   the inventory grid of `.inventory-thumbnail` tiles
    //   the cart and the purse down the side
    //
    // `.inventory-thumbnail` is the most distinctive component on the site and the easiest to get
    // wrong: cream 5px border, 15px radius, and THREE stacked shadows — an inset cream highlight
    // along the top, an inset ring of the panel colour just inside the border, and a hard 5px drop.
    // Drop any of the three and the tile flattens.
    //
    // Nothing can be bought: the emulator has no payment endpoint, so checkout stops at the cart.
    import ShopShell from './ShopShell.svelte';
    import Sprite from '../../components/Sprite.svelte';
    import Panel from '../../components/Panel.svelte';
    import Button from '../../components/Button.svelte';
    import Purse from '../../components/Purse.svelte';
    import {SHOP_SECTIONS} from '../../lib/mock.js';
    import {t} from '../../lib/i18n.js';

    const PRICE_TAG = new URL('../../assets/price_tag.png', import.meta.url).href;

    let cart = $state([]);

    const total = $derived(cart.reduce((sum, line) => sum + line.quantity, 0));

    function add(item)
    {
        const line = cart.find((entry) => entry.id === item.id);

        if(line)
        {
            line.quantity += 1;
            cart = cart;
        }
        else
        {
            cart = [...cart, {...item, quantity: 1}];
        }
    }

    function remove(id)
    {
        cart = cart.filter((entry) => entry.id !== id);
    }
</script>

<ShopShell>
    <div class="flex flex-col gap-6 lg:flex-row">
        <div class="min-w-0 flex-1">
            <h1 class="mt-0">{t('SHOP_TITLE')}</h1>

            {#each SHOP_SECTIONS as section (section.id)}
                <h3>{section.title}</h3>

                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {#each section.items as item (item.id)}
                        <button type="button" onclick={() => add(item)}
                                class="relative mx-auto flex min-h-[230px] w-full flex-col items-center justify-end gap-1.5 rounded-[15px] border-[5px] border-[#ffdfb5] bg-[#0d6395] p-3 text-center text-[#ffdfb5] shadow-[inset_0_2px_#ffdfb5,inset_0_0_0_2px_#0d6395,0_5px_rgba(0,0,0,0.3)]">
                            <!-- Product right, ribbon left, title underneath — habbo.com's own
                                 arrangement, and the reason the icon is not centred. -->
                            <Sprite name="credit{item.icon}" className="mt-auto mr-1 ml-auto" />

                            <span class="block font-condensed text-lg uppercase">{item.name}</span>
                            <span class="block text-sm">{item.amount} unites</span>

                            <!-- The price sits on habbo.com's own price-tag bitmap, which is why the
                                 label is brown (#a95219) and not the tile's cream. The ribbon HANGS
                                 off the tile's top-left corner (104x146 at left 24px / top -14px)
                                 rather than sitting inside it. -->
                            <span class="absolute -top-3.5 left-6 flex h-[146px] w-[104px] justify-center bg-contain bg-top bg-no-repeat pt-7"
                                  style="background-image:url({PRICE_TAG})">
                                <span class="whitespace-nowrap text-base font-bold text-[#a95219]">{item.price}</span>
                            </span>

                            {#if item.best}
                                <span class="absolute -top-3 right-3 rounded-[3px] bg-play px-1.5 py-0.5 font-condensed text-xs uppercase text-white">Le mieux</span>
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

            <Panel title={t('SHOP_CART_TITLE')}>
                {#if !cart.length}
                    <p class="text-sm">{t('SHOP_CART_EMPTY') === 'SHOP_CART_EMPTY' ? 'Ton panier est vide.' : t('SHOP_CART_EMPTY')}</p>
                {:else}
                    <ul class="space-y-1.5">
                        {#each cart as line (line.id)}
                            <li class="flex items-center justify-between gap-3 border-b border-page/40 pb-1.5 last:border-0">
                                <span class="min-w-0">
                                    <span class="block truncate text-sm text-white">{line.name}</span>
                                    <span class="block text-xs">x{line.quantity} — {line.price}</span>
                                </span>
                                <button type="button" onclick={() => remove(line.id)} aria-label={t('FORM_CANCEL_LABEL')}>
                                    <Sprite name="close" className="scale-75" />
                                </button>
                            </li>
                        {/each}
                    </ul>

                    <p class="mt-3 font-condensed uppercase text-white">{t('SHOP_CART_TOTAL')} — {total}</p>

                    <Button variant="green" disabled className="mt-3 w-full">Payer</Button>
                    <p class="mt-1.5 text-xs text-footer-copy">
                        Le paiement n'est pas branché : l'émulateur n'expose pas de route de commande.
                    </p>
                {/if}
            </Panel>
        </aside>
    </div>
</ShopShell>
