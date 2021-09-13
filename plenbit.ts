//plenbit.ts

/**
 * Blocks for PLEN:bit
 */
//% weight=999 color=#00A654 icon="\uf0a0" block="PLEN:bit"
//% groups=['Motion', 'Sensor', 'Servo', 'Servo Adjust', 'PLEN:bit v1', 'PLEN:bit v2', 'SPECIAL KIT', 'others']
namespace plenbit {
    export enum DataPin {
        //% block="A button"
        AButtonSide = 0,
        //% block="B button"
        BButtonSide = 1
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
        //% block="Shake A Box"
        ShakeABox = 0x0a,
        //% block="Pick Up High"
        PickUpHigh = 0x0b,
        //% block="Pick Up Low"
        PickUpLow = 0x0c,
        //% block="Receive a Box"
        ReceiveaBox = 0x0d,
        //% block="Present a Box"
        PresentaBox = 0x0e,
        //% block="Pass a Box"
        PassaBox = 0x0f,
        //% block="Throw a Box"
        ThrowaBox = 0x10,
        //% block="Put Down High"
        PutDownHigh = 0x11,
        //% block="Put Down Low"
        PutDownLow = 0x12,
        //% block="Carry For ward"
        CarryForward = 0x2A,
        //% block="Carry L Turn"
        CarryLTurn = 0x2B,
        //% block="Carry R Turn"
        CarryRTurn = 0x2c,
        //% block="Carry Back"
        CarryBack = 0x2d
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

    export enum WalkMode {
        //% block="move"
        Move = 1,
        //% block="stop"
        Stop = 0
    }

    export enum THsensorMode {
        //% block="temperature(℃)"
        Temperature = 0,
        //% block="humidity(%)"
        Humidity = 1
    }

    let motionSpeed = 20;
    //[1000, 900, 300, 900, 800, 900, 1500, 900];good angle
    export let servoSetInit = [1000, 630, 300, 600, 240, 600, 1000, 720, 900, 900, 900, 900];
    const servoReverse = [false, false, false, false, false, false, false, false, true, true, true, true]; //サーボ反転
    let servoAngle = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let SERVO_NUM_USED = 8;
    let romAdr1 = 0x56;
    let initBle = false;
    let initPCA9865 = false;
    let walkingMode = 0;
    let pleEyeRGB = neopixel.rgb(0, 255, 0)
    let plenStrip: neopixel.Strip = null
    let plenEyeCreated = false;
    let hardwareVersion = parseInt(control.hardwareVersion())
    let AM2320LastUpdateTime_A = 0
    let AM2320LastUpdateTime_B = 0
    let temperature = 0
    let humidity = 0

    // 初期化
    loadPos();
    servoInitialSet()
    eyeLed(LedOnOff.On);
    setEyeBrightness(20);
    setColorRGB(0, 255, 0);
    basic.pause(500)
    servoFree()

    // 検査用フラグ
    export let Test_isTHsensorSuccess: boolean = false

    export function secretIncantation() {
        write8(0xFE, 0x85);//PRE_SCALE
        write8(0xFA, 0x00);//ALL_LED_ON_L
        write8(0xFB, 0x00);//ALL_LED_ON_H
        write8(0xFC, 0x66);//ALL_LED_OFF_L
        write8(0xFD, 0x00);//ALL_LED_OFF_H
        write8(0x00, 0x01);
    }

    function write8(addr: number, d: number) {
        let cmd = pins.createBuffer(2);
        cmd[0] = addr;
        cmd[1] = d;
        pins.i2cWriteBuffer(0x6A, cmd, false);
    }

    function motionFlame(fileName: number, flameNum: number) {
        doMotion(fileName, flameNum);
    }

