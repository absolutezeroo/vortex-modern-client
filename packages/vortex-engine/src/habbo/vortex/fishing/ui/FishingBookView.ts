import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import {Logger} from '@core/utils/Logger';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';

import type {FishSpeciesDefinition} from '../definitions/FishSpeciesDefinition';
import type {HabboFishing} from '../HabboFishing';

const log = Logger.getLogger('habbo.vortex.fishing.ui.FishingBookView');

const LAYOUT_BOOK = 'vortex_fishing_book_xml';
const LAYOUT_ROW = 'vortex_fishing_species_row_xml';

const CHILD_LIST = 'fishing_species_list';
const CHILD_LEVEL = 'fishing_level_text';
const CHILD_PROGRESS = 'fishing_progress_text';
const CHILD_CURRENCY = 'fishing_currency_text';
const CHILD_CAUGHT = 'fishing_caught_text';
const CHILD_ROD_QUALITY = 'fishing_rod_quality';
const CHILD_CURRENCY_ICON = 'fishing_currency_icon';

/** The detail pane, filled from whichever row the pointer is over. */
const DETAIL_NAME = 'detail_name';
const DETAIL_IMAGE = 'detail_image';
const DETAIL_STARS = 'detail_stars';
const DETAIL_ZONE = 'detail_zone';
const DETAIL_LEVEL = 'detail_level';
const DETAIL_HOURS = 'detail_hours';
const DETAIL_DAYS = 'detail_days';
const DETAIL_SEASONS = 'detail_seasons';
const DETAIL_WEIGHT = 'detail_weight';
const DETAIL_RECORD = 'detail_record';

const ROW_NAME = 'row_name';
const ROW_STARS = 'row_stars';
const ROW_LEVEL = 'row_level';
const ROW_UNDERLINE = 'row_underline';

/**
 * The rarity star, and how five of them are laid out.
 *
 * The sprite is 13 wide and they sit on a 12px stride, so each overlaps its neighbour by a pixel —
 * five land in 61px, which is the gap the row layout leaves between the name and the level.
 */
const ASSET_STAR = 'star_small_gold';

/**
 * The rod-quality indicator, one sprite per tier. Six of them, `_0` through `_5`, which is why this
 * reads the rod and not the fishing level: rod quality is 1-5, the fishing level runs to 100.
 */
const ASSET_ROD_QUALITY_PREFIX = 'fishing_skill_level_';

/** The Fish Token, drawn beside its count. */
const ASSET_TOKEN = 'fish_currency_icon';

/**
 * A species' artwork, named from the last segment of its localisation key —
 * `vortex.fishing.species.minnow` resolves `fishpedia_minnow_preview`.
 *
 * These are Habbo Origins' own previews, extracted from `hh_fishing.cct`; 102 of them ship, against
 * the 18 species the seed defines, so there is room for an operator to add fish that already have
 * art. Derived rather than stored because the key is what an operator already writes in the
 * `fishing_species` table; a second column for the sprite would be a second thing to keep in step.
 * A species with no artwork simply shows none.
 */
const ASSET_FISH_PREFIX = 'fishpedia_';
const ASSET_FISH_SUFFIX = '_preview';

/** The largest sprite in the set. Smaller ones are centred in it, never stretched. */
const FISH_SLOT_WIDTH = 63;
const FISH_SLOT_HEIGHT = 45;
const MAX_ROD_QUALITY = 5;
const STAR_STRIDE = 12;
const STAR_WIDTH = 13;
const STAR_HEIGHT = 17;
const MAX_STARS = 5;

const KEY_LEVEL = 'vortex.fishing.book.level';
const KEY_PROGRESS = 'vortex.fishing.book.progress';
const KEY_CURRENCY = 'vortex.fishing.book.currency';
const KEY_CAUGHT = 'vortex.fishing.book.caught';
const KEY_LEVEL_REQUIRED = 'vortex.fishing.book.level_required';

/**
 * The hover detail. One line with separators rather than several: the tooltip window is created with
 * the host window's own style and nothing here controls whether it wraps, so a caption that assumed
 * line breaks would render as one run anyway.
 */
