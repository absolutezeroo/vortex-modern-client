/**
 * Easing/transition functions for animations.
 *
 * Provides a registry of named easing functions that transform
 * a linear ratio (0-1) into a curved ratio for smooth animations.
 * Includes cubic, back, elastic, and bounce easing variants.
 *
 * @see source_as_win63/habbo/utils/animation/Transitions.as
 */
export class Transitions
{
	public static readonly LINEAR: string = 'linear';
	public static readonly EASE_IN: string = 'easeIn';
	public static readonly EASE_OUT: string = 'easeOut';
	public static readonly EASE_IN_OUT: string = 'easeInOut';
	public static readonly EASE_OUT_IN: string = 'easeOutIn';
	public static readonly EASE_IN_BACK: string = 'easeInBack';
	public static readonly EASE_OUT_BACK: string = 'easeOutBack';
	public static readonly EASE_IN_OUT_BACK: string = 'easeInOutBack';
	public static readonly EASE_OUT_IN_BACK: string = 'easeOutInBack';
	public static readonly EASE_IN_ELASTIC: string = 'easeInElastic';
	public static readonly EASE_OUT_ELASTIC: string = 'easeOutElastic';
	public static readonly EASE_IN_OUT_ELASTIC: string = 'easeInOutElastic';
	public static readonly EASE_OUT_IN_ELASTIC: string = 'easeOutInElastic';
	public static readonly EASE_IN_BOUNCE: string = 'easeInBounce';
	public static readonly EASE_OUT_BOUNCE: string = 'easeOutBounce';
	public static readonly EASE_IN_OUT_BOUNCE: string = 'easeInOutBounce';
	public static readonly EASE_OUT_IN_BOUNCE: string = 'easeOutInBounce';

	private static _transitions: Map<string, (ratio: number) => number> | null = null;

	/**
	 * Get a transition function by name.
	 *
	 * @param name The transition name (e.g. "linear", "easeIn")
	 * @returns The transition function, or null if not found
	 */
	static getTransition(name: string): ((ratio: number) => number) | null
	{
		if (Transitions._transitions === null)
		{
			Transitions.registerDefaults();
		}

		return Transitions._transitions!.get(name) ?? null;
	}

	/**
	 * Register a custom transition function.
	 *
	 * @param name The transition name
	 * @param func The transition function
	 */
	static register(name: string, func: (ratio: number) => number): void
	{
		if (Transitions._transitions === null)
		{
			Transitions.registerDefaults();
		}

		Transitions._transitions!.set(name, func);
	}

	/**
	 * Register all default transition functions.
	 */
	private static registerDefaults(): void
	{
		Transitions._transitions = new Map();
		Transitions._transitions.set('linear', Transitions.linear);
		Transitions._transitions.set('easeIn', Transitions.easeIn);
		Transitions._transitions.set('easeOut', Transitions.easeOut);
		Transitions._transitions.set('easeInOut', Transitions.easeInOut);
		Transitions._transitions.set('easeOutIn', Transitions.easeOutIn);
		Transitions._transitions.set('easeInBack', Transitions.easeInBack);
		Transitions._transitions.set('easeOutBack', Transitions.easeOutBack);
		Transitions._transitions.set('easeInOutBack', Transitions.easeInOutBack);
		Transitions._transitions.set('easeOutInBack', Transitions.easeOutInBack);
		Transitions._transitions.set('easeInElastic', Transitions.easeInElastic);
		Transitions._transitions.set('easeOutElastic', Transitions.easeOutElastic);
		Transitions._transitions.set('easeInOutElastic', Transitions.easeInOutElastic);
		Transitions._transitions.set('easeOutInElastic', Transitions.easeOutInElastic);
		Transitions._transitions.set('easeInBounce', Transitions.easeInBounce);
		Transitions._transitions.set('easeOutBounce', Transitions.easeOutBounce);
		Transitions._transitions.set('easeInOutBounce', Transitions.easeInOutBounce);
		Transitions._transitions.set('easeOutInBounce', Transitions.easeOutInBounce);
	}

