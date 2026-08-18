/**
 * The issue-handling window, as the issue manager sees it.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/IIssueHandler.as
 */
import type {IDisposable} from '@core/runtime/IDisposable';

export interface IIssueHandler extends IDisposable
{
    // AS3: IIssueHandler.as::updateIssuesAndMessages()
    updateIssuesAndMessages(): void;

    // AS3: IIssueHandler.as::showDefaultSanction()
    showDefaultSanction(userId: number, userName: string): void;
}
