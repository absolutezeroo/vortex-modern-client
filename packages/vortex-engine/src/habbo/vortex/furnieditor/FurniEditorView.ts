import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';

import {FurniEditFieldEnum} from './FurniEditField';
import type {IFurniEditorState} from './IFurniEditorState';
import type {IFurniEditPayload} from './IFurniEditPayload';

const log = Logger.getLogger('FurniEditorView');

/** Product types, as sent by the emulator's `ProductType`. */
const PRODUCT_TYPE_WALL = 1;

/**
 * One editable field: the input's window name, the mask bit it commits, and how its text maps to
 * the wire value.
 */
interface IFurniEditorFieldBinding
{
    readonly name: string;
    readonly field: number;
    /** Parses the input's text into its wire value, or returns null to reject the commit. */
    readonly parse: (text: string) => number | string | null;
    /** Renders a server value back into the input. */
    readonly format: (state: IFurniEditorState) => string;
    /** Wall-item-only fields are disabled for floor items, and vice versa. */
    readonly wallOnly?: boolean;
}

/**
 * The furni editor window.
 *
 * NOT ported from AS3 — Vortex-only staff tool, no Habbo equivalent and therefore no AS3 source to
 * trace to. Built from the authored `vortex_furni_editor_xml` layout (registered by App.ts, not
 * shipped from the dump).
 *
 * Each input commits on its own, carrying only its own mask bit. That is what makes the tool
 * "real-time": there is no Apply button and no batching, so one field's edit can never silently
 * rewrite another's — which matters because the operator is editing live server rows and every
 * commit lands in the audit log under exactly the fields it touched.
 */
export class FurniEditorView
{
    private static readonly DESKTOP_WINDOW_LAYER: number = 1;

    private static readonly FIELDS: readonly IFurniEditorFieldBinding[] = [
        {
            name: 'fe_base',
            field: FurniEditFieldEnum.DEFINITION,
            parse: (text) => FurniEditorView.parseInt(text),
            format: (state) => String(state.definitionId)
        },
        {
            name: 'fe_x',
            field: FurniEditFieldEnum.POSITION,
            parse: (text) => FurniEditorView.parseInt(text),
            format: (state) => String(state.x)
        },
        {
            name: 'fe_y',
            field: FurniEditFieldEnum.POSITION,
            parse: (text) => FurniEditorView.parseInt(text),
            format: (state) => String(state.y)
        },
        {
            name: 'fe_dir',
            field: FurniEditFieldEnum.ROTATION,
            parse: (text) => FurniEditorView.parseInt(text),
            format: (state) => String(state.direction)
        },
        {
            // Typed in tiles, sent in hundredths — the wire carries an int because WireFormatter
            // encodes any non-integer number as a float, which the server would misread.
            name: 'fe_z',
            field: FurniEditFieldEnum.ALTITUDE,
            parse: (text) =>
            {
                const value = parseFloat(text.replace(',', '.'));

                return isNaN(value) ? null : Math.round(value * 100);
            },
            format: (state) => (state.zHundredths / 100).toFixed(2)
        },
        {
            name: 'fe_wall',
            field: FurniEditFieldEnum.WALL_OFFSET,
            parse: (text) => FurniEditorView.parseInt(text),
            format: (state) => String(state.wallOffset),
            wallOnly: true
        },
        {
            name: 'fe_owner',
            field: FurniEditFieldEnum.OWNER,
            parse: (text) => (text.trim().length > 0 ? text.trim() : null),
            format: (state) => state.ownerName
        },
        {
            // No trim and no emptiness check: an empty extra data is a legitimate value, and
            // whitespace can be significant inside a legacy stuff-data string.
            name: 'fe_extra',
            field: FurniEditFieldEnum.EXTRA_DATA,
            parse: (text) => text,
            format: (state) => state.extraData
        }
    ];

    private _windowManager: IHabboWindowManager;
    private _localization: IHabboLocalizationManager | null;
    private _window: IWindowContainer | null = null;
    private _inputs: Map<string, ITextWindow> = new Map<string, ITextWindow>();
    private _statusText: ITextWindow | null = null;
    private _baseNameText: ITextWindow | null = null;

    /**
     * Set while the view is writing server values into the inputs. The inputs commit on WE_CHANGE,
     * which fires for programmatic writes too, so without this guard every server response would
     * bounce straight back as eight fresh edits.
     */
    private _applyingServerState: boolean = false;

