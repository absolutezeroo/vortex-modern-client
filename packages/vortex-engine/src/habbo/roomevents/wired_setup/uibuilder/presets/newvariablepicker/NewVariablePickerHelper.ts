import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {OrderedMap} from '@core/utils/OrderedMap';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {WiredStyle} from '../../styles/WiredStyle';

/**
 * NewVariablePickerHelper — shared state for the variable picker: a per-room, per-target selection
 * history (most-recent-first, capped at MAX_HISTORY) that feeds the "Recent" tab, plus a per-style
 * pool of reusable node-view windows (cloned from the "node_template" child of the search-tree layout)
 * so the picker's tree rows can be recycled instead of rebuilt.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/newvariablepicker/NewVariablePickerHelper.as
 */
export class NewVariablePickerHelper
{
    // AS3: NewVariablePickerHelper.as::MAX_HISTORY
    private static readonly MAX_HISTORY: number = 20;

    // AS3: NewVariablePickerHelper.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: NewVariablePickerHelper.as::_SafeStr_6639 (name derived: per-style pool of released node views)
    private _nodeViewPools: OrderedMap<WiredStyle, IRegionWindow[]>;

    // AS3: NewVariablePickerHelper.as::_windowTemplates (per-style cached node_template window)
    private _windowTemplates: OrderedMap<WiredStyle, IWindow>;

    // AS3: NewVariablePickerHelper.as::_SafeStr_6630 (name derived: roomId -> target -> variable-id history)
    private _history: OrderedMap<number, OrderedMap<number, string[]>>;

    // AS3: NewVariablePickerHelper.as::NewVariablePickerHelper()
    constructor(roomEvents: HabboUserDefinedRoomEvents)
    {
        this._roomEvents = roomEvents;
        this._nodeViewPools = new OrderedMap<WiredStyle, IRegionWindow[]>();
        this._windowTemplates = new OrderedMap<WiredStyle, IWindow>();
        this._history = new OrderedMap<number, OrderedMap<number, string[]>>();
    }

    // AS3: NewVariablePickerHelper.as::addToHistory()
    addToHistory(variable: WiredVariable): void
    {
        const target = variable.variableTarget;
        const variableId = variable.variableId;
        const roomId = this._roomEvents.roomId;

        if(roomId === 0)
        {
            return;
        }

        if(!this._history.hasKey(roomId))
        {
            this._history.add(roomId, new OrderedMap<number, string[]>());
        }

        const roomHistory = this._history.getValue(roomId)!;

        if(!roomHistory.hasKey(target))
        {
            roomHistory.add(target, []);
        }

        const ids = roomHistory.getValue(target)!;
        const existing = ids.indexOf(variableId);

        if(existing >= 0)
        {
            ids.splice(existing, 1);
        }

        ids.splice(0, 0, variableId);

        if(ids.length > NewVariablePickerHelper.MAX_HISTORY)
        {
            ids.pop();
        }
    }

    // AS3: NewVariablePickerHelper.as::getHistory()
    getHistory(target: number): string[]
    {
        const roomId = this._roomEvents.roomId;

        if(roomId === 0)
        {
            return [];
        }

        if(!this._history.hasKey(roomId))
        {
            return [];
        }

        const roomHistory = this._history.getValue(roomId)!;

        if(!roomHistory.hasKey(target))
        {
            return [];
        }

        return roomHistory.getValue(target)!;
    }

    // AS3: NewVariablePickerHelper.as::acquireNodeView()
    acquireNodeView(style: WiredStyle): IRegionWindow
    {
        if(this._nodeViewPools.hasKey(style))
        {
            const pool = this._nodeViewPools.getValue(style)!;

            if(pool.length > 0)
            {
                return pool.pop()!;
            }
        }

        if(!this._windowTemplates.hasKey(style))
        {
            const layout = this._roomEvents.wiredCtrl.presetManager.createLayout('search_tree_dropdown');
            this._windowTemplates.add(style, (layout as unknown as IWindowContainer).findChildByName('node_template')!);
        }

        const template = this._windowTemplates.getValue(style)!;

        return template.clone() as unknown as IRegionWindow;
    }

    // AS3: NewVariablePickerHelper.as::releaseNodeView()
    releaseNodeView(style: WiredStyle, view: IRegionWindow): void
    {
        if(!this._nodeViewPools.hasKey(style))
        {
            this._nodeViewPools.add(style, []);
        }

        this._nodeViewPools.getValue(style)!.push(view);
    }
}
