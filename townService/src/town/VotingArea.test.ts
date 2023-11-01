import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { getLastEmittedEvent } from '../TestUtils';
import { TownEmitter } from '../types/CoveyTownSocket';
// import VotingArea from './VotingArea';

// ********* NOTE: THIS IS A SKELETON FOR THE TESTS FOR JOINING AND LEAVING A VOTINGAREA (inspired from interactableArea/conversationArea tests)
// THESE TEST WILL ALMOST CERTAINLY NEED TO BE UPDATED AS VOTINGAREA IS FURTHER IMPLEMENTED ********
describe('VotingArea', () => {
  // const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  // let testArea: VotingArea;
  const townEmitter = mock<TownEmitter>();
  const votingTopic = nanoid();
  const id = nanoid();
  let newPlayer: Player;

  beforeEach(() => {
    mockClear(townEmitter);
    // testArea = new VotingArea({ topic, id, occupants: [] }, testAreaBox, townEmitter);
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
  });
  describe('join', () => {
    it('Adds the player to the occupants list and emits an interactableUpdate event', () => {
      // testArea.join(newPlayer);
      // expect(testArea.occupantsByID).toEqual([newPlayer.id]);

      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        votingTopic,
        id,
        occupants: [newPlayer.id],
        type: 'VotingArea',
      });
    });
    it("Sets the player's votingTopicLabel and emits an update for their location", () => {
      expect(newPlayer.location.interactableID).toEqual(id);

      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toEqual(id);
    });
  });
  describe('leave', () => {
    it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {
      const extraPlayer = new Player(nanoid(), mock<TownEmitter>());
      // testArea.join(extraPlayer);
      // testArea.leave(newPlayer);

      // expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        votingTopic,
        id,
        occupants: [extraPlayer.id],
        type: 'VotingArea',
      });
    });
    it("Clears the player's votingTopicLabel and emits an update for their location", () => {
      // testArea.leave(newPlayer);
      expect(newPlayer.location.interactableID).toBeUndefined();
      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toBeUndefined();
    });
    it('Clears the votingTopic of the VotingArea when the last occupant leaves', () => {
      // testArea.leave(newPlayer);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        votingTopic: undefined,
        id,
        occupants: [],
        type: 'VotingArea',
      });
      // expect(testArea.votingTopic).toBeUndefined();
    });
  });
});
