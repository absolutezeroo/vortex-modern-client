import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';

import type {IFurniDefinition} from './IFurniDefinition';
import type {IFurniOption} from './FurniDefinitionOptions';
import {
    FURNITURE_LOGICS,
    FURNI_CATEGORY_OPTIONS,
    FURNI_USAGE_OPTIONS,
    PRODUCT_TYPE_OPTIONS,
    STUFF_DATA_TYPE_OPTIONS
} from './FurniDefinitionOptions';

const log = Logger.getLogger('FurniDefinitionView');

/** The checkbox surface — declared structurally, the way vortex-glaze does. */
interface ICheckWidget
{
    isSelected: boolean;
    addEventListener(type: string, callback: () => void): void;
}

/** Free-text numeric inputs: window name -> the definition field it edits. */
const NUMBER_FIELDS: ReadonlyArray<readonly [string, keyof IFurniDefinition]> = [
    ['fd_sprite', 'spriteId'],
    ['fd_width', 'width'],
    ['fd_length', 'length'],
    ['fd_states', 'totalStates']
];

/** Checkboxes: window name -> the boolean field it edits. */
const FLAG_FIELDS: ReadonlyArray<readonly [string, keyof IFurniDefinition]> = [
    ['fd_canstack', 'canStack'],
    ['fd_canwalk', 'canWalk'],
    ['fd_cansit', 'canSit'],
    ['fd_canlay', 'canLay'],
    ['fd_cantrade', 'canTrade'],
    ['fd_cansell', 'canSell'],
    ['fd_canrecycle', 'canRecycle'],
    ['fd_cangroup', 'canGroup']
];

/**
 * The furniture *definition* editor window — one row of `furniture_definitions`, i.e. a furniture
 * type rather than a placed item.
 *
 * NOT ported from AS3 — Vortex-only staff tool.
 *
 * Values the operator cannot be expected to know by heart — the interaction (logic) and the four
 * enums (product, category, usage, stuff-data) — are dropdowns populated from the emulator's own
 * value sets (`FurniDefinitionOptions`). The genuinely free fields (name, sprite, dimensions, state
 * count, stack height) stay text inputs.
 *
 * There is an explicit Save rather than per-field commit: the server's write path rewrites every
 * column at once, and this row is hotel-wide.
 */
export class FurniDefinitionView
{
    private static readonly DESKTOP_WINDOW_LAYER: number = 1;

    private _windowManager: IHabboWindowManager;
    private _localization: IHabboLocalizationManager | null;
    private _window: IWindowContainer | null = null;
    private _inputs: Map<string, ITextWindow> = new Map<string, ITextWindow>();
    private _checks: Map<string, ICheckWidget> = new Map<string, ICheckWidget>();
    private _statusText: ITextWindow | null = null;

    // Dropdowns, each with the value list its selection index maps back to.
    private _logicDrop: IDropMenuWindow | null = null;
    private _logicValues: string[] = [];
    private _productDrop: IDropMenuWindow | null = null;
    private _categoryDrop: IDropMenuWindow | null = null;
    private _usageDrop: IDropMenuWindow | null = null;
    private _stuffDrop: IDropMenuWindow | null = null;

    private _definition: IFurniDefinition | null = null;
    private _disposed: boolean = false;

    private _onSave: (definition: IFurniDefinition) => void;
    private _onReload: (definitionId: number) => void;

    constructor(
        windowManager: IHabboWindowManager,
        localization: IHabboLocalizationManager | null,
        onSave: (definition: IFurniDefinition) => void,
        onReload: (definitionId: number) => void
    )
    {
        this._windowManager = windowManager;
        this._localization = localization;
        this._onSave = onSave;
        this._onReload = onReload;
    }

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
                FurniDefinitionView.DESKTOP_WINDOW_LAYER
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

