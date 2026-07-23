import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import type {HabboUserDefinedRoomEvents} from '../../HabboUserDefinedRoomEvents';
import {DefaultElement} from '../DefaultElement';
import {NeighborhoodFloor} from '../common/NeighborhoodFloor';
import {SpiralUtils} from '../common/utils/SpiralUtils';
import {WiredInputSourcePicker} from '../inputsources/WiredInputSourcePicker';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {AssetButtonParam} from '../uibuilder/params/AssetButtonParam';
import {NumberInputParam} from '../uibuilder/params/NumberInputParam';
import type {AssetButtonPreset} from '../uibuilder/presets/AssetButtonPreset';
import type {NamedNumberInputPreset} from '../uibuilder/presets/combinations/NamedNumberInputPreset';
import type {FloorDrawingPreset} from '../uibuilder/presets/applications/FloorDrawingPreset';
import {DefaultSelectorType} from './DefaultSelectorType';

/**
 * InNeighborhood — abstract base for the "in neighborhood" selectors (UsersInNeighborhood,
 * FurniInNeighborhood): a draw-mode toolbar over a FloorEditor canvas plus x/y root-tile inputs and a
 * small/big resolution toggle. The user/furni merged flag and root tile serialize into intParams[0..2];
 * the drawn floor occupancy follows as a spiral-ordered bitmask (SpiralUtils).
 *
 * It is abstract (no `code` override) and never registered. Note: the visual floor-drawing canvas is
 * inert (FloorDrawingPreset is stubbed — see its TODO(AS3)); occupancy still (de)serializes faithfully
 * via NeighborhoodFloor + SpiralUtils, so saved neighborhoods round-trip.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/InNeighborhood.as
 */
export class InNeighborhood extends DefaultSelectorType
{
    // AS3: InNeighborhood.as::DRAW_MODES
    private static readonly DRAW_MODES: string[] = ['add_tile', 'remove_tile', 'set_root_tile'];

    // AS3: InNeighborhood.as::_drawMode
    private _drawMode: string = 'add_tile';

    // AS3: InNeighborhood.as::_SafeStr_5140 (name derived: the root tile; AS3 lazily creates the Point)
    private _rootTile: {x: number; y: number} = {x: 0, y: 0};

    // AS3: InNeighborhood.as::_floor
    private _floor: NeighborhoodFloor | null = null;

    // AS3: InNeighborhood.as::_SafeStr_6999 (name derived: whether the user source is selected)
    private _userSourceSelected: boolean = false;

    // AS3: InNeighborhood.as::_SafeStr_5173 (name derived: the floor drawing canvas)
    private _floorDrawing: FloorDrawingPreset | null = null;

    // AS3: InNeighborhood.as::_SafeStr_7094 (name derived: the root x input)
    private _rootXInput: NamedNumberInputPreset | null = null;

    // AS3: InNeighborhood.as::_SafeStr_7477 (name derived: the root y input)
    private _rootYInput: NamedNumberInputPreset | null = null;

    // AS3: InNeighborhood.as::_drawButtonsByMode
    private _drawButtonsByMode: Record<string, AssetButtonPreset> | null = null;

    // AS3: InNeighborhood.as::_preferBigMode
    private _preferBigMode: boolean = false;

    // AS3: InNeighborhood.as::_inBigMode
    private _inBigMode: boolean = false;

    // AS3: InNeighborhood.as::_SafeStr_8712 (name derived: the resolution toggle button)
    private _resolutionButton!: AssetButtonPreset;

    // AS3: InNeighborhood.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: InNeighborhood.as::onInit()
    override onInit(roomEvents: HabboUserDefinedRoomEvents): void
    {
        super.onInit(roomEvents);
        this.setRootTileInternal(0, 0, false);
        const vector = SpiralUtils.parseSpiralVector([], NeighborhoodFloor.RADIUS);
        this._floor = new NeighborhoodFloor(vector, !this._preferBigMode, () => this.onDrawingChanged());
    }

    // AS3: InNeighborhood.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._inBigMode = this._preferBigMode;
        this._userSourceSelected = def.getBoolean(0);
        this.setRootTileInternal(def.getInt(1), def.getInt(2), true);
        this.setMode('add_tile');
        const vector = SpiralUtils.parseSpiralVector(def.intParams.slice(3), NeighborhoodFloor.RADIUS);
        this._floor = new NeighborhoodFloor(vector, !this._inBigMode, () => this.onDrawingChanged());

        if(!this._inBigMode && !this._floor.smallModeAllowed())
        {
            this._floor.smallMode = false;
            this._inBigMode = true;
        }

        if(this._floorDrawing !== null)
        {
            this._floorDrawing.setFloor(this._floor);
            this._floorDrawing.setMode(this._drawMode);
        }

