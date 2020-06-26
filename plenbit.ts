//plenbit.ts

/**
 * Blocks for PLEN:bit
 */
//% weight=100 color=#00A654 icon="\uf085" block="PLEN:bit"
namespace plenbit {
    export enum LedLr {
        //% block="A button side"
        AButtonSide = 8,
        //% block="B button side"
        BButtonSide = 16
    }
    export enum LedOnOff {
        //% block="on"
        On = 0,
        //% block="off"
        Off = 1
    }
    export enum StdMotions {
        //% block="Walk Forward"
        WalkForward = 0x46,
        //% block="Walk Left Turn"
        WalkLTurn = 0x47,
        //% block="Walk Right Turn"
        WalkRTurn = 0x48,
        //% block="Walk Back"
        WalkBack = 0x49,
        //% block="Left step"
        LStep = 0x00,
        //% block="Forward step"
        FStep = 0x01,
        //% block="Right step"
        RStep = 0x02,
        //% block="A hem"
        AHem = 0x03,
        //% block="Bow"
        Bow = 0x04,
        //% block="Propose"
        Propose = 0x05,
        //% block="Hug"
        Hug = 0x06,
        //% block="Clap"
        Clap = 0x07,
        //% block="Highfive"
        HighFive = 0x08,
        //% block="Arm PataPata"
        ArmPataPata = 0x29
    }

    export enum BoxMotions {
        ShakeABox = 0x0a,
        PickUpHigh = 0x0b,
        PickUpLow = 0x0c,
        ReceiveaBox = 0x0d,
        PresentaBox = 0x0e,
        PassaBox = 0x0f,
        ThrowaBox = 0x10,
        PutDownHigh = 0x11,
        PutDownLow = 0x12
    }
    export enum SocMotions {
        //% block="Defense Left Step"
        DefenseLStep = 0x14,
        //% block="Dribble"
        Dribble = 0x15,
        //% block="Defense Right Step"
        DefenseRStep = 0x16,
        //% block="Left Kick"
        LKick = 0x17,
        //% block="Long Dribble"
        LongDribble = 0x18,
        //% block="Right Kick"
        RKick = 0x19,
        //% block="Pass To Left"
        PassToLeft = 0x1a,
        //% block="Pass It To Me"
        PassItToMe = 0x1b,
        //% block="Pass To Right"
        PassToRight = 0x1c
    }
    export enum DanceMotions {
        //% block="Dance Left Step"
        DanceLStep = 0x1e,
        //% block="Dance Forward Step"
        DanceFStep = 0x1f,
        //% block="Dance Right Step"
        DanceRStep = 0x20,
        //% block="Dance Fisnish Pose"
        DanceFisnishPose = 0x21,
        //% block="Dance Up Down"
        DanceUpDown = 0x22,
        //% block="Wiggle Dance"
        WiggleDance = 0x23,
        //% block="Dance Back Step"
        DanceBStep = 0x24,
        //% block="Dance Bow"
        DanceBow = 0x25,
        //% block="Twist Dance"
        TwistDance = 0x26
    }
    enum MoveMotions {

    }

    let motionSpeed = 15;
    let servoNum = 0x08;
    //[1000, 900, 300, 900, 800, 900, 1500, 900];good angle
    export let servoSetInit = [1000, 630, 300, 600, 240, 600, 1000, 720];
    let servoAngle = [1000, 630, 300, 600, 240, 600, 1000, 720];
    let romAdr1 = 0x56;
    let initBle = false;
    let initPCA9865 = false;
    loadPos();
    eyeLed(LedOnOff.On);

    export function secretIncantation() {
        write8(0xFE, 0x85);//PRE_SCALE
        write8(0xFA, 0x00);//ALL_LED_ON_L
        write8(0xFB, 0x00);//ALL_LED_ON_H
        write8(0xFC, 0x66);//ALL_LED_OFF_L
        write8(0xFD, 0x00);//ALL_LED_OFF_H
        write8(0x00, 0x01);
    }

    //% blockId=PLEN:bit_Sensor
    //% block="read sensor %num"
    export function sensorLR(num: LedLr) {
        let neko = 0;
        if (num == 16) {
            neko = AnalogPin.P2;
        } else {
            neko = AnalogPin.P0;
        }
        return pins.analogReadPin(neko);
    }

    //% block
    export function direction() {
        return Math.atan2(input.magneticForce(Dimension.X), input.magneticForce(Dimension.Z)) * 180 / 3.14 + 180
    }

