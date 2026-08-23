import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import {TradeRequirement} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/TradeRequirement';
import type {TradeRequirementRule} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/rules/TradeRequirementRule';

import type {WiredTradeRequirementsModel} from '../WiredTradeRequirementsModel';
import {OfferingRuleView} from './OfferingRuleView';

/**
 * One side of the contract — what you give, or what you get.
 *
 * Exactly one of its four presentations is shown, and `_activeElement` remembers which so the
 * parent can measure and centre it: the rules list, or one of the three "any furni / any coins /
 * anything" captions, or the contract's own free text. The three captions are only reachable on the
 * *give* side and only for a non-custom requirement — a custom contract always spells its terms out
 * as rules.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/wired_trading/requirements/offerings/OfferingRequirementsView.as
 */
export class OfferingRequirementsView implements IDisposable
{
    // AS3: OfferingRequirementsView.as::TYPE_GIVE
    public static readonly TYPE_GIVE: number = 0;

    // AS3: OfferingRequirementsView.as::TYPE_RECEIVE
    public static readonly TYPE_RECEIVE: number = 1;

    // AS3: OfferingRequirementsView.as::RULE_VIEW_POOL
    public static readonly RULE_VIEW_POOL: OfferingRuleView[] = [];

    /**
     * The widest a free-text caption may be and still let the bubble shrink to its narrow layout.
     */
    // AS3: OfferingRequirementsView.as::initializeUI() — the `<= 100` test.
    private static readonly MINIMALIZABLE_TEXT_WIDTH: number = 100;

    // AS3: OfferingRequirementsView.as::_disposed
    private _disposed: boolean = false;

    // AS3: OfferingRequirementsView.as::_SafeStr_5281 (the requirements model)
    private _model: WiredTradeRequirementsModel | null = null;

    // AS3: OfferingRequirementsView.as::_window
    private _window: IWindowContainer | null;

    // AS3: OfferingRequirementsView.as::_SafeStr_5582 (the requirement's type)
    private _requirementType: number = 0;

    // AS3: OfferingRequirementsView.as::_SafeStr_6319 (TYPE_GIVE or TYPE_RECEIVE)
    private _side: number = 0;

    // AS3: OfferingRequirementsView.as::_SafeStr_6804 (the rule template, lifted out of the clone)
    private _ruleTemplate: IWindowContainer | null;

    // AS3: OfferingRequirementsView.as::_rules
    private _rules: TradeRequirementRule[] | null = null;

    // AS3: OfferingRequirementsView.as::_text
    private _text: string | null = null;

    // AS3: OfferingRequirementsView.as::_canMinimalizeWidth
    private _canMinimalizeWidth: boolean = false;

    // AS3: OfferingRequirementsView.as::_SafeStr_4942 (whichever of the four is on screen)
    private _activeElement: IWindow | null = null;

    // AS3: OfferingRequirementsView.as::_SafeStr_5228 (the rule views)
    private _ruleViews: OfferingRuleView[] | null = null;

    // AS3: OfferingRequirementsView.as::OfferingRequirementsView()
    constructor(template: IWindowContainer)
    {
        this._window = template.clone() as unknown as IWindowContainer;
        this._ruleTemplate = this.rulesList?.removeListItemAt(0) as unknown as IWindowContainer | null;
    }

    // AS3: OfferingRequirementsView.as::claimRuleView()
    private static claimRuleView(template: IWindowContainer): OfferingRuleView
    {
        return OfferingRequirementsView.RULE_VIEW_POOL.pop() ?? new OfferingRuleView(template);
    }

    // AS3: OfferingRequirementsView.as::releaseRuleView()
    private static releaseRuleView(view: OfferingRuleView): void
    {
        view.recycle();
        OfferingRequirementsView.RULE_VIEW_POOL.push(view);
    }

