<script>
    // The news feed. habbo.fr renders it in TWO shapes and they are not interchangeable:
    //
    //   the home (`lead` + `columns={2}`)  a full-width 300px lead plate with the story laid over
    //                                      its left third, then the rest two-up with 120px plates
    //   /community/category (`columns={1}`) a flat single-column list, no lead
    //
    // Common to both, and the part that was wrong here before:
    //   .news-header__title    { font-size: 24px; margin: 0 }   (32px for the lead)
    //   .news-header__info     { font-size: 14px; color: #999; font-style: italic }
    //   .news-header__date::after { content: " | " }             between the date and the categories
    //   .news-header__summary  { font-size: 14px }
    //   .news-header__viewport { 100px square, box-shadow 3px 3px } -> 120px at 767
    //   .news-header--single .news-header__wrapper { max-width: 330px; padding: 12px 12px 0 }
    //
    // The feed's markup is SERVER-rendered on habbo.com (`habbo-compile data="…"`), so it is not in
    // sources/templates/ — this follows the rendered page, with the class rules above for geometry.
    import {link} from 'svelte-spa-router';
    import EmptyResults from './EmptyResults.svelte';
    import {IMAGES} from '../lib/config.js';

    let {articles = [], categories = [], lead = false, columns = 1} = $props();

    const first = $derived(lead ? articles[0] ?? null : null);
    const rest = $derived(lead ? articles.slice(1) : articles);

    function href(article)
    {
        return `/article/${article.id}/${article.id}`;
    }

    function label(id)
    {
        return categories.find((category) => category.id === id)?.label ?? id;
    }

    function when(date)
    {
        return new Date(date).toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'});
    }
</script>

{#if first}
    <!-- `.news-header--single`: the plate fills the row and the story sits on top of its left third,
         over a dark wash, from 767px. Below that the two stack. -->
    <article class="relative mb-6 md:h-[300px]">
        <a href={href(first)} use:link class="block hover:border-b-0">
            <div class="overflow-hidden shadow-[3px_3px_rgba(0,0,0,0.3)] md:absolute md:inset-0 md:shadow-none">
                <img src="{IMAGES}{first.image}" alt=""
                     class="h-[200px] w-full object-cover [image-rendering:auto] md:h-[300px]" />
            </div>

            <div class="relative p-3 md:h-full md:max-w-[330px] md:bg-black/45 md:pt-3 md:pr-3 md:pb-0 md:pl-3">
                <h2 class="mt-0 mb-1.5">{first.title}</h2>
                <p class="m-0 text-sm text-[#ccc] italic">{when(first.date)} | {label(first.category)}</p>
                <p class="mt-3 text-sm text-white">{first.summary}</p>
            </div>
        </a>
    </article>
{/if}

<div class={columns > 1 ? 'grid grid-cols-1 gap-x-6 md:grid-cols-2' : ''}>
    {#each rest as article (article.id)}
        <article class="mb-6 flex gap-3">
            <a href={href(article)} use:link class="block shrink-0 hover:border-b-0">
                <span class="block h-[100px] w-[100px] overflow-hidden shadow-[3px_3px_rgba(0,0,0,0.3)] md:h-[120px] md:w-[120px]">
                    <img src="{IMAGES}{article.thumbnail ?? article.image}" alt=""
                         class="h-full w-full object-cover [image-rendering:auto]" />
                </span>
            </a>

            <div class="min-w-0 flex-1">
                <a href={href(article)} use:link class="hover:border-b-0">
                    <h2 class="m-0 text-2xl">{article.title}</h2>
                </a>

                <p class="m-0 text-sm text-[#999] italic">{when(article.date)} | {label(article.category)}</p>

                <p class="mt-1.5 text-sm">{article.summary}</p>
            </div>
        </article>
    {/each}
</div>

{#if !articles.length}
    <EmptyResults className="py-12" />
{/if}
