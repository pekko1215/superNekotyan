controlRerquest("data/control.smr", main)

function main() {
    window.scrollTo(0, 0);

    var notplaypaysound = false;

    slotmodule.on("allreelstop", function(e) {
        if (e.hits != 0) {
            if (e.hityaku.length == 0)
                return
            var matrix = e.hityaku[0].matrix;
            var count = 0;
            slotmodule.once("bet", function() {
                slotmodule.clearFlashReservation()
            })
            if (e.hityaku[0].name.indexOf("Dummy") != -1 ||
                e.hityaku[0].name.indexOf("1枚役") != -1) {
                notplaypaysound = true;
            } else {
                notplaypaysound = false;
                if (e.hityaku[0].name === "ボーナス") {
                } else {
                    slotmodule.setFlash(null, 0, function(e) {
                        slotmodule.setFlash(flashdata.default, 20)
                        slotmodule.setFlash(replaceMatrix(flashdata.default, matrix, colordata.LINE_F, null), 20, arguments.callee)
                    })
                }
            }
        }
        if (e.hits == 0 && jacflag && gamemode == "big") {
            slotmodule.setFlash(flashdata.syoto)
            slotmodule.once('bet', function() {
                slotmodule.clearFlashReservation()
            })
        }
        if (gamemode == "big") {
            bonusdata.bonusgame--;
            changeBonusSeg()
        }

        if (gamemode == "jac" || gamemode == "reg") {
            bonusdata.jacgamecount--;
            changeBonusSeg()
        }

        replayflag = false;
        var nexter = true;

        e.hityaku.forEach(function(d) {
            var matrix = d.matrix;
            switch (gamemode) {
                case 'normal':
                    switch (d.name) {
                        case "7BIG":
                        case "ネコBIG":
                            var bgmData = {
                                "7BIG": {
                                    tag: "7BIG",
                                    loopStart: 0
                                },
                                "ネコBIG": {
                                    tag: "ネズミBIG",
                                    loopStart: 8.013
                                }
                            }
                            sounder.stopSound("bgm");
                            setGamemode('big');
                            sounder.playSound(bgmData[d.name].tag, true, null, bgmData[d.name].loopStart)
                            bonusdata = {
                                bonusget: 360,
                                geted: 0
                            }
                            bonusflag = "none";
                            changeBonusSeg()
                            clearLamp()
                            break;
                        case "REG":
                            setGamemode('reg');
                            sounder.stopSound("bgm");
                            sounder.playSound("reg", true);
                            bonusdata = {
                                bonusget: 120,
                                geted: 0
                            }
                            changeBonusSeg();
                            bonusflag = "none";
                            clearLamp()
                            break;
                        case "チェリー":
                            matrix = matrix.map((arr) => {
                                arr[1] = 0;
                                arr[2] = 0;
                                return arr;
                            })
                            slotmodule.setFlash(null, 0, function(e) {
                                slotmodule.setFlash(flashdata.default, 20)
                                slotmodule.setFlash(replaceMatrix(flashdata.default, matrix, colordata.LINE_F, null), 20, arguments.callee)
                            })
                            break;
                        case "リプレイ":
                            replayflag = true;
                            break;
                    }

                    break;
                case 'big':
                    if (d.name == "JACIN") {
                        setGamemode('jac');
                        bonusdata.jacincount--;
                        bonusdata.jacgamecount = 8;
                        bonusdata.jacgetcount = 8;
                        jacflag = false
                    }
                    switch (d.name) {
                        case "チェリー":
                            sounder.playSound("pay", true);
                            setTimeout(() => { sounder.stopSound("pay") }, 300)
                            matrix = matrix.map((arr) => {
                                arr[1] = 0;
                                arr[2] = 0;
                                return arr;
                            })
                            slotmodule.setFlash(null, 0, function(e) {
                                slotmodule.setFlash(flashdata.default, 20)
                                slotmodule.setFlash(replaceMatrix(flashdata.default, matrix, colordata.LINE_F, null), 20, arguments.callee)
                            })
                            slotmodule.freeze()
                            var fflag = true;
                            slotmodule.once("pressAllmity", () => {
                                if (fflag) {
                                    sounder.playSound("3bet")
                                    fflag = false
                                    slotmodule.resume()
                                }
                            })
                            slotmodule.once("pressLever", () => {
                                if (fflag) {
                                    sounder.playSound("3bet")
                                    fflag = false
                                    slotmodule.resume()
                                }
                            })
                        case "リプレイ":
                            replayflag = true;
                    }
                    changeBonusSeg()
                    break;
                case 'reg':
                case 'jac':
                    if (d.name === "JACGAME") {
                        slotmodule.clearFlashReservation()
                        var matrix = [
                            [1, 0, 0],
                            [0, 1, 0],
                            [0, 0, 1]
                        ];
                        if (slotmodule.getReelPos(0) == 13) {
                            matrix = matrix.map((arr) => {
                                arr[1] = 0;
                                arr[2] = 0;
                                return arr;
                            })
                        }
                        slotmodule.setFlash(null, 0, function(e) {
                            slotmodule.setFlash(flashdata.default, 20)
                            slotmodule.setFlash(replaceMatrix(flashdata.default, matrix, colordata.LINE_F, null), 20, arguments.callee)
                        })
                    }
                    bonusdata.jacgetcount--;
                    changeBonusSeg()
            }
        })
        if ((gamemode == "reg" || gamemode == 'jac' || gamemode == "big") && bonusdata.bonusgame == 0) {
            setGamemode('normal');
            sounder.stopSound("bgm")
            segments.effectseg.reset();
            slotmodule.once("payend", function() {})
        }
        if (gamemode == "reg" || gamemode == 'jac') {
            if (bonusdata.jacgamecount == 0 || bonusflag.jacgetcount == 0) {
                setGamemode('big');
            }
        }

        if (nexter) {
            e.stopend()
        }
    })

    slotmodule.on("payend", function() {
        if (gamemode != "normal") {
            if (bonusdata.geted >= bonusdata.bonusget) {
                slotmodule.emit("bonusend");
                setGamemode("normal")
                sounder.stopSound("bgm")

            }
        }
    })
    slotmodule.on("leveron", function() {

    })

    slotmodule.on("bet", function(e) {
        sounder.playSound("3bet")
        if ("coin" in e) {
            (function(e) {
                var thisf = arguments.callee;
                if (e.coin > 0) {
                    coin--;
                    e.coin--;
                    incoin++;
                    changeCredit(-1);
                    setTimeout(function() {
                        thisf(e)
                    }, 100)
                } else {
                    e.betend();
                }
            })(e)
        }
        if (gamemode == "jac") {
            segments.payseg.setSegments(bonusdata.jacgamecount)
        } else {
            segments.payseg.reset();
        }
    })

    slotmodule.on("pay", function(e) {
        var pays = e.hityaku.pay;
        var arg = arguments;
        if (!("paycount" in e)) {
            e.paycount = 0
            replayflag || notplaypaysound || (pays > 1 && sounder.playSound("pay", true));
        }
        if (pays == 0) {
            if (replayflag) {
                sounder.playSound("replay", false, function() {
                    e.replay();
                    slotmodule.emit("bet", e.playingStatus);
                });
            } else {
                e.payend()
                sounder.stopSound("pay")
                if (e.isPay) { sounder.playSound("pay") }
            }
        } else {
            e.isPay = true
            e.hityaku.pay--;
            coin++;
            e.paycount++;
            outcoin++;
            if (gamemode != "normal") {
                bonusdata.geted++;
                changeBonusSeg();
            }
            changeCredit(1);
            segments.payseg.setSegments(e.paycount);
            sounder.stopSound('pay')
            replayflag || notplaypaysound ||  sounder.playSound("pay", true)
            setTimeout(function() {
                arg.callee(e)
            }, 70)
        }
    })

    var jacflag = false;

    slotmodule.on("lot", function(e) {
        var ret = -1;
        switch (gamemode) {
            case "normal":
                var lot = normalLotter.lot().name

                lot = window.power || lot;
                window.power = undefined

                switch (lot) {
                    case "リプレイ":
                        ret = lot
                        break;
                    case "ベル":
                        ret = lot;
                        if(rand(3)==0){
                            ret = "チェリー"+(1+rand(2))
                        }
                        if(bonusflag != "none"){
                            ret = "チェリー重複"
                        }
                        break;
                    case "BIG":
                        if (bonusflag == "none") {
                            if(rand(4)<3){
                                ret = "BIG1"
                            }else{
                                ret = "チェリー重複"
                            }
                            bonusflag = "BIG1"
                        } else {
                            ret = bonusflag;
                        }
                        break;
                    case "REG":
                        if (bonusflag == "none") {
                            if(rand(4)<3){
                                ret = "REG1"
                            }else{
                                ret = "チェリー重複"
                            }
                            bonusflag = "REG1"
                        } else {
                            ret = bonusflag;
                        }
                        break;
                    default:
                        if(bonusflag != "none"){
                            ret = bonusflag
                        }else{
                            ret = "はずれ"
                        }
                }

                break;
            case "big":
            case "reg":
            case "jac":
                ret = "ボーナス"
                break;
        }
        effect(ret);
        console.log(ret)
        return ret;
    })

    slotmodule.on("reelstop", function() {
        sounder.playSound("stop")
    })

    $("#saveimg").click(function() {
        SaveDataToImage();
    })

    $("#cleardata").click(function() {
        if (confirm("データをリセットします。よろしいですか？")) {
            ClearData();
        }
    })

    $("#loadimg").click(function() {
        $("#dummyfiler").click();
    })

    $("#dummyfiler").change(function(e) {

        var file = this.files[0];

        var image = new Image();
        var reader = new FileReader();
        reader.onload = function(evt) {
            image.onload = function() {
                var canvas = $("<canvas></canvas>")
                canvas[0].width = image.width;
                canvas[0].height = image.height;
                var ctx = canvas[0].getContext('2d');
                ctx.drawImage(image, 0, 0)
                var imageData = ctx.getImageData(0, 0, canvas[0].width, canvas[0].height)
                var loadeddata = SlotCodeOutputer.load(imageData.data);
                if (loadeddata) {
                    parseSaveData(loadeddata)
                    alert("読み込みに成功しました")
                } else {
                    alert("データファイルの読み取りに失敗しました")
                }
            }
            image.src = evt.target.result;
        }
        reader.onerror = function(e) {
            alert("error " + e.target.error.code + " \n\niPhone iOS8 Permissions Error.");
        }
        reader.readAsDataURL(file)
    })

    slotmodule.on("reelstart", function() {
        if (okure) {
            setTimeout(function() {
                sounder.playSound("start")
            }, 100)
        } else {
            sounder.playSound("start")
        }
        okure = false;
    })
    var okure = false;
    var sounder = new Sounder();

    sounder.addFile("sound/stop.wav", "stop").addTag("se");
    sounder.addFile("sound/start.wav", "start").addTag("se");
    sounder.addFile("sound/bet.wav", "3bet").addTag("se");
    sounder.addFile("sound/pay.wav", "pay").addTag("se");
    sounder.addFile("sound/replay.wav", "replay").addTag("se");
    sounder.addFile("sound/7BIG.wav", "7BIG").addTag("bgm")
    sounder.addFile("sound/VBIG.wav", "VBIG").addTag("bgm")
    sounder.addFile("sound/nezumiBIG.wav", "ネズミBIG").addTag("bgm")
    sounder.addFile("sound/handtohand.mp3", "hand").addTag("voice").addTag("se");
    sounder.addFile("sound/JACNABI.wav", "jacnabi").addTag("se");
    sounder.addFile("sound/big1hit.wav", "big1hit").addTag("se");
    sounder.addFile("sound/CT1.mp3", "ct1").addTag("bgm");
    sounder.addFile("sound/ctstart.wav", "ctstart").addTag("se");
    sounder.addFile("sound/yattyare.wav", "yattyare").addTag("voice").addTag("se");
    sounder.addFile("sound/delive.wav", "delive").addTag("voice").addTag("se");
    sounder.addFile("sound/reg.wav", "reg").addTag("bgm");
    sounder.addFile("sound/big2.mp3", "big2").addTag("bgm");
    sounder.addFile("sound/reglot.mp3", "reglot").addTag("se");
    sounder.addFile("sound/bigselect.mp3", "bigselect").addTag("se")
    sounder.addFile("sound/syoto.mp3", "syoto").addTag("se")
    sounder.addFile("sound/kokutise.mp3", "kokutise").addTag("se");
    sounder.addFile("sound/widgetkokuti.mp3", "widgetkokuti").addTag("voice").addTag("se");

    sounder.addFile("sound/bpay.wav", "bpay").addTag("se").setVolume(0.5);
    sounder.setVolume("se",0.2)
    sounder.setVolume("bgm",0.5)
    sounder.loadFile(function() {
        window.sounder = sounder
        console.log(sounder)
    })

    var normalLotter = new Lotter(lotdata.normal);
    var bigLotter = new Lotter(lotdata.big);
    var jacLotter = new Lotter(lotdata.jac);


    var black = false;
    if (black) {
        var stock = {
            big: 0,
            reg: 0,
            rt: null
        };
        var zyotai = false;
        normalLotter.pipe(function(lot) {
            switch (lot.name) {
                case "BIG":
                    if (rand(2) == 0) {
                        zyotai = true;
                        stock.rt = rand(32) + 1;
                    } else {
                        lot.name = null
                        stock.big++;
                    }
                    break;
            }
            if (zyotai) {
                if (bonusflag == "none") {
                    if (stock.rt == null) {
                        zyotai = false;
                    } else {
                        stock.rt--;
                        if (stock.rt == 0) {
                            if (rand(2) == 0) {
                                stock.rt = rand(32) + 1;
                            } else {
                                stock.rt = null;
                            }
                            if (rand(3) != 0) {
                                lot.name = "BIG"
                            } else {
                                lot.name = "REG"
                                stock.rt = rand(32) + 1;
                            }
                        }
                    }
                }
            }
            return lot
        })
    }

    var gamemode = "normal";
    var bonusflag = "none"
    var coin = 0;

    var bonusdata;
    var replayflag;

    var isCT = false;
    var CTBIG = false;
    var isSBIG;
    var ctdata = {};
    var regstart;

    var afterNotice;
    var bonusSelectIndex;
    var ctNoticed;

    var playcount = 0;
    var allplaycount = 0;

    var incoin = 0;
    var outcoin = 0;

    var bonuscounter = {
        count: {},
        history: []
    };

    slotmodule.on("leveron", function() {

        if (gamemode == "normal") {
            playcount++;
            allplaycount++;
        } else {
            if (playcount != 0) {
                bonuscounter.history.push({
                    bonus: gamemode,
                    game: playcount
                })
                playcount = 0;
            }
        }
        changeCredit(0)
    })

    function stringifySaveData() {
        return {
            coin: coin,
            playcontroldata: slotmodule.getPlayControlData(),
            bonuscounter: bonuscounter,
            incoin: incoin,
            outcoin: outcoin,
            playcount: playcount,
            allplaycount: allplaycount,
            name: "ゲッター7",
            id: "getter7"
        }
    }

    function parseSaveData(data) {
        coin = data.coin;
        // slotmodule.setPlayControlData(data.playcontroldata)
        bonuscounter = data.bonuscounter
        incoin = data.incoin;
        outcoin = data.outcoin;
        playcount = data.playcount;
        allplaycount = data.allplaycount
        changeCredit(0)
    }

    window.SaveDataToImage = function() {
        SlotCodeOutputer.save(stringifySaveData())
    }

    window.SaveData = function() {
        if (gamemode != "normal" || isCT) {
            return false;
        }
        var savedata = stringifySaveData()
        localStorage.setItem("savedata", JSON.stringify(savedata))
        return true;
    }

    window.LoadData = function() {
        if (gamemode != "normal" || isCT) {
            return false;
        }
        var savedata = localStorage.getItem("savedata")
        try {
            var data = JSON.parse(savedata)
            parseSaveData(data)
            changeCredit(0)
        } catch (e) {
            return false;
        }
        return true;
    }

    window.ClearData = function() {
        coin = 0;
        bonuscounter = {
            count: {},
            history: []
        };
        incoin = 0;
        outcoin = 0;
        playcount = 0;
        allplaycount = 0;

        SaveData();
        changeCredit(0)
    }


    var setGamemode = function(mode) {
        switch (mode) {
            case 'normal':
                gamemode = 'normal'
                slotmodule.setLotMode(0)
                slotmodule.setMaxbet(3);
                isSBIG = false
                break;
            case 'big':
                gamemode = 'big';
                slotmodule.once("payend", function() {
                    slotmodule.setLotMode(2)
                });
                slotmodule.setMaxbet(2);
                break;
            case 'reg':
                gamemode = 'reg';
                slotmodule.once("payend", function() {
                    slotmodule.setLotMode(2)
                });
                slotmodule.setMaxbet(2);
                break;
            case 'jac':
                gamemode = 'jac';
                slotmodule.once("payend", function() {
                    slotmodule.setLotMode(2)
                });
                slotmodule.setMaxbet(2);
                break;
        }
    }

    var segments = {
        creditseg: segInit("#creditSegment", 2),
        payseg: segInit("#paySegment", 2),
        effectseg: segInit("#effectSegment", 4)
    }

    var credit = 50;
    segments.creditseg.setSegments(50);
    segments.creditseg.setOffColor(80, 30, 30);
    segments.payseg.setOffColor(80, 30, 30);
    segments.creditseg.reset();
    segments.payseg.reset();


    var lotgame;

    function changeCredit(delta) {
        credit += delta;
        if (credit < 0) {
            credit = 0;
        }
        if (credit > 50) {
            credit = 50;
        }
        $(".GameData").text("差枚数:" + coin + "枚  ゲーム数:" + playcount + "G  総ゲーム数:" + allplaycount + "G")
        segments.creditseg.setSegments(credit)
    }

    function changeBonusSeg() {
        var tmp = bonusdata.bonusget - bonusdata.geted
        if(tmp<0){
            tmp = 0;
        }
        segments.effectseg.setSegments(""+tmp);

    }

    function changeCTGameSeg() {
        segments.effectseg.setOnColor(230, 0, 0);
        segments.effectseg.setSegments(ctdata.ctgame);
    }

    function changeCTCoinSeg() {
        segments.effectseg.setOnColor(50, 100, 50);
        segments.effectseg.setSegments(200 + ctdata.ctstartcoin - coin);
    }

    var LampInterval = {
        right: -1,
        left: -1,
        counter: {
            right: true,
            left: false
        }
    }

    function setLamp(flags, timer) {
        flags.forEach(function(f, i) {
            if (!f) {
                return
            }
            LampInterval[["left", "right"][i]] = setInterval(function() {
                if (LampInterval.counter[["left", "right"][i]]) {
                    $("#" + ["left", "right"][i] + "neko").css({
                        filter: "brightness(200%)"
                    })
                } else {
                    $("#" + ["left", "right"][i] + "neko").css({
                        filter: "brightness(100%)"
                    })
                }
                LampInterval.counter[["left", "right"][i]] = !LampInterval.counter[["left", "right"][i]];
            }, timer)
        })
    }

    function clearLamp() {
        clearInterval(LampInterval.right);
        clearInterval(LampInterval.left);
        ["left", "right"].forEach(function(i) {
            $("#" + i + "neko").css({
                filter: "brightness(100%)"
            })
        })

    }


    function effect(lot) {}


    $(window).bind("unload", function() {
        SaveData();
    });

    LoadData();
}

function and() {
    return Array.prototype.slice.call(arguments).every(function(f) {
        return f
    })
}

function or() {
    return Array.prototype.slice.call(arguments).some(function(f) {
        return f
    })
}

function rand(m) {
    return Math.floor(Math.random() * m);
}

function replaceMatrix(base, matrix, front, back) {
    var out = JSON.parse(JSON.stringify(base));
    matrix.forEach(function(m, i) {
        m.forEach(function(g, j) {
            if (g == 1) {
                front && (out.front[i][j] = front);
                back && (out.back[i][j] = back);
            }
        })
    })
    return out
}

function flipMatrix(base) {
    var out = JSON.parse(JSON.stringify(base));
    return out.map(function(m) {
        return m.map(function(p) {
            return 1 - p;
        })
    })
}

function segInit(selector, size) {
    var cangvas = $(selector)[0];
    var sc = new SegmentControler(cangvas, size, 0, -3, 79, 46);
    sc.setOffColor(120, 120, 120)
    sc.setOnColor(230, 0, 0)
    sc.reset();
    return sc;
}