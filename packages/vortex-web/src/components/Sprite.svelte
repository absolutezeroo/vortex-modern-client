<script>
    // One icon out of habbo.com's sprite sheet. This is the single place the port keeps a real CSS
    // rule instead of a Tailwind utility: `background-position` is a pair of pixel offsets that
    // differ for all ~40 icons, so a utility per icon would be 40 arbitrary-value classes naming
    // numbers that lib/sprite.js already holds.
    import {SPRITE, SPRITE_URL} from '../lib/sprite.js';

    let {name, label = '', className = ''} = $props();

    const box = $derived(SPRITE[name] ?? [0, 0, 0, 0]);
</script>

<span
    class="inline-block bg-no-repeat align-middle {className}"
    style="background-image:url({SPRITE_URL});background-position:-{box[0]}px -{box[1]}px;width:{box[2]}px;height:{box[3]}px"
    role={label ? 'img' : 'presentation'}
    aria-label={label || null}
></span>
