import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import InvalidParametersError from '../lib/InvalidParametersError';
import Player from '../lib/Player';
import {
  BoundingBox,
  VotingArea as VotingAreaModel,
  InteractableCommand,
  InteractableCommandReturnType,
  TownEmitter,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class VotingArea extends InteractableArea {
  /* The poll of the voting area, or undefined if it is not set */
  public poll: string;

  /** The voting area is "active" when there is a poll inside of it  */
  public get isActive(): boolean {
    return this.poll !== '';
  }

  /**
   * Creates a new VotingArea
   *
   * @param votingAreaModel model containing this area's current poll and its ID
   * @param coordinates  the bounding box that defines this voting area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { poll, id }: Omit<VotingAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this.poll = poll;
  }

  /**
   * Removes a player from this voting area.
   *
   * Extends the base behavior of InteractableArea to set the poll of this VotingArea to undefined and
   * emit an update to other players in the town when the last player leaves.
   *
   * @param player
   */
  public remove(player: Player) {
    super.remove(player);
    if (this.poll === '') {
      this._emitAreaChanged();
    }
  }

  /**
   * Convert this VotingArea instance to a simple VotingAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): VotingAreaModel {
    return {
      id: this.id,
      occupants: this.occupantsByID,
      poll: this.poll,
      type: 'VotingArea',
    };
  }

  /**
   * Creates a new VotingArea object that will represent a Voting Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this voting area exists
   * @param broadcastEmitter An emitter that can be used by this voting area to broadcast updates
   * @returns
   */
  public static fromMapObject(
    mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter,
  ): VotingArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new VotingArea({ poll: '', id: name, occupants: [] }, rect, broadcastEmitter);
  }

  public handleCommand<
    CommandType extends InteractableCommand,
  >(): InteractableCommandReturnType<CommandType> {
    throw new InvalidParametersError('Unknown command type');
  }
}
