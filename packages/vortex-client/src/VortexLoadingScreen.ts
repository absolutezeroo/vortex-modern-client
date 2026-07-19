/**
 * Habbo-style loading screen overlay.
 *
 * Pure DOM implementation that displays immediately before the canvas exists.
 * Reproduces the AS3 HabboLoadingScreen: dark background, random splash photo,
 * animated progress bar with two-tone gradient fill, rotating loading texts.
 *
 * Implements IVortexLoadingScreen (engine interface) so the engine can
 * call updateLoadingBar() without knowing about the DOM implementation.
 *
 * @see sources/win63_2021_version/HabboLoadingScreen.as
 * @see sources/win63_2021_version/IHabboLoadingScreen.as
 * @see sources/win63_2021_version/splash/PhotoSplashScreen.as
 */

import type {IVortexLoadingScreen} from 'vortex-engine';
import splashBgUrl from './assets/images/splash_bg.png';
import splashTopUrl from './assets/images/splash_top.png';

// Lazy glob — only the selected splash image is fetched at runtime
const splashModules = import.meta.glob('./assets/images/splash_img*.png') as Record<string, () => Promise<{
    default: string
}>>;

/**
 * AS3 constants from HabboLoadingScreen.
 *
 * @see sources/win63_2021_version/HabboLoadingScreen.as lines 27-30
 */
const LOADING_BAR_WIDTH = 400;
const LOADING_BAR_HEIGHT = 25;
const LOADING_BAR_BORDER_WIDTH = 2;
const LOADING_BAR_BORDER_SPACING = 2;

/**
 * AS3 color constants — properly converted from decimal.
 *
 * 922908  → 0x0E151C (background)
 * 12241619 → 0xBACAD3 (bar fill top half)
 * 9216429  → 0x8CA1AD (bar fill bottom half)
 * 2500143  → 0x26262F (bar background)
 */
const COLOR_BACKGROUND = '#0E151C';
const COLOR_BAR_FILL_TOP = '#BACAD3';
const COLOR_BAR_FILL_BOTTOM = '#8CA1AD';
const COLOR_BAR_BG = '#000000';
const COLOR_TEXT_WHITE = '#FFFFFF';
const COLOR_TEXT_GREY = '#999999';

/** Spacing between elements (AS3 _local_3 = 10). */
const ELEMENT_SPACING = 10;

/** Gap between splash and text (AS3 line 345: _local_1 + 50). */
const SPLASH_TEXT_GAP = 50;

/** Inner fill dimensions derived from AS3 constants. */
const BAR_INSET = LOADING_BAR_BORDER_WIDTH + LOADING_BAR_BORDER_SPACING; // 4
const BAR_INNER_HEIGHT = LOADING_BAR_HEIGHT - (BAR_INSET * 2);           // 17
const BAR_INNER_WIDTH = LOADING_BAR_WIDTH - (BAR_INSET * 2);             // 392
const BAR_TOP_HALF = Math.floor(BAR_INNER_HEIGHT / 2);                   // 8
const BAR_BOTTOM_HALF = BAR_TOP_HALF + 1;                                // 9

/** Revolving loading texts (replaces AS3 "client.starting.revolving" localization). */
const LOADING_TEXTS: string[] = [
    'Reticulating splines...',
    'Adjusting bellhops...',
    'Herding cats...',
    'Warming up pixels...',
    'Sewing plushies...',
    'Polishing dance floors...',
    'Inflating pool toys...',
    'Tuning boomboxes...',
    'Feeding Franks...',
    'Stacking furniture...',
];

/**
 * DOM-based Habbo loading screen.
 *
 * Port of AS3 HabboLoadingScreen → VortexLoadingScreen.
 * Implements IVortexLoadingScreen so the engine (VortexMain) can
 * call updateLoadingBar(progress) during initialization.
 *
 * @see sources/win63_2021_version/HabboLoadingScreen.as
 * @see sources/win63_2021_version/IHabboLoadingScreen.as
 */
