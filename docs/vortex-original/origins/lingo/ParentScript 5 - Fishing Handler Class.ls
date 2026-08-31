on construct me
  return me.regMsgList(1)
end

on deconstruct me
  return me.regMsgList(0)
end

on handle_fishing_status me, tMsg
  tConn = tMsg.connection
  tBalance = tConn.GetIntFrom()
  tBarProgress = tConn.GetIntFrom()
  tSeconds = tConn.GetIntFrom()
  me.getComponent().updateFishingGame(tBalance, tBarProgress, tSeconds)
end

on handle_start_fishing me, tMsg
  tConn = tMsg.connection
  tFishID = tConn.GetIntFrom()
  tSeconds = tConn.GetIntFrom()
  me.getComponent().startFishing(tFishID, tSeconds)
end

on handle_end_fishing me
  me.getComponent().stopFishing()
end

on handle_fish_tokens me, tMsg
  tConn = tMsg.connection
  getObject(#session).set("user_fishbalance", tConn.GetIntFrom())
  me.getInterface().refreshFishBalance()
end

on handle_fishing_rod_level me, tMsg
  tConn = tMsg.connection
  tProps = [:]
  tProps[#level] = tConn.GetIntFrom()
  tProps[#fishOdds] = tConn.GetStrFrom()
  tProps[#gFishOdds] = tConn.GetStrFrom()
  tProps[#xp] = tConn.GetIntFrom()
  tProps[#maxXP] = tConn.GetIntFrom()
  tAllowUpgrade = tConn.GetIntFrom() = 1
  tProps[#upgradable] = tAllowUpgrade
  if tAllowUpgrade then
    tProps[#upgrade] = [#currency: tConn.GetIntFrom(), #price: tConn.GetIntFrom()]
  end if
  me.getComponent().updateLevel(tProps)
end

on handle_fishing_stats me, tMsg
  tConn = tMsg.connection
  tProps = [:]
  tProps[#currentLevel] = tConn.GetIntFrom()
  tProps[#maximumLevel] = tConn.GetIntFrom()
  tProps[#totalXP] = tConn.GetIntFrom()
  tProps[#totalXpForCurrentLevel] = tConn.GetIntFrom()
  tProps[#totalXpForNextLevel] = tConn.GetIntFrom()
  tProps[#fishesCaught] = tConn.GetIntFrom()
  tProps[#gFishesCaught] = tConn.GetIntFrom()
  tProps[#derbyWins] = tConn.GetIntFrom()
  tProps[#heaviestFishWeight] = tConn.GetIntFrom()
  tProps[#bestStandardScore] = tConn.GetIntFrom()
  tProps[#bestFrenzyScore] = tConn.GetIntFrom()
  tProps[#anniversaryFishingBoostActive] = tConn.GetIntFrom() > 0
  me.getComponent().updateStats(tProps)
end

on handle_derby_registration_state me, tMsg
  tConn = tMsg.connection
  tProps = [:]
  tProps[#standardNumber] = tConn.GetIntFrom()
  tProps[#frenzyNumber] = tConn.GetIntFrom()
  tProps[#secondsLeft] = tConn.GetIntFrom()
  tProps[#canRegisterStandard] = tConn.GetIntFrom() = 1
  tProps[#canRegisterFrenzy] = tConn.GetIntFrom() = 1
  tProps[#registeredMode] = tConn.GetStrFrom()
  me.getComponent().updateDerbyRegistration(tProps)
end

on handle_derby_registration_result me, tMsg
  tConn = tMsg.connection
  tSuccess = tConn.GetIntFrom() = 1
  tMode = tConn.GetStrFrom()
  tMessage = tConn.GetStrFrom()
  me.getComponent().handleDerbyRegistrationResult(tSuccess, tMode, tMessage)
end

on handle_standard_derby_state me, tMsg
  tConn = tMsg.connection
  tProps = [:]
  tProps[#derbyNumber] = tConn.GetIntFrom()
  tProps[#secondsLeft] = tConn.GetIntFrom()
  tProps[#totalWeightText] = tConn.GetStrFrom()
  tSlots = []
  tCount = tConn.GetIntFrom()
  repeat with i = 1 to tCount
    tSlots.add(me.parseDerbyStandardSlot(tConn))
  end repeat
  tProps[#slots] = tSlots
  me.getComponent().updateStandardDerbyState(tProps)
end

on parseDerbyStandardSlot me, tConn
  tSlot = [:]
  tSlot[#fishCode] = tConn.GetStrFrom()
  tSlot[#weightText] = tConn.GetStrFrom()
  tSlot[#gold] = tConn.GetIntFrom() = 1
  return tSlot
end

on handle_frenzy_derby_state me, tMsg
  tConn = tMsg.connection
  tProps = [:]
  tProps[#derbyNumber] = tConn.GetIntFrom()
  tProps[#secondsLeft] = tConn.GetIntFrom()
  tProps[#totalFish] = tConn.GetIntFrom()
  tCatches = []
  tCount = tConn.GetIntFrom()
  repeat with i = 1 to tCount
    tCatch = [:]
    tCatch[#fishCode] = tConn.GetStrFrom()
    tCatch[#gold] = tConn.GetIntFrom() = 1
    tCatches.add(tCatch)
  end repeat
  tProps[#catches] = tCatches
  me.getComponent().updateFrenzyDerbyState(tProps)
end

on handle_derby_leaderboard me, tMsg
  tConn = tMsg.connection
  tProps = [:]
  tProps[#mode] = tConn.GetStrFrom()
  tProps[#page] = tConn.GetIntFrom()
  tProps[#totalPages] = tConn.GetIntFrom()
  tRows = []
  tCount = tConn.GetIntFrom()
  repeat with i = 1 to tCount
    tRow = [:]
    tRow[#position] = tConn.GetIntFrom()
    tRow[#name] = tConn.GetStrFrom()
    tRow[#scoreText] = tConn.GetStrFrom()
    tRow[#fishCaught] = tConn.GetIntFrom()
    tRow[#goldenFishCaught] = tConn.GetIntFrom()
    tRows.add(tRow)
  end repeat
  tProps[#rows] = tRows
  me.getComponent().updateDerbyLeaderboard(tProps)
end

on handle_derby_timer_update me, tMsg
  tConn = tMsg.connection
  tstate = tConn.GetStrFrom()
  tRegisteredMode = tConn.GetStrFrom()
  tSecondsLeft = tConn.GetIntFrom()
  me.getComponent().updateDerbyLifecycle(tstate, tRegisteredMode, tSecondsLeft)
end

on handle_fishing_store_products me, tMsg
  tConn = tMsg.connection
  tProducts = []
  tProductCount = tConn.GetIntFrom()
  repeat with i = 1 to tProductCount
    tProduct = [:]
    tProduct["name"] = tConn.GetStrFrom()
    tProduct["description"] = tConn.GetStrFrom()
    tProduct["currency"] = tConn.GetIntFrom()
    tProduct["price"] = tConn.GetIntFrom()
    tProduct["objectType"] = tConn.GetStrFrom()
    tProduct["class"] = tConn.GetStrFrom()
    tProduct["direction"] = tConn.GetStrFrom()
    tProduct["dimensions"] = tConn.GetStrFrom()
    tProduct["purchaseCode"] = tConn.GetStrFrom()
    tProduct["partColors"] = tConn.GetStrFrom()
    tProducts.add(tProduct)
  end repeat
  me.getComponent().updateStoreItems(tProducts)
end

on handle_fishing_chat me, tMsg
  tConn = tMsg.connection
  if threadExists(#room) then
    tRoom = getThread(#room)
    tuser = string(tConn.GetIntFrom())
    tChat = tConn.GetStrFrom()
    tIconID = tConn.GetIntFrom()
    if tRoom.getComponent().userObjectExists(tuser) then
      tRoom.getComponent().getBalloon().createBalloon([#command: "SHOUT", #id: tuser, #message: tChat, #style: 2, #icon: tIconID])
    end if
  end if
end

on handle_update_fishpedia me, tMsg
  tConn = tMsg.connection
  tFishes = [:]
  tTotalFish = tConn.GetIntFrom()
  repeat with i = 1 to tTotalFish
    tFishProps = me.parse_fishpedia_fish(tConn)
    tFishes[tFishProps[#code]] = tFishProps
  end repeat
  me.getComponent().getFishPediaManager().updateFishList(tFishes)
end

on handle_update_fishpedia_fish me, tMsg
  tConn = tMsg.connection
  tFishProps = me.parse_fishpedia_fish(tConn)
  me.getComponent().getFishPediaManager().updateFish(tFishProps)
end

on parse_fishpedia_fish me, tConn
  tFishProps = [:]
  tFishProps[#code] = tConn.GetStrFrom()
  tFishProps[#unlocked] = tConn.GetIntFrom() = 1
  tFishProps[#rarity] = tConn.GetIntFrom()
  tFishProps[#xp] = tConn.GetStrFrom()
  tFishProps[#tokens] = tConn.GetStrFrom()
  tFishProps[#catchRate] = tConn.GetStrFrom()
  tFishProps[#location] = tConn.GetStrFrom()
  tTimeRanges = []
  tTotalRanges = tConn.GetIntFrom()
  repeat with r = 1 to tTotalRanges
    tTimeRanges.add([tConn.GetIntFrom(), tConn.GetIntFrom()])
  end repeat
  tFishProps[#hours] = tTimeRanges
  tWeekDays = []
  tTotalDays = tConn.GetIntFrom()
  repeat with d = 1 to tTotalDays
    tWeekDays.add(tConn.GetIntFrom())
  end repeat
  tFishProps[#weekDays] = tWeekDays
  return tFishProps
end

on regMsgList me, tBool
  tMsgs = [:]
  tMsgs.setaProp(1102, #handle_fish_tokens)
  tMsgs.setaProp(1106, #handle_fishing_stats)
  tMsgs.setaProp(1105, #handle_fishing_rod_level)
  tMsgs.setaProp(1103, #handle_fishing_store_products)
  tMsgs.setaProp(1107, #handle_start_fishing)
  tMsgs.setaProp(1109, #handle_end_fishing)
  tMsgs.setaProp(1108, #handle_fishing_status)
  tMsgs.setaProp(1101, #handle_fishing_chat)
  tMsgs.setaProp(1115, #handle_update_fishpedia)
  tMsgs.setaProp(1116, #handle_update_fishpedia_fish)
  tMsgs.setaProp(1117, #handle_derby_registration_state)
  tMsgs.setaProp(1118, #handle_derby_registration_result)
  tMsgs.setaProp(1119, #handle_standard_derby_state)
  tMsgs.setaProp(1120, #handle_frenzy_derby_state)
  tMsgs.setaProp(1121, #handle_derby_leaderboard)
  tMsgs.setaProp(1122, #handle_derby_timer_update)
  tCmds = [:]
  tCmds.setaProp("FHM", 1101)
  tCmds.setaProp("STARTFISHING", 1100)
  tCmds.setaProp("GET_FISHING_STATS", 1106)
  tCmds.setaProp("GET_FISHING_ROD_LEVEL", 1105)
  tCmds.setaProp("GET_FISHING_PRODUCTS", 1103)
  tCmds.setaProp("GET_FISH_TOKENS", 1102)
  tCmds.setaProp("PURCHASE_FISHING_PRODUCT", 1104)
  tCmds.setaProp("GET_FISHPEDIA_FISHES", 1107)
  tCmds.setaProp("ATTEMPT_TO_REGISTER_FOR_DERBY", 1108)
  tCmds.setaProp("GET_DERBY_REGISTRATION_STATE", 1117)
  tCmds.setaProp("GET_STANDARD_DERBY_STATE", 1119)
  tCmds.setaProp("GET_FRENZY_DERBY_STATE", 1122)
  tCmds.setaProp("GET_DERBY_LEADERBOARD", 1121)
  if tBool then
    registerListener(getVariable("connection.room.id"), me.getID(), tMsgs)
    registerCommands(getVariable("connection.room.id"), me.getID(), tCmds)
  else
    unregisterListener(getVariable("connection.room.id"), me.getID(), tMsgs)
    unregisterCommands(getVariable("connection.room.id"), me.getID(), tCmds)
  end if
  return 1
end
