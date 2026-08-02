/**
 * The sound ids the rest of the client asks for, by name.
 *
 * These are *not* asset names: `HabboSoundManagerFlash10.getSoundBySoundId()` maps each one
 * onto the `*Com.as` field the mp3 is registered under (`HBST_message_received` ->
 * `sound_console_new_message`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/HabboSoundTypesEnum.as
 */
export class HabboSoundTypesEnum
{
    // AS3: .../sound/HabboSoundTypesEnum.as::SOUND_CALL_FOR_HELP
    static readonly SOUND_CALL_FOR_HELP: string = 'HBST_call_for_help';

    // AS3: .../sound/HabboSoundTypesEnum.as::SOUND_CREDIT_BALANCE
    static readonly SOUND_CREDIT_BALANCE: string = 'HBST_purchase';

    // AS3: .../sound/HabboSoundTypesEnum.as::SOUND_DUCKET_BALANCE
    static readonly SOUND_DUCKET_BALANCE: string = 'HBST_pixels';

    // AS3: .../sound/HabboSoundTypesEnum.as::SOUND_MESSAGE_SENT
    static readonly SOUND_MESSAGE_SENT: string = 'HBST_message_sent';

    // AS3: .../sound/HabboSoundTypesEnum.as::SOUND_MESSAGE_RECEIVED
    static readonly SOUND_MESSAGE_RECEIVED: string = 'HBST_message_received';

    // AS3: .../sound/HabboSoundTypesEnum.as::SOUND_GUIDE_INVITATION
    static readonly SOUND_GUIDE_INVITATION: string = 'HBST_guide_invitation';

    // AS3: .../sound/HabboSoundTypesEnum.as::SOUND_GUIDE_REQUEST
    static readonly SOUND_GUIDE_REQUEST: string = 'HBST_guide_request';

    // AS3: .../sound/HabboSoundTypesEnum.as::SOUND_RESPECT
    static readonly SOUND_RESPECT: string = 'HBST_respect';

    // AS3: .../sound/HabboSoundTypesEnum.as::GAMES_SW_GET_SNOWBALL
    static readonly GAMES_SW_GET_SNOWBALL: string = 'HBSTG_snowwar_get_snowball';

    // AS3: .../sound/HabboSoundTypesEnum.as::GAMES_SW_HIT1
    static readonly GAMES_SW_HIT1: string = 'HBSTG_snowwar_hit1';

    // AS3: .../sound/HabboSoundTypesEnum.as::GAMES_SW_HIT2
    static readonly GAMES_SW_HIT2: string = 'HBSTG_snowwar_hit2';

    // AS3: .../sound/HabboSoundTypesEnum.as::GAMES_SW_HIT3
    static readonly GAMES_SW_HIT3: string = 'HBSTG_snowwar_hit3';

    // AS3: .../sound/HabboSoundTypesEnum.as::GAMES_SW_MAKE_SNOWBALL
    static readonly GAMES_SW_MAKE_SNOWBALL: string = 'HBSTG_snowwar_make_snowball';

    // AS3: .../sound/HabboSoundTypesEnum.as::GAMES_SW_MISS
    static readonly GAMES_SW_MISS: string = 'HBSTG_snowwar_miss';

    // AS3: .../sound/HabboSoundTypesEnum.as::GAMES_SW_THROW
    static readonly GAMES_SW_THROW: string = 'HBSTG_snowwar_throw';

    // AS3: .../sound/HabboSoundTypesEnum.as::GAMES_SW_WALK
    static readonly GAMES_SW_WALK: string = 'HBSTG_snowwar_walk';

    // AS3: .../sound/HabboSoundTypesEnum.as::GAMES_IG_COUNTDOWN
    static readonly GAMES_IG_COUNTDOWN: string = 'HBSTG_ig_countdown';

    // AS3: .../sound/HabboSoundTypesEnum.as::GAMES_IG_WINNING
    static readonly GAMES_IG_WINNING: string = 'HBSTG_ig_winning';

    // AS3: .../sound/HabboSoundTypesEnum.as::GAMES_IG_LOSING
    static readonly GAMES_IG_LOSING: string = 'HBSTG_ig_losing';

    // AS3: .../sound/HabboSoundTypesEnum.as::FURNITURE_SOUND_CUCKOO_CLOCK
    static readonly FURNITURE_SOUND_CUCKOO_CLOCK: string = 'FURNITURE_cuckoo_clock';

    // AS3: .../sound/HabboSoundTypesEnum.as::CAMERA_SHUTTER
    static readonly CAMERA_SHUTTER: string = 'CAMERA_shutter';
}
