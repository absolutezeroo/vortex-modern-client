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
    // AS3: .../src/com/sulake/habbo/avatar/_SafeCls_581.as::createAvatarImage()
    createAvatarImage(
        figureString: string,
        scale: string,
        gender: string | null,
        listener: IAvatarImageListener | null,
        effectListener: IAvatarEffectListener | null
    ): IAvatarImage | null;

    // AS3: .../src/com/sulake/habbo/avatar/_SafeCls_581.as::getFigureData()
    getFigureData(): IFigureData;

    // AS3: .../src/com/sulake/habbo/avatar/_SafeCls_581.as::getFigureStringWithFigureIds()
    getFigureStringWithFigureIds(figureString: string, gender: string, figureIds: number[]): string;

    // AS3: .../src/com/sulake/habbo/avatar/_SafeCls_581.as::isValidFigureSetForGender()
    isValidFigureSetForGender(setId: number, gender: string): boolean;

    // AS3: .../src/com/sulake/habbo/avatar/_SafeCls_581.as::getMandatoryAvatarPartSetIds()
    getMandatoryAvatarPartSetIds(gender: string, clubLevel: number): string[];

    // AS3: .../src/com/sulake/habbo/avatar/_SafeCls_581.as::createFigureContainer()
    createFigureContainer(figureString: string): IAvatarFigureContainer;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/avatar/_SafeCls_581.as::resolveClubLevel()
    resolveClubLevel(container: IAvatarFigureContainer, gender: string, partTypes?: string[] | null): number;

    // AS3: .../src/com/sulake/habbo/avatar/_SafeCls_581.as::isFigureReady()
    isFigureReady(figure: IAvatarFigureContainer): boolean;

    // AS3: .../src/com/sulake/habbo/avatar/_SafeCls_581.as::downloadFigure()
    downloadFigure(figure: IAvatarFigureContainer, listener: IAvatarImageListener | null): void;

    // AS3: .../src/com/sulake/habbo/avatar/_SafeCls_581.as::injectFigureData()
    injectFigureData(data: any): void;

    // AS3: .../src/com/sulake/habbo/avatar/_SafeCls_581.as::get isReady()
    get isReady(): boolean;

    // AS3: .../src/com/sulake/habbo/avatar/_SafeCls_581.as::get events()
    get events(): EventEmitter;

    // AS3: .../src/com/sulake/habbo/avatar/_SafeCls_581.as::get effectMap()
    get effectMap(): Map<string, any>;
}
