import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {TradeRequirement} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/TradeRequirement';
import type {TradeRequirementRule} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/rules/TradeRequirementRule';
import {TradeRequirementRulesType} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/rules/TradeRequirementRulesType';
import type {WiredTradingModel} from '../WiredTradingModel';

import type {IWiredTradeRequirementsView} from './IWiredTradeRequirementsView';
import type {WiredTradeRequirementsModel} from './WiredTradeRequirementsModel';
import {OfferingRequirementsView} from './offerings/OfferingRequirementsView';

/**
 * The bubble that shows a wired trade's terms: what you give on the left, what you get on the
 * right, and whether you have met them yet.
 *
 * It does not build a window. The bubble is already in `inventory_trading_wired_xml` and is claimed
 * from it, hidden, and toggled by the button beside it — which is why `dispose()` puts the
 * offerings template back where it found it rather than destroying anything.
 *
 * The two offering columns are pooled and rebuilt on every contract change, because a contract can
 * name any number of rules and terms. `resizeRequirementContainers()` is what makes them the same
 * height as each other: the taller side decides, and the separator between them follows.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/wired_trading/requirements/WiredTradeRequirementsView.as
 */
export class WiredTradeRequirementsView implements IWiredTradeRequirementsView
{
    // AS3: WiredTradeRequirementsView.as::MIN_BORDER_HEIGHT
    private static readonly MIN_BORDER_HEIGHT: number = 80;

    // AS3: WiredTradeRequirementsView.as::BORDER_TOP_BOTTOM_OFFSET
    private static readonly BORDER_TOP_BOTTOM_OFFSET: number = 18;

    // AS3: WiredTradeRequirementsView.as::MINIMALIZED_BORDER_WIDTH
    private static readonly MINIMALIZED_BORDER_WIDTH: number = 122;

    // AS3: WiredTradeRequirementsView.as::NORMAL_BORDER_WIDTH
    private static readonly NORMAL_BORDER_WIDTH: number = 180;

    // AS3: WiredTradeRequirementsView.as::_SafeStr_7888 (the offering-view pool)
    private static readonly OFFERING_VIEW_POOL: OfferingRequirementsView[] = [];

    /**
     * The highlight pulse: 500ms in 16ms steps, fading a border in and out again.
     */
    // AS3: WiredTradeRequirementsView.as::highlight() — its four locals.
    private static readonly HIGHLIGHT_DURATION_MS: number = 500;
    private static readonly HIGHLIGHT_STEP_MS: number = 16;
    private static readonly HIGHLIGHT_MAX_BLEND: number = 0.35;

    // AS3: WiredTradeRequirementsView.as::_disposed
    private _disposed: boolean = false;

    // AS3: WiredTradeRequirementsView.as::_SafeStr_4570 (the requirements model)
    private _model: WiredTradeRequirementsModel | null;

    // AS3: WiredTradeRequirementsView.as::_bubble
    private _bubble: IWindowContainer | null = null;

    // AS3: WiredTradeRequirementsView.as::_offeringsTemplate
    private _offeringsTemplate: IWindowContainer | null = null;

    // AS3: WiredTradeRequirementsView.as::_SafeStr_4727 (the contract being shown)
    private _requirement: TradeRequirement | null = null;

    // AS3: WiredTradeRequirementsView.as::_SafeStr_5126 (the "you give" column)
    private _youGiveView: OfferingRequirementsView | null = null;

    // AS3: WiredTradeRequirementsView.as::_SafeStr_4950 (the "you get" column)
    private _youGetView: OfferingRequirementsView | null = null;

    // AS3: WiredTradeRequirementsView.as::_offeringBorderMargins
    private _offeringBorderMargins: number = 0;

    // AS3: WiredTradeRequirementsView.as::_transitionTimer
    // AS3 holds a `Timer(16, steps)`; this is that interval, with `_highlightStep` counting for it.
    private _transitionTimer: ReturnType<typeof setInterval> | null = null;

    // TS-only: AS3 reads `Timer.currentCount`; a setInterval has none, so the tick is counted here.
    private _highlightStep: number = 0;

