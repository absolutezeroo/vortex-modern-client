import type {IRoomWidgetHandler} from '../IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '../IRoomWidgetHandlerContainer';
import type {RoomWidgetMessage} from '../widget/messages/RoomWidgetMessage';
import type {RoomWidgetUpdateEvent} from '../widget/events/RoomWidgetUpdateEvent';
import {StringArrayStuffData} from '@habbo/room/object/data/StringArrayStuffData';
import {BadgeRarityEnum} from '@habbo/communication/enum/BadgeRarityEnum';
import {BadgeLeaderboardUtils} from '@habbo/groups/BadgeLeaderboardUtils';
import {GetBadgeInformationComposer} from '@habbo/communication/messages/outgoing/inventory/GetBadgeInformationComposer';
import {BadgeInformationEvent} from '@habbo/communication/messages/incoming/inventory/badges/BadgeInformationEvent';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {BadgeInformationParser} from '@habbo/communication/messages/parser/inventory/badges/BadgeInformationParser';
import {RoomWidgetAchievementResolutionTrophyDataUpdateEvent} from '../widget/events/RoomWidgetAchievementResolutionTrophyDataUpdateEvent';
import {RoomWidgetFurniToWidgetMessage} from '../widget/messages/RoomWidgetFurniToWidgetMessage';
import {TrophyTheme} from '../widget/furniture/trophy/TrophyTheme';

/**
 * Drives the trophy shown for an achievement resolution and for a badge-display furni.
 *
 * The two differ in one way that matters: the badge display needs the badge's **rarity**, which
 * only the server knows, so that path fires a request and finishes asynchronously when the answer
 * comes back. The achievement resolution has everything in the furni's own stuff data and draws
 * immediately.
 *
 * All the colour work here exists because a rare badge's display is tinted by its tier — a
 * lightened tier colour behind, and the trophy's silver header multiplied by that same tint.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/FurnitureBadgeDisplayWidgetHandler.as
 */
export class FurnitureBadgeDisplayWidgetHandler implements IRoomWidgetHandler
{
    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::TROPHY_VIEW_TYPE
    private static readonly TROPHY_VIEW_TYPE: number = 0;

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::STUFF_INDEX_BADGE_CODE
    // Names DERIVED: AS3 indexes the stuff data with bare 1/2/3.
    private static readonly STUFF_INDEX_BADGE_CODE: number = 1;

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::STUFF_INDEX_USER_NAME
    private static readonly STUFF_INDEX_USER_NAME: number = 2;

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::STUFF_INDEX_DATE
    private static readonly STUFF_INDEX_DATE: number = 3;

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::WHITE
    // Name DERIVED: the 16777215 AS3 writes inline wherever a tier gets no tint.
    private static readonly WHITE: number = 16777215;

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::_badgeInfoEvent
    private _badgeInfoEvent: BadgeInformationEvent | null;

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::_pendingBadgeCode
    // The five `_pending*` fields are the request in flight: the display cannot be drawn until the
    // rarity arrives, so everything already known is parked here meanwhile.
    private _pendingBadgeCode: string | null = null;

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::_pendingDate
    private _pendingDate: string | null = null;

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::_pendingFrameTitle
    private _pendingFrameTitle: string | null = null;

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::_pendingMessage
    private _pendingMessage: string | null = null;

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::_pendingUserName
    private _pendingUserName: string | null = null;

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::FurnitureBadgeDisplayWidgetHandler()
    constructor()
    {
        this._badgeInfoEvent = new BadgeInformationEvent(this.onBadgeInfo);
    }

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::get type()
    get type(): string
    {
        return 'RWE_FURNI_ACHIEVEMENT_RESOLUTION_ENGRAVING';
    }

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::set container()
    // Subscribes on assignment and *unsubscribes from the previous one first*, which is what lets
    // the desktop hand this handler a new container across a room change.
    set container(value: IRoomWidgetHandlerContainer | null)
    {
        if(this._container !== null && this._badgeInfoEvent !== null)
        {
            this._container.connection?.removeMessageEvent(this._badgeInfoEvent);
        }

        this._container = value;

        if(this._container !== null && this._badgeInfoEvent !== null)
        {
            this._container.connection?.addMessageEvent(this._badgeInfoEvent);
        }
    }

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::getWidgetMessages()
    getWidgetMessages(): string[]
    {
        return [
            RoomWidgetFurniToWidgetMessage.WIDGET_MESSAGE_REQUEST_ACHIEVEMENT_RESOLUTION_ENGRAVING,
            RoomWidgetFurniToWidgetMessage.WIDGET_MESSAGE_REQUEST_ACHIEVEMENT_RESOLUTION_FAILED,
            RoomWidgetFurniToWidgetMessage.WIDGET_MESSAGE_REQUEST_BADGE_DISPLAY_ENGRAVING
        ];
    }

