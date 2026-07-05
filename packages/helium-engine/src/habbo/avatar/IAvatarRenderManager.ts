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
    createAvatarImage(
        figureString: string,
        scale: string,
        gender: string,
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