    // AS3: WiredTradeRequirementsView.as::WiredTradeRequirementsView()
    constructor(model: WiredTradeRequirementsModel)
    {
        this._model = model;

        this.claimRequirementsBubble();

        this.requirementsButton?.addEventListener(WindowMouseEvent.CLICK, this.onRequirementsClicked);

        const template = this.youGiveContainer?.getChildByName('offering_requirements_template') as IWindowContainer | null;

        this._offeringsTemplate = template;

        if(template !== null)
        {
            this.initializeStretchingWithParent(template, false);
            this._offeringBorderMargins = template.height - (template.findChildByName('requirements_definition')?.height ?? 0);
            (template.parent as IWindowContainer | null)?.removeChild(template);
        }
    }

    // AS3: WiredTradeRequirementsView.as::claimRequirementView()
    private static claimRequirementView(template: IWindowContainer): OfferingRequirementsView
    {
        return WiredTradeRequirementsView.OFFERING_VIEW_POOL.pop() ?? new OfferingRequirementsView(template);
    }

    // AS3: WiredTradeRequirementsView.as::releaseRequirementView()
    private static releaseRequirementView(view: OfferingRequirementsView): void
    {
        view.recycle();
        WiredTradeRequirementsView.OFFERING_VIEW_POOL.push(view);
    }

    /**
     * Not the standard cubic ease its name suggests: it is a downward parabola shifted so it rises,
     * peaks before the end and falls back, which is what makes the highlight *pulse* rather than
     * fade in. Transcribed as found, name included.
     */
    // AS3: WiredTradeRequirementsView.as::easeInOutCubic()
    private static easeInOutCubic(time: number, start: number, change: number, duration: number): number
    {
        const t = time / duration;
        const shaped = -(t * 1.75 - 0.7) * (t * 1.75 - 0.7) + 1;

        return start + change * shaped;
    }

    // AS3: WiredTradeRequirementsView.as::claimRequirementsBubble()
    private claimRequirementsBubble(): void
    {
        const container = this.tradingModel?.getWindowContainer() ?? null;

        this._bubble = (container?.findChildByName('trade_requirements_bubble') ?? null) as IWindowContainer | null;

        if(this._bubble !== null) this._bubble.visible = false;

        this.recenter();
    }

    // AS3: WiredTradeRequirementsView.as::onRequirementsClicked()
    private onRequirementsClicked = (_event: WindowMouseEvent): void =>
    {
        this.toggleVisibility();
    };

    // AS3: WiredTradeRequirementsView.as::toggleVisibility()
    private toggleVisibility(): void
    {
        if(this._bubble !== null) this._bubble.visible = !this._bubble.visible;
    }

    // AS3: WiredTradeRequirementsView.as::get requirementsButton()
    private get requirementsButton(): IWindow | null
    {
        return this._model?.tradingModel?.tradingView?.requirementsButton ?? null;
    }

    /**
     * Parks the bubble beside its button, vertically centred on it. Re-run after every resize,
     * because the bubble's height changes with the contract.
     */
    // AS3: WiredTradeRequirementsView.as::recenter()
    private recenter(): void
    {
        const button = this.requirementsButton;
        const bubble = this._bubble;

        if(button === null || bubble === null) return;

        bubble.x = button.x + button.width + 4;
        bubble.y = button.y + button.height / 2 - bubble.height / 2;
    }

    // AS3: WiredTradeRequirementsView.as::clear()
    private clear(): void
    {
        if(this._youGiveView !== null)
        {
            this.youGiveContainer?.removeChild(this._youGiveView.window);
            WiredTradeRequirementsView.releaseRequirementView(this._youGiveView);
            this._youGiveView = null;
        }

        if(this._youGetView !== null)
        {
            this.youGetContainer?.removeChild(this._youGetView.window);
            WiredTradeRequirementsView.releaseRequirementView(this._youGetView);
            this._youGetView = null;
        }

        this._requirement = null;
    }

