/**
 * Badge data model
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/Badge.as
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';

import type {IBadgeSelectionTarget} from './IBadgeSelectionTarget';

export class Badge
{
    /**
	 * The one `inventory_thumb_xml` window every badge thumbnail is cloned from. AS3 keeps it
	 * as a static on this class and `BadgesModel` fills it in; same here.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/Badge.as::_template
    // Derived name: obfuscated in the primary tree.
    public static template: IWindowContainer | null = null;
    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::Badge()
    // AS3 takes the owning model first and `(ownerCount, badgeRarityId)` last; the model is not
    // threaded here because this port's `Badge` has no view half to call back into.
    constructor(
        badgeId: string,
        name: string,
        description: string,
        isUnseen: boolean = false,
        ownerCount: number = 0,
        badgeRarityId: number = 0
    )
    {
        this._badgeId = badgeId;
        this._name = name;
        this._description = description;
        this._isUnseen = isUnseen;
        this._ownerCount = ownerCount;
        this._badgeRarityId = badgeRarityId;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/inventory/badges/Badge.as::_badgeId
    private _badgeId: string;

    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::get badgeId()
    get badgeId(): string
    {
        return this._badgeId;
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::_name
    private _name: string;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/Badge.as::get badgeName()
    get name(): string
    {
        return this._name;
    }

    private _description: string;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/Badge.as::get badgeDescription()
    get description(): string
    {
        return this._description;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/inventory/badges/Badge.as::_isInUse
    private _isInUse: boolean = false;

    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::get isInUse()
    get isInUse(): boolean
    {
        return this._isInUse;
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::set isInUse()
    set isInUse(value: boolean)
    {
        this._isInUse = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/inventory/badges/Badge.as::_isSelected
    private _isSelected: boolean = false;

    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::get isSelected()
    get isSelected(): boolean
    {
        return this._isSelected;
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::set isSelected()
    set isSelected(value: boolean)
    {
        this._isSelected = value;

        if(this._backgroundColor === null || this._window === null) return;

        // AS3's two literals: a lilac tint while the badge is unseen, plain grey once seen.
        this._backgroundColor.color = this._isUnseen ? 10275685 : 13421772;

        const outline = this._window.findChildByName('outline');

        if(outline !== null) outline.visible = value;
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::_isUnseen
    private _isUnseen: boolean = false;

    get isUnseen(): boolean
    {
        return this._isUnseen;
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::set isUnseen()
    set isUnseen(value: boolean)
    {
        if(this._isUnseen === value) return;

        this._isUnseen = value;
        // Re-applies the tint above through the selected setter, as AS3 does.
        this.isSelected = this._isSelected;
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::_ownerCount
    private _ownerCount: number = 0;

    /**
	 * How many players hold this badge
	 */
    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::get ownerCount()
    get ownerCount(): number
    {
        return this._ownerCount;
    }

    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::_badgeRarityId
    private _badgeRarityId: number = 0;

    /**
	 * The badge's rarity bracket
	 */
    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::get badgeRarityId()
    get badgeRarityId(): number
    {
        return this._badgeRarityId;
    }

    /**
	 * Refresh the two server-owned metadata fields
	 *
	 * Both arrive on every badge message, and both can move after the badge is first held — the
	 * owner count as other players earn it, the rarity bracket as that count crosses a threshold.
	 */
    // AS3: .../src/com/sulake/habbo/inventory/badges/Badge.as::updateMetadata()
    updateMetadata(ownerCount: number, badgeRarityId: number): void
    {
        this._ownerCount = ownerCount;
        this._badgeRarityId = badgeRarityId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/Badge.as::_window
    private _window: IWindowContainer | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/Badge.as::_backgroundColor
    // Derived name: obfuscated in the primary tree — the child tagged BG_COLOR.
    private _backgroundColor: IWindow | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/Badge.as::_initialized
    private _initialized: boolean = false;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/Badge.as::_model
    // Only used to report a click back as a selection; typed to the narrow contract so the
    // data model and its view do not become mutually recursive imports.
    private _selectionTarget: IBadgeSelectionTarget | null = null;

    // TS-only: AS3 threads the owning model through the constructor; this port's Badge is
    // built by the model before the view exists, so the target is attached afterwards.
    setSelectionTarget(target: IBadgeSelectionTarget | null): void
    {
        this._selectionTarget = target;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/Badge.as::get window()
    get window(): IWindowContainer | null
    {
        if(!this._initialized) this.initWindow();

        return this._window;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/Badge.as::initWindow()
    private initWindow(): void
    {
        if(Badge.template === null) return;

        this._window = Badge.template.clone() as IWindowContainer;

        const badgeWindow = this._window.findChildByName('badge');

        if(badgeWindow !== null)
        {
            const widget = (badgeWindow as unknown as IWidgetWindow).widget as IBadgeImageWidget | null;

            if(widget) widget.badgeId = this._badgeId;

            badgeWindow.visible = true;
        }

        this._backgroundColor = this._window.findChildByTag('BG_COLOR');
        this._initialized = true;
        this._window.procedure = this.itemEventProc;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/Badge.as::itemEventProc()
    private itemEventProc = (event: WindowEvent, _target: IWindow): void =>
    {
        if(event.type === WindowMouseEvent.CLICK) this._selectionTarget?.setBadgeSelected(this._badgeId);
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/Badge.as::dispose()
    dispose(): void
    {
        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }
}
