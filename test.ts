// tests go here; this will not be compiled when this package is used as a library


basic.showLeds(`
    . . . . .
    . # . # .
    . . . . .
    # . . . #
    . # # # .
    `);

basic.forever(function () {
<<<<<<< HEAD
    plenbit.serialRead()
=======
    //plenbit.serialRead()
>>>>>>> 7f1c51392adf78d967bcffc289ce99d42cfc3a90

})
input.onButtonPressed(Button.A, function () {
    //plenbit.dance_motion(plenbit.danceMotions.DanceLStep)
    plenbit.stdMotion(plenbit.StdMotions.ArmPataPata)

})
input.onButtonPressed(Button.B, function () {
    plenbit.servoFree();
})

/*
basic.forever(function () {
    plenbit.serialread()
    if (pins.analogReadPin(AnalogPin.P0) <= 500) {
        plenbit.Move_motion(plenbit.moveMotions.PataPata)
        basic.pause(100)
    } else {
        if (pins.analogReadPin(AnalogPin.P2) >= 650) {
            plenbit.Move_motion(plenbit.moveMotions.WalkBack)
            basic.pause(100)
        }
    }
})
*/