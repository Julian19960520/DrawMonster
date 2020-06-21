export enum Key{
    Uuid = "uuid",
    Version = "version",

    //用户属性
    Coin = "user/coin",
    Energy = "user/energy",
    Diamond = "user/Diamond",
    ThemeId = "user/themeId",
    ColorIds = "user/colorIds",
    RankDatas = "user/rankDatas",
    CustomMonsters = "user/customMonsters",
    CustomHeros = "user/customHeros",
    CustomThemes = "user/customThemes",
    OpenThemeIds = "user/openThemeIds",
    PlayTimes = "user/playTimes",
    DrawTimes = "user/playTimes",
    HeartLvl = "user/heartLvl",
    ShieldLvl = "user/ShieldLvl",
    CoinBagLvl = "user/CoinBagLvl",
    StarThemeIds = "user/starThemeIds",
    lastFreeBallStamp = "user/lastFreeBallStamp",
    gashaBallCnt = "user/gashaBallCnt",
    gashaRewards = "user/gashaRewards",
    gashaRewardsRefreshStamp = "user/gashaRewardsRefreshStamp",
    gashaRefreshIdx = "user/gashaRefreshIdx",
    luckyCatBeginStamp = "user/luckyCatBeginStamp",     //招财喵开始时间戳，等于0时代表未开启
    //设置
    Sound = "option/sound",
    Music = "option/music",
    Sensitivity = "option/sensitivity",
    Vibrate = "option/vibrate",
    
    //引导变量
    guideUnlockPaint = "guide/unlockPaint",
    guideDrawFish = "guide/drawFish",
    guideCollectGameBegin = "guide/collectGameBegin",       //等于0时未开启任务，等于1时开启任务，等于2时完成任务

    //临时变量
    curScene = "temp/curScene",
    gameState = "temp/gameState",
    allThemes = "temp/allTheme",
    editing = "temp/editing",
    dynamicThemes = "temp/dynamicThemes",
    starThemes = "temp/starThemes",
    screenShotTextures = "temp/screenShotTextures",
    WorldRank = "temp/worldRank",
}