const KEY_DETAIL_PROMPT = 'vortex.fishing.book.detail_prompt';
const KEY_DETAIL_ZONE = 'vortex.fishing.book.detail_zone';
const KEY_DETAIL_HOURS = 'vortex.fishing.book.detail_hours';
const KEY_DETAIL_DAYS = 'vortex.fishing.book.detail_days';
const KEY_DETAIL_SEASONS = 'vortex.fishing.book.detail_seasons';
const KEY_DETAIL_WEIGHT = 'vortex.fishing.book.detail_weight';
const KEY_DETAIL_RECORD = 'vortex.fishing.book.detail_record';
const KEY_DETAIL_UNCAUGHT = 'vortex.fishing.book.detail_uncaught';
const KEY_ANY_LEVEL = 'vortex.fishing.book.any_level';
const KEY_ANY_TIME = 'vortex.fishing.book.any_time';
const KEY_EVERY_DAY = 'vortex.fishing.book.every_day';
const KEY_ALL_YEAR = 'vortex.fishing.book.all_year';
const KEY_DAY_PREFIX = 'vortex.fishing.day.';
const KEY_SEASON_PREFIX = 'vortex.fishing.season.';
const KEY_NEVER = 'vortex.fishing.book.never';

const ALL_HOURS = 0xFFFFFF;
const ALL_DAYS = 0b1111111;
const ALL_SEASONS = 0b1111;
const HOURS_IN_DAY = 24;
const DAYS_IN_WEEK = 7;
const SEASON_COUNT = 4;

/**
 * The fishing tab's contents — the records book.
 *
 * NOT ported from AS3 — Vortex-only system, no Habbo equivalent and therefore no AS3 source to
 * trace to. See `docs/vortex-original/fishing.md` §2.6.
 *
 * **It draws the whole species table and dims what has not been caught.** `HabboFishing.getRecord()`
 * answers null for a species with no personal best, and that null is what greys the row — a list of
 * only what you have caught would say nothing about what is left, and it is the gap that makes a
 * player go looking at a different hour or a different zone.
 *
 * It rebuilds wholesale rather than diffing. The list is a few dozen rows, the inputs change on a
 * definitions reload or a catch, and a diff would be more code than the redraw it saves.
 */
export class FishingBookView
{
    // TS-only: Vortex-only view — no AS3 counterpart for any member here.
    private _window: IWindowContainer | null = null;

    // TS-only: see above.
    private readonly _fishing: HabboFishing;

    // TS-only: see above.
    private readonly _windowManager: IHabboWindowManager;

    // TS-only: see above.
    private readonly _localizations: IHabboLocalizationManager | null;

    /** The star sprite, resolved once. Null when the asset library has no such image. */
    // TS-only: Vortex-only view.
    private readonly _assets: IAssetLibrary | null;

    // TS-only: Vortex-only view.
    constructor(
        fishing: HabboFishing,
        windowManager: IHabboWindowManager,
        localizations: IHabboLocalizationManager | null = null,
        assets: IAssetLibrary | null = null
    )
    {
        this._fishing = fishing;
        this._windowManager = windowManager;
        this._localizations = localizations;
        this._assets = assets;
    }

    /**
     * The container the inventory parents into its own main container. Built on first ask; the
     * inventory stretches it to height afterwards, so nothing here sets one.
     */
    // TS-only: Vortex-only view.
    public getWindowContainer(): IWindowContainer | null
    {
        if(this._window === null)
        {
            this._window = this._windowManager.buildWidgetLayout(LAYOUT_BOOK) as IWindowContainer | null;

            if(this._window === null)
            {
                log.warn(`${LAYOUT_BOOK} is not registered; the fishing tab has no contents.`);
            }
        }

        return this._window;
    }

