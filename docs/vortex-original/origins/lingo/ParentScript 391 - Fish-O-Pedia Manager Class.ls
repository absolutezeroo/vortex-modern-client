property pWindowID, pLastMousePosID, pAnimStartTime, pAnimTime, pBuffer, pHitboxSpr, pSpreadIndex, pBookmarkSpreadIndex, pFishes, pPagesImages, pAnimRightToLeft, pAnimTempImages, pWriterBold, pWriterPlain, pWeekDaysList, pAnimShadowOffset, pAnimShadowImg, pAnimShadowBlendLevel

on construct me
  pWindowID = "fish_o_pedia_window"
  pFishes = [:]
  pSpreadIndex = 0
  pPagesImages = [:]
  pBookmarkSpreadIndex = -1
  pAnimTempImages = VOID
  pAnimRightToLeft = 1
  pAnimStartTime = 0
  pAnimTime = 500
  pAnimShadowOffset = 10
  pAnimShadowBlendLevel = 30
  pAnimShadowImg = image(1, 1, 1)
  pAnimShadowImg.fill(pAnimShadowImg.rect, color(0, 0, 0))
  createWriter("fishpedia_bold_left", getStructVariable("struct.font.bold"))
  pWriterBold = getWriter("fishpedia_bold_left")
  createWriter("fishpedia_plain_left", getStructVariable("struct.font.plain"))
  pWriterPlain = getWriter("fishpedia_plain_left")
  if textExists("fishpedia_weekdays") then
    pWeekDaysList = value("[" & getText("fishpedia_weekdays") & "]")
  else
    pWeekDaysList = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  end if
end

on deconstruct me
  removeWriter(pWriterBold.getID())
  pWriterBold = VOID
  removeWriter(pWriterPlain.getID())
  pWriterPlain = VOID
  pFishes = [:]
  pPagesImages = [:]
  pBuffer = VOID
  pHitboxSpr = VOID
  pAnimTempImages = VOID
end