export class VortexLoadingScreen implements IVortexLoadingScreen 
{
    private _root: HTMLDivElement;
    private _splashContainer: HTMLDivElement;
    private _textLabel: HTMLDivElement;
    private _barOuter: HTMLDivElement;
    private _barTrack: HTMLDivElement;
    private _barFillTop: HTMLDivElement;
    private _barFillBottom: HTMLDivElement;
    private _percentLabel: HTMLDivElement;
    private _versionLabel: HTMLDivElement;

    /** AS3 _barProgression — fake bar progress 0..100. */
    private _barProgression: number = 0;

    /** AS3 _SafeStr_4591 — current text index. */
    private _textIndex: number = 0;

    /** AS3 _SafeStr_4597 — flag to change text on next 100 reset. */
    private _shouldChangeText: boolean = false;

    private _timerId: number = 0;

    constructor() 
    {
        this._textIndex = this.randomNumber(0, LOADING_TEXTS.length - 1);

        // Root overlay — fullscreen, absolute, on top of everything
        this._root = document.createElement('div');
        this._root.id = 'loading-screen';
        Object.assign(this._root.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: COLOR_BACKGROUND,
            zIndex: '9999',
            overflow: 'hidden',
            userSelect: 'none',
        } as Partial<CSSStyleDeclaration>);

        // Build child elements
        this._splashContainer = this.createSplashScreen();
        this._textLabel = this.createTextLabel();

        const bar = this.createLoadingBar();

        this._barOuter = bar.outer;
        this._barTrack = bar.track;
        this._barFillTop = bar.fillTop;
        this._barFillBottom = bar.fillBottom;
        this._percentLabel = this.createPercentLabel();
        this._versionLabel = this.createVersionLabel();

        this._root.appendChild(this._splashContainer);
        this._root.appendChild(this._textLabel);
        this._root.appendChild(this._barOuter);
        this._root.appendChild(this._percentLabel);
        this._root.appendChild(this._versionLabel);

        // Insert into DOM immediately
        const container = document.getElementById('vortex-ui');

        if(container) 
        {
            container.appendChild(this._root);
        }

        // Position all elements (AS3 positionLoadingScreenDisplayElements)
        this.positionElements();

        // Listen for window resize
        window.addEventListener('resize', this._onResize);