    /**
     * A new contract to show.
     *
     * The "you get" column is hidden entirely for a payment-only contract that says nothing about
     * what comes back — there is nothing to put in it, and the bubble is narrower without it. When
     * it *is* shown for a payment-only contract, the disclaimer below explains that the "receiving"
     * side is the other player's promise rather than the system's.
     */
    // AS3: WiredTradeRequirementsView.as::requirementsUpdated()
    requirementsUpdated(requirement: TradeRequirement, showImmediate: boolean): void
    {
        this.clear();

        this._requirement = requirement;

        const isPaymentOnly = requirement.isPaymentOnly();
        const tradeType = this._model?.tradingModel?.tradeTypeLocalization ?? '';
        const title = this.bubbleTitle;

        if(title !== null)
        {
            title.text = this.localization?.getLocalizationWithParams(
                'inventory.wired_trading.requirements.title', '', 'type', tradeType
            ) ?? '';
        }

        const showYouGet = !isPaymentOnly || (requirement.youGetText != null && requirement.youGetText.length > 0);
        const separator = this.offeringContainersSeparator;
        const youGetContainer = this.youGetContainer;
        const youGiveContainer = this.youGiveContainer;

        if(separator !== null) separator.visible = showYouGet;
        if(youGetContainer !== null) youGetContainer.visible = showYouGet;

        if(this._offeringsTemplate !== null && youGiveContainer !== null)
        {
            this._youGiveView = WiredTradeRequirementsView.claimRequirementView(this._offeringsTemplate);
            this._youGiveView.initialize(
                this._model as WiredTradeRequirementsModel,
                requirement.type,
                requirement.rules?.youGiveRule ?? null,
                null,
                OfferingRequirementsView.TYPE_GIVE
            );
            youGiveContainer.addChild(this._youGiveView.window);
            this.initializeStretchingWithParent(this._youGiveView.window);
        }

        if(showYouGet && this._offeringsTemplate !== null && youGetContainer !== null)
        {
            // AS3 wraps the single "you get" rule in a list, because the column below takes a list
            // either way — the give side really can have several, the get side never does.
            const youGetRules: TradeRequirementRule[] = [];
            const youGetRule = requirement.rules?.youGetRule ?? null;

            if(youGetRule !== null) youGetRules.push(youGetRule);

            this._youGetView = WiredTradeRequirementsView.claimRequirementView(this._offeringsTemplate);
            this._youGetView.initialize(
                this._model as WiredTradeRequirementsModel,
                requirement.type,
                youGetRules,
                requirement.youGetText,
                OfferingRequirementsView.TYPE_RECEIVE
            );
            youGetContainer.addChild(this._youGetView.window);
            this.initializeStretchingWithParent(this._youGetView.window);
        }

        this.requirementsStateUpdated();

        const disclaimer = this.disclaimerTextHtml;

        if(disclaimer !== null)
        {
            disclaimer.visible = isPaymentOnly && showYouGet;

            if(disclaimer.visible)
            {
                disclaimer.text = this.localization?.getLocalizationWithParams(
                    'inventory.wired_trading.requirements.receive_text_disclaimer',
                    '',
                    'you_get_name',
                    this.localization.getLocalization('inventory.wired_trading.requirements.receiving')
                ) ?? '';
                WiredTradeRequirementsView.resizeHtml(disclaimer);
            }
        }

        if(this._bubble !== null) this._bubble.visible = showImmediate;
    }

    /**
     * Makes both columns the same width and the same height.
     *
     * The narrow layout is only taken when *both* sides can live with it; one long rule on either
     * side widens the pair.
     */
    // AS3: WiredTradeRequirementsView.as::resizeRequirementContainers()
    private resizeRequirementContainers(): void
    {
        const youGiveContainer = this.youGiveContainer;
        const youGetContainer = this.youGetContainer;
        const separator = this.offeringContainersSeparator;

        if(this._youGiveView === null || youGiveContainer === null || youGetContainer === null) return;

        let width = WiredTradeRequirementsView.NORMAL_BORDER_WIDTH;

        if(youGiveContainer.visible
            && youGetContainer.visible
            && this._youGetView !== null
            && this._youGiveView.canMinimalizeWidth
            && this._youGetView.canMinimalizeWidth)
        {
            width = WiredTradeRequirementsView.MINIMALIZED_BORDER_WIDTH;
        }

        youGiveContainer.width = width;
        youGetContainer.width = width;

        let height = this._youGiveView.minBorderHeight;

        if(this._youGetView !== null && this._youGetView.minBorderHeight > height)
        {
            height = this._youGetView.minBorderHeight;
        }

        height += 2 * WiredTradeRequirementsView.BORDER_TOP_BOTTOM_OFFSET;

        if(height < WiredTradeRequirementsView.MIN_BORDER_HEIGHT)
        {
            height = WiredTradeRequirementsView.MIN_BORDER_HEIGHT;
        }

        if(separator !== null) separator.height = height;

        height += this._offeringBorderMargins;
        youGiveContainer.height = height;
        youGetContainer.height = height;

        this._youGiveView.centerActiveElement();
        this._youGetView?.centerActiveElement();
    }

