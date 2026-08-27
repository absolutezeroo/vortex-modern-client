<script>
    // An article body, rendered from the emulator's closed block vocabulary
    // (Vortex.Database/Entities/Web/WebArticleBody.cs):
    //
    //   { type: 'p',   text }              a paragraph
    //   { type: 'h',   text }              a sub-heading
    //   { type: 'img', src, caption? }     a picture, `src` a path under c_images
    //   { type: 'btn', label, href }       a button
    //   { type: 'hr' }                     a separator
    //
    // There is NO html block, and that is the point: a body is typed JSON, never markup, so nothing
    // a writer pastes can turn into script on the public site. This renderer must therefore never
    // reach for `{@html}` — doing so would re-open by hand the hole the vocabulary closes, and it
    // would fail silently, because none of the five types carries markup to begin with.
    //
    // An unknown type cannot arrive: the server refuses to store one rather than let an article be
    // saved half-visible. If one somehow does, it is skipped rather than rendered as `[object]`.
    import {link} from 'svelte-spa-router';
    import {IMAGES} from '../lib/config.js';

    let {body = []} = $props();

    // `#/…` is an in-site route and goes through the router; everything else is a plain link, which
    // is the same split the server validates hrefs against.
    function internal(href)
    {
        return typeof href === 'string' && href.startsWith('#/');
    }
</script>

{#each body as block, index (index)}
    {#if block.type === 'p'}
        <p>{block.text}</p>
    {:else if block.type === 'h'}
        <h3>{block.text}</h3>
    {:else if block.type === 'img'}
        <figure class="my-6">
            <img src="{IMAGES}{block.src}" alt={block.caption ?? ''}
                 class="w-full shadow-[3px_3px_rgba(0,0,0,0.3)] [image-rendering:auto]" />
            {#if block.caption}
                <figcaption class="mt-1.5 text-sm text-[#999] italic">{block.caption}</figcaption>
            {/if}
        </figure>
    {:else if block.type === 'btn'}
        <p>
            {#if internal(block.href)}
                <a href={block.href.slice(1)} use:link
                   class="inline-block rounded-[5px] border-2 border-btn-line bg-btn px-6 py-3 text-center font-condensed text-base leading-[1.2] uppercase text-white shadow-btn hover:border-b-2 hover:border-btn-line-hover hover:bg-btn-hover active:translate-y-[2px] active:shadow-btn-active">
                    {block.label}
                </a>
            {:else}
                <a href={block.href} rel="noopener noreferrer"
                   class="inline-block rounded-[5px] border-2 border-btn-line bg-btn px-6 py-3 text-center font-condensed text-base leading-[1.2] uppercase text-white shadow-btn hover:border-b-2 hover:border-btn-line-hover hover:bg-btn-hover active:translate-y-[2px] active:shadow-btn-active">
                    {block.label}
                </a>
            {/if}
        </p>
    {:else if block.type === 'hr'}
        <!-- `.news-article hr`: the repeating dotted SVG border-image, 8px tall — the same
             declaration `.static-content hr` uses, shared in styles.css. -->
        <hr class="article-rule" />
    {/if}
{/each}