    function doMotion(fileName: number, flameNum: number) {
        let data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let command = 0x3e;//">"
        let listLen = 43;
        let loopBool = false;
        let plenDebug: boolean = false;
        if (flameNum == 0xff) {
            flameNum = 0;
            loopBool = true;
        }
        let readAdr = 0x32 + 860 * fileName + flameNum * listLen;
        let error = 0;
        while (1) {
            let mBuf = reep(readAdr, listLen);
            readAdr += listLen;
            if (mBuf[0] == 0xff) break;
            let mf = "";    //=null ?
            let listNum = 0;
            if (command != mBuf[listNum]) break;
            if (plenDebug) serial.writeString(",>OK");
            listNum += 1; // >
            if (0x4d46 != (mBuf[listNum] << 8 | mBuf[listNum + 1])) break;
            if (plenDebug) serial.writeString(",mfOK");
            listNum += 2; // MF
            if (fileName != (num2Hex(mBuf[listNum]) << 4 | num2Hex(mBuf[listNum + 1]))) break;
            if (plenDebug) serial.writeString(",fileOK");
            listNum += 4;// slot,flame
            let time = num2Hex(mBuf[listNum]) << 12 | num2Hex(mBuf[listNum + 1]) << 8 | num2Hex(mBuf[listNum + 2]) << 4 | num2Hex(mBuf[listNum + 3]);
            listNum += 4;
            for (let val = 0; val < SERVO_NUM_USED; val++) {
                let numHex = num2Hex(mBuf[listNum]) << 12 | num2Hex(mBuf[listNum + 1]) << 8 | num2Hex(mBuf[listNum + 2]) << 4 | num2Hex(mBuf[listNum + 3]);
                if (numHex >= 0x7fff) {
                    numHex = numHex - 0x10000;
                } else {
                    numHex = numHex & 0xffff;
                }
                data[val] = numHex / 10;
                if (plenDebug) serial.writeNumber(data[val]);
                listNum += 4;
            }
            setAngle(data, time);
            if (!loopBool) break;
        }
    }

    function num2Hex(num: number) {
        let i: number = 0;
        if (48 <= num && num <= 57) {
            i = (num - 48);
        } else if (62 <= num && num <= 77) {
            switch (num) {
                //case 62: i = 0x3e; break;
                case 65: i = 0x0a; break;
                case 66: i = 0x0b; break;
                case 67: i = 0x0c; break;
                case 68: i = 0x0d; break;
                case 69: i = 0x0e; break;
                case 70: i = 0x0f; break;
                //case 77: i = 0x4d; break;
                default: i = 0; break;
            }
        } else if (97 <= num && num <= 102) {
            switch (num) {
                case 97: i = 0x0a; break;
                case 98: i = 0x0b; break;
                case 99: i = 0x0c; break;
                case 100: i = 0x0d; break;
                case 101: i = 0x0e; break;
                case 102: i = 0x0f; break;
                default: i = 0; break;
            }
        }
        return i;
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

    function loadPos() {
        let readBuf = reep(0x00, 1);
        if (readBuf[0] == 0x01) {
            readBuf = reep(0x02, 16);
            for (let i = 0; i < 8; i++) {
                servoSetInit[i] = (readBuf[i * 2] << 8) | (readBuf[i * 2 + 1]);
            }
        }
    }

    function parseIntM(str: string) {
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
            case 4: hex = (num[len - 4] * 0x1000);
            case 3: hex += (num[len - 3] * 0x0100);
            case 2: hex += (num[len - 2] * 0x0010);
            case 1: hex += (num[len - 1] * 0x0001);
        }
        return hex;
    }

    function bleInit() {
        serial.redirect(SerialPin.P8, SerialPin.P12, 115200);
        pins.digitalWritePin(DigitalPin.P16, 0);
        initBle = true;
    }

