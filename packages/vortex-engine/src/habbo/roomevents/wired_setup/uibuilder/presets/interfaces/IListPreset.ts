import type {IWiredUIPreset} from '../../IWiredUIPreset';

/**
 * IListPreset — a wired UI preset that lays out a vertical list of child presets, exposing the
 * inter-item spacing and a background colour.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/interfaces/IListPreset.as
 */
export interface IListPreset extends IWiredUIPreset
{
    // AS3: IListPreset.as::get spacing()
    // AS3: IListPreset.as::set spacing()
    spacing: number;

    // AS3: IListPreset.as::set backgroundColor()
    set backgroundColor(color: number);
}