    //% blockId=PLEN:bit_servo
    //% block="servo motor %num|number %degrees|degrees"
    //% num.min=0 num.max=11
    //% degrees.min=0 degrees.max=180
    export function servoWrite(num: number, degrees: number) {
        if (initPCA9865 == false) {
            secretIncantation();
            initPCA9865 = true;
        }
        let highByte = false;
        let pwmVal = degrees * 100 * 226 / 10000;
        pwmVal = Math.round(pwmVal) + 0x66;
        if (pwmVal > 0xFF) {
            highByte = true;
        }
        write8(servoNum + num * 4, pwmVal);
        if (highByte) {
            write8(servoNum + num * 4 + 1, 0x01);
        } else {
            write8(servoNum + num * 4 + 1, 0x00);
        }
    }

    function write8(addr: number, d: number) {
        let cmd = pins.createBuffer(2);
        cmd[0] = addr;
        cmd[1] = d;
        pins.i2cWriteBuffer(0x6A, cmd, false);
    }

    //% blockId=PLEN:bit_motion_std
    //% block="play std motion %fileName"
    export function stdMotion(fileName: StdMotions) {
        motion(fileName);
    }
    //% blockId=PLEN:bit_motion_Soc
    //% block="play soccer motion %fileName"
    export function soccerMotion(fileName: SocMotions) {
        motion(fileName);
    }

    // blockId=PLEN:bit_motion_box
    // block="play box motion %fileName"
    export function boxMotion(fileName: BoxMotions) {
        motion(fileName);
    }

    //% blockId=PLEN:bit_motion_dan
    //% block="play dance motion %fileName"
    export function danceMotion(fileName: DanceMotions) {
        motion(fileName);
    }

    // blockId=PLEN:bit_motion_m
    // block="play move motion %fileName"
    export function moveMotion(fileName: MoveMotions) {
        motion(fileName);
    }

    //% blockId=PLEN:bit_motion
    //% block="play motion number %fileName"
    //% fileName.min=0 fileName.max=73
    //% advanced=true
    export function motion(fileName: number) {
        let data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let command = ">";//0x3e
        let listLen = 43;
        let readAdr = 0x32 + 860 * fileName;
        //serial.writeNumber(fileName)
        //serial.writeString(",fileName")
        //serial.writeNumber(readAdr)
        //serial.writeString(",adr")
        let error = 0;
        while (1) {
            if (error == 1) {
                break;
            }

            let mBuf = reep(readAdr, listLen);
            readAdr += listLen;
            if (mBuf[0] == 0xff) {
                break;
            }

            let mf = "";    //=null ?
            for (let i = 0; i < listLen; i++) {
                let num = mBuf.getNumber(NumberFormat.Int8LE, i);
                mf += numToHex(num);
            }
            //serial.writeString(",Nonull")
            let listNum = 0;
            while (listLen > listNum) {
                if (command != mf[listNum]) {
                    listNum += 1;
                    continue;
                } //serial.writeString(",>OK")
                listNum += 1; // >
                //serial.writeString(mf[listNum]);
                //serial.writeString(mf[listNum] + 1);
                if ("mf" != (mf[listNum] + mf[listNum + 1])) {
                    //if (0x4d != (mf[listNum])) {
                    listNum += 2;
                    continue;
                } //serial.writeString(",mfOK")
                listNum += 2; // MF

                //if (fileName != int((_mf[listNum] + _mf[listNum + 1]), 16)) {
                if (fileName != parseIntM(mf[listNum] + mf[listNum + 1])) {
                    error = 1;
                    break;
                }
                //serial.writeString(",fileOK")
                listNum += 4;// slot,flame

                let times = (mf[listNum] + mf[listNum + 1] + mf[listNum + 2] + mf[listNum + 3])
                let time = (parseIntM(times));
                listNum += 4;
                let val = 0;
                while (1) {
                    if ((listLen < (listNum + 4)) || (command == mf[listNum]) || (24 < val)) {
                        setAngle(data, time);
                        break;
                    }
                    let num = (mf[listNum] + mf[listNum + 1] + mf[listNum + 2] + mf[listNum + 3]);
                    let numHex = (parseIntM(num));
                    if (numHex >= 0x7fff) {
                        numHex = numHex - 0x10000;
                    } else {
                        numHex = numHex & 0xffff;
                    }
                    data[val] = numHex;
                    //serial.writeNumber(data[val]);
                    //serial.writeString(",")
                    val = val + 1;
                    listNum += 4;
                }
            }
        }
    }


