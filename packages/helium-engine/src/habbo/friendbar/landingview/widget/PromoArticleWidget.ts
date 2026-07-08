import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IUpdateReceiver} from '@core/runtime/IContext';
import type {ILandingViewWidget} from '../interfaces/ILandingViewWidget';
import type {ISettingsAwareWidget} from '../interfaces/ISettingsAwareWidget';
import type {HabboLandingView} from '../HabboLandingView';
import type {CommonWidgetSettings} from '../layout/CommonWidgetSettings';
import {WidgetContainerLayout} from '../layout/WidgetContainerLayout';
import type {PromoArticleData} from '@habbo/communication/messages/parser/landingview/PromoArticleData';
import {PromoArticlesMessageEvent} from '@habbo/communication/messages/incoming/landingview/PromoArticlesMessageEvent';
import type {PromoArticlesMessageParser} from '@habbo/communication/messages/parser/landingview/PromoArticlesMessageParser';
import {GetPromoArticlesComposer} from '@habbo/communication/messages/outgoing/landingview/GetPromoArticlesComposer';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';

/**
 * Rotating promo-article carousel (news carousel) - up to 10 articles with a
 * fade transition between them, navigation dots, and web/internal link CTAs.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/PromoArticleWidget.as
 */
export class PromoArticleWidget implements ILandingViewWidget, ISettingsAwareWidget, IUpdateReceiver
{
    private static readonly REFRESH_PERIOD_IN_MILLIS: number = 600000;
    private static readonly FADE_LENGTH: number = 500;
    private static readonly MAX_ARTICLES: number = 10;

