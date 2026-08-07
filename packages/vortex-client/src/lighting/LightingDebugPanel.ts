/**
 * Room lighting — debug panel.
 *
 * NOT A PORT. See LightingConfig.ts's header.
 *
 * A dev-only DOM overlay for the lighting settings, in the same shape as
 * `debugger/WindowDebuggerOverlay.ts`: one floating toggle button, a hotkey, injected styles, and
 * an `install…()` that returns its own disposer.
 *
 * It exists because tuning this subsystem means sweeping continuous values — radius, strength,
 * blur — and watching the room while you do it. Typing `VortexLighting.set({...})` into a console
 * for that is the wrong instrument: you cannot sweep a slider with it, and the readouts that say
 * whether the pass is doing anything are three levels deep in an object.
 *
 * `window.VortexLighting` stays: the panel drives the same `LightingConfig`, and anything set from
 * either side shows up on the other.
 */
import {Logger} from '@core/utils/Logger';
import {LightingConfig, type IRoomLightingConfig} from './LightingConfig';
import {RoomLightingController} from './RoomLightingController';

const log = Logger.getLogger('client.lighting.LightingDebugPanel');

// TS-only: no AS3 counterpart.
const HOTKEY_CODE = 'KeyL';

/** How often the live readouts refresh, in ms. Fast enough to follow a drag, slow enough to read. */
// TS-only: no AS3 counterpart.
const STATS_INTERVAL_MS = 250;

// TS-only: no AS3 counterpart.
interface IToggleSpec
{
    key: keyof IRoomLightingConfig;
    label: string;
    hint: string;
}

// TS-only: no AS3 counterpart.
interface ISliderSpec
{
    key: keyof IRoomLightingConfig;
    label: string;
    min: number;
    max: number;
    step: number;
    hint: string;
}

// TS-only: no AS3 counterpart.
const TOGGLES: readonly IToggleSpec[] = [
    {key: 'enabled', label: 'Enabled', hint: 'Master switch. Off restores the vanilla render exactly.'},
    {key: 'litSprites', label: 'Light objects', hint: 'Tint each object by the light reaching it, instead of covering it with the floor overlay. The one setting that writes into the ported renderer.'},
    {key: 'shadows', label: 'Cast shadows', hint: 'Shadows on the floor.'},
    {key: 'silhouetteShadows', label: 'Real shapes', hint: 'Flatten each object\'s own texture onto the floor, instead of extruding its tile footprint. Off gives the blocky tile shadows.'},
    {key: 'ambient', label: 'Distance falloff', hint: 'Darkening away from the light.'},
    {key: 'debugLight', label: 'Debug light', hint: 'Put a light at the room centre when there is no moodlight.'},
    {key: 'avatarsCastShadows', label: 'Avatars cast', hint: 'Avatars are absent from the stacking height map, so they are collected separately.'},
    {key: 'furnitureEmitsLight', label: 'Furni emits', hint: 'Lamps, candles and neon light the room. Detected by the additive glow layer (ink=1) the artists already put in the visualization data — no name matching.'},
    {key: 'keepObjectsLit', label: 'Keep objects lit', hint: 'Cut occupied tiles out of the darkness, so the overlay never lands on what stands there.'},
    {key: 'debugOverlay', label: 'Show geometry', hint: 'Red: occluder segments. Green cross: the light. Cyan: the floor clip.'}
];

