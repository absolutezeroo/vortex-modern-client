/**
 * The easing curves a `Tween` can run on.
 *
 * Each is a pure `ratio -> ratio` map over [0, 1]; `Tween.advanceTime()` puts the linear progress
 * in and interpolates against what comes out. The "InOut"/"OutIn" pairs are not separate curves at
 * all — `easeCombined()` runs one over the first half and the other over the second, which is why
 * `easeInOut` and `easeOutIn` cost one line each.
 *
 * The constants are AS3's magic numbers verbatim: 1.70158 is the standard back-easing overshoot,
 * and the bounce thresholds are all n/2.75. Rounding them would change the animation.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Transitions.as
 */
export type TransitionFunction = (ratio: number) => number;

export class Transitions
{
    // AS3: Transitions.as::LINEAR
    public static readonly LINEAR: string = 'linear';
    // AS3: Transitions.as::EASE_IN
    public static readonly EASE_IN: string = 'easeIn';
    // AS3: Transitions.as::_SafeStr_11039 (name from the string it registers)
    public static readonly EASE_OUT: string = 'easeOut';
    // AS3: Transitions.as::_SafeStr_11529 (name from the string it registers)
    public static readonly EASE_IN_OUT: string = 'easeInOut';
    // AS3: Transitions.as::EASE_OUT_IN
    public static readonly EASE_OUT_IN: string = 'easeOutIn';
    // AS3: Transitions.as::EASE_IN_BACK
    public static readonly EASE_IN_BACK: string = 'easeInBack';
    // AS3: Transitions.as::EASE_OUT_BACK
    public static readonly EASE_OUT_BACK: string = 'easeOutBack';
    // AS3: Transitions.as::EASE_IN_OUT_BACK
    public static readonly EASE_IN_OUT_BACK: string = 'easeInOutBack';
    // AS3: Transitions.as::EASE_OUT_IN_BACK
    public static readonly EASE_OUT_IN_BACK: string = 'easeOutInBack';
    // AS3: Transitions.as::_SafeStr_11505 (name from the string it registers)
    public static readonly EASE_IN_ELASTIC: string = 'easeInElastic';
    // AS3: Transitions.as::_SafeStr_11727 (name from the string it registers)
    public static readonly EASE_OUT_ELASTIC: string = 'easeOutElastic';
    // AS3: Transitions.as::_SafeStr_11590 (name from the string it registers)
    public static readonly EASE_IN_OUT_ELASTIC: string = 'easeInOutElastic';
    // AS3: Transitions.as::_SafeStr_10860 (name from the string it registers)
    public static readonly EASE_OUT_IN_ELASTIC: string = 'easeOutInElastic';
    // AS3: Transitions.as::_SafeStr_11270 (name from the string it registers)
    public static readonly EASE_IN_BOUNCE: string = 'easeInBounce';
    // AS3: Transitions.as::_SafeStr_11591 (name from the string it registers)
    public static readonly EASE_OUT_BOUNCE: string = 'easeOutBounce';
    // AS3: Transitions.as::_SafeStr_10663 (name from the string it registers)
    public static readonly EASE_IN_OUT_BOUNCE: string = 'easeInOutBounce';
    // AS3: Transitions.as::_SafeStr_11452 (name from the string it registers)
    public static readonly EASE_OUT_IN_BOUNCE: string = 'easeOutInBounce';

    // TS-only: AS3 inlines 1.70158 at both `back` call sites; named once here because it is the
    // one number in this file whose value is not self-evident.
    private static readonly BACK_OVERSHOOT: number = 1.70158;

    // AS3: Transitions.as::_SafeStr_7355 (the Dictionary behind getTransition/register)
    private static _transitions: Map<string, TransitionFunction> | null = null;

    /**
     * The curve registered under `name`, or `null` for a name nobody registered — AS3 reads a
     * Dictionary and gets `undefined` the same way, and `Tween` treats that as linear.
     */
    // AS3: Transitions.as::getTransition()
    public static getTransition(name: string): TransitionFunction | null
    {
        const transitions = Transitions.all();

        return transitions.get(name) ?? null;
    }

    // AS3: Transitions.as::register()
    public static register(name: string, transition: TransitionFunction): void
    {
        Transitions.all().set(name, transition);
    }

    // TS-only: AS3 repeats the `if(dictionary == null) registerDefaults()` guard in both public
    // methods; one accessor is the same thing said once.
    private static all(): Map<string, TransitionFunction>
    {
        if(Transitions._transitions === null) Transitions.registerDefaults();

        return Transitions._transitions as Map<string, TransitionFunction>;
    }

    // AS3: Transitions.as::registerDefaults()
    private static registerDefaults(): void
    {
        const transitions = new Map<string, TransitionFunction>();

        Transitions._transitions = transitions;

        transitions.set('linear', Transitions.linear);
        transitions.set('easeIn', Transitions.easeIn);
        transitions.set('easeOut', Transitions.easeOut);
        transitions.set('easeInOut', Transitions.easeInOut);
        transitions.set('easeOutIn', Transitions.easeOutIn);
        transitions.set('easeInBack', Transitions.easeInBack);
        transitions.set('easeOutBack', Transitions.easeOutBack);
        transitions.set('easeInOutBack', Transitions.easeInOutBack);
        transitions.set('easeOutInBack', Transitions.easeOutInBack);
        transitions.set('easeInElastic', Transitions.easeInElastic);
        transitions.set('easeOutElastic', Transitions.easeOutElastic);
        transitions.set('easeInOutElastic', Transitions.easeInOutElastic);
        transitions.set('easeOutInElastic', Transitions.easeOutInElastic);
        transitions.set('easeInBounce', Transitions.easeInBounce);
        transitions.set('easeOutBounce', Transitions.easeOutBounce);
        transitions.set('easeInOutBounce', Transitions.easeInOutBounce);
        transitions.set('easeOutInBounce', Transitions.easeOutInBounce);
    }