    private _state: IFurniEditorState | null = null;
    private _disposed: boolean = false;

    private _onCommit: (objectId: number, field: number, payload: IFurniEditPayload) => void;
    private _onReload: (objectId: number) => void;
    private _onOpenDefinition: (definitionId: number) => void;

    constructor(
        windowManager: IHabboWindowManager,
        localization: IHabboLocalizationManager | null,
        onCommit: (objectId: number, field: number, payload: IFurniEditPayload) => void,
        onReload: (objectId: number) => void,
        onOpenDefinition: (definitionId: number) => void
    )
    {
        this._windowManager = windowManager;
        this._localization = localization;
        this._onCommit = onCommit;
        this._onReload = onReload;
        this._onOpenDefinition = onOpenDefinition;
    }

    get isOpen(): boolean
    {
        return this._window != null;
    }

    /**
     * Shows the window, empty. It is populated only by {@link setState}, once the server answers —
     * the editor never displays a value it has not been told.
     */
    show(): void
    {
        if(this._disposed) return;

        if(this._window == null)
        {
            this.createWindow();
        }

        if(this._window == null) return;

        if(this._window.parent == null)
        {
            const desktop = this._windowManager.getDesktop(
                FurniEditorView.DESKTOP_WINDOW_LAYER
            ) as unknown as IWindowContainer | null;

            desktop?.addChild(this._window);
        }

        this._window.visible = true;
    }

    hide(): void
    {
        if(this._window != null)
        {
            this._window.visible = false;
        }
    }

    /** Writes server state into the inputs, replacing whatever the operator had typed. */
    setState(state: IFurniEditorState): void
    {
        if(this._disposed || this._window == null) return;

        this._state = state;
        this._applyingServerState = true;

        try
        {
            const isWall = state.productType === PRODUCT_TYPE_WALL;

            for(const binding of FurniEditorView.FIELDS)
            {
                const input = this._inputs.get(binding.name);

                if(input == null) continue;

                input.text = binding.format(state);

                // A wall offset means nothing to a floor item, and the server would reject it; grey
                // the field rather than letting it be typed into.
                if(binding.wallOnly === true)
                {
                    const window = input as unknown as IWindow;

                    if(isWall)
                    {
                        window.enable();
                    }
                    else
                    {
                        window.disable();
                    }
                }
            }

            if(this._baseNameText != null)
            {
                this._baseNameText.text = state.definitionName.length > 0
                    ? this.localize('vortex.furni_editor.base.named', new Map([
                        ['name', state.definitionName],
                        ['sprite', String(state.spriteId)]
                    ]))
                    : this.localize('vortex.furni_editor.base.unnamed', new Map([
                        ['sprite', String(state.spriteId)]
                    ]));
            }

            if(this._statusText != null)
            {
                this._statusText.text = state.error.length > 0
                    ? this.localize('vortex.furni_editor.status.error', new Map([
                        ['error', state.error]
                    ]))
                    : this.localize('vortex.furni_editor.status.info', new Map([
                        ['id', String(state.objectId)],
                        ['type', this.localize(isWall
                            ? 'vortex.furni_editor.type.wall'
                            : 'vortex.furni_editor.type.floor')],
                        ['owner', String(state.ownerId)]
                    ]));
            }
        }
        finally
        {
            this._applyingServerState = false;
        }
    }

    private createWindow(): void
    {
        const window = this._windowManager.buildWidgetLayout(
            'vortex_furni_editor_xml',
            FurniEditorView.DESKTOP_WINDOW_LAYER
        ) as unknown as IWindowContainer | null;

        if(window == null)
        {
            log.warn('Failed to build layout: vortex_furni_editor_xml');

            return;
        }

        this._window = window;

        for(const binding of FurniEditorView.FIELDS)
        {
            const input = window.findChildByName(binding.name) as ITextWindow | null;

            if(input == null)
            {
                log.warn(`Furni editor layout is missing input "${binding.name}"`);

                continue;
            }

            this._inputs.set(binding.name, input);

            (input as unknown as IWindow).addEventListener(WindowEvent.WE_CHANGE, () =>
                this.onFieldChanged(binding)
            );
        }

        this._statusText = window.findChildByName('fe_status') as ITextWindow | null;
        this._baseNameText = window.findChildByName('fe_base_name') as ITextWindow | null;

        window
            .findChildByName('fe_reload')
            ?.addEventListener(WindowMouseEvent.CLICK, this.onReloadClicked);

        window
            .findChildByName('fe_definition')
            ?.addEventListener(WindowMouseEvent.CLICK, this.onOpenDefinitionClicked);

        // The frame's own close button. Hiding rather than disposing keeps the window and its
        // listeners alive for the next open, which is the common case for a tool used on one item
        // after another.
        window.findChildByTag('close')?.addEventListener(WindowMouseEvent.CLICK, this.onCloseClicked);
    }