// TS-only: no AS3 counterpart.
const SLIDERS: readonly ISliderSpec[] = [
    {key: 'lightRadiusTiles', label: 'Light radius', min: 1, max: 20, step: 0.5, hint: 'Tiles of full light before the falloff starts, for the moodlight and the debug light. Too large and every object sits inside the core, darkening by exactly zero.'},
    {key: 'furnitureLightRadius', label: 'Furni radius', min: 1, max: 12, step: 0.5, hint: 'The same, for a glowing furni. A candle should reach less far than a moodlight.'},
    {key: 'maxLights', label: 'Max lights', min: 1, max: 16, step: 1, hint: 'Cap on simultaneous lights, nearest the room centre first. Each one is a pass; anything dropped is logged, never silently cut.'},
    {key: 'ambientStrength', label: 'Ambient strength', min: 0, max: 1, step: 0.01, hint: 'How dark the far end of the room goes.'},
    {key: 'shadowStrength', label: 'Shadow strength', min: 0, max: 1, step: 0.01, hint: 'Opacity of a cast shadow.'},
    {key: 'shadowLength', label: 'Shadow length', min: 0, max: 3, step: 0.05, hint: 'Global multiplier on shadow length. The length itself comes from the geometry: horizontal distance divided by the light\'s height.'},
    {key: 'lightHeightTiles', label: 'Light height', min: 0.2, max: 6, step: 0.1, hint: 'Height added above a light\'s own object, in tiles. A furni reports where it sits, not where its bulb is — there is nothing in the data that gives the real height, so this is an assumption you can tune.'},
    {key: 'maxShadowStretch', label: 'Max stretch', min: 0.5, max: 8, step: 0.5, hint: 'Longest shadow allowed, in caster heights. Stops a low light stretching a shadow across the whole room.'},
    {key: 'shadowBlur', label: 'Penumbra', min: 0, max: 30, step: 1, hint: 'Softness of the shadow edge, in pixels. 0 gives hard edges.'},
    {key: 'minCasterHeight', label: 'Caster height', min: 0, max: 2, step: 0.05, hint: 'Stack height at which a tile starts blocking light. Rugs below, tables above.'},
    {key: 'shadowExtrudeTiles', label: 'Shadow reach', min: 8, max: 128, step: 1, hint: 'How far a shadow is extruded. Must leave any room.'},
    {key: 'updateIntervalMs', label: 'Recompute every', min: 16, max: 500, step: 1, hint: 'Delay between recomputations. The transform still follows the room every frame.'}
];

// TS-only: no AS3 counterpart.
let stylesInjected = false;

/**
 * Install the panel. Returns the disposer.
 */
// TS-only: no AS3 counterpart.
export function installLightingDebugger(): () => void
{
    let panel: LightingDebugPanel | null = null;

    const toggle = (): void =>
    {
        if(panel !== null)
        {
            panel.dispose();
            panel = null;
        }
        else
        {
            panel = new LightingDebugPanel(() =>
            {
                panel = null;
                button.classList.remove('vlp-toggle-active');
            });
        }

        button.classList.toggle('vlp-toggle-active', panel !== null);
    };

    const onKeyDown = (event: KeyboardEvent): void =>
    {
        if(!event.ctrlKey || !event.shiftKey || event.code !== HOTKEY_CODE)
        {
            return;
        }

        event.preventDefault();
        toggle();
    };

    injectStyles();

    const button = document.createElement('button');

    button.className = 'vlp-toggle-btn';
    button.textContent = '💡';
    button.title = 'Room lighting (Ctrl+Shift+L)';
    button.addEventListener('click', toggle);
    document.body.appendChild(button);

    window.addEventListener('keydown', onKeyDown);

    log.debug('Lighting debug panel installed (Ctrl+Shift+L)');

    return () =>
    {
        window.removeEventListener('keydown', onKeyDown);
        button.remove();
        panel?.dispose();
        panel = null;
    };
}

// TS-only: no AS3 counterpart.
class LightingDebugPanel
{
    // TS-only: no AS3 counterpart.
    private readonly _onClosed: () => void;
    // TS-only: no AS3 counterpart.
    private readonly _root: HTMLDivElement;
    // TS-only: no AS3 counterpart.
    private readonly _statsEl: HTMLDivElement;
    // TS-only: no AS3 counterpart.
    private readonly _toggleInputs: Map<keyof IRoomLightingConfig, HTMLInputElement> = new Map();
    // TS-only: no AS3 counterpart.
    private readonly _sliderInputs: Map<keyof IRoomLightingConfig, {input: HTMLInputElement; readout: HTMLSpanElement}> = new Map();
    // TS-only: no AS3 counterpart.
    private _tintInput: HTMLInputElement | null = null;
    // TS-only: no AS3 counterpart.
    private _unsubscribe: (() => void) | null = null;
    // TS-only: no AS3 counterpart.
    private _statsTimer: number = 0;
    // TS-only: no AS3 counterpart.
    private _probeActive: boolean = false;
    // TS-only: no AS3 counterpart.
    private _disposed: boolean = false;

    constructor(onClosed: () => void)
    {
        this._onClosed = onClosed;

        injectStyles();

        this._root = document.createElement('div');
        this._root.className = 'vlp-panel';

        this._root.appendChild(this.buildHeader());
        this._root.appendChild(this.buildToggles());
        this._root.appendChild(this.buildSliders());
        this._root.appendChild(this.buildTint());
        this._root.appendChild(this.buildActions());

        this._statsEl = document.createElement('div');
        this._statsEl.className = 'vlp-stats';
        this._root.appendChild(this._statsEl);

        document.body.appendChild(this._root);

        // Anything set from `window.VortexLighting`, or by the controller disabling itself after a
        // throw, has to show up here too.
        this._unsubscribe = LightingConfig.onChange(() => this.syncFromConfig());

        this.syncFromConfig();
        this.refreshStats();

        this._statsTimer = window.setInterval(() => this.refreshStats(), STATS_INTERVAL_MS);
    }