        // Start fake-progress timer (AS3: Timer(750))
        this._timerId = window.setInterval(() => this.onBarProgressEvent(), 750);
    }

    private _disposed: boolean = false;

    /**
     * Whether this loading screen has been disposed.
     *
     * @see sources/win63_2021_version/HabboLoadingScreen.as disposed getter
     */
    get disposed(): boolean 
    {
        return this._disposed;
    }

    /**
     * Update the loading bar progress percentage text.
     *
     * AS3: updateLoadingBar(progress) sets the percentage label text.
     *
     * @param ratio - Progress ratio from 0.0 to 1.0
     *
     * @see sources/win63_2021_version/HabboLoadingScreen.as updateLoadingBar() line 391
     * @see sources/win63_2021_version/IHabboLoadingScreen.as updateLoadingBar()
     */
    public updateLoadingBar(ratio: number): void 
    {
        if(this._disposed) return;

        this._percentLabel.textContent = Math.round(ratio * 100) + '%';
    }

    /**
     * Removes the loading screen overlay from the DOM.
     *
     * @see sources/win63_2021_version/HabboLoadingScreen.as line 219
     */
    public dispose(): void 
    {
        if(this._disposed) return;

        this._disposed = true;

        window.removeEventListener('resize', this._onResize);

        if(this._timerId) 
        {
            clearInterval(this._timerId);
            this._timerId = 0;
        }

        this._root.remove();
    }

    /**
     * Creates the PhotoSplashScreen container with bg, random image, and top overlay.
     *
     * AS3 structure (PhotoSplashScreen.as):
     * - splashBgClass bitmap (background)
     * - splashImg[random 1-30] bitmap at (96, 51)
     * - splashTopClass bitmap (overlay)
     *
     * @see sources/win63_2021_version/splash/PhotoSplashScreen.as
     */
    private createSplashScreen(): HTMLDivElement 
    {
        const container = document.createElement('div');

        Object.assign(container.style, {
            position: 'absolute',
            display: 'inline-block',
        } as Partial<CSSStyleDeclaration>);

        // Background image (always displayed)
        const bg = document.createElement('img');

        bg.src = splashBgUrl;
        bg.draggable = false;
        Object.assign(bg.style, {
            display: 'block',
        } as Partial<CSSStyleDeclaration>);

        // Re-position after bg image loads (needed for accurate splash dimensions)
        bg.onload = (): void => 
        {
            this.positionElements();
        };

        container.appendChild(bg);

        // Random splash image (1-30), positioned at (96, 51) — AS3 line 55-56
        const splashIndex = 1 + Math.floor(Math.random() * 30);
        const splashKey = Object.keys(splashModules).find(k => k.includes(`splash_img${splashIndex}.png`));

        if(splashKey) 
        {
            const img = document.createElement('img');

            img.draggable = false;
            Object.assign(img.style, {
                position: 'absolute',
                left: '96px',
                top: '51px',
            } as Partial<CSSStyleDeclaration>);

            // Lazy load — only fetches this one image
            splashModules[splashKey]().then(mod => 
            {
                img.src = mod.default;
            });

            container.appendChild(img);
        }

        // Top overlay image (always displayed)
        const top = document.createElement('img');

        top.src = splashTopUrl;
        top.draggable = false;
        Object.assign(top.style, {
            position: 'absolute',
            left: '0',
            top: '0',
        } as Partial<CSSStyleDeclaration>);
        container.appendChild(top);

        return container;
    }

    /**
     * Creates the loading text label.
     * AS3: LoaderUI.createTextField(_local_11, 28, 0xFFFFFF, true, false, false, false, "center")
     */
    private createTextLabel(): HTMLDivElement 
    {
        const el = document.createElement('div');

        el.textContent = LOADING_TEXTS[this._textIndex];
        Object.assign(el.style, {
            position: 'absolute',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: '28px',
            color: COLOR_TEXT_WHITE,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            fontWeight: 'bold',
        } as Partial<CSSStyleDeclaration>);

        return el;
    }

    /**
     * Creates the loading bar matching AS3's exact structure.
     *
     * AS3 drawing (updateLoadingBarProgression):
     * - fileLoadingBar: white 1px outline, 400x25px
     * - fileBarSprite child at (4,4):
     *   - Black rect at (-1,-1), size (396, 21) — inner background
     *   - Top fill at (0,0), size (fillW, 8), color 0xBACAD3
     *   - Bottom fill at (0,8), size (fillW, 9), color 0x8CA1AD
     *
     * @see sources/win63_2021_version/HabboLoadingScreen.as lines 68-76, 359-388
     */
    private createLoadingBar(): {
        outer: HTMLDivElement;
        track: HTMLDivElement;
        fillTop: HTMLDivElement;
        fillBottom: HTMLDivElement
    } 
    {
        // Outer bar — white 1px border outline, 400x25
        const outer = document.createElement('div');

        Object.assign(outer.style, {
            position: 'absolute',
            width: LOADING_BAR_WIDTH + 'px',
            height: LOADING_BAR_HEIGHT + 'px',
            boxSizing: 'border-box',
            border: '1px solid ' + COLOR_TEXT_WHITE,
        } as Partial<CSSStyleDeclaration>);

        // Black inner track — AS3: drawRect(-1, -1, 396, 21) at sprite (4,4)
        // In border-box coords: (4-1-1, 4-1-1) = (2, 2), size 396x21
        const track = document.createElement('div');

        Object.assign(track.style, {
            position: 'absolute',
            left: '2px',
            top: '2px',
            width: (LOADING_BAR_WIDTH - (LOADING_BAR_BORDER_WIDTH * 2)) + 'px',   // 396
            height: (LOADING_BAR_HEIGHT - (LOADING_BAR_BORDER_SPACING * 2)) + 'px', // 21
            background: COLOR_BAR_BG,
        } as Partial<CSSStyleDeclaration>);

        outer.appendChild(track);

        // Top fill half — AS3: beginFill(0xBACAD3), drawRect(0, 0, fillW, 8)
        // In border-box coords: (4-1, 4-1) = (3, 3)
        const fillTop = document.createElement('div');

        Object.assign(fillTop.style, {
            position: 'absolute',
            left: '3px',
            top: '3px',
            width: '0px',
            height: BAR_TOP_HALF + 'px',  // 8
            background: COLOR_BAR_FILL_TOP,
        } as Partial<CSSStyleDeclaration>);

        outer.appendChild(fillTop);

        // Bottom fill half — AS3: beginFill(0x8CA1AD), drawRect(0, 8, fillW, 9)
        const fillBottom = document.createElement('div');

        Object.assign(fillBottom.style, {
            position: 'absolute',
            left: '3px',
            top: (3 + BAR_TOP_HALF) + 'px',  // 11
            width: '0px',
            height: BAR_BOTTOM_HALF + 'px',   // 9
            background: COLOR_BAR_FILL_BOTTOM,
        } as Partial<CSSStyleDeclaration>);

        outer.appendChild(fillBottom);

        return {outer, track, fillTop, fillBottom};
    }

    /**
     * Creates the percentage label.
     * AS3: LoaderUI.createTextField("0%", 14, 0x999999, ...)
     */
    private createPercentLabel(): HTMLDivElement 
    {
        const el = document.createElement('div');

        el.textContent = '0%';
        Object.assign(el.style, {
            position: 'absolute',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: '14px',
            color: COLOR_TEXT_GREY,
            textAlign: 'center',
            whiteSpace: 'nowrap',
        } as Partial<CSSStyleDeclaration>);

        return el;
    }

    /**
     * Creates the version label (top-right).
     * AS3: LoaderUI.createTextField("Habbo Air for Flash", 12, 0x999999, ..., "right")
     */
    private createVersionLabel(): HTMLDivElement 
    {
        const el = document.createElement('div');

        el.textContent = 'Vortex Client';
        Object.assign(el.style, {
            position: 'absolute',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: '12px',
            color: COLOR_TEXT_GREY,
            textAlign: 'right',
            whiteSpace: 'nowrap',
        } as Partial<CSSStyleDeclaration>);

        return el;
    }

    /**
     * Positions all loading screen elements, centered on screen.
     *
     * Faithful reproduction of AS3 positionLoadingScreenDisplayElements().
     *
     * AS3 vertical centering logic (lines 286-356):
     * 1. First pass: _local_1 = splash.height + bar.height (only these two for centering)
     * 2. Center: startY = int((stageH - _local_1) / 2) - spacing*2
     * 3. Position sequentially: splash → text(+50) → bar(+spacing) → percent(+spacing/2)
     *
     * @see sources/win63_2021_version/HabboLoadingScreen.as line 262
     */
    private positionElements(): void 
    {
        const stageW = window.innerWidth;
        const stageH = window.innerHeight;

        const splashW = this._splashContainer.offsetWidth || 725;
        const splashH = this._splashContainer.offsetHeight || 404;
        const textW = this._textLabel.offsetWidth || 200;
        const textH = this._textLabel.offsetHeight || 34;
        const percentW = this._percentLabel.offsetWidth || 30;
        const versionW = this._versionLabel.offsetWidth || 100;

        // --- First pass: compute total for centering (AS3 lines 292-325) ---
        // AS3 only uses splash.height + bar.height for the centering calculation
        let local1 = splashH + LOADING_BAR_HEIGHT;

        // --- Vertical centering (AS3 lines 336-337) ---
        // startY = int((stageH - (splashH + barH)) / 2) - spacing*2
        local1 = Math.floor((stageH - local1) / 2);
        local1 = local1 - (ELEMENT_SPACING * 2);

        // --- Second pass: position sequentially (AS3 lines 338-356) ---

        // Splash — centered horizontally, startY vertically (AS3 lines 338-342)
        this._splashContainer.style.left = Math.floor((stageW - splashW) / 2) + 'px';
        this._splashContainer.style.top = local1 + 'px';
        local1 = local1 + splashH;

        // Text — centered, +50px gap below splash (AS3 lines 343-347)
        this._textLabel.style.left = Math.floor((stageW - textW) / 2) + 'px';
        this._textLabel.style.top = (local1 + SPLASH_TEXT_GAP) + 'px';
        local1 = (local1 + SPLASH_TEXT_GAP) + textH + ELEMENT_SPACING;

        // Loading bar — centered (AS3 lines 348-352)
        this._barOuter.style.left = Math.floor((stageW - LOADING_BAR_WIDTH) / 2) + 'px';
        this._barOuter.style.top = local1 + 'px';
        local1 = Math.floor(local1 + LOADING_BAR_HEIGHT + (ELEMENT_SPACING / 2));

        // Percentage label — centered (AS3 lines 353-356)
        this._percentLabel.style.left = Math.floor((stageW - percentW) / 2) + 'px';
        this._percentLabel.style.top = local1 + 'px';

        // Version label — top-right corner (AS3 lines 308-313)
        this._versionLabel.style.left = (stageW - versionW) + 'px';
        this._versionLabel.style.top = '0px';
    }

    /**
     * Fake progress bar animation timer callback (AS3: 750ms Timer).
     *
     * AS3 onBarProgressEvent() logic (lines 164-198):
     * - When barProgression == 100 && shouldChangeText: rotate text, reset to 0
     * - When barProgression < 100: increment by min(random(35, min(random(45,55))), 100-bar)
     * - When barProgression hits 100: set shouldChangeText, advance text index
     *
     * @see sources/win63_2021_version/HabboLoadingScreen.as line 164
     */
    private onBarProgressEvent(): void 
    {
        if(this._disposed) return;

        if(this._barProgression === 100) 
        {
            // AS3 lines 170-186: change text if flagged, then reset
            if(this._shouldChangeText) 
            {
                this._textLabel.textContent = LOADING_TEXTS[this._textIndex];
                this._shouldChangeText = false;

                // Re-center text after content change (AS3 line 179)
                const stageW = window.innerWidth;
                const textW = this._textLabel.offsetWidth || 200;

                this._textLabel.style.left = Math.floor((stageW - textW) / 2) + 'px';
            }

            this._barProgression = 0;
        }
        else 
        {
            // AS3 line 190: _barProgression + min(random(35, min(random(45,55))), 100-bar)
            const increment = Math.min(
                this.randomNumber(35, Math.min(this.randomNumber(45, 55))),
                100 - this._barProgression
            );

            this._barProgression += increment;
        }

        // AS3 lines 192-196: when hitting 100, flag text change and advance index
        if(this._barProgression === 100) 
        {
            this._shouldChangeText = true;
            this._textIndex = (this._textIndex + 1) % LOADING_TEXTS.length;
        }

        this.updateLoadingBarProgression(this._barProgression / 100);
    }

    /**
     * Renders the bar fill at the given ratio.
     *
     * AS3 updateLoadingBarProgression (lines 359-388):
     * - fillWidth = (400 - 4 - 4) * ratio = 392 * ratio
     * - Top half: beginFill(0xBACAD3), drawRect(0, 0, fillW, 8)
     * - Bottom half: beginFill(0x8CA1AD), drawRect(0, 8, fillW, 9)
     *
     * @param ratio - Fill ratio from 0.0 to 1.0
     */
    private updateLoadingBarProgression(ratio: number): void 
    {
        const fillWidth = Math.floor(BAR_INNER_WIDTH * ratio);

        this._barFillTop.style.width = fillWidth + 'px';
        this._barFillBottom.style.width = fillWidth + 'px';
    }

    /**
     * Returns a random integer between min and max (inclusive).
     *
     * @see sources/win63_2021_version/HabboLoadingScreen.as line 200
     */
    private randomNumber(min: number, max: number): number 
    {
        return Math.floor(Math.random() * ((max - min) + 1)) + min;
    }

    /** Bound resize handler. */
    private _onResize = (): void => 
    {
        if(!this._disposed) 
        {
            this.positionElements();
        }
    };
}
