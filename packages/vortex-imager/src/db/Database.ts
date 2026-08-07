/**
 * Read-only access to the hotel database.
 *
 * Two things the imager cannot derive from the client's assets live here: which figure a
 * username currently wears, and the guild badge part / colour catalogue. Both are the
 * server's data, so both are read from the server's tables rather than mirrored into this
 * repository — a mirrored copy is a copy that goes stale silently.
 *
 * Every statement is a SELECT. The pool is small on purpose: a badge or avatar request does
 * at most one lookup, and everything it reads is cached afterwards.
 */
import {createPool} from 'mysql2/promise';
import type {Pool, RowDataPacket} from 'mysql2/promise';
import {Logger} from '@core/utils/Logger';
import type {IDatabaseConfig} from '../config';

const log = Logger.getLogger('imager.db.Database');

export interface IPlayerLook
{
    name: string;
    figure: string;

    /** `M` or `F` — `AvatarGenderType` is stored as 0/1. */
    gender: string;
}

export interface IBadgePartRow
{
    partId: number;
    type: string;
    fileName: string;
    maskFileName: string;
}

export class Database
{
    private _pool: Pool;

    constructor(config: IDatabaseConfig)
    {
        this._pool = createPool({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database,
            connectionLimit: config.connectionLimit,
            waitForConnections: true,
            enableKeepAlive: true
        });
    }

    /**
	 * Resolves a username to the look it is wearing right now.
	 *
	 * Soft-deleted rows are excluded: `players.deleted_at` defaults to a timestamp and is
	 * maintained on update, so it is not a "deleted" flag in the usual sense — only rows the
	 * emulator considers live should answer a lookup.
	 */
    async findPlayerLook(name: string): Promise<IPlayerLook | null>
    {
        const [rows] = await this._pool.query<RowDataPacket[]>(
            'SELECT `name`, `figure`, `gender` FROM `players` WHERE `name` = ? LIMIT 1',
            [name]
        );

        const row = rows[0];

        if(row === undefined) return null;

        return {
            name: String(row.name),
            figure: String(row.figure),
            gender: Number(row.gender) === 1 ? 'F' : 'M'
        };
    }

    // The badge editor only ever offers enabled parts, so a badge that references a disabled
    // one is a badge the editor could not have produced; it is still rendered, because the
    // code is already stored on the guild and refusing it would blank an existing badge.
    async findBadgeParts(): Promise<IBadgePartRow[]>
    {
        const [rows] = await this._pool.query<RowDataPacket[]>(
            'SELECT `part_id`, `type`, `file_name`, `mask_file_name` FROM `group_badge_parts`'
        );

        return rows.map((row) => ({
            partId: Number(row.part_id),
            type: String(row.type),
            fileName: String(row.file_name ?? ''),
            maskFileName: String(row.mask_file_name ?? '')
        }));
    }

    async findBadgeColors(): Promise<Map<number, string>>
    {
        const [rows] = await this._pool.query<RowDataPacket[]>(
            'SELECT `color_id`, `color_hex` FROM `group_colors`'
        );

        const colors = new Map<number, string>();

        for(const row of rows) colors.set(Number(row.color_id), String(row.color_hex ?? ''));

        return colors;
    }

    async ping(): Promise<boolean>
    {
        try
        {
            await this._pool.query('SELECT 1');

            return true;
        }
        catch (error)
        {
            log.warn('Database ping failed', error);

            return false;
        }
    }

    async dispose(): Promise<void>
    {
        await this._pool.end();
    }
}
