<script>
    // `community/photos/photos.html`. The photos are camera shots taken inside the hotel and stored
    // as user content; this hotel has none — there is no photo endpoint on the web API and no
    // usercontent tree behind the asset host — so the page renders habbo.com's own empty state
    // (`common/empty-results/empty-results.html`) rather than inventing pictures.
    import CommunityShell from './CommunityShell.svelte';
    import PageHeader from '../../components/PageHeader.svelte';
    import {t} from '../../lib/i18n.js';
</script>

<CommunityShell>
    <PageHeader title={t('PHOTOS_TITLE')} description={t('PHOTOS_DESCRIPTION')} illustration />

    <section class="mx-auto max-w-[1200px] px-3 pb-12">
        <p class="py-12 text-center">{t('EMPTY_RESULTS_TEXT')}</p>
    </section>
</CommunityShell>
