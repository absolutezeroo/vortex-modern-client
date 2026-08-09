import type {IDisposable} from '@core/runtime/IDisposable';

/**
 * The contract every bot-skill editor implements, so `AvatarInfoWidget` can keep one of each in a
 * map and open them by skill id without knowing which is which.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/avatarinfo/botskills/_SafeCls_2698.as
 *
 * **The interface name is DERIVED** — it is obfuscated in every tree (it extends the equally
 * obfuscated `_SafeCls_47`, this port's `IDisposable`). Its three members are real.
 */
export interface IBotSkillConfigurationView extends IDisposable
{
    // AS3: .../_SafeCls_2698.as::open()
    open(botId: number, position: {x: number; y: number} | null): void;

    // AS3: .../_SafeCls_2698.as::close()
    close(): void;

    // AS3: .../_SafeCls_2698.as::parseConfiguration()
    parseConfiguration(data: string): void;
}
