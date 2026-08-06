import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IDropListWindow} from '@core/window/components/IDropListWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IDisposable} from '@core/runtime/IDisposable';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import {TextWindowUtils} from '@habbo/utils/TextWindowUtils';
import type {HabboPhoneNumber} from './HabboPhoneNumber';

/** TS-only: one entry of the country drop list — AS3 uses an untyped object literal. */
interface ILocaleEntry
{
    code: string;
    name: string;
}

/**
 * The dialog that asks for a phone number: a country drop list, a number field, and three ways
 * out — send, skip (minimize), or never again.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/phonenumber/PhoneNumberCollectView.as
 */
export class PhoneNumberCollectView
{
    // AS3: .../phonenumber/PhoneNumberCollectView.as::INPUT_MAX_CHARS
    private static readonly INPUT_MAX_CHARS: number = 30;

    /**
     * AS3: .../phonenumber/PhoneNumberCollectView.as::ALL_COUNTRY_CODES
     *
     * The 243 ISO codes the dialog will offer, in AS3's own order — which is neither sorted nor
     * the display order: the menu is sorted by localized country name, with the preferred codes
     * floated to the top.
     */
    private static readonly ALL_COUNTRY_CODES: string[] = [
        'VU', 'EC', 'VN', 'VI', 'DZ', 'VG', 'VE', 'DM', 'VC', 'DO', 'VA', 'DE',
        'UZ', 'UY', 'DK', 'DJ', 'US', 'UG', 'UA', 'ET', 'ES', 'ER', 'EH', 'EG',
        'EE', 'TZ', 'TT', 'TW', 'TV', 'GD', 'GE', 'GF', 'GA', 'GB', 'FR', 'FO',
        'FK', 'FJ', 'FM', 'FI', 'WS', 'GY', 'GW', 'GU', 'GT', 'GR', 'GQ', 'WF',
        'GP', 'GN', 'GM', 'GL', 'GI', 'GH', 'GG', 'RE', 'RO', 'AT', 'AS', 'AR',
        'QA', 'AW', 'AU', 'AZ', 'BA', 'PT', 'AC', 'AD', 'PW', 'AG', 'AE', 'PR',
        'PS', 'AF', 'AL', 'AI', 'AO', 'PY', 'AM', 'BW', 'TG', 'BY', 'TD', 'TK',
        'BS', 'TJ', 'BR', 'BT', 'TH', 'TO', 'TN', 'TM', 'TL', 'CA', 'BZ', 'TR',
        'BF', 'SV', 'BG', 'BH', 'SS', 'BI', 'ST', 'SY', 'BB', 'SZ', 'BD', 'BE',
        'SX', 'BN', 'BO', 'BQ', 'BJ', 'TC', 'BL', 'TA', 'BM', 'CZ', 'SD', 'CY',
        'SC', 'CX', 'CW', 'SE', 'SH', 'CV', 'SG', 'CU', 'SJ', 'SI', 'SL', 'SK',
        'SN', 'SM', 'SO', 'SR', 'CI', 'RS', 'CG', 'CH', 'RU', 'RW', 'CF', 'CC',
        'CD', 'CR', 'CO', 'CM', 'CN', 'SA', 'CK', 'SB', 'CL', 'LV', 'LU', 'LT',
        'LY', 'LS', 'LR', 'MG', 'MH', 'ME', 'MF', 'MK', 'ML', 'MC', 'MD', 'MA',
        'MV', 'MU', 'MX', 'MW', 'MZ', 'MY', 'MN', 'MM', 'MP', 'MO', 'MR', 'MQ',
        'MT', 'MS', 'NF', 'NG', 'NI', 'NL', 'NA', 'NC', 'NE', 'NZ', 'NU', 'NR',
        'NP', 'NO', 'OM', 'PL', 'PM', 'PH', 'PK', 'PE', 'PF', 'PG', 'PA', 'HK',
        'ZA', 'HN', 'HR', 'HT', 'HU', 'ZM', 'ZW', 'ID', 'IE', 'IL', 'IM', 'IN',
        'IO', 'IQ', 'IR', 'YE', 'IS', 'IT', 'JE', 'YT', 'JP', 'JO', 'JM', 'KI',
        'KH', 'KG', 'KE', 'KP', 'KR', 'KM', 'KN', 'KW', 'KY', 'KZ', 'LA', 'LC',
        'LB', 'LI', 'LK'
    ];

    // AS3: .../phonenumber/PhoneNumberCollectView.as::_SafeStr_4617
    private _phoneNumber: HabboPhoneNumber | null;