    private onFieldChanged(binding: IFurniEditorFieldBinding): void
    {
        if(this._applyingServerState || this._state == null) return;

        const input = this._inputs.get(binding.name);

        if(input == null) return;

        // A half-typed value ("-", "", "1.") parses to null. Staying silent lets the operator finish
        // typing; the next keystroke re-commits.
        if(binding.parse(input.text) == null) return;

        this._onCommit(this._state.objectId, binding.field, this.buildPayload());
    }

    /**
     * Reads every input into a complete payload, whatever field triggered the commit.
     *
     * Sending only the edited field's own value is not enough: X and Y share the POSITION bit, so a
     * commit that filled one and left the other at zero would teleport the item to row 0 the moment
     * its X was touched. Building the whole payload keeps the pair consistent, and the mask still
     * decides what the server reads — the unmasked values are inert filler.
     *
     * An input that does not parse falls back to the last value the server confirmed, so a field
     * left mid-edit elsewhere in the window cannot corrupt this commit.
     */
    private buildPayload(): IFurniEditPayload
    {
        const state = this._state!;

        const readNumber = (name: string, fallback: number): number =>
        {
            const binding = FurniEditorView.FIELDS.find((entry) => entry.name === name);
            const input = this._inputs.get(name);

            if(binding == null || input == null) return fallback;

            const parsed = binding.parse(input.text);

            return typeof parsed === 'number' ? parsed : fallback;
        };

        const readString = (name: string, fallback: string): string =>
        {
            const binding = FurniEditorView.FIELDS.find((entry) => entry.name === name);
            const input = this._inputs.get(name);

            if(binding == null || input == null) return fallback;

            const parsed = binding.parse(input.text);

            return typeof parsed === 'string' ? parsed : fallback;
        };

        return {
            x: readNumber('fe_x', state.x),
            y: readNumber('fe_y', state.y),
            zHundredths: readNumber('fe_z', state.zHundredths),
            direction: readNumber('fe_dir', state.direction),
            wallOffset: readNumber('fe_wall', state.wallOffset),
            extraData: readString('fe_extra', state.extraData),
            ownerName: readString('fe_owner', state.ownerName),
            definitionId: readNumber('fe_base', state.definitionId)
        };
    }

    private onReloadClicked = (_event: WindowMouseEvent): void =>
    {
        if(this._state != null)
        {
            this._onReload(this._state.objectId);
        }
    };

    /** Opens the definition editor on whatever base this item currently uses. */
    private onOpenDefinitionClicked = (_event: WindowMouseEvent): void =>
    {
        if(this._state != null)
        {
            this._onOpenDefinition(this._state.definitionId);
        }
    };

    private onCloseClicked = (_event: WindowMouseEvent): void =>
    {
        this.hide();
    };

    /**
     * Resolves a localization key through the real manager, falling back to the key itself when the
     * hotel has not added it — the same contract WindowParser's `${key}` resolver uses, so a missing
     * key is visibly missing rather than silently blank.
     */
    private localize(key: string, params?: Map<string, string>): string
    {
        if(this._localization == null) return key;

        return params == null
            ? this._localization.getLocalization(key, key)
            : this._localization.getLocalizationWithParamMap(key, key, params);
    }

    /** Rejects anything that is not a whole number outright, rather than truncating silently. */
    private static parseInt(text: string): number | null
    {
        const trimmed = text.trim();

        if(!/^-?\d+$/.test(trimmed)) return null;

        return Number(trimmed);
    }

    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._inputs.clear();
        this._statusText = null;
        this._baseNameText = null;
        this._state = null;

        this._window?.dispose();
        this._window = null;
    }
}