    function UpdateAM2320(dataPin: DigitalPin, serialDebug: boolean) {
        Test_isTHsensorSuccess = false

        let isAside = false
        if (dataPin == DigitalPin.P0) isAside = true;

        let count

        let DataTimeArray = []

        let DataArray: boolean[] = []
        let ResultArray: number[] = []
        for (let index = 0; index < 40; index++) DataArray.push(false)
        for (let index = 0; index < 5; index++) ResultArray.push(0)

        function WaitHigh() {
            for (let i = 0; i < 10000; i++) {
                if (pins.digitalReadPin(dataPin) == 0) break
            }
        }

        function WaitLow() {
            for (let i = 0; i < 10000; i++) {
                if (pins.digitalReadPin(dataPin) == 1) break
            }
        }

        if (isAside) {
            while (input.runningTime() - AM2320LastUpdateTime_A < 2000);
        } else {
            while (input.runningTime() - AM2320LastUpdateTime_B < 2000);
        }

        pins.digitalWritePin(dataPin, 0)
        basic.pause(10)
        pins.setPull(dataPin, PinPullMode.PullUp)
        count = 0
        let errorFlag = true
        for (let i = 0; i < 10000; i++) {
            if (pins.digitalReadPin(dataPin) == 0) {
                errorFlag = false
                break
            }
        }

        if (errorFlag) {
            if (serialDebug) serial.writeLine("AM2320 is not responding! (Plsese check the TH Sensor connection)")
            if (isAside) {
                AM2320LastUpdateTime_A = input.runningTime() - 1000
            } else {
                AM2320LastUpdateTime_B = input.runningTime() - 1000
            }
        } else {
            WaitLow()
            WaitHigh()
            if (hardwareVersion == 2) { //v2の場合、割り込み処理が多い
                while (DataTimeArray.length < 41) {
                    DataTimeArray.push(input.runningTimeMicros())
                    WaitLow()
                    WaitHigh()
                }

                if (DataTimeArray.length == 41) {
                    for (let i = 0; i < 40; i++) {
                        if (DataTimeArray[i + 1] - DataTimeArray[i] > 110) {
                            DataArray[i] = true
                        }
                    }
                } else {
                    errorFlag = true
                    if (serialDebug) serial.writeLine("Data Get Error! (Sensor data has missed " + (41 - DataTimeArray.length).toString() + " data)")
                }

            } else { //v1の場合、動作周波数が大きい
                for (let i = 0; i < 40; i++) {
                    WaitHigh()
                    WaitLow()
                    control.waitMicros(30)
                    if (pins.digitalReadPin(dataPin) == 1) DataArray[i] = true
                }
            }

            if (isAside) {
                AM2320LastUpdateTime_A = input.runningTime()
            } else {
                AM2320LastUpdateTime_B = input.runningTime()
            }

            if (errorFlag == false) {
                let checkSum = 0
                for (let i = 0; i < 5; i++) {
                    for (let j = 0; j < 8; j++) {
                        if (i == 0 && j != 0 || i == 2 && j != 0 || i == 1 || i == 3 || i == 4) { //1,3byteの8bit目はチェックデジットに含まない
                            if (DataArray[8 * i + j]) {
                                ResultArray[i] += 2 ** (7 - j)
                            }
                        }
                    }
                    if (i < 4) {
                        checkSum += ResultArray[i]
                    }
                }

                if (checkSum == 0 || ResultArray[4] == 0) { //全て0はありえないため、弾く
                    if (serialDebug) serial.writeLine("Data Value Error! (Temperature & Humidity is zero, but it looks broken data)")
                } else {
                    if (Math.abs(checkSum - ResultArray[4]) <= 256) { //Checksumが明らかにおかしい場合のみ弾く
                        let flag1 = false
                        let flag2 = false
                        let valuecheck = 0
                        valuecheck = (ResultArray[0] * 256 + ResultArray[1]) / 10
                        if (0 < valuecheck && valuecheck < 100) { //異常な湿度を弾く
                            flag1 = true
                            humidity = valuecheck
                        } else {
                            if (serialDebug) serial.writeLine("Data Value Error! (Humidity is " + valuecheck.toString() + ", but it looks broken data)")
                        }
                        valuecheck = (ResultArray[2] * 256 + ResultArray[3]) / 10
                        if (DataArray[16]) { //左から17bit目（温度の最上位bit）が1のとき、マイナス
                            valuecheck *= -1
                        }
                        if (-40 < valuecheck && valuecheck < 80) { //異常な温度を弾く
                            flag2 = true
                            temperature = valuecheck
                        } else {
                            if (serialDebug) serial.writeLine("Data Value Error! (Temperature is " + valuecheck.toString() + ", but it looks broken data)")
                        }
                        if (flag1 && flag2) Test_isTHsensorSuccess = true; //読み取り成功
                        if (serialDebug) serial.writeLine("Temperature: " + temperature + " C")
                        if (serialDebug) serial.writeLine("Humidity: " + humidity + " %")
                        if (serialDebug) serial.writeLine("-------------------")
                    } else {
                        if (serialDebug) serial.writeLine("Check Sum Error! (Sensor data has incorrect check digit [" + (checkSum - ResultArray[4]).toString() + "])")
                    }
                }
            }
        }
    }