    // AS3: .../phonenumber/PhoneNumberCollectView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../phonenumber/PhoneNumberCollectView.as::_inputTextNeedsClearing
    private _inputTextNeedsClearing: boolean = true;

    // AS3: .../phonenumber/PhoneNumberCollectView.as::_locales
    private _locales: ILocaleEntry[] = [];

    // AS3: .../phonenumber/PhoneNumberCollectView.as::PhoneNumberCollectView()
    constructor(phoneNumber: HabboPhoneNumber, preferredCountries: string[])
    {
        this._phoneNumber = phoneNumber;

        this.onInput = this.onInput.bind(this);
        this.onNeverAgainConfirmClose = this.onNeverAgainConfirmClose.bind(this);

        this.createWindow(preferredCountries);
    }

    /**
     * AS3: .../phonenumber/PhoneNumberCollectView.as::handleSubmitFailure()
     *
     * The result code is taken and not used — AS3 clears the field and re-enables the form
     * whatever it says. The caller alerts on it separately.
     */
    handleSubmitFailure(_resultCode: number): void
    {
        const input = this._window?.findChildByName('phone_number_input');

        if(input)
        {
            input.caption = '';
        }

        this._inputTextNeedsClearing = true;
        this.setInputStates(true);
    }

    /**
     * AS3: .../phonenumber/PhoneNumberCollectView.as::get selectedCountryCode()
     *
     * `NOT_SELECTED` and `--` are AS3's own sentinels and go out on the wire as written.
     */
    private get selectedCountryCode(): string
    {
        const countryList = this._window?.findChildByName('country_list') as unknown as IDropListWindow | null;

        if(!countryList || countryList.selection === -1)
        {
            return 'NOT_SELECTED';
        }

        const locale = this._locales[countryList.selection];

        return locale != null ? locale.code : '--';
    }

    /**
     * AS3: .../phonenumber/PhoneNumberCollectView.as::createWindow()
     *
     * The country names come from a JSON map in localization. **The primary tree lost that
     * lookup:** its decompilation reads `new JSONDecoder("{}", false)` — only the fallback, which
     * would leave every name undefined and the menu blank.
     * `sources/win63_version/habbo/phonenumber/PhoneNumberCollectView.as` keeps the real
     * expression, `getLocalization("phone.number.collect.countries") || "{}"`, and that is what is
     * ported here.
     */
    private createWindow(preferredCountries: string[]): void
    {
        if(this._window) return;

        this._window = this._phoneNumber?.windowManager
            ?.buildWidgetLayout('phonenumber_collect_xml') as IWindowContainer | null ?? null;

        if(!this._window) return;

        this._window.center();

        for(const name of ['never_link', 'skip_link', 'ok_button', 'header_button_close', 'phone_number_input'])
        {
            const child = this._window.findChildByName(name);

            if(child)
            {
                child.procedure = this.onInput;
            }
        }

        const input = this._window.findChildByName('phone_number_input') as unknown as ITextFieldWindow | null;

        if(input)
        {
            input.maxChars = PhoneNumberCollectView.INPUT_MAX_CHARS;
        }

        const countryNames = this.parseCountryNames();

        this._locales = [];

        for(const code of PhoneNumberCollectView.ALL_COUNTRY_CODES)
        {
            const name = countryNames[code];

            if(name != null && name.length > 0)
            {
                this._locales.push({code, name});
            }
        }

        this._locales.sort((a, b) => a.name < b.name ? -1 : (a.name > b.name ? 1 : 0));

        // Walked backwards so that unshifting leaves the configured order intact at the top.
        for(let i = preferredCountries.length - 1; i >= 0; i--)
        {
            const code = preferredCountries[i];

            if(PhoneNumberCollectView.ALL_COUNTRY_CODES.indexOf(code) !== -1)
            {
                this._locales.unshift({code, name: countryNames[code]});
            }
        }

        const countryList = this._window.findChildByName('country_list') as unknown as IDropListWindow | null;

        if(countryList)
        {
            for(const locale of this._locales)
            {
                const item = this.createCountrySelectorMenuItem(locale.code, locale.name);

                if(item)
                {
                    countryList.addMenuItem(item);
                }
            }

            if(countryList.numMenuItems > 0)
            {
                countryList.selection = 0;
            }
        }

        // Decimal literals as in AS3 (0x336A95 / 0xFFFFFF / 0x41B7D9).
        TextWindowUtils.setHTMLLinkStyle(
            this._window.findChildByName('collect_summary') as unknown as ITextWindow | null,
            3369621,
            16777215,
            4306905
        );

        this._window.findChildByName('ok_button')?.disable();
        this.setInputStates(true);
    }

