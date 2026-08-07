import type {IDisposable} from '@core/runtime/IDisposable';

/**
 * The two poll dialogs behind one door: `PollSession` holds each of them through this and only
 * ever calls `start()` and `dispose()`.
 *
 * Interface name DERIVED: the AS3 file is `_SafeCls_4235.as` and the identifier exists in no
 * tree. It extends `IDisposable` and adds exactly one method.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/poll/_SafeCls_4235.as
 */
export interface IPollDialog extends IDisposable
{
    // AS3: .../widget/poll/_SafeCls_4235.as::start()
    start(): void;
}
