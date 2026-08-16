import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Clear the achievement a resolution furni is set to — header 916 in WIN63's registry
 * (`_SafeCls_2046.as::_composers[916]`).
 *
 * Sent only after the player confirms `${resolution.reset.confirmation.title}`, and immediately
 * followed by a `GetResolutionAchievementsMessageComposer(stuffId, 0)` so the window redraws with
 * the choice gone.
 *
 * **Name DERIVED, and this one has no better source.** `win63_version` predates the message — its
 * `AchievementsResolutionController` has the get but not the reset — so the filename trick does not
 * apply; the name follows vortex-emulator's `ResetResolutionAchievementMessageEvent = 916` and the
 * one call site, `AchievementsResolutionController::resetResolution()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2563/_SafeCls_3330.as
 */
export class ResetResolutionAchievementMessageComposer extends MessageComposer<[number]>
{
    // AS3: _SafeCls_3330.as::_data (name derived: the field is _SafeStr_4556 in every tree)
    private _data: [number];

    // AS3: _SafeCls_3330.as::_SafeCls_3330()
    constructor(stuffId: number)
    {
        super();

        this._data = [stuffId];
    }

    // AS3: _SafeCls_3330.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
