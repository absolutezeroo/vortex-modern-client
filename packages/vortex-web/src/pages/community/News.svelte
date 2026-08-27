<script>
    // `/community` — `community/community.html` + `community/category/category.html`. Four tabs
    // (Photos / Chambres / Fansites / Actualites), and the news tab itself is the standard
    // `main--fixed` + 304px safety aside, same as the home and the article page.
    //
    // Articles are mocked (lib/mock.js -> ARTICLES); the emulator has no article endpoint, and the
    // images are the hotel's real promo art either way.
    import {link} from 'svelte-spa-router';
    import CommunityShell from './CommunityShell.svelte';
    import ContentAside from '../../components/ContentAside.svelte';
    import NewsList from '../../components/NewsList.svelte';
    import {t} from '../../lib/i18n.js';
    import {ARTICLES, CATEGORIES} from '../../lib/mock.js';

    let {params = {}} = $props();

    const category = $derived(params.category && params.category !== 'all' ? params.category : 'tout');

    const shown = $derived(category === 'tout'
        ? ARTICLES
        : ARTICLES.filter((article) => article.category === category));
</script>

<CommunityShell>
<main>
    <ContentAside>
        <div>
            <h1>{t('NEWS_TITLE')}</h1>

            <!-- The category filter as habbo.fr renders it: a label, then one pill per category,
                 the active one lighter. It comes out of the CMS's own markup, not out of
                 app.css's `.category-filter` (which is a right-aligned row with bar separators and
                 is used elsewhere), so this follows the rendered page. -->
            <p class="mt-6 mb-3 text-sm">Voir des nouveautés à propos de :</p>

            <ul class="mb-6 flex flex-wrap gap-1.5">
                {#each CATEGORIES as item (item.id)}
                    <li>
                        <a href={item.id === 'tout' ? '/community/category/all' : `/community/category/${item.id}`} use:link
                           class="block rounded-[3px] px-3 py-1 text-sm hover:border-b-0 {category === item.id ? 'bg-btn text-white' : 'bg-topbar text-white hover:bg-btn-hover'}">
                            {item.label}
                        </a>
                    </li>
                {/each}
            </ul>

            <NewsList articles={shown} categories={CATEGORIES} />
        </div>
    </ContentAside>
</main>
</CommunityShell>
