import type {CommonWidgetSettings} from '../layout/CommonWidgetSettings';

/**
 * Optional capability for a landing view widget that accepts the shared
 * campaign text/etching color overrides applied by `WidgetContainer.refresh()`.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/interfaces/ISettingsAwareWidget.as
 */
export interface ISettingsAwareWidget
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/landingview/interfaces/ISettingsAwareWidget.as::set settings()
    set settings(value: CommonWidgetSettings);
}
