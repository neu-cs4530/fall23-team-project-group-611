import { mock, mockClear, MockProxy } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { VotingArea } from '../../types/CoveyTownSocket';
import TownController from '../TownController';
import VotingAreaController, { VotingAreaEvents } from './VotingAreaController';

describe('[T2] ViewingAreaController', () => {
  // A valid ViewingAreaController to be reused within the tests
  let testArea: VotingAreaController;
  let testAreaModel: VotingArea;
  const townController: MockProxy<TownController> = mock<TownController>();
  const mockListeners = mock<VotingAreaEvents>();
  beforeEach(() => {
    testAreaModel = {
      votes: 0,
      id: nanoid(),
      occupants: [],
      type: 'VotingArea',
    };
    testArea = new VotingAreaController(testAreaModel.id, testAreaModel.votes);
    mockClear(townController);
    mockClear(mockListeners.votesChange);
    testArea.addListener('votesChange', mockListeners.votesChange);
  });
  describe('Setting votes property', () => {
    it('updates the property and emits a votesChange event if the property changes', () => {
      const newVotes = 11;
      testArea.votes = newVotes;
      expect(mockListeners.votesChange).toBeCalledWith(newVotes);
      expect(testArea.votes).toEqual(newVotes);
    });
    it('does not emit a votesChange event if the votes property does not change', () => {
      testArea.votes = testAreaModel.votes;
      expect(mockListeners.videoChange).not.toBeCalled();
    });
  });
  describe('votingAreaModel', () => {
    it('Carries through all of the properties', () => {
      const model = testArea.toInteractableAreaModel();
      expect(model).toEqual(testAreaModel);
    });
  });
  describe('updateFrom', () => {
    it('Updates the votes properties from new model', () => {
      const newModel: VotingArea = {
        id: testAreaModel.id,
        votes: 11,
        occupants: [],
        type: 'VotingArea',
      };
      testArea.updateFrom(newModel, []);
      expect(testArea.votes).toEqual(newModel.votes);
      expect(mockListeners.votesChange).toBeCalledWith(newModel.votes);
    });
    it('Does not update the id property', () => {
      const existingID = testArea.id;
      const newModel: VotingArea = {
        id: nanoid(),
        votes: 0,
        occupants: [],
        type: 'VotingArea',
      };
      testArea.updateFrom(newModel, []);
      expect(testArea.id).toEqual(existingID);
    });
  });
});
