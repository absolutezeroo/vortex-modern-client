import type {CommonWidgetSettings} from '../layout/CommonWidgetSettings';

/**
 * Optional capability for a landing view widget that accepts the shared
 * campaign text/etching color overrides applied by `WidgetContainer.refresh()`.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/interfaces/ISettingsAwareWidget.as
 */
export interface ISettingsAwareWidget
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/interfaces/ISettingsAwareWidget.as::set settings()
    set settings(value: CommonWidgetSettings);
}
