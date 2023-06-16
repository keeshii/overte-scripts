"use strict";

/* global Audio, SoundCache, CLIENT_SIDE_ONLY */

(function (global) {

  Script.include('./config.js');

  var ASSETS_PATH = Script.resolvePath('../assets');
  var CLICK_SOUND_PATH = ASSETS_PATH + '/Tab03.wav';
  var SUCCESS_SOUND_PATH = ASSETS_PATH + '/109662__grunz__success.wav';
  var ERROR_SOUND_PATH = ASSETS_PATH + '/674824__newangelgamer22gamesdeveloper__error-sound.wav';
  var SOUND_VOLUMES = [1, 0.2, 0.1];

  SoundPlayer.CLICK_SOUND = 0;
  SoundPlayer.SUCCESS_SOUND = 1;
  SoundPlayer.ERROR_SOUND = 2;

  function SoundPlayer() {
    this.position = null;
    this.sounds = [
      SoundCache.getSound(CLICK_SOUND_PATH),
      SoundCache.getSound(SUCCESS_SOUND_PATH),
      SoundCache.getSound(ERROR_SOUND_PATH)
    ];
  }

  SoundPlayer.prototype.setPosition = function(position) {
    this.position = position;
  };

  SoundPlayer.prototype.play = function(soundIndex) {
    var injectorOptions;

    if (CLIENT_SIDE_ONLY) {
      return this.playLocal(soundIndex);
    }

    if (!this.position || !this.sounds[soundIndex]) {
      return;
    }

    injectorOptions = {
      position: this.position,
      volume: SOUND_VOLUMES[soundIndex]
    };

    Audio.playSound(this.sounds[soundIndex], injectorOptions);    
  };

  SoundPlayer.prototype.playLocal = function(soundIndex) {
    var injectorOptions;
    
    if (!this.sounds[soundIndex]) {
      return;
    }

    injectorOptions = {
      position: MyAvatar.position,
      volume: SOUND_VOLUMES[soundIndex] / 5,
      localOnly: true
    };

    Audio.playSound(this.sounds[soundIndex], injectorOptions);    
  };

  global.SoundPlayer = SoundPlayer;

}(typeof module !== 'undefined' ? module.exports : new Function('return this;')()));
