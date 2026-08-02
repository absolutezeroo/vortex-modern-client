import type EventEmitter from 'eventemitter3';
import type {IAvatarFigureContainer} from './IAvatarFigureContainer';
import type {IAvatarImage} from './IAvatarImage';
import type {IAvatarImageListener} from './IAvatarImageListener';
import type {IAvatarEffectListener} from './IAvatarEffectListener';
import type {IFigureData} from './structure/IFigureData';

/**
 * Interface for the avatar render manager component.
 *
 * @see sources/win63_version/habbo/avatar/IAvatarRenderManager.as
 */
export interface IAvatarRenderManager
{
    /**
     * `gender` is `param3:String = null` in the AS3 (`_SafeCls_581.as`), and passing nothing is a
     * meaningful choice, not an omission: a gender makes the manager run `validateAvatarFigure()`,
     * which completes the figure with every mandatory part. A caller rendering a single garment —
     * `AvatarEditor`'s thumbnails — wants the garment alone and passes null.
     */
    createAvatarImage(
        figureString: string,
        scale: string,
        gender: string | null,
        listener: IAvatarImageListener | null,
        effectListener: IAvatarEffectListener | null
    ): IAvatarImage | null;

    getFigureData(): IFigureData;

    getFigureStringWithFigureIds(figureString: string, gender: string, figureIds: number[]): string;

    isValidFigureSetForGender(setId: number, gender: string): boolean;

    getMandatoryAvatarPartSetIds(gender: string, clubLevel: number): string[];

    createFigureContainer(figureString: string): IAvatarFigureContainer;

    isFigureReady(figure: IAvatarFigureContainer): boolean;

    downloadFigure(figure: IAvatarFigureContainer, listener: IAvatarImageListener | null): void;

    injectFigureData(data: any): void;

    get isReady(): boolean;

    get events(): EventEmitter;

    get effectMap(): Map<string, any>;
}
