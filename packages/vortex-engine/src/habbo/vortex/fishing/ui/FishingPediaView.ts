import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import {Logger} from '@core/utils/Logger';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ILabelWindow} from '@core/window/components/ILabelWindow';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';

import type {FishSpeciesDefinition} from '../definitions/FishSpeciesDefinition';
import type {HabboFishing} from '../HabboFishing';

const log = Logger.getLogger('habbo.vortex.fishing.ui.FishingPediaView');

const LAYOUT = 'vortex_fishing_pedia_xml';

/** The layer the room widgets sit on; the book belongs with them. */
const LAYER = 1;

/** Two columns by four rows on each of the two pages — see the layout for where that comes from. */
const PER_PAGE = 8;

/**
 * The slot the preview is centred in — `fishpedia_slot` on a grid page, `fishpedia_info_slot` on an
 * entry, both 90x45.
 *
 * `renderFishPreview` centres the fish in the SLOT itself, not in a smaller box laid over it:
 * `tloc = (tImage.width / 2 - preview.width / 2, ...)` where `tImage` is the duplicated slot. Drawing
 * into a 74x34 box pinned to the slot's top-left, which is what this did, put every fish 8 left and
 * 5 high of where Origins puts it.
 */
const FISH_SLOT_WIDTH = 90;
const FISH_SLOT_HEIGHT = 45;

/** `fishpedia_hiliter` is 92x47 against a 90x45 card: two pixels proud on every side. */
const HILITER_OVERHANG = 1;

/** `renderFishRarity`: a 64x9 image with five stars at `i * 13`. */
const STAR_STRIDE = 13;
const MAX_STARS = 5;

/** `drawFishTimelineBar`: `x = 5 + hour * 6` on a 159-wide image, the ruler drawn under it. */
const HOURS_BAR_WIDTH = 159;
const HOURS_BAR_HEIGHT = 12;
const HOURS_IN_DAY = 24;
const HOURS_FILL = '#5AAFC8';

/**
 * Flat grey, the shade Origins draws a species nobody has caught yet.
 *
 * `renderFishPreview` blits `fishpedia_gray` through the preview's own matte, so the silhouette is
 * that member's colour and nothing else — sampled off the shipped PNG: #868686.
 */
const UNCAUGHT_GREY = 0x86;

/**
 * The two closing slices of a stat row, at their shipped widths.
 *
 * `renderInfoField` reads these off the members themselves — `tTitleImg.width + tPieceImg.width + 3`
 * is where the value's box begins — so they are geometry, not padding: `fishpedia_info_field_a_r` is
 * 2x13 and `_b_r` 3x13.
 */
const FIELD_A_R_WIDTH = 2;
const FIELD_B_R_WIDTH = 3;

/** `renderPageBackground`: the title box is `rect(x, 9, x + titleWidth + 9, 22)`. */
const TITLE_BOX_PADDING = 9;

const ASSET_STAR_FILLED = 'fishpedia_star_filled';
const ASSET_STAR_EMPTY = 'fishpedia_star_empty';
const ASSET_FISH_PREFIX = 'fishpedia_';
const ASSET_FISH_SUFFIX = '_preview';

const KEY_OVERVIEW = 'vortex.fishing.book.overview';
const KEY_DETAILS = 'vortex.fishing.book.details';
const KEY_PAGE = 'vortex.fishing.book.page';
const KEY_UNKNOWN = 'vortex.fishing.book.unknown';

/**
 * Habbo Origins' Fish-O-Pedia: a book of two facing pages.
 *
 * NOT ported from AS3 — fishing is an Origins feature, written in Shockwave/Lingo, and no AS3 tree
 * in `sources/` contains a line of it. The reference is `hh_fishing.cct` plus two screenshots of the
 * real screen, and `docs/vortex-original/fishing.md` §19 records what each of them settled.
 *
 * **It is the only Fish-O-Pedia.** An earlier list-and-detail panel in an inventory tab was kept
 * beside it while the two were compared; this one won and the other is gone. Reached from the
 * me-menu entry, the room's wooden sign, and `:fishpedia`.
 *
 * **It computes nothing.** Species, rarity, rewards and the hour and weekday masks all come from
 * `FishingDefinitions`; whether a species is caught is `HabboFishing.getRecord()` answering non-null.
 */