    private _landingView: HabboLandingView | null;
    private _container: IWindowContainer | null = null;
    private _currentIndex: number = 0;
    private _articles: PromoArticleData[] = [];
    private _lastRequestTime: Date | null = null;
    private _promoArticlesEvent: IMessageEvent | null = null;
    private _fadeElapsed: number = 0;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/PromoArticleWidget.as::PromoArticleWidget()
    constructor(landingView: HabboLandingView)
    {
        this._landingView = landingView;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/PromoArticleWidget.as::initialize()
    initialize(): void
    {
        if(!this._landingView) return;

        this._container = this._landingView.getXmlWindow('promo_article') as IWindowContainer | null;

        if(!this._container) return;

        this._container.procedure = this.onMouse;

        this._promoArticlesEvent = new PromoArticlesMessageEvent(this.onPromoArticles);
        this._landingView.communicationManager?.addHabboConnectionMessageEvent(this._promoArticlesEvent);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/PromoArticleWidget.as::refresh()
    refresh(): void
    {
        if(!this._landingView) return;

        if(this._lastRequestTime === null || this._lastRequestTime.getTime() + PromoArticleWidget.REFRESH_PERIOD_IN_MILLIS < Date.now())
        {
            this._landingView.send(new GetPromoArticlesComposer());
            this._lastRequestTime = new Date();
        }
        else
        {
            this.goToArticle(this._currentIndex);
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/PromoArticleWidget.as::get container()
    get container(): IWindow | null
    {
        return this._container;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/PromoArticleWidget.as::dispose()
    dispose(): void
    {
        if(this._promoArticlesEvent && this._landingView)
        {
            this._landingView.communicationManager?.removeHabboConnectionMessageEvent(this._promoArticlesEvent);
            this._promoArticlesEvent.dispose();
            this._promoArticlesEvent = null;
        }

        if(this._container)
        {
            this._container.dispose();
            this._container = null;
        }

        this._landingView = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/PromoArticleWidget.as::get disposed()
    get disposed(): boolean
    {
        return this._landingView === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/PromoArticleWidget.as::set settings()
    set settings(value: CommonWidgetSettings)
    {
        if(this._container)
        {
            WidgetContainerLayout.applyCommonWidgetSettings(this._container, value);
        }
    }

    private refreshContent(): void
    {
        this.setArticleContent();
        this.setNavigationDisks();
    }

    private setArticleContent(): void
    {
        const article = this._articles[this._currentIndex];

        if(!article || !this._container) return;

        const title = this._container.findChildByName('promo_title');
        const text = this._container.findChildByName('promo_text');
        const button = this._container.findChildByName('button');
        const image = this._container.findChildByName('promo_image');

        if(title) title.caption = article.title;
        if(text) text.caption = article.bodyText;

        if(button)
        {
            button.visible = !(article.linkType === 2 || (article.linkType === 0 && article.linkContent === ''));
            button.immediateClickMode = true;
            button.caption = article.buttonText;
        }

        if(image)
        {
            image.visible = article.imageUrl !== '';

            try
            {
                (image as IStaticBitmapWrapperWindow).assetUri = '${image.library.url}' + article.imageUrl;
            }
            catch (_e)
            {
                this._landingView?.context.warning('Missing image url for promo article with title: ' + article.title);
            }
        }
    }

    private setNavigationDisks(): void
    {
        const navigation = this._container?.findChildByName('navigation') as IWindowContainer | null;

        if(!navigation) return;

        for(let i = 0; i < PromoArticleWidget.MAX_ARTICLES; i++)
        {
            const region = navigation.getChildAt(i) as IRegionWindow | null;

            if(!region) continue;

            if(this._articles.length > i)
            {
                const disk = region.getChildAt(0) as IStaticBitmapWrapperWindow | null;

                if(disk)
                {
                    disk.assetUri = 'progress_disk_flat_' + (this._currentIndex === i ? 'on' : 'off');
                }

                region.visible = true;
            }
            else
            {
                region.visible = false;
            }
        }
    }

    private goToArticle(index: number): void
    {
        const isSameArticle = index === this._currentIndex;

        if(this._articles.length === 0) return;

        if(index < 0)
        {
            this._currentIndex = this._articles.length - 1;
        }
        else if(index >= this._articles.length)
        {
            this._currentIndex = 0;
        }
        else
        {
            this._currentIndex = index;
        }

        if(isSameArticle)
        {
            this.refreshContent();
        }
        else
        {
            this.startFade();
        }
    }

    private startFade(): void
    {
        this._fadeElapsed = 0;
        this._landingView?.registerUpdateReceiver(this, 1);
    }

    private stopFade(): void
    {
        this._landingView?.removeUpdateReceiver(this);
        this.setBlend(1);
    }

    private followLink(): void
    {
        const article = this._articles[this._currentIndex];

        if(!article) return;

        switch(article.linkType)
        {
            case 0:
                HabboWebTools.openWebPage(article.linkContent);
                break;
            case 1:
                this._landingView?.context.createLinkEvent(article.linkContent);
        }
    }

    private onMouse = (event: WindowEvent, window: IWindow): void =>
    {
        if(window.name === 'article_navigation')
        {
            if(event.type === WindowMouseEvent.OVER)
            {
                this.hoverOverNavigation(window, true);
            }
            else if(event.type === WindowMouseEvent.OUT && window.id !== this._currentIndex)
            {
                this.hoverOverNavigation(window, false);
            }
        }

        if(event.type !== WindowMouseEvent.CLICK) return;

        switch(window.name)
        {
            case 'button':
                this.followLink();
                break;
            case 'article_navigation':
                this.goToArticle(window.id);
        }
    };

    private hoverOverNavigation(regionWindow: IWindow, hovering: boolean): void
    {
        const disk = (regionWindow as IWindowContainer).getChildAt(0) as IStaticBitmapWrapperWindow | null;

        if(!disk) return;

        disk.assetUri = 'progress_disk_flat_' + (hovering ? 'on' : 'off');
    }

    private onPromoArticles = (event: IMessageEvent): void =>
    {
        const parser = event.parser as PromoArticlesMessageParser | null;

        this._articles = parser ? [...parser.articles] : [];
        this.refresh();
    };

    private setBlend(blend: number): void
    {
        if(!this._container) return;

        const title = this._container.findChildByName('promo_title');
        const text = this._container.findChildByName('promo_text');
        const button = this._container.findChildByName('button');
        const image = this._container.findChildByName('promo_image');

        if(title) title.blend = blend;
        if(text) text.blend = blend;
        if(button) button.blend = blend;
        if(image) image.blend = blend;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/PromoArticleWidget.as::update()
    update(elapsedTime: number): void
    {
        const nextElapsed = this._fadeElapsed + elapsedTime;

        if(this._fadeElapsed < PromoArticleWidget.FADE_LENGTH)
        {
            this.setBlend(Math.max(0, 1 - this._fadeElapsed / PromoArticleWidget.FADE_LENGTH));

            if(nextElapsed >= PromoArticleWidget.FADE_LENGTH)
            {
                this.refreshContent();
            }
        }
        else
        {
            this.setBlend(Math.min(1, (this._fadeElapsed - PromoArticleWidget.FADE_LENGTH) / PromoArticleWidget.FADE_LENGTH));
        }

        this._fadeElapsed = nextElapsed;

        if(this._fadeElapsed >= PromoArticleWidget.FADE_LENGTH * 2)
        {
            this.stopFade();
        }
    }
}
