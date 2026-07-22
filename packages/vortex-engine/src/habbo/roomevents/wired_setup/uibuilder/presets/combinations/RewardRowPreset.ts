import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';
import {Util} from '@habbo/roomevents/Util';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';

import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import {TextInputParam} from '../../params/TextInputParam';
import type {SimpleListViewPreset} from '../SimpleListViewPreset';
import type {TextInputPreset} from '../TextInputPreset';
import {WiredUIPreset} from '../WiredUIPreset';

/**
 * RewardRowPreset — one row of the give-reward list: a "badge?" checkbox, a product/badge code input
 * and a probability input, laid out horizontally.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/combinations/RewardRowPreset.as
 */
export class RewardRowPreset extends WiredUIPreset
{
    // AS3: RewardRowPreset.as::_SafeStr_4836 (name derived: the row's horizontal list)
    private _rowList: SimpleListViewPreset;

    // AS3: RewardRowPreset.as::_SafeStr_4565 (name derived: the container window)
    private _container: IWindowContainer;

    // AS3: RewardRowPreset.as::_badgeCheckbox
    private _badgeCheckbox: ISelectableWindow;

    // AS3: RewardRowPreset.as::_SafeStr_6515 (name derived: the code input)
    private _codeInput: TextInputPreset;

    // AS3: RewardRowPreset.as::_SafeStr_6029 (name derived: the probability input)
    private _probabilityInput: TextInputPreset;

    // AS3: RewardRowPreset.as::_SafeStr_5124 (name derived: the horizontal spacing)
    private _spacing: number;

    // AS3: RewardRowPreset.as::_SafeStr_8674 (name derived: whether the probability input is shown)
    private _probabilityVisible: boolean = true;

    // AS3: RewardRowPreset.as::RewardRowPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._badgeCheckbox = wiredStyle.createCheckboxView();
        this._codeInput = presetManager.createTextInput(new TextInputParam('', 100, null, -1, null, true, 'Product code or badge code'));
        this._probabilityInput = presetManager.createTextInput(new TextInputParam('', 3, null, 50, '0-9', true, 'Chance to get this reward. Value should be a number between 1 and 100'));
        this._spacing = wiredStyle.genericHorizontalSpacing;
        this._probabilityInput.disabled = !this._probabilityVisible;
        this._rowList = presetManager.createSimpleListView(false, [this.wrapWindow(this._badgeCheckbox, true), this._codeInput, this._probabilityInput]);
        this._rowList.spacing = this._spacing;
        this._container = presetManager.createLayout('container_view') as unknown as IWindowContainer;
        this._container.addChild(this._rowList.window);
    }

    // AS3: RewardRowPreset.as::get code()
    get code(): string
    {
        return this._codeInput.text;
    }

    // AS3: RewardRowPreset.as::set code()
    set code(value: string)
    {
        this._codeInput.text = value == null ? '' : value;
    }

    // AS3: RewardRowPreset.as::get probabilityText()
    get probabilityText(): string
    {
        return this._probabilityInput.text;
    }

    // AS3: RewardRowPreset.as::set probabilityText()
    set probabilityText(value: string)
    {
        this._probabilityInput.text = value == null ? '' : value;
    }

    // AS3: RewardRowPreset.as::get isBadge()
    get isBadge(): boolean
    {
        return this._badgeCheckbox.isSelected;
    }

    // AS3: RewardRowPreset.as::set isBadge()
    set isBadge(value: boolean)
    {
        Util.select(this._badgeCheckbox, value);
    }

    // AS3: RewardRowPreset.as::clear()
    clear(): void
    {
        this.code = '';
        this.probabilityText = '';
        this.isBadge = false;
    }

    // AS3: RewardRowPreset.as::setProbabilityVisible()
    setProbabilityVisible(value: boolean): void
    {
        this._probabilityVisible = value;
        this._probabilityInput.disabled = !this._probabilityVisible;
    }

    // AS3: RewardRowPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._container.width = width;
        this._rowList.resizeToWidth(width);
        this._container.height = this._rowList.window.height;
    }

    // AS3: RewardRowPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: RewardRowPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [this._rowList];
    }

    // AS3: RewardRowPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IWindowContainer;
        this._rowList = null as unknown as SimpleListViewPreset;
        this._badgeCheckbox = null as unknown as ISelectableWindow;
        this._codeInput = null as unknown as TextInputPreset;
        this._probabilityInput = null as unknown as TextInputPreset;
    }
}
