import { useEffect, useState } from 'react';
import { Player, VotingArea as VotingAreaModel } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';
import TownController from '../TownController';

/**
 * The events that the VotingAreaController emits to subscribers. These events
 * are only ever emitted to local components (not to the townService).
 */
export type VotingAreaEvents = BaseInteractableEventMap & {
  votesChange: (newVotes: number) => void;
};

/**
 * A VotingAreaController manages the local behavior of a voting area in the frontend,
 * implementing the logic to bridge between the townService's interpretation of voting areas and the
 * frontend's. The VotingAreaController emits events when the voting area changes.
 */
export default class VotingAreaController extends InteractableAreaController<
  VotingAreaEvents,
  VotingAreaModel
> {
  private _votes: number;

  protected _townController: TownController;

  /**
   * Create a new VotingAreaController
   * @param id
   * @param votes
   */
  constructor(id: string, votes: number, townController: TownController) {
    super(id);
    this._votes = votes;
    this._townController = townController;
  }

  public isActive(): boolean {
    return this.votes !== undefined && this.occupants.length > 0;
  }

  /**
   * The votes of the voting area. Changing the votes will emit a votesChange event
   *
   * Setting the votes to the value `undefined` will indicate that the voting area is not active
   */
  set votes(newVotes: number) {
    if (this._votes !== newVotes) {
      this.emit('votesChange', newVotes);
    }
    this._votes = newVotes;
  }

  get votes(): number {
    return this._votes;
  }

  protected _updateFrom(newModel: VotingAreaModel): void {
    this.votes = newModel.votes;
  }

  /**
   * A voting area is empty if there are no occupants in it, or the votes is undefined.
   */
  isEmpty(): boolean {
    return this._votes === undefined || this.occupants.length === 0;
  }

  /**
   * Return a representation of this VotingAreaController that matches the
   * townService's representation and is suitable for transmitting over the network.
   */
  toInteractableAreaModel(): VotingAreaModel {
    return {
      id: this.id,
      occupants: this.occupants.map(player => player.id),
      votes: this.votes,
      type: 'VotingArea',
    };
  }

  /**
   * Create a new VotingAreaController to match a given VotingAreaModel
   * @param convAreaModel Voting area to represent
   * @param playerFinder A function that will return a list of PlayerController's
   *                     matching a list of Player ID's
   */
  static fromVotingAreaModel(
    convAreaModel: VotingAreaModel,
    playerFinder: (playerIDs: string[]) => PlayerController[],
    theTownController: TownController,
  ): VotingAreaController {
    const ret = new VotingAreaController(convAreaModel.id, convAreaModel.votes, theTownController);
    ret.occupants = playerFinder(convAreaModel.occupants);
    return ret;
  }

  /**
   * Sends a request to the server to remove the player from this area (and set them to the spawn point?)
   * Uses the this._townController.sendInteractableCommand method to send the request.
   * The request should be of type 'KickPlayerCommand',
   * and send the gameID provided by `this._instanceID`.
   *
   *
   * @param player: the player to remove from the area
   */
  public async removePlayer(player: Player): Promise<void> {
    // if (this.occupants.length === 0)
    await this._townController.sendInteractableCommand(this.id, {
      type: 'KickPlayerCommand',
      playerid: player.id,
    });
  }
}

/**
 * A react hook to retrieve the votes of a VotingAreaController.
 *
 * This hook will re-render any components that use it when the votes changes.
 */
export function useVotingAreaVotes(area: VotingAreaController): number {
  const [votes, setVotes] = useState(area.votes);
  useEffect(() => {
    area.addListener('votesChange', setVotes);
    return () => {
      area.removeListener('votesChange', setVotes);
    };
  }, [area]);
  return votes;
}
