import { CONFIG } from './constants';

export class SoundPlayer {

  private readonly ROUND_OVER_SOUND_FILE_NAME = '/325112__fisch12345__success.wav';
  private readonly ASSASIN_SOUND_FILE_NAME = '/456963__funwithsound__failure-drum-sound-effect-2.wav';
  private readonly SOUND_VOLUMES = [1, 1];

  public static readonly ROUND_OVER_SOUND = 0;
  public static readonly ASSASIN_SOUND = 1;

  private sounds: SoundObject[];

  constructor(private position: TVec3) {
    const assetsPath = Script.resolvePath('../assets');

    this.sounds = [
      SoundCache.getSound(assetsPath + this.ROUND_OVER_SOUND_FILE_NAME),
      SoundCache.getSound(assetsPath + this.ASSASIN_SOUND_FILE_NAME),
    ];

  }

  public play(soundIndex: number) {
    if (!this.sounds[soundIndex]) {
      return;
    }

    if (CONFIG.CLIENT_SIDE_ONLY) {
      return this.playLocal(soundIndex);
    }

    const injectorOptions = {
      position: this.position,
      volume: this.SOUND_VOLUMES[soundIndex]
    } as AudioInjector.AudioInjectorOptions;

    Audio.playSound(this.sounds[soundIndex], injectorOptions);
  }

  private playLocal(soundIndex: number) {
    const injectorOptions = {
      position: MyAvatar.position,
      volume: this.SOUND_VOLUMES[soundIndex] / 5,
      localOnly: true
    } as AudioInjector.AudioInjectorOptions;

    Audio.playSound(this.sounds[soundIndex], injectorOptions);
  }

}
