# pxt-plenbit-blocks

## PLEN:bit

PLEN:bit is a small humanoid robot with movable arms and legs. Anyone can easily use PLEN:bit through programing and onboard sensors.

Please refer to this page about PLEN:bit
https://plen.jp/plenbit/#manual

https://makecode.microbit.org/pkg/plenprojectcompany/pxt-PLENbit

## Basic usage

```blocks
//Play WalkForward motion when button A pressed
//There are many other motions.
input.onButtonPressed(Button.A, function () {
    plenbit.stdMotion(plenbit.StdMotions.WalkForward)
})
```

## Examples:

### PLEN:bit Basic

```blocks
plenbit.servoInitialSet()
basic.showIcon(IconNames.Happy)

basic.forever(function () {
    plenbit.eyeLed(plenbit.LedOnOff.On)
    basic.pause(100)
    plenbit.eyeLed(plenbit.LedOnOff.Off)
    basic.pause(100)
})

input.onButtonPressed(Button.A, function () {
    plenbit.stdMotion(plenbit.StdMotions.WalkForward)
})
input.onButtonPressed(Button.B, function () {
    plenbit.stdMotion(plenbit.StdMotions.ArmPataPata)
})
input.onButtonPressed(Button.AB, function () {
    plenbit.soccerMotion(plenbit.SocMotions.RKick)
})
```

### Distance sensor Basic

```blocks
basic.forever(function () {
    if (plenbit.checkDistane(plenbit.LedLr.BButtonSide, 600)) {
        basic.showIcon(IconNames.Happy)
        plenbit.stdMotion(plenbit.StdMotions.ArmPataPata)
    } else {
        basic.showIcon(IconNames.Sad)
    }
})
```
### Sound sensor Basic

```blocks
let mic = plenbit.initMic(plenbit.LedLr.AButtonSide)
basic.showIcon(IconNames.Sad)
basic.forever(function () {
    if (plenbit.checkMic(plenbit.LedLr.AButtonSide, 150, mic)) {
        basic.showIcon(IconNames.Happy)
        plenbit.stdMotion(plenbit.StdMotions.ArmPataPata)
        basic.showIcon(IconNames.Sad)
    }
})
```

### Walking

```blocks
// Type A
input.onButtonPressed(Button.A, function () {
    plenbit.stdMotion(plenbit.StdMotions.WalkForward)
    plenbit.stdMotion(plenbit.StdMotions.WalkForward)
    plenbit.stdMotion(plenbit.StdMotions.WalkForward)
})
// Type B
input.onButtonPressed(Button.B, function () {
    plenbit.walk(plenbit.WalkMode.Move)
    plenbit.walk(plenbit.WalkMode.Move)
    plenbit.walk(plenbit.WalkMode.Move)
    plenbit.walk(plenbit.WalkMode.Stop)
})
```

### Fall over

```blocks
basic.showIcon(IconNames.Happy)
basic.forever(function () {
    if (input.acceleration(Dimension.Z) < -512) {
        basic.showIcon(IconNames.Sad)
        plenbit.stdMotion(plenbit.StdMotions.ArmPataPata)
    } else {
        basic.showIcon(IconNames.Happy)
    }
})
```

### Dodge the wall

```blocks
basic.forever(function () {
    if (plenbit.checkDistane(plenbit.LedLr.BButtonSide, 600)) {
        basic.showIcon(IconNames.Sad)
        for (let index = 0; index < 3; index++) {
            plenbit.stdMotion(plenbit.StdMotions.WalkRTurn)
        }
        basic.showIcon(IconNames.Happy)
    } else {
        plenbit.stdMotion(plenbit.StdMotions.WalkForward)
    }
})
```

### Dodge the wall 2

```blocks
basic.forever(function () {
    if (plenbit.checkDistane(plenbit.LedLr.BButtonSide, 600)) {
        plenbit.walk(plenbit.WalkMode.Stop)
        basic.showIcon(IconNames.Sad)
        for (let index = 0; index < 3; index++) {
            plenbit.stdMotion(plenbit.StdMotions.WalkRTurn)
        }
        basic.showIcon(IconNames.Happy)
    } else {
        plenbit.walk(plenbit.WalkMode.Move)
    }
})
```

### GO NORTH

```blocks
let direction = 0
basic.forever(function () {
    direction = plenbit.direction()
    if (direction <= 20 || direction >= 340) {
        basic.showArrow(ArrowNames.North)
        plenbit.stdMotion(plenbit.StdMotions.WalkForward)
    } else if (direction > 20 && direction <= 180) {
        basic.showArrow(ArrowNames.East)
        plenbit.stdMotion(plenbit.StdMotions.WalkLTurn)
    } else if (direction > 180 && direction < 340) {
        basic.showArrow(ArrowNames.West)
        plenbit.stdMotion(plenbit.StdMotions.WalkRTurn)
    }
})
```
### Let's make a motion!

