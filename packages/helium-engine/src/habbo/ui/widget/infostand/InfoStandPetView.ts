/**
 * InfoStandPetView
 *
 * TODO(AS3): sources/win63_version/habbo/ui/widget/infostand/InfoStandPetView.as
 * Out of scope for the furni-only infostand port — see InfoStandUserView.ts for
 * the general rationale (thin stub, `window` always `null`).
 */
import type {IWindow} from '@core/window/IWindow';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {InfoStandWidget} from './InfoStandWidget';
import type {InfoStandPetData} from './InfoStandPetData';
import type {CommandConfiguration} from './CommandConfiguration';

export class InfoStandPetView
{
    constructor(_widget: InfoStandWidget, _name: string, _catalog: IHabboCatalog | null)
    {
    }

    public get window(): IWindow | null
    {
        return null;
    }

    public dispose(): void
    {
    }

    // TODO(AS3): InfoStandPetView.as::update()
    public update(_petData: InfoStandPetData): void
    {
    }

    // TODO(AS3): InfoStandPetView.as::updateImage()
    public updateImage(_petId: number, _image: unknown): void
    {
    }

    // TODO(AS3): InfoStandPetView.as::updateEnabledTrainingCommands()
    public updateEnabledTrainingCommands(_id: number, _config: CommandConfiguration): void
    {
    }

    // TODO(AS3): InfoStandPetView.as::openTrainView()
    public openTrainView(): void
    {
    }

    // TODO(AS3): InfoStandPetView.as::closeTrainView()
    public closeTrainView(): void
    {
    }

    // TODO(AS3): InfoStandPetView.as::getCurrentPetId()
    public getCurrentPetId(): number
    {
        return -1;
    }
}