    // AS3: OfferingRequirementsView.as::initialize()
    initialize(
        model: WiredTradeRequirementsModel,
        requirementType: number,
        rules: TradeRequirementRule[] | null,
        text: string | null,
        side: number
    ): void
    {
        this._model = model;
        this._requirementType = requirementType;
        this._rules = rules;
        this._text = text;
        this._side = side;
        this._ruleViews = [];

        if(rules !== null && this._ruleTemplate !== null)
        {
            for(let i = 0; i < rules.length; i++)
            {
                const view = OfferingRequirementsView.claimRuleView(this._ruleTemplate);

                view.initialize(model, this, rules[i], i);
                this._ruleViews.push(view);
            }
        }

        this.initializeUI();
    }

    // AS3: OfferingRequirementsView.as::recycle()
    recycle(): void
    {
        this._model = null;
        this._requirementType = 0;
        this._rules = null;
        this._text = null;
        this._side = 0;

        for(const view of this._ruleViews ?? [])
        {
            const parent = view.window.parent as IWindowContainer | null;

            if(parent !== null) parent.removeChild(view.window);

            OfferingRequirementsView.releaseRuleView(view);
        }

        this._ruleViews = null;
        this.rulesList?.removeListItems();
    }

    /**
     * Everything starts hidden and exactly one thing is turned back on.
     *
     * `canMinimalizeWidth` is what lets the parent bubble use its narrow layout, and it is only
     * true when nothing needs the room: every rule is a single term, or the free text is short.
     */
    // AS3: OfferingRequirementsView.as::initializeUI()
    private initializeUI(): void
    {
        const rulesList = this.rulesList;
        const customText = this.customText;
        const anyAllText = this.anyAllText;
        const anyCoinsText = this.anyCoinsText;
        const anyFurniText = this.anyFurniText;

        if(rulesList !== null) rulesList.visible = false;
        if(customText !== null) customText.visible = false;
        if(anyAllText !== null) anyAllText.visible = false;
        if(anyCoinsText !== null) anyCoinsText.visible = false;
        if(anyFurniText !== null) anyFurniText.visible = false;

        this._canMinimalizeWidth = false;
        this._activeElement = null;

        if(this._requirementType !== TradeRequirement.TYPE_CUSTOM && this._side === OfferingRequirementsView.TYPE_GIVE)
        {
            if(this._requirementType === TradeRequirement.TYPE_CREDIT_FURNI_ONLY && anyCoinsText !== null)
            {
                anyCoinsText.visible = true;
                this._activeElement = anyCoinsText as unknown as IWindow;
            }
            else if(this._requirementType === TradeRequirement.TYPE_NORMAL_FURNI_ONLY && anyFurniText !== null)
            {
                anyFurniText.visible = true;
                this._activeElement = anyFurniText as unknown as IWindow;
            }
            else if(this._requirementType === TradeRequirement.TYPE_ANY_FURNI && anyAllText !== null)
            {
                anyAllText.visible = true;
                this._activeElement = anyAllText as unknown as IWindow;
            }
        }
        else
        {
            if(this._rules !== null && this._rules.length > 0 && rulesList !== null)
            {
                rulesList.visible = true;
                this._activeElement = rulesList as unknown as IWindow;

                for(const view of this._ruleViews ?? []) rulesList.addListItem(view.window);

                this._canMinimalizeWidth = true;

                for(const rule of this._rules)
                {
                    if(rule.nodes.length !== 1)
                    {
                        this._canMinimalizeWidth = false;
                        break;
                    }
                }
            }

            if(rulesList?.visible !== true && this._text !== null && this._text.length > 0 && customText !== null)
            {
                customText.visible = true;
                customText.text = this._text;
                this._activeElement = customText as unknown as IWindow;

                if(customText.textWidth <= OfferingRequirementsView.MINIMALIZABLE_TEXT_WIDTH)
                {
                    this._canMinimalizeWidth = true;
                }
            }
        }

        const title = this.title;

        if(title !== null)
        {
            title.text = this._side === OfferingRequirementsView.TYPE_GIVE
                ? this.localization?.getLocalization('inventory.wired_trading.requirements.offering') ?? ''
                : this.localization?.getLocalization('inventory.wired_trading.requirements.receiving') ?? '';
        }

        this.centerActiveElement();
    }