    //PLEN:bitブロック
    //モーション

    /**
     * Play the Standard Motion on PLEN:bit.
     */
    //% blockId=PLEN:bit_motion_std
    //% block="play std motion %fileName"
    //% weight=10 group="Motion"
    export function stdMotion(fileName: StdMotions) {
        motion(fileName);
    }

    /**
     * Play the Soccer Motion on PLEN:bit.
     */
    //% blockId=PLEN:bit_motion_Soc
    //% block="play soccer motion %fileName"
    //% weight=9 group="Motion"
    export function soccerMotion(fileName: SocMotions) {
        motion(fileName);
    }

    /**
     * Play the Box Motion on PLEN:bit.
     */
    //% blockId=PLEN:bit_motion_box
    //% block="play box motion %fileName"
    //% weight=8 group="Motion"
    //% deprecated=true
    export function boxMotion(fileName: BoxMotions) {
        motion(fileName);
    }

    /**
     * Play the Dance Motion on PLEN:bit.
     */
    //% blockId=PLEN:bit_motion_dan
    //% block="play dance motion %fileName"
    //% weight=7 group="Motion"
    export function danceMotion(fileName: DanceMotions) {
        motion(fileName);
    }

    /**
     * Play the Continuous Walking Motion on PLEN:bit.
     */
    //% block="walk %mode"
    //% weight=5 group="Motion"
    export function walk(mode: WalkMode) {
        if (mode == 1) {
            if (walkingMode == 0) {
                walkingMode = 0;
            } else if (walkingMode == 100) {
                walkingMode = 0;
            }
        } else {
            if (walkingMode == 1) {
                walkingMode = 2;
            } else {
                walkingMode = 100;
            }
        }
        switch (walkingMode) {
            case 0:
                motionFlame(StdMotions.WalkForward, 0);
                motionFlame(StdMotions.WalkForward, 1);
                walkingMode = 1;
            //break;
            case 1:
                motionFlame(StdMotions.WalkForward, 2);
                motionFlame(StdMotions.WalkForward, 3);
                motionFlame(StdMotions.WalkForward, 4);
                motionFlame(StdMotions.WalkForward, 5);
                motionFlame(StdMotions.WalkForward, 6);
                motionFlame(StdMotions.WalkForward, 7);
                break;
            case 2:
                motionFlame(StdMotions.WalkForward, 8);
                motionFlame(StdMotions.WalkForward, 9);
                walkingMode = 0;
                servoFree()
                break;
            default:
                break;
        }
    }

    /**
     * Change the playing speed of the PLEN:bit motion.
     * @param speed 0 ~ 50, The larger this value, the faster.
     */
    //% block="motion Speed %speed"
    //% speed.min=1 speed.max=50 speed.defl=20
    //% weight=4 group="Motion"
    export function changeMotionSpeed(speed: number) {
        motionSpeed = speed
    }

    /**
     * Set Servo Motors to initial position.
     */
    //% block="servo motor initial"
    //% weight=4 group="Motion"
    export function servoInitialSet() {
        for (let n = 0; n < 12; n++) {
            servoWriteInit(n, 0);
        }
    }


    //センサー

    /**
     * Get the value of analog sensor.
     */
    //% blockId=PLEN:bit_Sensor
    //% block="read %num side analog sensor"
    //% weight=10 group="Sensor"
    export function sensorLR(num: DataPin) {
        return pins.analogReadPin((num == 1) ? AnalogPin.P2 : AnalogPin.P0);
    }

    /**
     * Get the direction angle that PLEN: bit faces.
     */
    //% block="direction(°)"
    //% weight=9 group="Sensor"
    export function direction() {
        return Math.atan2(input.magneticForce(Dimension.X), input.magneticForce(Dimension.Z)) * 180 / 3.14 + 180
    }