    // TS-only: no AS3 counterpart.
    private buildHeader(): HTMLDivElement
    {
        const header = document.createElement('div');

        header.className = 'vlp-header';

        const title = document.createElement('span');

        title.textContent = 'Room lighting';
        header.appendChild(title);

        const close = document.createElement('button');

        close.className = 'vlp-close';
        close.textContent = '×';
        close.title = 'Close (Ctrl+Shift+L)';
        close.addEventListener('click', () => this.dispose());
        header.appendChild(close);

        return header;
    }

    // TS-only: no AS3 counterpart.
    private buildToggles(): HTMLDivElement
    {
        const group = document.createElement('div');

        group.className = 'vlp-group vlp-toggles';

        for(const spec of TOGGLES)
        {
            const label = document.createElement('label');

            label.className = 'vlp-toggle';
            label.title = spec.hint;

            const input = document.createElement('input');

            input.type = 'checkbox';
            input.addEventListener('change', () =>
            {
                LightingConfig.set({[spec.key]: input.checked} as Partial<IRoomLightingConfig>);
            });

            const text = document.createElement('span');

            text.textContent = spec.label;

            label.appendChild(input);
            label.appendChild(text);
            group.appendChild(label);

            this._toggleInputs.set(spec.key, input);
        }

        return group;
    }

    // TS-only: no AS3 counterpart.
    private buildSliders(): HTMLDivElement
    {
        const group = document.createElement('div');

        group.className = 'vlp-group';

        for(const spec of SLIDERS)
        {
            const row = document.createElement('div');

            row.className = 'vlp-slider-row';
            row.title = spec.hint;

            const label = document.createElement('span');

            label.className = 'vlp-slider-label';
            label.textContent = spec.label;

            const readout = document.createElement('span');

            readout.className = 'vlp-slider-value';

            const input = document.createElement('input');

            input.type = 'range';
            input.min = String(spec.min);
            input.max = String(spec.max);
            input.step = String(spec.step);
            input.addEventListener('input', () =>
            {
                const value = Number(input.value);

                readout.textContent = LightingDebugPanel.formatNumber(value);
                LightingConfig.set({[spec.key]: value} as Partial<IRoomLightingConfig>);
            });

            row.appendChild(label);
            row.appendChild(input);
            row.appendChild(readout);
            group.appendChild(row);

            this._sliderInputs.set(spec.key, {input, readout});
        }

        return group;
    }

    // TS-only: no AS3 counterpart.
    private buildTint(): HTMLDivElement
    {
        const row = document.createElement('div');

        row.className = 'vlp-group vlp-slider-row';
        row.title = 'The colour the darkness is tinted with.';

        const label = document.createElement('span');

        label.className = 'vlp-slider-label';
        label.textContent = 'Shadow tint';

        const input = document.createElement('input');

        input.type = 'color';
        input.className = 'vlp-color';
        input.addEventListener('input', () =>
        {
            LightingConfig.set({shadowTint: parseInt(input.value.slice(1), 16)});
        });

        this._tintInput = input;

        row.appendChild(label);
        row.appendChild(input);

        return row;
    }