    /**
     * Repaints the "met / not met" line as the offered items change.
     *
     * Three shapes, in AS3's order of precedence: a *multi* contract always reports the multiplier
     * and how many times over it is satisfied, whether or not it is met; an *auto* contract that is
     * met and satisfied more than once reports the count; everything else is a plain met/not-met.
     */
    // AS3: WiredTradeRequirementsView.as::requirementsStateUpdated()
    requirementsStateUpdated(): void
    {
        const requirement = this._requirement;

        if(requirement === null) return;

        const canAccept = this._model?.tradingModel?.canAccept ?? false;
        const extra = this._model?.tradingModel?.extra ?? 0;
        const metHtml = this.requirementsMetHtml;
        const rules = requirement.rules;

        if(metHtml !== null)
        {
            if(rules !== null && rules.type === TradeRequirementRulesType.TYPE_2)
            {
                metHtml.text = this.localization?.getLocalizationWithParams(
                    'inventory.wired_trading.requirements.indicator.multi',
                    '',
                    'times', String(rules.multiplier),
                    'amount', String(extra)
                ) ?? '';
            }
            else if(canAccept)
            {
                if(rules !== null && rules.type === TradeRequirementRulesType.TYPE_1 && extra > 1)
                {
                    metHtml.text = this.localization?.getLocalizationWithParams(
                        'inventory.wired_trading.requirements.indicator.met_numbered', '', 'amount', String(extra)
                    ) ?? '';
                }
                else
                {
                    metHtml.text = this.localization?.getLocalization('inventory.wired_trading.requirements.indicator.met') ?? '';
                }
            }
            else
            {
                metHtml.text = this.localization?.getLocalization('inventory.wired_trading.requirements.indicator.not_met') ?? '';
            }

            WiredTradeRequirementsView.resizeHtml(metHtml);
        }

        const metIcon = this.requirementsMetIcon;

        if(metIcon !== null) metIcon.assetUri = canAccept ? 'common_check_mark' : 'common_cross_mark';

        const additional = this.additionalTextHtml;

        if(additional !== null)
        {
            additional.visible = rules !== null && rules.type === TradeRequirementRulesType.TYPE_1;

            if(additional.visible && rules !== null)
            {
                const key = requirement.isPaymentOnly()
                    ? 'inventory.wired_trading.requirements.auto_mode_hint_payment'
                    : 'inventory.wired_trading.requirements.auto_mode_hint_trade';

                additional.text = this.localization?.getLocalizationWithParams(
                    key, '', 'amount', String(rules.autoMultiplierMax)
                ) ?? '';
                WiredTradeRequirementsView.resizeHtml(additional);
            }
        }

        this.resizeRequirementContainers();
        this.recenter();
    }

    /**
     * 15px a line plus 2. An HTML text window does not resize itself, and the bubble's layout
     * depends on knowing how tall each block ended up.
     */
    // AS3: WiredTradeRequirementsView.as::resizeHtml()
    private static resizeHtml(window: ITextWindow): void
    {
        window.height = window.numLines * 15 + 2;
    }

    /**
     * Param flags 128 and 2048 are the two "follow my parent's size" bits. They are set *and*
     * cleared here: the offerings template is deliberately detached from its parent's size before
     * it is lifted out as a template.
     */
    // AS3: WiredTradeRequirementsView.as::initializeStretchingWithParent()
    private initializeStretchingWithParent(window: IWindowContainer, stretch: boolean = true): void
    {
        if(stretch && window.parent !== null)
        {
            window.width = window.parent.width;
            window.height = window.parent.height;
        }

        window.setParamFlag(128, stretch);
        window.setParamFlag(2048, stretch);
    }

    // AS3: WiredTradeRequirementsView.as::get tradingModel()
    get tradingModel(): WiredTradingModel | null
    {
        return this._model?.tradingModel ?? null;
    }

    // AS3: WiredTradeRequirementsView.as::get localization()
    private get localization(): IHabboLocalizationManager | null
    {
        return this.tradingModel?.localization ?? null;
    }

    // AS3: WiredTradeRequirementsView.as::highlightRefresh()
    highlightRefresh(): void
    {
        this.highlight();
    }

