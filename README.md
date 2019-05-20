# pxt-plenbit-blocks



## PLEN:bit

PLEN:bit is a small humanoid robot with movable arms and legs. Anyone can easily use PLEN:bit through programing and onboard sensors.

Please refer to this page about PLEN:bit
https://plen.jp/wp/plenbit-assembly-kit/

## Basic usage

```blocks
//Play WalkForward motion when button A pressed
input.onButtonPressed(Button.A, function () {
    plenbit.std_motion(plenbit.stdMotions.WalkForward)
})
```
## License

MIT

## Supported targets

* for PXT/microbit
