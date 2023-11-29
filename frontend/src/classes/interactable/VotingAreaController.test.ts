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
      poll: 0,
      id: nanoid(),
      occupants: [],
      type: 'VotingArea',
    };
    testArea = new VotingAreaController(testAreaModel.id, testAreaModel.poll);
    mockClear(townController);
    mockClear(mockListeners.pollChange);
    testArea.addListener('pollChange', mockListeners.pollChange);
  });
  describe('Setting poll property', () => {
    it('updates the property and emits a pollChange event if the property changes', () => {
      const newPoll = 11;
      testArea.poll = newPoll;
      expect(mockListeners.pollChange).toBeCalledWith(newPoll);
      expect(testArea.poll).toEqual(newPoll);
    });
    it('does not emit a pollChange event if the poll property does not change', () => {
      testArea.poll = testAreaModel.poll;
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
    it('Updates the poll properties from new model', () => {
      const newModel: VotingArea = {
        id: testAreaModel.id,
        poll: 11,
        occupants: [],
        type: 'VotingArea',
      };
      testArea.updateFrom(newModel, []);
      expect(testArea.poll).toEqual(newModel.poll);
      expect(mockListeners.pollChange).toBeCalledWith(newModel.poll);
    });
    it('Does not update the id property', () => {
      const existingID = testArea.id;
      const newModel: VotingArea = {
        id: nanoid(),
        poll: 0,
        occupants: [],
        type: 'VotingArea',
      };
      testArea.updateFrom(newModel, []);
      expect(testArea.id).toEqual(existingID);
    });
  });
});
