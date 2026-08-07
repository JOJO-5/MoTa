main.floors.JX1=
{
    "floorId": "JX1",
    "title": "镜塔 1 层",
    "name": "镜塔 1 层",
    "width": 15,
    "height": 15,
    "canFlyTo": false,
    "canFlyFrom": false,
    "canUseQuickShop": true,
    "cannotViewMap": true,
    "cannotMoveDirectly": false,
    "images": [],
    "ratio": 1,
    "defaultGround": "autotile4",
    "firstArrive": [],
    "eachArrive": [],
    "parallelDo": "",
    "events": {
        "1,13": [
            {
                "type": "playSound",
                "name": "045-Push01.mp3"
            },
            {
                "type": "setValue",
                "name": "flag:镜像1机关门",
                "operator": "+=",
                "value": "1"
            },
            {
                "type": "hide",
                "remove": true,
                "time": 500
            }
        ],
        "13,13": [
            {
                "type": "playSound",
                "name": "045-Push01.mp3"
            },
            {
                "type": "setValue",
                "name": "flag:镜像1机关门",
                "operator": "+=",
                "value": "1"
            },
            {
                "type": "hide",
                "remove": true,
                "time": 500
            }
        ],
        "3,4": {
            "trigger": "action",
            "enable": false,
            "noPass": null,
            "displayDamage": true,
            "opacity": 1,
            "filter": {
                "blur": 0,
                "hue": 0,
                "grayscale": 0,
                "invert": false,
                "shadow": 0
            },
            "data": [
                {
                    "type": "if",
                    "condition": "core.hasEquip('sword5')",
                    "true": [
                        {
                            "type": "playSound",
                            "name": "确定"
                        },
                        "取得装备星光剑。",
                        {
                            "type": "setValue",
                            "name": "item:I496",
                            "operator": "+=",
                            "value": "1"
                        },
                        {
                            "type": "hide",
                            "remove": true
                        }
                    ],
                    "false": [
                        "你的潜质无法接受新的武器。"
                    ]
                }
            ]
        },
        "11,4": {
            "trigger": "action",
            "enable": false,
            "noPass": null,
            "displayDamage": true,
            "opacity": 1,
            "filter": {
                "blur": 0,
                "hue": 0,
                "grayscale": 0,
                "invert": false,
                "shadow": 0
            },
            "data": [
                {
                    "type": "if",
                    "condition": "core.hasEquip('shield5')",
                    "true": [
                        {
                            "type": "playSound",
                            "name": "确定"
                        },
                        "取得装备星光盾。",
                        {
                            "type": "setValue",
                            "name": "item:I497",
                            "operator": "+=",
                            "value": "1"
                        },
                        {
                            "type": "hide",
                            "remove": true
                        }
                    ],
                    "false": [
                        "你的潜质无法接受新的防具。"
                    ]
                }
            ]
        },
        "7,4": {
            "trigger": "action",
            "enable": true,
            "noPass": null,
            "displayDamage": true,
            "opacity": 1,
            "filter": {
                "blur": 0,
                "hue": 0,
                "grayscale": 0,
                "invert": false,
                "shadow": 0
            },
            "data": [
                "\t[Cardinal,E398]哼，果然找到这里来了吗？\n你这个女人还真是不能大意……",
                "\t[菲利安,hero]你的阴谋该破产了，我会尽全力阻止你们的。",
                "\t[Cardinal,E398]哼，什么叫我的阴谋，那是我们的梦想！\n你这样的女流之辈怎么可能会懂！",
                "\t[菲利安,hero]利用那个吃人怪物的再生力量，\n然后帮助你们统治世界？\n妄图利用上古的邪恶生物从来就不会有好结果！",
                "\t[Cardinal,E398]你竟然知道了……\n你跟你父亲都很能干嘛，都调查到这份上了。\n可惜啊，知道我们想做什么，也没有用！",
                "\t[菲利安,hero]呵！糟老头子，你别太看得起你自己了！\n我既然能阻止你一次，那么，我就可以有第二次！",
                {
                    "type": "animate",
                    "name": "daggerskill2"
                },
                {
                    "type": "animate",
                    "name": "Thunderyellow"
                },
                {
                    "type": "animate",
                    "name": "wind2",
                    "loc": "hero"
                },
                {
                    "type": "animate",
                    "name": "star"
                },
                {
                    "type": "animate",
                    "name": "weekness"
                },
                {
                    "type": "animate",
                    "name": "darkness2"
                },
                {
                    "type": "battle",
                    "id": "E398"
                },
                {
                    "type": "setValue",
                    "name": "flag:镜像1通关",
                    "value": "1"
                },
                {
                    "type": "setBlock",
                    "number": "null",
                    "loc": [
                        [
                            7,
                            1
                        ]
                    ]
                },
                {
                    "type": "setBlock",
                    "number": "A367",
                    "loc": [
                        [
                            7,
                            0
                        ]
                    ]
                },
                {
                    "type": "if",
                    "condition": "(flag:hard===1)",
                    "true": [
                        "\t[Cardinal,E398]该死……就算是身处黑暗之源的所在地，\n也没办法……打败你吗？",
                        {
                            "type": "hide",
                            "remove": true,
                            "time": 300
                        },
                        "\t[菲利安,hero]你就在这炼狱般的地方，反省你罪恶的一生吧！"
                    ],
                    "false": [
                        "\t[Cardinal,E398]还没结束呢！",
                        {
                            "type": "hide",
                            "remove": true,
                            "time": 300
                        },
                        "\t[菲利安,hero]可恶，就只会逃吗？"
                    ]
                }
            ]
        },
        "7,0": [
            {
                "type": "if",
                "condition": "(flag:镜像1通关===1)",
                "true": [
                    {
                        "type": "if",
                        "condition": "(flag:hard>1)",
                        "true": [
                            {
                                "type": "changeFloor",
                                "floorId": "Dark1",
                                "loc": [
                                    7,
                                    1
                                ]
                            }
                        ],
                        "false": [
                            {
                                "type": "changeFloor",
                                "floorId": "Dark2",
                                "loc": [
                                    7,
                                    13
                                ]
                            }
                        ]
                    }
                ],
                "false": []
            }
        ]
    },
    "changeFloor": {},
    "beforeBattle": {},
    "afterBattle": {
        "2,5": [
            {
                "type": "setValue",
                "name": "flag:镜像1奖励1",
                "operator": "+=",
                "value": "1"
            }
        ],
        "4,5": [
            {
                "type": "setValue",
                "name": "flag:镜像1奖励1",
                "operator": "+=",
                "value": "1"
            }
        ],
        "2,3": [
            {
                "type": "setValue",
                "name": "flag:镜像1奖励1",
                "operator": "+=",
                "value": "1"
            }
        ],
        "4,3": [
            {
                "type": "setValue",
                "name": "flag:镜像1奖励1",
                "operator": "+=",
                "value": "1"
            }
        ],
        "10,3": [
            {
                "type": "setValue",
                "name": "flag:镜像1奖励2",
                "operator": "+=",
                "value": "1"
            }
        ],
        "12,3": [
            {
                "type": "setValue",
                "name": "flag:镜像1奖励2",
                "operator": "+=",
                "value": "1"
            }
        ],
        "10,5": [
            {
                "type": "setValue",
                "name": "flag:镜像1奖励2",
                "operator": "+=",
                "value": "1"
            }
        ],
        "12,5": [
            {
                "type": "setValue",
                "name": "flag:镜像1奖励2",
                "operator": "+=",
                "value": "1"
            }
        ]
    },
    "afterGetItem": {},
    "afterOpenDoor": {},
    "autoEvent": {
        "0,0": {
            "0": {
                "condition": "flag:镜像1机关门===2",
                "currentFloor": true,
                "priority": 0,
                "delayExecute": false,
                "multiExecute": false,
                "data": [
                    {
                        "type": "openDoor",
                        "loc": [
                            3,
                            6
                        ],
                        "async": true
                    },
                    {
                        "type": "openDoor",
                        "loc": [
                            7,
                            6
                        ],
                        "async": true
                    },
                    {
                        "type": "openDoor",
                        "loc": [
                            11,
                            6
                        ],
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "null",
                        "loc": [
                            [
                                6,
                                4
                            ]
                        ],
                        "time": 300,
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "null",
                        "loc": [
                            [
                                7,
                                3
                            ]
                        ],
                        "time": 300,
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "null",
                        "loc": [
                            [
                                8,
                                4
                            ]
                        ],
                        "time": 300,
                        "async": true
                    },
                    {
                        "type": "setBlock",
                        "number": "null",
                        "loc": [
                            [
                                7,
                                5
                            ]
                        ],
                        "time": 300,
                        "async": true
                    },
                    {
                        "type": "waitAsync",
                        "excludeAnimates": true
                    }
                ]
            },
            "1": null
        },
        "3,4": {
            "0": {
                "condition": "flag:镜像1奖励1===4",
                "currentFloor": true,
                "priority": 0,
                "delayExecute": false,
                "multiExecute": false,
                "data": [
                    {
                        "type": "show"
                    }
                ]
            },
            "1": null
        },
        "11,4": {
            "0": {
                "condition": "flag:镜像1奖励2===4",
                "currentFloor": true,
                "priority": 0,
                "delayExecute": false,
                "multiExecute": false,
                "data": [
                    {
                        "type": "show"
                    }
                ]
            },
            "1": null
        },
        "7,9": {
            "0": {
                "condition": "flag:镜像1奖励1>=4 && flag:镜像1奖励2>=4",
                "currentFloor": true,
                "priority": 0,
                "delayExecute": false,
                "multiExecute": false,
                "data": [
                    {
                        "type": "animate",
                        "name": "disappear"
                    },
                    {
                        "type": "setBlock",
                        "number": "greenKey",
                        "loc": [
                            [
                                7,
                                9
                            ]
                        ]
                    }
                ]
            },
            "1": null
        }
    },
    "cannotMove": {},
    "cannotMoveIn": {},
    "map": [
    [369,369,369,369,369,369,369,  5,369,369,369,369,369,369,369],
    [369,  5,  5,  5,  5,  5,  5, 11,  5,  5,  5,  5,  5,  5,369],
    [369,  5,  5,  5,  5,  5,  5, 84,  5,  5,  5,  5,  5,  5,369],
    [369,  5,472,  0,472,  5,419,419,419,  5,390,  0,390,  5,369],
    [369,  5,  0,496,  0,  5,419,398,419,  5,  0,497,  0,  5,369],
    [369,  5,472,  0,472,  5,419,419,419,  5,390,  0,390,  5,369],
    [369,  5,  5, 85,  5,  5,  5, 85,  5,  5,  5, 85,  5,  5,369],
    [369,  0,452,  0,390,  0,333,  0,333,  0,390,  0,452,  0,369],
    [369, 81,  5,  5, 82,  5,  5, 83,  5,  5, 82,  5,  5, 81,369],
    [369,  0,  5,457,457,457,  5,  0,  5,457,457,457,  5,  0,369],
    [369,333,  5,457,457,457,  5,279,  5,457,457,457,  5,333,369],
    [369,  0,  5,  5, 81,  5,  5,  0,  5,  5, 81,  5,  5,  0,369],
    [369,  0,  5,453,453,453,  5,  0,  5,453,453,453,  5,  0,369],
    [369,423,  5,453,453,453,  5,  0,  5,453,453,453,  5,423,369],
    [369,369,369,369,369,369,369,369,369,369,369,369,369,369,369]
],
    "bgmap": [

],
    "fgmap": [
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [11116,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,11116],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [11116,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,11116],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [11116,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,11116],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [11116,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,11116],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [11116,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,11116],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [11116,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,11116],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [11116,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,11116],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]
],
    "underGround": true,
    "bgm": "Vampire_Killer.mp3",
    "flyPoint": [
        7,
        13
    ]
}