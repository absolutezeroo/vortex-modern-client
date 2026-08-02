import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('habbo.sound.SoundContext');

/**
 * The shared Web Audio context every sound in this module plays through.
 *
 * TS-only: no AS3 counterpart — Flash has one implicit global mixer, so `flash.media.Sound`
 * needs no context to play into and none of the ported classes take one. A single shared
 * `AudioContext` is the closest equivalent; a per-sound context would be both wasteful
 * (browsers cap them at a few dozen) and wrong, since volume changes have to apply across
 * everything at once.
 *
 * Browsers start an `AudioContext` suspended until the page has seen a user gesture.
 * Decoding works while suspended, playback does not — so the context is resumed on the
 * first gesture *and* on every `play()`, and a sound started before the gesture is simply
 * inaudible rather than an error, which is what Flash's own autoplay-blocked behaviour
 * looked like.
 */
export class SoundContext
{
    private static _context: AudioContext | null = null;
    private static _gestureHooked: boolean = false;

    /** TS-only: the lazily created shared context, or null where Web Audio is unavailable. */
    static get context(): AudioContext | null
    {
        if(SoundContext._context === null)
        {
            if(typeof AudioContext === 'undefined')
            {
                return null;
            }

            SoundContext._context = new AudioContext();

            SoundContext.hookFirstGesture();
        }

        return SoundContext._context;
    }

    /** TS-only: resumes the context if a gesture has unblocked it; safe to call on every play. */
    static resume(): void
    {
        const context = SoundContext._context;

        if(context === null || context.state !== 'suspended')
        {
            return;
        }

        context.resume().catch(() =>
        {
            // Still blocked: no gesture yet. The next play() tries again.
        });
    }

    /** TS-only: decodes one encoded audio file into a buffer this context can play. */
    static async decode(data: ArrayBuffer): Promise<AudioBuffer | null>
    {
        const context = SoundContext.context;

        if(context === null)
        {
            return null;
        }

        try
        {
            return await context.decodeAudioData(data);
        }
        catch (error)
        {
            log.warn('Failed to decode audio data - the sound will be silent', error);

            return null;
        }
    }

    /** TS-only: resumes the context on the first pointer/key event the document sees. */
    private static hookFirstGesture(): void
    {
        if(SoundContext._gestureHooked || typeof document === 'undefined')
        {
            return;
        }

        SoundContext._gestureHooked = true;

        const onGesture = (): void =>
        {
            SoundContext.resume();

            document.removeEventListener('pointerdown', onGesture);
            document.removeEventListener('keydown', onGesture);
        };

        document.addEventListener('pointerdown', onGesture);
        document.addEventListener('keydown', onGesture);
    }
}