```blocks
plenbit.servoInitialSet()
basic.showIcon(IconNames.Happy)

input.onButtonPressed(Button.A, function () {
    R_Punch()
})
function R_Punch () {
    plenbit.setAngle([0, 0, 0, 0, -900, 0, 0, 0], 300)
    plenbit.setAngle([0, 0, 0, 0, 0, 0, 0, 0], 300)
}
input.onButtonPressed(Button.B, function () {
    L_Punch()
})
function L_Punch () {
    plenbit.setAngle([900, 0, 0, 0, 0, 0, 0, 0], 300)
    plenbit.setAngle([0, 0, 0, 0, 0, 0, 0, 0], 300)
}
```

### Remote control

Requires two micro:bits

```blocks
radio.setGroup(0)
basic.showIcon(IconNames.Happy)

input.onButtonPressed(Button.A, function () {
    radio.sendString("A")
})
input.onButtonPressed(Button.AB, function () {
    radio.sendString("C")
})
radio.onReceivedString(function (receivedString) {
    if (receivedString == "A") {
        plenbit.stdMotion(plenbit.StdMotions.WalkForward)
    } else if (receivedString == "B") {
        plenbit.stdMotion(plenbit.StdMotions.WalkRTurn)
    } else if (receivedString == "C") {
        plenbit.stdMotion(plenbit.StdMotions.HighFive)
    }
})
input.onButtonPressed(Button.B, function () {
    radio.sendString("B")
})
```

### Distance to cm

```blocks
let dis = 0
let Adjust = 20
basic.showIcon(IconNames.SmallDiamond)
basic.forever(function () {
    dis = plenbit.sensorLR(plenbit.LedLr.BButtonSide)
    dis = Math.map(dis, 0, 1023, 0, 330 - Adjust)
    dis = Math.map(dis, 60, 220, 50, 4)
    serial.writeValue("CM", dis)
    if (dis <= 6) {
        plenbit.stdMotion(plenbit.StdMotions.ArmPataPata)
    }
    basic.pause(50)
})
```

### Servo Control

```blocks
basic.showIcon(IconNames.Happy)
plenbit.servoInitialSet()
input.onButtonPressed(Button.A, function () {
    plenbit.servoWrite(11, 34)
})
```

### Sensor watching

```blocks
basic.forever(function () {
    serial.writeValue("mic", plenbit.sensorLR(plenbit.LedLr.AButtonSide))
    serial.writeValue("dis", plenbit.sensorLR(plenbit.LedLr.BButtonSide))
})
```

### Servo Adjust

```blocks
/**
 * How to use
 * 1.Push A to start correction
 * 2.Push A or B to move each servo
 * 3.Push A+B to switch to next servo
 * 4.Loop
 * 5.Ends when smile is displayed
 * 6.Reset, then Push B to walk
 * If PLEN does not fall over, setting is complete
 */
let loop = false
let servoNum = 0
let adjNum = 0
plenbit.servoInitialSet()
basic.showIcon(IconNames.Happy)
basic.forever(function () {
    if (input.buttonIsPressed(Button.A)) {
        servoAdjust()
    } else if (input.buttonIsPressed(Button.B)) {
        plenbit.stdMotion(plenbit.StdMotions.WalkForward)
    } else if (input.buttonIsPressed(Button.AB)) {
        plenbit.resetPosition()
        basic.pause(1000)
    }
})
function servoAdjust () {
    adjNum = 0
    servoNum = 0
    basic.showNumber(servoNum)
    loop = true
    while (loop) {
        if (input.buttonIsPressed(Button.AB)) {
            plenbit.savePositon(servoNum, adjNum)
            servoNum += 1
            adjNum = 0
            basic.showNumber(servoNum)
        } else if (input.buttonIsPressed(Button.A)) {
            adjNum += 1
            adjNum = plenbit.servoAdjust(servoNum, adjNum)
        } else if (input.buttonIsPressed(Button.B)) {
            adjNum += -1
            adjNum = plenbit.servoAdjust(servoNum, adjNum)
        } else if (servoNum > 7) {
            basic.showIcon(IconNames.Happy)
            basic.pause(2000)
            loop = false
        }
    }
}
```


## Other guides

Programming guide here
https://plen.jp/wp/plenbit/

## License

MIT

## Supported targets

* for PXT/microbit
```package
plenbit=github:plenprojectcompany/pxt-PLENbit
```