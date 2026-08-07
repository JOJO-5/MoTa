main.floors.MT25=
{
    "floorId": "MT25",
    "title": "主塔 25 层",
    "name": "主塔 25 层",
    "width": 15,
    "height": 15,
    "canFlyTo": true,
    "canFlyFrom": false,
    "canUseQuickShop": true,
    "cannotViewMap": false,
    "cannotMoveDirectly": false,
    "images": [],
    "ratio": 1,
    "defaultGround": "X10025",
    "firstArrive": [],
    "eachArrive": [],
    "parallelDo": "",
    "events": {
        "7,9": {
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
            "data": []
        },
        "5,1": {
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
            "data": []
        },
        "7,6": {
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
                "\t[史莱姆皇,E337]有两下子，竟能找到这个地方。\n想必我的孪生兄弟已经被你给揍惨了。",
                "\t[菲利安,hero]哦，原来那是你兄弟啊，我说长那么像。\n不过，你们史莱姆族还真是本事不大话却很多。",
                "\t[史莱姆皇,E337]呵，个头不大，还是个女孩，口气倒不小。\n作为整个史莱姆族的统领，我当然不能被你看扁了！",
                "\t[菲利安,hero]……\n（不屑的眼神）",
                "\t[史莱姆皇,E337]你这眼神什么意思啊！\n好，既然这样……",
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
                    "name": "heal2"
                },
                {
                    "type": "animate",
                    "name": "darkness2"
                },
                {
                    "type": "battle",
                    "id": "E337"
                },
                {
                    "type": "setBlock",
                    "number": "I452",
                    "loc": [
                        [
                            5,
                            6
                        ]
                    ]
                },
                {
                    "type": "setBlock",
                    "number": "I452",
                    "loc": [
                        [
                            9,
                            6
                        ]
                    ]
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
                    "number": "I451",
                    "loc": [
                        [
                            7,
                            4
                        ]
                    ]
                },
                {
                    "type": "setBlock",
                    "number": "I451",
                    "loc": [
                        [
                            7,
                            3
                        ]
                    ]
                },
                {
                    "type": "show",
                    "loc": [
                        [
                            7,
                            9
                        ]
                    ]
                },
                {
                    "type": "show",
                    "loc": [
                        [
                            5,
                            1
                        ]
                    ]
                },
                {
                    "type": "show",
                    "loc": [
                        [
                            7,
                            9
                        ]
                    ],
                    "floorId": "MT24"
                },
                {
                    "type": "setFloor",
                    "name": "canFlyFrom",
                    "floorId": "MT25",
                    "value": true
                },
                "\t[史莱姆皇,E337]…………………………",
                "\t[菲利安,hero]就这水平，还真就坐实了我的看法。",
                "\t[史莱姆皇,E337]真的是这样吗？\n我虽然大意了败在了你的手上，可整个史莱姆族没有！\n后面你就会领教到我们族的可怕之处了！",
                {
                    "type": "hide",
                    "remove": true,
                    "time": 600
                },
                "\t[菲利安,hero]头领都没了，还能玩出什么新的花样吗？\n都是些本事不大但嘴硬的家伙……"
            ]
        }
    },
    "changeFloor": {
        "7,9": {
            "floorId": ":before"
        },
        "5,1": {
            "floorId": "JX24",
            "loc": [
                5,
                1
            ]
        }
    },
    "beforeBattle": {},
    "afterBattle": {},
    "afterGetItem": {},
    "afterOpenDoor": {},
    "autoEvent": {},
    "cannotMove": {},
    "cannotMoveIn": {},
    "map": [
    [20030,20030,20030,20030,20030,20030,20030,20030,20030,20030,20030,20030,20030,20030,20030],
    [20030,  4,  4,  4,20030,20433,  0,11098,  0,  0,20030,  4,  4,  4,20030],
    [20030,  4,  4,  4,20030,20030,20030,  0,20030,20030,20030,  4,  4,  4,20030],
    [20030,  4,  4,  4,  4,  4,20030,  0,20030,  4,  4,  4,  4,  4,20030],
    [20030,  4,  4,  4,  4,  4,20030,  0,20030,  4,  4,  4,  4,  4,20030],
    [20030,  4,  4,  4,20030,20030,20030,  0,20030,20030,20030,  4,  4,  4,20030],
    [20030,  4,  4,  4,20030,20291,  0,337,  0,20291,20030,  4,  4,  4,20030],
    [20030,  4,  4,  4,20030,20030, 27, 34, 28,20030,20030,  4,  4,  4,20030],
    [20030,  4,  4,  4,  4,20030,20030,  0,20030,20030,  4,  4,  4,  4,20030],
    [20030,  4,  4,  4,  4,  4,20030,20432,20030,  4,  4,  4,  4,  4,20030],
    [20030,  4,  4,  4,  4,  4,20030,20030,20030,  4,  4,  4,  4,  4,20030],
    [20030,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,20030],
    [20030,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,20030],
    [20030,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,20030],
    [20030,20030,20030,20030,20030,20030,20030,20030,20030,20030,20030,20030,20030,20030,20030]
],
    "bgmap": [

],
    "fgmap": [

],
    "bgm": "Final_Confrontation.mp3",
    "upFloor": [
        9,
        1
    ],
    "downFloor": [
        7,
        9
    ]
}