import {AlignRightWrapperPreset} from './AlignRightWrapperPreset';
import {AlignCenterWrapperPreset} from './AlignCenterWrapperPreset';
import {StaticHeightPreset} from './StaticHeightPreset';
import {FloatVerticallyPreset} from './FloatVerticallyPreset';
import {WindowWrapperPreset} from './WindowWrapperPreset';
import {wrapperCtors} from './wrapperCtors';

let registered = false;

/**
 * ensureWrappersRegistered — populates wrapperCtors with the WiredUIPreset wrapper constructors so the
 * base's alignRight()/alignCenter()/staticHeight()/floatVertically()/wrapWindow() can build them
 * without a static import cycle. Idempotent; called from the PresetManager constructor (which always
 * runs before any preset is built). See wrapperCtors for the rationale.
 */
export function ensureWrappersRegistered(): void
{
    if(registered)
    {
        return;
    }

    registered = true;
    wrapperCtors.AlignRight = AlignRightWrapperPreset;
    wrapperCtors.AlignCenter = AlignCenterWrapperPreset;
    wrapperCtors.StaticHeight = StaticHeightPreset;
    wrapperCtors.FloatVertically = FloatVerticallyPreset;
    wrapperCtors.WindowWrapper = WindowWrapperPreset;
}