    /**
     * Read the value from the AM2320 Temperature & Humidity sensor.
     */
    //% blockId=PLEN:bit_Sensor_SensorTH
    //% block="read %num side TH sensor (serial output : %serial)"
    //% weight=8 group="Sensor"
    export function sensorTH(num: DataPin, serial: boolean) {
        UpdateAM2320((num == 1) ? DigitalPin.P2 : DigitalPin.P0, serial)
    }

    /**
     * Get the value of AM2320 Temperature & Humidity sensor.
     */
    //% blockId=PLEN:bit_Sensor_SensorTHvalue
    //% block="%data"
    //% weight=7 group="Sensor"
    export function sensorTHvalue(data: THsensorMode) {
        if (data == 1) {
            return humidity
        } else {
            return temperature
        }
    }



    /**
     * Make this block insert "on start", when using checkMic. Use by substitution to a variable.
     * @param num plenbit.LedLr.AButtonSide or BButtonSide
    */
    //% block="Init Mic %num"
    //% blockSetVariable=mic
    //% weight=6 group="Sensor"
    //% deprecated=true
    export function initMic(num: DataPin): number {
        let cal = 0;
        basic.pause(10);
        for (let i = 0; i < 100; i++) {
            cal += pins.analogReadPin((num == 1) ? AnalogPin.P2 : AnalogPin.P0)
        }
        return cal = cal / 100
    }

    /**
     * Check mic
     * @param num pins
     * @param value Threshold , Max: 1023 - 'Standard Value'
     * @param adjust Standard value
     */
    // Threshold "しきい値"
    //% block="Side %num, Mic Value %value, InitValue $adjust"
    //% value.min=0 value.max=511 value.defl=150
    //% adjust.min=0 adjust.max=1023 adjust.defl=550
    //% weight=5 group="Sensor"
    //% deprecated=true
    export function checkMic(num: DataPin, value: number, adjust: number) {
        let n = (num == 1) ? AnalogPin.P2 : AnalogPin.P0;
        return (pins.analogReadPin(n) <= (adjust - value) || (adjust + value) <= pins.analogReadPin(n)) ? true : false;
    }

    /**
     * Check distance
     * @param num pins
     * @param value Threshold
     */
    //% block="Side %num, Distance Value %value"
    //% value.min=22 value.max=700 value.defl=600
    //% weight=4 group="Sensor"
    //% deprecated=true
    export function checkDistane(num: DataPin, value: number) {
        let n = (num == 1) ? AnalogPin.P2 : AnalogPin.P0;
        return (value <= pins.analogReadPin(n)) ? true : false;
    }


    //v1専用

    /**
     * [PLEN:bit v1] Switch the eye led of PLEN:bit.
     */
    //% block="eye led is %LedOnOff"
    //% weight=10 group="PLEN:bit v1"
    export function eyeLed(LedOnOff: LedOnOff) {
        if (plenEyeCreated) clearPlenEye();
        pins.digitalWritePin(DigitalPin.P8, LedOnOff);
        pins.digitalWritePin(DigitalPin.P16, LedOnOff);
    }


    //v2専用

    /**
     * [PLEN:bit v2] Change the eye led color of PLEN:bit.
     */
    //% block="show color %color for Eye LED"
    //% color.defl=NeoPixelColors.Green
    //% weight=10 group="PLEN:bit v2"
    export function setColor(color: NeoPixelColors) {
        if (!plenEyeCreated) createPlenEye();
        pleEyeRGB = neopixel.colors(color)
        plenStrip.showColor(pleEyeRGB)
    }

    //% block="PLEN Eye"
    //% blockSetVariable=plenStrip
    //% weight=9 group="PLEN:bit v2"
    //% deprecated=true
    export function createPlenEye(): neopixel.Strip {
        plenStrip = neopixel.create(DigitalPin.P16, 2, NeoPixelMode.RGB_RGB)
        plenEyeCreated = true;
        return plenStrip;
    }

    //% block="clear eye led"
    //% weight=8 group="PLEN:bit v2"
    //% deprecated=true
    export function clearPlenEye(): void {
        plenStrip.clear();
    }


