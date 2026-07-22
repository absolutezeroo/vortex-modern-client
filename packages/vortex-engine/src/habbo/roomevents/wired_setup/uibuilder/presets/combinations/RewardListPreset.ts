import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IWindow} from '@core/window/IWindow';

import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import {TextParam} from '../../params/TextParam';
import type {SimpleListViewPreset} from '../SimpleListViewPreset';
import type {TextPreset} from '../TextPreset';
import {WiredUIPreset} from '../WiredUIPreset';
import type {RewardRowPreset} from './RewardRowPreset';

/**
 * RewardListPreset — the give-reward rewards table: a header row plus up to maxRewards
 * RewardRowPreset rows, of which displayedRewards are shown; can grow/shrink and toggle the
 * probability column.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/combinations/RewardListPreset.as
 */
export class RewardListPreset extends WiredUIPreset
{
    // AS3: RewardListPreset.as::_container
    private _container: IItemListWindow;

    // AS3: RewardListPreset.as::_SafeStr_6018 (name derived: the rows container)
    private _rowsContainer: IItemListWindow;

    // AS3: RewardListPreset.as::_SafeStr_6936 (name derived: the header row)
    private _header: SimpleListViewPreset;

    // AS3: RewardListPreset.as::_SafeStr_7068 (name derived: the "Probability" header text)
    private _probabilityHeader: TextPreset;

    // AS3: RewardListPreset.as::_SafeStr_5365 (name derived: the reward rows)
    private _rows: RewardRowPreset[];

    // AS3: RewardListPreset.as::_displayedRewards
    private _displayedRewards: number;

    // AS3: RewardListPreset.as::_maxRewards
    private _maxRewards: number;

    // AS3: RewardListPreset.as::_SafeStr_9691 (name derived: whether the probability column is enabled)
    private _probabilityEnabled: boolean = true;

    // AS3: RewardListPreset.as::_expectedWidth
    private _expectedWidth: number = 0;

    // AS3: RewardListPreset.as::RewardListPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, maxRewards: number, displayedRewards: number)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._maxRewards = maxRewards;
        this._container = presetManager.createLayout('vertical_list_view') as unknown as IItemListWindow;
        this._container.spacing = wiredStyle.genericVerticalSpacing;

        const badgeHeader = presetManager.createText('Badge?', new TextParam(0, false));
        const codeHeader = presetManager.createText('Product/Badge code', new TextParam(2, false));
        this._probabilityHeader = presetManager.createText('Probability', new TextParam(0, false));
        this._header = presetManager.createSimpleListView(false, [badgeHeader, codeHeader, this._probabilityHeader]);

        this._rowsContainer = presetManager.createLayout('vertical_list_view') as unknown as IItemListWindow;
        this._rowsContainer.spacing = wiredStyle.genericVerticalSpacing;

        this._rows = [];

        for(let i = 0; i < this._maxRewards; i++)
        {
            this._rows.push(presetManager.createRewardRow());
        }

        this._container.addListItem(this._header.window);
        this._container.addListItem(this._rowsContainer);
        this.setDisplayedRewards(displayedRewards);
        this._displayedRewards = displayedRewards;
    }

    // AS3: RewardListPreset.as::setDisplayedRewards()
    setDisplayedRewards(count: number): void
    {
        const target = Math.max(0, Math.min(this._maxRewards, count));

        if(target === this._displayedRewards)
        {
            return;
        }

        if(target > this._displayedRewards)
        {
            for(let i = this._displayedRewards; i < target; i++)
            {
                this._rowsContainer.addListItem(this._rows[i].window);

                if(this._expectedWidth > 0)
                {
                    this._rows[i].resizeToWidth(this._expectedWidth);
                }
            }
        }
        else
        {
            for(let i = this._displayedRewards - 1; i >= target; i--)
            {
                this._rowsContainer.removeListItem(this._rows[i].window);
            }
        }

        this._displayedRewards = target;
    }

    // AS3: RewardListPreset.as::get displayedRewards()
    get displayedRewards(): number
    {
        return this._displayedRewards;
    }

    // AS3: RewardListPreset.as::getRow()
    getRow(index: number): RewardRowPreset
    {
        return this._rows[index];
    }

    // AS3: RewardListPreset.as::setProbabilityEnabled()
    setProbabilityEnabled(enabled: boolean): void
    {
        if(this._probabilityEnabled === enabled)
        {
            return;
        }

        this._probabilityEnabled = enabled;
        this._probabilityHeader.disabled = !enabled;

        for(const row of this._rows)
        {
            row.setProbabilityVisible(enabled);
        }
    }

    // AS3: RewardListPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._expectedWidth = width;
        this._container.width = width;
        this._header.resizeToWidth(width);
        this._rowsContainer.width = width;

        for(let i = 0; i < this._displayedRewards; i++)
        {
            this._rows[i].resizeToWidth(width);
        }
    }

    // AS3: RewardListPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: RewardListPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        const presets: WiredUIPreset[] = [this._header];

        for(const row of this._rows)
        {
            presets.push(row);
        }

        return presets;
    }

    // AS3: RewardListPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IItemListWindow;
        this._header = null as unknown as SimpleListViewPreset;
        this._rowsContainer = null as unknown as IItemListWindow;
        this._probabilityHeader = null as unknown as TextPreset;
        this._rows = null as unknown as RewardRowPreset[];
    }
}
