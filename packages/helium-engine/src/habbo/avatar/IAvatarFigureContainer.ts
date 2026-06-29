/**
 * Interface for avatar figure container that manages figure part sets and colors.
 *
 * @see sources/win63_version/habbo/avatar/class_3405.as (IAvatarFigureContainer)
 */
export interface IAvatarFigureContainer
{
	getPartTypeIds(): string[];

	hasPartType(type: string): boolean;

	getPartSetId(type: string): number;

	getPartColorIds(type: string): number[] | null;

	updatePart(type: string, setId: number, colorIds: number[]): void;

	removePart(type: string): void;

	getFigureString(): string;
}