export class FishingPediaView
{
    // TS-only: Vortex-only view — no AS3 counterpart for any member here.
    private readonly _windowManager: IHabboWindowManager;

    // TS-only: see above.
    private readonly _assets: IAssetLibrary | null;

    // TS-only: see above.
    private readonly _localizations: IHabboLocalizationManager | null;

    // TS-only: see above.
    private readonly _fishing: HabboFishing;

    // TS-only: see above.
    private _window: IWindowContainer | null = null;

    /** The page on the LEFT of the open spread, 1-based. A spread starts on an odd page. */
    // TS-only: Vortex-only view.
    private _leftPage: number = 1;

    /** The spread's left page at the moment a card was picked, or 0 when nothing is bookmarked. */
    // TS-only: Vortex-only view.
    private _bookmarkedPage: number = 0;

    /**
     * Re-centres on a desktop resize. Bound once so it can be removed by identity; an anonymous
     * handler would leak one per open.
     */
    // TS-only: Vortex-only view.
    private readonly _onDesktopResized: () => void = () => this._window?.center();

    // TS-only: Vortex-only view.
    constructor(
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null,
        localizations: IHabboLocalizationManager | null,
        fishing: HabboFishing
    )
    {
        this._windowManager = windowManager;
        this._assets = assets;
        this._localizations = localizations;
        this._fishing = fishing;
    }

    /**
     * Builds the book on first use, then shows it.
     *
     * `buildWidgetLayout()` hands back a standalone window — AS3 passes null as the parent and
     * leaves placing it to the caller — so a bare container is built, holds its children, and is
     * never drawn unless something attaches it. That is the failure this port keeps re-learning.
     */
    // TS-only: Vortex-only view.
    public open(): void
    {
        if(this._window === null)
        {
            this._window = this._windowManager.buildWidgetLayout(LAYOUT, LAYER) as IWindowContainer | null;

            if(this._window === null)
            {
                log.warn(`${LAYOUT} is not registered; the Fish-O-Pedia cannot open.`);

                return;
            }

            const desktop = this._windowManager.getDesktop(LAYER) as unknown as IWindowContainer | null;

            if(desktop === null || typeof desktop.addChild !== 'function')
            {
                log.warn(`No desktop on layer ${LAYER}; the Fish-O-Pedia cannot be shown.`);

                return;
            }

            desktop.addChild(this._window);

            this._window.addEventListener(WindowEvent.WE_PARENT_RESIZED, this._onDesktopResized);

            this.bind();
        }

        this._leftPage = 1;
        this._bookmarkedPage = 0;

        this._window.center();
        this._window.visible = true;

        this.draw();
    }

    // TS-only: Vortex-only view.
    public close(): void
    {
        if(this._window !== null) this._window.visible = false;
    }

    /** Cards, arrows and the close button. Bound once, on the build. */
    // TS-only: Vortex-only view.
    private bind(): void
    {
        for(const side of ['l', 'r'])
        {
            for(let slot = 0; slot < PER_PAGE; slot++)
            {
                const card = this.child(`pedia_${side}_card_${slot}`);

                card?.addEventListener(WindowMouseEvent.CLICK, () => this.select(slot, side));
            }
        }

        this.child('pedia_prev')?.addEventListener(WindowMouseEvent.CLICK, () => this.turn(-1));
        this.child('pedia_next')?.addEventListener(WindowMouseEvent.CLICK, () => this.turn(1));
        this.child('pedia_bookmark')?.addEventListener(WindowMouseEvent.CLICK, () => this.returnToBookmark());
        this.child('pedia_close')?.addEventListener(WindowMouseEvent.CLICK, () => this.close());

        // `drawPageCorner` is a hover state on the arrow, not an ornament: the page corner folds up
        // while the pointer is over the arrow that would turn it. Bound here rather than drawn
        // permanently, which is what put a white square over the day grid the first time.
        this.bindCorner('pedia_prev', 'pedia_corner_l');
        this.bindCorner('pedia_next', 'pedia_corner_r');
    }

