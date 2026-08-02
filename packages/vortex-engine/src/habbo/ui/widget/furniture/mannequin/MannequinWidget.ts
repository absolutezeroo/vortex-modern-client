import type {BitmapDataAsset} from '@core/assets/BitmapDataAsset';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IIconWindow} from '@core/window/components/IIconWindow';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';

import type {IAvatarFigureContainer} from '@habbo/avatar/IAvatarFigureContainer';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import {
    SetMannequinFigureMessageComposer
} from '@habbo/communication/messages/outgoing/room/furniture/SetMannequinFigureMessageComposer';
import {
    SetMannequinNameMessageComposer
} from '@habbo/communication/messages/outgoing/room/furniture/SetMannequinNameMessageComposer';
import {
    UseFurnitureMessageComposer
} from '@habbo/communication/messages/outgoing/room/furniture/UseFurnitureMessageComposer';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {MannequinWidgetHandler} from '@habbo/ui/handler/MannequinWidgetHandler';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';

const log = Logger.getLogger('habbo.ui.widget.furniture.mannequin.MannequinWidget');

/**
 * MannequinWidget
 *
 * The clothing mannequin. One frame window whose *content* is swapped between five layouts
 * depending on who is looking and what they can wear: the owner's editor, its name-and-save
 * step, a visitor's wear button, a club upsell, and a wrong-gender notice.
 *
 * The preview is not the outfit as-is — `transformAsMannequinFigure()` strips every part
 * that is not one of the six clothing slots and swaps the head for the faceless
 * `hd-99999-99998`, which is what makes it look like a dummy rather than a person.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/mannequin/MannequinWidget.as
 */
export class MannequinWidget extends RoomWidgetBase
{
    // AS3: .../mannequin/MannequinWidget.as::CONTENT_CONTROLLER_MAIN
    private static readonly CONTENT_CONTROLLER_MAIN: number = 0;

    // AS3: .../mannequin/MannequinWidget.as::CONTENT_CONTROLLER_UPDATE
    private static readonly CONTENT_CONTROLLER_UPDATE: number = 1;

    // AS3: .../mannequin/MannequinWidget.as::CONTENT_PEER_MAIN
    private static readonly CONTENT_PEER_MAIN: number = 2;

    // AS3: .../mannequin/MannequinWidget.as::CONTENT_NO_CLUB
    private static readonly CONTENT_NO_CLUB: number = 3;

    // AS3: .../mannequin/MannequinWidget.as::CONTENT_WRONG_GENDER
    private static readonly CONTENT_WRONG_GENDER: number = 4;

    // AS3: .../mannequin/MannequinWidget.as::NAME_STATE_HINT
    private static readonly NAME_STATE_HINT: number = 0;

    // AS3: .../mannequin/MannequinWidget.as::NAME_STATE_WRITING
    private static readonly NAME_STATE_WRITING: number = 1;

    // AS3: .../mannequin/MannequinWidget.as::NAME_STATE_SAVED
    private static readonly NAME_STATE_SAVED: number = 2;

    // AS3: .../mannequin/MannequinWidget.as::NAME_TEXT_COLOR_SAVED
    private static readonly NAME_TEXT_COLOR_SAVED: number = 0;

    // AS3: .../mannequin/MannequinWidget.as::NAME_TEXT_COLOR_WRITING
    private static readonly NAME_TEXT_COLOR_WRITING: number = 8956552;

    // AS3: .../mannequin/MannequinWidget.as::NAME_TEXT_COLOR_HINT
    private static readonly NAME_TEXT_COLOR_HINT: number = 7829367;

    // AS3: .../mannequin/MannequinWidget.as::ICON_STYLE_CLUB
    private static readonly ICON_STYLE_CLUB: number = 13;

    // AS3: .../mannequin/MannequinWidget.as::ICON_STYLE_VIP
    private static readonly ICON_STYLE_VIP: number = 14;