on openFishPedia me
  if pFishes.count > 0 then
    if not windowExists(pWindowID) then
      createWindow(pWindowID, "fish_o_pedia.window")
      tWndObj = getWindow(pWindowID)
      tWndObj.registerClient(me.getID())
      tWndObj.registerProcedure(#eventProcFishPedia, me.getID(), #mouseUp)
      tWndObj.registerProcedure(#eventProcFishPedia, me.getID(), #mouseEnter)
      tWndObj.registerProcedure(#eventProcFishPedia, me.getID(), #mouseLeave)
      tWndObj.registerProcedure(#eventProcFishPedia, me.getID(), #mouseWithin)
      tWndObj.center()
      pBuffer = tWndObj.getElement("drag").getProperty(#buffer).image
      pHitboxSpr = tWndObj.getElement("canvas_hitbox").getProperty(#sprite)
      pSpreadIndex = 0
      me.openPage(1)
    end if
  else
    error(me, "The Fishpedia is empty. No fish to display.", #openFishPedia, #minor)
  end if
end

on closeFishPedia me
  if windowExists(pWindowID) then
    pPagesImages = [:]
    pAnimTempImages = VOID
    pBuffer = VOID
    pHitboxSpr = VOID
    removeWindow(pWindowID)
  end if
end

on changePage me, tDirection
  me.openPage(pSpreadIndex + tDirection, 0)
end

on openPage me, tIndex, tSkipAnimation
  if (tIndex >= 0) and (tIndex <= me.getTotalSpreadCount()) then
    tOverviewPageCount = me.getOverviewPageCount()
    tCurrPageSpreadIndex = me.getLeftPageIndex(pSpreadIndex)
    tNextPageSpreadIndex = me.getLeftPageIndex(tIndex)
    if tNextPageSpreadIndex > tOverviewPageCount then
      if tCurrPageSpreadIndex <= tOverviewPageCount then
        pBookmarkSpreadIndex = pSpreadIndex
      end if
    else
      pBookmarkSpreadIndex = -1
    end if
    if tSkipAnimation then
      pSpreadIndex = tIndex
      me.drawCurrentPages()
    else
      pAnimRightToLeft = pSpreadIndex < tIndex
      tCurrPages = me.getPageImages(pSpreadIndex)
      tNextPages = me.getPageImages(tIndex)
      pAnimTempImages = []
      if pAnimRightToLeft then
        pAnimTempImages.add(tCurrPages[1])
        pAnimTempImages.add(tCurrPages[2])
        if pSpreadIndex = 0 then
          pAnimTempImages.add(me.flipImage(me.addCoverToPage(tNextPages[1])))
        else
          pAnimTempImages.add(me.flipImage(tNextPages[1]))
        end if
        pAnimTempImages.add(tNextPages[2])
      else
        pAnimTempImages.add(tNextPages[1])
        pAnimTempImages.add(tNextPages[2])
        if tIndex = 0 then
          pAnimTempImages.add(me.flipImage(me.addCoverToPage(tCurrPages[1])))
        else
          pAnimTempImages.add(me.flipImage(tCurrPages[1]))
        end if
        pAnimTempImages.add(tCurrPages[2])
      end if
      pSpreadIndex = tIndex
      pAnimStartTime = getMonotonicMillis()
      receiveUpdate(me.getID())
    end if
  end if
end

on updateHitboxElement me
  tWndObj = getWindow(pWindowID)
  if tWndObj <> 0 then
    tWndObj.getElement("canvas_hitbox").feedImage(me.renderHitbox())
  end if
end

on updateFishList me, tFishesList
  pFishes = tFishesList
  pPagesImages = [:]
  if windowExists(pWindowID) then
    me.openPage(1, 1)
  end if
end

on updateFish me, tFishProps
  tFishCode = tFishProps[#code]
  pFishes[tFishCode] = tFishProps
  pPagesImages.deleteProp("page_details_" & tFishCode)
  tOverviewPageCount = me.getOverviewPageCount()
  repeat with i = 1 to tOverviewPageCount
    pPagesImages.deleteProp("page_overview_" & i)
  end repeat
  if windowExists(pWindowID) then
    me.openPage(pSpreadIndex, 1)
  end if
end

on getOverviewPageFishes me, tIndex
  tFishes = []
  tStartIndex = ((tIndex - 1) * 8) + 1
  tEndIndex = min(tStartIndex + 7, pFishes.count)
  repeat with i = tStartIndex to tEndIndex
    tFishes.add(pFishes[i])
  end repeat
  return tFishes
end

on getOverviewPageCount me
  return (pFishes.count / 8) + ((pFishes.count mod 8) <> 0)
end

on getTotalSpreadCount me
  tTotalPages = pFishes.count + me.getOverviewPageCount()
  return (tTotalPages / 2) + ((tTotalPages mod 2) <> 0)
end

on getLeftPageIndex me, tSpreadIndex
  return ((tSpreadIndex - 1) * 2) + 1
end

on getPageImages me, tIndex
  tImages = []
  tOverviewPageCount = me.getOverviewPageCount()
  tStartIndex = me.getLeftPageIndex(tIndex)
  repeat with i = 0 to 1
    tPageIndex = tStartIndex + i
    tIsLeftPage = (tPageIndex mod 2) = 1
    tPageKey = VOID
    tFishProps = VOID
    if tPageIndex > tOverviewPageCount then
      tPageIndex = tPageIndex - tOverviewPageCount
      if (tPageIndex > 0) and (tPageIndex <= pFishes.count) then
        tFishProps = pFishes[tPageIndex]
        tPageKey = "page_details_" & tFishProps[#code]
      end if
      tPageIndex = tStartIndex + i
    else
      if tPageIndex > 0 then
        tPageKey = "page_overview_" & tPageIndex
      end if
    end if
    if stringp(tPageKey) then
      if voidp(pPagesImages[tPageKey]) then
        if ilk(tFishProps) = #propList then
          pPagesImages[tPageKey] = me.renderFishInfoPage(tFishProps, tPageIndex, tIsLeftPage)
        else
          pPagesImages[tPageKey] = me.renderFishesOverviewPage(tPageIndex, tIsLeftPage)
        end if
      end if
      tImages.add(pPagesImages[tPageKey])
      next repeat
    end if
    if tPageIndex < 1 then
      if tPageIndex = 0 then
        tImages.add(member(getmemnum("fishpedia_book_cover")).image)
      else
        tImages.add(image(1, 1, 1))
      end if
      next repeat
    end if
    tImages.add(me.renderPageBackground(VOID, tIsLeftPage))
  end repeat
  return tImages
end

on eventProcFishPedia me, tEvent, tElemID, tParam
  if tElemID = "canvas_hitbox" then
    case tEvent of
      #mouseUp:
        if tParam.locV > 330 then
          if tParam.locH > 244 then
            me.changePage(1)
          else
            if pSpreadIndex > 1 then
              me.changePage(-1)
            end if
          end if
        else
          if tParam.locV > 70 then
            tIsRightPage = tParam.locH > 244
            tStartLocH = 28 + (245 * tIsRightPage)
            tLeftPageIndex = me.getLeftPageIndex(pSpreadIndex)
            tOverviewPageCount = me.getOverviewPageCount()
            tFishes = me.getOverviewPageFishes(tLeftPageIndex + tIsRightPage)
            tLocH = tParam.locH - tStartLocH
            tLocV = tParam.locV - 94
            tIndex = (tLocH / 96) + (2 * (tLocV / 62)) + 1
            tFishInfoPageIndex = tOverviewPageCount + ((tLeftPageIndex + tIsRightPage - 1) * 8) + tIndex
            if (tFishInfoPageIndex mod 2) = 1 then
              tFishInfoPageIndex = tFishInfoPageIndex + 1
            end if
            tPageIndex = tFishInfoPageIndex / 2
            if pSpreadIndex <> tPageIndex then
              if (tPageIndex > 0) and (tPageIndex <= me.getTotalSpreadCount()) then
                me.openPage(tPageIndex)
              end if
            end if
          else
            if tParam.locH > 463 then
              me.openPage(0)
            else
              if pBookmarkSpreadIndex > -1 then
                me.openPage(pBookmarkSpreadIndex)
              end if
            end if
          end if
        end if
      #mouseLeave:
        tloc = the mouseLoc - pHitboxSpr.loc
        me.restorePage(tloc.locH > 244)
        pLastMousePosID = -1
      #mouseWithin:
        if pSpreadIndex > 0 then
          if tParam.locV > 330 then
            tIsRightPage = tParam.locH > 244
            if pLastMousePosID <> tIsRightPage then
              pLastMousePosID = tIsRightPage
              me.restorePage(tIsRightPage)
              me.drawPageCorner(tIsRightPage)
            end if
          else
            if tParam.locV > 70 then
              tIsRightPage = tParam.locH > 244
              tStartLocH = 28 + (245 * tIsRightPage)
              tLocH = tParam.locH - tStartLocH
              tLocV = tParam.locV - 94
              tIndex = (tLocH / 96) + (2 * (tLocV / 62))
              if pLastMousePosID <> tIndex then
                pLastMousePosID = tIndex
                me.restorePage(tIsRightPage)
                me.drawPageHiliter(tIndex, tIsRightPage)
              end if
            end if
          end if
        end if
    end case
  end if
end

on update me
  tMoveTime = getMonotonicMillis() - pAnimStartTime
  if tMoveTime > pAnimTime then
    removeUpdate(me.getID())
    me.drawCurrentPages()
    if pSpreadIndex = 0 then
      me.closeFishPedia()
    end if
    return 1
  end if
  pBuffer.fill(pBuffer.rect, color(255, 255, 255))
  tBackground = member(getmemnum("fishpedia_background")).image
  pBuffer.copyPixels(tBackground, rect(0, 50, tBackground.width, 50 + tBackground.height), tBackground.rect)
  tPageImg = pAnimTempImages[1]
  if tPageImg.height < 200 then
    pBuffer.fill(rect(0, 50, 243, 359), color(255, 255, 255))
  else
    tLocH = (tPageImg.width < 240) * 8
    tLocV = 55 - ((tPageImg.height > 300) * 5)
    pBuffer.copyPixels(tPageImg, rect(tLocH, tLocV, tLocH + tPageImg.width, tLocV + tPageImg.height), tPageImg.rect)
  end if
  tPageImg = pAnimTempImages[4]
  pBuffer.copyPixels(tPageImg, rect(243, 55, 243 + tPageImg.width, 55 + tPageImg.height), tPageImg.rect)
  me.drawBookmark()
  tStartH = 236
  tFinalH = -236
  if not pAnimRightToLeft then
    tStartH = -tStartH
    tFinalH = -tFinalH
  end if
  tPageWidth = tStartH + ((tFinalH - tStartH) * tMoveTime / pAnimTime)
  tPageHeightOffset = 20 - (20 * abs(tPageWidth) / 236)
  tShowShadow = 1
  if tPageWidth < 0 then
    tPageImg = pAnimTempImages[3]
    tloc = point(244, 55 - ((tPageImg.height > 300) * 5))
    tShadowLoc = point(max(tloc[1] + tPageWidth - pAnimShadowOffset, 9), tloc[1] + tPageWidth)
    tShowShadow = (pSpreadIndex > 0) and not ((pSpreadIndex = 1) and pAnimRightToLeft)
  else
    tPageImg = pAnimTempImages[2]
    tloc = point(243, 55 - ((tPageImg.height > 300) * 5))
    tShadowLoc = point(tloc[1] + tPageWidth, min(tloc[1] + tPageWidth + pAnimShadowOffset, 479))
  end if
  if tShowShadow then
    pBuffer.copyPixels(pAnimShadowImg, rect(tShadowLoc[1], 55, tShadowLoc[2], 353), pAnimShadowImg.rect, [#blendLevel: pAnimShadowBlendLevel])
  end if
  tQuad = []
  tQuad.add(point(tloc[1], tloc[2]))
  tQuad.add(point(tloc[1] + tPageWidth, tloc[2] - tPageHeightOffset))
  tQuad.add(point(tloc[1] + tPageWidth, tloc[2] + tPageImg.height + tPageHeightOffset))
  tQuad.add(point(tloc[1], tloc[2] + tPageImg.height - 1))
  pBuffer.copyPixels(tPageImg, tQuad, tPageImg.rect)
  me.drawCloseButton()
end

on drawPageHiliter me, tIndex, tIsRightPage
  tStartLocH = 28 + (245 * tIsRightPage)
  tLocH = tStartLocH + (tIndex mod 2 * 96)
  tLocV = 94 + (62 * (tIndex / 2))
  tHiliterImg = member(getmemnum("fishpedia_hiliter")).image
  pBuffer.copyPixels(tHiliterImg, rect(tLocH, tLocV, tLocH + tHiliterImg.width, tLocV + tHiliterImg.height), tHiliterImg.rect, [#ink: 36])
end

on drawPageCorner me, tIsRightCorner
  tCornerImg = member(getmemnum("fishpedia_corner")).image
  if tIsRightCorner then
    tloc = point(455, 330)
    tCornerImg = me.flipImage(tCornerImg)
  else
    tloc = point(8, 330)
  end if
  pBuffer.copyPixels(tCornerImg, rect(tloc[1], tloc[2], tloc[1] + tCornerImg.width, tloc[2] + tCornerImg.height), tCornerImg.rect)
end

on restorePage me, tIsRightPage
  tCurrPages = me.getPageImages(pSpreadIndex)
  tPageImg = tCurrPages[tIsRightPage + 1]
  if tIsRightPage then
    tLocH = 243
  else
    tLocH = (tPageImg.width < 240) * 8
  end if
  tLocV = 55 - ((tPageImg.height > 300) * 5)
  pBuffer.copyPixels(tPageImg, rect(tLocH, tLocV, tLocH + tPageImg.width, tLocV + tPageImg.height), tPageImg.rect)
  me.drawCloseButton()
end

on drawCurrentPages me
  pAnimTempImages = VOID
  pBuffer.fill(pBuffer.rect, color(255, 255, 255))
  tBackground = member(getmemnum("fishpedia_background")).image
  pBuffer.copyPixels(tBackground, rect(0, 50, tBackground.width, 50 + tBackground.height), tBackground.rect)
  if pSpreadIndex = 0 then
    pBuffer.fill(rect(0, 50, 243, 359), color(255, 255, 255))
  end if
  tCurrPages = me.getPageImages(pSpreadIndex)
  repeat with i = 1 to tCurrPages.count
    tPageImg = tCurrPages[i]
    tLocH = 8 + ((i - 1) * 235)
    if (tPageImg.width > 236) and (i = 1) then
      tLocH = tLocH - 8
    end if
    tLocV = 55 - ((tPageImg.height > 300) * 5)
    pBuffer.copyPixels(tPageImg, rect(tLocH, tLocV, tLocH + tPageImg.width, tLocV + tPageImg.height), tPageImg.rect)
  end repeat
  me.drawBookmark()
  me.drawCloseButton()
  me.updateHitboxElement()
end

on drawCloseButton me
  if pSpreadIndex > 0 then
    tCloseBtn = member(getmemnum("fishpedia_close_btn")).image
    pBuffer.copyPixels(tCloseBtn, rect(465, 57, 465 + tCloseBtn.width, 57 + tCloseBtn.height), tCloseBtn.rect, [#ink: 36])
  end if
end

on drawBookmark me
  if pBookmarkSpreadIndex > -1 then
    tBookmarkImg = member(getmemnum("fishpedia_bookmark")).image
    pBuffer.copyPixels(tBookmarkImg, rect(195, 27, 195 + tBookmarkImg.width, 27 + tBookmarkImg.height), tBookmarkImg.rect)
  end if
end

on renderFishInfoPage me, tFishProps, tPageIndex, tIsLeftPage
  tFishName = getText("fishpedia_" & tFishProps[#code] & "_name")
  tImage = me.renderPageBackground(tPageIndex, tIsLeftPage, replaceChunks(getText("fishpedia_fish_details_title", "%n Details"), "%n", tFishName))
  tStartLocH = 24
  if tIsLeftPage then
    tStartLocH = 14
  end if
  tTitleImg = pWriterBold.render(tFishName)
  tImage.copyPixels(tTitleImg, rect(tStartLocH + 6, 27, tStartLocH + 6 + tTitleImg.width, 27 + tTitleImg.height), tTitleImg.rect)
  tFishPreview = me.renderFishPreview(tFishProps, 1)
  tImage.copyPixels(tFishPreview, rect(tStartLocH + 6, 38, tStartLocH + 6 + tFishPreview.width, 38 + tFishPreview.height), tFishPreview.rect, [#ink: 36])
  tTextImg = pWriterBold.render(getText("fishpedia_rarity_title", "Rarity:"))
  tImage.copyPixels(tTextImg, rect(tStartLocH + 102, 59, tStartLocH + 102 + tTextImg.width, 59 + tTextImg.height), tTextImg.rect)
  tRarityImg = me.renderFishRarity(tFishProps[#rarity])
  tImage.copyPixels(tRarityImg, rect(tStartLocH + 102, 70, tStartLocH + 102 + tRarityImg.width, 70 + tRarityImg.height), tRarityImg.rect, [#ink: 36])
  tXPImage = me.renderInfoField(getText("fishpedia_xp_title", "XP:"), tFishProps[#xp])
  tImage.copyPixels(tXPImage, rect(tStartLocH + 6, 87, tXPImage.width + tStartLocH + 6, tXPImage.height + 87), tXPImage.rect, [#ink: 36])
  tTokensImage = me.renderInfoField(getText("fishpedia_tokens_title", "Tokens:"), tFishProps[#tokens], "tokens")
  tImage.copyPixels(tTokensImage, rect(tStartLocH + 6, 104, tTokensImage.width + tStartLocH + 6, tTokensImage.height + 104), tTokensImage.rect, [#ink: 36])
  tRateImage = me.renderInfoField(getText("fishpedia_catch_rate_title", "Catch Rate:"), tFishProps[#catchRate])
  tImage.copyPixels(tRateImage, rect(tStartLocH + 6, 121, tRateImage.width + tStartLocH + 6, tRateImage.height + 121), tRateImage.rect, [#ink: 36])
  tTextImg = pWriterBold.render(getText("fishpedia_location_title", "Location:"))
  tImage.copyPixels(tTextImg, rect(tStartLocH + 8, 139, tStartLocH + 8 + tTextImg.width, 139 + tTextImg.height), tTextImg.rect)
  tImg = member(getmemnum("fishpedia_location_bar")).image
  tImage.copyPixels(tImg, rect(tStartLocH + 4, 150, tStartLocH + 4 + tImg.width, 150 + tImg.height), tImg.rect, [#ink: 36])
  tTextImg = pWriterPlain.render(getText("fishpedia_location_" & tFishProps[#location], "???"), rect(0, 0, 156, 15))
  tImage.copyPixels(tTextImg, rect(tStartLocH + 7, 155, tStartLocH + 7 + tTextImg.width, 155 + tTextImg.height), tTextImg.rect)
  tTextImg = pWriterBold.render(getText("fishpedia_timeline_title", "Active Hours:"))
  tImage.copyPixels(tTextImg, rect(tStartLocH + 6, 177, tStartLocH + 6 + tTextImg.width, 177 + tTextImg.height), tTextImg.rect)
  tTimelineImg = me.renderFishTimeline(tFishProps[#hours])
  tImage.copyPixels(tTimelineImg, rect(tStartLocH + 1, 191, tStartLocH + 1 + tTimelineImg.width, 191 + tTimelineImg.height), tTimelineImg.rect, [#ink: 36])
  tTextImg = pWriterBold.render(getText("fishpedia_active_days_title", "Active Days:"))
  tImage.copyPixels(tTextImg, rect(tStartLocH + 6, 231, tStartLocH + 6 + tTextImg.width, 231 + tTextImg.height), tTextImg.rect)
  tActiveDaysImg = me.renderFishActiveDays(tFishProps[#weekDays])
  tImage.copyPixels(tActiveDaysImg, rect(tStartLocH + 4, 246, tStartLocH + 4 + tActiveDaysImg.width, 246 + tActiveDaysImg.height), tActiveDaysImg.rect, [#ink: 36])
  return tImage
end

on renderFishesOverviewPage me, tPageIndex, tIsLeftPage
  tImage = me.renderPageBackground(tPageIndex, tIsLeftPage, getText("fishpedia_fish_overview_title", "Fish Overview"))
  tStartLocH = 30
  if tIsLeftPage then
    tStartLocH = 20
  end if
  tFishes = me.getOverviewPageFishes(tPageIndex)
  repeat with i = 1 to tFishes.count
    tFishProps = tFishes[i]
    tLocH = tStartLocH + ((i - 1) mod 2 * 96)
    tLocV = 22 + (62 * ((i - 1) / 2))
    tFishNameImg = pWriterPlain.render(getText("fishpedia_" & tFishProps[#code] & "_name"), rect(0, 0, 93, 11))
    tImage.copyPixels(tFishNameImg, rect(tLocH + 1, tLocV + 6, tLocH + tFishNameImg.width + 1, tLocV + tFishNameImg.height + 6), tFishNameImg.rect)
    tFishPreview = me.renderFishPreview(tFishProps)
    tImage.copyPixels(tFishPreview, rect(tLocH, tLocV + 17, tLocH + tFishPreview.width, tLocV + tFishPreview.height + 17), tFishPreview.rect, [#ink: 36])
  end repeat
  return tImage
end

on renderFishPreview me, tFishProps, tIsInfoPage
  if tIsInfoPage then
    tImage = member(getmemnum("fishpedia_info_slot")).image.duplicate()
  else
    tImage = member(getmemnum("fishpedia_slot")).image.duplicate()
  end if
  tFishPreviewNum = getmemnum("fishpedia_" & tFishProps[#code] & "_preview")
  if tFishPreviewNum <> 0 then
    tFishPreviewMem = member(tFishPreviewNum)
    if tFishPreviewMem.type = #bitmap then
      tFishPreview = tFishPreviewMem.image
      tloc = point((tImage.width / 2) - (tFishPreview.width / 2), (tImage.height / 2) - (tFishPreview.height / 2))
      if tFishProps[#unlocked] then
        tImage.copyPixels(tFishPreview, rect(tloc.locH, tloc.locV, tloc.locH + tFishPreview.width, tloc.locV + tFishPreview.height), tFishPreview.rect, [#ink: 36])
      else
        tMatte = tFishPreview.createMatte()
        tShadow = member(getmemnum("fishpedia_gray")).image
        tImage.copyPixels(tShadow, rect(tloc.locH, tloc.locV, tloc.locH + tFishPreview.width, tloc.locV + tFishPreview.height), tFishPreview.rect, [#ink: 36, #maskImage: tMatte])
      end if
    end if
  end if
  return tImage
end

on renderPageBackground me, tPageIndex, tIsLeftPage, tPageTitle
  tImage = image(236, 299, 32)
  tStartLocH = 33
  tPageBackground = member(getmemnum("fishpedia_page")).image
  if not tIsLeftPage then
    tPageBackground = me.flipImage(tPageBackground)
    tStartLocH = 43
  end if
  tImage.copyPixels(tPageBackground, tPageBackground.rect, tPageBackground.rect)
  if stringp(tPageTitle) then
    tTitleImg = pWriterPlain.render(tPageTitle)
    tBoxRect = rect(tStartLocH, 9, tStartLocH + tTitleImg.width + 9, 22)
    tImage.fill(tBoxRect, color(230, 230, 230))
    tImage.copyPixels(tTitleImg, rect(tStartLocH + 5, 11, tStartLocH + 5 + tTitleImg.width, 11 + tTitleImg.height), tTitleImg.rect, [#color: color(101, 157, 171)])
    tImage.draw(tBoxRect, [#shapeType: #rect, #lineSize: 1, #color: color(101, 157, 171)])
  end if
  if integerp(tPageIndex) then
    tTotalIndexCount = pFishes.count + me.getOverviewPageCount()
    tTextImg = pWriterPlain.render(getText("fishpedia_page_text", "Page") && tPageIndex & "/" & tTotalIndexCount)
    tLocH = tStartLocH + 79 - (tTextImg.width / 2) + 3
    tImage.copyPixels(tTextImg, rect(tLocH, 286, tLocH + tTextImg.width, 286 + tTextImg.height), tTextImg.rect, [#color: color(101, 157, 171)])
    if tIsLeftPage then
      if tPageIndex > 1 then
        tArrowImg = member(getmemnum("fishpedia_arrow")).image
        tImage.copyPixels(tArrowImg, rect(11, 288, tArrowImg.width + 11, tArrowImg.height + 288), tArrowImg.rect, [#ink: 36])
      end if
    else
      if tPageIndex <> tTotalIndexCount then
        tArrowImg = me.flipImage(member(getmemnum("fishpedia_arrow")).image)
        tImage.copyPixels(tArrowImg, rect(205, 288, tArrowImg.width + 205, tArrowImg.height + 288), tArrowImg.rect, [#ink: 36])
      end if
    end if
  end if
  return tImage
end

on renderFishTimeline me, tTimeRanges
  tImage = image(159, 36, 32)
  tBackground = member(getmemnum("fishpedia_timeline_bg")).image
  tImage.copyPixels(tBackground, rect(3, 14, 3 + tBackground.width, 14 + tBackground.height), tBackground.rect)
  repeat with tTimeRange in tTimeRanges
    if tTimeRange[1] > tTimeRange[2] then
      me.drawFishTimelineBar(tImage, tTimeRange[1], 24)
      me.drawFishTimelineBar(tImage, 0, tTimeRange[2])
      next repeat
    end if
    me.drawFishTimelineBar(tImage, tTimeRange[1], tTimeRange[2])
  end repeat
  return tImage
end

on drawFishTimelineBar me, tImage, tstart, tEnd
  tStartH = 5 + (tstart * 6)
  tFinalH = 5 + (tEnd * 6) + (tEnd > 0)
  tImage.fill(rect(tStartH, 0, tFinalH, 12), color(101, 157, 171))
end

on renderFishActiveDays me, tActiveDays
  tImage = image(190, 28, 32)
  tBackground = member(getmemnum("fishpedia_days_grid_bg")).image
  tImage.copyPixels(tBackground, tBackground.rect, tBackground.rect)
  repeat with i = 1 to pWeekDaysList.count
    tTitle = pWeekDaysList[i]
    tImg = pWriterPlain.render(tTitle)
    tLocH = ((i - 1) * 27) + (13 - ((tImg.width - 5) / 2))
    tImage.copyPixels(tImg, rect(tLocH, -1, tLocH + tImg.width, tImg.height - 1), tImg.rect)
  end repeat
  tMarker = member(getmemnum("fishpedia_active_day_marker")).image
  repeat with tDayIndex in tActiveDays
    tLocH = 8 + (tDayIndex * 27)
    tImage.copyPixels(tMarker, rect(tLocH, 12, tLocH + tMarker.width, tMarker.height + 12), tMarker.rect)
  end repeat
  return tImage
end

on renderFishRarity me, tRarity
  tImage = image(64, 9, 32)
  tImages = [member(getmemnum("fishpedia_star_empty")).image, member(getmemnum("fishpedia_star_filled")).image]
  repeat with i = 0 to 4
    tLocH = i * 13
    tStarImg = tImages[(i < tRarity) + 1]
    tImage.copyPixels(tStarImg, rect(tLocH, 0, tStarImg.width + tLocH, tStarImg.height), tStarImg.rect)
  end repeat
  return tImage
end

on renderInfoField me, tName, tValue, tIcon
  tTitleImg = pWriterBold.render(tName)
  tValueImg = pWriterPlain.render(tValue)
  tWidth = tTitleImg.width + tValueImg.width + 8
  if not voidp(tIcon) then
    tNum = getmemnum("fishpedia_" & tIcon & "_icon")
    if tNum <> 0 then
      tmember = member(tNum)
      if tmember.type = #bitmap then
        tIconImg = tmember.image
        tWidth = tWidth + tIconImg.width + 5
      end if
    end if
  end if
  tImage = image(tWidth, 13, 32)
  tPieceImg = member(getmemnum("fishpedia_info_field_a_l")).image
  tImage.copyPixels(tPieceImg, tPieceImg.rect, tPieceImg.rect, [#ink: 36])
  tPieceImg = member(getmemnum("fishpedia_info_field_a_m")).image
  tImage.copyPixels(tPieceImg, rect(3, 0, tTitleImg.width + 3, tPieceImg.height), tPieceImg.rect, [#ink: 36])
  tPieceImg = member(getmemnum("fishpedia_info_field_a_r")).image
  tImage.copyPixels(tPieceImg, rect(tTitleImg.width + 3, 0, tTitleImg.width + tPieceImg.width + 3, tPieceImg.height), tPieceImg.rect, [#ink: 36])
  tImage.copyPixels(tTitleImg, rect(5, 2, tTitleImg.width + 5, tTitleImg.height + 2), tTitleImg.rect, [#ink: 36])
  tLocH = tTitleImg.width + tPieceImg.width + 3
  tPieceImg = member(getmemnum("fishpedia_info_field_b_m")).image
  tImage.copyPixels(tPieceImg, rect(tLocH, 0, tWidth - 3, tPieceImg.height), tPieceImg.rect, [#ink: 36])
  tPieceImg = member(getmemnum("fishpedia_info_field_b_r")).image
  tImage.copyPixels(tPieceImg, rect(tWidth - 3, 0, tWidth - 3 + tPieceImg.width, tPieceImg.height), tPieceImg.rect, [#ink: 36])
  tImage.copyPixels(tValueImg, rect(tLocH + 2, 2, tLocH + tValueImg.width + 2, tValueImg.height + 2), tValueImg.rect, [#ink: 36])
  if not voidp(tIconImg) then
    tLocH = tLocH + tValueImg.width + 2
    tImage.copyPixels(tIconImg, rect(tLocH, 3, tLocH + tIconImg.width, tIconImg.height + 3), tIconImg.rect, [#ink: 36])
  end if
  return tImage
end

on renderHitbox me
  tImage = image(528, 409, 1)
  tColor = color(0, 0, 0)
  tImage.fill(rect(8, 331, 66, 354), tColor)
  tImage.fill(rect(421, 331, 479, 354), tColor)
  if pSpreadIndex > 0 then
    tOverviewPageCount = me.getOverviewPageCount()
    tSlotImg = member(getmemnum("fishpedia_slot_shadow")).image
    tLeftPageIndex = me.getLeftPageIndex(pSpreadIndex)
    repeat with i = 0 to 1
      tPageIndex = tLeftPageIndex + i
      tStartLocH = 28 + (245 * i)
      if (tPageIndex <= tOverviewPageCount) and (tPageIndex > 0) then
        tFishes = me.getOverviewPageFishes(tPageIndex)
        tFishesCount = tFishes.count - 1
        repeat with f = 0 to tFishesCount
          tLocH = tStartLocH + (f mod 2 * 96)
          tLocV = 94 + (62 * (f / 2))
          tImage.copyPixels(tSlotImg, rect(tLocH, tLocV, tLocH + tSlotImg.width, tLocV + tSlotImg.height), tSlotImg.rect)
        end repeat
      end if
    end repeat
    if pBookmarkSpreadIndex > -1 then
      tBookmarkImg = member(getmemnum("fishpedia_bookmark_shadow")).image
      tImage.copyPixels(tBookmarkImg, rect(195, 27, 195 + tBookmarkImg.width, 27 + tBookmarkImg.height), tBookmarkImg.rect)
    end if
    tImage.fill(rect(464, 57, 478, 70), tColor)
  end if
  return tImage
end

on addCoverToPage me, tPageImg
  tImage = image(244, 309, 32)
  tBackground = member(getmemnum("fishpedia_background")).image
  tImage.copyPixels(tBackground, tImage.rect, tImage.rect)
  tImage.copyPixels(tPageImg, rect(8, 5, tPageImg.width + 8, tPageImg.height + 5), tPageImg.rect)
  return tImage
end

on flipImage me, tImg_a
  tImg_b = image(tImg_a.width, tImg_a.height, tImg_a.depth)
  tQuad = [point(tImg_a.width, 0), point(0, 0), point(0, tImg_a.height), point(tImg_a.width, tImg_a.height)]
  tImg_b.copyPixels(tImg_a, tQuad, tImg_a.rect)
  return tImg_b
end