    /** Folds one page's corner while the pointer is over the arrow that turns it. */
    // TS-only: Vortex-only view.
    private bindCorner(arrow: string, corner: string): void
    {
        const target = this.child(arrow);

        if(target === null) return;

        target.addEventListener(WindowMouseEvent.ROLL_OVER, () => this.setVisible(corner, true));
        target.addEventListener(WindowMouseEvent.ROLL_OUT, () => this.setVisible(corner, false));
    }

    /**
     * Picks a card, which TURNS to that species' own page and bookmarks the spread being left.
     *
     * Not "the page beside it becomes an entry": every species has a page of its own further along
     * the book, which is why the real one runs to 115 pages. `drawBookmark` /
     * `pBookmarkSpreadIndex` is how a reader gets back.
     */
    // TS-only: Vortex-only view.
    private select(slotIndex: number, side: string): void
    {
        const page = side === 'l' ? this._leftPage : this._leftPage + 1;
        const overview = this.overviewPageCount();

        // A card is only ever on an overview page.
        if(page > overview) return;

        const index = (page - 1) * PER_PAGE + slotIndex;
        const species = this.species();

        if(index >= species.length) return;

        this._bookmarkedPage = this._leftPage;
        this._leftPage = this.spreadStart(overview + index + 1);

        this.draw();
    }

    /** Back to the spread the bookmark was dropped on. */
    // TS-only: Vortex-only view.
    private returnToBookmark(): void
    {
        if(this._bookmarkedPage === 0) return;

        this._leftPage = this._bookmarkedPage;
        this._bookmarkedPage = 0;

        this.draw();
    }

    /** One arrow press moves a whole spread, which is what all three screenshots show. */
    // TS-only: Vortex-only view.
    private turn(direction: number): void
    {
        const next = this._leftPage + direction * 2;

        if(next < 1 || next > this.pageCount()) return;

        this._leftPage = next;

        this.draw();
    }

    /** Every species the tables hold, in id order so a page number means the same thing twice. */
    // TS-only: Vortex-only view.
    private species(): FishSpeciesDefinition[]
    {
        return [...this._fishing.definitions.allSpecies].sort((a, b) => a.id - b.id);
    }

    /** `getOverviewPageCount`: the grids come first, eight species to a page. */
    // TS-only: Vortex-only view.
    private overviewPageCount(): number
    {
        return Math.max(1, Math.ceil(this.species().length / PER_PAGE));
    }

    /** The grids, then one page per species. 115 in Origins, 21 on this hotel's eighteen fish. */
    // TS-only: Vortex-only view.
    private pageCount(): number
    {
        return this.overviewPageCount() + this.species().length;
    }

    /** `getLeftPageIndex`: a spread starts on an odd page, so 1|2, 3|4, and so on. */
    // TS-only: Vortex-only view.
    private spreadStart(page: number): number
    {
        return page % 2 === 0 ? page - 1 : page;
    }

    // TS-only: Vortex-only view.
    private draw(): void
    {
        if(this._window === null) return;

        const total = this.pageCount();

        this.drawPage('l', this._leftPage);
        this.drawPage('r', this._leftPage + 1);

        this.setCaption(
            'pedia_l_page',
            this.translate(KEY_PAGE, 'page', `${this._leftPage}`, 'total', `${total}`)
        );
        this.setCaption(
            'pedia_r_page',
            this._leftPage + 1 > total
                ? ''
                : this.translate(KEY_PAGE, 'page', `${this._leftPage + 1}`, 'total', `${total}`)
        );

        this.setVisible('pedia_prev', this._leftPage > 1);
        this.setVisible('pedia_next', this._leftPage + 2 <= total);

        this.drawHiliter();
        this.drawBookmark();
    }

