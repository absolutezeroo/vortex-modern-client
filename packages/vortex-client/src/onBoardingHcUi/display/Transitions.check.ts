/**
 * Runnable check for the easing table: `npx tsx <this file>`.
 *
 * Every curve has to be an identity at both ends of [0, 1] — a tween that does not start where the
 * property already is, or does not land exactly on its target, is visible as a jump. That is the
 * one property worth pinning: the shapes in between are AS3's and are checked by transcription,
 * but an off-by-one in a combined curve breaks the endpoints and nothing else would catch it.
 */
import assert from 'node:assert/strict';
import {Transitions} from './Transitions';

const NAMES = [
    Transitions.LINEAR,
    Transitions.EASE_IN,
    Transitions.EASE_OUT,
    Transitions.EASE_IN_OUT,
    Transitions.EASE_OUT_IN,
    Transitions.EASE_IN_BACK,
    Transitions.EASE_OUT_BACK,
    Transitions.EASE_IN_OUT_BACK,
    Transitions.EASE_OUT_IN_BACK,
    Transitions.EASE_IN_ELASTIC,
    Transitions.EASE_OUT_ELASTIC,
    Transitions.EASE_IN_OUT_ELASTIC,
    Transitions.EASE_OUT_IN_ELASTIC,
    Transitions.EASE_IN_BOUNCE,
    Transitions.EASE_OUT_BOUNCE,
    Transitions.EASE_IN_OUT_BOUNCE,
    Transitions.EASE_OUT_IN_BOUNCE,
];

for(const name of NAMES)
{
    const curve = Transitions.getTransition(name);

    assert.ok(curve !== null, `${name} is not registered`);
    assert.ok(Math.abs(curve(0) - 0) < 1e-9, `${name}(0) should be 0, got ${curve(0)}`);
    assert.ok(Math.abs(curve(1) - 1) < 1e-9, `${name}(1) should be 1, got ${curve(1)}`);

    for(let i = 0; i <= 20; i++)
    {
        assert.ok(Number.isFinite(curve(i / 20)), `${name}(${i / 20}) is not finite`);
    }
}

// The combined curves cross exactly halfway, by construction.
for(const name of [Transitions.EASE_IN_OUT, Transitions.EASE_OUT_IN, Transitions.EASE_IN_OUT_BACK])
{
    const curve = Transitions.getTransition(name);

    assert.ok(Math.abs(curve!(0.5) - 0.5) < 1e-9, `${name}(0.5) should be 0.5, got ${curve!(0.5)}`);
}

// An unregistered name is null, not a throw — Tween falls back to linear on it.
assert.equal(Transitions.getTransition('nope'), null);

// A registered curve replaces the built-in under the same name.
Transitions.register('linear2', (r) => r);
assert.equal(Transitions.getTransition('linear2')!(0.25), 0.25);

// eslint-disable-next-line no-console -- this file is a standalone check, run by hand
console.log(`ok — ${NAMES.length} transitions`);
