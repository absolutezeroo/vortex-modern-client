import {Color, defaultFilterVert, Filter, GlProgram} from 'pixi.js';

/**
 * `flash.filters.GlowFilter`, as a PixiJS filter.
 *
 * Ten AS3 classes across this port construct one — the furni chest's floating icons, the wired
 * selection and variable-holder highlights, the avatar's variable-holder tint, the toolbar and
 * bottom-bar labels, the onboarding dialogs — and until now the port had no equivalent, so every
 * one of them either shipped without its halo or carried a `TODO(AS3)`.
 *
 * **How Flash's filter behaves, and what this reproduces.** The source's alpha channel is blurred
 * by `blurX`/`blurY`, multiplied by `strength` and clamped, and the result painted in `color` at
 * `alpha` — behind the source for an outer glow, clipped to the source for an inner one. Both
 * branches are here. The blur is a single 5x5 box spanning ±blur rather than `quality` successive
 * Gaussian passes: every call site in this port passes `quality` 1, and at the 2-6px radii they
 * use the visible difference is nil.
 *
 * TODO(AS3): `quality` and `knockout` are accepted for signature parity with
 * `flash.filters.GlowFilter` and ignored — no call site in the port passes anything but 1 and
 * false. `knockout` in particular would change what is drawn, so it must not be passed silently.
 *
 * The shader is GLSL only. The port never sets `preference` on `Application.init()`, so PixiJS
 * picks its WebGL default; a WGSL twin would have to be added before that changes.
 */
// TS-only: no AS3 counterpart — this is the Flash player's own filter, which AS3 imports from
// `flash.filters` and this port has to supply.
export class GlowFilter extends Filter
{
    /**
	 * No `#version` directive, deliberately: that is how every filter PixiJS ships is written,
	 * and it is what makes `GlProgram` inject the WebGL1 compatibility defines
	 * (`in` -> varying, `finalColor` -> gl_FragColor, `texture` -> texture2D).
	 */
    // TS-only: the filter's fragment shader — see the class doc for what it reproduces.
    private static readonly FRAGMENT: string = `
in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
// highp, matching the default filter vertex shader: the fragment stage defaults to mediump and
// WebGL refuses to link a program whose shared uniform has two precisions. PixiJS' own
// displacement filter declares it the same way.
uniform highp vec4 uInputSize;
uniform vec4 uInputClamp;

uniform vec3 uGlowColor;
uniform float uGlowAlpha;
uniform float uStrength;
uniform vec2 uBlur;
uniform float uInner;

void main(void)
{
    vec4 src = texture(uTexture, vTextureCoord);

    // 5x5 box over ±blur pixels: the taps land on -blur, -blur/2, 0, +blur/2, +blur.
    // Named tapStep because a plain 'step' would shadow the GLSL built-in of that name.
    vec2 tapStep = uBlur * uInputSize.zw * 0.5;
    float sum = 0.0;

    for(int y = -2; y <= 2; y++)
    {
        for(int x = -2; x <= 2; x++)
        {
            vec2 uv = clamp(vTextureCoord + vec2(float(x), float(y)) * tapStep, uInputClamp.xy, uInputClamp.zw);

            sum += texture(uTexture, uv).a;
        }
    }

    float blurred = sum / 25.0;

    // Everything here is premultiplied alpha, which is what the filter pipeline hands over.
    float outerA = clamp(blurred * uStrength, 0.0, 1.0) * uGlowAlpha;
    vec4 outer = src + vec4(uGlowColor * outerA, outerA) * (1.0 - src.a);

    float innerA = clamp((1.0 - blurred) * uStrength, 0.0, 1.0) * uGlowAlpha * src.a;
    vec4 inner = vec4(mix(src.rgb, uGlowColor * src.a, innerA), src.a);

    finalColor = mix(outer, inner, uInner);
}
`;

    /**
	 * Flash's own argument list and defaults, in order.
	 */
    // TS-only: mirrors `flash.filters.GlowFilter`'s constructor so the ported call sites read
    // like their AS3 originals.
    constructor(
        color: number = 0xFF0000,
        alpha: number = 1,
        blurX: number = 6,
        blurY: number = 6,
        strength: number = 2,
        quality: number = 1,
        inner: boolean = false,
        knockout: boolean = false
    )
    {
        const rgb = new Color(color).toArray();

        super({
            glProgram: GlProgram.from({
                vertex: defaultFilterVert,
                fragment: GlowFilter.FRAGMENT,
                name: 'glow-filter'
            }),
            resources: {
                glowUniforms: {
                    uGlowColor: {value: new Float32Array([rgb[0], rgb[1], rgb[2]]), type: 'vec3<f32>'},
                    uGlowAlpha: {value: alpha, type: 'f32'},
                    uStrength: {value: strength, type: 'f32'},
                    uBlur: {value: new Float32Array([blurX, blurY]), type: 'vec2<f32>'},
                    uInner: {value: inner ? 1 : 0, type: 'f32'}
                }
            },
            // Without this the glow is clipped to the sprite's own bounds.
            padding: Math.ceil(Math.max(blurX, blurY))
        });

        this._quality = quality;
        this._knockout = knockout;
    }

    // TS-only: kept only so a caller can read back what it passed; see the class TODO.
    private _quality: number;

    // TS-only: kept only so a caller can read back what it passed; see the class TODO.
    private _knockout: boolean;

    // TS-only: accepted for signature parity, not applied.
    get quality(): number
    {
        return this._quality;
    }

    // TS-only: accepted for signature parity, not applied.
    get knockout(): boolean
    {
        return this._knockout;
    }
}
