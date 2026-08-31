property pStats, pFishingRodLevel, pFishPediaManagerID, pDerbyRegistration, pDerbyStandard, pDerbyFrenzy, pDerbyLeaderboard, pDerbyRegistrationEndTime, pDerbyStandardEndTime, pDerbyFrenzyEndTime, pDerbyLifecycle, pDerbyLifecycleEndTime

on construct me
  pStats = [#fishesCaught: 0, #gFishesCaught: 0, #fishesSpent: 0, #timeSpent: [#d: 0, #h: 0, #m: 0], #currentLevel: 1, #maximumLevel: 100, #totalXP: 0, #totalXpForCurrentLevel: 0, #totalXpForNextLevel: 1, #catchRatio: "0,0", #derbyWins: 0, #heaviestFishWeight: 0, #bestStandardScore: 0, #bestFrenzyScore: 0, #anniversaryFishingBoostActive: 0]
  pFishingRodLevel = [#level: 0, #fishOdds: 1.0, #gFishOdds: 1.0, #xp: 0, #maxXP: 1, #upgradable: 0, #upgrade: [#currency: 0, #price: 0]]
  pDerbyRegistration = [:]
  pDerbyStandard = [:]
  pDerbyFrenzy = [:]
  pDerbyLeaderboard = [:]
  pDerbyRegistrationEndTime = 0
  pDerbyStandardEndTime = 0
  pDerbyFrenzyEndTime = 0
  pDerbyLifecycle = [#state: "ended", #registeredMode: EMPTY, #secondsLeft: 0]
  pDerbyLifecycleEndTime = 0
  pFishPediaManagerID = getText("Fish_O_Pedia_Manager", "Fishopedia")
  createObject(pFishPediaManagerID, "Fish-O-Pedia Manager Class")
end

on deconstruct me
  if objectExists(pFishPediaManagerID) then
    removeObject(pFishPediaManagerID)
  end if
end

on getFishPediaManager me
  return getObject(pFishPediaManagerID)
end

on startFishing me, tFishID, tSeconds
  me.getInterface().updatePlayer([#balance: 0, #bar: 0, #seconds: tSeconds])
  me.getInterface().startFishing(tFishID)
end

on updateFishingGame me, tBalance, tBarProgress, tSeconds
  me.getInterface().updatePlayer([#balance: tBalance, #bar: tBarProgress, #seconds: tSeconds])
end

on stopFishing me
  me.getInterface().stopFishing()
end

on updateStats me, tProps
  pStats = tProps
  me.getInterface().refreshStats()
end

on updateLevel me, tProps
  pFishingRodLevel = tProps
  me.getInterface().refreshLevel()
end

on updateStoreItems me, tProps
  me.getInterface().pStoreProps = tProps
  me.getInterface().refreshCatalogue()
end

on updateDerbyRegistration me, tProps
  pDerbyRegistration = tProps
  pDerbyRegistrationEndTime = me.resolveDerbyEndTime(tProps)
  me.getInterface().refreshDerbyRegistration()
end

on handleDerbyRegistrationResult me, tSuccess, tMode, tMessage
  if tSuccess then
    pDerbyRegistration[#registeredMode] = tMode
    pDerbyRegistration[#canRegisterStandard] = 0
    pDerbyRegistration[#canRegisterFrenzy] = 0
    me.getInterface().refreshDerbyRegistration()
  end if
  me.getInterface().showDerbyRegistrationResult(tSuccess, tMessage)
  me.getInterface().requestDerbyRegistration()
end

on updateStandardDerbyState me, tProps
  pDerbyStandard = tProps
  pDerbyStandardEndTime = me.resolveDerbyEndTime(tProps)
  me.getInterface().refreshStandardDerby()
end

on updateFrenzyDerbyState me, tProps
  if (ilk(tProps) = #propList) and (ilk(pDerbyFrenzy) = #propList) then
    tIncomingDerbyNumber = tProps[#derbyNumber]
    tCurrentDerbyNumber = pDerbyFrenzy[#derbyNumber]
    tIncomingTotalFish = tProps[#totalFish]
    tCurrentTotalFish = pDerbyFrenzy[#totalFish]
    if not voidp(tIncomingDerbyNumber) and not voidp(tCurrentDerbyNumber) and not voidp(tIncomingTotalFish) and not voidp(tCurrentTotalFish) then
      tIncomingCatchCount = 0
      tCurrentCatchCount = 0
      if listp(tProps[#catches]) then
        tIncomingCatchCount = tProps[#catches].count
      end if
      if listp(pDerbyFrenzy[#catches]) then
        tCurrentCatchCount = pDerbyFrenzy[#catches].count
      end if
      if (tIncomingDerbyNumber = tCurrentDerbyNumber) and ((tIncomingTotalFish < tCurrentTotalFish) or ((tIncomingTotalFish = tCurrentTotalFish) and (tIncomingCatchCount < tCurrentCatchCount))) then
        return 0
      end if
    end if
  end if
  pDerbyFrenzy = tProps
  pDerbyFrenzyEndTime = me.resolveDerbyEndTime(tProps)
  me.getInterface().refreshFrenzyDerby()
end

on updateDerbyLeaderboard me, tProps
  pDerbyLeaderboard = tProps
  me.getInterface().refreshDerbyLeaderboard()
end

on updateDerbyLifecycle me, tstate, tRegisteredMode, tSecondsLeft
  pDerbyLifecycle = [#state: tstate, #registeredMode: tRegisteredMode, #secondsLeft: tSecondsLeft]
  pDerbyLifecycleEndTime = getMonotonicMillis() + (tSecondsLeft * 1000)
  me.getInterface().handleDerbyLifecycle(pDerbyLifecycle)
end

on resolveDerbyEndTime me, tProps
  if ilk(tProps) <> #propList then
    return 0
  end if
  if voidp(tProps[#secondsLeft]) then
    return 0
  end if
  return getMonotonicMillis() + (tProps[#secondsLeft] * 1000)
end

on getFishBalance me
  if getObject(#session).exists("user_fishbalance") then
    return integer(getObject(#session).get("user_fishbalance"))
  end if
  return 0
end

on getPlayerStats me
  return pStats
end

on getDerbyRegistration me
  return pDerbyRegistration
end

on getDerbyRegistrationEndTime me
  return pDerbyRegistrationEndTime
end

on getStandardDerbyState me
  return pDerbyStandard
end

on getStandardDerbyEndTime me
  return pDerbyStandardEndTime
end

on getFrenzyDerbyState me
  return pDerbyFrenzy
end

on getFrenzyDerbyEndTime me
  return pDerbyFrenzyEndTime
end

on getDerbyLeaderboard me
  return pDerbyLeaderboard
end

on getDerbyLifecycle me
  return pDerbyLifecycle
end

on getDerbyLifecycleEndTime me
  return pDerbyLifecycleEndTime
end

on getFishingRodLevelData me
  return pFishingRodLevel
end

on getStatsBySymbol me, tSymbol
  if not symbolp(tSymbol) then
    tSymbol = symbol(tSymbol)
  end if
  if voidp(pStats[tSymbol]) then
    return "0"
  end if
  if tSymbol = #timeSpent then
    tStat = pStats[#timeSpent]
    tText = getText("fishing_time_spent_txt", "%dd %hh %mm")
    tText = replaceChunks(tText, "%d", tStat[1])
    tText = replaceChunks(tText, "%h", tStat[2])
    tText = replaceChunks(tText, "%m", tStat[3])
    return tText
  end if
  if (tSymbol = #heaviestFishWeight) or (tSymbol = #bestStandardScore) then
    return me.formatDerbyWeight(integer(pStats[tSymbol]))
  end if
  return string(pStats[tSymbol])
end

on formatDerbyWeight me, tWeightGrams
  if tWeightGrams <= 0 then
    return "0.00 kg"
  end if
  tKilos = tWeightGrams / 1000.0
  return string(tKilos) && "kg"
end

on checkBalance me, tCurrency, tPrice
  tCredits = 0
  tStamps = 0
  tFish = 0
  tPriceCredits = 0
  tPriceStamps = 0
  tPriceFish = 0
  case tCurrency of
    0:
      tPriceStamps = tPrice
    1:
      tPriceCredits = tPrice
    2:
      tPriceFish = tPrice
  end case
  if getObject(#session).exists("user_walletbalance") then
    tCredits = integer(getObject(#session).get("user_walletbalance"))
  end if
  if getObject(#session).exists("user_stampsbalance") then
    tStamps = integer(getObject(#session).get("user_stampsbalance"))
  end if
  if getObject(#session).exists("user_fishbalance") then
    tFish = integer(getObject(#session).get("user_fishbalance"))
  end if
  if tCredits < tPriceCredits then
    return #credits
  end if
  if tStamps < tPriceStamps then
    return #stamps
  end if
  if tFish < tPriceFish then
    return #fish
  end if
  return #none
end

on getCurrencyData me, tCurrency
  case tCurrency of
    0:
      tCurrencyIcon = "stamp_currency_icon"
      tCurrencyName = getText("stamps", "Stamps")
    1:
      tCurrencyIcon = "credits_currency_icon"
      tCurrencyName = getText("credits", "Credits")
    2:
      tCurrencyIcon = "fish_currency_icon"
      tCurrencyName = getText("fish_currency_name", "Fish")
    otherwise:
      tCurrencyIcon = "fish_currency_icon"
      tCurrencyName = "Unknown"
  end case
  return [#icon: tCurrencyIcon, #name: tCurrencyName]
end
