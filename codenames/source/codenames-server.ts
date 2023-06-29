import { BOARD_SIZE, RED_TEAM, BLUE_TEAM, CONFIG } from './constants';
import { Board } from './board';
import { AgentType, BoardItem, Team } from './types';
import { Panel } from './panel';
import { ScoreScreen } from './score-screen';
import { Message } from './messages';
import { WordScreen } from './word-screen';
import { SoundPlayer } from './sound-player';

export class CodenamesServer {
  private words: string[] = [];
  private discard: string[] = [];
  private boardItems: BoardItem[] = [];
  private activeTeam = -1;
  private teams: Team[];
  private panel: Panel;
  private board: Board;
  private guessesLeft: number;
  private clueSubmitted: boolean;
  private roundPending: boolean;
  private wordScreen: WordScreen;
  private scoreScreen: ScoreScreen;
  private soundPlayer: SoundPlayer;
  private entityId: Uuid;
  private remotelyCallable: string[];

  public preload(entityId: Uuid) {
    this.words = CONFIG.WORDS.slice();

    this.teams = [
      { agentType: AgentType.RED, score: 0, guesses: 1, word: '' },
      { agentType: AgentType.BLUE, score: 0, guesses: 1, word: '' },
    ];

    this.entityId = entityId;

    Script.setTimeout(() => {
      this.initLayoutEntities();
      this.resetGameState();
    }, CONFIG.INIT_ENTITIES_DELAY);

    this.remotelyCallable = [
      'setWord',
      'submitClue',
      'submitWord',
      'increaseGuesses',
      'decreaseGuesses',
      'onSubmitClick',
      'onCancelClick',
      'onEndTurnClick',
    ];
  }

  public unload() { }

  public setWord(_id: Uuid, params: string[]) {
    const teamId = params[0] === Message.RED ? RED_TEAM : BLUE_TEAM;
    const word = params[1];
    const team = this.teams[teamId];
    if (team === undefined) {
      return;
    }
    team.word = word;
    this.panel.setTeamWord(teamId, word);
  }

  public submitClue(_id: Uuid, params: string[]) {
    const teamId = params[0] === Message.RED ? RED_TEAM : BLUE_TEAM;
    const team = this.teams[teamId];
    if (teamId !== this.activeTeam || this.clueSubmitted || !this.roundPending || !team.word) {
      return;
    }
    const word = team.word;
    team.word = '';

    this.clueSubmitted = true;
    this.guessesLeft = team.guesses;
    this.wordScreen.setWord(teamId, word, this.guessesLeft);
    this.panel.setTeamMessage(teamId, Message.WAITING_FOR_VOTES);
    this.panel.setTeamWord(teamId, '');
  }

  public submitWord(_id: Uuid, params: string[]) {
    const word = params[0];
    if (!this.clueSubmitted || !this.roundPending) {
      return;
    }
    let boardItem: BoardItem;
    for (let i = 0; i < this.boardItems.length; i++) {
      if (this.boardItems[i].word === word) {
        boardItem = this.boardItems[i];
        break;
      }
    }
    if (boardItem === undefined) {
      return;
    }
    boardItem.facedown = true;

    const index = this.boardItems.indexOf(boardItem);
    this.board.setFacedown(index, boardItem.agentType);
    this.panel.setFacedown(index, boardItem.agentType);

    const { team, opponent, opponentId } = this.findTeams(this.activeTeam);

    // First check if round is not over
    if (boardItem.agentType === AgentType.ASSASIN) {
      opponent.score += 1;
      const teamLabel = opponentId === RED_TEAM ? Message.RED : Message.BLUE;
      this.scoreScreen.setScore(opponentId, opponent.score);
      this.showRoundOver(Message.ROUND_OVER_ASSASIN.replace('{team}', teamLabel));
      this.soundPlayer.play(SoundPlayer.ASSASIN_SOUND);
      return;
    }

    // No more agents cards left
    if (boardItem.agentType === AgentType.RED || boardItem.agentType === AgentType.BLUE) {
      const [redLeft, blueLeft] = this.getWordsLeft();
      this.scoreScreen.setWordsLeft(RED_TEAM, redLeft);
      this.scoreScreen.setWordsLeft(BLUE_TEAM, blueLeft);
      if (redLeft === 0) {
        this.teams[RED_TEAM].score += 1;
        this.scoreScreen.setScore(RED_TEAM, this.teams[RED_TEAM].score);
        this.showRoundOver(Message.ROUND_OVER_ALL_AGENTS.replace('{team}', Message.RED));
        this.soundPlayer.play(SoundPlayer.ROUND_OVER_SOUND);
        return;
      }
      if (blueLeft === 0) {
        this.teams[BLUE_TEAM].score += 1;
        this.scoreScreen.setScore(BLUE_TEAM, this.teams[BLUE_TEAM].score);
        this.showRoundOver(Message.ROUND_OVER_ALL_AGENTS.replace('{team}', Message.BLUE));
        this.soundPlayer.play(SoundPlayer.ROUND_OVER_SOUND);
        return;
      }
    }

    // Guessed correctly, carry on
    if (boardItem.agentType === team.agentType && this.guessesLeft > 0) {
      this.guessesLeft -= 1;
      this.wordScreen.setGuessesLeft(this.guessesLeft);
      return;
    }

    // Switch teams
    this.onEndTurnClick();
  }

