import {
  GameArea,
  GameStatus,
  TicTacToeGameState,
  TicTacToeGridPosition,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';

export const PLAYER_NOT_IN_GAME_ERROR = 'Player is not in game';

export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';

export type TicTacToeCell = 'X' | 'O' | undefined;
export type TicTacToeEvents = GameEventTypes & {
  boardChanged: (board: TicTacToeCell[][]) => void;
  turnChanged: (isOurTurn: boolean) => void;
};

/**
 * This class is responsible for managing the state of the Tic Tac Toe game, and for sending commands to the server
 */
export default class TicTacToeAreaController extends GameAreaController<
  TicTacToeGameState,
  TicTacToeEvents
> {
  /**
   * Returns the current state of the board.
   *
   * The board is a 3x3 array of TicTacToeCell, which is either 'X', 'O', or undefined.
   *
   * The 2-dimensional array is indexed by row and then column, so board[0][0] is the top-left cell,
   * and board[2][2] is the bottom-right cell
   */
  get board(): TicTacToeCell[][] {
    const moves = this._model.game?.state.moves;
    const arrBoard: TicTacToeCell[][] = [
      [undefined, undefined, undefined],
      [undefined, undefined, undefined],
      [undefined, undefined, undefined],
    ];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (moves?.find(m => m.row == row && m.col == col) != undefined) {
          arrBoard[row][col] = moves?.find(m => m.row == row && m.col == col)?.gamePiece;
        }
      }
    }
    return arrBoard;
  }

  /**
   * Returns the player with the 'X' game piece, if there is one, or undefined otherwise
   */
  get x(): PlayerController | undefined {
    if (this._model.game?.state.x != undefined) {
      return this.occupants.find(o => o.id == this._model.game?.state.x);
    } else {
      return undefined;
    }
  }

  /**
   * Returns the player with the 'O' game piece, if there is one, or undefined otherwise
   */
  get o(): PlayerController | undefined {
    if (this._model.game?.state.o != undefined) {
      return this.occupants.find(o => o.id == this._model.game?.state.o);
    } else {
      return undefined;
    }
  }

  /**
   * Returns the number of moves that have been made in the game
   */
  get moveCount(): number {
    return this.board.reduce((moves, row) => moves + row.filter(r => r != undefined).length, 0);
  }

  /**
   * Returns the winner of the game, if there is one
   */
  get winner(): PlayerController | undefined {
    if (this._model.game?.state.x == this._model.game?.state.winner) {
      return this.x;
    } else if (this._model.game?.state.o == this._model.game?.state.winner) {
      return this.o;
    } else {
      return undefined;
    }
  }

  /**
   * Returns the player whose turn it is, if the game is in progress
   * Returns undefined if the game is not in progress
   */
  get whoseTurn(): PlayerController | undefined {
    if (!this.isActive()) {
      return undefined;
    } else if (this.moveCount % 2 == 0) {
      return this.x;
    } else {
      return this.o;
    }
  }

  /**
   * Returns true if it is our turn to make a move in the game
   * Returns false if it is not our turn, or if the game is not in progress
   */
  get isOurTurn(): boolean {
    return this.whoseTurn == this._townController.ourPlayer;
  }

  /**
   * Returns true if the current player is a player in this game
   */
  get isPlayer(): boolean {
    return this._townController.ourPlayer == this.x || this._townController.ourPlayer == this.o;
  }

  /**
   * Returns the game piece of the current player, if the current player is a player in this game
   *
   * Throws an error PLAYER_NOT_IN_GAME_ERROR if the current player is not a player in this game
   */
  get gamePiece(): 'X' | 'O' {
    if (this._townController.ourPlayer == this.x) {
      return 'X';
    } else if (this._townController.ourPlayer == this.o) {
      return 'O';
    } else {
      throw new Error(PLAYER_NOT_IN_GAME_ERROR);
    }
  }

  /**
   * Returns the status of the game.
   * Defaults to 'WAITING_TO_START' if the game is not in progress
   */
  get status(): GameStatus {
    if (this._model.game?.state.status == undefined) {
      return 'WAITING_TO_START';
    } else {
      return this._model.game?.state.status;
    }
  }

  /**
   * Returns true if the game is in progress
   */
  public isActive(): boolean {
    return this.status == 'IN_PROGRESS';
  }

  /**
   * Updates the internal state of this TicTacToeAreaController to match the new model.
   *
   * Calls super._updateFrom, which updates the occupants of this game area and
   * other common properties (including this._model).
   *
   * If the board has changed, emits a 'boardChanged' event with the new board. If the board has not changed,
   *  does not emit the event.
   *
   * If the turn has changed, emits a 'turnChanged' event with true if it is our turn, and false otherwise.
   * If the turn has not changed, does not emit the event.
   */
  protected _updateFrom(newModel: GameArea<TicTacToeGameState>): void {
    const oldBoard = this.board;
    const oldTurn = this.whoseTurn;

    super._updateFrom(newModel);

    const newBoard = this.board;
    const newTurn = this.whoseTurn;

    if (this._boardChanged(oldBoard, newBoard)) {
      this.emit('boardChanged', this.board);
    }
    if (oldTurn != newTurn) {
      this.emit('turnChanged', this.isOurTurn);
    }
  }

  /**
   * Compares the rows and columns of the old board and the new board.
   *
   * Returns true if there has been a change between the two boards.
   *
   * @param oldBoard The board before super._updateFrom is called
   * @param newBoard The board after super._updateFrom is called
   */
  private _boardChanged(oldBoard: TicTacToeCell[][], newBoard: TicTacToeCell[][]): boolean {
    let changes = false;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (oldBoard[row][col] != newBoard[row][col]) {
          changes = true;
        }
      }
    }
    return changes;
  }

  /**
   * Sends a request to the server to make a move in the game.
   * Uses the this._townController.sendInteractableCommand method to send the request.
   * The request should be of type 'GameMove',
   * and send the gameID provided by `this._instanceID`.
   *
   * If the game is not in progress, throws an error NO_GAME_IN_PROGRESS_ERROR
   *
   * @param row Row of the move
   * @param col Column of the move
   */
  public async makeMove(row: TicTacToeGridPosition, col: TicTacToeGridPosition) {
    if (!this.isActive || this._instanceID === undefined) {
      throw new Error(NO_GAME_IN_PROGRESS_ERROR);
    } else {
      const instanceID = this._instanceID;
      const gamePiece = this.gamePiece;
      if (instanceID) {
        await this._townController.sendInteractableCommand(this.id, {
          type: 'GameMove',
          gameID: instanceID,
          move: { row, col, gamePiece },
        });
      }
    }
  }
}
