import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IWindowContainer} from '@core/window/IWindowContainer';

/**
 * One camera filter — a colour matrix, a composite blend, or a frame overlay.
 *
 * The effect table is static and built once, and `addEffect()` only registers an entry whose name
 * appears in the `camera.available.effects` config string: the 40 definitions below are the full
 * catalogue, and the hotel decides which of them exist.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/camera/CameraEffect.as
 */
export class CameraEffect
{
    // AS3: .../ui/widget/camera/CameraEffect.as::DEFAULT_EFFECT_STRENGTH
    private static readonly DEFAULT_EFFECT_STRENGTH: number = 0.5;

    // AS3: .../ui/widget/camera/CameraEffect.as::TYPE_COLORMATRIX
    static readonly TYPE_COLORMATRIX: string = 'colormatrix';

    // AS3: .../ui/widget/camera/CameraEffect.as::_SafeStr_10670
    static readonly TYPE_COMPOSITE: string = 'composite';

    // AS3: .../ui/widget/camera/CameraEffect.as::TYPE_FRAME
    static readonly TYPE_FRAME: string = 'frame';

    // AS3: .../ui/widget/camera/CameraEffect.as::_SafeStr_5175
    private static _effects: Map<string, CameraEffect> | null = null;

    // AS3: .../ui/widget/camera/CameraEffect.as::_SafeStr_6583
    private static _maxValue: number = 1;

    // AS3: .../ui/widget/camera/CameraEffect.as::_SafeStr_4683
    private static _localizations: IHabboLocalizationManager | null = null;

    // AS3: .../ui/widget/camera/CameraEffect.as::_availableEffectNames
    private static _availableEffectNames: string[] = [];

    // AS3: .../ui/widget/camera/CameraEffect.as::type
    type: string;

    // AS3: .../ui/widget/camera/CameraEffect.as::matrixArray
    matrixArray: number[] | null;

    // AS3: .../ui/widget/camera/CameraEffect.as::blendmode
    blendmode: string | null;

    // AS3: .../ui/widget/camera/CameraEffect.as::name
    name: string;

    // AS3: .../ui/widget/camera/CameraEffect.as::description
    description: string;

    // AS3: .../ui/widget/camera/CameraEffect.as::value
    value: number = 0;

    // AS3: .../ui/widget/camera/CameraEffect.as::isOn
    isOn: boolean = false;

    // AS3: .../ui/widget/camera/CameraEffect.as::achievementLevel
    achievementLevel: number = 0;

    // AS3: .../ui/widget/camera/CameraEffect.as::button
    button: IWindowContainer | null = null;

    // AS3: .../ui/widget/camera/CameraEffect.as::CameraEffect()
    constructor(name: string, type: string, matrixArray: number[] | null, blendmode: string | null, achievementLevel: number)
    {
        this.name = name;
        this.description = CameraEffect._localizations?.getLocalization('camera.effect.name.' + name, name) ?? name;
        this.type = type;
        this.blendmode = blendmode;
        this.matrixArray = matrixArray;
        this.achievementLevel = achievementLevel;
    }

    // AS3: .../ui/widget/camera/CameraEffect.as::resetAllEffects()
    static resetAllEffects(): void
    {
        if(CameraEffect._effects === null) return;

        for(const effect of CameraEffect._effects.values())
        {
            effect.value = CameraEffect.DEFAULT_EFFECT_STRENGTH * CameraEffect._maxValue;
            effect.setChosen(false);
        }
    }

    // AS3: .../ui/widget/camera/CameraEffect.as::setMaxValue()
    static setMaxValue(value: number): void
    {
        CameraEffect._maxValue = value;
    }

    // AS3: .../ui/widget/camera/CameraEffect.as::getEffects()
    static getEffects(availableEffects: string | null, localizations: IHabboLocalizationManager): Map<string, CameraEffect>
    {
        if(!CameraEffect._effects)
        {
            if(availableEffects !== null)
            {
                for(const name of availableEffects.split(','))
                {
                    CameraEffect._availableEffectNames.push(name.trim());
                }
            }

            CameraEffect._localizations = localizations;
            CameraEffect.initEffects();
        }

        return CameraEffect._effects as Map<string, CameraEffect>;
    }