    /** Fills the window from the server's stored row. */
    setDefinition(definition: IFurniDefinition, error: string): void
    {
        if(this._disposed || this._window == null) return;

        this._definition = definition;

        this.setInputText('fd_name', definition.name);
        // Typed in tiles, stored in hundredths.
        this.setInputText('fd_stack', (definition.stackHeightHundredths / 100).toFixed(2));

        for(const [name, field] of NUMBER_FIELDS)
        {
            this.setInputText(name, String(definition[field]));
        }

        for(const [name, field] of FLAG_FIELDS)
        {
            const check = this._checks.get(name);

            if(check != null) check.isSelected = definition[field] as boolean;
        }

        this.populateLogicDrop(definition.logic);
        this.selectOption(this._productDrop, PRODUCT_TYPE_OPTIONS, definition.productType);
        this.selectOption(this._categoryDrop, FURNI_CATEGORY_OPTIONS, definition.furniCategory);
        this.selectOption(this._usageDrop, FURNI_USAGE_OPTIONS, definition.usagePolicy);
        this.selectOption(this._stuffDrop, STUFF_DATA_TYPE_OPTIONS, definition.stuffDataType);

        if(this._statusText != null)
        {
            this._statusText.text = error.length > 0
                ? this.localize('vortex.furni_definition.status.error', new Map([['error', error]]))
                : this.localize('vortex.furni_definition.status.saved', new Map([
                    ['id', String(definition.definitionId)]
                ]));
        }
    }

    private createWindow(): void
    {
        const window = this._windowManager.buildWidgetLayout(
            'vortex_furni_definition_xml',
            FurniDefinitionView.DESKTOP_WINDOW_LAYER
        ) as unknown as IWindowContainer | null;

        if(window == null)
        {
            log.warn('Failed to build layout: vortex_furni_definition_xml');

            return;
        }

        this._window = window;

        const inputNames = ['fd_name', 'fd_stack', ...NUMBER_FIELDS.map(([name]) => name)];

        for(const name of inputNames)
        {
            const input = window.findChildByName(name) as ITextWindow | null;

            if(input == null)
            {
                log.warn(`Definition editor layout is missing input "${name}"`);

                continue;
            }

            this._inputs.set(name, input);
        }

        for(const [name] of FLAG_FIELDS)
        {
            const check = window.findChildByName(name) as unknown as ICheckWidget | null;

            if(check == null)
            {
                log.warn(`Definition editor layout is missing checkbox "${name}"`);

                continue;
            }

            this._checks.set(name, check);
        }

        this._logicDrop = window.findChildByName('fd_logic') as unknown as IDropMenuWindow | null;
        this._productDrop = window.findChildByName('fd_product') as unknown as IDropMenuWindow | null;
        this._categoryDrop = window.findChildByName('fd_category') as unknown as IDropMenuWindow | null;
        this._usageDrop = window.findChildByName('fd_usage') as unknown as IDropMenuWindow | null;
        this._stuffDrop = window.findChildByName('fd_stuffdata') as unknown as IDropMenuWindow | null;

        this.populateOptionDrop(this._productDrop, PRODUCT_TYPE_OPTIONS);
        this.populateOptionDrop(this._categoryDrop, FURNI_CATEGORY_OPTIONS);
        this.populateOptionDrop(this._usageDrop, FURNI_USAGE_OPTIONS);
        this.populateOptionDrop(this._stuffDrop, STUFF_DATA_TYPE_OPTIONS);

        this._statusText = window.findChildByName('fd_status') as ITextWindow | null;

        window.findChildByName('fd_save')?.addEventListener(WindowMouseEvent.CLICK, this.onSaveClicked);
        window.findChildByName('fd_reload')?.addEventListener(WindowMouseEvent.CLICK, this.onReloadClicked);
        window.findChildByTag('close')?.addEventListener(WindowMouseEvent.CLICK, this.onCloseClicked);
    }

    private onSaveClicked = (_event: WindowMouseEvent): void =>
    {
        if(this._definition == null) return;

        const edited = this.collect(this._definition);

        if(edited == null)
        {
            if(this._statusText != null)
            {
                this._statusText.text = this.localize(
                    'vortex.furni_definition.status.error',
                    new Map([['error', 'invalid_number']])
                );
            }

            return;
        }

        this._onSave(edited);
    };

