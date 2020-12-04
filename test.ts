// tests go here; this will not be compiled when this package is used as a library

plenbit.servoInitialSet()
let mic = plenbit.initMic(plenbit.LedLr.AButtonSide)
plenbit.eyeLed(plenbit.LedOnOff.On)
plenbit.setColor(NeoPixelColors.Green)
let plenStrip = plenbit.createPlenEye()
plenbit.eyeLed(plenbit.LedOnOff.On)
basic.showIcon(IconNames.Happy)

basic.forever(function () {
    if (plenbit.checkDistane(plenbit.LedLr.BButtonSide, 600)) {
        plenbit.danceMotion(plenbit.DanceMotions.DanceLStep)
    } else if (plenbit.checkMic(plenbit.LedLr.AButtonSide, 150, mic)) {
        plenbit.soccerMotion(plenbit.SocMotions.DefenseLStep)
    } else if (plenbit.direction() == 352) {
        plenbit.stdMotion(plenbit.StdMotions.ArmPataPata)
    } else if (600 == plenbit.sensorLR(plenbit.LedLr.BButtonSide)) {
        plenbit.changeMotionSpeed(20)
        //plenbit.setAngle([0, 0, 0, 0, 0, 0, 0, 0], 500)
        plenbit.setAngleToPosition(0,0,-90,0,0,0,90,0,500)
        plenbit.setAngleToPosition(0,0,0,0,0,0,0,0,500)
        plenbit.motion(0)
    } else {
    	
    }
})
input.onButtonPressed(Button.A, function () {
    plenbit.walk(plenbit.WalkMode.Move)
    plenbit.walk(plenbit.WalkMode.Stop)
    plenbit.servoWrite(0, 0)
    plenbit.servoFree()
    plenbit.servoInitialSet()
})
input.onButtonPressed(Button.B, function () {
    while (true) {
        plenbit.serialRead()
    }
})
input.onButtonPressed(Button.AB, function () {
    plenbit.savePositon(0, 0)
    plenbit.resetPosition()
})