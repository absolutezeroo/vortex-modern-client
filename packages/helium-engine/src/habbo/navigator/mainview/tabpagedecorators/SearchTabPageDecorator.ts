import type { IWindowContainer } from '@core/window/IWindowContainer';
import type { WindowEvent } from '@core/window/events/WindowEvent';
import type { IWindow } from '@core/window/IWindow';
import type { ITabPageDecorator } from './ITabPageDecorator';
import type { ITabNavigator } from '../../domain/Tab';

/**
 * Tab page decorator for the Search tab.
 *
 * Handles the room competitions header (pager for next/prev page)
 * and wires search to the open() call.
 *
 * @see sources/win63_version/habbo/navigator/mainview/tabpagedecorators/SearchTabPageDecorator.as
 */
export class SearchTabPageDecorator implements ITabPageDecorator
{
    private _navigator: ITabNavigator;

    constructor(navigator: ITabNavigator)
    {
        this._navigator = navigator;
    }

    refreshCustomContent(container: IWindowContainer): void
    {
        this.refreshRoomCompetitionsHeader(container);
    }

    tabSelected(): void
    {
    }

    refreshFooter(_container: IWindowContainer): void
    {
    }

    navigatorOpenedWhileInTab(): void
    {
        this._navigator.mainViewCtrl?.open();
    }

    get filterCategory(): string | null
    {
        return null;
    }

    setSubSelection(_value: number): void
    {
    }

    processSearchParam(param: string): string
    {
        return param;
    }

    private refreshRoomCompetitionsHeader(container: IWindowContainer): void
    {
        const header = container.findChildByName('room_competitions_header') as IWindowContainer | null;

        if(!header) return;

        const competitionData = this._navigator.data.competitionRoomsData;

        if(competitionData === null)
        {
            header.visible = false;
            return;
        }

        const pageIndex = competitionData.pageIndex;
        const pageCount = competitionData.pageCount;
        const currentPage = pageIndex + 1;

        if(pageCount < 2)
        {
            header.visible = false;
            return;
        }

        header.visible = true;

        this._navigator.registerParameter('navigator.roomcompetitionspager', 'page', '' + currentPage);
        this._navigator.registerParameter('navigator.roomcompetitionspager', 'total', '' + pageCount);

        const nextButton = header.findChildByName('next_button');
        const prevButton = header.findChildByName('prev_button');

        if(nextButton)
        {
            nextButton.visible = currentPage < pageCount;
            nextButton.procedure = this.onNextButton;
        }

        if(prevButton)
        {
            prevButton.visible = currentPage > 1;
            prevButton.procedure = this.onPrevButton;
        }
    }

    private onNextButton = (_event: WindowEvent, _window: IWindow): void =>
    {
        if(_event.type === 'WME_CLICK')
        {
            const data = this._navigator.data.competitionRoomsData;

            if(data !== null)
            {
                this._navigator.performCompetitionRoomsSearch(data.goalId, data.pageIndex + 1);
            }
        }
    };

    private onPrevButton = (_event: WindowEvent, _window: IWindow): void =>
    {
        if(_event.type === 'WME_CLICK')
        {
            const data = this._navigator.data.competitionRoomsData;

            if(data !== null)
            {
                this._navigator.performCompetitionRoomsSearch(data.goalId, data.pageIndex - 1);
            }
        }
    };
}
