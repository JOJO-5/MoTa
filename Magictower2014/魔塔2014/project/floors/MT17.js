main.floors.MT17=
{
    "floorId": "MT17",
    "title": "主塔 17 层",
    "name": "主塔 17 层",
    "width": 15,
    "height": 15,
    "canFlyTo": true,
    "canFlyFrom": true,
    "canUseQuickShop": true,
    "cannotViewMap": false,
    "cannotMoveDirectly": false,
    "images": [],
    "ratio": 1,
    "defaultGround": "X10025",
    "firstArrive": [
        {
            "type": "if",
            "condition": "(flag:hard<=2)",
            "true": [
                {
                    "type": "setBlock",
                    "number": "I452",
                    "loc": [
                        [
                            11,
                            11
                        ]
                    ]
                },
                {
                    "type": "setBlock",
                    "number": "I452",
                    "loc": [
                        [
                            13,
                            11
                        ]
                    ]
                },
                {
                    "type": "setBlock",
                    "number": "I452",
                    "loc": [
                        [
                            11,
                            13
                        ]
                    ]
                },
                {
                    "type": "setBlock",
                    "number": "I452",
                    "loc": [
                        [
                            13,
                            13
                        ]
                    ]
                }
            ]
        }
    ],
    "eachArrive": [],
    "parallelDo": "",
    "events": {
        "0,1": {
            "trigger": null,
            "enable": true,
            "noPass": null,
            "displayDamage": true,
            "opacity": 0,
            "filter": {
                "blur": 0,
                "hue": 0,
                "grayscale": 0,
                "invert": false,
                "shadow": 0
            },
            "data": []
        },
        "7,0": {
            "trigger": null,
            "enable": true,
            "noPass": null,
            "displayDamage": true,
            "opacity": 0,
            "filter": {
                "blur": 0,
                "hue": 0,
                "grayscale": 0,
                "invert": false,
                "shadow": 0
            },
            "data": []
        },
        "12,12": {
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
                {
                    "type": "hide",
                    "remove": true
                },
                {
                    "type": "changeFloor",
                    "floorId": "MT26",
                    "loc": [
                        7,
                        14
                    ]
                },
                {
                    "type": "comment",
                    "text": "单次传送阵需要先消失再执行楼层切换"
                }
            ]
        }
    },
    "changeFloor": {
        "0,1": {
            "floorId": ":before"
        },
        "7,0": {
            "floorId": ":next"
        }
    },
    "beforeBattle": {},
    "afterBattle": {
        "1,7": [
            {
                "type": "setValue",
                "name": "flag:door_MT17_2_10",
                "operator": "+=",
                "value": "1"
            }
        ],
        "3,7": [
            {
                "type": "setValue",
                "name": "flag:door_MT17_2_10",
                "operator": "+=",
                "value": "1"
            }
        ],
        "2,8": [
            {
                "type": "setValue",
                "name": "flag:door_MT17_2_10",
                "operator": "+=",
                "value": "1"
            }
        ],
        "1,9": [
            {
                "type": "setValue",
                "name": "flag:door_MT17_2_10",
                "operator": "+=",
                "value": "1"
            }
        ],
        "3,9": [
            {
                "type": "setValue",
                "name": "flag:door_MT17_2_10",
                "operator": "+=",
                "value": "1"
            }
        ],
        "7,7": [
            {
                "type": "setValue",
                "name": "flag:door_MT17_8_10",
                "operator": "+=",
                "value": "1"
            }
        ],
        "9,7": [
            {
                "type": "setValue",
                "name": "flag:door_MT17_8_10",
                "operator": "+=",
                "value": "1"
            }
        ],
        "8,8": [
            {
                "type": "setValue",
                "name": "flag:door_MT17_8_10",
                "operator": "+=",
                "value": "1"
            }
        ],
        "7,9": [
            {
                "type": "setValue",
                "name": "flag:door_MT17_8_10",
                "operator": "+=",
                "value": "1"
            }
        ],
        "9,9": [
            {
                "type": "setValue",
                "name": "flag:door_MT17_8_10",
                "operator": "+=",
                "value": "1"
            }
        ],
        "11,9": [
            {
                "type": "setValue",
                "name": "flag:door_MT17_12_10",
                "operator": "+=",
                "value": "1"
            }
        ],
        "13,9": [
            {
                "type": "setValue",
                "name": "flag:door_MT17_12_10",
                "operator": "+=",
                "value": "1"
            }
        ],
        "12,8": [
            {
                "type": "setValue",
                "name": "flag:door_MT17_12_10",
                "operator": "+=",
                "value": "1"
            }
        ],
        "11,7": [
            {
                "type": "setValue",
                "name": "flag:door_MT17_12_10",
                "operator": "+=",
                "value": "1"
            }
        ],
        "13,7": [
            {
                "type": "setValue",
                "name": "flag:door_MT17_12_10",
                "operator": "+=",
                "value": "1"
            }
        ]
    },
    "afterGetItem": {},
    "afterOpenDoor": {},
    "autoEvent": {
        "2,10": {
            "0": {
                "condition": "flag:door_MT17_2_10==5",
                "currentFloor": true,
                "priority": 0,
                "delayExecute": false,
                "multiExecute": false,
                "data": [
                    {
                        "type": "openDoor"
                    },
                    {
                        "type": "setValue",
                        "name": "flag:door_MT17_2_10",
                        "operator": "=",
                        "value": "null"
                    }
                ]
            }
        },
        "8,10": {
            "0": {
                "condition": "flag:door_MT17_8_10==5",
                "currentFloor": true,
                "priority": 0,
                "delayExecute": false,
                "multiExecute": false,
                "data": [
                    {
                        "type": "openDoor"
                    },
                    {
                        "type": "setValue",
                        "name": "flag:door_MT17_8_10",
                        "operator": "=",
                        "value": "null"
                    }
                ]
            }
        },
        "12,10": {
            "0": {
                "condition": "flag:door_MT17_12_10==5",
                "currentFloor": true,
                "priority": 0,
                "delayExecute": false,
                "multiExecute": false,
                "data": [
                    {
                        "type": "openDoor"
                    },
                    {
                        "type": "setValue",
                        "name": "flag:door_MT17_12_10",
                        "operator": "=",
                        "value": "null"
                    }
                ]
            }
        }
    },
    "cannotMove": {},
    "cannotMoveIn": {},
    "map": [
    [  4,  4,  4,  4,  4,  4,  4, 87,  4,  4,  4,  4,  4,  4,  4],
    [ 88,  0, 34,  0,211,  4,  4,  0,  4,  4,272,  0, 30,452,  4],
    [  4,  4,  4,  4, 81,  4,  4, 82,  4,  4, 81,  4,  4,  4,  4],
    [  4, 27,  0, 31,  0, 21,  0,214,  0, 21,  0, 32,  0, 28,  4],
    [  4,  4,  4,  4,  4,  4,  4, 84,  4,  4,  4,  4,  4,  4,  4],
    [  4,453,  0, 21,  0,  0,218,  0,218,  0,  0, 21,  0,453,  4],
    [  4,  4, 81,  4,  4,214,  4,  4, 81,  4,  4,  4, 81,  4,  4],
    [  4,462,  0,462,  4, 82,  4,374,  0,374,  4,424,  0,424,  4],
    [  4,  0,374,  0,  4,272,  4,  0,424,  0,  4,  0,234,  0,  4],
    [  4,462,  0,462,  4,  0,  4,374,  0,374,  4,424,  0,424,  4],
    [  4,  4, 85,  4,  4,  0,  4,  4, 85,  4,  4,  4, 85,  4,  4],
    [  4, 27,  0, 27,  4,455,  4, 28,  0, 28,  4,451,  0,451,  4],
    [  4,  0,451,  0,  4,456,  4,  0, 33,  0,  4,  0,367,  0,  4],
    [  4, 27,  0, 27,  4,452,  4, 28,  0, 28,  4,451,  0,451,  4],
    [  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4]
],
    "bgmap": [
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,10255,  0,  0,  0,  0,  0,10247,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]
],
    "fgmap": [
    [10382,465,  0,  0,  0,  0,10374,  0,10374,  0,  0,  0,  0,  0,  0],
    [10374,  0,  0,  0,  0,  0,10382,  0,10382,  0,  0,  0,  0,  0,  0],
    [10382,465,  0,  0,  0,  0,465,  0,465,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]
],
    "bgm": "Besieged_Village.mp3",
    "upFloor": [
        7,
        0
    ],
    "downFloor": [
        0,
        1
    ]
}