    /**
     * Pulses the bubble's border to say "this just changed".
     *
     * A pulse already running is restarted from zero rather than left alone, so two changes in
     * quick succession read as two pulses.
     */
    // AS3: WiredTradeRequirementsView.as::highlight()
    private highlight(): void
    {
        const border = this.highlightBorder;

        if(border === null) return;

        if(this._transitionTimer !== null)
        {
            clearInterval(this._transitionTimer);
            this._transitionTimer = null;
        }

        const steps = WiredTradeRequirementsView.HIGHLIGHT_DURATION_MS / WiredTradeRequirementsView.HIGHLIGHT_STEP_MS;

        border.visible = true;
        border.blend = 0;
        this._highlightStep = 0;

        this._transitionTimer = setInterval(() =>
        {
            if(this._disposed) return;

            this._highlightStep += 1;

            border.blend = WiredTradeRequirementsView.easeInOutCubic(
                this._highlightStep, 0, WiredTradeRequirementsView.HIGHLIGHT_MAX_BLEND, steps
            );

            if(this._highlightStep < steps) return;

            border.visible = false;

            if(this._transitionTimer !== null)
            {
                clearInterval(this._transitionTimer);
                this._transitionTimer = null;
            }
        }, WiredTradeRequirementsView.HIGHLIGHT_STEP_MS);
    }

    // AS3: WiredTradeRequirementsView.as::get bubbleTitle()
    private get bubbleTitle(): ITextWindow | null
    {
        return (this._bubble?.findChildByName('bubble_title') ?? null) as ITextWindow | null;
    }

    // AS3: WiredTradeRequirementsView.as::get highlightBorder()
    // AS3 types this `_SafeCls_2254` (IBorderWindow); the port has no such interface, and `blend`
    // is on every window.
    private get highlightBorder(): IWindow | null
    {
        return this._bubble?.findChildByName('highlight_border') ?? null;
    }

    // AS3: WiredTradeRequirementsView.as::get youGiveContainer()
    private get youGiveContainer(): IWindowContainer | null
    {
        return (this._bubble?.findChildByName('you_give_container') ?? null) as IWindowContainer | null;
    }

    // AS3: WiredTradeRequirementsView.as::get offeringContainersSeparator()
    private get offeringContainersSeparator(): IWindow | null
    {
        return this._bubble?.findChildByName('offering_containers_separator') ?? null;
    }

    // AS3: WiredTradeRequirementsView.as::get youGetContainer()
    private get youGetContainer(): IWindowContainer | null
    {
        return (this._bubble?.findChildByName('you_get_container') ?? null) as IWindowContainer | null;
    }

    // AS3: WiredTradeRequirementsView.as::get requirementsMetContainer()
    // Declared and never read, in AS3 too.
    private get requirementsMetContainer(): IWindowContainer | null
    {
        return (this._bubble?.findChildByName('requirements_met_container') ?? null) as IWindowContainer | null;
    }

    // AS3: WiredTradeRequirementsView.as::get requirementsMetHtml()
    private get requirementsMetHtml(): ITextWindow | null
    {
        return (this._bubble?.findChildByName('req_met_text') ?? null) as ITextWindow | null;
    }

    // AS3: WiredTradeRequirementsView.as::get requirementsMetIcon()
    private get requirementsMetIcon(): IStaticBitmapWrapperWindow | null
    {
        return (this._bubble?.findChildByName('req_met_icon') ?? null) as IStaticBitmapWrapperWindow | null;
    }

    // AS3: WiredTradeRequirementsView.as::get additionalTextHtml()
    private get additionalTextHtml(): ITextWindow | null
    {
        return (this._bubble?.findChildByName('additional_text') ?? null) as ITextWindow | null;
    }

    // AS3: WiredTradeRequirementsView.as::get disclaimerTextHtml()
    private get disclaimerTextHtml(): ITextWindow | null
    {
        return (this._bubble?.findChildByName('disclaimer_text') ?? null) as ITextWindow | null;
    }

    // AS3: WiredTradeRequirementsView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: WiredTradeRequirementsView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.clear();

        if(this._transitionTimer !== null)
        {
            clearInterval(this._transitionTimer);
            this._transitionTimer = null;
        }

        // The template goes back into the container it was lifted out of: the bubble belongs to the
        // trading window's layout, not to this view, and the next trade claims it again.
        if(this._offeringsTemplate !== null) this.youGiveContainer?.addChild(this._offeringsTemplate);

        this._offeringsTemplate = null;
        this._bubble = null;
        this._model = null;
        this._requirement = null;
        this._offeringBorderMargins = 0;
        this._disposed = true;
    }
}
