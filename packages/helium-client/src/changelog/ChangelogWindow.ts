/**
 * ChangelogWindow
 *
 * Original addition — not part of the AS3 client, no AS3 source to trace.
 *
 * A small pill button (bottom-right) that opens a "What's New" modal listing
 * recent commits from the project's repos, via ChangelogService. Built as a
 * standalone DOM overlay rather than a window in the ported core/window
 * system — it's an original, non-AS3 feature, so it doesn't need to speak
 * that system's XML-layout/widget language, and staying decoupled avoids any
 * risk of destabilizing the carefully-ported toolbar/window code for an
 * unrelated feature.
 */
import {Logger} from '@core/utils/Logger';
import {ChangelogService, type ChangelogCommit} from './ChangelogService';
import './changelog-ui.scss';

const log = Logger.getLogger('ChangelogWindow');

/** localStorage key tracking the newest commit sha the user has already seen. */
const LAST_SEEN_KEY = 'changelog_last_seen_sha';

export class ChangelogWindow
{
    private _fab: HTMLButtonElement | null = null;
    private _fabDot: HTMLSpanElement | null = null;
    private _overlay: HTMLDivElement | null = null;
    private _panel: HTMLDivElement | null = null;
    private _listElement: HTMLDivElement | null = null;
    private _commits: ChangelogCommit[] | null = null;
    private _loading: Promise<ChangelogCommit[]> | null = null;
    private _disposed: boolean = false;

    /**
	 * Mounts the floating "What's New" button and kicks off a background fetch
	 * so the unread indicator is accurate before the user ever opens the panel.
	 */
    public mount(): void
    {
        const container = document.getElementById('helium-ui');

        if(!container) return;

        this._fab = document.createElement('button');
        this._fab.className = 'changelog-fab';
        this._fab.type = 'button';
        this._fab.setAttribute('aria-label', "What's New");

        const icon = document.createElement('span');

        icon.className = 'changelog-fab__icon';
        icon.setAttribute('aria-hidden', 'true');
        this._fab.appendChild(icon);

        const label = document.createElement('span');

        label.className = 'changelog-fab__label';
        label.textContent = "What's New";
        this._fab.appendChild(label);

        this._fabDot = document.createElement('span');
        this._fabDot.className = 'changelog-fab__dot';
        this._fab.appendChild(this._fabDot);

        this._fab.addEventListener('click', this._onOpen);
        container.appendChild(this._fab);

        this.ensureCommitsLoaded().catch(() => { /* unread dot just won't light up */ });
    }

    /** Fetches commits once and caches them; safe to call repeatedly. */
    private ensureCommitsLoaded(): Promise<ChangelogCommit[]>
    {
        if(this._commits) return Promise.resolve(this._commits);

        if(!this._loading)
        {
            this._loading = ChangelogService.fetchAll()
                .then((commits) =>
                {
                    this._commits = commits;
                    this.updateUnreadIndicator();

                    return commits;
                })
                .catch((error) =>
                {
                    log.warn('Failed to load changelog commits', error);
                    this._loading = null;
                    throw error;
                });
        }

        return this._loading;
    }

    private updateUnreadIndicator(): void
    {
        if(!this._fabDot || !this._commits || this._commits.length === 0) return;

        const latestSha = this._commits[0].shortSha;
        const lastSeen = localStorage.getItem(LAST_SEEN_KEY);

        this._fabDot.classList.toggle('is-visible', latestSha !== lastSeen);
    }

    private markAsSeen(): void
    {
        if(!this._commits || this._commits.length === 0) return;

        localStorage.setItem(LAST_SEEN_KEY, this._commits[0].shortSha);
        this._fabDot?.classList.remove('is-visible');
    }

    private _onOpen = (): void =>
    {
        if(!this._overlay)
        {
            this.buildOverlay();
        }

        this._overlay!.classList.add('is-open');

        if(this._commits)
        {
            this.renderCommits(this._commits);
            this.markAsSeen();
        }
        else
        {
            this.renderLoading();
            this.ensureCommitsLoaded()
                .then((commits) =>
                {
                    if(this._disposed) return;

                    this.renderCommits(commits);
                    this.markAsSeen();
                })
                .catch(() => this.renderError());
        }
    };

    private _onClose = (): void =>
    {
        this._overlay?.classList.remove('is-open');
    };

    private _onKeydown = (e: KeyboardEvent): void =>
    {
        if(e.key === 'Escape') this._onClose();
    };