    // AS3: Transitions.as::linear()
    protected static linear(ratio: number): number
    {
        return ratio;
    }

    // AS3: Transitions.as::easeIn()
    protected static easeIn(ratio: number): number
    {
        return ratio * ratio * ratio;
    }

    // AS3: Transitions.as::easeOut()
    protected static easeOut(ratio: number): number
    {
        const shifted = ratio - 1;

        return shifted * shifted * shifted + 1;
    }

    // AS3: Transitions.as::easeInOut()
    protected static easeInOut(ratio: number): number
    {
        return Transitions.easeCombined(Transitions.easeIn, Transitions.easeOut, ratio);
    }

    // AS3: Transitions.as::easeOutIn()
    protected static easeOutIn(ratio: number): number
    {
        return Transitions.easeCombined(Transitions.easeOut, Transitions.easeIn, ratio);
    }

    // AS3: Transitions.as::easeInBack()
    protected static easeInBack(ratio: number): number
    {
        return Math.pow(ratio, 2) * ((Transitions.BACK_OVERSHOOT + 1) * ratio - Transitions.BACK_OVERSHOOT);
    }

    // AS3: Transitions.as::easeOutBack()
    protected static easeOutBack(ratio: number): number
    {
        const shifted = ratio - 1;

        return Math.pow(shifted, 2) * ((Transitions.BACK_OVERSHOOT + 1) * shifted + Transitions.BACK_OVERSHOOT) + 1;
    }

    // AS3: Transitions.as::easeInOutBack()
    protected static easeInOutBack(ratio: number): number
    {
        return Transitions.easeCombined(Transitions.easeInBack, Transitions.easeOutBack, ratio);
    }

    // AS3: Transitions.as::easeOutInBack()
    protected static easeOutInBack(ratio: number): number
    {
        return Transitions.easeCombined(Transitions.easeOutBack, Transitions.easeInBack, ratio);
    }

    // AS3: Transitions.as::easeInElastic()
    protected static easeInElastic(ratio: number): number
    {
        if(ratio === 0 || ratio === 1) return ratio;

        const period = 0.3;
        const shift = period / 4;
        const shifted = ratio - 1;

        return -1 * Math.pow(2, 10 * shifted) * Math.sin((shifted - shift) * (2 * Math.PI) / period);
    }

    // AS3: Transitions.as::easeOutElastic()
    protected static easeOutElastic(ratio: number): number
    {
        if(ratio === 0 || ratio === 1) return ratio;

        const period = 0.3;
        const shift = period / 4;

        return Math.pow(2, -10 * ratio) * Math.sin((ratio - shift) * (2 * Math.PI) / period) + 1;
    }

    // AS3: Transitions.as::easeInOutElastic()
    protected static easeInOutElastic(ratio: number): number
    {
        return Transitions.easeCombined(Transitions.easeInElastic, Transitions.easeOutElastic, ratio);
    }

    // AS3: Transitions.as::easeOutInElastic()
    protected static easeOutInElastic(ratio: number): number
    {
        return Transitions.easeCombined(Transitions.easeOutElastic, Transitions.easeInElastic, ratio);
    }

    // AS3: Transitions.as::easeInBounce()
    protected static easeInBounce(ratio: number): number
    {
        return 1 - Transitions.easeOutBounce(1 - ratio);
    }

    // AS3: Transitions.as::easeOutBounce()
    protected static easeOutBounce(ratio: number): number
    {
        const s = 7.5625;
        const p = 2.75;

        if(ratio < 1 / p) return s * Math.pow(ratio, 2);

        if(ratio < 2 / p) return s * Math.pow(ratio - 1.5 / p, 2) + 0.75;

        if(ratio < 2.5 / p) return s * Math.pow(ratio - 2.25 / p, 2) + 0.9375;

        return s * Math.pow(ratio - 2.625 / p, 2) + 0.984375;
    }

    // AS3: Transitions.as::easeInOutBounce()
    protected static easeInOutBounce(ratio: number): number
    {
        return Transitions.easeCombined(Transitions.easeInBounce, Transitions.easeOutBounce, ratio);
    }

    // AS3: Transitions.as::easeOutInBounce()
    protected static easeOutInBounce(ratio: number): number
    {
        return Transitions.easeCombined(Transitions.easeOutBounce, Transitions.easeInBounce, ratio);
    }

    // AS3: Transitions.as::easeCombined()
    protected static easeCombined(first: TransitionFunction, second: TransitionFunction, ratio: number): number
    {
        if(ratio < 0.5) return 0.5 * first(ratio * 2);

        return 0.5 * second((ratio - 0.5) * 2) + 0.5;
    }
}