    // AS3: .../ui/widget/camera/CameraEffect.as::initEffects()
    private static initEffects(): void
    {
        CameraEffect._effects = new Map();

        const cm = CameraEffect.TYPE_COLORMATRIX;
        const co = CameraEffect.TYPE_COMPOSITE;
        const fr = CameraEffect.TYPE_FRAME;

        CameraEffect.addEffect('dark_sepia', cm, [0.4, 0.4, 0.1, 0, 110, 0.3, 0.4, 0.1, 0, 30, 0.3, 0.2, 0.1, 0, 0, 0, 0, 0, 1, 0], null);
        CameraEffect.addEffect('increase_saturation', cm, [2, -0.5, -0.5, 0, 0, -0.5, 2, -0.5, 0, 0, -0.5, -0.5, 2, 0, 0, 0, 0, 0, 1, 0], null);
        CameraEffect.addEffect('increase_contrast', cm, [1.5, 0, 0, 0, -50, 0, 1.5, 0, 0, -50, 0, 0, 1.5, 0, -50, 0, 0, 0, 1.5, 0], null);
        CameraEffect.addEffect('shadow_multiply_02', co, null, 'multiply');
        CameraEffect.addEffect('color_1', cm, [0.393, 0.769, 0.189, 0, 0, 0.349, 0.686, 0.168, 0, 0, 0.272, 0.534, 0.131, 0, 0, 0, 0, 0, 1, 0], null, 1);
        CameraEffect.addEffect('hue_bright_sat', cm, [1, 0.6, 0.2, 0, -50, 0.2, 1, 0.6, 0, -50, 0.6, 0.2, 1, 0, -50, 0, 0, 0, 1, 0], null, 1);
        CameraEffect.addEffect('hearts_hardlight_02', co, null, 'hardlight', 1);
        CameraEffect.addEffect('texture_overlay', co, null, 'overlay', 1);
        CameraEffect.addEffect('pinky_nrm', co, null, 'normal', 1);
        CameraEffect.addEffect('color_2', cm, [0.333, 0.333, 0.333, 0, 0, 0.333, 0.333, 0.333, 0, 0, 0.333, 0.333, 0.333, 0, 0, 0, 0, 0, 1, 0], null, 2);
        CameraEffect.addEffect('night_vision', cm, [0, 0, 0, 0, 0, 0, 1.1, 0, 0, -50, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0], null, 2);
        CameraEffect.addEffect('stars_hardlight_02', co, null, 'hardlight', 2);
        CameraEffect.addEffect('coffee_mpl', co, null, 'multiply', 2);
        CameraEffect.addEffect('security_hardlight', co, null, 'hardlight', 3);
        CameraEffect.addEffect('bluemood_mpl', co, null, 'multiply', 3);
        CameraEffect.addEffect('rusty_mpl', co, null, 'multiply', 3);
        CameraEffect.addEffect('decr_conrast', cm, [0.5, 0, 0, 0, 50, 0, 0.5, 0, 0, 50, 0, 0, 0.5, 0, 50, 0, 0, 0, 1, 0], null, 4);
        CameraEffect.addEffect('green_2', cm, [0.5, 0.5, 0.5, 0, 0, 0.5, 0.5, 0.5, 0, 90, 0.5, 0.5, 0.5, 0, 0, 0, 0, 0, 1, 0], null, 4);
        CameraEffect.addEffect('alien_hrd', co, null, 'hardlight', 4);
        CameraEffect.addEffect('color_3', cm, [0.609, 0.609, 0.082, 0, 0, 0.309, 0.609, 0.082, 0, 0, 0.309, 0.609, 0.082, 0, 0, 0, 0, 0, 1, 0], null, 5);
        CameraEffect.addEffect('color_4', cm, [0.8, -0.8, 1, 0, 70, 0.8, -0.8, 1, 0, 70, 0.8, -0.8, 1, 0, 70, 0, 0, 0, 1, 0], null, 5);
        CameraEffect.addEffect('toxic_hrd', co, null, 'hardlight', 5);
        CameraEffect.addEffect('hypersaturated', cm, [2, -1, 0, 0, 0, -1, 2, 0, 0, 0, 0, -1, 2, 0, 0, 0, 0, 0, 1, 0], null, 6);
        CameraEffect.addEffect('Yellow', cm, [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0], null, 6);
        CameraEffect.addEffect('misty_hrd', co, null, 'hardlight', 6);
        CameraEffect.addEffect('x_ray', cm, [0, 1.2, 0, 0, -100, 0, 2, 0, 0, -120, 0, 2, 0, 0, -120, 0, 0, 0, 1, 0], null, 7);
        CameraEffect.addEffect('decrease_saturation', cm, [0.7, 0.2, 0.2, 0, 0, 0.2, 0.7, 0.2, 0, 0, 0.2, 0.2, 0.7, 0, 0, 0, 0, 0, 1, 0], null, 7);
        CameraEffect.addEffect('drops_mpl', co, null, 'multiply', 8);
        CameraEffect.addEffect('shiny_hrd', co, null, 'hardlight', 9);
        CameraEffect.addEffect('glitter_hrd', co, null, 'hardlight', 10);
        CameraEffect.addEffect('frame_gold', fr, null, null, 999);
        CameraEffect.addEffect('frame_gray_4', fr, null, null, 999);
        CameraEffect.addEffect('frame_black_2', fr, null, null, 999);
        CameraEffect.addEffect('frame_wood_2', fr, null, null, 999);
        CameraEffect.addEffect('finger_nrm', fr, null, null, 999);
        CameraEffect.addEffect('color_5', cm, [3.309, 0.609, 1.082, 0.2, 0, 0.309, 0.609, 0.082, 0, 0, 1.309, 0.609, 0.082, 0, 0, 0, 0, 0, 1, 0], null, 999);
        CameraEffect.addEffect('black_white_negative', cm, [-0.5, -0.5, -0.5, 0, 255, -0.5, -0.5, -0.5, 0, 255, -0.5, -0.5, -0.5, 0, 255, 0, 0, 0, 1, 0], null, 999);
        CameraEffect.addEffect('blue', cm, [0.5, 0.5, 0.5, 0, -255, 0.5, 0.5, 0.5, 0, -170, 0.5, 0.5, 0.5, 0, 0, 0, 0, 0, 1, 0], null, 999);
        CameraEffect.addEffect('red', cm, [0.5, 0.5, 0.5, 0, 0, 0.5, 0.5, 0.5, 0, -170, 0.5, 0.5, 0.5, 0, -170, 0, 0, 0, 1, 0], null, 999);
        CameraEffect.addEffect('green', cm, [0.5, 0.5, 0.5, 0, -170, 0.5, 0.5, 0.5, 0, 0, 0.5, 0.5, 0.5, 0, -170, 0, 0, 0, 1, 0], null, 999);
    }

