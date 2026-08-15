import type {IWindow} from '@core/window/IWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {
    TradeRequirementNode
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/TradeRequirementNode';
import {
    TradeRequirementRule
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/rules/TradeRequirementRule';
import type {HabboUserDefinedRoomEvents} from '../../../../HabboUserDefinedRoomEvents';
import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import type {ButtonPreset} from '../ButtonPreset';
import {WiredUIPreset} from '../WiredUIPreset';
import type {
    TradeRuleEditorPreset,
    TradeRuleEditNodeCallback,
    TradeRuleEditorCallback,
} from './TradeRuleEditorPreset';

/**
 * A list of up to {@link MAX_RULES} alternative trade rules, with an "add another" button pinned at
 * the bottom.
 *
 * **The first rule can never be removed.** Each editor is given a close callback only when it is not
 * the first, so rule 1 has no close button at all rather than one that refuses.
 *
 * Setting an *empty* list still produces one rule: an empty contract is shown as one blank rule to
 * fill in, not as nothing.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/contracts/TradeRuleListEditorPreset.as
 */
export class TradeRuleListEditorPreset extends WiredUIPreset
{
    // AS3: TradeRuleListEditorPreset.as::MAX_RULES
    static readonly MAX_RULES: number = 3;

    // AS3: TradeRuleListEditorPreset.as::_SafeStr_4652 (name derived: the list window)
    private _listWindow: IItemListWindow | null = null;

    // AS3: TradeRuleListEditorPreset.as::_SafeStr_4988 (name derived: the rule editors)
    private _ruleEditors: TradeRuleEditorPreset[] = [];

    // AS3: TradeRuleListEditorPreset.as::_SafeStr_6472 (name derived: the add-more button)
    private _addMoreButton: ButtonPreset | null = null;

    // AS3: TradeRuleListEditorPreset.as::_SafeStr_7310 (name derived: edit-node callback)
    private _onEditNode: TradeRuleEditNodeCallback | null;

    // AS3: TradeRuleListEditorPreset.as::_SafeStr_7275 (name derived: add-node callback)
    private _onAddNode: TradeRuleEditorCallback | null;

    // AS3: TradeRuleListEditorPreset.as::TradeRuleListEditorPreset()
    constructor(
        roomEvents: HabboUserDefinedRoomEvents,
        presetManager: PresetManager,
        wiredStyle: WiredStyle,
        onEditNode: TradeRuleEditNodeCallback | null,
        onAddNode: TradeRuleEditorCallback | null
    )
    {
        super(roomEvents, presetManager, wiredStyle);

        this._onEditNode = onEditNode;
        this._onAddNode = onAddNode;

        this._listWindow = presetManager.createLayout('vertical_list_view') as unknown as IItemListWindow;
        this._listWindow.spacing = wiredStyle.genericVerticalSpacing;

        this._addMoreButton = presetManager.createButton('${wiredcontracts.payment_add_more}', this.onAddMore);
        this._listWindow.addListItem(this._addMoreButton.window);

        this.refreshAddMoreVisibility();
    }

    /**
	 * Replaces every rule. Each is deep-copied before being handed to its editor, so editing never
	 * mutates the contract the caller still holds.
	 */
    // AS3: TradeRuleListEditorPreset.as::set rules()
    set rules(value: TradeRequirementRule[])
    {
        this.removeAllRules();

        let rules = value;

        if(rules.length === 0)
        {
            rules = [new TradeRequirementRule([] as TradeRequirementNode[])];
        }

        let index = 1;

        for(const rule of rules)
        {
            // Rule 1 gets no close callback — see the class note.
            const editor = this._presetManager.createRuleEditorPreset(
                '-',
                this._onEditNode,
                this._onAddNode,
                index === 1 ? null : this.onRuleRemoved
            );

            editor.rule = rule.deepCopy();
            this._ruleEditors.push(editor);

            if(this._listWindow && editor.window)
            {
                this._listWindow.addListItemAt(editor.window, this._listWindow.numListItems - 1);
                editor.resizeToWidth((this._listWindow as unknown as IWindow).width);
            }

            index += 1;
        }

        this.fixNames();
        this.refreshAddMoreVisibility();
    }

    /**
	 * Empty rules are dropped rather than sent — a contract with a blank alternative would otherwise
	 * save a rule that can never be satisfied.
	 */
    // AS3: TradeRuleListEditorPreset.as::finalizeRules()
    finalizeRules(): TradeRequirementRule[]
    {
        const rules: TradeRequirementRule[] = [];

        for(const editor of this._ruleEditors)
        {
            const rule = editor.finalizeRule();

            if(rule.nodes.length > 0) rules.push(rule);
        }

        return rules;
    }

    /**
	 * AS3 tests `numListItems == 1` for the first-rule check here, where {@link rules} tests the
	 * editor index. Both mean "this is the only rule", because the list always holds the add button:
	 * one item = button alone = no rules yet. Transcribed as written rather than unified.
	 */
    // AS3: TradeRuleListEditorPreset.as::onAddMore()
    private onAddMore = (): void =>
    {
        if(!this._listWindow) return;

        const itemCount = this._listWindow.numListItems;
        const editor = this._presetManager.createRuleEditorPreset(
            '',
            this._onEditNode,
            this._onAddNode,
            itemCount === 1 ? null : this.onRuleRemoved
        );

        editor.rule = new TradeRequirementRule([] as TradeRequirementNode[]);
        this._ruleEditors.push(editor);

        if(editor.window)
        {
            this._listWindow.addListItemAt(editor.window, itemCount - 1);
            editor.resizeToWidth((this._listWindow as unknown as IWindow).width);
        }

        this.fixNames();
        this.refreshAddMoreVisibility();
    };

    /**
	 * The button is *disabled*, not hidden — the cap is visible rather than the control vanishing.
	 */
    // AS3: TradeRuleListEditorPreset.as::refreshAddMoreVisibility()
    private refreshAddMoreVisibility(): void
    {
        if(this._addMoreButton)
        {
            this._addMoreButton.disabled = this._ruleEditors.length >= TradeRuleListEditorPreset.MAX_RULES;
        }
    }

    /**
	 * The editor's index in the list is also its index in the window, because the add button sits
	 * last — that is what makes `removeListItemAt(index)` correct without a lookup.
	 */
    // AS3: TradeRuleListEditorPreset.as::onRuleRemoved()
    private onRuleRemoved = (editor: TradeRuleEditorPreset): void =>
    {
        const index = this._ruleEditors.indexOf(editor);

        if(index === -1) return;

        this._listWindow?.removeListItemAt(index);
        this._ruleEditors.splice(index, 1);
        editor.dispose();

        this.fixNames();
        this.refreshAddMoreVisibility();
    };

    // AS3: TradeRuleListEditorPreset.as::removeAllRules()
    private removeAllRules(): void
    {
        // Stops at one: the survivor is the add button.
        while((this._listWindow?.numListItems ?? 0) > 1)
        {
            this._listWindow?.removeListItemAt(0);
        }

        for(const editor of this._ruleEditors)
        {
            editor.dispose();
        }

        this._ruleEditors = [];
        this.refreshAddMoreVisibility();
    }

    /**
	 * Renumbers every title after an add or a remove — the rules are "Rule 1..3" by position, so
	 * deleting the middle one has to renumber the last.
	 */
    // AS3: TradeRuleListEditorPreset.as::fixNames()
    private fixNames(): void
    {
        let index = 0;

        for(const editor of this._ruleEditors)
        {
            index++;
            editor.updateTitle(
                this.localizations.getLocalizationWithParams('wiredcontracts.payment_rule', '', 'i', String(index))
            );
        }
    }

    // AS3: TradeRuleListEditorPreset.as::get window()
    override get window(): IWindow
    {
        return this._listWindow as unknown as IWindow;
    }

    // AS3: TradeRuleListEditorPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);

        if(this._listWindow) (this._listWindow as unknown as IWindow).width = width;

        for(const editor of this._ruleEditors)
        {
            editor.resizeToWidth(width);
        }

        this._addMoreButton?.resizeToWidth(width);
    }

    // AS3: TradeRuleListEditorPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        const presets: WiredUIPreset[] = [...this._ruleEditors];

        if(this._addMoreButton) presets.push(this._addMoreButton);

        return presets;
    }

    // AS3: TradeRuleListEditorPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();

        this._ruleEditors = [];
        this._addMoreButton = null;
        this._onEditNode = null;
        this._onAddNode = null;
        (this._listWindow as unknown as IWindow | null)?.dispose();
        this._listWindow = null;
    }
}