    /**
     * One page, in whichever of its two states this page number falls in.
     *
     * `renderFishesOverviewPage` for the grids at the front, `renderFishInfoPage` for the entry
     * pages behind them. A page past the end shows neither.
     */
    // TS-only: Vortex-only view.
    private drawPage(side: string, page: number): void
    {
        const species = this.species();
        const overview = this.overviewPageCount();
        const isGrid = page >= 1 && page <= overview;
        const entry = page > overview ? species[page - overview - 1] ?? null : null;

        this.setPageState(side, isGrid);
        this.setEntryState(side, entry !== null);

        if(isGrid)
        {
            this.setCaption(`pedia_${side}_header`, this.translate(KEY_OVERVIEW));
            this.drawGrid(side, species, (page - 1) * PER_PAGE);
        }
        else if(entry !== null)
        {
            this.drawEntry(side, entry);
        }

        this.sizeTitleBox(side, isGrid ? `pedia_${side}_header` : `pedia_${side}d_header`);
        this.setVisible(`pedia_${side}_titlebox`, isGrid || entry !== null);
    }

    /**
     * Fits the page's title box to its title.
     *
     * The box is one window and the title another, so neither state's header can carry its own
     * background: `renderPageBackground` ends the box at `titleWidth + 9`, which is a different
     * width on every entry page — "Frog Details" against "Spotted Eagle Ray Details".
     */
    // TS-only: Vortex-only view.
    private sizeTitleBox(side: string, header: string): void
    {
        const box = this.child(`pedia_${side}_titlebox`);

        if(box === null) return;

        box.width = this.textWidth(header) + TITLE_BOX_PADDING;
    }

    /**
     * Origins' `drawPageHiliter`: the plate that marks the selected card.
     *
     * One window moved onto the card, not one per slot — which is what its 92x47 size says against a
     * 90x45 card. It is **opaque**, so the layout declares it before the cards and it sits under the
     * one it marks: only its border and its shadow show. Declared after them it painted its white
     * fill straight over the selection, which read as a blank card.
     */
    // TS-only: Vortex-only view.
    private drawHiliter(): void
    {
        // Nothing hovers yet: picking a card turns the page rather than selecting it, so there is no
        // lasting selection to mark. The plate and its handler both exist, so it is kept and hidden
        // rather than dropped — `moveHiliter()` is one call away when hover lands.
        this.setVisible('pedia_hiliter', false);
    }

    /** Puts the mark on one card of a page. Unused until the view tracks a pointer. */
    // TS-only: Vortex-only view.
    private moveHiliter(side: string, slot: number): void
    {
        const card = this.child(`pedia_${side}_card_${slot}`);
        const hiliter = this.child('pedia_hiliter');

        if(card === null || hiliter === null) return;

        hiliter.x = card.x - HILITER_OVERHANG;
        hiliter.y = card.y - HILITER_OVERHANG;
        hiliter.visible = true;
    }

    /**
     * Origins' `drawBookmark`, keyed by `pBookmarkSpreadIndex`: dropped on the spread a reader
     * jumps FROM when they pick a card, and clicking it returns there. Hidden while there is nowhere
     * to go back to, which is why the first two reference screenshots have none.
     */
    // TS-only: Vortex-only view.
    private drawBookmark(): void
    {
        const marked = this._bookmarkedPage !== 0;

        this.setVisible('pedia_bookmark', marked);
        this.setVisible('pedia_bookmark_shadow', marked);
    }

    /** One page of up to eight cards. A page may hold fewer; the spare slots go away entirely. */
    // TS-only: Vortex-only view.
    private drawGrid(side: string, species: FishSpeciesDefinition[], from: number): void
    {
        for(let slot = 0; slot < PER_PAGE; slot++)
        {
            const entry = species[from + slot] ?? null;
            const present = entry !== null;

            this.setVisible(`pedia_${side}_card_${slot}`, present);
            this.setVisible(`pedia_${side}_fish_${slot}`, present);
            this.setVisible(`pedia_${side}_name_${slot}`, present);

            if(!present) continue;

            this.setCaption(`pedia_${side}_name_${slot}`, this.translate(entry.nameKey));
            this.drawFish(`pedia_${side}_fish_${slot}`, entry);
        }
    }