        this.updateResolutionButtonUI();
        this.roomEventsCtrl.resizeFrame();
    }

    // AS3: InNeighborhood.as::updateResolutionButtonUI()
    private updateResolutionButtonUI(): void
    {
        this._resolutionButton.disabled = !this._floor!.smallModeAllowed();
        this._resolutionButton.assetName = this._inBigMode ? 'reduce_image' : 'enlarge_image';
    }

    // AS3: InNeighborhood.as::onEditEnd()
    override onEditEnd(): void
    {
        super.onEditEnd();
    }

    // AS3: InNeighborhood.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];
        params.push(this._userSourceSelected ? 1 : 0);
        params.push(this._rootTile.x);
        params.push(this._rootTile.y);
        return params.concat(SpiralUtils.createSpiralVector(this._floor!.floorPlanCache, NeighborhoodFloor.RADIUS));
    }

    // AS3: InNeighborhood.as::setMode()
    private setMode(mode: string): void
    {
        this._drawMode = mode;

        if(this._floorDrawing !== null)
        {
            this._floorDrawing.setMode(this._drawMode);
        }

        if(this._drawButtonsByMode === null)
        {
            return;
        }

        for(const drawMode of InNeighborhood.DRAW_MODES)
        {
            const button = this._drawButtonsByMode[drawMode];

            if(button != null)
            {
                button.selected = this._drawMode === drawMode;
            }
        }
    }

    // AS3: InNeighborhood.as::mergedSelections()
    override mergedSelections(): number[][]
    {
        return [[0, 0]];
    }

    // AS3: InNeighborhood.as::mergedSelectionTitle()
    override mergedSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.merged.title.neighborhood';
    }

    // AS3: InNeighborhood.as::setMergedType()
    override setMergedType(_a: number, b: number): void
    {
        this._userSourceSelected = b === WiredInputSourcePicker.USER_SOURCE;
    }

    // AS3: InNeighborhood.as::getMergedType()
    override getMergedType(_id: number): number
    {
        return this._userSourceSelected ? WiredInputSourcePicker.USER_SOURCE : WiredInputSourcePicker.FURNI_SOURCE;
    }

    // AS3: InNeighborhood.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }

    // AS3: InNeighborhood.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }

    // AS3: InNeighborhood.as::updateRootInputText()
    private updateRootInputText(): void
    {
        if(this._rootXInput !== null)
        {
            this._rootXInput.value = this._rootTile.x;
        }

        if(this._rootYInput !== null)
        {
            this._rootYInput.value = this._rootTile.y;
        }
    }

    // AS3: InNeighborhood.as::setRootTileInternal()
    private setRootTileInternal(x: number, y: number, updatePreset: boolean): void
    {
        this._rootTile.x = x;
        this._rootTile.y = y;
        this.updateRootInputText();

        if(updatePreset && this._floorDrawing !== null)
        {
            this._floorDrawing.setRootTile(x, y);
        }
    }

    // AS3: InNeighborhood.as::onRootXChanged()
    private onRootXChanged(x: number): void
    {
        this.setRootTileInternal(x, this._rootTile.y, true);
    }

    // AS3: InNeighborhood.as::onRootYChanged()
    private onRootYChanged(y: number): void
    {
        this.setRootTileInternal(this._rootTile.x, y, true);
    }

    // AS3: InNeighborhood.as::onRootTileChangedFromPreset()
    private onRootTileChangedFromPreset(x: number, y: number): void
    {
        this.setRootTileInternal(x, y, false);
    }

    // AS3: InNeighborhood.as::toggleScreenSize()
    private toggleScreenSize(): void
    {
        this._inBigMode = !this._inBigMode;
        this._preferBigMode = this._inBigMode;
        this._floor!.smallMode = !this._inBigMode;
        this._floorDrawing!.setFloor(this._floor!);
        this.updateResolutionButtonUI();
        this.roomEventsCtrl.resizeFrame();
    }

    // AS3: InNeighborhood.as::onDrawingChanged()
    private onDrawingChanged(): void
    {
        this.updateResolutionButtonUI();
    }

    // AS3: InNeighborhood.as::buildInputs()
    override buildInputs(presetManager: PresetManager, wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const buttonConfigs = [
            new AssetButtonParam('add', '', () => this.setMode(InNeighborhood.DRAW_MODES[0])),
            new AssetButtonParam('remove', '', () => this.setMode(InNeighborhood.DRAW_MODES[1]), true),
            new AssetButtonParam('reference', '', () => this.setMode(InNeighborhood.DRAW_MODES[2])),
            new AssetButtonParam('enlarge_image', '', () => this.toggleScreenSize(), false, true)
        ];
        const buttonRow = presetManager.createAssetButtonRow(buttonConfigs);
        this._floorDrawing = presetManager.createFloorDrawingPreset((x, y) => this.onRootTileChangedFromPreset(x, y));
        const floorEditor = presetManager.createFloorEditorPreset(buttonRow, this._floorDrawing);
        this._resolutionButton = buttonRow.buttons[3];

        if(this._floor !== null)
        {
            this._floorDrawing.setFloor(this._floor);
            this._floorDrawing.setRootTile(this._rootTile.x, this._rootTile.y);
            this._floorDrawing.setMode(this._drawMode);
        }

        this._rootXInput = presetManager.createNamedNumberInput(new NumberInputParam(0, -64, 64, 20), 'x:');
        this._rootYInput = presetManager.createNamedNumberInput(new NumberInputParam(0, -64, 64, 20), 'y:');
        this._rootXInput.onValueChange = (value) => this.onRootXChanged(value);
        this._rootYInput.onValueChange = (value) => this.onRootYChanged(value);
        const xyRow = presetManager.createSimpleListView(false, [this._rootXInput, this._rootYInput]);
        xyRow.spacing = wiredStyle.genericHorizontalSpacing;

        this._drawButtonsByMode = {};
        const createdButtons = buttonRow.buttons;

        for(let i = 0; i < InNeighborhood.DRAW_MODES.length && i < createdButtons.length; i++)
        {
            this._drawButtonsByMode[InNeighborhood.DRAW_MODES[i]] = createdButtons[i];
        }

        this.setMode(this._drawMode);
        const list = presetManager.createSimpleListView(true, [floorEditor, xyRow.alignRight()]);
        const section = presetManager.createSection(this.l('neighborhood_selection'), list);
        builder.addElements(section);
    }

    // AS3: InNeighborhood.as::get widthModifier()
    override get widthModifier(): number
    {
        if(this._inBigMode)
        {
            return 1.7;
        }

        return 1;
    }
}
