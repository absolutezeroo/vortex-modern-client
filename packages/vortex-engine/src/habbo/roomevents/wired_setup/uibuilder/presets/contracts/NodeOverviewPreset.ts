import type {
    TradeRequirementNode
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/TradeRequirementNode';
import type {HabboUserDefinedRoomEvents} from '../../../../HabboUserDefinedRoomEvents';
import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import {TradeRuleEditorPreset} from './TradeRuleEditorPreset';
import type {TradeRuleNodeView} from './TradeRuleNodeView';

/** TS-only: AS3 passes this as a bare `Function`. */
export type NodeOverviewClickCallback = (node: TradeRequirementNode | null) => void;

/**
 * A read-only view of a rule's requirements — the reward-notification window's list of what was
 * won.
 *
 * It is a {@link TradeRuleEditorPreset} with the editing taken out rather than a separate class:
 * the add button is **destroyed** in the constructor (detached, then disposed, not merely hidden),
 * the close region is hidden, the per-chip close buttons are suppressed, and
 * `updateCloseButtonVisibility()` is overridden to do nothing so hovering can never bring the rule's
 * own close button back.
 *
 * Clicking a chip still fires, but through `param5` rather than the editor's edit-node callback —
 * that is the one interaction left.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/contracts/NodeOverviewPreset.as
 */
export class NodeOverviewPreset extends TradeRuleEditorPreset
{
    // AS3: NodeOverviewPreset.as::_SafeStr_8411 (name derived: the chip-click callback)
    private _onNodeClicked: NodeOverviewClickCallback | null = null;

    // AS3: NodeOverviewPreset.as::NodeOverviewPreset()
    constructor(
        roomEvents: HabboUserDefinedRoomEvents,
        presetManager: PresetManager,
        wiredStyle: WiredStyle,
        title: string,
        onNodeClicked: NodeOverviewClickCallback | null = null
    )
    {
        // The base's edit-node and add-more callbacks are both null: this view has neither.
        super(roomEvents, presetManager, wiredStyle, title, null, null);

        // AS3 detaches the button before disposing it. Disposing alone would leave the grid holding
        // a dead child, which `rebuildGridStructure()` would then count.
        const addMore = this.addMoreButton;

        if(addMore)
        {
            addMore.parent = null;
            addMore.dispose();
        }

        const closeRegion = this.closeRegion;

        if(closeRegion) closeRegion.visible = false;

        this._onNodeClicked = onNodeClicked;
    }

    /**
	 * False here: the overview wraps over as many lines as the reward needs, where an editable rule
	 * is capped at one.
	 */
    // AS3: NodeOverviewPreset.as::get isOneLineMode()
    protected override get isOneLineMode(): boolean
    {
        return false;
    }

    // AS3: NodeOverviewPreset.as::get showNodeCloseButton()
    protected override get showNodeCloseButton(): boolean
    {
        return false;
    }

    /**
	 * Deliberately empty — the base would re-show the rule's close region on hover, and this view
	 * disposed the means to act on it.
	 */
    // AS3: NodeOverviewPreset.as::updateCloseButtonVisibility()
    protected override updateCloseButtonVisibility(): void
    {
    }

    /**
	 * The base opens a node editor; this hands the node itself to the caller and does nothing else.
	 */
    // AS3: NodeOverviewPreset.as::editNode()
    override editNode(view: TradeRuleNodeView): void
    {
        this._onNodeClicked?.(view.node);
    }
}