    // TS-only: Vortex-only view.
    private drawEntry(side: string, entry: FishSpeciesDefinition): void
    {
        const zone = this._fishing.definitions.getZone(entry.zoneId);
        const p = `pedia_${side}d`;

        this.setCaption(`${p}_header`, this.translate(KEY_DETAILS, 'species', this.translate(entry.nameKey)));
        this.setCaption(`${p}_name`, this.translate(entry.nameKey));
        this.drawFish(`${p}_fish`, entry);
        this.drawStars(`${p}_stars`, entry.rarityStars);

        // Rewards are known for every species; the catch rate is a per-mille on the wire.
        // Origins withholds the numbers until a species has been caught — its own screenshots show
        // "XP: ???", "Tokens: ???", "Catch Rate: ???" and "???" for the location on an entry the
        // player has never landed. Which is the entry page's whole point: the book fills in as you
        // fish. The labels live in the layout; only the values are set here.
        const known = this._fishing.getRecord(entry.id) !== null;
        const unknown = this.translate(KEY_UNKNOWN);

        this.layoutInfoField(side, 'xp', known ? `${entry.xpReward}` : unknown);
        this.layoutInfoField(side, 'tokens', known ? `${entry.currencyReward}` : unknown);
        // One decimal, as Origins prints it: the wire carries a per-mille, so dropping the fraction
        // would round two adjacent rates to the same number.
        this.layoutInfoField(side, 'rate', known ? `${(entry.catchRate / 10).toFixed(1)}%` : unknown);

        this.setCaption(`${p}_zone`, known && zone !== null ? this.translate(zone.nameKey) : unknown);

        // The ruler and the grid stay bare too until the species is caught — Origins' own entry for
        // an undiscovered fish shows an empty timeline and an empty week beside its four `???`.
        this.drawHours(side, known ? entry.activeHours : 0);

        for(let day = 0; day < 7; day++)
        {
            this.setVisible(`${p}_day_${day}`, known && (entry.activeWeekdays & (1 << day)) !== 0);
        }
    }

    /**
     * The species' own sprite, centred in its slot and flattened to grey when never caught.
     *
     * Origins greys the FISH, not the card — a silhouette of the real drawing, which is how the page
     * still tells you the shape of what you are missing.
     */
    // TS-only: Vortex-only view.
    private drawFish(name: string, entry: FishSpeciesDefinition): void
    {
        const width = FISH_SLOT_WIDTH;
        const height = FISH_SLOT_HEIGHT;

        const target = this.child(name) as IBitmapWrapperWindow | null;

        if(target === null) return;

        // The sprite is named after the last segment of the localisation key, which is how the
        // Fishopedia artwork is keyed — see fishpedia_icon_map.txt.
        const slug = entry.nameKey.split('.').pop() ?? '';
        const sprite = this.sprite(`${ASSET_FISH_PREFIX}${slug}${ASSET_FISH_SUFFIX}`);

        if(sprite === null)
        {
            target.bitmap = null;

            return;
        }

        const canvas = new OffscreenCanvas(width, height);
        const context = canvas.getContext('2d');

        if(context === null) return;

        const x = Math.floor((width - sprite.width) / 2);
        const y = Math.floor((height - sprite.height) / 2);

        context.drawImage(sprite, x, y);

        if(this._fishing.getRecord(entry.id) === null)
        {
            const pixels = context.getImageData(0, 0, width, height);

            for(let i = 0; i < pixels.data.length; i += 4)
            {
                if(pixels.data[i + 3] === 0) continue;

                pixels.data[i] = UNCAUGHT_GREY;
                pixels.data[i + 1] = UNCAUGHT_GREY;
                pixels.data[i + 2] = UNCAUGHT_GREY;
            }

            context.putImageData(pixels, 0, 0);
        }

        target.bitmap = canvas.transferToImageBitmap();
        target.invalidate();
    }

