import { Level_00 } from './levels/level-00';
import { Level_01 } from './levels/level-01';
import { Level_02 } from './levels/level-02';
import { Level_03 } from './levels/level-03';
import { Level_04 } from './levels/level-04';
import { Level_05 } from './levels/level-05';
import { Level_06 } from './levels/level-06';
import { Level_07 } from './levels/level-07';
import { Level_08 } from './levels/level-08';
import { Level_09 } from './levels/level-09';
import { Level_10 } from './levels/level-10';
import { LevelBase } from './levels/level-base';
import { LocalStoreData } from './rescripted.interface';

export class ServerStore {

  public levelNo: number;
  public levels: LevelBase[];

  constructor() { }

  public resetAll() {
    this.levelNo = 0;
    this.levels = [this.load(0)];
    return this.levels[0];
  }

  public load(levelNo: number) {
    switch (levelNo) {
      case 0:
        return new Level_00();
      case 1:
        return new Level_01();
      case 2:
        return new Level_02();
      case 3:
        return new Level_03();
      case 4:
        return new Level_04();
      case 5:
        return new Level_05();
      case 6:
        return new Level_06();
      case 7:
        return new Level_07();
      case 8:
        return new Level_08();
      case 9:
        return new Level_09();
      case 10:
        return new Level_10();
    }
  }

  public fromLocalStore(localStore: LocalStoreData) {
    this.levelNo = localStore.levelNo;
    this.levels = localStore.levels.map((level, index) => {
      const newLevel = this.load(index);
      newLevel.editor.state = level.editor.state;
      newLevel.completed = level.completed;
      return newLevel;
    });
    return this.levels[this.levelNo];
  }

  public nextLevel() {
    const levelNo = this.levelNo + 1;
    const level = this.reloadLevel(levelNo);

    if (!level) {
      return;
    }

    this.levelNo = levelNo;
    return level;
  }

  public prevLevel() {
    const levelNo = this.levelNo - 1;
    const level = this.reloadLevel(levelNo);

    if (!level) {
      return;
    }

    this.levelNo = levelNo;
    return level;
  }

  public reloadLevel(levelNo: number) {
    if (levelNo === undefined) {
      levelNo = this.levelNo;
    }
    const newLevel = this.load(levelNo);
    if (!newLevel) {
      return;
    }
    // copy editor, keep board
    if (this.levels[levelNo]) {
      newLevel.editor = this.levels[levelNo].editor;
      newLevel.completed = this.levels[levelNo].completed;
    }
    this.levels[levelNo] = newLevel;
    return newLevel;
  }

  public resetLevel() {
    const newLevel = this.load(this.levelNo);
    this.levels[this.levelNo] = newLevel;
    return newLevel;
  }

  public isApiUnlocked(level: LevelBase) {
    if (level instanceof Level_09) {
      return true;
    }
    return this.levels.length >= 11;
  }

}