    /**
     * Redraws from whatever the server last pushed. Called by the model on every category switch and
     * whenever the definitions or the records change.
     */
    // TS-only: Vortex-only view.
    public update(): void
    {
        const window = this.getWindowContainer();

        if(window === null) return;

        const definitions = this._fishing.definitions;

        if(!definitions.loaded)
        {
            // Nothing has been pushed yet — an empty tab is honest, and the push will redraw it.
            return;
        }

        this.updateHeader();
        this.clearDetail();
        this.updateSpeciesList(window);
    }

    // TS-only: Vortex-only view.
    private updateHeader(): void
    {
        const state = this._fishing.playerState;
        const definitions = this._fishing.definitions;
        const tier = definitions.rodQualityForXp(state.rodXp);

        this.setCaption(CHILD_LEVEL, this.translate(KEY_LEVEL, 'level', `${state.fishingLevel}`, 'rod', tier === null ? '' : this.translate(tier.nameKey)));
        this.setCaption(CHILD_PROGRESS, this.translate(KEY_PROGRESS, 'fishingxp', `${state.fishingXp}`, 'rodxp', `${state.rodXp}`));
        this.setCaption(CHILD_CURRENCY, this.translate(KEY_CURRENCY, 'amount', `${state.currency}`));
        this.setRodQuality(state.rodQuality);
        this.setHeaderIcon(CHILD_CURRENCY_ICON, ASSET_TOKEN);
        this.setCaption(
            CHILD_CAUGHT,
            this.translate(KEY_CAUGHT, 'caught', `${this._fishing.caughtSpeciesCount}`, 'total', `${definitions.allSpecies.length}`)
        );
    }

    /**
     * Rebuilds every row. The list owns its children once added, so the previous set is removed
     * first — appending on each update is how a tab ends up with the same species six times.
     */
    // TS-only: Vortex-only view.
    private updateSpeciesList(window: IWindowContainer): void
    {
        const list = window.findChildByName(CHILD_LIST) as IItemListWindow | null;

        if(list === null)
        {
            log.warn(`${CHILD_LIST} is missing from ${LAYOUT_BOOK}; the species list cannot be drawn.`);

            return;
        }

        while(list.numListItems > 0)
        {
            const item = list.getListItemAt(0);

            if(item === null) break;

            list.removeListItem(item);
            item.dispose();
        }

        for(const species of this._fishing.definitions.allSpecies)
        {
            const row = this._windowManager.buildWidgetLayout(LAYOUT_ROW) as IWindowContainer | null;

            if(row === null)
            {
                log.warn(`${LAYOUT_ROW} is not registered; the species list cannot be drawn.`);

                return;
            }

            const record = this._fishing.getRecord(species.id);

            this.setRowCaption(row, ROW_NAME, this.translate(species.nameKey));
            this.setRowStars(row, species.rarityStars);
            this.bindRowHover(row, species);
            this.setRowCaption(
                row,
                ROW_LEVEL,
                species.requiredLevel > 0 ? this.translate(KEY_LEVEL_REQUIRED, 'level', `${species.requiredLevel}`) : ''
            );

            // The dimming *is* the "not caught yet" state — see the class comment.
            if(record === null) row.disable();

            list.addListItem(row);
        }
    }

    /**
     * `getLocalizationWithParams()` never returns null in this port — it answers the key itself when
     * there is no entry — so the key doubles as its own fallback and a missing translation shows up
     * rather than leaving a blank row.
     */
    // TS-only: Vortex-only view.
    private translate(key: string, ...params: string[]): string
    {
        return this._localizations?.getLocalizationWithParams(key, key, ...params) ?? key;
    }

    // TS-only: Vortex-only view.
    private setCaption(name: string, caption: string): void
    {
        const child = this._window?.findChildByName(name) ?? null;

        if(child !== null) child.caption = caption;
    }

    // TS-only: Vortex-only view.
    private setRowCaption(row: IWindowContainer, name: string, caption: string): void
    {
        const child: IWindow | null = row.findChildByName(name);

        if(child !== null) child.caption = caption;
    }