    //その他
    //サーボモーター

    /**
     * Play the Motion on PLEN:bit.
     * You can check the list of Motion Number at GitHub.
     * @param fileName https://github.com/plenprojectcompany/pxt-PLENbit/PLENbit_Motion.pdf
     */
    //% blockId=PLEN:bit_motion
    //% block="play motion %fileName"
    //% fileName.min=0 fileName.max=73 fileName.defl=0
    //% weight=10 group="Servo" advanced=true
    export function motion(fileName: number) {
        doMotion(fileName, 0xff);
        servoFree()
    }

    /**
     * Controll the each servo motors. The servo will move max speed.
     * @param speed 0 ~ 50, The larger this value, the faster.
     */
    //% blockId=PLEN:bit_servo_Init
    //% block="servo motor %num|number %degrees|degrees"
    //% num.min=0 num.max=11
    //% degrees.min=-90 degrees.max=90 degrees.defl=0
    //% weight=8 group="Servo" advanced=true
    export function servoWriteInit(num: number, degrees: number) {
        let servoNum = 0x08;
        if (servoReverse[num]) {
            degrees *= -1;
        }
        if (initPCA9865 == false) {
            secretIncantation();
            initPCA9865 = true;
        }
        let highByte = false;
        let pwmVal = (servoSetInit[num] / 10 - degrees) * 100 * 226 / 10000
        if (pwmVal < 0) pwmVal = 0
        if (pwmVal > 384) pwmVal = 384
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
        servoAngle[num] = degrees
    }

    //% blockId=PLEN:bit_servo
    //% block="servo motor %num|number %degrees|degrees"
    //% num.min=0 num.max=7
    //% degrees.min=0 degrees.max=180
    //% weight=7 group="Servo" advanced=true
    //% deprecated=true
    export function servoWrite(num: number, degrees: number) {
        let servoNum = 0x08;
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
        servoAngle[num] = servoSetInit[num] / 10 - degrees
    }

    /**
     * Eight servos can be controlled at once
     * @param angle 8 arrays
     * @param msec milliseconds
     */
    //% block="set angle $angle, msec %msec"
    //% msec.min=100 msec.max=1000 msec.defl=500
    //% weight=6 group="Servo" advanced=true
    //% deprecated=true
    export function setAngle(angle: number[], msec: number) {

        let from = servoAngle.slice()

        if (motionSpeed < 1) motionSpeed = 1
        if (motionSpeed > 50) motionSpeed = 50
        msec = msec / motionSpeed * 20;//now 20//default 10 //speedy 30

        // Angle = at + b
        function Angle(t: number, ServoNum: number) {
            let Angle1 = from[ServoNum]
            let Angle2 = angle[ServoNum]
            let a = (Angle2 - Angle1) / msec
            let b = Angle1
            return a * t + b
        }

        let startTime = input.runningTime();
        let loopFlag = true
        while (loopFlag) {
            let nowTime = input.runningTime() - startTime
            for (let val = 0; val < SERVO_NUM_USED; val++) {
                let writeAngle = 0
                if (nowTime >= msec) {
                    loopFlag = false
                    writeAngle = angle[val]
                } else {
                    writeAngle = Angle(input.runningTime() - startTime, val);
                }
                servoWriteInit(val, writeAngle);
            }// 1 loop: v1 10~17ms, v2 6~10ms
        }
    }

    //% block
    //% weight=5 group="Servo" advanced=true
    //% deprecated=true
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