    /**
     * The achievement-resolution cases clear any pending badge request first — a resolution
     * arriving while a badge lookup is in flight wins, and the stale answer is then dropped by
     * `onBadgeInfo`'s null check.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/FurnitureBadgeDisplayWidgetHandler.as::processWidgetMessage()
    processWidgetMessage(message: RoomWidgetMessage): RoomWidgetUpdateEvent | null
    {
        if(this._disposed || message === null || message === undefined) return null;

        switch(message.type)
        {
            case RoomWidgetFurniToWidgetMessage.WIDGET_MESSAGE_REQUEST_BADGE_DISPLAY_ENGRAVING:
                this.handleEngravingRequest(message as RoomWidgetFurniToWidgetMessage, true);
                break;

            case RoomWidgetFurniToWidgetMessage.WIDGET_MESSAGE_REQUEST_ACHIEVEMENT_RESOLUTION_ENGRAVING:
                this.clearPendingBadgeDisplayRequest();
                this.handleEngravingRequest(message as RoomWidgetFurniToWidgetMessage, false);
                break;

            case RoomWidgetFurniToWidgetMessage.WIDGET_MESSAGE_REQUEST_ACHIEVEMENT_RESOLUTION_FAILED:
                this.clearPendingBadgeDisplayRequest();
                this._container?.windowManager?.simpleAlert(
                    '${resolution.failed.title}',
                    '${resolution.failed.subtitle}',
                    '${resolution.failed.text}',
                    null,
                    null,
                    null,
                    'help_error_state'
                );
                break;
        }

        return null;
    }

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::getProcessedEvents()
    // Empty: everything reaches this handler as a widget message or off the connection.
    getProcessedEvents(): string[]
    {
        return [];
    }

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::processEvent()
    // Empty in AS3 too.
    processEvent(_event: unknown): void
    {
    }

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::update()
    // Empty in AS3 too.
    update(): void
    {
    }

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::dispose()
    dispose(): void
    {
        if(this._container !== null && this._badgeInfoEvent !== null)
        {
            this._container.connection?.removeMessageEvent(this._badgeInfoEvent);
        }

        this._disposed = true;
        this.clearPendingBadgeDisplayRequest();
        this._badgeInfoEvent = null;
        this._container = null;
    }

    /**
     * The furni's stuff data holds the badge code, the engraved user and the date; the message
     * text is built from the badge's *name and description*, joined by a hard newline.
     *
     * The achievement-resolution path stops here with a plain gold trophy. The badge-display path
     * parks everything and asks the server for the rarity — and if there is no connection at all
     * it falls through and draws with rarity 0 rather than nothing.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/FurnitureBadgeDisplayWidgetHandler.as::handleEngravingRequest()
    private handleEngravingRequest(message: RoomWidgetFurniToWidgetMessage, isBadgeDisplay: boolean): void
    {
        const stuffData = this.getStuffData(message);

        if(stuffData === null) return;

        const container = this._container;

        if(container === null) return;

        const badgeCode = stuffData.getValue(FurnitureBadgeDisplayWidgetHandler.STUFF_INDEX_BADGE_CODE);
        const badgeName = container.localization?.getBadgeName(badgeCode) ?? badgeCode;
        const badgeDesc = `\r\n${container.localization?.getBadgeDesc(badgeCode) ?? ''}`;
        const userName = stuffData.getValue(FurnitureBadgeDisplayWidgetHandler.STUFF_INDEX_USER_NAME);
        const date = stuffData.getValue(FurnitureBadgeDisplayWidgetHandler.STUFF_INDEX_DATE);

        const key = isBadgeDisplay ? 'badge.display.engraving.text' : 'resolution.engraving.text';
        const message_ = container.localization?.getLocalizationWithParams(
            key, '%badgename%', 'badgename', badgeName, 'badgedesc', badgeDesc
        ) ?? badgeName;

        if(!isBadgeDisplay)
        {
            this.dispatchTrophyDataUpdate(
                userName,
                date,
                message_,
                container.localization?.getLocalization('widget.furni.trophy.title', 'Trophy') ?? 'Trophy',
                TrophyTheme.getHeaderColor(TrophyTheme.GOLD),
                TrophyTheme.GOLD,
                FurnitureBadgeDisplayWidgetHandler.WHITE
            );

            return;
        }

        this._pendingBadgeCode = badgeCode;
        this._pendingUserName = userName;
        this._pendingDate = date;
        this._pendingMessage = message_;
        this._pendingFrameTitle = container.localization?.getLocalization(
            'widget.furni.badge_display.title', 'Badge Display'
        ) ?? 'Badge Display';

        if(container.connection !== null)
        {
            container.connection.send(new GetBadgeInformationComposer(badgeCode));

            return;
        }

        this.dispatchTrophyDataUpdate(
            userName,
            date,
            message_,
            this._pendingFrameTitle,
            this.getBadgeDisplayHeaderColor(BadgeRarityEnum.COMMON),
            this.getBadgeDisplayBackgroundTheme(BadgeRarityEnum.COMMON),
            this.getBadgeDisplayBackgroundColor(BadgeRarityEnum.COMMON)
        );
        this.clearPendingBadgeDisplayRequest();
    }

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::getStuffData()
    private getStuffData(message: RoomWidgetFurniToWidgetMessage): StringArrayStuffData | null
    {
        if(this._container === null || message === null) return null;

        const object = this._container.roomEngine?.getRoomObject(message.roomId, message.id, message.category) ?? null;

        if(object === null) return null;

        const model = object.getModel();

        if(model === null) return null;

        const stuffData = new StringArrayStuffData();

        stuffData.initializeFromRoomObjectModel(model);

        return stuffData;
    }

    /**
     * The badge code is re-checked against the pending one, so an answer for a *different* badge
     * — or one that arrives after the request was cleared — is dropped rather than drawn over
     * whatever is on screen.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/FurnitureBadgeDisplayWidgetHandler.as::onBadgeInfo()
    // The callback is typed against the base event, as `MessageEventCallback` requires; AS3's is
    // typed against the concrete one, which its dynamic dispatch allows and TypeScript does not.
    private onBadgeInfo = (event: IMessageEvent): void =>
    {
        if(this._disposed || this._pendingBadgeCode === null || event === null) return;

        if(!(event instanceof BadgeInformationEvent)) return;

        const parser = event.getParser<BadgeInformationParser>();

        if(parser === null || parser.badgeCode !== this._pendingBadgeCode) return;

        this.dispatchTrophyDataUpdate(
            this._pendingUserName ?? '',
            this._pendingDate ?? '',
            this.getBadgeDisplayMessage(this._pendingMessage, parser.badgeRarityId, parser.ownerCount),
            this._pendingFrameTitle ?? '',
            this.getBadgeDisplayHeaderColor(parser.badgeRarityId),
            this.getBadgeDisplayBackgroundTheme(parser.badgeRarityId),
            this.getBadgeDisplayBackgroundColor(parser.badgeRarityId)
        );
        this.clearPendingBadgeDisplayRequest();
    };

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::getBadgeDisplayMessage()
    // Three blank lines between the engraving and the rarity line, and the owner count appended
    // with a leading " - " on the same line.
    private getBadgeDisplayMessage(engraving: string | null, rarity: number, ownerCount: number): string
    {
        const parts: string[] = [];

        if(engraving !== null && engraving !== '') parts.push(`${engraving}\n\n\n`);

        parts.push(this.getBadgeRarityLine(rarity));

        if(BadgeLeaderboardUtils.shouldShowOwnerCount(ownerCount))
        {
            parts.push(` - ${this.getBadgeOwnerCountLine(ownerCount)}`);
        }

        return parts.join('');
    }

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::getBadgeRarityLine()
    private getBadgeRarityLine(rarity: number): string
    {
        return this._container?.localization?.getLocalizationWithParams(
            'badge.rarity.badge', '%rarity% badge', 'rarity', this.getBadgeRarityText(rarity)
        ) ?? '';
    }

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::getBadgeOwnerCountLine()
    private getBadgeOwnerCountLine(ownerCount: number): string
    {
        return this._container?.localization?.getLocalizationWithParams(
            'badge.owner_count', 'Owned by %count% users', 'count', BadgeLeaderboardUtils.formatOwnerCount(ownerCount)
        ) ?? '';
    }

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::getBadgeRarityText()
    // The key is its own fallback, so an unlocalised tier shows the key rather than nothing.
    private getBadgeRarityText(rarity: number): string
    {
        const key = BadgeRarityEnum.getLabelLocalizationKey(rarity, this.isUncommonBadgeRarityEnabled());

        return this._container?.localization?.getLocalization(key, key) ?? key;
    }

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::dispatchTrophyDataUpdate()
    // The event's `color` is `theme + 1`, because the widget's fallback path derives the theme
    // back out as `color - 1` when no explicit theme is given.
    private dispatchTrophyDataUpdate(
        userName: string,
        date: string,
        message: string,
        frameTitle: string,
        headerColor: number,
        backgroundTheme: number,
        backgroundColor: number
    ): void
    {
        this._container?.desktopEvents.emit(
            RoomWidgetAchievementResolutionTrophyDataUpdateEvent.UPDATE_TROPHY_DATA,
            new RoomWidgetAchievementResolutionTrophyDataUpdateEvent(
                RoomWidgetAchievementResolutionTrophyDataUpdateEvent.UPDATE_TROPHY_DATA,
                backgroundTheme + 1,
                userName,
                date,
                message,
                FurnitureBadgeDisplayWidgetHandler.TROPHY_VIEW_TYPE,
                frameTitle,
                headerColor,
                backgroundTheme,
                backgroundColor
            )
        );
    }

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::clearPendingBadgeDisplayRequest()
    private clearPendingBadgeDisplayRequest(): void
    {
        this._pendingBadgeCode = null;
        this._pendingUserName = null;
        this._pendingDate = null;
        this._pendingMessage = null;
        this._pendingFrameTitle = null;
    }

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::getBadgeDisplayBackgroundTheme()
    // Unique (6) gets gold, everything else silver — so the rarest badge is the one that does
    // *not* get the tinted treatment.
    private getBadgeDisplayBackgroundTheme(rarity: number): number
    {
        return rarity === BadgeRarityEnum.UNIQUE ? TrophyTheme.GOLD : TrophyTheme.SILVER;
    }

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::getBadgeDisplayBackgroundColor()
    private getBadgeDisplayBackgroundColor(rarity: number): number
    {
        if(!BadgeRarityEnum.isStandaloneTier(rarity, this.isUncommonBadgeRarityEnabled())
            || rarity === BadgeRarityEnum.UNIQUE)
        {
            return FurnitureBadgeDisplayWidgetHandler.WHITE;
        }

        return this.getBadgeDisplayTintColor(rarity);
    }

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::getBadgeDisplayHeaderColor()
    // A standalone tier's header is the silver header *multiplied* by its tint, which keeps the
    // header's shading while taking the tier's hue.
    private getBadgeDisplayHeaderColor(rarity: number): number
    {
        if(!BadgeRarityEnum.isStandaloneTier(rarity, this.isUncommonBadgeRarityEnabled()))
        {
            return TrophyTheme.getHeaderColor(TrophyTheme.SILVER);
        }

        if(rarity === BadgeRarityEnum.UNIQUE) return TrophyTheme.getHeaderColor(TrophyTheme.GOLD);

        return FurnitureBadgeDisplayWidgetHandler.multiplyColor(
            TrophyTheme.getHeaderColor(TrophyTheme.SILVER), this.getBadgeDisplayTintColor(rarity)
        );
    }

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::getBadgeDisplayTintColor()
    private getBadgeDisplayTintColor(rarity: number): number
    {
        return FurnitureBadgeDisplayWidgetHandler.lightenColor(
            BadgeRarityEnum.getDisplayColor(rarity, this.isUncommonBadgeRarityEnabled()),
            FurnitureBadgeDisplayWidgetHandler.getBackgroundLighteningFactor(rarity)
        );
    }

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::getBackgroundLighteningFactor()
    // Rarer tiers are lightened *more*, so the background stays pale as the tier colour deepens.
    private static getBackgroundLighteningFactor(rarity: number): number
    {
        switch(rarity)
        {
            case BadgeRarityEnum.UNCOMMON:
                return 0.25;

            case BadgeRarityEnum.RARE:
                return 0.3;

            case BadgeRarityEnum.VERY_RARE:
                return 0.35;

            case BadgeRarityEnum.MYTHICAL:
                return 0.4;

            case BadgeRarityEnum.LEGENDARY:
                return 0.45;

            default:
                return 0;
        }
    }

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::isUncommonBadgeRarityEnabled()
    private isUncommonBadgeRarityEnabled(): boolean
    {
        return this._container?.config?.getBoolean('badge_rarity.uncommon') === true;
    }

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::lightenColor()
    // Keeps the 0xFF alpha byte, unlike `BadgeRarityEnum.darkenColor` which drops it.
    private static lightenColor(color: number, amount: number): number
    {
        let r = (color >> 16) & 0xFF;
        let g = (color >> 8) & 0xFF;
        let b = color & 0xFF;

        r += Math.trunc((255 - r) * amount);
        g += Math.trunc((255 - g) * amount);
        b += Math.trunc((255 - b) * amount);

        return ((0xFF000000 | (r << 16) | (g << 8) | b) >>> 0);
    }

    // AS3: .../handler/FurnitureBadgeDisplayWidgetHandler.as::multiplyColor()
    private static multiplyColor(a: number, b: number): number
    {
        const r = Math.trunc((((a >> 16) & 0xFF) * ((b >> 16) & 0xFF)) / 255);
        const g = Math.trunc((((a >> 8) & 0xFF) * ((b >> 8) & 0xFF)) / 255);
        const bl = Math.trunc(((a & 0xFF) * (b & 0xFF)) / 255);

        return ((0xFF000000 | (r << 16) | (g << 8) | bl) >>> 0);
    }
}