  public increaseGuesses(_id: Uuid, params: string[]) {
    const teamId = params[0] === Message.RED ? RED_TEAM : BLUE_TEAM;
    const team = this.teams[teamId];
    team.guesses = Math.min(9, team.guesses + 1);
    this.panel.setGuessValue(teamId, team.guesses);
  }

  public decreaseGuesses(_id: Uuid, params: string[]) {
    const teamId = params[0] === Message.RED ? RED_TEAM : BLUE_TEAM;
    const team = this.teams[teamId];
    team.guesses = Math.max(0, team.guesses - 1);
    this.panel.setGuessValue(teamId, team.guesses);
  }

  public onSubmitClick(_id: Uuid, params: string[]) {
    const message = params[0];
    switch (message) {
      case Message.BUTTON_START:
      case Message.BUTTON_NEXT_ROUND:
        if (!this.roundPending) {
          this.startNewRound();
        }
        return;
      case Message.BUTTON_ABORT_CONFIRM:
        if (this.roundPending) {
          this.resetGameState();
          return;
        }
    }
  }

  public onCancelClick(_id: Uuid, params: string[]) {
    const message = params[0];
    switch (message) {
      case Message.BUTTON_ABORT:
        this.panel.setView('message');
        this.panel.setMessage(Message.ABORT_GAME, Message.BUTTON_ABORT_CONFIRM, Message.BUTTON_CANCEL);
        return;
      case Message.BUTTON_CANCEL:
        this.panel.setView('board');
        this.panel.setAbortButton(Message.BUTTON_ABORT);
        return;
      case Message.BUTTON_END_GAME:
        this.resetGameState();
        return;
    }
  }

  public onEndTurnClick() {
    const { opponentId } = this.findTeams(this.activeTeam);
    if (!this.clueSubmitted) {
      return;
    }
    this.clueSubmitted = false;
    this.panel.setTeamMessage(this.activeTeam, Message.WAITING_OTHER_TEAM);
    this.panel.setTeamMessage(opponentId, Message.GIVE_A_CLUE, Message.BUTTON_SUBMIT);
    this.activeTeam = opponentId;

    const teamLabel = opponentId === RED_TEAM ? Message.RED : Message.BLUE;
    const message = Message.WAITING_FOR_SPYMASTER.replace('{color}', teamLabel);
    this.wordScreen.showMessage(message);
  }

  private resetGameState() {
    this.words = CONFIG.WORDS.slice();
    this.discard = [];
    this.boardItems = [];
    this.activeTeam = 0;
    this.clueSubmitted = false;
    this.roundPending = false;
    this.shuffle(this.words);

    for (const id of [RED_TEAM, BLUE_TEAM]) {
      this.teams[id].score = 0;
      this.teams[id].guesses = 1;
      this.scoreScreen.setScore(id, 0);
      this.scoreScreen.setWordsLeft(id, 0);
      this.panel.setGuessValue(id, 1);
      this.panel.setTeamWord(id, '');
    }

    this.board.renderBoard(this.boardItems);
    this.wordScreen.showMessage(Message.START_GAME_INFO);
    this.panel.setView('message');
    this.panel.setMessage(Message.START_GAME, Message.BUTTON_START);
  }

