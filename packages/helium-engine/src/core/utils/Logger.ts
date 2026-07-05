/**
 * Log levels
 */
export enum LogLevel
{
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4,
}

/**
 * Logger configuration
 */
export interface LoggerConfig
{
    showTimestamp: boolean;
    showLevel: boolean;
    showSource: boolean;
}

/**
 * Modern logger with colored output for Helium
 */
export class Logger
{
    private static _loggers: Map<string, Logger> = new Map();
    private static _globalLevel: LogLevel = LogLevel.DEBUG;
    private static _levelOverrides: Map<string, LogLevel> = new Map();

    // Console styles
    private static readonly STYLES = {
        // Levels
        debug: 'color: #8B8B8B',
        info: 'color: #4FC3F7',
        warn: 'color: #FFB74D',
        error: 'color: #EF5350',

        // Components
        helium: 'color: #E91E63; font-weight: bold',
        communication: 'color: #9C27B0',
        encryption: 'color: #673AB7',
        handshake: 'color: #3F51B5',
        room: 'color: #2196F3',
        avatar: 'color: #00BCD4',
        ui: 'color: #009688',

        // Status
        success: 'color: #4CAF50; font-weight: bold',
        failure: 'color: #F44336; font-weight: bold',

        // Reset
        reset: 'color: inherit',
    };

    private _name: string;
    private _config: LoggerConfig = {
        showTimestamp: true,
        showLevel: true,
        showSource: true,
    };

    private constructor(name: string)
    {
        this._name = name;
    }

    private static _instance: Logger;

    /**
	 * Get the global logger instance
	 */
    static get instance(): Logger
    {
        if(!this._instance)
        {
            this._instance = new Logger('Helium');
        }
        return this._instance;
    }

    /**
	 * Get effective log level for this logger (per-logger override or global)
	 */
    private get effectiveLevel(): LogLevel
    {
        return Logger._levelOverrides.get(this._name) ?? Logger._globalLevel;
    }

    /**
	 * Get or create a named logger
	 */
    static getLogger(name: string): Logger
    {
        if(!this._loggers.has(name))
        {
            this._loggers.set(name, new Logger(name));
        }
        return this._loggers.get(name)!;
    }

    /**
	 * Set global log level for all loggers without a per-logger override
	 */
    static setLevel(level: LogLevel): void
    {
        this._globalLevel = level;
    }

    /**
	 * Set log level for a specific logger by name
	 */
    static setLoggerLevel(name: string, level: LogLevel): void
    {
        this._levelOverrides.set(name, level);
    }

    /**
	 * Remove per-logger override, falling back to global level
	 */
    static resetLoggerLevel(name: string): void
    {
        this._levelOverrides.delete(name);
    }

    /**
	 * Get effective log level for a named logger
	 */
    static getLoggerLevel(name: string): LogLevel
    {
        return this._levelOverrides.get(name) ?? this._globalLevel;
    }

    /**
	 * Configure the logger
	 */
    configure(config: Partial<LoggerConfig>): void
    {
        this._config = {...this._config, ...config};
    }

    /**
	 * Debug level log
	 */
    debug(...args: unknown[]): void
    {
        this.log(LogLevel.DEBUG, ...args);
    }

    /**
	 * Info level log
	 */
    info(...args: unknown[]): void
    {
        this.log(LogLevel.INFO, ...args);
    }

    /**
	 * Warning level log
	 */
    warn(...args: unknown[]): void
    {
        this.log(LogLevel.WARN, ...args);
    }

    /**
	 * Error level log
	 */
    error(...args: unknown[]): void
    {
        this.log(LogLevel.ERROR, ...args);
    }

    /**
	 * Success message (info level with success styling)
	 */
    success(...args: unknown[]): void
    {
        if(this.effectiveLevel > LogLevel.INFO) return;
        const prefix = this.formatPrefix('✓', Logger.STYLES.success);
        console.log(...prefix, ...args);
    }