    export function setAngle(angle: number[], msec: number) {
        let step = [0, 0, 0, 0, 0, 0, 0, 0];
        msec = msec / motionSpeed;//now 15//default 10; //speedy 20   Speed Adj
        for (let val = 0; val < 8; val++) {
            let target = (servoSetInit[val] - angle[val]);
            if (target != servoAngle[val]) {  // Target != Present
                step[val] = (target - servoAngle[val]) / (msec);
            }
        }
        for (let i = 0; i <= msec; i++) {
            for (let val = 0; val < 8; val++) {
                servoAngle[val] += step[val];
                servoWrite(val, (servoAngle[val] / 10));
            }
            //basic.pause(1); //Nakutei yoi
        }
        //for (let val = 0; val < 8; val++) {
        //    servoAngle[val] = angle[val];
        //    servoWrite(val, (servoAngle[val] / 10));
        //}
    }

    function hexToInt(num: number) {
        let i = 0;
        if (48 <= num && num <= 57) {
            i = num - 48;
        } else if (65 <= num && num <= 70) {
            i = num - 65 + 10;
        } else if (97 <= num && num <= 102) {
            i = num - 97 + 10;
        }
        return i;
    }

    function numToHex(num: number) {
        let i = "";
        if (48 <= num && num <= 57) {
            i = (num - 48).toString();
        } else if (62 <= num && num <= 77) {
            switch (num) {
                case 62: i = ">"; break;
                case 65: i = "a"; break;
                case 66: i = "b"; break;
                case 67: i = "c"; break;
                case 68: i = "d"; break;
                case 69: i = "e"; break;
                case 70: i = "f"; break;
                case 77: i = "m"; break;
                default: i = "";
            }
        } else if (97 <= num && num <= 102) {
            switch (num) {
                case 97: i = "a"; break;
                case 98: i = "b"; break;
                case 99: i = "c"; break;
                case 100: i = "d"; break;
                case 101: i = "e"; break;
                case 102: i = "f"; break;
                //case 109: i = "m"; break;
                default: i = "";
            }
        } else {
            //i = "m" + num.toString();
        }
        return i;
    }

    export function parseIntM(str: string) {
        let len = str.length;
        let num = [0, 0, 0, 0];
        for (let i = 0; i < len; i++) {
            switch (str[i]) {
                case "a": num[i] = 10; break;
                case "b": num[i] = 11; break;
                case "c": num[i] = 12; break;
                case "d": num[i] = 13; break;
                case "e": num[i] = 14; break;
                case "f": num[i] = 15; break;
                case "A": num[i] = 10; break;
                case "B": num[i] = 11; break;
                case "C": num[i] = 12; break;
                case "D": num[i] = 13; break;
                case "E": num[i] = 14; break;
                case "F": num[i] = 15; break;
                default:
                    num[i] = parseInt(str[i]);
                    break;
            }
        }
        let hex = 0;
        switch (len) {
            case 4:
                hex = (num[len - 4] * 0x1000);
            case 3:
                hex += (num[len - 3] * 0x0100);
            case 2:
                hex += (num[len - 2] * 0x0010);
            case 1:
                hex += (num[len - 1] * 0x0001);
        }
        return hex;
    }

    export function toString16(dec: number) {
        let val = [0, 0, 0, 0];
        let listHex = "";
        listHex = "0123456789ABCDEF";
        val[4] = Math.idiv(dec, 0x1000);
        val[3] = Math.idiv(dec - val[4] * 0x1000, 0x100);
        val[2] = Math.idiv(dec - val[4] * 0x1000 - val[3] * 0x100, 0x10);
        val[1] = dec - val[4] * 0x1000 - val[3] * 0x100 - val[2] * 0x10;
        return ("" + listHex.charAt(val[4]) + listHex.charAt(val[3]) + listHex.charAt(val[2]) + listHex.charAt(val[1]));
    }

    export function bufToStr(mBuf: Buffer) {
        let mf = "";    //=null ?
        for (let i = 0; i < mBuf.length; i++) {
            let num = mBuf.getNumber(NumberFormat.Int8LE, i);
            mf += numToHex(num);
        }
        return mf;
    }

    function weep(eepAdr: number, num: number) {
        let data = pins.createBuffer(3);
        data[0] = eepAdr >> 8;
        data[1] = eepAdr & 0xFF;
        data[2] = num;
        pins.i2cWriteBuffer(romAdr1, data);
        basic.pause(10);
        return 0;
    }