    // TS-only: no AS3 counterpart.
    private buildActions(): HTMLDivElement
    {
        const group = document.createElement('div');

        group.className = 'vlp-group vlp-actions';

        const probe = document.createElement('button');

        probe.className = 'vlp-btn';
        probe.textContent = 'Probe';
        probe.title = 'Draw an unmissable marker with the clip removed — does this layer reach the screen at all?';
        probe.addEventListener('click', () =>
        {
            this._probeActive = !this._probeActive;
            probe.classList.toggle('vlp-btn-active', this._probeActive);
            RoomLightingController.instance?.setProbe(this._probeActive);
        });

        const reset = document.createElement('button');

        reset.className = 'vlp-btn';
        reset.textContent = 'Reset';
        reset.title = 'Back to defaults.';
        reset.addEventListener('click', () => LightingConfig.reset());

        const dump = document.createElement('button');

        dump.className = 'vlp-btn';
        dump.textContent = 'Log diagnose()';
        dump.title = 'Write the full diagnostic to the console, for pasting.';
        dump.addEventListener('click', () =>
        {
            const controller = RoomLightingController.instance;

            if(controller === null)
            {
                log.warn('Lighting controller not installed');

                return;
            }

            log.info(`Lighting diagnose:\n${JSON.stringify(controller.diagnose(), null, 2)}`);
        });

        const objects = document.createElement('button');

        objects.className = 'vlp-btn';
        objects.textContent = 'Log furni';
        objects.title = 'Table every furniture and wall object with the blend modes its sprites use, and whether the emitter test matched. This is what says why a given room lights the wrong things.';
        objects.addEventListener('click', () =>
        {
            const controller = RoomLightingController.instance;

            if(controller === null)
            {
                log.warn('Lighting controller not installed');

                return;
            }

            const rows = controller.dumpObjects();

            log.info(`Room objects and their blend modes (${rows.length}):`);
            // eslint-disable-next-line no-console
            console.table(rows);
        });

        const compare = document.createElement('button');

        compare.className = 'vlp-btn';
        compare.textContent = 'Log offset';
        compare.title = 'Compare this layer\'s projection against RoomEngine.getRoomObjectScreenLocation() for every object. A constant non-zero delta is one missing term; a growing one is a scale problem; zero means the geometry is right and the fault is in what gets drawn.';
        compare.addEventListener('click', () =>
        {
            const controller = RoomLightingController.instance;

            if(controller === null)
            {
                log.warn('Lighting controller not installed');

                return;
            }

            const rows = controller.compareProjection();

            log.info(`Projection vs the engine's own (${rows.length}):`);
            // eslint-disable-next-line no-console
            console.table(rows);
        });

        group.appendChild(probe);
        group.appendChild(reset);
        group.appendChild(dump);
        group.appendChild(objects);
        group.appendChild(compare);

        return group;
    }

    /** Push the live config into the controls, without firing their change handlers. */
    // TS-only: no AS3 counterpart.
    private syncFromConfig(): void
    {
        if(this._disposed)
        {
            return;
        }

        const values = LightingConfig.values;

        for(const [key, input] of this._toggleInputs)
        {
            input.checked = values[key] === true;
        }

        for(const [key, {input, readout}] of this._sliderInputs)
        {
            const value = values[key];

            if(typeof value === 'number')
            {
                input.value = String(value);
                readout.textContent = LightingDebugPanel.formatNumber(value);
            }
        }

        if(this._tintInput !== null)
        {
            this._tintInput.value = `#${values.shadowTint.toString(16).padStart(6, '0')}`;
        }

        this._root.classList.toggle('vlp-disabled', !values.enabled);
    }

    /**
     * The readouts that say whether the pass is doing anything.
     *
     * `tintedSprites` with every darkness at zero is the state that reads as "nothing works" while
     * being entirely correct — an object inside the light's core darkens by exactly nothing. That
     * distinction cost a round trip, so it is on the panel.
     */
    // TS-only: no AS3 counterpart.
    private refreshStats(): void
    {
        if(this._disposed)
        {
            return;
        }

        const controller = RoomLightingController.instance;

        if(controller === null)
        {
            this._statsEl.textContent = 'Controller not installed.';

            return;
        }

        let report: Record<string, unknown>;

        try
        {
            report = controller.diagnose();
        }
        catch (error)
        {
            this._statsEl.textContent = `diagnose() threw: ${String(error)}`;

            return;
        }

        const ticker = report.ticker as {ticks: number; redraws: number; lastBail: string | null; lastError: string | null};
        const occluders = report.occluders as {segments: number; floorRuns: number};
        const lights = report.lights as {x: number; y: number; kind: string; sourceId: string; rawX: number; rawY: number}[] | null;
        const sprites = report.spriteLighting as {litObjects: number; tintedSprites: number; sample: {id: string; darkness: number}[]} | null;

        const rows: string[] = [];

        const room = report.room as {activeRoomId: number} | null;

        rows.push(`room ${room === null ? '?' : room.activeRoomId} · ticks ${ticker.ticks} · redraws ${ticker.redraws}`);
        if(lights === null || lights.length === 0)
        {
            rows.push('lights: none');
        }
        else
        {
            rows.push(`lights: ${lights.length}`);

            for(const light of lights.slice(0, 5))
            {
                // Both positions, because a light far from its object is snapping to the floor, not
                // a projection fault — and the two are indistinguishable on screen.
                const snapped = `${light.x.toFixed(1)},${light.y.toFixed(1)}`;
                const raw = `${light.rawX.toFixed(1)},${light.rawY.toFixed(1)}`;

                rows.push(`  ${light.kind} #${light.sourceId} at ${snapped}${snapped === raw ? '' : ` (from ${raw})`}`);
            }
        }
        rows.push(`occluders: ${occluders.segments} segments · ${occluders.floorRuns} floor runs`);

        if(sprites !== null)
        {
            const darkness = sprites.sample.map((entry) => entry.darkness.toFixed(2)).join(', ');

            rows.push(`lit objects: ${sprites.litObjects} · tinted sprites: ${sprites.tintedSprites}`);
            rows.push(`darkness: ${darkness.length > 0 ? darkness : '—'}`);
        }

        if(ticker.lastBail !== null)
        {
            rows.push(`stopped: ${ticker.lastBail}`);
        }

        if(ticker.lastError !== null)
        {
            rows.push(`error: ${ticker.lastError.split('\n')[0]}`);
        }

        this._statsEl.textContent = rows.join('\n');
    }

