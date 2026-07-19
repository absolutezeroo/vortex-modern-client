import type {IBotsModel} from './IBotsModel';
import type {Bot} from './Bot';

/**
 * Manages bot inventory data
 *
 * Based on AS3 com.sulake.habbo.inventory.bots.BotsModel (ENGINE only)
 */
export class BotsModel implements IBotsModel
{
    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    private _isListInitialized: boolean = false;

    get isListInitialized(): boolean
    {
        return this._isListInitialized;
    }

    private _bots: Map<number, Bot> = new Map();

    get bots(): Map<number, Bot>
    {
        return this._bots;
    }

    dispose(): void
    {
        if(this._disposed) return;

        for(const bot of this._bots.values())
        {
            bot.dispose();
        }

        this._bots.clear();
        this._disposed = true;
    }

    addBot(bot: Bot): boolean
    {
        if(this._bots.has(bot.id))
        {
            return false;
        }

        this._bots.set(bot.id, bot);

        return true;
    }

    updateBots(bots: Map<number, Bot>): {
        added: number[];
        removed: number[];
    }
    {
        const existingIds = new Set(this._bots.keys());
        const newIds = new Set(bots.keys());

        const added: number[] = [];
        const removed: number[] = [];

        // Find bots to remove
        for(const id of existingIds)
        {
            if(!newIds.has(id))
            {
                const bot = this._bots.get(id);

                if(bot)
                {
                    bot.dispose();
                }

                this._bots.delete(id);
                removed.push(id);
            }
        }

        // Find bots to add
        for(const [id, bot] of bots)
        {
            if(!existingIds.has(id))
            {
                this._bots.set(id, bot);
                added.push(id);
            }
        }

        this._isListInitialized = true;

        return {added, removed};
    }

    removeBot(id: number): Bot | null
    {
        const bot = this._bots.get(id);

        if(bot)
        {
            this._bots.delete(id);
            bot.dispose();

            return bot;
        }

        return null;
    }

    getBotById(id: number): Bot | null
    {
        return this._bots.get(id) ?? null;
    }

    getBotsArray(): Bot[]
    {
        return Array.from(this._bots.values());
    }

    getSelectedBot(): Bot | null
    {
        for(const bot of this._bots.values())
        {
            if(bot.isSelected)
            {
                return bot;
            }
        }

        return null;
    }

    selectBot(id: number): void
    {
        this.removeSelections();

        const bot = this._bots.get(id);

        if(bot)
        {
            bot.isSelected = true;
        }
    }

    removeSelections(): void
    {
        for(const bot of this._bots.values())
        {
            bot.isSelected = false;
        }
    }

    resetUnseenItems(): number[]
    {
        const resetIds: number[] = [];

        for(const bot of this._bots.values())
        {
            if(bot.isUnseen)
            {
                bot.isUnseen = false;
                resetIds.push(bot.id);
            }
        }

        return resetIds;
    }

    updateUnseenItems(unseenIds: number[]): void
    {
        const unseenSet = new Set(unseenIds);

        for(const bot of this._bots.values())
        {
            bot.isUnseen = unseenSet.has(bot.id);
        }
    }

    isUnseen(id: number): boolean
    {
        return this._bots.get(id)?.isUnseen ?? false;
    }

    // AS3: sources/win63_version/habbo/inventory/bots/BotsModel.as::updateView()
    // TODO(AS3): no-op until BotsView (habbo/inventory/bots/BotsView.as) is ported.
    updateView(): void
    {
        // Intentional no-op — matches AS3's `if(var_18 == null) return;` guard.
    }
}