    // blockId=PLEN:bit_reep
    // block="readEEPROM %eepAdr| byte%num"
    // eepAdr.min=910 eepAdr.max=2000
    // num.min=0 num.max=43
    // advanced=true
    export function reep(eepAdr: number, num: number) {
        let data = pins.createBuffer(2);
        data[0] = eepAdr >> 8;
        data[1] = eepAdr & 0xFF;
        // need adr change code
        pins.i2cWriteBuffer(romAdr1, data);
        let value = (pins.i2cReadBuffer(romAdr1, num, false));
        return value;
    }

    //% block
    //% advanced=true
    export function savePositon(servoNum: number, adjustNum: number) {
        let adjStr = "";
        let adjStrTop = 0;
        let adjStrDown = 0;

        adjStr = toString16(servoSetInit[servoNum] + adjustNum);//1000->03e8

        if (3 == adjStr.length) {
            adjStr = 0 + adjStr;
        }
        adjStrTop = parseIntM(adjStr[0] + adjStr[1]); //03->3
        adjStrDown = parseIntM(adjStr[2] + adjStr[3]); //e8->232

        weep(servoNum * 2 + 2, adjStrTop);
        weep(servoNum * 2 + 3, adjStrDown);
        weep(0, 1);    //write flag
    }

    function loadPos() {
        let readBuf = reep(0x00, 1);
        if (readBuf[0] == 0x01) {
            readBuf = reep(0x02, 16);
            for (let i = 0; i < 8; i++) {
                let strRom1 = toString16(readBuf[i * 2]);
                let strRom2 = toString16(readBuf[i * 2 + 1]);
                servoSetInit[i] = parseIntM(strRom1[2] + strRom1[3] + strRom2[2] + strRom2[3]);
                servoAngle[i] = parseIntM(strRom1[2] + strRom1[3] + strRom2[2] + strRom2[3]);
            }
        }
    }
    
    //% block
    //% advanced=true
    export function resetPosition()
    {
        let adjStr = "";
        let adjStrTop = 0;
        let adjStrDown = 0;
        for (let servoNum = 0; servoNum < 8; servoNum++)
        {
            adjStr = toString16(servoSetInit[servoNum]);//1000->03e8
            if (3 == adjStr.length)
            {
                adjStr = 0 + adjStr;
            }
            adjStrTop = parseIntM(adjStr[0] + adjStr[1]); //03->3
            adjStrDown = parseIntM(adjStr[2] + adjStr[3]); //e8->232

            weep(servoNum * 2 + 2, adjStrTop);
            weep(servoNum * 2 + 3, adjStrDown);
        }
        weep(0, 0);    //write flag reset
    }

    //% block
    //% advanced=true
    export function servoAdjust(servoNum: number, adjustNum: number) {
        let adjNum = servoSetInit[servoNum] + adjustNum
        if (100 > adjNum) {
            adjustNum = adjustNum + 1;
        } else if (adjNum > 1700) {
            adjustNum = adjustNum - 1;
        } else {
            servoWrite(servoNum, (adjNum / 10));
            basic.pause(0.5);
        }
        return adjustNum;
    }

    function bleInit() {
        serial.redirect(SerialPin.P8, SerialPin.P12, 115200);
        pins.digitalWritePin(DigitalPin.P16, 0);
        initBle = true;
    }

    //% blockId=PLEN:bit_BLE
    //% block="enable control from smartphone"
    //% advanced=true
    export function serialRead() {
        if (initBle == false) bleInit();
        pins.digitalWritePin(DigitalPin.P16, 1);
        while (1) {
            let buf = serial.readString();
            if ((buf[0] != "$") && (buf[0] != "#")) {
                break;
            }
            let bufB = buf[1] + buf[2];
            if (bufB == "PM") {
                bufB = buf[3] + buf[4];
                //basic.showString(bufB);
                motion(parseIntM(bufB));
                break;
            } else if (bufB == "SM") {
                break;
            } else {
                //display.show("b")
                break;
            }
        }
        pins.digitalWritePin(DigitalPin.P16, 0);
    }

    //% block="servo motor initial"
    export function servoInitialSet() {
        for (let n = 0; n < 8; n++) {
            servoWrite(n, servoSetInit[n] / 10);
        }
    }

    //% block
    //% advanced=true
    export function servoFree() {
        //Power Free!
        write8(0xFA, 0x00);
        write8(0xFB, 0x00);
        write8(0xFC, 0x00);
        write8(0xFD, 0x00);
        write8(0x00, 0x01);
        //write8(0x00, 0x80);
        initPCA9865 == false;
    }

    //% block="eye led is %onoff"
    export function eyeLed(ledOnOff: LedOnOff) {
        pins.digitalWritePin(DigitalPin.P8, ledOnOff);
        pins.digitalWritePin(DigitalPin.P16, ledOnOff);
    }
}