import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {IWiredTypeHolder} from '../../../IWiredTypeHolder';
import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import {TextParam} from '../../params/TextParam';
import type {TextPreset} from '../TextPreset';
import type {WiredUIPreset} from '../WiredUIPreset';
import {HeaderPreset} from './HeaderPreset';

/**
 * IlluminaHeaderPreset — the illumina-styled header. Splits the name on ":" into an upper-cased
 * category line and a coloured name line, stacked tightly.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/main_layout/IlluminaHeaderPreset.as
 */
export class IlluminaHeaderPreset extends HeaderPreset
{
    // AS3: IlluminaHeaderPreset.as::_name1Preset
    // `declare` (no runtime field init): assigned in createTopHeaderElement(), which the base
    // HeaderPreset constructor calls during super(). Under ES2022 useDefineForClassFields a plain
    // field declaration would re-run after super() and clobber that value back to undefined
    // (see ActionDefinition/ConditionDefinition for the same port pattern).
    private declare _name1: TextPreset;

    // AS3: IlluminaHeaderPreset.as::_name2Preset
    private declare _name2: TextPreset;

    // AS3: IlluminaHeaderPreset.as::IlluminaHeaderPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, name: string, typeHolder: IWiredTypeHolder, buttonMode: number, onApplySnapshot: () => void, onOpenMenu: () => void, onViewLogs: () => void)
    {
        super(roomEvents, presetManager, wiredStyle, name, typeHolder, buttonMode, onApplySnapshot, onOpenMenu, onViewLogs);
    }

    // AS3: IlluminaHeaderPreset.as::createTopHeaderElement()
    protected override createTopHeaderElement(name: string, _typeHolder: IWiredTypeHolder): WiredUIPreset
    {
        const parts = this.getNameParts(name);

        let textParam = new TextParam(1, true);

        textParam.fontSize = 11;
        this._name1 = this._presetManager.createText(parts[0], textParam);

        textParam = new TextParam(1, true);
        textParam.fontSize = this._wiredStyle.headerNameFontSize;
        textParam.textColor = 4802889;
        this._name2 = this._presetManager.createText(parts[1], textParam);

        const list = this._presetManager.createSimpleListView(true, [this._presetManager.createSpacing(true, 3), this._name1, this._name2]);

        list.spacing = -2;
        list.window.x = 3;

        return list;
    }

    // AS3: IlluminaHeaderPreset.as::getNameParts()
    private getNameParts(name: string): string[]
    {
        const parts = name.split(':', 2);

        while(parts.length < 2)
        {
            parts.push('');
        }

        while(parts[1].indexOf(' ') === 0)
        {
            parts[1] = parts[1].substring(1);
        }

        parts[0] = parts[0].toUpperCase();

        return parts;
    }

    // AS3: IlluminaHeaderPreset.as::updateName()
    override updateName(name: string): void
    {
        const parts = this.getNameParts(name);

        this._name1.text = parts[0];
        this._name2.text = parts[1];
        this.resizeToWidth(this._width);
    }

    // AS3: IlluminaHeaderPreset.as::dispose()
    override dispose(): void
    {
        super.dispose();
        this._name1 = null as unknown as TextPreset;
        this._name2 = null as unknown as TextPreset;
    }
}