    // TS-only: no AS3 counterpart.
    private static formatNumber(value: number): string
    {
        return Number.isInteger(value) ? String(value) : value.toFixed(2);
    }

    // TS-only: no AS3 counterpart.
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._disposed = true;

        window.clearInterval(this._statsTimer);
        this._unsubscribe?.();
        this._unsubscribe = null;

        if(this._probeActive)
        {
            RoomLightingController.instance?.setProbe(false);
            this._probeActive = false;
        }

        this._root.remove();
        this._onClosed();
    }
}

// TS-only: no AS3 counterpart.
function injectStyles(): void
{
    if(stylesInjected)
    {
        return;
    }

    stylesInjected = true;

    const style = document.createElement('style');

    style.textContent = `
.vlp-toggle-btn {
    position: fixed; right: 8px; bottom: 96px; z-index: 100000;
    width: 32px; height: 32px; padding: 0; line-height: 32px;
    font-size: 16px; text-align: center; cursor: pointer;
    border: 1px solid #3a3a4a; border-radius: 6px;
    background: #1b1b24; color: #e8e8f0; opacity: 0.75;
}
.vlp-toggle-btn:hover { opacity: 1; }
.vlp-toggle-btn.vlp-toggle-active { background: #2f2f52; opacity: 1; }
.vlp-panel {
    position: fixed; right: 8px; bottom: 136px; z-index: 100000;
    width: 300px; max-height: calc(100vh - 160px); overflow-y: auto;
    display: flex; flex-direction: column; gap: 8px;
    padding: 10px; box-sizing: border-box;
    font: 11px/1.5 ui-monospace, Menlo, Consolas, monospace;
    color: #e8e8f0; background: #14141c; border: 1px solid #3a3a4a; border-radius: 8px;
    box-shadow: 0 6px 24px rgba(0,0,0,0.5);
}
.vlp-panel.vlp-disabled .vlp-group:not(.vlp-toggles) { opacity: 0.45; }
.vlp-header {
    display: flex; align-items: center; justify-content: space-between;
    font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
    padding-bottom: 6px; border-bottom: 1px solid #2a2a38;
}
.vlp-close {
    width: 20px; height: 20px; padding: 0; cursor: pointer; font-size: 15px;
    background: transparent; color: #9a9ab0; border: none;
}
.vlp-close:hover { color: #fff; }
.vlp-group { display: flex; flex-direction: column; gap: 5px; }
.vlp-toggles { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 8px; }
.vlp-toggle { display: flex; align-items: center; gap: 5px; cursor: pointer; }
.vlp-toggle input { margin: 0; cursor: pointer; accent-color: #6f6fd0; }
.vlp-slider-row { display: grid; grid-template-columns: 84px 1fr 34px; align-items: center; gap: 6px; }
.vlp-slider-label { color: #a8a8c0; }
.vlp-slider-value { text-align: right; color: #d8d8ea; }
.vlp-slider-row input[type=range] { width: 100%; accent-color: #6f6fd0; }
.vlp-color { width: 100%; height: 20px; padding: 0; background: transparent; border: 1px solid #3a3a4a; cursor: pointer; }
.vlp-actions { flex-direction: row; gap: 6px; }
.vlp-btn {
    flex: 1; padding: 4px 6px; cursor: pointer; font: inherit;
    color: #e8e8f0; background: #23233a; border: 1px solid #3a3a4a; border-radius: 4px;
}
.vlp-btn:hover { background: #2f2f52; }
.vlp-btn.vlp-btn-active { background: #57578f; border-color: #7676c0; }
.vlp-stats {
    white-space: pre-wrap; color: #9a9ab0;
    padding-top: 6px; border-top: 1px solid #2a2a38;
}
`;

    document.head.appendChild(style);
}