    private buildOverlay(): void
    {
        const container = document.getElementById('helium-ui');

        if(!container) return;

        this._overlay = document.createElement('div');
        this._overlay.className = 'changelog-overlay';
        this._overlay.addEventListener('click', (e) =>
        {
            if(e.target === this._overlay) this._onClose();
        });
        document.addEventListener('keydown', this._onKeydown);

        this._panel = document.createElement('div');
        this._panel.className = 'changelog-panel';

        const header = document.createElement('div');

        header.className = 'changelog-panel__header';

        const titleGroup = document.createElement('div');

        const title = document.createElement('div');

        title.className = 'changelog-panel__title';
        title.textContent = "What's New";
        titleGroup.appendChild(title);

        const subtitle = document.createElement('div');

        subtitle.className = 'changelog-panel__subtitle';
        subtitle.textContent = 'Recent changes across the project.';
        titleGroup.appendChild(subtitle);

        header.appendChild(titleGroup);

        const closeBtn = document.createElement('button');

        closeBtn.className = 'changelog-panel__close';
        closeBtn.type = 'button';
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.textContent = '✕';
        closeBtn.addEventListener('click', this._onClose);
        header.appendChild(closeBtn);

        this._panel.appendChild(header);

        this._listElement = document.createElement('div');
        this._listElement.className = 'changelog-list';
        this._panel.appendChild(this._listElement);

        this._overlay.appendChild(this._panel);
        container.appendChild(this._overlay);
    }

    private renderLoading(): void
    {
        if(!this._listElement) return;

        this._listElement.innerHTML = '';

        for(let i = 0; i < 4; i++)
        {
            const skeleton = document.createElement('div');

            skeleton.className = 'changelog-skeleton';
            this._listElement.appendChild(skeleton);
        }
    }

    private renderError(): void
    {
        if(!this._listElement) return;

        this._listElement.innerHTML = '';

        const empty = document.createElement('div');

        empty.className = 'changelog-empty';
        empty.textContent = "Couldn't load updates right now — try again later.";
        this._listElement.appendChild(empty);
    }

    private renderCommits(commits: ChangelogCommit[]): void
    {
        if(!this._listElement) return;

        this._listElement.innerHTML = '';

        if(commits.length === 0)
        {
            const empty = document.createElement('div');

            empty.className = 'changelog-empty';
            empty.textContent = 'No recent updates found.';
            this._listElement.appendChild(empty);

            return;
        }

        for(const commit of commits)
        {
            const row = document.createElement('a');

            row.className = 'changelog-item';
            row.href = commit.url;
            row.target = '_blank';
            row.rel = 'noopener noreferrer';

            const accent = document.createElement('span');

            accent.className = 'changelog-item__accent';
            row.appendChild(accent);

            const body = document.createElement('span');

            body.className = 'changelog-item__body';

            const topLine = document.createElement('span');

            topLine.className = 'changelog-item__topline';

            const tag = document.createElement('span');

            tag.className = 'changelog-item__tag';
            tag.textContent = commit.repoLabel;
            topLine.appendChild(tag);

            const meta = document.createElement('span');

            meta.className = 'changelog-item__meta';
            meta.textContent = `${commit.authorName} · ${this.formatRelativeDate(commit.date)}`;
            topLine.appendChild(meta);

            body.appendChild(topLine);

            const summary = document.createElement('span');

            summary.className = 'changelog-item__summary';
            summary.textContent = commit.summary;
            body.appendChild(summary);

            row.appendChild(body);

            this._listElement.appendChild(row);
        }
    }

    private formatRelativeDate(iso: string): string
    {
        const diffMs = Date.now() - new Date(iso).getTime();
        const diffMinutes = Math.floor(diffMs / 60000);

        if(diffMinutes < 60) return `${Math.max(diffMinutes, 0)}m ago`;

        const diffHours = Math.floor(diffMinutes / 60);

        if(diffHours < 24) return `${diffHours}h ago`;

        const diffDays = Math.floor(diffHours / 24);

        if(diffDays < 30) return `${diffDays}d ago`;

        return new Date(iso).toLocaleDateString();
    }

    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        document.removeEventListener('keydown', this._onKeydown);
        this._fab?.removeEventListener('click', this._onOpen);
        this._fab?.remove();
        this._overlay?.remove();
        this._fab = null;
        this._fabDot = null;
        this._overlay = null;
        this._panel = null;
        this._listElement = null;
    }
}
