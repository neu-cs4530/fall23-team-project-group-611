// import { ChakraProvider } from '@chakra-ui/react';
// import { EventNames } from '@socket.io/component-emitter';
// import { cleanup, render, RenderResult } from '@testing-library/react';
// import { mock, MockProxy } from 'jest-mock-extended';
// import React from 'react';
// import { act } from 'react-dom/test-utils';
import * as ReactPlayer from 'react-player';
// import TownController from '../../../classes/TownController';
// import VotingAreaController, {
//   VotingAreaEvents,
// } from '../../../classes/interactable/VotingAreaController';
// import TownControllerContext from '../../../contexts/TownControllerContext';
// import VotingArea from './VotingArea';
// import { nanoid } from 'nanoid';

// // A sentinel value that we will render in the mock react player component to help find it in the DOM tree
// const MOCK_REACT_PLAYER_PLACEHOLDER = 'MOCK_REACT_PLAYER_PLACEHOLER';
// // Mocking a React class-based component appears to be quite challenging; we define our own class
// // // to use as a mock here. Using jest-mock-extended's mock<ReactPlayer>() doesn't work.
// class MockReactPlayer extends React.Component {
//   private _componentDidUpdateSpy: jest.Mock<never, [ReactPlayer.ReactPlayerProps]>;

//   private _seekSpy: jest.Mock<never, [number]>;

//   public currentVotes = 0;

//   constructor(
//     props: ReactPlayer.ReactPlayerProps,
//     componentDidUpdateSpy: jest.Mock<never, [ReactPlayer.ReactPlayerProps]>,
//     seekSpy: jest.Mock<never, [number]>,
//   ) {
//     super(props);
//     this._componentDidUpdateSpy = componentDidUpdateSpy;
//     this._seekSpy = seekSpy;
//   }
// }

//   getCurrentVotes() {
//     return this.currentVotes;
//   }

//   seekTo(newVotes: number) {
//     this.currentVotes = newVotes;
//     this._seekSpy(newVotes);
//   }

//   componentDidUpdate(): void {
//     this._componentDidUpdateSpy(this.props);
//   }

// render(): React.ReactNode {
//   return <>{MOCK_REACT_PLAYER_PLACEHOLDER}</>;
// }

// const reactPlayerSpy = jest.spyOn(ReactPlayer, 'default');
// // This TS ignore is necessary in order to spy on a react class based component, apparently...
// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-ignore
// reactPlayerSpy.prototype = React.Component.prototype;

// function renderVotingArea(votingArea: VotingAreaController, controller: TownController) {
//   return (
//     <ChakraProvider>
//       <TownControllerContext.Provider value={controller}>
//         <VotingArea controller ={votingArea} />
//       </TownControllerContext.Provider>
//     </ChakraProvider>
//   );
// }

describe('VotingArea', () => {
  const mockReactPlayerConstructor = jest.fn<never, [ReactPlayer.ReactPlayerProps]>();
  const componentDidUpdateSpy = jest.fn<never, [ReactPlayer.ReactPlayerProps]>();
  const seekSpy = jest.fn<never, [number]>();
  //   let mockReactPlayer: MockReactPlayer;
  //   let votingArea: VotingAreaController;
  //   type VotingAreaEventName = keyof VotingAreaEvents;
  //   let addListenerSpy: jest.SpyInstance<
  //     VotingAreaController,
  //     [event: VotingAreaEventName, listener: VotingAreaEvents[VotingAreaEventName]]
  //   >;

  //   let removeListenerSpy: jest.SpyInstance<
  //     VotingAreaController,
  //     [event: VotingAreaEventName, listener: VotingAreaEvents[VotingAreaEventName]]
  //   >;

  //   let townController: MockProxy<TownController>;

  //   let renderData: RenderResult;
  beforeAll(() => {
    //     reactPlayerSpy.mockImplementation(function (props) {
    //       mockReactPlayerConstructor(props);
    //       const ret = new MockReactPlayer(props, componentDidUpdateSpy, seekSpy);
    //       mockReactPlayer = ret;
    //       return ret as any;
    //     });
  });
  beforeEach(() => {
    mockReactPlayerConstructor.mockClear();
    componentDidUpdateSpy.mockClear();
    seekSpy.mockClear();
    //     townController = mock<TownController>();
    //     votingArea = new VotingAreaController(nanoid(), 0);

    //     addListenerSpy = jest.spyOn(votingArea, 'addListener');
    //     removeListenerSpy = jest.spyOn(votingArea, 'removeListener');

    //     renderData = render(renderVotingArea(votingArea, townController));
  });
  //   /**
  //    * Retrieve the properties passed to the ReactPlayer the first time it was rendered
  //    */
  //   function firstReactPlayerConstructorProps() {
  //     return mockReactPlayerConstructor.mock.calls[0][0];
  //   }
  //   /**
  //    * Retrieve the properties passed to the ReactPlayer the last time it was rendered
  //    */
  //   function lastReactPlayerPropUpdate() {
  //     return componentDidUpdateSpy.mock.calls[componentDidUpdateSpy.mock.calls.length - 1][0];
  //   }
  //   /**
  //    * Retrieve the votes that were passed to 'seek' in its most recent call
  //    */
  //   function lastSeekCall() {
  //     return seekSpy.mock.calls[seekSpy.mock.calls.length - 1][0];
  //   }
  //   /**
  //    * Retrieve the listener passed to "addListener" for a given eventName
  //    * @throws Error if the addListener method was not invoked exactly once for the given eventName
  //    */
  //   function getSingleListenerAdded<Ev extends EventNames<VotingAreaEvents>>(
  //     eventName: Ev,
  //     spy = addListenerSpy,
  //   ): VotingAreaEvents[Ev] {
  //     const addedListeners = spy.mock.calls.filter(eachCall => eachCall[0] === eventName);
  //     if (addedListeners.length !== 1) {
  //       throw new Error(
  //         `Expected to find exactly one addListener call for ${eventName} but found ${addedListeners.length}`,
  //       );
  //     }
  //     return addedListeners[0][1] as unknown as VotingAreaEvents[Ev];
  //   }
  //   /**
  //    * Retrieve the listener pased to "removeListener" for a given eventName
  //    * @throws Error if the removeListener method was not invoked exactly once for the given eventName
  //    */
  //   function getSingleListenerRemoved<Ev extends EventNames<VotingAreaEvents>>(
  //     eventName: Ev,
  //   ): VotingAreaEvents[Ev] {
  //     const removedListeners = removeListenerSpy.mock.calls.filter(
  //       eachCall => eachCall[0] === eventName,
  //     );
  //     if (removedListeners.length !== 1) {
  //       throw new Error(
  //         `Expected to find exactly one removeListeners call for ${eventName} but found ${removedListeners.length}`,
  //       );
  //     }
  //     return removedListeners[0][1] as unknown as VotingAreaEvents[Ev];
  //   }
  describe('join', () => {
    it('Adds player to the occupants list and emits an interactableUpdate event', () => {});
    it('Initializes votes prop to undefined or players votes/ votes from controller?? when first player joins', () => {});
    it('Properly initializes players voting data from third party when they join the VotingArea', () => {});
  });
  // });
  describe('leave', () => {
    it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {});
    it('Clears the votingTopicLabel and emits an update for their location', () => {});
    it('Clears the votingTopic of the VotingArea when the last occupant leaves', () => {});
  });
});