    /**
     * Eight servos can be controlled at once.
     * @param angle 8 arrays : -90 ~ 90
     * @param msec 100 ~ 1000
     * @param ls -90 ~ 90
     * @param lt -90 ~ 90
     * @param la -90 ~ 90
     * @param lf -90 ~ 90
     * @param rs -90 ~ 90
     * @param rt -90 ~ 90
     * @param ra -90 ~ 90
     * @param rf -90 ~ 90
     */
    //% block="aet angle -90.0 ~ 90.0|0:Left Shoulder : $ls|1:Left Thigh    : $lt|2:Left Arm      : $la|3:Left Foot     : $lf|4:Right Shoulder: $rs|5:Right Thigh   : $rt|6:Right Arm     : $ra|7:Right Foot    : $rf|msec %msec"
    //% msec.min=100 msec.max=1000 msec.defl=500
    //% ls.min=-30 ls.max=90 ls.defl=0
    //% lt.min=-90 lt.max=90 lt.defl=0
    //% la.min=-90 la.max=0 la.defl=0
    //% lf.min=-90 lf.max=90 lf.defl=0
    //% rs.min=-90 rs.max=30 rs.defl=0
    //% rt.min=-90 rt.max=90 rt.defl=0
    //% ra.min=0 ra.max=90 ra.defl=0
    //% rf.min=-90 rf.max=90 rf.defl=0
    //% weight=4 group="Servo" advanced=true
    export function setAngleToPosition
        (ls: number, lt: number, la: number, lf: number,
            rs: number, rt: number, ra: number, rf: number, msec: number) {
        let angle = [ls, lt, la, lf, rs, rt, ra, rf];
        setAngle(angle, msec);
    }


    //v2専用

    /**
     * [PLEN:bit v2] Change the eye led color with RGB of PLEN:bit.
     */
    //% blockId=PLEN:bit_EyeLED_RGB
    //% block="show color red %r green %g blue %b for Eye LED"
    //% r.min=0 r.max=255 r.defl=0
    //% g.min=0 g.max=255 g.defl=255
    //% b.min=0 b.max=255 b.defl=0
    //% weight=10 group="PLEN:bit v2" advanced=true
    export function setColorRGB(r: number, g: number, b: number) {
        if (!plenEyeCreated) createPlenEye();
        pleEyeRGB = neopixel.rgb(r, g, b)
        plenStrip.showColor(pleEyeRGB)
    }

    /**
     * [PLEN:bit v2] Change the eye led brightness of PLEN:bit.
     */
    //% blockId=PLEN:bit_EyeLED_Brightness
    //% block="set brightness %b for Eye LED"
    //% b.min=0 b.max=255 b.defl=127
    //% weight=9 group="PLEN:bit v2" advanced=true
    export function setEyeBrightness(b: number) {
        if (!plenEyeCreated) createPlenEye();
        plenStrip.setBrightness(b)
        plenStrip.showColor(pleEyeRGB)
    }

    //スペシャルキット

    /**
     * [PLEN:bit SPECIAL KIT] Controll the PLEN:bit by PLEN Connect App.
     */
    //% blockId=PLEN:bit_BLE
    //% block="enable control from smartphone"
    //% weight=10 group="SPECIAL KIT" advanced=true
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

    //初期位置調整

    //% blockId=PLEN:bit_reep
    //% block="readEEPROM %eepAdr| byte%num"
    //% eepAdr.min=910 eepAdr.max=2000
    //% num.min=0 num.max=43
    //% weight=10 group="Servo Adjust" advanced=true
    //% deprecated=true
    export function reep(eepAdr: number, num: number) {
        let data = pins.createBuffer(2);
        data[0] = eepAdr >> 8;
        data[1] = eepAdr & 0xFF;
        // need adr change code
        pins.i2cWriteBuffer(romAdr1, data);
        return pins.i2cReadBuffer(romAdr1, num, false);
    }

    //% block
    //% weight=9 group="Servo Adjust" advanced=true
    //% deprecated=true
    export function savePositon(servoNum: number, adjustNum: number) {
        adjustNum = servoSetInit[servoNum] + adjustNum;
        weep(0, 1);    //write flag
        weep(servoNum * 2 + 2, (adjustNum & 0xff00) >> 8);
        weep(servoNum * 2 + 3, adjustNum & 0xff);
    }

    //% block
    //% weight=8 group="Servo Adjust" advanced=true
    //% deprecated=true
    export function resetPosition() {
        weep(0, 0);    //write flag reset
        for (let n = 0; n < 8; n++) {
            weep(n * 2 + 2, (servoSetInit[n] & 0xff00) >> 8);
            weep(n * 2 + 3, servoSetInit[n] & 0xff);
        }
    }

    //% block
    //% weight=7 group="Servo Adjust" advanced=true
    //% deprecated=true
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
}
