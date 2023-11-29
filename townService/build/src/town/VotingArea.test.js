import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { getLastEmittedEvent } from '../TestUtils';
import VotingArea from './VotingArea';
describe('VotingArea', () => {
    const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
    let testArea;
    const townEmitter = mock();
    const id = nanoid();
    const votes = 0;
    let newPlayer;
    beforeEach(() => {
        mockClear(townEmitter);
        testArea = new VotingArea({ id, occupants: [], votes }, testAreaBox, townEmitter);
        newPlayer = new Player(nanoid(), mock());
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
            const newerPlayer = new Player(nanoid(), mock());
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
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVm90aW5nQXJlYS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Rvd24vVm90aW5nQXJlYS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDckQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUNoQyxPQUFPLE1BQU0sTUFBTSxlQUFlLENBQUM7QUFDbkMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRW5ELE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQztBQUV0QyxRQUFRLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUMxQixNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQztJQUNoRSxJQUFJLFFBQW9CLENBQUM7SUFDekIsTUFBTSxXQUFXLEdBQUcsSUFBSSxFQUFlLENBQUM7SUFDeEMsTUFBTSxFQUFFLEdBQUcsTUFBTSxFQUFFLENBQUM7SUFDcEIsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ2hCLElBQUksU0FBaUIsQ0FBQztJQUV0QixVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ2QsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3ZCLFFBQVEsR0FBRyxJQUFJLFVBQVUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNsRixTQUFTLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFlLENBQUMsQ0FBQztJQUN4RCxDQUFDLENBQUMsQ0FBQztJQUNILFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSxH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