    /**
     * Reads the whole window back into a definition. Returns null if any numeric field does not
     * parse — the write rewrites every column at once, so one bad field must block the save.
     */
    private collect(current: IFurniDefinition): IFurniDefinition | null
    {
        const numbers = new Map<keyof IFurniDefinition, number>();

        for(const [name, field] of NUMBER_FIELDS)
        {
            const parsed = FurniDefinitionView.parseInt(this.getInputText(name));

            if(parsed == null) return null;

            numbers.set(field, parsed);
        }

        const stack = parseFloat(this.getInputText('fd_stack').replace(',', '.'));

        if(isNaN(stack)) return null;

        const flag = (name: string, fallback: boolean): boolean =>
            this._checks.get(name)?.isSelected ?? fallback;

        return {
            definitionId: current.definitionId,
            spriteId: numbers.get('spriteId')!,
            name: this.getInputText('fd_name'),
            productType: this.readOption(this._productDrop, PRODUCT_TYPE_OPTIONS, current.productType),
            furniCategory: this.readOption(this._categoryDrop, FURNI_CATEGORY_OPTIONS, current.furniCategory),
            logic: this.readLogic(current.logic),
            totalStates: numbers.get('totalStates')!,
            width: numbers.get('width')!,
            length: numbers.get('length')!,
            stackHeightHundredths: Math.round(stack * 100),
            canStack: flag('fd_canstack', current.canStack),
            canWalk: flag('fd_canwalk', current.canWalk),
            canSit: flag('fd_cansit', current.canSit),
            canLay: flag('fd_canlay', current.canLay),
            canRecycle: flag('fd_canrecycle', current.canRecycle),
            canTrade: flag('fd_cantrade', current.canTrade),
            canGroup: flag('fd_cangroup', current.canGroup),
            canSell: flag('fd_cansell', current.canSell),
            usagePolicy: this.readOption(this._usageDrop, FURNI_USAGE_OPTIONS, current.usagePolicy),
            extraData: current.extraData,
            stuffDataType: this.readOption(this._stuffDrop, STUFF_DATA_TYPE_OPTIONS, current.stuffDataType)
        };
    }

    /**
     * Builds the logic dropdown so the current value is always present, even if the embedded list
     * has drifted from the server — otherwise reloading a furni whose logic this build does not know
     * about would silently reassign it on save.
     */
    private populateLogicDrop(current: string): void
    {
        if(this._logicDrop == null) return;

        this._logicValues = FURNITURE_LOGICS.includes(current) || current.length === 0
            ? [...FURNITURE_LOGICS]
            : [current, ...FURNITURE_LOGICS];

        this._logicDrop.populateWithStrings(this._logicValues);

        const index = this._logicValues.indexOf(current);
        this._logicDrop.selection = index >= 0 ? index : 0;
    }

    private readLogic(fallback: string): string
    {
        if(this._logicDrop == null) return fallback;

        const index = this._logicDrop.selection;

        return index >= 0 && index < this._logicValues.length ? this._logicValues[index] : fallback;
    }

    private populateOptionDrop(drop: IDropMenuWindow | null, options: readonly IFurniOption[]): void
    {
        drop?.populateWithStrings(options.map((option) => option.label));
    }

    private selectOption(drop: IDropMenuWindow | null, options: readonly IFurniOption[], value: number): void
    {
        if(drop == null) return;

        const index = options.findIndex((option) => option.value === value);
        drop.selection = index >= 0 ? index : 0;
    }

    private readOption(drop: IDropMenuWindow | null, options: readonly IFurniOption[], fallback: number): number
    {
        if(drop == null) return fallback;

        const index = drop.selection;

        return index >= 0 && index < options.length ? options[index].value : fallback;
    }

    private onReloadClicked = (_event: WindowMouseEvent): void =>
    {
        if(this._definition != null)
        {
            this._onReload(this._definition.definitionId);
        }
    };

    private onCloseClicked = (_event: WindowMouseEvent): void =>
    {
        this.hide();
    };

    private setInputText(name: string, value: string): void
    {
        const input = this._inputs.get(name);

        if(input != null) input.text = value;
    }

    private getInputText(name: string): string
    {
        return this._inputs.get(name)?.text ?? '';
    }

    private localize(key: string, params?: Map<string, string>): string
    {
        if(this._localization == null) return key;

        return params == null
            ? this._localization.getLocalization(key, key)
            : this._localization.getLocalizationWithParamMap(key, key, params);
    }

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
        this._checks.clear();
        this._logicDrop = null;
        this._productDrop = null;
        this._categoryDrop = null;
        this._usageDrop = null;
        this._stuffDrop = null;
        this._statusText = null;
        this._definition = null;

        this._window?.dispose();
        this._window = null;
    }
}
