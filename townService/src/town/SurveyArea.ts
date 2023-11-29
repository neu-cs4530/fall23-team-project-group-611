import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import InvalidParametersError from '../lib/InvalidParametersError';
import Player from '../lib/Player';
import {
  BoundingBox,
  SurveyArea as SurveyAreaModel,
  InteractableCommand,
  InteractableCommandReturnType,
  TownEmitter,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class SurveyArea extends InteractableArea {
  public responses: Record<string, number>;

  public readonly type = 'SurveyArea';

  /** The survey area is "active" when there are players inside of it  */
  public get isActive(): boolean {
    return this._occupants.length > 0;
  }

  /**
   * Creates a new SurveyArea
   */
  public constructor(
    { responses, id }: Omit<SurveyAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this.responses = responses;
  }

  /**
   * Removes a player from this survey area.
   *
   *
   * @param player
   */
  public remove(player: Player) {
    super.remove(player);
    if (this._occupants.length === 0) {
      this.responses = {};
      this._emitAreaChanged();
    }
  }

  /**
   * Convert this SurveyArea instance to a simple SurveyAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): SurveyAreaModel {
    return {
      id: this.id,
      occupants: this.occupantsByID,
      responses: this.responses,
      type: 'SurveyArea',
    };
  }

  /**
   * Creates a new VotingArea object that will represent a Voting Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this survey area exists
   * @param broadcastEmitter An emitter that can be used by this voting area to broadcast updates
   * @returns
   */
  public static fromMapObject(
    mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter,
  ): SurveyArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed survey area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new SurveyArea({ responses: {}, id: name, occupants: [] }, rect, broadcastEmitter);
  }

  public handleCommand<
    CommandType extends InteractableCommand,
  >(): InteractableCommandReturnType<CommandType> {
    throw new InvalidParametersError('Unknown command type');
  }
}