    /** The six slots a mannequin can hold. Everything else is stripped from the preview. */
    // AS3: .../mannequin/MannequinWidget.as::MANNEQUIN_CLOTHING_PART_TYPES
    private static readonly MANNEQUIN_CLOTHING_PART_TYPES: string[] = ['ca', 'cc', 'ch', 'lg', 'sh', 'wa'];

    /** The faceless head: set 99999, colour 99998. */
    // AS3: .../mannequin/MannequinWidget.as::MANNEQUIN_FIGURE
    private static readonly MANNEQUIN_FIGURE: [string, number, number[]] = ['hd', 99999, [99998]];

    // AS3: .../mannequin/MannequinWidget.as::MannequinWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null,
        localizations: IHabboLocalizationManager | null
    )
    {
        super(handler, windowManager, assets, localizations);

        this.handler.widget = this;
    }

    // AS3: .../mannequin/MannequinWidget.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../mannequin/MannequinWidget.as::_SafeStr_6628
    private _objectId: number = 0;

    // AS3: .../mannequin/MannequinWidget.as::_SafeStr_7463
    private _figure: string = '';

    // AS3: .../mannequin/MannequinWidget.as::_SafeStr_8691
    private _gender: string = '';

    // AS3: .../mannequin/MannequinWidget.as::_SafeStr_6189
    private _clubLevel: number = 0;

    // AS3: .../mannequin/MannequinWidget.as::_savedOutfitName
    private _savedOutfitName: string = '';

    // AS3: .../mannequin/MannequinWidget.as::_SafeStr_8118
    private _nameState: number = -1;

    // AS3: .../mannequin/MannequinWidget.as::get handler()
    public get handler(): MannequinWidgetHandler
    {
        return this.widgetHandler as MannequinWidgetHandler;
    }

    /**
     * Which of the five contents opens is decided once, here: a controller always gets the
     * editor; everybody else is checked for gender first, then club level.
     */
    // AS3: .../mannequin/MannequinWidget.as::open()
    public open(objectId: number, figure: string, gender: string, savedOutfitName: string): void
    {
        this._objectId = objectId;
        this._figure = figure;
        this._gender = gender;
        this._savedOutfitName = savedOutfitName;

        const container = this.handler?.container ?? null;
        const roomSession = container?.roomSession ?? null;
        const sessionData = container?.sessionDataManager ?? null;
        const renderManager = container?.avatarRenderManager ?? null;

        if(sessionData === null || renderManager === null)
        {
            log.warn('Mannequin opened without a session data manager or avatar render manager - nothing to show');

            return;
        }

        const isController = (roomSession?.isRoomOwner ?? false)
            || (roomSession?.roomControllerLevel ?? 0) >= 1
            || sessionData.isAnyRoomController;

        this._clubLevel = renderManager.resolveClubLevel(
            renderManager.createFigureContainer(figure), this._gender, MannequinWidget.MANNEQUIN_CLOTHING_PART_TYPES
        );

        this.setWindowContent(this.resolveFirstWindowContent(
            isController, sessionData.gender, sessionData.clubLevel, gender, this._clubLevel
        ));

        this.setOutfitNameState(this.savedNameState());

        if(this._window !== null)
        {
            this._window.visible = true;
        }
    }

    // AS3: .../mannequin/MannequinWidget.as::resolveFirstWindowContent()
    private resolveFirstWindowContent(
        isController: boolean,
        viewerGender: string,
        viewerClubLevel: number,
        mannequinGender: string,
        requiredClubLevel: number
    ): number
    {
        if(isController) return MannequinWidget.CONTENT_CONTROLLER_MAIN;

        if(viewerGender.toLowerCase() !== mannequinGender.toLowerCase()) return MannequinWidget.CONTENT_WRONG_GENDER;

        if(viewerClubLevel < requiredClubLevel) return MannequinWidget.CONTENT_NO_CLUB;

        return MannequinWidget.CONTENT_PEER_MAIN;
    }

    /** TS-only: the `_savedOutfitName ? SAVED : HINT` expression AS3 repeats twice. */
    private savedNameState(): number
    {
        return this._savedOutfitName !== '' ? MannequinWidget.NAME_STATE_SAVED : MannequinWidget.NAME_STATE_HINT;
    }

    /**
     * Swaps the frame's single content child. The frame itself is built once and kept — only
     * its child is replaced, which is why every listener is re-attached on each switch.
     */
    // AS3: .../mannequin/MannequinWidget.as::setWindowContent()
    private setWindowContent(content: number): void
    {
        const container = this.handler?.container ?? null;
        const sessionData = container?.sessionDataManager ?? null;
        const renderManager = container?.avatarRenderManager ?? null;

        if(sessionData === null || renderManager === null) return;

        const ownFigure = sessionData.figure;
        const nameState = this.savedNameState();

        if(this._window === null)
        {
            this._window = this.buildLayout('mannequin_widget_frame_xml');

            if(this._window === null) return;

            this.addClickListener('header_button_close');
            this._window.center();
        }

        (this._window as unknown as IFrameWindow).content?.removeChildAt(0);

        const contentWindow = this.createWindow(content);

        if(contentWindow === null) return;

        (this._window as unknown as IFrameWindow).content?.addChild(contentWindow);

        let preview: ImageBitmap | null;
        let figureContainer: IAvatarFigureContainer;

        switch(content)
        {
            case MannequinWidget.CONTENT_CONTROLLER_MAIN:
                this.addClickListener('configure_button');
                this.addClickListener('wear_button');
                this.addTextFieldListener('outfit_name_set');
                this.addClickListener('outfit_name_set');

                figureContainer = renderManager.createFigureContainer(this._figure);
                MannequinWidget.transformAsMannequinFigure(figureContainer);
                preview = this.createAvatarImage(figureContainer.getFigureString());

                this.updateClubLevelView(this._clubLevel);
                this.setOutfitNameState(nameState);
                this.updateDecorations();
                break;
            case MannequinWidget.CONTENT_CONTROLLER_UPDATE:
                this.addClickListener('save_button');
                this.addClickListener('back_region');

                // The save step previews the *player's* outfit, not the mannequin's — it is
                // what is about to be copied onto it.
                figureContainer = renderManager.createFigureContainer(ownFigure);
                MannequinWidget.transformAsMannequinFigure(figureContainer);
                preview = this.createAvatarImage(figureContainer.getFigureString());

                this.updateClubLevelView(renderManager.resolveClubLevel(
                    figureContainer, sessionData.gender, MannequinWidget.MANNEQUIN_CLOTHING_PART_TYPES
                ));
                this.setOutfitNameState(nameState);
                break;
            case MannequinWidget.CONTENT_PEER_MAIN:
                this.addClickListener('wear_button');

                figureContainer = this.applyMannequinOutfit(ownFigure, this._figure);
                preview = this.createAvatarImage(figureContainer.getFigureString());

                this.updateClubLevelView(this._clubLevel);
                this.setOutfitNameState(nameState);
                break;
            case MannequinWidget.CONTENT_NO_CLUB:
                this.addClickListener('get_club_button');

                figureContainer = this.applyMannequinOutfit(ownFigure, this._figure);
                preview = this.createAvatarImage(figureContainer.getFigureString());

                this.updateClubLevelView(this._clubLevel);
                break;
            case MannequinWidget.CONTENT_WRONG_GENDER:
                this.addClickListener('ok_button');

                figureContainer = renderManager.createFigureContainer(this._figure);
                MannequinWidget.transformAsMannequinFigure(figureContainer);
                preview = this.createAvatarImage(figureContainer.getFigureString());

                this.updateClubLevelView(this._clubLevel);
                break;
            default:
                throw new Error(`Invalid type for mannequin widget content apply: ${content}`);
        }

        this.updatePreviewImage(contentWindow, preview);
    }

    // AS3: .../mannequin/MannequinWidget.as::createWindow()
    private createWindow(content: number): IWindowContainer | null
    {
        switch(content)
        {
            case MannequinWidget.CONTENT_CONTROLLER_MAIN:
                return this.buildLayout('mannequin_controller_main_xml');
            case MannequinWidget.CONTENT_CONTROLLER_UPDATE:
                return this.buildLayout('mannequin_controller_save_xml');
            case MannequinWidget.CONTENT_PEER_MAIN:
                return this.buildLayout('mannequin_peer_main_xml');
            case MannequinWidget.CONTENT_NO_CLUB:
                return this.buildLayout('mannequin_no_club_xml');
            case MannequinWidget.CONTENT_WRONG_GENDER:
                return this.buildLayout('mannequin_wrong_gender_xml');
            default:
                throw new Error(`Invalid type for mannequin widget content creation: ${content}`);
        }
    }

    /** TS-only: the asset lookup + buildFromXML pair every layout goes through. */
    private buildLayout(assetName: string): IWindowContainer | null
    {
        const asset = this.assets?.getAssetByName(assetName) as XmlAsset | null;

        if(asset === null || asset === undefined)
        {
            log.warn(`Missing mannequin layout "${assetName}"`);

            return null;
        }

        return this.windowManager.buildFromXML(asset.content as unknown as string) as IWindowContainer | null;
    }

    // AS3: .../mannequin/MannequinWidget.as::transformAsMannequinFigure()
    private static transformAsMannequinFigure(container: IAvatarFigureContainer): void
    {
        for(const partType of container.getPartTypeIds())
        {
            if(MannequinWidget.MANNEQUIN_CLOTHING_PART_TYPES.indexOf(partType) === -1)
            {
                container.removePart(partType);
            }
        }

        container.updatePart(
            MannequinWidget.MANNEQUIN_FIGURE[0], MannequinWidget.MANNEQUIN_FIGURE[1], MannequinWidget.MANNEQUIN_FIGURE[2]
        );
    }

    // AS3: .../mannequin/MannequinWidget.as::createAvatarImage()
    private createAvatarImage(figure: string): ImageBitmap | null
    {
        const renderManager = this.handler?.container?.avatarRenderManager ?? null;

        if(renderManager === null) return null;

        const avatarImage = renderManager.createAvatarImage(figure, 'h', null, null, null);

        if(avatarImage === null) return null;

        const cropped = avatarImage.getCroppedImage('full') as ImageBitmap | null;

        avatarImage.dispose();

        return cropped;
    }

    /** The viewer's own figure wearing the mannequin's six slots — what "wear this" would look like. */
    // AS3: .../mannequin/MannequinWidget.as::applyMannequinOutfit()
    private applyMannequinOutfit(ownFigure: string, mannequinFigure: string): IAvatarFigureContainer
    {
        const renderManager = this.handler.container!.avatarRenderManager!;
        const target = renderManager.createFigureContainer(ownFigure);
        const source = renderManager.createFigureContainer(mannequinFigure);

        for(const partType of MannequinWidget.MANNEQUIN_CLOTHING_PART_TYPES)
        {
            target.removePart(partType);
        }

        for(const partType of source.getPartTypeIds())
        {
            target.updatePart(partType, source.getPartSetId(partType), source.getPartColorIds(partType) ?? []);
        }

        return target;
    }

    // AS3: .../mannequin/MannequinWidget.as::updateClubLevelView()
    private updateClubLevelView(clubLevel: number): void
    {
        const icon = this._window?.findChildByName('club_icon') as IIconWindow | null;

        if(icon === null || icon === undefined) return;

        switch(clubLevel)
        {
            case 0:
                icon.visible = false;
                break;
            case 1:
                icon.style = MannequinWidget.ICON_STYLE_CLUB;
                icon.visible = true;
                break;
            case 2:
                icon.style = MannequinWidget.ICON_STYLE_VIP;
                icon.visible = true;
                break;
        }
    }

    /**
     * AS3 paints the background bitmap and then blits the avatar centred on top of it. This
     * port assigns the avatar alone: compositing two `ImageBitmap`s needs a canvas
     * round-trip, and the layout already carries the backdrop behind this slot.
     */
    // AS3: .../mannequin/MannequinWidget.as::updatePreviewImage()
    private updatePreviewImage(contentWindow: IWindowContainer | null, preview: ImageBitmap | null): void
    {
        if(contentWindow === null || preview === null) return;

        const image = contentWindow.findChildByName('preview_image') as IBitmapWrapperWindow | null;

        if(image === null) return;

        image.bitmap = preview;
    }

    // AS3: .../mannequin/MannequinWidget.as::updateDecorations()
    private updateDecorations(): void
    {
        const deco = this._window?.findChildByName('write_deco') as IBitmapWrapperWindow | null;

        if(deco === null || deco === undefined) return;

        const asset = this.assets?.getAssetByName('small_pen') as BitmapDataAsset | null;

        deco.bitmap = (asset?.content as ImageBitmap | null) ?? null;
        deco.disposesBitmap = false;
    }

    /** Hidden, not disposed — reopening the same mannequin reuses the frame. */
    // AS3: .../mannequin/MannequinWidget.as::close()
    private close(): void
    {
        if(this._window !== null)
        {
            this._window.visible = false;
        }
    }

    /**
     * The name field is a three-state control: grey italic hint, purple while typing, black
     * once saved. AS3's `default` falls back to the hint without clearing italics — ported
     * as written.
     */
    // AS3: .../mannequin/MannequinWidget.as::setOutfitNameState()
    private setOutfitNameState(state: number): void
    {
        this._nameState = state;

        const nameField = this._window?.findChildByName('outfit_name_set') as ITextWindow | null;
        const hint = this.handler?.container?.localization?.getLocalization('mannequin.widget.set_name_hint') ?? '';

        if(nameField !== null && nameField !== undefined)
        {
            switch(state)
            {
                case MannequinWidget.NAME_STATE_HINT:
                    nameField.text = hint;
                    nameField.textColor = MannequinWidget.NAME_TEXT_COLOR_HINT;
                    nameField.italic = true;
                    break;
                case MannequinWidget.NAME_STATE_WRITING:
                    nameField.textColor = MannequinWidget.NAME_TEXT_COLOR_WRITING;
                    nameField.italic = false;
                    break;
                case MannequinWidget.NAME_STATE_SAVED:
                    nameField.text = this._savedOutfitName;
                    nameField.textColor = MannequinWidget.NAME_TEXT_COLOR_SAVED;
                    nameField.italic = false;
                    break;
                default:
                    nameField.text = hint;
                    nameField.textColor = MannequinWidget.NAME_TEXT_COLOR_HINT;
                    break;
            }
        }

        const nameLabel = this._window?.findChildByName('outfit_name_show') as ITextWindow | null;

        if(nameLabel !== null && nameLabel !== undefined && this._savedOutfitName !== '')
        {
            nameLabel.text = `'${this._savedOutfitName}'`;
        }
    }

    // AS3: .../mannequin/MannequinWidget.as::clearNameField()
    private clearNameField(): void
    {
        const nameField = this._window?.findChildByName('outfit_name_set') as ITextWindow | null;

        if(nameField !== null && nameField !== undefined)
        {
            nameField.text = '';
        }
    }

    // AS3: .../mannequin/MannequinWidget.as::saveOutfit()
    private saveOutfit(): void
    {
        this.handler?.container?.connection?.send(new SetMannequinFigureMessageComposer(this._objectId));
    }

    // AS3: .../mannequin/MannequinWidget.as::saveOutfitName()
    private saveOutfitName(): void
    {
        const name = this.getNameFromView();

        this.handler?.container?.connection?.send(new SetMannequinNameMessageComposer(this._objectId, name));

        this._savedOutfitName = name;

        this.setOutfitNameState(MannequinWidget.NAME_STATE_SAVED);
    }

    /** An untouched field still holds the hint text, which must not be saved as a name. */
    // AS3: .../mannequin/MannequinWidget.as::getNameFromView()
    private getNameFromView(): string
    {
        const text = (this._window?.findChildByName('outfit_name_set') as ITextWindow | null)?.text ?? '';
        const hint = this.handler?.container?.localization?.getLocalization('mannequin.widget.set_name_hint') ?? '';

        return text === hint ? '' : text;
    }

    // AS3: .../mannequin/MannequinWidget.as::addClickListener()
    private addClickListener(name: string): void
    {
        this._window?.findChildByName(name)?.addEventListener('WME_CLICK', this.onMouseClick);
    }

    // AS3: .../mannequin/MannequinWidget.as::addTextFieldListener()
    private addTextFieldListener(name: string): void
    {
        this._window?.findChildByName(name)?.addEventListener('WKE_KEY_UP', this.onKeyTyped);
    }

    // AS3: .../mannequin/MannequinWidget.as::onKeyTyped()
    private onKeyTyped = (event: WindowKeyboardEvent): void =>
    {
        if(event.keyCode === 13)
        {
            this.saveOutfitName();
        }
        else if(this._nameState !== MannequinWidget.NAME_STATE_WRITING)
        {
            this.setOutfitNameState(MannequinWidget.NAME_STATE_WRITING);
        }
    };

    /**
     * `wear_button` re-checks club level and gender before sending: the content was chosen
     * when the window opened, and the player may have changed clothes since.
     */
    // AS3: .../mannequin/MannequinWidget.as::onMouseClick()
    private onMouseClick = (event: WindowMouseEvent): void =>
    {
        const container = this.handler?.container ?? null;
        const sessionData = container?.sessionDataManager ?? null;
        const name = (event.target as {name?: string} | null)?.name ?? '';

        switch(name)
        {
            case 'header_button_close':
            case 'cancel_text':
            case 'ok_button':
                this.close();
                break;
            case 'save_button':
                this.saveOutfit();
                this.close();
                break;
            case 'wear_button':
                if((sessionData?.clubLevel ?? 0) < this._clubLevel)
                {
                    this.setWindowContent(MannequinWidget.CONTENT_NO_CLUB);
                    break;
                }

                if((sessionData?.gender ?? '').toLowerCase() !== this._gender.toLowerCase())
                {
                    this.setWindowContent(MannequinWidget.CONTENT_WRONG_GENDER);
                    break;
                }

                container?.connection?.send(new UseFurnitureMessageComposer(this._objectId));
                this.close();
                break;
            case 'configure_button':
                this.saveOutfitName();
                this.setWindowContent(MannequinWidget.CONTENT_CONTROLLER_UPDATE);
                break;
            case 'back_region':
                this.setWindowContent(MannequinWidget.CONTENT_CONTROLLER_MAIN);
                break;
            case 'get_club_button':
                container?.catalog?.openClubCenter();
                this.close();
                break;
            case 'outfit_name_set':
                if(this._nameState === MannequinWidget.NAME_STATE_HINT)
                {
                    this.clearNameField();
                    this.setOutfitNameState(MannequinWidget.NAME_STATE_WRITING);
                    break;
                }

                if(this._nameState === MannequinWidget.NAME_STATE_SAVED)
                {
                    this.setOutfitNameState(MannequinWidget.NAME_STATE_WRITING);
                }
                break;
        }
    };

    // AS3: .../mannequin/MannequinWidget.as::dispose()
    public override dispose(): void
    {
        if(this.disposed) return;

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        super.dispose();
    }
}
