import { useEffect, useState } from 'react';
import { VotingArea as VotingAreaModel } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';

/**
 * The events that the VotingAreaController emits to subscribers. These events
 * are only ever emitted to local components (not to the townService).
 */
export type VotingAreaEvents = BaseInteractableEventMap & {
  pollChange: (newPoll: string) => void;
};

// The special string that will be displayed when a conversation area does not have a topic set
export const NO_POLL_STRING = '(No poll)';
/**
 * A VotingAreaController manages the local behavior of a voting area in the frontend,
 * implementing the logic to bridge between the townService's interpretation of voting areas and the
 * frontend's. The VotingAreaController emits events when the voting area changes.
 */
export default class VotingAreaController extends InteractableAreaController<
  VotingAreaEvents,
  VotingAreaModel
> {
  private _poll: string;

  /**
   * Create a new VotingAreaController
   * @param id
   * @param poll
   */
  constructor(id: string, poll: string) {
    super(id);
    this._poll = poll;
  }

  public isActive(): boolean {
    return this.poll !== '' && this.occupants.length > 0;
  }

  /**
   * The poll of the voting area. Changing the poll will emit a pollChange event
   *
   * Setting the poll to the value `undefined` will indicate that the voting area is not active
   */
  set poll(newPoll: string) {
    if (this._poll !== newPoll) {
      this.emit('pollChange', newPoll);
    }
    this._poll = newPoll;
  }

  get poll(): string {
    return this._poll;
  }

  protected _updateFrom(newModel: VotingAreaModel): void {
    this.poll = newModel.poll;
  }

  /**
   * A voting area is empty if there are no occupants in it, or the poll is undefined.
   */
  isEmpty(): boolean {
    return this._poll === '' || this.occupants.length === 0;
  }

  /**
   * Return a representation of this VotingAreaController that matches the
   * townService's representation and is suitable for transmitting over the network.
   */
  toInteractableAreaModel(): VotingAreaModel {
    return {
      id: this.id,
      occupants: this.occupants.map(player => player.id),
      poll: this.poll,
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
  ): VotingAreaController {
    const ret = new VotingAreaController(convAreaModel.id, convAreaModel.poll);
    ret.occupants = playerFinder(convAreaModel.occupants);
    return ret;
  }
}

/**
 * A react hook to retrieve the poll of a VotingAreaController.
 * If there is currently no topic defined, it will return NO_POLL_STRING.
 *
 * This hook will re-render any components that use it when the poll changes.
 */
export function useVotingAreaPoll(area: VotingAreaController): string {
  const [poll, setPoll] = useState(area.poll);
  useEffect(() => {
    area.addListener('pollChange', setPoll);
    return () => {
      area.removeListener('pollChange', setPoll);
    };
  }, [area]);
  return poll || NO_POLL_STRING;
}
