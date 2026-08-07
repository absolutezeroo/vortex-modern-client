/**
 * Room lighting — public surface.
 *
 * NOT A PORT. The Flash client has no dynamic light and no computed shadow; see
 * LightingConfig.ts's header and docs/architectures/room-lighting-architecture.md.
 */
export {FALLOFF_SPAN, LightingConfig} from './LightingConfig';
export {SpriteLighting} from './SpriteLighting';
export type {ILitObject} from './SpriteLighting';
export type {IRoomLightingConfig} from './LightingConfig';
export {RoomLightingController} from './RoomLightingController';
export {RoomLightingLayer} from './RoomLightingLayer';
export {buildOccluders, gridToWorld, isFloorTile, worldToTile} from './OccluderGrid';
export type {IFloorRun, IOccluderData, IOccluderSegment} from './OccluderGrid';
export type {ILightSource} from './types';