	// --- Easing functions ---

	private static linear(ratio: number): number
	{
		return ratio;
	}

	private static easeIn(ratio: number): number
	{
		return ratio * ratio * ratio;
	}

	private static easeOut(ratio: number): number
	{
		const inv = ratio - 1;

		return inv * inv * inv + 1;
	}

	private static easeInOut(ratio: number): number
	{
		return Transitions.easeCombined(Transitions.easeIn, Transitions.easeOut, ratio);
	}

	private static easeOutIn(ratio: number): number
	{
		return Transitions.easeCombined(Transitions.easeOut, Transitions.easeIn, ratio);
	}

	private static easeInBack(ratio: number): number
	{
		const s = 1.70158;

		return Math.pow(ratio, 2) * ((s + 1) * ratio - s);
	}

	private static easeOutBack(ratio: number): number
	{
		const inv = ratio - 1;
		const s = 1.70158;

		return Math.pow(inv, 2) * ((s + 1) * inv + s) + 1;
	}

	private static easeInOutBack(ratio: number): number
	{
		return Transitions.easeCombined(Transitions.easeInBack, Transitions.easeOutBack, ratio);
	}

	private static easeOutInBack(ratio: number): number
	{
		return Transitions.easeCombined(Transitions.easeOutBack, Transitions.easeInBack, ratio);
	}

	private static easeInElastic(ratio: number): number
	{
		if (ratio === 0 || ratio === 1)
		{
			return ratio;
		}

		const p = 0.3;
		const s = p / 4;
		const inv = ratio - 1;

		return -1 * Math.pow(2, 10 * inv) * Math.sin((inv - s) * (2 * Math.PI) / p);
	}

	private static easeOutElastic(ratio: number): number
	{
		if (ratio === 0 || ratio === 1)
		{
			return ratio;
		}

		const p = 0.3;
		const s = p / 4;

		return Math.pow(2, -10 * ratio) * Math.sin((ratio - s) * (2 * Math.PI) / p) + 1;
	}

	private static easeInOutElastic(ratio: number): number
	{
		return Transitions.easeCombined(Transitions.easeInElastic, Transitions.easeOutElastic, ratio);
	}

	private static easeOutInElastic(ratio: number): number
	{
		return Transitions.easeCombined(Transitions.easeOutElastic, Transitions.easeInElastic, ratio);
	}

	private static easeInBounce(ratio: number): number
	{
		return 1 - Transitions.easeOutBounce(1 - ratio);
	}

	private static easeOutBounce(ratio: number): number
	{
		const s = 7.5625;
		const p = 2.75;

		if (ratio < 1 / p)
		{
			return s * Math.pow(ratio, 2);
		}

		if (ratio < 2 / p)
		{
			ratio -= 1.5 / p;

			return s * Math.pow(ratio, 2) + 0.75;
		}

		if (ratio < 2.5 / p)
		{
			ratio -= 2.25 / p;

			return s * Math.pow(ratio, 2) + 0.9375;
		}

		ratio -= 2.625 / p;

		return s * Math.pow(ratio, 2) + 0.984375;
	}

	private static easeInOutBounce(ratio: number): number
	{
		return Transitions.easeCombined(Transitions.easeInBounce, Transitions.easeOutBounce, ratio);
	}

	private static easeOutInBounce(ratio: number): number
	{
		return Transitions.easeCombined(Transitions.easeOutBounce, Transitions.easeInBounce, ratio);
	}

	/**
	 * Combine two easing functions: use the first for the first half,
	 * the second for the second half.
	 *
	 * @param easeIn The easing function for the first half
	 * @param easeOut The easing function for the second half
	 * @param ratio The input ratio (0-1)
	 * @returns The combined eased value
	 */
	private static easeCombined(
		easeIn: (ratio: number) => number,
		easeOut: (ratio: number) => number,
		ratio: number
	): number
	{
		if (ratio < 0.5)
		{
			return 0.5 * easeIn(ratio * 2);
		}

		return 0.5 * easeOut((ratio - 0.5) * 2) + 0.5;
	}
}
