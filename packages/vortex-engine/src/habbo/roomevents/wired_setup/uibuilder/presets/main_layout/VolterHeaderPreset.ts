import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {IWiredTypeHolder} from '../../../IWiredTypeHolder';
import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import {TextParam} from '../../params/TextParam';
import type {TextPreset} from '../TextPreset';
import type {WiredUIPreset} from '../WiredUIPreset';
import {HeaderPreset} from './HeaderPreset';

/**
 * VolterHeaderPreset — the volter-styled header: the type icon (by the type holder's key) next to the
 * name.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/main_layout/VolterHeaderPreset.as
 */
export class VolterHeaderPreset extends HeaderPreset
{
    // AS3: VolterHeaderPreset.as::_title
    // `declare` (no runtime field init): assigned in createTopHeaderElement(), which the base
    // HeaderPreset constructor calls during super(). Under ES2022 useDefineForClassFields a plain
    // field declaration (including the `!` definite-assignment form) would re-run after super() and
    // clobber that value back to undefined (see IlluminaHeaderPreset / ConditionDefinition, same port pattern).
    private declare _title: TextPreset;

    // AS3: VolterHeaderPreset.as::VolterHeaderPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, name: string, typeHolder: IWiredTypeHolder, buttonMode: number, onApplySnapshot: () => void, onOpenMenu: () => void, onViewLogs: () => void)
    {
        super(roomEvents, presetManager, wiredStyle, name, typeHolder, buttonMode, onApplySnapshot, onOpenMenu, onViewLogs);
    }

    // AS3: VolterHeaderPreset.as::createTopHeaderElement()
    protected override createTopHeaderElement(name: string, typeHolder: IWiredTypeHolder): WiredUIPreset
    {
        const textParam = new TextParam(1, true);

        textParam.fontSize = this._wiredStyle.headerNameFontSize;
        this._title = this._presetManager.createText(name, textParam);

        return this._presetManager.createSimpleListView(false, [this._presetManager.createBitmapWrapperPreset('wired_type_icons_icon_' + typeHolder.getKey()), this._title]);
    }

    // AS3: VolterHeaderPreset.as::updateName()
    override updateName(name: string): void
    {
        this._title.text = name;
        this.resizeToWidth(this._width);
    }

    // AS3: VolterHeaderPreset.as::dispose()
    override dispose(): void
    {
        super.dispose();
        this._title = null as unknown as TextPreset;
    }
}