  private initLayoutEntities() {
    const position = Entities.getEntityProperties(this.entityId, ['position']).position;
    const entityIds = Entities.findEntities(position, 50);
    const entities = entityIds.map(id => Entities.getEntityProperties(id, ['parentID', 'name', 'renderWithZones']));

    this.board = new Board(this.entityId, entityIds, entities);
    this.panel = new Panel(this.entityId, entityIds, entities);
    this.scoreScreen = new ScoreScreen(this.entityId, entityIds, entities);
    this.wordScreen = new WordScreen(this.entityId, entityIds, entities);
    this.soundPlayer = new SoundPlayer(position);
  }

  private startNewRound() {
    const board = this.drawNewBoard();
    this.activeTeam = this.findTeamToStartRound();
    this.boardItems = this.createBoardKey(this.activeTeam, board);
    this.board.renderBoard(this.boardItems);
    this.roundPending = true;
    this.clueSubmitted = false;

    const { opponentId } = this.findTeams(this.activeTeam);

    this.panel.setView('board');
    this.panel.renderBoard(this.boardItems);
    this.panel.setAbortButton(Message.BUTTON_ABORT);
    this.panel.setTeamMessage(this.activeTeam, Message.GIVE_A_CLUE, Message.BUTTON_SUBMIT);
    this.panel.setTeamMessage(opponentId, Message.WAITING_OTHER_TEAM);
    this.scoreScreen.setWordsLeft(this.activeTeam, 9);
    this.scoreScreen.setWordsLeft(opponentId, 8);

    const teamLabel = this.activeTeam === RED_TEAM ? Message.RED : Message.BLUE;
    const message = Message.WAITING_FOR_SPYMASTER.replace('{color}', teamLabel);
    this.wordScreen.showMessage(message);
  }

  private showRoundOver(message: string) {
    this.panel.setView('message');
    this.panel.setMessage(
      message,
      Message.BUTTON_NEXT_ROUND,
      Message.BUTTON_END_GAME
    );
    this.wordScreen.showMessage(message);
    this.roundPending = false;
  }

  private getWordsLeft(): [number, number] {
    let redLeft = 0;
    let blueLeft = 0;
    for (const boardItem of this.boardItems) {
      if (boardItem.agentType === AgentType.RED && boardItem.facedown === false) {
        redLeft += 1;
      }
      if (boardItem.agentType === AgentType.BLUE && boardItem.facedown === false) {
        blueLeft += 1;
      }
    }
    return [redLeft, blueLeft];
  }

  private findTeamToStartRound(): number {
    if (this.boardItems.length === 0) {
      return Math.floor(Math.random() * 2); // 0 or 1
    }
    let red = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
      if (this.boardItems[i].agentType === AgentType.RED) {
        red += 1;
      }
    }
    return red === 9 ? BLUE_TEAM : RED_TEAM;
  }

  private findTeams(teamId: number): { team: Team, opponent: Team, opponentId: number } {
    const team = this.teams[teamId];
    const opponentId = this.activeTeam ? RED_TEAM : BLUE_TEAM;
    const opponent = this.teams[opponentId];
    return { team, opponentId, opponent };
  }

  private createBoardKey(teamId: number, board: string[]): BoardItem[] {
    const keys: AgentType[] = [];

    // 8 agents of each team
    for (let i = 0; i < 8; i++) {
      keys.push(AgentType.RED);
      keys.push(AgentType.BLUE);
    }

    // one double agent
    keys.push(teamId ? AgentType.BLUE : AgentType.RED);

    // 7 innocent bystaners
    for (let i = 0; i < 7; i++) {
      keys.push(AgentType.INNOCENT);
    }

    // one assasin
    keys.push(AgentType.ASSASIN);
    this.shuffle(keys);

    return board.map((word, index) => ({
      word,
      agentType: keys[index],
      facedown: false
    }));
  }

  private drawNewBoard() {
    if (this.words.length < BOARD_SIZE) {
      this.shuffle(this.discard);
      this.words.splice(this.words.length, 0, ...this.discard);
      this.discard.length = 0;
    }
    const board = this.words.slice(0, BOARD_SIZE);
    this.discard.splice(0, 0, ...board);
    this.words.splice(0, board.length);
    return board;
  }

  private shuffle(arr: Array<any>) {
    let r, tmp;
    for (let i = 0; i < arr.length; i++) {
      r = Math.floor(Math.random() * arr.length);
      tmp = arr[r];
      arr[r] = arr[i];
      arr[i] = tmp;
    }
  }

}

export default new CodenamesServer();
