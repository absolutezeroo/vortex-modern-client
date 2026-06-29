/**
 * Poll Question Type Constants
 *
 * @see source_as_win63/habbo/communication/enum/poll/class_3840.as
 */
export const PollQuestionType = {
	RADIO: 1,
	CHECKBOX: 2,
	TEXT: 3,
	SELECTION: 4,
	RATING: 5,
	BINARY: 6,
} as const;

export type PollQuestionTypeValue = typeof PollQuestionType[keyof typeof PollQuestionType];
