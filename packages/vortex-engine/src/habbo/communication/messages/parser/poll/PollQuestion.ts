import type {PollChoice} from './PollChoice';

/**
 * One question of a poll, with its answer choices and its follow-up questions.
 *
 * The `children` are the NPS branch: a top-level question can carry follow-ups that only apply
 * once you have picked a choice of a matching `questionCategory`.
 *
 * Class name DERIVED: the AS3 file is `_SafeCls_4294.as` and the identifier exists in no tree.
 * Named after `questionId`/`questionText`/`questionChoices`, which are readable.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2704/_SafeCls_4294.as
 */
export class PollQuestion
{
    // AS3: .../_SafePkg_2704/_SafeCls_4294.as::QUESTION_TYPE_UNKNOWN
    // The four constants are obfuscated (`_SafeStr_10544` etc.) and exist in no tree, so their
    // names are DERIVED from how `PollContentDialog` uses them: it switches on
    // `questionType - 1`, giving 1=radio, 2=checkbox, 3=text line, 4=text area. The constants
    // themselves are 0-3, i.e. the same ladder one lower — 0 is the unused zero slot.
    public static readonly QUESTION_TYPE_UNKNOWN: number = 0;

    // AS3: .../_SafePkg_2704/_SafeCls_4294.as::QUESTION_TYPE_RADIO
    public static readonly QUESTION_TYPE_RADIO: number = 1;

    // AS3: .../_SafePkg_2704/_SafeCls_4294.as::QUESTION_TYPE_CHECKBOX
    public static readonly QUESTION_TYPE_CHECKBOX: number = 2;

    // AS3: .../_SafePkg_2704/_SafeCls_4294.as::QUESTION_TYPE_TEXT
    public static readonly QUESTION_TYPE_TEXT: number = 3;

    // AS3: .../_SafePkg_2704/_SafeCls_4294.as::_questionId
    public questionId: number = 0;

    // AS3: .../_SafePkg_2704/_SafeCls_4294.as::_questionType
    public questionType: number = 0;

    // AS3: .../_SafePkg_2704/_SafeCls_4294.as::_sortOrder
    public sortOrder: number = 0;

    // AS3: .../_SafePkg_2704/_SafeCls_4294.as::_questionText
    public questionText: string = '';

    // AS3: .../_SafePkg_2704/_SafeCls_4294.as::_questionCategory
    public questionCategory: number = 0;

    // AS3: .../_SafePkg_2704/_SafeCls_4294.as::_questionAnswerType
    public questionAnswerType: number = 0;

    // AS3: .../_SafePkg_2704/_SafeCls_4294.as::_questionAnswerCount
    public questionAnswerCount: number = 0;

    // AS3: .../_SafePkg_2704/_SafeCls_4294.as::_children
    public children: PollQuestion[] = [];

    // AS3: .../_SafePkg_2704/_SafeCls_4294.as::_questionChoices
    public questionChoices: PollChoice[] = [];
}