    /**
     * Wires one row: hovering underlines it, clicking fills the detail pane.
     *
     * Split that way on purpose — an underline that follows the pointer says which row is under it
     * without the pane flickering through every species on the way down the list.
     *
     * A disabled row still reports both: the species a player has never caught are exactly the ones
     * worth reading, since the pane is where a species says when and where it bites.
     */
    // TS-only: Vortex-only view.
    private bindRowHover(row: IWindowContainer, species: FishSpeciesDefinition): void
    {
        const underline = row.findChildByName(ROW_UNDERLINE);
        const name = row.findChildByName(ROW_NAME) as ITextWindow | null;

        row.addEventListener(WindowMouseEvent.OVER, () =>
        {
            if(underline === null) return;

            // Sized on hover, not at build time: `textWidth` is only meaningful once the caption has
            // been laid out, and a species whose name is two characters long must not get the same
            // rule as one with fourteen. This is a link's underline, not a column rule.
            if(name !== null && name.textWidth > 0) underline.width = Math.ceil(name.textWidth);

            underline.visible = true;
        });

        row.addEventListener(WindowMouseEvent.OUT, () =>
        {
            if(underline !== null) underline.visible = false;
        });

        row.addEventListener(WindowMouseEvent.CLICK, () => this.showDetail(species));
    }

    /**
     * The detail pane for one species: where it lives, when it bites, what it weighs, what it pays
     * and how the player has done against it.
     *
     * This is the only place the four availability axes are readable. The row carries a level gate
     * and a star count; the hour, weekday and season masks decide just as much and appear nowhere
     * else — a species that only bites on a winter Saturday night is otherwise indistinguishable
     * from one nobody has been lucky with.
     */
    // TS-only: Vortex-only view.
    private showDetail(species: FishSpeciesDefinition): void
    {
        const zone = this._fishing.definitions.getZone(species.zoneId);
        const record = this._fishing.getRecord(species.id);

        this.setCaption(DETAIL_NAME, this.translate(species.nameKey));
        this.setDetailStars(species.rarityStars);
        this.setDetailImage(species.nameKey);
        this.setCaption(DETAIL_ZONE, this.translate(KEY_DETAIL_ZONE, 'zone', zone === null ? '' : this.translate(zone.nameKey)));
        this.setCaption(
            DETAIL_LEVEL,
            species.requiredLevel > 0
                ? this.translate(KEY_LEVEL_REQUIRED, 'level', `${species.requiredLevel}`)
                : this.translate(KEY_ANY_LEVEL)
        );
        this.setCaption(DETAIL_HOURS, this.translate(KEY_DETAIL_HOURS, 'hours', this.describeHours(species.activeHours)));
        this.setCaption(DETAIL_DAYS, this.translate(KEY_DETAIL_DAYS, 'days', this.describeDays(species.activeWeekdays)));
        this.setCaption(DETAIL_SEASONS, this.translate(KEY_DETAIL_SEASONS, 'seasons', this.describeSeasons(species.activeSeasons)));
        this.setCaption(
            DETAIL_WEIGHT,
            this.translate(
                KEY_DETAIL_WEIGHT,
                'minweight', `${species.minWeight}`,
                'maxweight', `${species.maxWeight}`,
                'xp', `${species.xpReward}`,
                'tokens', `${species.currencyReward}`
            )
        );
        this.setCaption(
            DETAIL_RECORD,
            record === null
                ? this.translate(KEY_DETAIL_UNCAUGHT)
                : this.translate(KEY_DETAIL_RECORD, 'best', `${record.bestWeight}`, 'count', `${record.caughtCount}`)
        );
    }

    /**
     * Clears the pane back to its prompt. Called on every rebuild, because the species the pane was
     * showing may not survive a definitions reload.
     */
    // TS-only: Vortex-only view.
    private clearDetail(): void
    {
        this.setCaption(DETAIL_NAME, this.translate(KEY_DETAIL_PROMPT));

        for(const name of [DETAIL_ZONE, DETAIL_LEVEL, DETAIL_HOURS, DETAIL_DAYS, DETAIL_SEASONS,
            DETAIL_WEIGHT, DETAIL_RECORD])
        {
            this.setCaption(name, '');
        }

        this.setDetailStars(0);
        this.setDetailImage(null);
    }

