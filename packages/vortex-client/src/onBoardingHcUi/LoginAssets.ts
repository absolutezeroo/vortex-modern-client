/**
 * Embedded-bitmap registry for the login flow.
 *
 * TS-only: AS3 reaches its artwork through `[Embed]`ed classes that are ready the moment the SWF
 * loads (`private static const button_png:Class = button_png$313fe973...`). The port has the same
 * bitmaps in the image bundle, but decoding them is asynchronous, so they are pulled once here —
 * before the first screen is built — and every widget then reads them synchronously by name, which
 * is what lets the AS3 constructors stay a faithful transcription.
 *
 * Names are the embed's own base name, which is also the file name in `assets/images/`. Note the
 * bundle registers images WITHOUT the `_png` suffix the AS3 identifiers carry, so
 * `button_skin_green_png` is `button_skin_green` here.
 */
import {Logger} from '@core/utils/Logger';
import type {AssetBundle} from '../AssetBundle';
import {BitmapData} from './display/BitmapData';

const log = Logger.getLogger('client.onBoardingHcUi.LoginAssets');

/**
 * TS-only: every bitmap the login flow and its widgets embed, by AS3 declaration site.
 */
const LOGIN_ASSET_NAMES: readonly string[] = [
    // LoaderUI
    'border_text_hitch',
    'block_dark_point_down',
    'block_dark_point_up',
    'block_dark_point_left',
    'block_dark_point_right',

    // NineSplitSprite
    'border_sunk',
    'dark_popup',
    'divider',
    'frame',
    'input_corrected',
    'input_error',
    'input_field',
    'input_corrected_hitch',
    'input_error_hitch',
    'input_field_hitch',
    'white_balloon',
    'block_dark_base',

    // Button
    'button',
    'button_pressed',
    'button_inactive',

    // ColouredButton — AS3's "red" skin is the pink one, see the identifier footer.
    'button_skin_green',
    'button_skin_green_pressed',
    'button_skin_green_inactive',
    'button_skin_green_rollover',
    'button_skin_pink',
    'button_skin_pink_pressed',
    'button_skin_pink_inactive',
    'button_skin_pink_rollover',
    'button_skin_yellow',
    'button_skin_yellow_pressed',
    'button_skin_yellow_inactive',
    'button_skin_yellow_rollover',
    'hc_small',

    // RoundButton
    'button_grid',
    'button_grid_over',
    'button_grid_selected_active',
    'button_grid_selected_inactive',

    // ColorButton
    'color_chip_round_default',
    'color_chip_round_press',
    'color_chip_round_selected',
    'color_round_chip_in',

    // randomizeButton
    'rnd_button',

    // RadioButton
    'radio_button_on',
    'radio_button_off',
    'radio_button_on_hitch',
    'radio_button_off_hitch',

    // login/
    'logo_new',
    'hitchTile',
    'placeholder_avatar',
    'avatar_halo',
    'avatar_glow',
    'flag_icons_en',
    'flag_icons_pt',
    'flag_icons_de',
    'flag_icons_es',
    'flag_icons_fi',
    'flag_icons_fr',
    'flag_icons_it',
    'flag_icons_nl',
    'flag_icons_tr',
    'flag_icons_dev',
    'flags_icon_selected',

    // onBoardingHc / onBoardingHcSteps — the post-login new-user flow shares this registry, since
    // it is built out of the same widgets and runs off the same bitmaps.
    'button_boy',
    'button_girl',
    'button_boy_active',
    'button_girl_active',
    'header_hc',
    'onb_habbos',
    'block_alert',
    'icon_alert_white',
    'icon_name_ok',
    'icon_name_alert',
    'input_error_alert_hitch',
    'room_image_border_new',
    'icon_yes',
    'c1_1',
    'c1_2',
    'c1_3',
    'c1_4',
    'c2_1',
    'c2_2',
    'c2_3',
    'c2_4',
    'c3_1',
    'c3_2',
    'c3_3',
    'c3_4',
    'c4_1',
    'c4_2',
    'c4_3',
    'c4_4',
];

export class LoginAssets
{
    private static readonly BITMAPS: Map<string, BitmapData> = new Map();

    /**
     * TS-only: decodes every login bitmap out of the image bundle. Called once, before the first
     * screen is built.
     */
    public static async load(bundle: AssetBundle): Promise<void>
    {
        const pending = LOGIN_ASSET_NAMES.map(async (name) =>
        {
            if(LoginAssets.BITMAPS.has(name)) return;

            const image = await bundle.getImageBitmap(`images/${name}.png`);

            if(!image)
            {
                // A missing bitmap renders nothing and throws nothing, so say so loudly here
                // rather than letting a button come out blank.
                log.warn(`Missing login bitmap: images/${name}.png`);

                return;
            }

            LoginAssets.BITMAPS.set(name, BitmapData.fromImage(image));
        });

        await Promise.all(pending);

        log.debug(`Loaded ${LoginAssets.BITMAPS.size}/${LOGIN_ASSET_NAMES.length} login bitmaps`);
    }

    /**
     * TS-only: the decoded bitmap for an embed name.
     *
     * Returns a 1×1 placeholder rather than null when an asset is missing: the AS3 constructors
     * this stands in for cannot fail, and a null here would take the whole login screen down.
     */
    public static get(name: string): BitmapData
    {
        const bitmap = LoginAssets.BITMAPS.get(name);

        if(bitmap) return bitmap;

        log.warn(`Requested unloaded login bitmap: ${name}`);

        return new BitmapData(1, 1, true, 0);
    }

    /** TS-only: whether an embed name resolved. */
    public static has(name: string): boolean
    {
        return LoginAssets.BITMAPS.has(name);
    }

    /** TS-only: drops the decoded bitmaps once the login flow is gone. */
    public static dispose(): void
    {
        LoginAssets.BITMAPS.clear();
    }
}
