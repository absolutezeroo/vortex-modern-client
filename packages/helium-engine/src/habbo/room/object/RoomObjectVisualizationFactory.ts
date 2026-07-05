/**
 * RoomObjectVisualizationFactory
 *
 * Based on AS3: com.sulake.habbo.room.object.RoomObjectVisualizationFactory
 *
 * Factory for creating room object visualizations and caching visualization data.
 * Separated from RoomObjectFactory which handles logic/manager creation only.
 *
 * @see source_as_win63/habbo/room/object/RoomObjectVisualizationFactory.as
 */
import type {IRoomObjectVisualizationFactory} from '@room/object/IRoomObjectVisualizationFactory';
import type {IRoomObjectVisualization} from '@room/object/visualization/IRoomObjectVisualization';
import type {IRoomObjectVisualizationData} from '@room/object/visualization/IRoomObjectVisualizationData';
import type {IGraphicAssetCollection} from '@room/object/visualization/utils/IGraphicAssetCollection';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import {GraphicAssetCollection} from '@room/object/visualization/utils/GraphicAssetCollection';
import {RoomObjectVisualizationEnum} from './RoomObjectVisualizationEnum';

// Room Visualizations
import {RoomVisualization} from './visualization/room/RoomVisualization';
import {TileCursorVisualization} from './visualization/room/TileCursorVisualization';

// Furniture Visualizations
import {FurnitureVisualization} from './visualization/furniture/FurnitureVisualization';
import {AnimatedFurnitureVisualization} from './visualization/furniture/AnimatedFurnitureVisualization';
import {
    FurnitureResettingAnimatedVisualization
} from './visualization/furniture/FurnitureResettingAnimatedVisualization';
import {FurniturePosterVisualization} from './visualization/furniture/FurniturePosterVisualization';
import {FurnitureStickieVisualization} from './visualization/furniture/FurnitureStickieVisualization';
import {FurnitureBottleVisualization} from './visualization/furniture/FurnitureBottleVisualization';
import {FurnitureHabboWheelVisualization} from './visualization/furniture/FurnitureHabboWheelVisualization';
import {FurnitureValRandomizerVisualization} from './visualization/furniture/FurnitureValRandomizerVisualization';
import {FurnitureQueueTileVisualization} from './visualization/furniture/FurnitureQueueTileVisualization';
import {FurniturePartyBeamerVisualization} from './visualization/furniture/FurniturePartyBeamerVisualization';
import {FurnitureGiftWrappedVisualization} from './visualization/furniture/FurnitureGiftWrappedVisualization';
import {FurnitureCounterClockVisualization} from './visualization/furniture/FurnitureCounterClockVisualization';
import {FurnitureScoreBoardVisualization} from './visualization/furniture/FurnitureScoreBoardVisualization';
import {FurnitureFireworksVisualization} from './visualization/furniture/FurnitureFireworksVisualization';
import {
    FurnitureGiftWrappedFireworksVisualization
} from './visualization/furniture/FurnitureGiftWrappedFireworksVisualization';
import {FurnitureSoundblockVisualization} from './visualization/furniture/FurnitureSoundblockVisualization';
import {FurnitureVoteCounterVisualization} from './visualization/furniture/FurnitureVoteCounterVisualization';
import {FurnitureVoteMajorityVisualization} from './visualization/furniture/FurnitureVoteMajorityVisualization';
import {FurnitureBadgeDisplayVisualization} from './visualization/furniture/FurnitureBadgeDisplayVisualization';
import {FurnitureGuildCustomizedVisualization} from './visualization/furniture/FurnitureGuildCustomizedVisualization';
import {
    FurnitureGuildIsometricBadgeVisualization
} from './visualization/furniture/FurnitureGuildIsometricBadgeVisualization';
import {FurnitureRoomBillboardVisualization} from './visualization/furniture/FurnitureRoomBillboardVisualization';
import {FurnitureRoomBackgroundVisualization} from './visualization/furniture/FurnitureRoomBackgroundVisualization';
import {
    FurnitureBuilderPlaceholderVisualization
} from './visualization/furniture/FurnitureBuilderPlaceholderVisualization';
import {FurnitureExternalImageVisualization} from './visualization/furniture/FurnitureExternalImageVisualization';
import {FurnitureYoutubeVisualization} from './visualization/furniture/FurnitureYoutubeVisualization';
import {FurnitureMannequinVisualization} from './visualization/furniture/FurnitureMannequinVisualization';
import {FurnitureWaterAreaVisualization} from './visualization/furniture/FurnitureWaterAreaVisualization';
import {FurniturePlanetSystemVisualization} from './visualization/furniture/FurniturePlanetSystemVisualization';