    // AS3: OfferingRequirementsView.as::get canMinimalizeWidth()
    get canMinimalizeWidth(): boolean
    {
        return this._canMinimalizeWidth;
    }

    // AS3: OfferingRequirementsView.as::get minBorderHeight()
    get minBorderHeight(): number
    {
        return this._activeElement?.height ?? 0;
    }

    /**
     * Vertically centres whatever is showing, and horizontally centres the rules too — but only for
     * a *custom* requirement with exactly one rule. More than one rule stacks left-aligned so the
     * "or"s line up down the side.
     */
    // AS3: OfferingRequirementsView.as::centerActiveElement()
    centerActiveElement(): void
    {
        const active = this._activeElement;
        const border = this.requirementsBorder;

        if(active === null || border === null) return;

        active.y = border.height / 2 - active.height / 2;

        if(this._requirementType === TradeRequirement.TYPE_CUSTOM
            && this._ruleViews !== null
            && this._ruleViews.length === 1)
        {
            this._ruleViews[0].center(border.width - (this.rulesList?.x ?? 0) * 2);
        }
    }

    // AS3: OfferingRequirementsView.as::get window()
    get window(): IWindowContainer
    {
        return this._window as IWindowContainer;
    }

    // AS3: OfferingRequirementsView.as::get localization()
    get localization(): IHabboLocalizationManager | null
    {
        return this._model?.tradingModel?.localization ?? null;
    }

    // AS3: OfferingRequirementsView.as::get tradeRequirementsModel()
    get tradeRequirementsModel(): WiredTradeRequirementsModel | null
    {
        return this._model;
    }

    // AS3: OfferingRequirementsView.as::get requirementTemplate()
    get requirementTemplate(): IWindowContainer | null
    {
        return this._ruleTemplate;
    }

    // AS3: OfferingRequirementsView.as::get title()
    private get title(): ITextWindow | null
    {
        return (this._window?.findChildByName('offerings_title') ?? null) as ITextWindow | null;
    }

    // AS3: OfferingRequirementsView.as::get requirementsBorder()
    // AS3 types this `_SafeCls_2254` (IBorderWindow); the port has no such interface, and nothing
    // here needs more than the window's own size.
    private get requirementsBorder(): IWindow | null
    {
        return this._window?.findChildByName('requirements_definition') ?? null;
    }

    // AS3: OfferingRequirementsView.as::get rulesList()
    private get rulesList(): IItemListWindow | null
    {
        return (this._window?.findChildByName('rules_list') ?? null) as IItemListWindow | null;
    }

    // AS3: OfferingRequirementsView.as::get customText()
    private get customText(): ITextWindow | null
    {
        return (this._window?.findChildByName('custom_text') ?? null) as ITextWindow | null;
    }

    // AS3: OfferingRequirementsView.as::get anyFurniText()
    private get anyFurniText(): ITextWindow | null
    {
        return (this._window?.findChildByName('any_furni_text') ?? null) as ITextWindow | null;
    }

    // AS3: OfferingRequirementsView.as::get anyCoinsText()
    private get anyCoinsText(): ITextWindow | null
    {
        return (this._window?.findChildByName('any_coins_text') ?? null) as ITextWindow | null;
    }

    // AS3: OfferingRequirementsView.as::get anyAllText()
    private get anyAllText(): ITextWindow | null
    {
        return (this._window?.findChildByName('any_all_text') ?? null) as ITextWindow | null;
    }

    // AS3: OfferingRequirementsView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: OfferingRequirementsView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.rulesList?.removeListItems();

        for(const view of this._ruleViews ?? []) OfferingRequirementsView.releaseRuleView(view);

        this._ruleViews = null;
        this._model = null;
        this._window?.dispose();
        this._window = null;
        this._requirementType = 0;
        this._ruleTemplate?.dispose();
        this._ruleTemplate = null;
        this._rules = null;
        this._text = null;
        this._side = 0;
        this._disposed = true;
    }
}
