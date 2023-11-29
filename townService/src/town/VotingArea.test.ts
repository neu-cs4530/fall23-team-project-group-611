import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { getLastEmittedEvent } from '../TestUtils';
import { TownEmitter } from '../types/CoveyTownSocket';
import VotingArea from './VotingArea';

describe('VotingArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: VotingArea;
  const townEmitter = mock<TownEmitter>();
  const id = nanoid();
  const votes = 0;
  let newPlayer: Player;

  beforeEach(() => {
    mockClear(townEmitter);
    testArea = new VotingArea({ id, occupants: [], votes }, testAreaBox, townEmitter);
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
  });
  describe('joining the voting area', () => {
    it('Adds the player to the occupants list and emits an interactableUpdate event', () => {
      testArea.add(newPlayer);
      expect(testArea.occupantsByID).toEqual([newPlayer.id]);
      expect(testArea.isActive).toBe(true);

      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        votes,
        id,
        occupants: [newPlayer.id],
        type: 'VotingArea',
      });
    });
    it("Sets the player's votes and emits an update for their location", () => {
      testArea.add(newPlayer);
      expect(newPlayer.location.interactableID).toEqual(id);

      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toEqual(id);
    });
  });
  describe('leaving the voting area', () => {
    it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {
      testArea.add(newPlayer);
      const newerPlayer = new Player(nanoid(), mock<TownEmitter>());
      testArea.add(newerPlayer);
      testArea.remove(newPlayer);

      expect(testArea.occupantsByID).toEqual([newerPlayer.id]);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        votes,
        id,
        occupants: [newerPlayer.id],
        type: 'VotingArea',
      });
    });
    it("Clears the player's votes and emits an update for their location", () => {
      testArea.add(newPlayer);
      testArea.remove(newPlayer);
      expect(newPlayer.location.interactableID).toBeUndefined();
      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toBeUndefined();
    });
    it('Clears the votes of the VotingArea when the last occupant leaves', () => {
      testArea.add(newPlayer);
      testArea.remove(newPlayer);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        votes: 0,
        id,
        occupants: [],
        type: 'VotingArea',
      });
      // expect(testArea.votingTopic).toBeUndefined();
    });
  });
});