    /**
     * TS-only: the JSON decode AS3 does inline with `_SafePkg_1971.JSONDecoder`.
     *
     * A malformed map yields an empty one rather than throwing — AS3 constructs its decoder with
     * `strict = false`, which is the same intent.
     */
    private parseCountryNames(): Record<string, string>
    {
        const raw = this._phoneNumber?.localizationManager
            ?.getLocalization('phone.number.collect.countries', '') || '{}';

        try
        {
            return JSON.parse(raw) as Record<string, string>;
        }
        catch
        {
            return {};
        }
    }

    // AS3: .../phonenumber/PhoneNumberCollectView.as::createCountrySelectorMenuItem()
    private createCountrySelectorMenuItem(code: string, name: string): IWindow | null
    {
        const item = this._phoneNumber?.windowManager
            ?.buildWidgetLayout('phonenumber_country_menu_item_xml') as IWindowContainer | null ?? null;

        if(!item) return null;

        item.name = code;

        const label = item.findChildByName('country_code');

        if(label)
        {
            label.caption = name;
        }

        return item as unknown as IWindow;
    }

    // AS3: .../phonenumber/PhoneNumberCollectView.as::onNeverAgainConfirmClose()
    private onNeverAgainConfirmClose(dialog: IDisposable, event: WindowEvent): void
    {
        if(event.type === WindowEvent.WE_OK && this._phoneNumber)
        {
            this._phoneNumber.setNeverAgain();
        }

        dialog.dispose();
    }

    /**
     * AS3: .../phonenumber/PhoneNumberCollectView.as::setInputStates()
     *
     * The OK button is disabled either way — typing re-enables it from `onInput()`.
     */
    private setInputStates(enabled: boolean): void
    {
        if(!this._window) return;

        this._window.findChildByName('ok_button')?.disable();

        const input = this._window.findChildByName('phone_number_input');
        const neverLink = this._window.findChildByName('never_link');
        const skipLink = this._window.findChildByName('skip_link');
        const closeButton = this._window.findChildByName('header_button_close');
        const countryList = this._window.findChildByName('country_list');

        if(enabled)
        {
            input?.enable();
            closeButton?.enable();
            countryList?.enable();
        }
        else
        {
            input?.disable();
            closeButton?.disable();
            countryList?.disable();
        }

        if(neverLink) neverLink.visible = enabled;
        if(skipLink) skipLink.visible = enabled;
    }

    /**
     * AS3: .../phonenumber/PhoneNumberCollectView.as::onInput()
     *
     * One procedure for every control, dispatching on the window's name. The buttons answer to
     * WME_DOWN here, where the verify dialog's answer to WME_CLICK — that difference is AS3's.
     */
    private onInput(event: WindowEvent, window: IWindow): void
    {
        if(event.type === WindowMouseEvent.DOWN)
        {
            switch(window.name)
            {
                case 'header_button_close':
                case 'skip_link':
                    this._phoneNumber?.setCollectViewMinimized(true);
                    break;
                case 'never_link':
                    this._phoneNumber?.windowManager?.confirm(
                        '${phone.number.never.again.confirm.title}',
                        '${phone.number.never.again.confirm.text}',
                        0,
                        this.onNeverAgainConfirmClose
                    );
                    break;
                case 'ok_button':
                    this._phoneNumber?.sendTryPhoneNumber(
                        this.selectedCountryCode,
                        this._window?.findChildByName('phone_number_input')?.caption ?? ''
                    );
                    this.setInputStates(false);
                    break;
                case 'phone_number_input':
                {
                    const numberInput = this._window?.findChildByName('phone_number_input');

                    if(this._inputTextNeedsClearing && numberInput)
                    {
                        numberInput.caption = '';
                        this._inputTextNeedsClearing = false;
                    }

                    const textField = numberInput as unknown as ITextFieldWindow | null;

                    if(textField)
                    {
                        textField.textColor = 0;
                    }
                }
            }
        }

        if(event.type === WindowKeyboardEvent.KEY_UP && event.target?.name === 'phone_number_input')
        {
            const caption = this._window?.findChildByName('phone_number_input')?.caption;

            if(caption != null && caption.length > 0)
            {
                this._window?.findChildByName('ok_button')?.enable();
            }
            else
            {
                this._window?.findChildByName('ok_button')?.disable();
            }
        }
    }

    // AS3: .../phonenumber/PhoneNumberCollectView.as::dispose()
    dispose(): void
    {
        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        this._phoneNumber = null;
    }
}