    /**
	 * Failure message (error level with failure styling)
	 */
    failure(...args: unknown[]): void
    {
        if(this.effectiveLevel > LogLevel.ERROR) return;
        const prefix = this.formatPrefix('✗', Logger.STYLES.failure);
        console.error(...prefix, ...args);
    }

    /**
	 * Log outgoing message
	 */
    outgoing(messageId: number, messageName?: string): void
    {
        if(this.effectiveLevel > LogLevel.DEBUG) return;

        const name = messageName ? ` (${messageName})` : '';

        console.log(
            `%c→ %c[${this._name}]%c Sent: %c${messageId}${name}`,
            'color: #2196F3; font-weight: bold',
            this.getSourceStyle(),
            Logger.STYLES.reset,
            'color: #2196F3'
        );
    }

    /**
	 * Log with specific level
	 */
    private log(level: LogLevel, ...args: unknown[]): void
    {
        if(level < this.effectiveLevel) return;

        const prefix = this.formatPrefix(this.getLevelLabel(level), this.getLevelStyle(level));

        switch(level)
        {
            case LogLevel.DEBUG:
                console.debug(...prefix, ...args);
                break;
            case LogLevel.INFO:
                console.info(...prefix, ...args);
                break;
            case LogLevel.WARN:
                console.warn(...prefix, ...args);
                break;
            case LogLevel.ERROR:
                console.error(...prefix, ...args);
                break;
        }
    }

    /**
	 * Format the log prefix
	 */
    private formatPrefix(levelLabel: string, levelStyle: string): string[]
    {
        const parts: string[] = [];
        let format = '';

        if(this._config.showTimestamp)
        {
            const time = new Date().toISOString().substring(11, 23);

            format += `%c${time} `;
            parts.push('color: #888');
        }

        if(this._config.showLevel)
        {
            format += `%c${levelLabel} `;
            parts.push(levelStyle);
        }

        if(this._config.showSource)
        {
            format += `%c[${this._name}]%c `;
            parts.push(this.getSourceStyle());
            parts.push(Logger.STYLES.reset);
        }

        return [format, ...parts];
    }

    /**
	 * Get style for log level
	 */
    private getLevelStyle(level: LogLevel): string
    {
        switch(level)
        {
            case LogLevel.DEBUG:
                return Logger.STYLES.debug;
            case LogLevel.INFO:
                return Logger.STYLES.info;
            case LogLevel.WARN:
                return Logger.STYLES.warn;
            case LogLevel.ERROR:
                return Logger.STYLES.error;
            default:
                return Logger.STYLES.reset;
        }
    }

    /**
	 * Get label for log level
	 */
    private getLevelLabel(level: LogLevel): string
    {
        switch(level)
        {
            case LogLevel.DEBUG:
                return 'DBG';
            case LogLevel.INFO:
                return 'INF';
            case LogLevel.WARN:
                return 'WRN';
            case LogLevel.ERROR:
                return 'ERR';
            default:
                return '???';
        }
    }

    /**
	 * Get style for source name
	 */
    private getSourceStyle(): string
    {
        const name = this._name.toLowerCase();

        if(name.includes('helium')) return Logger.STYLES.helium;
        if(name.includes('communication') || name.includes('socket')) return Logger.STYLES.communication;
        if(name.includes('encryption') || name.includes('rsa') || name.includes('diffie')) return Logger.STYLES.encryption;
        if(name.includes('handshake') || name.includes('auth')) return Logger.STYLES.handshake;
        if(name.includes('room')) return Logger.STYLES.room;
        if(name.includes('avatar')) return Logger.STYLES.avatar;
        if(name.includes('ui') || name.includes('window')) return Logger.STYLES.ui;

        return 'color: #607D8B; font-weight: bold';
    }
}

// Export singleton for convenience
export const log = Logger.instance;