// Avatar Visualization
import {AvatarVisualization} from './visualization/avatar/AvatarVisualization';
import {AvatarVisualizationData} from './visualization/avatar/AvatarVisualizationData';

// Visualization Data
import {FurnitureVisualizationData} from './visualization/furniture/FurnitureVisualizationData';
import {AnimatedFurnitureVisualizationData} from './visualization/furniture/AnimatedFurnitureVisualizationData';

/**
 * Visualization types that use AnimatedFurnitureVisualizationData.
 * All others use FurnitureVisualizationData.
 *
 * @see AS3 RoomObjectVisualizationFactory.getRoomObjectVisualizationData() lines 232-283
 */
const ANIMATED_VIZ_DATA_TYPES = new Set([
    'furniture_animated',
    'furniture_resetting_animated',
    'furniture_poster',
    'furniture_habbowheel',
    'furniture_val_randomizer',
    'furniture_bottle',
    'furniture_planet_system',
    'furniture_queue_tile',
    'furniture_party_beamer',
    'furniture_counter_clock',
    'furniture_water_area',
    'furniture_score_board',
    'furniture_fireworks',
    'furniture_gift_wrapped_fireworks',
    'furniture_guild_customized',
    'furniture_guild_isometric_badge',
    'furniture_vote_counter',
    'furniture_vote_majority',
    'furniture_soundblock',
    'furniture_badge_display',
    'furniture_external_image',
    'furniture_youtube',
    'tile_cursor',
]);

export class RoomObjectVisualizationFactory implements IRoomObjectVisualizationFactory
{
    private _visualizationDataCache: Map<string, IRoomObjectVisualizationData> = new Map();
    private _disposed: boolean = false;

    private _avatarRenderManager: IAvatarRenderManager | null = null;

    /**
	 * Set the avatar render manager reference for avatar visualization data injection.
	 *
	 * @see AS3 RoomObjectVisualizationFactory._habboAvatar
	 */
    set avatarRenderManager(value: IAvatarRenderManager | null)
    {
        this._avatarRenderManager = value;

        for(const data of this._visualizationDataCache.values())
        {
            if(data instanceof AvatarVisualizationData)
            {
                data.avatarRenderManager = value;
            }
        }
    }

    /**
	 * @see sources/win63_version/habbo/room/object/RoomObjectVisualizationFactory.as::createGraphicAssetCollection()
	 */
    // AS3: sources/win63_version/habbo/room/object/RoomObjectVisualizationFactory.as::createGraphicAssetCollection()
    createGraphicAssetCollection(): IGraphicAssetCollection
    {
        return new GraphicAssetCollection();
    }

