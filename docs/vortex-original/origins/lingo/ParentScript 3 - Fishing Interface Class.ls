property pWndID, pFishingWndID, pProductOrderInfoID, pFishing, pCurrTime, pSecondsLeftText, pLastSeconds, pCurrActNum, pCycleTime, pArrowSpr, pBarSpr, pCurrBal, pPlayer, pKeys, pWriterPlainLeft, pWriterBoldLeft, pWriterDerbyCount, pStatsDrawOrder, pSubMenu, pDerbyStorePage, pStoreProps, pStoreItemsImage, pStorePage, pStoreBuyingItemProp, pFishBalanceImg, pFishStatsImg, pFishLevelImg, pFishingRodProgressImg, pFishingLevelProgressImg, pDerbyRegistrationTimerID, pDerbyStandardTimerID, pDerbyFrenzyTimerID, pDerbyHudTimerID, pDerbyStandardPollID, pDerbyFrenzyPollID, pDerbyInitialStateRequestID, pDerbyLeaderboardPage, pDerbyLeaderboardMode

on construct me
  pFishing = 0
  pWndID = getText("fishing_minigame_window", "Fishing")
  pCurrTime = 0
  pCurrActNum = 0
  pCycleTime = getIntVariable("fishing.cycle.time", 100)
  pSecondsLeftText = getText("fishing_seconds_left", "Seconds Left")
  pCurrBal = 0
  pLastSeconds = -1
  pPlayer = [#balance: 0, #bar: 0, #seconds: 35]
  pArrowSpr = VOID
  pBarSpr = VOID
  pKeys = getVariableValue("fishing.key.list", ["Q", "E"])
  pFishingWndID = getText("fishing_store_window", "Fishing Store")
  pProductOrderInfoID = "fishing_product_orderinfo"
  createWriter("fishing_store_plain_left", getStructVariable("struct.font.plain"))
  pWriterPlainLeft = getWriter("fishing_store_plain_left")
  createWriter("fishing_store_bold_left", getStructVariable("struct.font.bold"))
  pWriterBoldLeft = getWriter("fishing_store_bold_left")
  createWriter("fishing_derby_count", getStructVariable("struct.font.bold"))
  pWriterDerbyCount = getWriter("fishing_derby_count")
  pWriterDerbyCount.define([#fontSize: 12, #wordWrap: 0, #color: rgb("#F1B201")])
  pStatsDrawOrder = [["fishing_level_txt", #currentLevel], ["fishes_caught", #fishesCaught], ["golden_fishes_caught", #gFishesCaught], ["derby_wins", #derbyWins], ["derby_heaviest_fish", #heaviestFishWeight], ["derby_best_standard", #bestStandardScore], ["derby_best_frenzy", #bestFrenzyScore]]
  pSubMenu = "-"
  pDerbyStorePage = EMPTY
  pStoreProps = []
  pStoreItemsImage = VOID
  pStorePage = -1
  pStoreBuyingItemProp = VOID
  pFishBalanceImg = VOID
  pFishStatsImg = VOID
  pFishLevelImg = VOID
  pFishingRodProgressImg = VOID
  pFishingLevelProgressImg = VOID
  pDerbyRegistrationTimerID = #fishing_derby_registration_timer
  pDerbyStandardTimerID = #fishing_derby_standard_timer
  pDerbyFrenzyTimerID = #fishing_derby_frenzy_timer
  pDerbyHudTimerID = #fishing_derby_hud_timer
  pDerbyStandardPollID = #fishing_derby_standard_poll
  pDerbyFrenzyPollID = #fishing_derby_frenzy_poll
  pDerbyInitialStateRequestID = #fishing_derby_initial_state_request
  pDerbyLeaderboardPage = 0
  pDerbyLeaderboardMode = "standard"
  registerMessage(#leaveRoom, me.getID(), #closeAllWindows)
  registerMessage(#changeRoom, me.getID(), #closeAllWindows)
  createTimeout(pDerbyInitialStateRequestID, 1000, #requestInitialDerbyState, me.getID(), VOID, 1)
end

on deconstruct me
  pFishing = 0
  pArrowSpr = VOID
  pBarSpr = VOID
  if windowExists(pWndID) then
    removeWindow(pWndID)
  end if
  removeUpdate(me.getID())
  removeWriter(pWriterPlainLeft.getID())
  pWriterPlainLeft = VOID
  removeWriter(pWriterBoldLeft.getID())
  pWriterBoldLeft = VOID
  removeWriter(pWriterDerbyCount.getID())
  pWriterDerbyCount = VOID
  if objectExists("fishingStore_previewObj") then
    removeObject("fishingStore_previewObj")
  end if
  me.closeAllWindows()
  me.stopDerbyTimers()
  if timeoutExists(pDerbyInitialStateRequestID) then
    removeTimeout(pDerbyInitialStateRequestID)
  end if
  unregisterMessage(#leaveRoom, me.getID())
  unregisterMessage(#changeRoom, me.getID())
end

on requestInitialDerbyState me
  if connectionExists(getVariable("connection.room.id")) then
    getConnection(getVariable("connection.room.id")).send("GET_DERBY_REGISTRATION_STATE")
  end if
end

on startFishing me, tFishID
  pFishing = 1
  pCurrBal = 0
  me.openFishingWindow(tFishID)
  pCurrActNum = 0
  pCurrTime = getMonotonicMillis()
  the keyboardFocusSprite = 0
  receiveUpdate(me.getID())
  startTimer()
end

on stopFishing me
  pFishing = 0
  pArrowSpr = VOID
  pBarSpr = VOID
  removeUpdate(me.getID())
  the keyboardFocusSprite = -1
  if windowExists(pWndID) then
    removeWindow(pWndID)
  end if
end

on updatePlayer me, tProps
  pPlayer = tProps
end

on update me
  if pFishing then
    the keyboardFocusSprite = 0
    tTime = getMonotonicMillis() - pCurrTime
    tKey = the key
    if the lastKey < the timer then
      if tKey = SPACE then
        tKey = "SPACE"
      end if
      tKeyNr = 0
      repeat with i = 1 to pKeys.count
        if pKeys[i] = tKey then
          tKeyNr = i
          exit repeat
        end if
      end repeat
      if tKeyNr > 0 then
        if tKeyNr <> pCurrActNum then
          pCurrActNum = tKeyNr
          me.sendAction()
          me.resetDialog()
          me.selectKey(pCurrActNum)
          pCurrActNum = 0
        end if
      end if
      startTimer()
    end if
    if tTime >= pCycleTime then
      pCurrTime = getMonotonicMillis()
    end if
    tBalance = pPlayer[#balance]
    tBalOff = tBalance - pCurrBal
    pCurrBal = pCurrBal + (tBalOff / 4.0)
    pArrowSpr.rotation = pCurrBal
    pBarSpr.width = pPlayer[#bar]
    if pLastSeconds <> pPlayer[#seconds] then
      pLastSeconds = pPlayer[#seconds]
      me.updateSeconds()
    end if
  end if
end

on sendAction me
  if pFishing then
    if pCurrActNum = 1 then
      tKey = "L"
    else
      tKey = "R"
    end if
    getThread(#room).getComponent().getRoomConnection().send("FHM", [#string: string(tKey)])
  end if
end

on openFishingWindow me, tFishID
  if windowExists(pWndID) then
    return 0
  end if
  createWindow(pWndID, "fishingUI.window", 10, 10, #modal)
  tWndObj = getWindow(pWndID)
  tWndObj.registerClient(me.getID())
  tWndObj.registerProcedure(#eventProcFishing, me.getID(), #mouseUp)
  tWndObj.moveTo(12, 246)
  if windowExists(#modal) then
    getWindow(#modal).getElement("modal").setProperty(#blend, 0)
  else
    error(me, "Where's the modal window?", #prepare)
  end if
  pArrowSpr = tWndObj.getElement("needle").getProperty(#sprite)
  pArrowSpr.member.regPoint = point(pArrowSpr.member.width / 2, pArrowSpr.member.height - 3)
  tBallSpr = tWndObj.getElement("needle_ball").getProperty(#sprite)
  tBallSpr.member.regPoint = point(tBallSpr.member.width / 2, tBallSpr.member.height / 2)
  pBarSpr = tWndObj.getElement("fishing_bar").getProperty(#sprite)
  if voidp(tFishID) then
    tFishID = 0
  end if
  tElem = tWndObj.getElement("fish_preview")
  if tElem <> 0 then
    if memberExists("fish_preview_" & tFishID) then
      tMem = member(getmemnum("fish_preview_" & tFishID))
      if tMem.type = #bitmap then
        tElem.feedImage(tMem.image)
      end if
    end if
  end if
  me.localizeKeys()
  me.resetDialog()
  me.updateSeconds()
end

on updateSeconds me
  tWndObj = getWindow(pWndID)
  if tWndObj <> 0 then
    tWndObj.getElement("fishing_seconds").setText(pPlayer[#seconds])
  end if
end

on localizeKeys me
  tWndObj = getWindow(pWndID)
  if tWndObj <> 0 then
    repeat with i = 1 to pKeys.count
      tWndObj.getElement("fishing_btext_" & i).setText(pKeys[i])
    end repeat
  end if
end

on resetDialog me
  tWndObj = getWindow(pWndID)
  if tWndObj <> 0 then
    repeat with i = 1 to pKeys.count
      tmember = member(getmemnum("fishingUI_button_inactive"))
      if tmember.number > 0 then
        tWndObj.getElement("fishing_image_" & i).getProperty(#sprite).member = tmember
      end if
    end repeat
  end if
end

on selectKey me, tIndex
  tWndObj = getWindow(pWndID)
  if tWndObj <> 0 then
    tmember = member(getmemnum("fishingUI_button_active"))
    if tmember.number > 0 then
      tWndObj.getElement("fishing_image_" & tIndex).getProperty(#sprite).member = tmember
    end if
  end if
end

on eventProcFishing me, tEvent, tSprID, tParam
  if tSprID contains "button" then
    tActionNum = integer(tSprID.char[tSprID.length])
    if (tActionNum > 0) and (tActionNum <= pKeys.count) then
      if pCurrActNum <> tActionNum then
        pCurrActNum = tActionNum
        me.sendAction()
        me.resetDialog()
        me.selectKey(pCurrActNum)
        pCurrActNum = 0
      end if
    end if
  end if
end

on test me
  tHeight = 0
  tObj = [#id: string("1000"), #class: "fish_area", #x: 22, #y: 18, #direction: [0, 0, 0], #dimensions: [1, 1], #altitude: tHeight, #colors: "0,0,0", #props: [#runtimedata: EMPTY, #extra: 0, #stuffdata: EMPTY]]
  getThread(#room).getComponent().validateActiveObjects(tObj)
  tHeight = 0
  tObj = [#id: string("1001"), #class: "fish_area", #x: 22, #y: 26, #direction: [0, 0, 0], #dimensions: [1, 1], #altitude: tHeight, #colors: "0,0,0", #props: [#runtimedata: EMPTY, #extra: 0, #stuffdata: EMPTY]]
  getThread(#room).getComponent().validateActiveObjects(tObj)
  tHeight = 0
  tObj = [#id: string("1002"), #class: "fish_area", #x: 23, #y: 17, #direction: [0, 0, 0], #dimensions: [1, 1], #altitude: tHeight, #colors: "0,0,0", #props: [#runtimedata: EMPTY, #extra: 0, #stuffdata: EMPTY]]
  getThread(#room).getComponent().validateActiveObjects(tObj)
  tHeight = 0
  tObj = [#id: string("1003"), #class: "fish_area", #x: 23, #y: 16, #direction: [0, 0, 0], #dimensions: [1, 1], #altitude: tHeight, #colors: "0,0,0", #props: [#runtimedata: EMPTY, #extra: 0, #stuffdata: EMPTY]]
  getThread(#room).getComponent().validateActiveObjects(tObj)
end

on openFishingStore me
  if not windowExists(pFishingWndID) then
    createWindow(pFishingWndID, "habbo_basic.window", 5, 345)
    tWndObj = getWindow(pFishingWndID)
    if tWndObj <> 0 then
      tWndObj.merge("fishing_store_a.window")
      pSubMenu = "a"
      tWndObj.center()
      tWndObj.registerClient(me.getID())
      tWndObj.registerProcedure(#eventProcFishingStore, me.getID(), #mouseUp)
      tWndObj.registerProcedure(#eventProcFishingStoreRollover, me.getID(), #mouseEnter)
      tWndObj.registerProcedure(#eventProcFishingStoreRollover, me.getID(), #mouseLeave)
      me.getFishingData()
    end if
  end if
end

on changeTab me, tPage
  if pSubMenu = tPage then
    return 
  end if
  pSubMenu = tPage
  tWndObj = getWindow(pFishingWndID)
  if tWndObj <> 0 then
    tWndObj.unmerge()
    tWndObj.merge("fishing_store_" & tPage & ".window")
    case tPage of
      "a":
      "b":
        me.refreshCatalogue()
      "c":
        me.refreshStatsPage()
    end case
    me.refreshFishBalancePages()
  end if
end

on eventProcFishingStore me, tEvent, tSprID, tParam
  case tSprID of
    "fishing_store_tab_info":
      me.changeTab("a")
    "fishing_store_tab_store":
      me.changeTab("b")
    "fishing_store_tab_stats":
      me.changeTab("c")
    "bp_item_fishopedia_icon":
      me.getComponent().getFishPediaManager().openFishPedia()
    "store":
      tIndex = integer(tParam.locH / 39) + (3 * integer(tParam.locV / 39))
      tPropIndex = (pStorePage * 15) + tIndex + 1
      if (tPropIndex > 0) and (tPropIndex <= pStoreProps.count) then
        me.showPreviewImage(pStoreProps[tPropIndex])
        me.renderCatalogueHiliter(tIndex)
      end if
    "close":
      me.closeFishingWindow()
    "fishing_prev":
      me.openCataloguePage(pStorePage - 1)
    "fishing_next":
      me.openCataloguePage(pStorePage + 1)
    "fishing_buy_button":
      if ilk(pStoreBuyingItemProp) = #propList then
        tErrCode = me.getComponent().checkBalance(pStoreBuyingItemProp["currency"], pStoreBuyingItemProp["price"])
        me.openBuyProductOrderInfo(tErrCode)
      end if
    "upgrade_rod_btn":
      tLevelData = me.getComponent().getFishingRodLevelData()
      if ilk(tLevelData) = #propList then
        if tLevelData[#upgradable] and not voidp(tLevelData[#upgrade]) then
          tUpgrade = tLevelData[#upgrade]
          pStoreBuyingItemProp = ["purchaseCode": "fishing_rod_upgrade", "currency": tUpgrade[#currency], "price": tUpgrade[#price], "image": "upgrade_rod_preview"]
          tErrCode = me.getComponent().checkBalance(tUpgrade[#currency], tUpgrade[#price])
          me.openBuyProductOrderInfo(tErrCode)
        end if
      end if
  end case
end

on eventProcFishingStoreRollover me, tEvent, tSprID, tParam
  if tEvent = #mouseLeave then
    executeMessage(#setRollOverInfo, EMPTY)
    return 1
  end if
  case tSprID of
    "achieve_icon_1":
      executeMessage(#setRollOverInfo, getText("fishing_achievement_fsh", "Finding the Holy Carp Badge"))
    "achieve_icon_2":
      executeMessage(#setRollOverInfo, getText("fishing_achievement_fsh99", "Achieving level 99 in fishing"))
    "achieve_icon_3":
      executeMessage(#setRollOverInfo, getText("fishing_achievement_fsh150", "Achieving 150 million XP in fishing"))
    "fish_buff_icon_1":
      executeMessage(#setRollOverInfo, getText("fishing_buff_sb2", "Fishing boost"))
    "fish_buff_icon_2":
      executeMessage(#setRollOverInfo, getText("fishing_buff_anniversary", "Anniversary fishing XP boost"))
  end case
  return 1
end

on eventProcDerbyStore me, tEvent, tSprID, tParam
  if tEvent <> #mouseUp then
    return 0
  end if
  case tSprID of
    "close":
      me.closeDerbyStore()
    "derby_store_tab_info":
      me.openDerbyInfo()
    "derby_store_tab_reg":
      me.openDerbyRegister()
    "std_register_button":
      me.sendDerbyRegistration("standard")
    "fzy_register_button":
      me.sendDerbyRegistration("frenzy")
  end case
  return 1
end

on eventProcStandardDerby me, tEvent, tSprID, tParam
  if tEvent <> #mouseUp then
    return 0
  end if
  case tSprID of
    "derby.button.close.up":
      me.closeStandardDerby()
  end case
end

on eventProcFrenzyDerby me, tEvent, tSprID, tParam
  if tEvent <> #mouseUp then
    return 0
  end if
  case tSprID of
    "derby.button.close.up":
      me.closeFrenzyDerby()
  end case
  return 1
end

on eventProcDerbyLeaderboard me, tEvent, tSprID, tParam
  if tEvent <> #mouseUp then
    return 0
  end if
  case tSprID of
    "derby_leader_close":
      me.closeDerbyLeaderboard()
    "derby_std_arrow_pageBack", "derby_fzy_arrow_pageBack":
      pDerbyLeaderboardPage = max(0, pDerbyLeaderboardPage - 1)
      me.requestDerbyLeaderboard()
    "derby_std_arrow_pageFwd", "derby_fzy_arrow_pageFwd":
      tTotalPages = me.getPropValue(me.getComponent().getDerbyLeaderboard(), #totalPages, 1)
      if pDerbyLeaderboardPage < (tTotalPages - 1) then
        pDerbyLeaderboardPage = pDerbyLeaderboardPage + 1
        me.requestDerbyLeaderboard()
      end if
  end case
end

on eventProcOrderInfoWindow me, tEvent, tSprID, tParam
  case tSprID of
    "close":
      me.closeOrderInfoWindow()
    "order_ok":
      if ilk(pStoreBuyingItemProp) = #propList then
        if not voidp(pStoreBuyingItemProp["purchaseCode"]) then
          tCode = pStoreBuyingItemProp["purchaseCode"]
          getConnection(getVariable("connection.info.id")).send("PURCHASE_FISHING_PRODUCT", [#string: string(tCode)])
        end if
      end if
      me.closeOrderInfoWindow()
    "nobalance_ok", "order_cancel":
      me.closeOrderInfoWindow()
  end case
end

on getFishingData me
  if connectionExists(getVariable("connection.info.id")) then
    tConnection = getConnection(getVariable("connection.info.id"))
    if not getObject(#session).exists("user_fishbalance") then
      tConnection.send("GET_FISH_TOKENS")
    end if
    if pStoreProps.count = 0 then
      tConnection.send("GET_FISHING_PRODUCTS")
    end if
    tConnection.send("GET_FISHING_STATS")
    tConnection.send("GET_FISHING_ROD_LEVEL")
  end if
end

on closeAllWindows me
  me.closeFishingWindow()
  me.closeOrderInfoWindow()
  me.closeDerbyUi()
  me.stopFishing()
end

on closeOrderInfoWindow me
  if windowExists(pProductOrderInfoID) then
    removeWindow(pProductOrderInfoID)
  end if
end

on closeFishingWindow me
  if windowExists(pFishingWndID) then
    removeWindow(pFishingWndID)
  end if
end

on handleDerbyLifecycle me, tLifecycle
  tstate = me.getPropValue(tLifecycle, #state, "ended")
  if tstate = "active" then
    me.openDerbyHud()
    me.refreshDerbyHud()
  else
    me.closeDerbyUi()
  end if
end

on openDerbyHud me
  if not windowExists("derby_ui") then
    if not createWindow("derby_ui", "derby_ui.window") then
      return error(me, "Fishing Derby HUD window not created!", #openDerbyHud, #major)
    end if
    tWndObj = getWindow("derby_ui")
    if tWndObj <> 0 then
      tWndObj.registerClient(me.getID())
      tWndObj.registerProcedure(#eventProcDerbyHud, me.getID(), #mouseUp)
      tWndObj.moveTo(integer(((the stage).rect.width - tWndObj.getProperty(#width)) / 2), 8)
      tWndObj.setProperty(#locZ, 22000000)
    end if
  end if
  me.startDerbyHudTimer()
end

on closeDerbyUi me
  if windowExists("derby_ui") then
    removeWindow("derby_ui")
  end if
  me.closeDerbyStore()
  me.closeStandardDerby()
  me.closeFrenzyDerby()
  me.closeDerbyLeaderboard()
  me.stopDerbyTimers()
end

on eventProcDerbyHud me, tEvent, tSprID, tParam
  if tEvent <> #mouseUp then
    return 0
  end if
  tMode = me.getDerbyMode()
  case tSprID of
    "derby_ui_basket":
      me.toggleDerbyDetail(tMode)
    "derby_ui_leader":
      me.toggleDerbyLeaderboard(tMode)
  end case
end

on toggleDerbyDetail me, tMode
  if tMode = "frenzy" then
    if windowExists("derby_frenzy") then
      me.closeFrenzyDerby()
    else
      me.closeStandardDerby()
      me.openFrenzyDerby()
    end if
  else
    if windowExists("derby_standard") then
      me.closeStandardDerby()
    else
      me.closeFrenzyDerby()
      me.openStandardDerby()
    end if
  end if
end

on toggleDerbyLeaderboard me, tMode
  tWindowID = me.getDerbyLeaderboardWindowID(tMode)
  if windowExists(tWindowID) then
    me.closeDerbyLeaderboard()
    return 1
  end if
  me.closeDerbyLeaderboard()
  me.openDerbyLeaderboard(tMode)
end

on refreshDerbyHud me
  tWndObj = getWindow("derby_ui")
  if tWndObj = 0 then
    return 0
  end if
  tSeconds = me.getDerbySecondsLeft(me.getComponent().getDerbyLifecycleEndTime())
  me.setWindowText(tWndObj, "derby_timer", me.formatDerbyTime(tSeconds))
end

on startDerbyHudTimer me
  if timeoutExists(pDerbyHudTimerID) then
    removeTimeout(pDerbyHudTimerID)
  end if
  if windowExists("derby_ui") then
    createTimeout(pDerbyHudTimerID, 1000, #tickDerbyHudTimer, me.getID(), VOID, 1)
  end if
end

on tickDerbyHudTimer me
  me.refreshDerbyHud()
  me.startDerbyHudTimer()
end

on getDerbyMode me
  tLifecycle = me.getComponent().getDerbyLifecycle()
  tMode = me.getPropValue(tLifecycle, #registeredMode, "standard")
  if (tMode <> "standard") and (tMode <> "frenzy") then
    return "standard"
  end if
  return tMode
end

on openDerbyInfo me
  return me.openDerbyStore("a")
end

on openDerbyRegister me
  return me.openDerbyStore("b")
end

on openDerbyStore me, tPage
  if (tPage <> "a") and (tPage <> "b") then
    return 0
  end if
  tIsNewWindow = not windowExists("derby_store_a")
  if tIsNewWindow then
    if not createWindow("derby_store_a", "habbo_basic.window", VOID, VOID, #modal) then
      return error(me, "Fishing Derby window not created!", #openDerbyStore, #major)
    end if
  end if
  tWndObj = getWindow("derby_store_a")
  if tWndObj = 0 then
    return error(me, "Fishing Derby window unavailable!", #openDerbyStore, #major)
  end if
  if tIsNewWindow or (pDerbyStorePage <> tPage) then
    if not tIsNewWindow then
      tWndObj.unmerge()
    end if
    if not tWndObj.merge("derby_store_" & tPage & ".window") then
      removeWindow("derby_store_a")
      pDerbyStorePage = EMPTY
      return error(me, "Fishing Derby window not merged!", #openDerbyStore, #major)
    end if
    pDerbyStorePage = tPage
  end if
  if tIsNewWindow then
    tWndObj.registerClient(me.getID())
    tWndObj.registerProcedure(#eventProcDerbyStore, me.getID(), #mouseUp)
    tWndObj.center()
  end if
  if tPage = "b" then
    me.requestDerbyRegistration()
    me.refreshDerbyRegistration()
  else
    if timeoutExists(pDerbyRegistrationTimerID) then
      removeTimeout(pDerbyRegistrationTimerID)
    end if
  end if
  return 1
end

on requestDerbyRegistration me
  if connectionExists(getVariable("connection.room.id")) then
    getConnection(getVariable("connection.room.id")).send("GET_DERBY_REGISTRATION_STATE")
    return 1
  end if
  executeMessage(#alert, [#Msg: getText("derby_registration_unavailable", "Fishing Derby registration is unavailable right now.")])
  return 0
end

on sendDerbyRegistration me, tMode
  tRegistration = me.getComponent().getDerbyRegistration()
  if me.getPropValue(tRegistration, #registeredMode, EMPTY) <> EMPTY then
    return 0
  end if
  if (tMode = "standard") and not me.getPropValue(tRegistration, #canRegisterStandard, 0) then
    return 0
  end if
  if (tMode = "frenzy") and not me.getPropValue(tRegistration, #canRegisterFrenzy, 0) then
    return 0
  end if
  if not connectionExists(getVariable("connection.room.id")) then
    executeMessage(#alert, [#Msg: getText("derby_registration_unavailable", "Fishing Derby registration is unavailable right now.")])
    return 0
  end if
  me.setDerbyRegistrationButtonsEnabled(0, 0)
  getConnection(getVariable("connection.room.id")).send("ATTEMPT_TO_REGISTER_FOR_DERBY", [#string: tMode])
  return 1
end

on showDerbyRegistrationResult me, tSuccess, tMessage
  if tSuccess then
    return 1
  end if
  tTextKey = "derby_registration_failed"
  if tMessage = "closed" then
    tTextKey = "derby_registration_closed"
  else
    if tMessage = "already_registered" then
      tTextKey = "derby_registration_already_registered"
    end if
  end if
  executeMessage(#alert, [#Msg: getText(tTextKey, getText("derby_registration_failed", "Fishing Derby registration could not be completed."))])
  return 1
end

on closeDerbyRegister me
  return me.closeDerbyStore()
end

on closeDerbyStore me
  if windowExists("derby_store_a") then
    removeWindow("derby_store_a")
  end if
  pDerbyStorePage = EMPTY
  if timeoutExists(pDerbyRegistrationTimerID) then
    removeTimeout(pDerbyRegistrationTimerID)
  end if
  return 1
end

on openStandardDerby me
  if not windowExists("derby_standard") then
    if not createWindow("derby_standard", "derby_standard.window") then
      return error(me, "Standard Fishing Derby window not created!", #openStandardDerby, #major)
    end if
    tWndObj = getWindow("derby_standard")
    if tWndObj <> 0 then
      tWndObj.registerClient(me.getID())
      tWndObj.registerProcedure(#eventProcStandardDerby, me.getID(), #mouseUp)
      tWndObj.center()
    end if
  end if
  if connectionExists(getVariable("connection.room.id")) then
    getConnection(getVariable("connection.room.id")).send("GET_STANDARD_DERBY_STATE")
  end if
  me.refreshStandardDerby()
  me.startStandardDerbyPoll()
end

on closeStandardDerby me
  if windowExists("derby_standard") then
    removeWindow("derby_standard")
  end if
  if timeoutExists(pDerbyStandardTimerID) then
    removeTimeout(pDerbyStandardTimerID)
  end if
  if timeoutExists(pDerbyStandardPollID) then
    removeTimeout(pDerbyStandardPollID)
  end if
end

on openFrenzyDerby me
  if not windowExists("derby_frenzy") then
    if not createWindow("derby_frenzy", "derby_frenzy.window") then
      return error(me, "Frenzy Fishing Derby window not created!", #openFrenzyDerby, #major)
    end if
    tWndObj = getWindow("derby_frenzy")
    if tWndObj <> 0 then
      tWndObj.registerClient(me.getID())
      tWndObj.registerProcedure(#eventProcFrenzyDerby, me.getID(), #mouseUp)
      tWndObj.center()
    end if
  end if
  if connectionExists(getVariable("connection.room.id")) then
    getConnection(getVariable("connection.room.id")).send("GET_FRENZY_DERBY_STATE")
  end if
  me.refreshFrenzyDerby()
  me.startFrenzyDerbyPoll()
end

on closeFrenzyDerby me
  if windowExists("derby_frenzy") then
    removeWindow("derby_frenzy")
  end if
  if timeoutExists(pDerbyFrenzyTimerID) then
    removeTimeout(pDerbyFrenzyTimerID)
  end if
  if timeoutExists(pDerbyFrenzyPollID) then
    removeTimeout(pDerbyFrenzyPollID)
  end if
end

on openDerbyLeaderboard me, tMode
  if voidp(tMode) then
    tMode = "standard"
  end if
  pDerbyLeaderboardMode = tMode
  pDerbyLeaderboardPage = 0
  tWindowID = me.getDerbyLeaderboardWindowID(tMode)
  if not windowExists(tWindowID) then
    if not createWindow(tWindowID, tWindowID & ".window") then
      return error(me, "Fishing Derby leaderboard window not created!", #openDerbyLeaderboard, #major)
    end if
    tWndObj = getWindow(tWindowID)
    if tWndObj <> 0 then
      tWndObj.registerClient(me.getID())
      tWndObj.registerProcedure(#eventProcDerbyLeaderboard, me.getID(), #mouseUp)
      tWndObj.center()
    end if
  end if
  me.requestDerbyLeaderboard()
end

on closeDerbyLeaderboard me
  repeat with tWindowID in ["derby_leader_a", "derby_leader_b"]
    if windowExists(tWindowID) then
      removeWindow(tWindowID)
    end if
  end repeat
end

on stopDerbyTimers me
  if timeoutExists(pDerbyRegistrationTimerID) then
    removeTimeout(pDerbyRegistrationTimerID)
  end if
  if timeoutExists(pDerbyStandardTimerID) then
    removeTimeout(pDerbyStandardTimerID)
  end if
  if timeoutExists(pDerbyFrenzyTimerID) then
    removeTimeout(pDerbyFrenzyTimerID)
  end if
  if timeoutExists(pDerbyHudTimerID) then
    removeTimeout(pDerbyHudTimerID)
  end if
  if timeoutExists(pDerbyStandardPollID) then
    removeTimeout(pDerbyStandardPollID)
  end if
  if timeoutExists(pDerbyFrenzyPollID) then
    removeTimeout(pDerbyFrenzyPollID)
  end if
end

on formatDerbyTime me, tSeconds
  if voidp(tSeconds) or (tSeconds < 0) then
    tSeconds = 0
  end if
  tMinutes = integer(tSeconds / 60)
  tRemain = tSeconds mod 60
  return tMinutes & "m " & tRemain & "s"
end

on getDerbySecondsLeft me, tEndTime
  if voidp(tEndTime) or (tEndTime <= 0) then
    return 0
  end if
  return max(0, integer(((tEndTime - getMonotonicMillis()) / 1000.0) + 0.5))
end

on getDerbyFishPreviewMember me, tFishCode
  tName = "fishpedia_" & tFishCode & "_preview"
  if memberExists(tName) then
    return member(getmemnum(tName))
  end if
  if memberExists("derby_empty_fish") then
    return member(getmemnum("derby_empty_fish"))
  end if
  return VOID
end

on openBuyProductOrderInfo me, tError
  if not windowExists(pProductOrderInfoID) then
    createWindow(pProductOrderInfoID, "habbo_simple.window", VOID, VOID, #modal)
    tWndObj = getWindow(pProductOrderInfoID)
    if tError = #none then
      tWndObj.merge("habbo_orderinfo_image.window")
    else
      tWndObj.merge("habbo_orderinfo_nobalance.window")
    end if
    tWndObj.center()
    tWndObj.registerClient(me.getID())
    tWndObj.registerProcedure(#eventProcOrderInfoWindow, me.getID(), #mouseUp)
    tWndObj.setProperty(#locZ, 22000000)
    tCurrencyProp = me.getComponent().getCurrencyData(pStoreBuyingItemProp["currency"])
    tPriceText = getText("costs", "Costs %p %c")
    tPriceText = replaceChunks(tPriceText, "%p", pStoreBuyingItemProp["price"])
    tPriceText = replaceChunks(tPriceText, "%c", tCurrencyProp[#name])
    if tError = #none then
      tImage = image(279, 86, 32)
      if voidp(pStoreBuyingItemProp["image"]) then
        tStoreObj = getWindow(pFishingWndID)
        if tStoreObj <> 0 then
          tElem = tStoreObj.getElement("fishing_furni_preview")
          if tElem <> 0 then
            tImg = tElem.getProperty(#image).duplicate().trimWhiteSpace()
            tCenterH = 139 - (tImg.width / 2)
            tCenterV = 43 - (tImg.height / 2)
            tImage.copyPixels(tImg, rect(tCenterH, tCenterV, tImg.width + tCenterH, tImg.height + tCenterV), tImg.rect)
          end if
        end if
      else
        tMemName = pStoreBuyingItemProp["image"]
        if memberExists(tMemName) then
          tMem = member(getmemnum(tMemName))
          if tMem.type = #bitmap then
            tImg = tMem.image
            tCenterH = 139 - (tImg.width / 2)
            tCenterV = 43 - (tImg.height / 2)
            tImage.copyPixels(tImg, rect(tCenterH, tCenterV, tImg.width + tCenterH, tImg.height + tCenterV), tImg.rect)
          end if
        end if
      end if
      tElem = tWndObj.getElement("orderinfo_image")
      if tElem <> 0 then
        tElem.feedImage(tImage)
      end if
      tField = tWndObj.getElement("orderinfo_title")
      if tField <> 0 then
        tField.setText(tPriceText)
      end if
    else
      tField = tWndObj.getElement("orderinfo_title")
      if tField <> 0 then
        tField.setText(tPriceText)
      end if
      tField = tWndObj.getElement("orderinfo_desc")
      if tField <> 0 then
        if tError = #credits then
          tField.setText(getText("shopping_nocash"))
        else
          if tError = #fish then
            tField.setText(getText("fish_nocash"))
          else
            tField.setText(getText("stamps_nocash"))
          end if
        end if
      end if
    end if
  end if
end

on openCataloguePage me, tPage
  if listp(pStoreProps) then
    tPageAmount = (pStoreProps.count - 1) / 15
    if (tPage > -1) and (tPage <= tPageAmount) then
      pStorePage = tPage
      pStoreItemsImage = me.renderCatalogueItems()
      me.renderCatalogueHiliter(-1)
      me.showHideCatalogueButtons(tPageAmount > 0)
      me.updateCatalogueButtons(tPage, tPageAmount)
    end if
  end if
end

on renderCatalogueHiliter me, tSlotIndex
  tWndObj = getWindow(pFishingWndID)
  if tWndObj <> 0 then
    tElem = tWndObj.getElement("store")
    if tElem <> 0 then
      tImage = image(118, 196, 32)
      tstart = (pStorePage * 15) + 1
      tEnd = min(tstart + 15, pStoreProps.count)
      tIndex = 0
      repeat with i = tstart to tEnd
        tLocH = (tIndex mod 3 * 39) + 4
        tLocV = (39 * (tIndex / 3)) + 4
        if tSlotIndex = tIndex then
          tImg = member("fishing_store_hiliter").image
          tImage.copyPixels(tImg, rect(tLocH, tLocV, tImg.width + tLocH, tImg.height + tLocV), tImg.rect, [#ink: 36])
        else
          tImage.fill(tLocH, tLocV, 32 + tLocH, 32 + tLocV, color(203, 203, 203))
        end if
        tIndex = tIndex + 1
      end repeat
      tImage.copyPixels(pStoreItemsImage, pStoreItemsImage.rect, pStoreItemsImage.rect, [#ink: 36])
      tElem.feedImage(tImage)
    end if
  end if
end

on updateCatalogueButtons me, tCurrPage, tPageAmount
  tWndObj = getWindow(pFishingWndID)
  if tWndObj <> 0 then
    tElem = tWndObj.getElement("fishing_store_page_text")
    if tElem <> 0 then
      tElem.setText(getText("catalog_page", "page"))
    end if
    tElem = tWndObj.getElement("fishing_store_page_counter")
    if tElem <> 0 then
      tElem.setText(tCurrPage + 1 & "/" & tPageAmount + 1)
    end if
  end if
end

on showHideCatalogueButtons me, tVisible
  tWndObj = getWindow(pFishingWndID)
  if tWndObj <> 0 then
    repeat with tName in ["fishing_store_page_text", "fishing_store_page_counter", "fishing_prev", "fishing_next"]
      tElem = tWndObj.getElement(tName)
      if tElem <> 0 then
        tElem.setProperty(#visible, tVisible)
      end if
    end repeat
  end if
end

on showHideBuyFurniButton me, tVisible
  tWndObj = getWindow(pFishingWndID)
  if tWndObj <> 0 then
    repeat with tName in ["fishing_store_price_box_bg", "fishing_buy_button"]
      tElem = tWndObj.getElement(tName)
      if tElem <> 0 then
        tElem.setProperty(#visible, tVisible)
      end if
    end repeat
  end if
end

on renderCatalogueItems me
  tstart = (pStorePage * 15) + 1
  tEnd = min(tstart + 15, pStoreProps.count)
  tSlotIndex = 0
  tImage = image(118, 196, 32)
  repeat with i = tstart to tEnd
    tItem = pStoreProps[i]
    tIconName = tItem["class"] & "_small"
    tIconImg = VOID
    if memberExists(tIconName) then
      tMem = member(getmemnum(tIconName))
      if tMem.type = #bitmap then
        tIconImg = tMem.image
      end if
    end if
    if not voidp(tIconImg) then
      tLocH = (tSlotIndex mod 3 * 39) + (18 - (tIconImg.width / 2)) + 1
      tLocV = (39 * (tSlotIndex / 3)) + (18 - (tIconImg.height / 2)) + 1
      tImage.copyPixels(tIconImg, rect(tLocH, tLocV, tIconImg.width + tLocH, tIconImg.height + tLocV), tIconImg.rect, [#ink: 8])
    end if
    tSlotIndex = tSlotIndex + 1
  end repeat
  return tImage
end

on renderCataloguePrice me, tCurrency, tValue, tBalanceText
  tCurrencyProp = me.getComponent().getCurrencyData(tCurrency)
  tCurrencyIcon = tCurrencyProp[#icon]
  tCurrencyName = tCurrencyProp[#name]
  tImage = image(188, 32, 32)
  tIconImg = image(1, 1, 32)
  if memberExists(tCurrencyIcon) then
    tMem = member(getmemnum(tCurrencyIcon))
    if tMem.type = #bitmap then
      tIconImg = tMem.image
    end if
  end if
  tIconStartH = 0
  tTextStartH = 0
  if tBalanceText then
    tBoldImg = pWriterBoldLeft.render(getText("fish_balance", "Fish Balance:"))
    tCenterV = 16 - (tBoldImg.height / 2)
    tImage.copyPixels(tBoldImg, rect(0, tCenterV, tBoldImg.width, tBoldImg.height + tCenterV), tBoldImg.rect)
    tTextStartH = tBoldImg.width - 5
    tTextImg = pWriterPlainLeft.render(string(tValue))
    tIconStartH = tTextImg.width + tBoldImg.width - 5
  else
    tTextImg = pWriterPlainLeft.render(string(tValue) && tCurrencyName)
    tTextStartH = tIconImg.width + 5
  end if
  tCenterV = 16 - (tIconImg.height / 2)
  tImage.copyPixels(tIconImg, rect(tIconStartH, tCenterV, tIconImg.width + tIconStartH, tIconImg.height + tCenterV), tIconImg.rect, [#ink: 8])
  tCenterV = 16 - (tTextImg.height / 2)
  tImage.copyPixels(tTextImg, rect(tTextStartH, tCenterV, tTextImg.width + tTextStartH, tTextImg.height + tCenterV), tTextImg.rect)
  return tImage
end

on renderShopSlotsGrid me
  tImage = image(118, 196, 32)
  tSlotImg = member("fishing_store_slot").image
  repeat with i = 0 to 14
    tLocH = i mod 3 * 39
    tLocV = 39 * (i / 3)
    tImage.copyPixels(tSlotImg, rect(tLocH, tLocV, tSlotImg.width + tLocH, tSlotImg.height + tLocV), tSlotImg.rect, [#ink: 36])
  end repeat
  return tImage
end

on showPreviewImage me, tProps
  if tProps.ilk <> #propList then
    return 
  end if
  pStoreBuyingItemProp = tProps
  tWndObj = getWindow(pFishingWndID)
  if tWndObj <> 0 then
    tElem = tWndObj.getElement("fishing_furni_description")
    if tElem <> 0 then
      tElem.setText(tProps["description"])
    end if
    tElem = tWndObj.getElement("fishing_furni_name")
    if tElem <> 0 then
      tElem.setText(tProps["name"])
    end if
    me.showHideBuyFurniButton(1)
    tElem = tWndObj.getElement("fishing_store_price_box")
    if tElem <> 0 then
      tElem.feedImage(me.renderCataloguePrice(tProps["currency"], tProps["price"], 0))
    end if
    tElem = tWndObj.getElement("fishing_furni_preview")
    if tElem <> 0 then
      if voidp(tProps["class"]) then
        return error(me, "Class property missing", #showPreviewImage, #minor)
      end if
      if voidp(tProps["objectType"]) then
        return error(me, "objectType property missing", #showPreviewImage, #minor)
      end if
      tClass = tProps["class"]
      tObjectType = tProps["objectType"]
      tDirection = [2, 2, 2]
      tDimensions = [1, 1]
      tpartColors = "*ffffff"
      if not voidp(tProps["dimensions"]) then
        tDimensions = value("[" & tProps["dimensions"] & "]")
        if tDimensions.count < 2 then
          tDimensions = [1, 1]
        end if
      end if
      if not voidp(tProps["partColors"]) then
        tpartColors = tProps["partColors"]
        if (tpartColors = EMPTY) or (tpartColors = "0,0,0") then
          tpartColors = "*ffffff"
        end if
      end if
      tdata = [:]
      tdata[#id] = "fishingStore_previewObj"
      tdata[#class] = tClass
      tdata[#name] = tClass
      tdata[#custom] = tClass
      tdata[#direction] = tDirection
      tdata[#dimensions] = tDimensions
      tdata[#colors] = tpartColors
      tdata[#objectType] = tObjectType
      if not objectExists("fishingStore_previewObj") then
        tObj = createObject("fishingStore_previewObj", ["Fishing Product Preview Class"])
        if tObj = 0 then
          return error(me, "Failed object creation!", #showPreviewImage, #major)
        end if
      else
        tObj = getObject("fishingStore_previewObj")
      end if
      tObj.define(tdata.duplicate())
      tImage = tObj.getPicture()
      if tImage.ilk = #image then
        tDestImg = tElem.getProperty(#image)
        tSourceImg = tImage
        tDestImg.fill(tDestImg.rect, rgb(255, 255, 255))
        tdestrect = tDestImg.rect - tSourceImg.rect
        tMargins = rect(0, 0, 0, 0)
        tdestrect = rect(tdestrect.width / 2, tdestrect.height / 2, tSourceImg.width + (tdestrect.width / 2), (tdestrect.height / 2) + tSourceImg.height) + tMargins
        tDestImg.copyPixels(tSourceImg, tdestrect, tSourceImg.rect, [#ink: 36])
        tElem.feedImage(tDestImg)
      end if
    end if
  end if
  return 1
end

on refreshDerbyRegistration me
  if pDerbyStorePage <> "b" then
    return 0
  end if
  tProps = me.getComponent().getDerbyRegistration()
  tWndObj = getWindow("derby_store_a")
  if tWndObj = 0 then
    return 0
  end if
  if ilk(tProps) <> #propList then
    tProps = [:]
  end if
  me.setWindowText(tWndObj, "derby_standard_number", string(me.getPropValue(tProps, #standardNumber, 0)))
  me.setWindowText(tWndObj, "derby_frenzy_number", string(me.getPropValue(tProps, #frenzyNumber, 0)))
  me.refreshDerbyRegistrationTimer()
  tRegisteredMode = me.getPropValue(tProps, #registeredMode, EMPTY)
  tCanRegisterStandard = (tRegisteredMode = EMPTY) and me.getPropValue(tProps, #canRegisterStandard, 0)
  tCanRegisterFrenzy = (tRegisteredMode = EMPTY) and me.getPropValue(tProps, #canRegisterFrenzy, 0)
  me.setDerbyRegistrationButtonsEnabled(tCanRegisterStandard, tCanRegisterFrenzy)
  me.feedDerbyRegistrationBox(tWndObj, "derby_reg_box_std", tRegisteredMode = "standard")
  me.feedDerbyRegistrationBox(tWndObj, "derby_reg_box_fzy", tRegisteredMode = "frenzy")
  me.startDerbyRegistrationTimer()
end

on setDerbyRegistrationButtonsEnabled me, tStandardEnabled, tFrenzyEnabled
  if pDerbyStorePage <> "b" then
    return 0
  end if
  tWndObj = getWindow("derby_store_a")
  if tWndObj = 0 then
    return 0
  end if
  me.setDerbyRegistrationButtonEnabled(tWndObj, "std_register_button", tStandardEnabled)
  me.setDerbyRegistrationButtonEnabled(tWndObj, "fzy_register_button", tFrenzyEnabled)
end

on setDerbyRegistrationButtonEnabled me, tWndObj, tElementId, tEnabled
  tElem = tWndObj.getElement(tElementId)
  if tElem = 0 then
    return 0
  end if
  if tEnabled then
    tElem.show()
    tElem.Activate()
    tElem.setProperty(#blend, 100)
  else
    tElem.hide()
    tElem.deactivate()
    tElem.setProperty(#blend, 45)
  end if
end

on feedDerbyRegistrationBox me, tWndObj, tElemID, tSelected
  tElem = tWndObj.getElement(tElemID)
  if tElem = 0 then
    return 0
  end if
  tMemberName = "derby_reg_box"
  if tSelected then
    tMemberName = "derby_reg_box_select"
  end if
  if memberExists(tMemberName) then
    tElem.feedImage(member(getmemnum(tMemberName)).image)
  end if
end

on refreshDerbyRegistrationTimer me
  if pDerbyStorePage <> "b" then
    return 0
  end if
  tWndObj = getWindow("derby_store_a")
  if tWndObj = 0 then
    return 0
  end if
  tSeconds = me.getDerbySecondsLeft(me.getComponent().getDerbyRegistrationEndTime())
  me.setWindowText(tWndObj, "derby_reg_timer", me.formatDerbyTime(tSeconds))
end

on startDerbyRegistrationTimer me
  if timeoutExists(pDerbyRegistrationTimerID) then
    removeTimeout(pDerbyRegistrationTimerID)
  end if
  if windowExists("derby_store_a") and (pDerbyStorePage = "b") then
    createTimeout(pDerbyRegistrationTimerID, 1000, #tickDerbyRegistrationTimer, me.getID(), VOID, 1)
  end if
end

on tickDerbyRegistrationTimer me
  me.refreshDerbyRegistrationTimer()
  me.startDerbyRegistrationTimer()
end

on refreshStandardDerby me
  tProps = me.getComponent().getStandardDerbyState()
  tWndObj = getWindow("derby_standard")
  if tWndObj = 0 then
    return 0
  end if
  if ilk(tProps) <> #propList then
    tProps = [:]
  end if
  me.setWindowText(tWndObj, "derby_standard_number", string(me.getPropValue(tProps, #derbyNumber, 0)))
  me.renderDerbyWeightTotal(tWndObj, me.getPropValue(tProps, #totalWeightText, "0.00 kg"))
  tSlots = me.getPropValue(tProps, #slots, [])
  repeat with i = 0 to 9
    tSlotData = VOID
    if (i + 1) <= tSlots.count then
      tSlotData = tSlots[i + 1]
    end if
    me.refreshStandardDerbySlot(i, tSlotData)
  end repeat
  me.refreshStandardDerbyTimer()
  me.startStandardDerbyTimer()
end

on renderDerbyWeightTotal me, tWndObj, tWeightText
  if tWndObj = 0 then
    return 0
  end if
  tElem = tWndObj.getElement("total_weight")
  if tElem = 0 then
    return 0
  end if
  tDisplayText = string(tWeightText)
  tSpacePos = offset(SPACE, tDisplayText)
  if tSpacePos > 0 then
    tDisplayText = tDisplayText.char[1..tSpacePos - 1]
  end if
  if tDisplayText = EMPTY then
    tDisplayText = "0.00"
  end if
  tDigitImages = []
  tTotalWidth = 0
  repeat with i = 1 to tDisplayText.length
    tChar = tDisplayText.char[i]
    tMemberName = EMPTY
    if tChar = "." then
      tMemberName = "derby_weight_decimal"
    else
      if offset(tChar, "0123456789") > 0 then
        tMemberName = "derby_weight_" & tChar
      end if
    end if
    if (tMemberName <> EMPTY) and memberExists(tMemberName) then
      tDigitImage = member(getmemnum(tMemberName)).image
      tDigitImages.add([#image: tDigitImage, #Decimal: tChar = "."])
      tTotalWidth = tTotalWidth + tDigitImage.width
    end if
  end repeat
  if tDigitImages.count = 0 then
    return 0
  end if
  tImage = image(tElem.getProperty(#width), tElem.getProperty(#height), 32)
  tScale = 1.0
  if tTotalWidth > tImage.width then
    tScale = tImage.width / tTotalWidth
  end if
  tRenderWidth = 0
  repeat with i = 1 to tDigitImages.count
    tDigitImage = tDigitImages[i][#image]
    tRenderWidth = tRenderWidth + max(1, integer((tDigitImage.width * tScale) + 0.5))
  end repeat
  tLocH = max(0, integer((tImage.width - tRenderWidth) / 2))
  repeat with i = 1 to tDigitImages.count
    tDigitData = tDigitImages[i]
    tDigitImage = tDigitData[#image]
    tWidth = max(1, integer((tDigitImage.width * tScale) + 0.5))
    tHeight = max(1, integer((tDigitImage.height * tScale) + 0.5))
    tLocV = integer((tImage.height - tHeight) / 2)
    if tDigitData[#Decimal] then
      tLocV = tImage.height - tHeight
    end if
    tImage.copyPixels(tDigitImage, rect(tLocH, tLocV, tLocH + tWidth, tLocV + tHeight), tDigitImage.rect, [#ink: 36])
    tLocH = tLocH + tWidth
  end repeat
  tElem.feedImage(tImage)
  return 1
end

on refreshStandardDerbySlot me, tSlotIndex, tSlotData
  tWndObj = getWindow("derby_standard")
  if tWndObj = 0 then
    return 0
  end if
  tFishElem = tWndObj.getElement("fish_slot_" & tSlotIndex)
  tStarElem = tWndObj.getElement("star_slot_" & tSlotIndex)
  tWeightElem = tWndObj.getElement("weight_slot_" & tSlotIndex)
  if voidp(tSlotData) then
    if (tFishElem <> 0) and memberExists("derby_empty_fish") then
      tFishElem.feedImage(member(getmemnum("derby_empty_fish")).image)
    end if
    if tWeightElem <> 0 then
      tWeightElem.setText(getText("derby_empty_slot", "Empty"))
    end if
    if tStarElem <> 0 then
      tStarElem.hide()
    end if
    return 1
  end if
  if tFishElem <> 0 then
    tFishMember = me.getDerbyFishPreviewMember(me.getPropValue(tSlotData, #fishCode, EMPTY))
    if not voidp(tFishMember) then
      tFishElem.feedImage(tFishMember.image)
    end if
  end if
  if tWeightElem <> 0 then
    tWeightElem.setText(me.getPropValue(tSlotData, #weightText, getText("derby_empty_slot", "Empty")))
  end if
  if tStarElem <> 0 then
    if me.getPropValue(tSlotData, #gold, 0) then
      tStarElem.show()
    else
      tStarElem.hide()
    end if
  end if
end

on refreshStandardDerbyTimer me
  tWndObj = getWindow("derby_standard")
  if tWndObj = 0 then
    return 0
  end if
  tSeconds = me.getDerbySecondsLeft(me.getComponent().getStandardDerbyEndTime())
  me.setWindowText(tWndObj, "derby_timer", me.formatDerbyTime(tSeconds))
end

on startStandardDerbyTimer me
  if timeoutExists(pDerbyStandardTimerID) then
    removeTimeout(pDerbyStandardTimerID)
  end if
  if windowExists("derby_standard") then
    createTimeout(pDerbyStandardTimerID, 1000, #tickStandardDerbyTimer, me.getID(), VOID, 1)
  end if
end

on tickStandardDerbyTimer me
  me.refreshStandardDerbyTimer()
  me.startStandardDerbyTimer()
end

on startStandardDerbyPoll me
  if timeoutExists(pDerbyStandardPollID) then
    removeTimeout(pDerbyStandardPollID)
  end if
  if windowExists("derby_standard") then
    createTimeout(pDerbyStandardPollID, 5000, #pollStandardDerby, me.getID(), VOID, 1)
  end if
end

on pollStandardDerby me
  if windowExists("derby_standard") and connectionExists(getVariable("connection.room.id")) then
    getConnection(getVariable("connection.room.id")).send("GET_STANDARD_DERBY_STATE")
  end if
  me.startStandardDerbyPoll()
end

on refreshFrenzyDerby me
  tProps = me.getComponent().getFrenzyDerbyState()
  tWndObj = getWindow("derby_frenzy")
  if tWndObj = 0 then
    return 0
  end if
  if ilk(tProps) <> #propList then
    tProps = [:]
  end if
  me.setWindowText(tWndObj, "derby_frenzy_number", string(me.getPropValue(tProps, #derbyNumber, 0)))
  me.renderFrenzyTotalCount(tWndObj, me.getPropValue(tProps, #totalFish, 0))
  me.renderFrenzyFishCanvas(me.getPropValue(tProps, #catches, []))
  me.refreshFrenzyDerbyTimer()
  me.startFrenzyDerbyTimer()
end

on renderFrenzyTotalCount me, tWndObj, tCount
  if tWndObj = 0 then
    return 0
  end if
  tElem = tWndObj.getElement("total_count")
  if tElem = 0 then
    return 0
  end if
  tImage = image(tElem.getProperty(#width), tElem.getProperty(#height), 32)
  tTextImage = pWriterDerbyCount.render(string(integer(tCount))).duplicate()
  tLocH = max(0, integer((tImage.width - tTextImage.width) / 2))
  tLocV = max(0, integer((tImage.height - tTextImage.height) / 2))
  tImage.copyPixels(tTextImage, rect(tLocH, tLocV, tLocH + tTextImage.width, tLocV + tTextImage.height), tTextImage.rect, [#ink: 36])
  tElem.feedImage(tImage)
end

on renderFrenzyFishCanvas me, tCatchList
  tWndObj = getWindow("derby_frenzy")
  if tWndObj = 0 then
    return 0
  end if
  tCanvasElem = tWndObj.getElement("frenzy_fish_canvas")
  if tCanvasElem = 0 then
    return 0
  end if
  if not memberExists("derby_frenzy_catch") then
    return 0
  end if
  if not memberExists("derby_frenzy_gold") then
    return 0
  end if
  tCols = 41
  tGapH = 1
  tGapV = 3
  tMax = 123
  tNormal = member(getmemnum("derby_frenzy_catch")).image
  tGold = member(getmemnum("derby_frenzy_gold")).image
  tCanvasImg = image(tCanvasElem.getProperty(#width), tCanvasElem.getProperty(#height), 32)
  repeat with i = 1 to min(tCatchList.count, tMax)
    tCatch = tCatchList[i]
    tIcon = tNormal
    if me.getPropValue(tCatch, #gold, 0) then
      tIcon = tGold
    end if
    tZeroIndex = i - 1
    tCol = tZeroIndex mod tCols
    tRow = integer(tZeroIndex / tCols)
    tX = tCol * (tIcon.width + tGapH)
    tY = tRow * (tIcon.height + tGapV)
    tCanvasImg.copyPixels(tIcon, rect(tX, tY, tX + tIcon.width, tY + tIcon.height), tIcon.rect, [#ink: 36])
  end repeat
  tCanvasElem.feedImage(tCanvasImg)
end

on refreshFrenzyDerbyTimer me
  tWndObj = getWindow("derby_frenzy")
  if tWndObj = 0 then
    return 0
  end if
  tSeconds = me.getDerbySecondsLeft(me.getComponent().getFrenzyDerbyEndTime())
  me.setWindowText(tWndObj, "derby_timer", me.formatDerbyTime(tSeconds))
end

on startFrenzyDerbyTimer me
  if timeoutExists(pDerbyFrenzyTimerID) then
    removeTimeout(pDerbyFrenzyTimerID)
  end if
  if windowExists("derby_frenzy") then
    createTimeout(pDerbyFrenzyTimerID, 1000, #tickFrenzyDerbyTimer, me.getID(), VOID, 1)
  end if
end

on tickFrenzyDerbyTimer me
  me.refreshFrenzyDerbyTimer()
  me.startFrenzyDerbyTimer()
end

on startFrenzyDerbyPoll me
  if timeoutExists(pDerbyFrenzyPollID) then
    removeTimeout(pDerbyFrenzyPollID)
  end if
  if windowExists("derby_frenzy") then
    createTimeout(pDerbyFrenzyPollID, 5000, #pollFrenzyDerby, me.getID(), VOID, 1)
  end if
end

on pollFrenzyDerby me
  if windowExists("derby_frenzy") and connectionExists(getVariable("connection.room.id")) then
    getConnection(getVariable("connection.room.id")).send("GET_FRENZY_DERBY_STATE")
  end if
  me.startFrenzyDerbyPoll()
end

on refreshDerbyTimers me
  me.refreshDerbyRegistrationTimer()
  me.refreshStandardDerbyTimer()
  me.refreshFrenzyDerbyTimer()
end

on requestDerbyLeaderboard me
  if connectionExists(getVariable("connection.room.id")) then
    getConnection(getVariable("connection.room.id")).send("GET_DERBY_LEADERBOARD", [#string: pDerbyLeaderboardMode, #integer: pDerbyLeaderboardPage])
  end if
end

on refreshDerbyLeaderboard me
  tProps = me.getComponent().getDerbyLeaderboard()
  if ilk(tProps) <> #propList then
    return 0
  end if
  pDerbyLeaderboardMode = me.getPropValue(tProps, #mode, pDerbyLeaderboardMode)
  tTotalPages = max(1, me.getPropValue(tProps, #totalPages, 1))
  pDerbyLeaderboardPage = max(0, min(me.getPropValue(tProps, #page, pDerbyLeaderboardPage), tTotalPages - 1))
  tWindowID = me.getDerbyLeaderboardWindowID(pDerbyLeaderboardMode)
  if not windowExists(tWindowID) then
    return 0
  end if
  tListID = "derby_leader_std_list"
  if pDerbyLeaderboardMode = "frenzy" then
    tListID = "derby_leader_fzy_list"
  end if
  me.renderDerbyLeaderboardList(tWindowID, tListID, me.getPropValue(tProps, #rows, []))
  tWndObj = getWindow(tWindowID)
  me.setWindowText(tWndObj, "derby_leader_txt_pageNumber", string(pDerbyLeaderboardPage + 1) & "/" & string(tTotalPages))
  me.setDerbyLeaderboardNavigationEnabled(tWndObj, pDerbyLeaderboardPage, tTotalPages)
end

on setDerbyLeaderboardNavigationEnabled me, tWndObj, tPage, tTotalPages
  tBackID = "derby_std_arrow_pageBack"
  tForwardId = "derby_std_arrow_pageFwd"
  if pDerbyLeaderboardMode = "frenzy" then
    tBackID = "derby_fzy_arrow_pageBack"
    tForwardId = "derby_fzy_arrow_pageFwd"
  end if
  me.setDerbyLeaderboardNavigationButton(tWndObj, tBackID, tPage > 0)
  me.setDerbyLeaderboardNavigationButton(tWndObj, tForwardId, tPage < (tTotalPages - 1))
end

on setDerbyLeaderboardNavigationButton me, tWndObj, tElementId, tEnabled
  tElem = tWndObj.getElement(tElementId)
  if tElem = 0 then
    return 0
  end if
  if tEnabled then
    tElem.Activate()
    tElem.setProperty(#blend, 100)
  else
    tElem.deactivate()
    tElem.setProperty(#blend, 45)
  end if
end

on renderDerbyLeaderboardList me, tWindowID, tElementId, tRows
  tWndObj = getWindow(tWindowID)
  if tWndObj = 0 then
    return 0
  end if
  tElem = tWndObj.getElement(tElementId)
  if tElem = 0 then
    return 0
  end if
  tImg = image(tElem.getProperty(#width), tElem.getProperty(#height), 32)
  tY = 4
  repeat with i = 1 to min(tRows.count, 10)
    tRow = tRows[i]
    tLine = tRow[#position] & ". " & tRow[#name] && tRow[#scoreText]
    tLineImg = pWriterPlainLeft.render(tLine)
    tImg.copyPixels(tLineImg, rect(4, tY, 4 + tLineImg.width, tY + tLineImg.height), tLineImg.rect)
    tY = tY + 18
  end repeat
  tElem.feedImage(tImg)
end

on getDerbyLeaderboardWindowID me, tMode
  if tMode = "frenzy" then
    return "derby_leader_b"
  end if
  return "derby_leader_a"
end

on setWindowText me, tWndObj, tElemID, tText
  if tWndObj = 0 then
    return 0
  end if
  tElem = tWndObj.getElement(tElemID)
  if tElem <> 0 then
    tElem.setText(string(tText))
  end if
end

on feedTextImage me, tWndObj, tElemID, tText
  if tWndObj = 0 then
    return 0
  end if
  tElem = tWndObj.getElement(tElemID)
  if tElem <> 0 then
    tElem.feedImage(pWriterBoldLeft.render(string(tText)))
  end if
end

on getPropValue me, tProps, tKey, tDefault
  if ilk(tProps) <> #propList then
    return tDefault
  end if
  if voidp(tProps[tKey]) then
    return tDefault
  end if
  return tProps[tKey]
end

on refreshCatalogue me
  tWndObj = getWindow(pFishingWndID)
  if tWndObj <> 0 then
    if pSubMenu = "b" then
      me.openCataloguePage(0)
      me.showHideBuyFurniButton(0)
      tElem = tWndObj.getElement("fishing_furni_preview")
      if tElem <> 0 then
        tmember = member(getmemnum("fishing_store_teaser"))
        if tmember.type = #bitmap then
          tImage = tmember.image
          tDestImg = tElem.getProperty(#image)
          tSourceImg = tImage
          tDestImg.fill(tDestImg.rect, rgb(255, 255, 255))
          tdestrect = tDestImg.rect - tSourceImg.rect
          tMargins = rect(0, 0, 0, 0)
          tdestrect = rect(tdestrect.width / 2, tdestrect.height / 2, tSourceImg.width + (tdestrect.width / 2), (tdestrect.height / 2) + tSourceImg.height) + tMargins
          tDestImg.copyPixels(tSourceImg, tdestrect, tSourceImg.rect, [#ink: 36])
          tElem.feedImage(tDestImg)
        end if
      end if
    end if
  end if
end

on refreshFishBalance me
  pFishBalanceImg = VOID
  me.refreshFishBalancePages()
end

on refreshStats me
  pFishStatsImg = VOID
  pFishingLevelProgressImg = VOID
  me.refreshStatsPage()
end

on refreshLevel me
  pFishLevelImg = VOID
  pFishingRodProgressImg = VOID
  me.refreshStatsPage()
end

on refreshFishBalancePages me
  tWndObj = getWindow(pFishingWndID)
  if tWndObj <> 0 then
    if pSubMenu <> "a" then
      if pSubMenu = "c" then
        me.setWindowText(tWndObj, "fishing_store_balance", me.formatFishingNumber(me.getComponent().getFishBalance()))
        return 1
      end if
      if voidp(pFishBalanceImg) then
        pFishBalanceImg = me.renderCataloguePrice(2, me.getComponent().getFishBalance(), 1)
      end if
      tBalanceElem = tWndObj.getElement("fishing_store_balance")
      if tBalanceElem <> 0 then
        tBalanceElem.feedImage(pFishBalanceImg)
      end if
    end if
  end if
end

on refreshStatsPage me
  tWndObj = getWindow(pFishingWndID)
  if (tWndObj <> 0) and (pSubMenu = "c") then
    me.refreshFishingStoreStats(tWndObj)
  end if
end

on renderStats me
  tStatsImage = image(183, 84, 32)
  repeat with i = 1 to pStatsDrawOrder.count
    tProp = pStatsDrawOrder[i]
    tStatsValue = me.getComponent().getStatsBySymbol(tProp[2])
    tLocV = (i - 1) * 10
    if i > 3 then
      tLocV = tLocV + 4
    end if
    tTextImg = pWriterPlainLeft.render(getText(tProp[1])).duplicate()
    if tProp[2] = #currentLevel then
      tLevelText = tStatsValue & "/" & me.getComponent().getStatsBySymbol(#maximumLevel)
      tValueImg = pWriterPlainLeft.render(tLevelText).duplicate()
    else
      tValueImg = pWriterPlainLeft.render(tStatsValue).duplicate()
    end if
    tLocH = tStatsImage.width - tValueImg.width
    tStatsImage.copyPixels(tTextImg, rect(0, tLocV, tTextImg.width, tTextImg.height + tLocV), tTextImg.rect)
    tStatsImage.draw(point(tTextImg.width - 5, tLocV + 7), point(tLocH - 2, tLocV + 7), [#shapeType: #line, #lineSize: 1, #color: color(206, 206, 206)])
    tStatsImage.copyPixels(tValueImg, rect(tLocH, tLocV, tValueImg.width + tLocH, tValueImg.height + tLocV), tValueImg.rect)
  end repeat
  return tStatsImage
end

on refreshFishingStoreStats me, tWndObj
  tStats = me.getComponent().getPlayerStats()
  me.setWindowText(tWndObj, "fishing_store_balance", me.formatFishingNumber(me.getComponent().getFishBalance()))
  me.feedImageElement(tWndObj, "stats", me.renderStats())
  me.feedImageElement(tWndObj, "stats_xp", me.renderFishingXpStats())
  me.feedImageElement(tWndObj, "level_progress", me.renderFishingStoreLevelProgress())
  me.refreshFishingLevelArt(tWndObj, tStats)
  me.refreshFishingAchievementIcons(tWndObj)
  me.refreshFishingBuffIcons(tWndObj, tStats)
end

on renderFishingXpStats me
  tStats = me.getComponent().getPlayerStats()
  tImage = image(183, 24, 32)
  tTotalXp = me.getPropValue(tStats, #totalXP, 0)
  tNextXp = me.getPropValue(tStats, #totalXpForNextLevel, 0)
  tRemainingXp = max(0, tNextXp - tTotalXp)
  tRows = [[getText("total_xp", "Total XP"), me.formatFishingNumber(tTotalXp)], [getText("xp_remaining", "XP Remaining"), me.formatFishingNumber(tRemainingXp)]]
  repeat with i = 1 to tRows.count
    tLabelImg = pWriterPlainLeft.render(tRows[i][1]).duplicate()
    tValueImg = pWriterPlainLeft.render(tRows[i][2]).duplicate()
    tLocV = (i - 1) * 11
    tLocH = tImage.width - tValueImg.width
    tImage.copyPixels(tLabelImg, rect(0, tLocV, tLabelImg.width, tLabelImg.height + tLocV), tLabelImg.rect)
    tImage.draw(point(tLabelImg.width - 4, tLocV + 7), point(tLocH - 2, tLocV + 7), [#shapeType: #line, #lineSize: 1, #color: color(206, 206, 206)])
    tImage.copyPixels(tValueImg, rect(tLocH, tLocV, tLocH + tValueImg.width, tLocV + tValueImg.height), tValueImg.rect)
  end repeat
  return tImage
end

on renderFishingStoreLevelProgress me
  tStats = me.getComponent().getPlayerStats()
  tXP = me.getPropValue(tStats, #totalXP, 0)
  tCurrentCap = me.getPropValue(tStats, #totalXpForCurrentLevel, 0)
  tNextCap = max(1, me.getPropValue(tStats, #totalXpForNextLevel, 1))
  tLevel = me.getPropValue(tStats, #currentLevel, 1)
  tAtMaximum = tLevel >= 99
  tImage = image(241, 37, 32)
  if memberExists("fishing_progress_bar") then
    tBarImg = member(getmemnum("fishing_progress_bar")).image
    tBarX = integer((tImage.width - tBarImg.width) / 2)
    tImage.copyPixels(tBarImg, rect(tBarX, 1, tBarX + tBarImg.width, 1 + tBarImg.height), tBarImg.rect)
    tPieceMemberName = "fishing_progress_bar_piece"
    if tAtMaximum then
      tPieces = 57
      tPieceMemberName = "fish_progress_bar_99"
    else
      tLocalMax = max(1, tNextCap - tCurrentCap)
      tLocalXP = max(0, tXP - tCurrentCap)
      tPieces = max(0, min(57, integer(tLocalXP * 58 / tLocalMax) - 1))
    end if
    if memberExists(tPieceMemberName) then
      tPieceImg = member(getmemnum(tPieceMemberName)).image
      repeat with i = 0 to tPieces
        tLocH = tBarX + 4 + (i * 4)
        tImage.copyPixels(tPieceImg, rect(tLocH, 5, tLocH + tPieceImg.width, 5 + tPieceImg.height), tPieceImg.rect, [#ink: 36])
      end repeat
    end if
  end if
  tTextImg = pWriterPlainLeft.render(me.formatFishingNumber(tXP) & "/" & me.formatFishingNumber(tNextCap)).duplicate()
  tTextX = integer((tImage.width - tTextImg.width) / 2)
  tImage.copyPixels(tTextImg, rect(tTextX, 25, tTextX + tTextImg.width, 25 + tTextImg.height), tTextImg.rect)
  return tImage
end

on refreshFishingLevelArt me, tWndObj, tStats
  tLevel = me.getPropValue(tStats, #currentLevel, 1)
  tAtMaximum = tLevel >= 99
  me.feedImageElement(tWndObj, "lvl_icon", me.renderFishingLevelDigits(tLevel, "fishing_lvl_", 28, 16))
  me.feedImageElement(tWndObj, "lvl_current", me.renderFishingLevelDigits(tLevel, "fish_lvl_sml_", 16, 12))
  tNextBox = tWndObj.getElement("fish_lvl_box_next")
  tNextElem = tWndObj.getElement("lvl_next")
  if tAtMaximum then
    if (tNextBox <> 0) and memberExists("fish_lvl_max_box") then
      tNextBox.feedImage(member(getmemnum("fish_lvl_max_box")).image)
    end if
    if tNextElem <> 0 then
      tNextElem.hide()
    end if
  else
    if (tNextBox <> 0) and memberExists("fish_lvl_box") then
      tNextBox.feedImage(member(getmemnum("fish_lvl_box")).image)
    end if
    if tNextElem <> 0 then
      tNextElem.show()
      tNextElem.feedImage(me.renderFishingLevelDigits(tLevel + 1, "fish_lvl_sml_", 16, 12))
    end if
  end if
end

on renderFishingLevelDigits me, tLevel, tMemberPrefix, tWidth, tHeight
  tImage = image(tWidth, tHeight, 32)
  tText = string(tLevel)
  tLocH = integer(tWidth / 2)
  tDigitImages = []
  tTotalWidth = 0
  repeat with i = 1 to tText.char.count
    tMemberName = tMemberPrefix & tText.char[i]
    if memberExists(tMemberName) then
      tDigitImage = member(getmemnum(tMemberName)).image
      tDigitImages.add(tDigitImage)
      tTotalWidth = tTotalWidth + tDigitImage.width
    end if
  end repeat
  tLocH = integer((tWidth - tTotalWidth) / 2)
  repeat with i = 1 to tDigitImages.count
    tDigitImage = tDigitImages[i]
    tLocV = integer((tHeight - tDigitImage.height) / 2)
    tImage.copyPixels(tDigitImage, rect(tLocH, tLocV, tLocH + tDigitImage.width, tLocV + tDigitImage.height), tDigitImage.rect, [#ink: 36])
    tLocH = tLocH + tDigitImage.width
  end repeat
  return tImage
end

on refreshFishingAchievementIcons me, tWndObj
  tBadgeCodes = ["FSH", "FSH99", "FSH150"]
  repeat with i = 1 to tBadgeCodes.count
    tElem = tWndObj.getElement("achieve_icon_" & i)
    if tElem <> 0 then
      tBadgeCode = tBadgeCodes[i]
      tActive = me.hasFishingBadge(tBadgeCode)
      me.feedMemberImage(tElem, "badge " & tBadgeCode)
      if tActive then
        tElem.setProperty(#blend, 100)
        next repeat
      end if
      tElem.setProperty(#blend, 45)
    end if
  end repeat
end

on refreshFishingBuffIcons me, tWndObj, tStats
  me.feedFishingBuffIcon(tWndObj.getElement("fish_buff_icon_1"), "badge SB2", 0)
  me.feedFishingBuffIcon(tWndObj.getElement("fish_buff_icon_2"), "bp_item_anniversary_fishing_xp_boost_5m_icon", me.getPropValue(tStats, #anniversaryFishingBoostActive, 0))
end

on feedFishingBuffIcon me, tElem, tMemberName, tActive
  if tElem = 0 then
    return 0
  end if
  tImage = image(tElem.getProperty(#width), tElem.getProperty(#height), 32)
  if memberExists(tMemberName) then
    tIcon = member(getmemnum(tMemberName)).image
    tX = integer((tImage.width - tIcon.width) / 2)
    tY = integer((tImage.height - tIcon.height) / 2)
    tImage.copyPixels(tIcon, rect(tX, tY, tX + tIcon.width, tY + tIcon.height), tIcon.rect, [#ink: 36])
  end if
  if tActive and memberExists("fish_buff_icon") then
    tMarker = member(getmemnum("fish_buff_icon")).image
    tImage.copyPixels(tMarker, rect(tImage.width - tMarker.width, 0, tImage.width, tMarker.height), tMarker.rect, [#ink: 36])
  end if
  tElem.feedImage(tImage)
  if tActive then
    tElem.setProperty(#blend, 100)
  else
    tElem.setProperty(#blend, 45)
  end if
end

on hasFishingBadge me, tBadgeCode
  if not getObject(#session).exists("available_badges") then
    return 0
  end if
  tBadges = getObject(#session).get("available_badges")
  if ilk(tBadges) <> #list then
    return 0
  end if
  repeat with i = 1 to tBadges.count
    if tBadges[i] = tBadgeCode then
      return 1
    end if
  end repeat
  return 0
end

on feedImageElement me, tWndObj, tElementId, tImage
  tElem = tWndObj.getElement(tElementId)
  if tElem <> 0 then
    tElem.feedImage(tImage)
  end if
end

on feedMemberImage me, tElem, tMemberName
  if memberExists(tMemberName) then
    tElem.feedImage(member(getmemnum(tMemberName)).image)
  end if
end

on formatFishingNumber me, tNumber
  tText = string(integer(tNumber))
  tOutput = EMPTY
  tCount = 0
  repeat with i = tText.char.count down to 1
    tOutput = tText.char[i] & tOutput
    tCount = tCount + 1
    if ((tCount mod 3) = 0) and (i > 1) then
      tOutput = "," & tOutput
    end if
  end repeat
  return tOutput
end

on rendeFishingRodLevel me
  tLevelData = me.getComponent().getFishingRodLevelData()
  tOdds = tLevelData[#fishOdds]
  tGoldFishOdds = tLevelData[#gFishOdds]
  tLvl = string(tLevelData[#level])
  tImage = image(261, 28, 32)
  tLvlTextImg = pWriterBoldLeft.render(getText("fishing_rod_level_txt", "Lvl."))
  tWidth = (16 * tLvl.char.count) + tLvlTextImg.width
  tBgImg = member("fishing_lvl_bg_l").image
  tImage.copyPixels(tBgImg, rect(0, 0, tBgImg.width, tBgImg.height), tBgImg.rect)
  tBgImg = member("fishing_lvl_bg_m").image
  tImage.copyPixels(tBgImg, rect(5, 0, tBgImg.width + tWidth, tBgImg.height), tBgImg.rect)
  tBgImg = member("fishing_lvl_bg_r").image
  tImage.copyPixels(tBgImg, rect(tWidth, 0, tBgImg.width + tWidth, tBgImg.height), tBgImg.rect)
  tImage.copyPixels(tLvlTextImg, rect(5, 10, tLvlTextImg.width + 5, tLvlTextImg.height + 10), tLvlTextImg.rect)
  tLocH = tLvlTextImg.width
  repeat with i = 1 to tLvl.char.count
    tChar = tLvl.char[i]
    tImg = member("fishing_lvl_" & tChar).image
    tImage.copyPixels(tImg, rect(tLocH, 6, tImg.width + tLocH, tImg.height + 6), tImg.rect, [#ink: 36])
    tLocH = tLocH + tImg.width
  end repeat
  tWidth = tWidth + 11
  tText = getText("regular_fish_odds", "Regular Fish odds: %o")
  tText = replaceChunks(tText, "%o", tOdds)
  tImg = pWriterPlainLeft.render(tText)
  tImage.copyPixels(tImg, rect(tWidth, 4, tImg.width + tWidth, tImg.height + 4), tImg.rect)
  tText = getText("gold_fish_odds", "Gold Fish odds: %o")
  tText = replaceChunks(tText, "%o", tGoldFishOdds)
  tImg = pWriterPlainLeft.render(tText)
  tImage.copyPixels(tImg, rect(tWidth, 15, tImg.width + tWidth, tImg.height + 15), tImg.rect)
  return tImage
end

on renderFishingLevelProgressBar me
  tStatsData = me.getComponent().getPlayerStats()
  tXP = tStatsData[#totalXP]
  tTotalXpForCurrentLevel = tStatsData[#totalXpForCurrentLevel]
  tTotalXpForNextLevel = tStatsData[#totalXpForNextLevel]
  tLevel = tStatsData[#currentLevel]
  tLocalXP = tXP - tTotalXpForCurrentLevel
  tLocalMax = tTotalXpForNextLevel - tTotalXpForCurrentLevel
  if tLocalMax < 1 then
    tLocalMax = 1
  end if
  tPieces = (tLocalXP * 58 / tLocalMax) - 1
  if tPieces > 57 then
    tPieces = 57
  end if
  if tPieces < 0 then
    tPieces = 0
  end if
  tImage = image(325, 37, 32)
  tBgImg = member("fishing_progress_bar").image
  tImage.copyPixels(tBgImg, rect(28, 12, tBgImg.width + 28, tBgImg.height + 12), tBgImg.rect)
  tImg = pWriterPlainLeft.render("XP: " & tXP & "/" & tTotalXpForNextLevel)
  tCenterH = 120 - (tImg.width / 2) + 28
  tImage.copyPixels(tImg, rect(tCenterH, 1, tImg.width + tCenterH, tImg.height + 1), tImg.rect)
  tLocH = -6
  tCurrentLevelString = string(tLevel)
  repeat with i = 1 to tCurrentLevelString.char.count
    tChar = tCurrentLevelString.char[i]
    tImg = member("fishing_lvl_" & tChar).image
    tImage.copyPixels(tImg, rect(tLocH, 16, tImg.width + tLocH, tImg.height + 16), tImg.rect, [#ink: 36])
    tLocH = tLocH + tImg.width
  end repeat
  tNextLevelString = string(tLevel + 1)
  if tLevel = 100 then
    tNextLevelString = string(100)
  end if
  tLocH = 271
  repeat with i = 1 to tNextLevelString.char.count
    tChar = tNextLevelString.char[i]
    tImg = member("fishing_lvl_" & tChar).image
    tImage.copyPixels(tImg, rect(tLocH, 16, tImg.width + tLocH, tImg.height + 16), tImg.rect, [#ink: 36])
    tLocH = tLocH + tImg.width
  end repeat
  tPieceImg = member("fishing_progress_bar_piece").image
  repeat with i = 0 to tPieces
    tLocH = 32 + (i * 4)
    tImage.copyPixels(tPieceImg, rect(tLocH, 16, tPieceImg.width + tLocH, tPieceImg.height + 16), tPieceImg.rect, [#ink: 36])
  end repeat
  return tImage
end

on renderFishingRodProgressBar me
  tLevelData = me.getComponent().getFishingRodLevelData()
  tXP = tLevelData[#xp]
  tTotalXpForNextLevel = tLevelData[#maxXP]
  tLevel = tLevelData[#level]
  if tTotalXpForNextLevel < 1 then
    tTotalXpForNextLevel = 1
  end if
  tPieces = (tXP * 58 / tTotalXpForNextLevel) - 1
  if tPieces > 57 then
    tPieces = 57
  end if
  tImage = image(304, 37, 32)
  tBgImg = member("fishing_progress_bar").image
  tImage.copyPixels(tBgImg, rect(28, 12, tBgImg.width + 28, tBgImg.height + 12), tBgImg.rect)
  tBgImg = member("fishing_lvl_tile").image
  tImage.copyPixels(tBgImg, rect(0, 12, tBgImg.width, tBgImg.height + 12), tBgImg.rect)
  tImage.copyPixels(tBgImg, rect(273, 12, tBgImg.width + 273, tBgImg.height + 12), tBgImg.rect)
  tImg = pWriterPlainLeft.render("XP: " & tXP & "/" & tTotalXpForNextLevel)
  tCenterH = 120 - (tImg.width / 2) + 28
  tImage.copyPixels(tImg, rect(tCenterH, 1, tImg.width + tCenterH, tImg.height + 1), tImg.rect)
  tBaseText = getText("fishing_rod_level_txt", "Lvl.")
  tLvlTextImg = pWriterBoldLeft.render(tBaseText & tLevel)
  tImage.copyPixels(tLvlTextImg, rect(0, 1, tLvlTextImg.width, tLvlTextImg.height + 1), tLvlTextImg.rect)
  tNextLvlTextImg = pWriterBoldLeft.render(tBaseText & tLevel + 1)
  tNLvlLocH = tImage.width - tNextLvlTextImg.width
  tImage.copyPixels(tNextLvlTextImg, rect(tNLvlLocH, 1, tNextLvlTextImg.width + tNLvlLocH, tNextLvlTextImg.height + 1), tNextLvlTextImg.rect)
  tPieceImg = member("fishing_progress_bar_piece").image
  repeat with i = 0 to tPieces
    tLocH = 32 + (i * 4)
    tImage.copyPixels(tPieceImg, rect(tLocH, 16, tPieceImg.width + tLocH, tPieceImg.height + 16), tPieceImg.rect, [#ink: 36])
  end repeat
  tRodIcon = member("fishing_rod_icon").image
  tImage.copyPixels(tRodIcon, rect(6, 13, tRodIcon.width + 6, tRodIcon.height + 13), tRodIcon.rect, [#ink: 36])
  tImage.copyPixels(tRodIcon, rect(279, 13, tRodIcon.width + 279, tRodIcon.height + 13), tRodIcon.rect, [#ink: 36])
  return tImage
end