    /**
     * The active-hours mask as a range, or "any time".
     *
     * Reads the mask as a set of contiguous runs so a nocturnal species prints `20:00-05:00` rather
     * than nine separate hours. The runs are joined end-to-start across midnight, which is where a
     * nocturnal window always sits.
     */
    // TS-only: Vortex-only view.
    private describeHours(mask: number): string
    {
        if((mask & ALL_HOURS) === ALL_HOURS) return this.translate(KEY_ANY_TIME);
        if((mask & ALL_HOURS) === 0) return this.translate(KEY_NEVER);

        const active: boolean[] = [];

        for(let hour = 0; hour < HOURS_IN_DAY; hour++)
        {
            active.push((mask & (1 << hour)) !== 0);
        }

        // Start at the first hour whose predecessor is inactive, so a run that wraps past midnight
        // is walked as one rather than reported as two.
        let start = 0;

        while(start < HOURS_IN_DAY && !(active[start] && !active[(start + HOURS_IN_DAY - 1) % HOURS_IN_DAY]))
        {
            start++;
        }

        if(start === HOURS_IN_DAY) return this.translate(KEY_ANY_TIME);

        const runs: string[] = [];
        let cursor = start;

        for(let seen = 0; seen < HOURS_IN_DAY; seen++)
        {
            if(!active[cursor])
            {
                cursor = (cursor + 1) % HOURS_IN_DAY;

                continue;
            }

            const from = cursor;

            while(active[cursor])
            {
                cursor = (cursor + 1) % HOURS_IN_DAY;
                seen++;
            }

            runs.push(`${FishingBookView.pad(from)}:00-${FishingBookView.pad(cursor)}:00`);
        }

        return runs.join(', ');
    }

    // TS-only: Vortex-only view.
    private describeDays(mask: number): string
    {
        if((mask & ALL_DAYS) === ALL_DAYS) return this.translate(KEY_EVERY_DAY);
        if((mask & ALL_DAYS) === 0) return this.translate(KEY_NEVER);

        const names: string[] = [];

        // Bit 0 is Sunday, matching Date.getUTCDay() — the same indexing isActiveAt() tests with.
        for(let day = 0; day < DAYS_IN_WEEK; day++)
        {
            if((mask & (1 << day)) !== 0) names.push(this.translate(`${KEY_DAY_PREFIX}${day}`));
        }

        return names.join(', ');
    }

    // TS-only: Vortex-only view.
    private describeSeasons(mask: number): string
    {
        if((mask & ALL_SEASONS) === ALL_SEASONS) return this.translate(KEY_ALL_YEAR);
        if((mask & ALL_SEASONS) === 0) return this.translate(KEY_NEVER);

        const names: string[] = [];

        for(let season = 0; season < SEASON_COUNT; season++)
        {
            if((mask & (1 << season)) !== 0) names.push(this.translate(`${KEY_SEASON_PREFIX}${season}`));
        }

        return names.join(', ');
    }

    // TS-only: Vortex-only view.
    private static pad(hour: number): string
    {
        return hour < 10 ? `0${hour}` : `${hour}`;
    }

    /**
     * Paints the rod's quality tier with the matching five-slot sprite.
     *
     * One image per tier rather than N copies of a pip: the artwork already composes the filled and
     * empty slots, so there is nothing to lay out here.
     */
    // TS-only: Vortex-only view.
    private setRodQuality(quality: number): void
    {
        const tier = Math.max(0, Math.min(MAX_ROD_QUALITY, quality));

        this.setHeaderIcon(CHILD_ROD_QUALITY, `${ASSET_ROD_QUALITY_PREFIX}${tier}`);
    }