    /**
	 * Create a visualization instance for the given type.
	 *
	 * @see AS3 RoomObjectVisualizationFactory.createRoomObjectVisualization()
	 */
    createRoomObjectVisualization(type: string): IRoomObjectVisualization | null
    {
        switch(type)
        {
            // Room
            case RoomObjectVisualizationEnum.ROOM:
                return new RoomVisualization();

                // Tile cursor
            case RoomObjectVisualizationEnum.TILE_CURSOR:
                return new TileCursorVisualization();

                // Furniture - static
            case RoomObjectVisualizationEnum.FURNITURE_STATIC:
                return new FurnitureVisualization();

                // Furniture - animated
            case RoomObjectVisualizationEnum.FURNITURE_ANIMATED:
                return new AnimatedFurnitureVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_RESETTING_ANIMATED:
                return new FurnitureResettingAnimatedVisualization();

                // Furniture - specialized
            case RoomObjectVisualizationEnum.FURNITURE_POSTER:
                return new FurniturePosterVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_STICKIE:
                return new FurnitureStickieVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_BOTTLE:
                return new FurnitureBottleVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_HABBOWHEEL:
                return new FurnitureHabboWheelVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_VAL_RANDOMIZER:
                return new FurnitureValRandomizerVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_QUEUE_TILE:
                return new FurnitureQueueTileVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_PARTY_BEAMER:
                return new FurniturePartyBeamerVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_GIFT_WRAPPED:
                return new FurnitureGiftWrappedVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_COUNTER_CLOCK:
                return new FurnitureCounterClockVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_SCORE_BOARD:
                return new FurnitureScoreBoardVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_FIREWORKS:
                return new FurnitureFireworksVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_GIFT_WRAPPED_FIREWORKS:
                return new FurnitureGiftWrappedFireworksVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_SOUNDBLOCK:
                return new FurnitureSoundblockVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_VOTE_COUNTER:
                return new FurnitureVoteCounterVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_VOTE_MAJORITY:
                return new FurnitureVoteMajorityVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_BADGE_DISPLAY:
                return new FurnitureBadgeDisplayVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_GUILD_CUSTOMIZED:
                return new FurnitureGuildCustomizedVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_GUILD_ISOMETRIC_BADGE:
                return new FurnitureGuildIsometricBadgeVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_BB:
                return new FurnitureRoomBillboardVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_BG:
                return new FurnitureRoomBackgroundVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_BUILDER_PLACEHOLDER:
                return new FurnitureBuilderPlaceholderVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_EXTERNAL_IMAGE:
                return new FurnitureExternalImageVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_YOUTUBE:
                return new FurnitureYoutubeVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_MANNEQUIN:
                return new FurnitureMannequinVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_WATER_AREA:
                return new FurnitureWaterAreaVisualization();

            case RoomObjectVisualizationEnum.FURNITURE_PLANET_SYSTEM:
                return new FurniturePlanetSystemVisualization();

                // Avatar types
            case RoomObjectVisualizationEnum.USER:
            case RoomObjectVisualizationEnum.BOT:
            case RoomObjectVisualizationEnum.RENTABLE_BOT:
                return new AvatarVisualization();

            default:
                return null;
        }
    }

    /**
	 * Get or create cached visualization data for a content type.
	 * Data is created once per content id and then cached.
	 *
	 * @see AS3 RoomObjectVisualizationFactory.getRoomObjectVisualizationData()
	 */
    getRoomObjectVisualizationData(id: string, type: string, data: unknown): IRoomObjectVisualizationData | null
    {
        // Check cache first
        const cached = this._visualizationDataCache.get(id);

        if(cached)
        {
            return cached;
        }

        // Avatar visualization types use AvatarVisualizationData
        // AS3: if (_loc7_ is AvatarVisualizationData) { _loc6_.avatarRenderer = _habboAvatar; }
        if(type === 'user' || type === 'bot' || type === 'rentable_bot' || type === 'pet_animated')
        {
            const avatarVizData = new AvatarVisualizationData();

            if(!avatarVizData.initialize(data))
            {
                avatarVizData.dispose();
                return null;
            }

            avatarVizData.avatarRenderManager = this._avatarRenderManager;

            this._visualizationDataCache.set(id, avatarVizData);

            return avatarVizData;
        }

        // Create the appropriate visualization data based on type
        let vizData: FurnitureVisualizationData;

        if(ANIMATED_VIZ_DATA_TYPES.has(type))
        {
            vizData = new AnimatedFurnitureVisualizationData();
        }
        else
        {
            vizData = new FurnitureVisualizationData();
        }

        // Initialize with the raw data
        if(!vizData.initialize(data))
        {
            vizData.dispose();
            return null;
        }

        // Cache the result
        this._visualizationDataCache.set(id, vizData);

        return vizData;
    }

    dispose(): void
    {
        if(this._disposed) return;

        for(const vizData of this._visualizationDataCache.values())
        {
            vizData.dispose();
        }

        this._visualizationDataCache.clear();
        this._disposed = true;
    }
}
