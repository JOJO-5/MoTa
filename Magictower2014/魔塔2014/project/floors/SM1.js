main.floors.SM1=
{
    "floorId": "SM1",
    "title": "神秘 1 域",
    "name": "神秘 1 域",
    "width": 15,
    "height": 15,
    "canFlyTo": true,
    "canFlyFrom": false,
    "canUseQuickShop": true,
    "cannotViewMap": false,
    "cannotMoveDirectly": false,
    "images": [],
    "ratio": 1,
    "defaultGround": "ground",
    "firstArrive": [],
    "eachArrive": [],
    "parallelDo": "",
    "events": {
        "3,13": [
            {
                "type": "playSound",
                "name": "045-Push01.mp3"
            },
            {
                "type": "setValue",
                "name": "flag:神秘地域机关",
                "operator": "+=",
                "value": "1"
            },
            {
                "type": "setFloor",
                "name": "canFlyFrom",
                "floorId": "SM1",
                "value": "true"
            },
            {
                "type": "hide",
                "remove": true,
                "time": 300
            }
        ],
        "4,2": {
            "trigger": null,
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
                    "type": "animate",
                    "name": "star"
                },
                {
                    "type": "if",
                    "condition": "(flag:星光杖魔法===0)",
                    "true": [
                        {
                            "type": "setValue",
                            "name": "flag:星光杖魔法",
                            "value": "1"
                        }
                    ],
                    "false": [
                        {
                            "type": "setValue",
                            "name": "flag:星光杖魔法",
                            "value": "0"
                        }
                    ]
                },
                {
                    "type": "hide",
                    "remove": true
                }
            ]
        },
        "8,2": {
            "trigger": null,
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
                    "type": "animate",
                    "name": "star"
                },
                {
                    "type": "if",
                    "condition": "(flag:星光杖魔法===2)",
                    "true": [
                        {
                            "type": "setValue",
                            "name": "flag:星光杖魔法",
                            "value": "3"
                        }
                    ],
                    "false": [
                        {
                            "type": "setValue",
                            "name": "flag:星光杖魔法",
                            "value": "0"
                        }
                    ]
                },
                {
                    "type": "hide",
                    "remove": true
                }
            ]
        },
        "12,2": {
            "trigger": null,
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
                    "type": "animate",
                    "name": "star"
                },
                {
                    "type": "if",
                    "condition": "(flag:星光杖魔法===1)",
                    "true": [
                        {
                            "type": "setValue",
                            "name": "flag:星光杖魔法",
                            "value": "2"
                        }
                    ],
                    "false": [
                        {
                            "type": "setValue",
                            "name": "flag:星光杖魔法",
                            "value": "0"
                        }
                    ]
                },
                {
                    "type": "hide",
                    "remove": true
                }
            ]
        }
    },
    "changeFloor": {
        "1,13": {
            "floorId": "JX18",
            "loc": [
                14,
                8
            ]
        },
        "1,1": {
            "floorId": ":next"
        }
    },
    "beforeBattle": {},
    "afterBattle": {
        "3,1": [
            {
                "type": "setValue",
                "name": "flag:神秘1机关1",
                "operator": "+=",
                "value": "1"
            }
        ],
        "5,1": [
            {
                "type": "setValue",
                "name": "flag:神秘1机关1",
                "operator": "+=",
                "value": "1"
            }
        ],
        "3,3": [
            {
                "type": "setValue",
                "name": "flag:神秘1机关1",
                "operator": "+=",
                "value": "1"
            }
        ],
        "5,3": [
            {
                "type": "setValue",
                "name": "flag:神秘1机关1",
                "operator": "+=",
                "value": "1"
            }
        ],
        "7,1": [
            {
                "type": "setValue",
                "name": "flag:神秘1机关2",
                "operator": "+=",
                "value": "1"
            }
        ],
        "9,1": [
            {
                "type": "setValue",
                "name": "flag:神秘1机关2",
                "operator": "+=",
                "value": "1"
            }
        ],
        "7,3": [
            {
                "type": "setValue",
                "name": "flag:神秘1机关2",
                "operator": "+=",
                "value": "1"
            }
        ],
        "9,3": [
            {
                "type": "setValue",
                "name": "flag:神秘1机关2",
                "operator": "+=",
                "value": "1"
            }
        ],
        "11,1": [
            {
                "type": "setValue",
                "name": "flag:神秘1机关3",
                "operator": "+=",
                "value": "1"
            }
        ],
        "13,1": [
            {
                "type": "setValue",
                "name": "flag:神秘1机关3",
                "operator": "+=",
                "value": "1"
            }
        ],
        "11,3": [
            {
                "type": "setValue",
                "name": "flag:神秘1机关3",
                "operator": "+=",
                "value": "1"
            }
        ],
        "13,3": [
            {
                "type": "setValue",
                "name": "flag:神秘1机关3",
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
                "condition": "flag:神秘地域机关>=7",
                "currentFloor": true,
                "priority": 0,
                "delayExecute": false,
                "multiExecute": false,
                "data": [
                    {
                        "type": "openDoor",
                        "loc": [
                            4,
                            4
                        ],
                        "async": true
                    },
                    {
                        "type": "openDoor",
                        "loc": [
                            8,
                            4
                        ],
                        "async": true
                    },
                    {
                        "type": "openDoor",
                        "loc": [
                            12,
                            4
                        ],
                        "async": true
                    },
                    {
                        "type": "setValue",
                        "name": "flag:星光杖魔法",
                        "value": "0"
                    },
                    {
                        "type": "waitAsync",
                        "excludeAnimates": true
                    }
                ]
            },
            "1": null
        },
        "4,2": {
            "0": null,
            "1": {
                "condition": "flag:神秘1机关1===4",
                "currentFloor": true,
                "priority": 0,
                "delayExecute": false,
                "multiExecute": false,
                "data": [
                    {
                        "type": "show"
                    }
                ]
            }
        },
        "8,2": {
            "0": null,
            "1": {
                "condition": "flag:神秘1机关2===4",
                "currentFloor": true,
                "priority": 0,
                "delayExecute": false,
                "multiExecute": false,
                "data": [
                    {
                        "type": "show"
                    }
                ]
            }
        },
        "12,2": {
            "0": null,
            "1": {
                "condition": "flag:神秘1机关3===4",
                "currentFloor": true,
                "priority": 0,
                "delayExecute": false,
                "multiExecute": false,
                "data": [
                    {
                        "type": "show"
                    }
                ]
            }
        },
        "0,1": {
            "0": {
                "condition": "flag:星光杖魔法===3",
                "currentFloor": true,
                "priority": 0,
                "delayExecute": false,
                "multiExecute": false,
                "data": [
                    "三种水晶的力量依次开启，\n被封印的力量正在缓慢释放……",
                    {
                        "type": "animate",
                        "name": "starwithmoon",
                        "loc": [
                            7,
                            7
                        ]
                    },
                    {
                        "type": "setBlock",
                        "number": "I352",
                        "loc": [
                            [
                                7,
                                7
                            ]
                        ]
                    }
                ]
            }
        }
    },
    "cannotMove": {},
    "cannotMoveIn": {},
    "map": [
    [20030,20030,20030,20030,20030,20030,20030,20030,20030,20030,20030,20030,20030,20030,20030],
    [20030,20425,20030,432,  0,432,20030,483,  0,483,20030,279,  0,279,20030],
    [20030,  0,20030,  0,491,  0,20030,  0,493,  0,20030,  0,492,  0,20030],
    [20030,  0,20030,432,  0,432,20030,483,  0,483,20030,279,  0,279,20030],
    [20030, 21,20030,20030, 85,20030,20030,20030, 85,20030,20030,20030, 85,20030,20030],
    [20030,  0,20030, 21, 34,  0,444,  0,495,  0,444,  0, 34, 21,20030],
    [20030, 22,20030, 86,20030,20030,20030,20030, 81,20030,20030,20030,20030, 82,20030],
    [20030,  0,20030,227,  0, 21,20030,  0,279,  0,437,20030,  0, 30,20030],
    [20030,  0,20030,  0, 21,429,20030, 33,  0,437,453,20030,432,  0,20030],
    [20030, 33,20030,20030,20030, 81,20030, 81,20030,20030,20030,20030, 86,20030,20030],
    [20030,  0,20030,  0,437,  0,20030,279,  0, 29,467,20030,  0, 30,20030],
    [20030,  0,20030, 82,20030,20030,20030,20030,20030,20030, 86,20030, 58,  0,20030],
    [20030,  0,20030,  0, 81,228,20030,228, 81, 30,  0,20030,20247,467,20030],
    [20030,420,20030,488,20030,  0, 81,  0,20030,  0,432, 86, 29,  0,20030],
    [20030,20030,20030,20030,20030,20030,20030,20030,20030,20030,20030,20030,20030,20030,20030]
],
    "bgmap": [

],
    "fgmap": [

],
    "bgm": "The_Swamp_Troll.mp3",
    "upFloor": [
        1,
        1
    ],
    "downFloor": [
        1,
        13
    ]
}