    // AS3: .../ui/widget/camera/CameraEffect.as::addEffect()
    private static addEffect(
        name: string,
        type: string,
        matrixArray: number[] | null,
        blendmode: string | null,
        achievementLevel: number = 0
    ): void
    {
        if(CameraEffect._availableEffectNames.indexOf(name) >= 0)
        {
            CameraEffect._effects?.set(name, new CameraEffect(name, type, matrixArray, blendmode, achievementLevel));
        }
    }

    // AS3: .../ui/widget/camera/CameraEffect.as::getEffectStrength()
    getEffectStrength(): number
    {
        return this.value / CameraEffect._maxValue;
    }

    // AS3: .../ui/widget/camera/CameraEffect.as::allowsOnlyOneInstance()
    allowsOnlyOneInstance(): boolean
    {
        return this.type === CameraEffect.TYPE_FRAME;
    }

    // AS3: .../ui/widget/camera/CameraEffect.as::usesEffectStrength()
    usesEffectStrength(): boolean
    {
        return this.type !== CameraEffect.TYPE_FRAME;
    }

    /**
	 * Returns the 20-entry colour matrix. Unless `full` is set, the effect's matrix is blended with
	 * the identity in proportion to the strength slider, which is how a half-strength filter is
	 * produced — there is no separate intensity channel.
	 */
    // AS3: .../ui/widget/camera/CameraEffect.as::getColorMatrixFilter()
    getColorMatrixFilter(full: boolean = false): number[]
    {
        const matrix = this.matrixArray ?? [];

        if(full)
        {
            return [...matrix];
        }

        const result: number[] = [];
        const identity = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
        const strength = this.getEffectStrength();

        let i = 0;

        while(i < matrix.length)
        {
            result.push(matrix[i] * strength + identity[i] * (1 - strength));
            i++;
        }

        return result;
    }

    // AS3: .../ui/widget/camera/CameraEffect.as::setChosen()
    setChosen(chosen: boolean): void
    {
        this.isOn = chosen;

        if(this.button)
        {
            this.setSelectionHighlight(this.isOn);

            const removeButton = this.button.findChildByName('remove_effect_button');

            if(removeButton) removeButton.visible = this.isOn;

            if(!this.allowsOnlyOneInstance())
            {
                const indicator = this.button.findChildByName('active_indicator');

                if(indicator) indicator.visible = this.isOn;
            }
        }
    }

    // AS3: .../ui/widget/camera/CameraEffect.as::setSelectionHighlight()
    private setSelectionHighlight(visible: boolean): void
    {
        if(this.button)
        {
            const indicator = this.button.findChildByName('selected_indicator');

            if(indicator) indicator.visible = visible;
        }
    }

    // AS3: .../ui/widget/camera/CameraEffect.as::turnOffHighlight()
    turnOffHighlight(): void
    {
        this.setSelectionHighlight(false);
    }
}