    /**
     * Puts one library image into a header bitmap slot.
     *
     * A missing sprite leaves the slot empty and says so: from the player's side an absent icon is
     * indistinguishable from a feature that is switched off, and this list of names is exactly the
     * kind that drifts — `App.LIBRARY_IMAGE_NAMES` has to carry every one of them.
     */
    // TS-only: Vortex-only view.
    private setHeaderIcon(childName: string, assetName: string): void
    {
        const target = this._window?.findChildByName(childName) as IBitmapWrapperWindow | null;

        if(target === null || target === undefined) return;

        const sprite = (this._assets?.getAssetByName(assetName)?.content ?? null) as ImageBitmap | null;

        if(sprite === null)
        {
            log.warn(`${assetName} is not in the asset library; ${childName} is not drawn.`);

            return;
        }

        target.bitmap = sprite;
        target.invalidate();
    }

    /**
     * Paints the rarity as N gold stars.
     *
     * Only the filled ones are drawn — no empty sockets — which is what the `★` glyphs it replaces
     * did, and what keeps a one-star species from reading as a four-star gap.
     */
    // TS-only: Vortex-only view.
    private setRowStars(row: IWindowContainer, stars: number): void
    {
        this.paintStars(row.findChildByName(ROW_STARS) as IBitmapWrapperWindow | null, stars);
    }

    /**
     * The species' artwork, centred in the slot.
     *
     * Centred rather than stretched: the sprites run from 20x9 to 59x45, and scaling a small one up
     * to the slot would blur it. `null` clears the slot, which is what the prompt state wants.
     */
    // TS-only: Vortex-only view.
    private setDetailImage(nameKey: string | null): void
    {
        const target = this._window?.findChildByName(DETAIL_IMAGE) as IBitmapWrapperWindow | null;

        if(target === null || target === undefined) return;

        const canvas = new OffscreenCanvas(FISH_SLOT_WIDTH, FISH_SLOT_HEIGHT);
        const context = canvas.getContext('2d');

        if(context === null) return;

        if(nameKey !== null)
        {
            const assetName = `${ASSET_FISH_PREFIX}${nameKey.split('.').pop() ?? ''}${ASSET_FISH_SUFFIX}`;
            const sprite = (this._assets?.getAssetByName(assetName)?.content ?? null) as ImageBitmap | null;

            // No warning: a hotel is free to define a species it has no artwork for, and the slot is
            // simply empty. That is unlike the header icons, which are the port's own and always
            // expected to resolve.
            if(sprite !== null)
            {
                context.drawImage(
                    sprite,
                    Math.round((FISH_SLOT_WIDTH - sprite.width) / 2),
                    Math.round((FISH_SLOT_HEIGHT - sprite.height) / 2)
                );
            }
        }

        target.bitmap = canvas.transferToImageBitmap();
        target.invalidate();
    }

    /** The same painter, on the detail pane's own slot. */
    // TS-only: Vortex-only view.
    private setDetailStars(stars: number): void
    {
        const target = this._window?.findChildByName(DETAIL_STARS) as IBitmapWrapperWindow | null;

        this.paintStars(target ?? null, stars);
    }

    // TS-only: Vortex-only view.
    private paintStars(target: IBitmapWrapperWindow | null, stars: number): void
    {
        if(target === null) return;

        const sprite = (this._assets?.getAssetByName(ASSET_STAR)?.content ?? null) as ImageBitmap | null;

        if(sprite === null)
        {
            // A missing sprite leaves the column blank rather than throwing. Worth a line: from the
            // player's side it is indistinguishable from a species with no rarity at all.
            log.warn(`${ASSET_STAR} is not in the asset library; rarity stars are not drawn.`);

            return;
        }

        const count = Math.max(0, Math.min(MAX_STARS, stars));
        const canvas = new OffscreenCanvas(MAX_STARS * STAR_STRIDE + (STAR_WIDTH - STAR_STRIDE), STAR_HEIGHT);
        const context = canvas.getContext('2d');

        if(context === null) return;

        for(let i = 0; i < count; i++)
        {
            context.drawImage(sprite, i * STAR_STRIDE, 0);
        }

        target.bitmap = canvas.transferToImageBitmap();
        target.invalidate();
    }

    // TS-only: Vortex-only view.
    public dispose(): void
    {
        this._window?.dispose();
        this._window = null;
    }
}
