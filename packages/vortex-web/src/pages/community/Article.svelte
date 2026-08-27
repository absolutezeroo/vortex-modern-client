<script>
    // `/article/:id/:title` — `community/article/article.html`, which is the same
    // `main--fixed` + 304px safety aside as the home and the category feed. habbo.com keeps the
    // community tab bar lit here (the news tab matches /community/article too).
    import {link} from 'svelte-spa-router';
    import CommunityShell from './CommunityShell.svelte';
    import ContentAside from '../../components/ContentAside.svelte';
    import Sprite from '../../components/Sprite.svelte';
    import {articleById, ARTICLES} from '../../lib/mock.js';
    import {IMAGES} from '../../lib/config.js';

    let {params = {}} = $props();

    const article = $derived(articleById(params.id));
    const others = $derived(ARTICLES.filter((item) => item.id !== params.id).slice(0, 3));

    let liked = $state(false);
</script>

<CommunityShell>
<main>
    <ContentAside>
        <div>
            {#if !article}
                <h1>Cet article n'existe pas</h1>
                <p><a href="/community" use:link>Retour a la communaute</a></p>
            {:else}
                <!-- `.news-article` -->
                <article>
                    <h1>{article.title}</h1>
                    <p class="text-sm">
                        {new Date(article.date).toLocaleDateString('fr-FR')} — par {article.author}
                    </p>

                    <img src="{IMAGES}{article.image}" alt="" class="my-6 w-full shadow-[3px_3px_rgba(0,0,0,0.3)] [image-rendering:auto]" />

                    {#each article.body as paragraph}
                        <p>{paragraph}</p>
                    {/each}

                    <!-- `.news-footer`: habbo.com's rule here is a repeated dotted SVG, which is why
                         this is a dotted border and not a 1px line. -->
                    <div class="mt-6 flex items-center gap-6 border-t border-dotted border-black/30 pt-3">
                        <button type="button" onclick={() => (liked = !liked)}
                                class="flex items-center gap-1.5 font-condensed uppercase {liked ? 'text-white' : 'text-ink hover:text-white'}">
                            <Sprite name={liked ? 'heart' : 'like'} />
                            {liked ? 'Aime' : 'J\'aime'}
                        </button>
                        <button type="button" class="flex items-center gap-1.5 font-condensed uppercase text-ink hover:text-white">
                            <Sprite name="report" />
                            Signaler
                        </button>
                    </div>
                </article>

                <h3 class="mt-12">A lire aussi</h3>
                <ul>
                    {#each others as other (other.id)}
                        <li class="py-1.5">
                            <a href="/article/{other.id}/{other.id}" use:link>{other.title}</a>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    </ContentAside>
</main>
</CommunityShell>
