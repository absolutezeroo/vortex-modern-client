/**
 * InfoStandPetView
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as
 *
 * The pet infostand panel: name, rendered pet image, level/breed/age, respect count, the
 * happiness/experience/energy bars (or the monsterplant well-being/growth pair), and the action
 * button strip. Structure follows InfoStandFurniView, the sibling that already works against the
 * same `info_border` / `infostand_element_list` / `button_list` layout shape.
 *
 * TODO(AS3): PetCommandTool is not ported (only its CommandConfiguration is), so the training tool
 * is stubbed at four call sites — openTrainView(), closeTrainView(), updateEnabledTrainingCommands()
 * and update()'s "refresh the open command tool" tail. Each is marked below. Everything else in the
 * AS3 is ported. The `train` button still shows for an own pet, matching AS3; clicking it currently
 * only logs.
 *
 * AS3 caches the last InfoStandPetData per pet id purely to feed PetCommandTool on a later
 * openTrainView(); that cache is kept (_petDataCache) so the deferred tool has its data waiting.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IRarityItemPreviewOverlayWidget} from '@habbo/window/widgets/IRarityItemPreviewOverlayWidget';
import type {CountdownWidget} from '@habbo/window/widgets/CountdownWidget';
import {Logger} from '@core/utils/Logger';
import {RoomWidgetFurniActionMessage} from '../messages/RoomWidgetFurniActionMessage';
import {RoomWidgetUserActionMessage} from '../messages/RoomWidgetUserActionMessage';
import {SecondsFormatter} from './SecondsFormatter';
import type {CommandConfiguration} from './CommandConfiguration';
import type {InfoStandPetData} from './InfoStandPetData';
import type {InfoStandWidget} from './InfoStandWidget';

const log = Logger.getLogger('InfoStandPetView');

// AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::STATUS_BAR_WIDTH
const STATUS_BAR_WIDTH = 162;
const STATUS_BAR_HEIGTH = 16;
const STATUS_BAR_HIGHLIGHT_HEIGHT = 4;
const STATUS_BAR_BORDER_COLOR = 14342874;
const STATUS_BAR_BG_COLOR = 3815994;
const STATUS_BAR_HAPPINESS_HIGHLIGHT_COLOR = 2085362;
const STATUS_BAR_HAPPINESS_CONTENT_COLOR = 39616;
const STATUS_BAR_EXPERIENCE_HIGHLIGHT_COLOR = 10513106;
const STATUS_BAR_EXPERIENCE_CONTENT_COLOR = 8734654;
const STATUS_BAR_ENERGY_HIGHLIGHT_COLOR = 9094430;
const STATUS_BAR_ENERGY_CONTENT_COLOR = 6200576;
const STATUS_BAR_WELLBEING_HIGHLIGHT_COLOR = 9094430;
const STATUS_BAR_WELLBEING_CONTENT_COLOR = 6200576;

// AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::STATE_HAPPINESS
const STATE_HAPPINESS = 'happiness';
const STATE_EXPERIENCE = 'experience';
const STATE_ENERGY = 'energy';
const STATE_WELLBEING = 'wellbeing';
const STATE_GROWTH = 'growth';

// AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::BUTTONS_MAX_WIDTH
const BUTTONS_MAX_WIDTH = 250;
const BUTTON_HEIGHT = 25;
const BUTTON_MARGIN = 5;

// The monsterplant is the one pet type with a growth/well-being panel instead of the standard
// happiness/experience/energy one; type 15 is the one with the enhancement skill indicator.
const PET_TYPE_MONSTERPLANT = 16;
const PET_TYPE_ENHANCEABLE = 15;

// AS3 keeps its colours as uint literals and hands them to BitmapData.fillRect(); a canvas needs
// the CSS form, and going through toString(16) avoids hand-converting each constant.
function toCssColor(value: number): string
{
    return `#${value.toString(16).padStart(6, '0')}`;
}

export class InfoStandPetView
{
    private readonly _widget: InfoStandWidget;
    private readonly _catalog: IHabboCatalog | null;
    private _window: IItemListWindow | null = null;
    private _infoBorder: IWindowContainer | null = null;
    private _elementList: IItemListWindow | null = null;
    private _buttonsContainer: IWindowContainer | null = null;
    private _currentPetId: number = 0;
    private _petDataCache: Map<number, InfoStandPetData> | null = new Map();

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::InfoStandPetView()
    // AS3 also grabs HabboTracking.getInstance() for the buy-food click; this port reads tracking
    // off the handler container instead (as InfoStandFurniView does), so there is no field for it.
    constructor(widget: InfoStandWidget, name: string, catalog: IHabboCatalog | null)
    {
        this._widget = widget;
        this._catalog = catalog;

        this.createWindow(name);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::get window()
    public get window(): IItemListWindow | null
    {
        return this._window;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::getCurrentPetId()
    public getCurrentPetId(): number
    {
        return this._currentPetId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::update()
    public update(petData: InfoStandPetData): void
    {
        this.setName(petData.name);
        this.setImage(petData.image);
        this.setOwnerName(petData.ownerName);
        this.setBreedText(
            this._widget.localizations?.getLocalization(this.getBreedLocalizationKey(petData.type, petData.breedId)) ?? ''
        );
        this.updatePetRespect(petData.petRespect, petData.type !== PET_TYPE_MONSTERPLANT);
        this.setAgeText(petData.age);
        this.setLevelText(petData.level, petData.levelMax, petData.type !== PET_TYPE_MONSTERPLANT);
        this.setSpecialSkillLevel(petData.level, petData.skillTresholds, petData.type);
        this.setRarityLevel(petData.rarityLevel, petData.type);

        if(petData.type === PET_TYPE_MONSTERPLANT)
        {
            this.showStatusContainer('default', false);
            this.showStatusContainer('monsterplant', true);

            this.updateStateElement(
                STATE_WELLBEING, petData.remainingWellBeingSeconds, petData.maxWellBeingSeconds,
                STATUS_BAR_WELLBEING_CONTENT_COLOR, STATUS_BAR_WELLBEING_HIGHLIGHT_COLOR,
                SecondsFormatter.formatSeconds(petData.remainingWellBeingSeconds)
            );
            this.updateStateWidget(STATE_GROWTH, petData.remainingGrowingSeconds);

            this.showButton('petrespect', false);

            // AS3 only offers the treat button while the plant is not already ~full on energy.
            this.showButton('pettreat', petData.energy > 0 ? (petData.energy / petData.energyMax) < 0.98 : false);

            this.showButton('train', false);
            this.showButton('buy_food', false);
            this.showButton('kick', false);
            this.showButton('pick', petData.canRemovePet);
            this.showRarityItem(petData.rarityLevel >= 0, petData);
        }
        else
        {
            this.showStatusContainer('default', true);
            this.showStatusContainer('monsterplant', false);

            this.showButton('petrespect', true);
            this.showButton('pettreat', false);
            this.showButton('train', petData.isOwnPet);
            this.showButton('pick', petData.isOwnPet);
            this.showButton('buy_food', true);
            this.showButton('kick', petData.canRemovePet);

            this.updateStateElement(
                STATE_HAPPINESS, petData.nutrition, petData.nutritionMax,
                STATUS_BAR_HAPPINESS_CONTENT_COLOR, STATUS_BAR_HAPPINESS_HIGHLIGHT_COLOR
            );
            this.updateStateElement(
                STATE_EXPERIENCE, petData.experience, petData.experienceMax,
                STATUS_BAR_EXPERIENCE_CONTENT_COLOR, STATUS_BAR_EXPERIENCE_HIGHLIGHT_COLOR
            );
            this.updateStateElement(
                STATE_ENERGY, petData.energy, petData.energyMax,
                STATUS_BAR_ENERGY_CONTENT_COLOR, STATUS_BAR_ENERGY_HIGHLIGHT_COLOR
            );
            this.updateRespectButton();
        }

        const roomSession = this._widget.handler.container?.roomSession ?? null;
        const isPlayTestMode = roomSession != null && roomSession.playTestMode;
        const roomControllerLevel = roomSession?.roomControllerLevel ?? 0;
        const isAnyRoomController = this._widget.handler.container?.sessionDataManager?.isAnyRoomController ?? false;
        const canMove = !isPlayTestMode && (roomControllerLevel >= 1 || petData.isOwnPet || isAnyRoomController);

        // Only the monsterplant is a furniture-like object you can move/rotate.
        this.showButton('move', canMove && petData.type === PET_TYPE_MONSTERPLANT);
        this.showButton('rotate', canMove && petData.type === PET_TYPE_MONSTERPLANT);

        this.updateWindow();

        this._currentPetId = petData.id;

        this._petDataCache?.delete(petData.id);
        this._petDataCache?.set(petData.id, petData);

        // TODO(AS3): AS3 refreshes an already-open PetCommandTool here via showCommandToolForPet(
        // id, name, image, type, level - lowerTreshold, experience / experienceMax,
        // upperTreshold - lowerTreshold, skillTresholds). Deferred with the tool.
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::updateImage()
    public updateImage(petId: number, image: ImageBitmap | null): void
    {
        if(this._currentPetId !== petId) return;

        this.setImage(image);
        this.updateWindow();

        // TODO(AS3): AS3 also forwards to PetCommandTool.updatePetImage() — deferred with the tool.
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::updateEnabledTrainingCommands()
    // TODO(AS3): forwards to PetCommandTool.setEnabledCommands(petId, config) — not ported.
    public updateEnabledTrainingCommands(_petId: number, _config: CommandConfiguration): void
    {
        log.debug('TODO(AS3): updateEnabledTrainingCommands needs PetCommandTool, not ported yet');
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::openTrainView()
    // TODO(AS3): constructs PetCommandTool on demand, shows it, and calls showCommandToolForPet()
    // with the cached InfoStandPetData for _currentPetId (still cached above, ready for it).
    public openTrainView(): void
    {
        log.debug('TODO(AS3): openTrainView needs PetCommandTool, not ported yet');
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::closeTrainView()
    // TODO(AS3): hides PetCommandTool when it is showing the current pet — not ported.
    public closeTrainView(): void
    {
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::dispose()
    public dispose(): void
    {
        this._infoBorder = null;
        this._elementList = null;
        this._buttonsContainer = null;

        this._window?.dispose();
        this._window = null;

        this._petDataCache?.clear();
        this._petDataCache = null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::createWindow()
    private createWindow(name: string): void
    {
        this._window = this._widget.windowManager.buildWidgetLayout('pet_view') as IItemListWindow | null;

        if(!this._window)
        {
            throw new Error('Failed to construct window from layout: pet_view');
        }

        this._infoBorder = this._window.getListItemByName('info_border') as IWindowContainer | null;

        if(this._infoBorder)
        {
            this._elementList = this._infoBorder.findChildByName('infostand_element_list') as IItemListWindow | null;
        }

        this._window.name = name;
        this._widget.mainContainer.addChild(this._window);

        this._infoBorder?.findChildByTag('close')?.addEventListener(WindowMouseEvent.CLICK, this.onClose);

        this._buttonsContainer = this._window.getListItemByName('button_list') as IWindowContainer | null;

        if(!this._buttonsContainer) return;

        const buttons: IWindow[] = [];

        this._buttonsContainer.groupChildrenWithTag('CMD_BUTTON', buttons, -1);

        for(const button of buttons) button.addEventListener(WindowMouseEvent.CLICK, this.onButtonClicked);

        this.setIcon('petrespect_icon', 'icon_petrespect');
        this.setIcon('status_happiness_icon', 'icon_pet_happiness');
        this.setIcon('status_experience_icon', 'icon_pet_experience');
        this.setIcon('status_energy_icon', 'icon_pet_energy');
        this.setIcon('skill_level_indicator', 'pet_skill_level_0');
        this.setIcon('status_wellbeing_icon', 'icon_pet_wellbeing');

        // AS3 runs this as a second pass over the same list, after the icons are in place.
        for(const button of buttons)
        {
            if(button.parent) button.parent.width = button.width;

            button.addEventListener('WE_RESIZED', this.onButtonResized);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::createWindow() (the six icon blocks)
    // AS3 repeats the same getAssetByName/clone/assign block per icon; folded into one helper.
    private setIcon(childName: string, assetName: string): void
    {
        const target = this._infoBorder?.findChildByName(childName) as IBitmapWrapperWindow | null;

        if(!target) return;

        const bitmap = (this._widget.assets?.getAssetByName(assetName)?.content ?? null) as ImageBitmap | null;

        if(bitmap) target.bitmap = bitmap;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::updateWindow()
    private updateWindow(): void
    {
        if(!this._window || !this._elementList || !this._infoBorder || !this._buttonsContainer) return;

        // AS3 opens updateWindow() with `_buttonsContainer.width = _buttonsContainer.width`, a
        // self-assign that only makes sense there if Flash's setter re-runs layout unconditionally.
        // In this port it is inert: WindowController's width setter is guarded by
        // `if(value !== this._width)` and returns immediately. Kept for AS3 traceability rather than
        // silently dropped — if the button strip ever fails to re-flow here, this is the line that
        // was supposed to do it, and arrangeButtons() is what actually sets the width in this port.
        // eslint-disable-next-line no-self-assign
        this._buttonsContainer.width = this._buttonsContainer.width;
        this._buttonsContainer.visible = this._buttonsContainer.width > 0;

        this._elementList.height = this._elementList.scrollableRegion.height;
        this._infoBorder.height = this._elementList.height + 20;

        this._window.width = Math.max(this._infoBorder.width, this._buttonsContainer.width);
        this._window.height = this._window.scrollableRegion.height;

        // Whichever of the two is narrower gets pushed to the right edge.
        if(this._infoBorder.width < this._buttonsContainer.width)
        {
            this._infoBorder.x = this._window.width - this._infoBorder.width;
            this._buttonsContainer.x = 0;
        }
        else
        {
            this._buttonsContainer.x = this._window.width - this._buttonsContainer.width;
            this._infoBorder.x = 0;
        }

        this._widget.refreshContainer();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::set name()
    private setName(value: string): void
    {
        const text = this._elementList?.getListItemByName('name_text') as ITextWindow | null;

        if(!text) return;

        text.text = value;
        text.visible = true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::set image()
    private setImage(value: ImageBitmap | null): void
    {
        if(!value || !this._elementList) return;

        const container = this._elementList.getListItemByName('image_container') as IWindowContainer | null;
        const target = container?.findChildByName('avatar_image') as IBitmapWrapperWindow | null;

        if(!target) return;

        // AS3 copyPixels() the pet into a transparent bitmap the size of the avatar_image slot,
        // centred — it does not scale. A canvas drawImage at the same offset is the equivalent.
        const canvas = new OffscreenCanvas(target.width, target.height);
        const context = canvas.getContext('2d');

        if(!context) return;

        context.drawImage(
            value,
            Math.round((target.width - value.width) / 2),
            Math.round((target.height - value.height) / 2)
        );

        target.bitmap = canvas.transferToImageBitmap();
        target.invalidate();

        this.updateWindow();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::setLevelText()
    // The text itself comes from the layout's ${pet.level} binding; AS3 only registers the
    // parameters and toggles visibility here — it never assigns .text. Same below for the age.
    private setLevelText(level: number, levelMax: number, visible: boolean = true): void
    {
        const container = this._elementList?.getListItemByName('image_container') as IWindowContainer | null;
        const text = container?.findChildByName('level_text') as ITextWindow | null;

        if(!text) return;

        text.visible = visible;

        this._widget.localizations?.registerParameter('pet.level', 'level', level.toString());
        this._widget.localizations?.registerParameter('pet.level', 'maxlevel', levelMax.toString());

        this.updateWindow();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::setSpecialSkillLevel()
    private setSpecialSkillLevel(level: number, skillTresholds: number[], petType: number): void
    {
        const container = this._elementList?.getListItemByName('image_container') as IWindowContainer | null;

        if(!container) return;

        const enhancementsEnabled = (this._widget.config?.getBoolean('pet.enhancements.enabled') ?? false)
            && petType === PET_TYPE_ENHANCEABLE;
        const skillText = container.findChildByName('status_skill_text') as ITextWindow | null;

        if(skillText)
        {
            skillText.visible = enhancementsEnabled;
            skillText.caption = `\${infostand.pet.text.skill.${petType}}`;
        }

        const indicator = container.findChildByName('skill_level_indicator') as IBitmapWrapperWindow | null;

        if(indicator)
        {
            indicator.visible = enhancementsEnabled;

            const assetName = `pet_skill_level_${this.getSkillLevelIndex(level, skillTresholds)}`;
            const bitmap = (this._widget.assets?.getAssetByName(assetName)?.content ?? null) as ImageBitmap | null;

            if(bitmap) indicator.bitmap = bitmap;
        }

        this.updateWindow();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::setRarityLevel()
    private setRarityLevel(rarityLevel: number, petType: number): void
    {
        // AS3's literal list: only these two pet types display a rarity line.
        const rarityPetTypes = [16, 26];
        const container = this.getStatusContainer(petType !== PET_TYPE_MONSTERPLANT ? 'default' : 'monsterplant');
        const text = container?.getListItemByName('status_rarity_level') as ITextWindow | null;

        if(!text) return;

        text.visible = rarityPetTypes.indexOf(petType) > -1;

        this._widget.localizations?.registerParameter(
            'infostand.pet.text.raritylevel',
            'level',
            this._widget.localizations?.getLocalization(`infostand.pet.raritylevel.${rarityLevel}`) ?? ''
        );

        this.updateWindow();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::set ownerName()
    private setOwnerName(value: string): void
    {
        this._widget.localizations?.registerParameter('infostand.text.petowner', 'name', value);
        this.updateWindow();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::set breedText()
    private setBreedText(value: string): void
    {
        const text = this._elementList?.getListItemByName('breed_text') as ITextWindow | null;

        if(!text) return;

        text.text = value;
        this.updateWindow();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::set ageText()
    // AS3 looks the window up and then never assigns to it — the ${pet.age} binding does the work —
    // but it does bail out early when the window is missing. Both behaviours kept.
    private setAgeText(age: number): void
    {
        const text = this._elementList?.getListItemByName('age_text') as ITextWindow | null;

        if(!text) return;

        this._widget.localizations?.registerParameter('pet.age', 'age', age.toString());
        this.updateWindow();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::updatePetRespect()
    private updatePetRespect(count: number, visible: boolean): void
    {
        this._widget.localizations?.registerParameter('infostand.text.petrespect', 'count', count.toString());

        const container = this._elementList?.getListItemByName('petrespect_container') as IWindowContainer | null;
        const text = container?.findChildByName('petrespect_text') as ITextWindow | null;
        const icon = container?.findChildByName('petrespect_icon') as IBitmapWrapperWindow | null;

        if(!text || !icon) return;

        text.visible = visible;
        icon.visible = visible;
        icon.x = text.x + text.width + 2;

        this.updateWindow();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::showStatusContainer()
    private showStatusContainer(name: string, visible: boolean): void
    {
        const container = this.getStatusContainer(name);

        if(container) container.visible = visible;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::getStatusContainer()
    private getStatusContainer(name: string): IItemListWindow | null
    {
        const container = this._elementList?.getListItemByName('status_container') as IWindowContainer | null;

        return (container?.findChildByName(`status_item_list_${name}`) as IItemListWindow | null) ?? null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::updateStateWidget()
    // AS3's switch has a single "growth" case and no default, so this is a no-op for any other
    // state name — preserved rather than collapsed into an unconditional body.
    private updateStateWidget(state: string, seconds: number): void
    {
        if(state !== STATE_GROWTH) return;

        const container = this._elementList?.getListItemByName('status_container') as IWindowContainer | null;

        if(!container) return;

        const widgetWindow = container.findChildByName(`${state}_status_widget`) as IWidgetWindow | null;
        const widget = (widgetWindow?.widget ?? null) as CountdownWidget | null;

        if(!widget || !widgetWindow) return;

        widget.seconds = seconds;

        const visible = seconds > 0;
        const visibilityChanged = widgetWindow.visible !== visible;

        widgetWindow.visible = visible;

        const text = container.findChildByName(`${state}_status_text`) as ITextWindow | null;

        if(text) text.visible = visible;

        // Only re-flow the list when the row actually appeared or disappeared.
        if(visibilityChanged)
        {
            const list = container.findChildByName('status_item_list_monsterplant') as IItemListWindow | null;

            list?.arrangeListItems();
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::updateStateElement()
    private updateStateElement(
        state: string,
        value: number,
        max: number,
        contentColor: number,
        highlightColor: number,
        overrideText: string | null = null
    ): void
    {
        const container = this._elementList?.getListItemByName('status_container') as IWindowContainer | null;

        if(!container) return;

        const text = container.findChildByName(`status_${state}_value_text`) as ITextWindow | null;

        if(text) text.text = overrideText ?? `${value}/${max}`;

        const target = container.findChildByName(`status_${state}_bitmap`) as IBitmapWrapperWindow | null;

        if(target)
        {
            const bar = this.createPercentageBar(value, max, contentColor, highlightColor);

            if(bar)
            {
                target.bitmap = bar;
                target.width = bar.width;
                target.height = bar.height;
                target.invalidate();
            }
        }

        this.updateWindow();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::createPercentageBar()
    // A 162x16 bar: 1px border, dark fill, then two stacked progress rects — a 4px highlight strip
    // above the main content band, both scaled to value/max.
    private createPercentageBar(value: number, max: number, contentColor: number, highlightColor: number): ImageBitmap | null
    {
        max = Math.max(max, 1);
        value = Math.max(value, 0);

        if(value > max) value = max;

        const ratio = value / max;
        const canvas = new OffscreenCanvas(STATUS_BAR_WIDTH, STATUS_BAR_HEIGTH);
        const context = canvas.getContext('2d');

        if(!context) return null;

        context.fillStyle = toCssColor(STATUS_BAR_BORDER_COLOR);
        context.fillRect(0, 0, STATUS_BAR_WIDTH, STATUS_BAR_HEIGTH);

        context.fillStyle = toCssColor(STATUS_BAR_BG_COLOR);
        context.fillRect(1, 1, STATUS_BAR_WIDTH - 2, STATUS_BAR_HEIGTH - 2);

        context.fillStyle = toCssColor(contentColor);
        context.fillRect(
            1, 1 + STATUS_BAR_HIGHLIGHT_HEIGHT,
            ratio * (STATUS_BAR_WIDTH - 2), STATUS_BAR_HEIGTH - 2 - STATUS_BAR_HIGHLIGHT_HEIGHT
        );

        context.fillStyle = toCssColor(highlightColor);
        context.fillRect(1, 1, ratio * (STATUS_BAR_WIDTH - 2), STATUS_BAR_HIGHLIGHT_HEIGHT);

        return canvas.transferToImageBitmap();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::showRarityItem()
    // AS3 declares param1 and never reads it — the overlay's rarityLevel is set unconditionally
    // from the pet data. Kept as a dead parameter, matching the original.
    private showRarityItem(_visible: boolean, petData: InfoStandPetData): void
    {
        const container = this._elementList?.getListItemByName('status_container') as IWindowContainer | null;
        const widgetWindow = container?.findChildByName('rarity_item_overlay_widget') as IWidgetWindow | null;
        const widget = (widgetWindow?.widget ?? null) as IRarityItemPreviewOverlayWidget | null;

        if(!widget) return;

        widget.rarityLevel = petData.rarityLevel;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::updateRespectButton()
    private updateRespectButton(): void
    {
        const respectLeft = this._widget.userData.petRespectLeft;

        this._widget.localizations?.registerParameter('infostand.button.petrespect', 'count', respectLeft.toString());
        this.showButton('petrespect', respectLeft > 0);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::showButton()
    // The name is the button's *region* ("petrespect"), not the button inside it ("btn_petrespect").
    private showButton(name: string, visible: boolean): void
    {
        const button = this._buttonsContainer?.getChildByName(name);

        if(!button) return;

        button.visible = visible;
        this.arrangeButtons();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::arrangeButtons()
    // Right-to-left flow: regions pack from the right edge and wrap to a new row when the next one
    // would not fit.
    private arrangeButtons(): void
    {
        if(!this._buttonsContainer) return;

        this._buttonsContainer.width = BUTTONS_MAX_WIDTH;

        const regions: IWindow[] = [];

        this._buttonsContainer.groupChildrenWithTag('CMD_BUTTON_REGION', regions, -1);

        let cursor = BUTTONS_MAX_WIDTH;
        let row = 0;

        for(const region of regions)
        {
            if(!region.visible) continue;

            if(cursor - region.width < 0)
            {
                cursor = BUTTONS_MAX_WIDTH;
                row += BUTTON_HEIGHT + BUTTON_MARGIN;
            }

            region.x = cursor - region.width;
            region.y = row;
            cursor = region.x - BUTTON_MARGIN;
        }

        this._buttonsContainer.height = row + BUTTON_HEIGHT;
        this.updateWindow();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::getSkillLevelIndex()
    private getSkillLevelIndex(level: number, skillTresholds: number[]): number
    {
        let index = 0;

        for(const treshold of skillTresholds)
        {
            if(treshold > 0 && level >= treshold) index++;
        }

        return index;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::getLowerSkillTreshold()
    // Currently only reachable from the deferred PetCommandTool path; ported now so the tool has a
    // complete host to land on rather than leaving a hole in the class.
    private getLowerSkillTreshold(level: number, skillTresholds: number[]): number
    {
        let result = 0;

        for(const treshold of skillTresholds)
        {
            if(treshold > level) break;

            result = treshold;
        }

        return result;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::getUpperSkillTreshold()
    private getUpperSkillTreshold(level: number, skillTresholds: number[]): number
    {
        const lower = this.getLowerSkillTreshold(level, skillTresholds);
        const index = skillTresholds.indexOf(lower);

        return index < skillTresholds.length - 1 ? skillTresholds[index + 1] : lower;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::getBreedLocalizationKey()
    private getBreedLocalizationKey(petType: number, breedId: number): string
    {
        return `pet.breed.${petType}.${breedId}`;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::onButtonResized()
    private onButtonResized = (event: WindowEvent): void =>
    {
        const parent = event.window?.parent;

        if(parent && parent.tags.indexOf('CMD_BUTTON_REGION') > -1) parent.width = event.window.width;
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::onClose()
    private onClose = (): void =>
    {
        this._widget.close();
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetView.as::onButtonClicked()
    private onButtonClicked = (event: WindowMouseEvent): void =>
    {
        let messageType: string | null = null;

        switch((event.target as IWindow | null)?.name)
        {
            case 'btn_move':
                messageType = RoomWidgetFurniActionMessage.MOVE;
                break;
            case 'btn_rotate':
                messageType = RoomWidgetFurniActionMessage.ROTATE;
                break;
            case 'btn_pick':
            case 'btn_kick':
                // AS3 has these as two identical cases — both pick the pet up, and both close the
                // command tool if it is showing this pet. The captions differ, not the action.
                messageType = 'RWUAM_PICKUP_PET';
                this.closeTrainView();
                break;
            case 'btn_train':
                this.openTrainView();
                break;
            case 'btn_buy_food':
                if(this._catalog)
                {
                    this._catalog.openCatalogPage('pet_accessories');
                    this._widget.handler.container?.habboTracking?.trackGoogle('infostandBuyPetFoodButton', 'click');
                }
                break;
            case 'btn_petrespect':
                // AS3 decrements optimistically before the server confirms, so the count and the
                // button's own visibility update on click rather than on the response.
                this._widget.userData.petRespectLeft -= 1;
                this.updateRespectButton();
                messageType = ' RWUAM_RESPECT_PET';
                break;
            case 'btn_pettreat':
                messageType = 'RWUAM_TREAT_PET';
                break;
        }

        if(messageType !== null)
        {
            if(messageType === RoomWidgetFurniActionMessage.MOVE || messageType === RoomWidgetFurniActionMessage.ROTATE)
            {
                // Move/rotate address the pet as a room object (category 100 + its room index);
                // everything else addresses it by pet id.
                this._widget.messageListener?.processWidgetMessage(
                    new RoomWidgetFurniActionMessage(messageType, this._widget.petData.roomIndex, 100, -1, null)
                );
            }
            else
            {
                this._widget.messageListener?.processWidgetMessage(
                    new RoomWidgetUserActionMessage(messageType, this._widget.petData.id)
                );
            }
        }

        this.updateWindow();
    };
}