    /**
     * Lays out one stat row the way `renderInfoField` builds its image.
     *
     * Two boxes side by side, not one nested in the other: the grey `a_*` three-slice wraps the
     * LABEL and the lighter `b_*` pair wraps the VALUE, the whole sized to the rendered text —
     * `tWidth = titleWidth + valueWidth + 8`. The label box has to be measured rather than fixed,
     * which is why a row is seven windows and not one picture.
     */
    // TS-only: Vortex-only view.
    private layoutInfoField(side: string, row: string, value: string): void
    {
        const p = `pedia_${side}d_${row}`;
        const anchor = this.child(`${p}_a_l`);

        if(anchor === null) return;

        this.setCaption(p, value);

        const labelWidth = this.textWidth(`${p}_label`);
        const valueWidth = this.textWidth(p);
        const x = anchor.x;

        // The three constants are the slices' own widths, which is what Lingo reads back off each
        // member: a_l 3, a_r 2, b_r 3, all 13 tall. `tLocH`, where the value's box starts, is
        // `titleWidth + a_r.width + 3`, and the field ends at `tWidth - 3` = titleWidth +
        // valueWidth + 5 — so b_m runs exactly valueWidth wide and b_r closes it.
        this.place(`${p}_a_m`, x + 3, labelWidth);
        this.place(`${p}_a_r`, x + 3 + labelWidth, FIELD_A_R_WIDTH);
        this.place(`${p}_label`, x + 5, labelWidth);
        this.place(`${p}_b_m`, x + 5 + labelWidth, valueWidth);
        this.place(`${p}_b_r`, x + 5 + labelWidth + valueWidth, FIELD_B_R_WIDTH);
        this.place(p, x + 7 + labelWidth, valueWidth);
    }

    /** Moves one of a row's windows and sets its width. */
    // TS-only: Vortex-only view.
    private place(name: string, x: number, width: number): void
    {
        const child = this.child(name);

        if(child === null) return;

        child.x = x;
        child.width = Math.max(1, width);
    }

    /**
     * The rendered width of a text window's caption — Lingo's `pWriter.render(...).width`.
     *
     * Read off the window rather than measured here for two reasons. A `${key}` caption keeps its
     * key: `TextLabelController` hands the key to the localization listener and only ever stores the
     * resolved string in `_text`, so measuring `caption` measures
     * "${vortex.fishing.book.rate_label}" — 180-odd pixels, which is exactly how wide the grey label
     * bar came out. And `_textWidth` is measured through the glyph atlas the renderer will actually
     * draw with, which rounds advances under `gridFitType="pixel"`; a bare `measureText()` here
     * would size every row to a width nothing uses.
     */
    // TS-only: Vortex-only view.
    private textWidth(name: string): number
    {
        return (this.child(name) as ILabelWindow | null)?.textWidth ?? 0;
    }

    /** Five stars, filled up to the rarity. Composited because the window system has one slot. */
    // TS-only: Vortex-only view.
    private drawStars(name: string, filled: number): void
    {
        const target = this.child(name) as IBitmapWrapperWindow | null;
        const full = this.sprite(ASSET_STAR_FILLED);
        const empty = this.sprite(ASSET_STAR_EMPTY);

        if(target === null || full === null || empty === null) return;

        const canvas = new OffscreenCanvas(STAR_STRIDE * MAX_STARS, full.height);
        const context = canvas.getContext('2d');

        if(context === null) return;

        for(let i = 0; i < MAX_STARS; i++)
        {
            context.drawImage(i < filled ? full : empty, i * STAR_STRIDE, 0);
        }

        target.bitmap = canvas.transferToImageBitmap();
        target.invalidate();
    }

