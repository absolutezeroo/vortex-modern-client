import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import {ConditionCodes} from './ConditionCodes';
import {FurnisHaveAvatars} from './FurnisHaveAvatars';

/**
 * FurnisHaveNoAvatars — the "the selected furnis have no avatars on them" wired condition (the
 * negation of FurnisHaveAvatars): same require-all/any selector with the negated labels and reversed
 * ids. onEditStart/readIntParamsFromForm are inherited (AS3 re-overrides them identically via its own
 * field; the port reuses the shared protected `_mode`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/FurnisHaveNoAvatars.as
 */
export class FurnisHaveNoAvatars extends FurnisHaveAvatars
{
    // AS3: FurnisHaveNoAvatars.as::get code()
    override get code(): number
    {
        return ConditionCodes.NOT_FURNIS_HAVE_AVATARS;
    }

    // AS3: FurnisHaveNoAvatars.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._mode = presetManager.createRadioGroup([
            new RadioButtonParam(1, this.l('not_requireall.2')),
            new RadioButtonParam(0, this.l('not_requireall.3'))
        ]);
        const section = presetManager.createSection(this.l('requireall'), this._mode);

        builder.addElements(section);
    }
}