    /**
     * The biting hours, painted over the ruler.
     *
     * `activeHours` is a 24-bit mask, one bit per hour, and it wraps past midnight — a nocturnal
     * species sets the high bits and the low ones, which is why each hour is drawn on its own rather
     * than as a single span.
     */
    // TS-only: Vortex-only view.
    private drawHours(side: string, mask: number): void
    {
        const target = this.child(`pedia_${side}d_hours`) as IBitmapWrapperWindow | null;

        if(target === null) return;

        const canvas = new OffscreenCanvas(HOURS_BAR_WIDTH, HOURS_BAR_HEIGHT);
        const context = canvas.getContext('2d');

        if(context === null) return;

        context.fillStyle = HOURS_FILL;

        // `drawFishTimelineBar`: `tStartH = 5 + start * 6`, `tFinalH = 5 + end * 6 + (end > 0)`, and
        // the fill is `rect(startH, 0, finalH, 12)`. Origins passes hour RANGES; this port has a
        // 24-bit mask, so each set hour is its own one-hour range and they abut into the same bar.
        for(let hour = 0; hour < HOURS_IN_DAY; hour++)
        {
            if((mask & (1 << hour)) === 0) continue;

            const from = 5 + hour * 6;
            const to = 5 + (hour + 1) * 6 + 1;

            context.fillRect(from, 0, to - from, HOURS_BAR_HEIGHT);
        }

        target.bitmap = canvas.transferToImageBitmap();
        target.invalidate();
    }

    /** Shows or hides a whole page's grid. */
    // TS-only: Vortex-only view.
    private setPageState(side: string, visible: boolean): void
    {
        this.setVisible(`pedia_${side}_header`, visible);

        for(let slot = 0; slot < PER_PAGE; slot++)
        {
            this.setVisible(`pedia_${side}_card_${slot}`, visible);
            this.setVisible(`pedia_${side}_fish_${slot}`, visible);
            this.setVisible(`pedia_${side}_name_${slot}`, visible);
        }
    }

    /**
     * Shows or hides one page's entry, which stands in the grid's place.
     *
     * Every child whose name carries the page's entry prefix, found by walking the tree rather than
     * listed here. A hand-written list drifts from the layout the moment either changes and says
     * nothing when it does: this one named `_info_slot` after the layout had renamed it `_slot`, and
     * omitted the six label and field windows outright, so the entry page rendered three bare `???`
     * with no "XP:", no "Tokens:", no "Catch Rate:" and no rounded field behind them.
     */
    // TS-only: Vortex-only view.
    private setEntryState(side: string, visible: boolean): void
    {
        const prefix = `pedia_${side}d_`;

        for(const child of this.childrenOf(this._window))
        {
            if(child.name.startsWith(prefix)) child.visible = visible;
        }
    }

    /** Every descendant of a container, depth-first. */
    // TS-only: Vortex-only view.
    private childrenOf(container: IWindowContainer | null): IWindow[]
    {
        if(container === null) return [];

        const out: IWindow[] = [];

        for(let i = 0; i < container.numChildren; i++)
        {
            const child = container.getChildAt(i);

            if(child === null) continue;

            out.push(child);

            const asContainer = child as unknown as IWindowContainer;

            if(typeof asContainer.numChildren === 'number') out.push(...this.childrenOf(asContainer));
        }

        return out;
    }

    // TS-only: Vortex-only view.
    private sprite(assetName: string): ImageBitmap | null
    {
        const bitmap = (this._assets?.getAssetByName(assetName)?.content ?? null) as ImageBitmap | null;

        if(bitmap === null) log.warn(`${assetName} is not in the asset library.`);

        return bitmap;
    }

    // TS-only: Vortex-only view.
    private child(name: string): IWindow | null
    {
        return this._window?.findChildByName(name) ?? null;
    }

    // TS-only: Vortex-only view.
    private setCaption(name: string, caption: string): void
    {
        const child = this.child(name);

        if(child !== null) child.caption = caption;
    }

    // TS-only: Vortex-only view.
    private setVisible(name: string, visible: boolean): void
    {
        const child = this.child(name);

        if(child !== null) child.visible = visible;
    }

    /** Name/value pairs, not positional values — see `FishingSpotWidget.translate()`. */
    // TS-only: Vortex-only view.
    private translate(key: string, ...params: string[]): string
    {
        return this._localizations?.getLocalizationWithParams(key, key, ...params) ?? key;
    }

    // TS-only: Vortex-only view.
    public dispose(): void
    {
        this._window?.removeEventListener(WindowEvent.WE_PARENT_RESIZED, this._onDesktopResized);
        this._window?.dispose();
        this._window = null;
        this._leftPage = 1;
        this._bookmarkedPage = 0;
    }
}
