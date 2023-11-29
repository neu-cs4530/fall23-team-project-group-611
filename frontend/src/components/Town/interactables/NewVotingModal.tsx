import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import {
  useActiveVotingAreas,
  useInteractable,
  useInteractableAreaController,
} from '../../../classes/TownController';
import { InteractableID, Omit_VotingArea_type_ } from '../../../generated/client';
import useTownController from '../../../hooks/useTownController';
import VotingAreaController from '../../../classes/interactable/VotingAreaController';
import PlayerController from '../../../classes/PlayerController';
import VotingArea from './VotingArea';

export default function NewVotingModal(): JSX.Element {
  const coveyTownController = useTownController();
  const newVoting = useInteractable('votingArea');
  const votingArea = useInteractable<VotingArea>('votingArea');
  // if (!votingArea?.name) {
  //   return <></>;
  // }
  const votingAreaControllers = useActiveVotingAreas();
  console.log(votingAreaControllers);
  const thisVotingAreaController = votingAreaControllers.find(
    controller => controller.id === votingArea?.id,
  );
  // const controller = useInteractableAreaController(thisVotingAreaController?.id);

  const [votes, setVotes] = useState<string>('');

  const isOpen = newVoting !== undefined;

  useEffect(() => {
    if (newVoting) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, newVoting]);

  const closeModal = useCallback(() => {
    if (newVoting) {
      coveyTownController.interactEnd(newVoting);
    }
  }, [coveyTownController, newVoting]);

  const toast = useToast();

  const createVoting = useCallback(async () => {
    if (votes && newVoting) {
      const votingToCreate: Omit_VotingArea_type_ = {
        id: newVoting.name,
        occupants: [],
        votes: 0,
      };
      try {
        await coveyTownController.createVotingArea(votingToCreate);
        toast({
          title: 'Voting Created!',
          status: 'success',
        });
        setVotes('');
        coveyTownController.unPause();
        closeModal();
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: 'Unable to create voting',
            description: err.toString(),
            status: 'error',
          });
        } else {
          console.trace(err);
          toast({
            title: 'Unexpected Error',
            status: 'error',
          });
        }
      }
    }
  }, [votes, setVotes, coveyTownController, newVoting, closeModal, toast]);

  const [showPlayerList, setShowPlayerList] = useState<boolean>(false);
  function handleVoteKick(): void {
    setShowPlayerList(true);
  }
  function handleRemovePlayer(
    occupant: PlayerController,
  ): React.MouseEventHandler<HTMLButtonElement> | undefined {
    thisVotingAreaController.removePlayer(occupant);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create a voting in {newVoting?.name} </ModalHeader>
        <ModalCloseButton />
        <form
          onSubmit={ev => {
            ev.preventDefault();
            createVoting();
          }}>
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Email address</FormLabel>
              <Input type='email' />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={createVoting}>
              Create
            </Button>
            <Button onClick={closeModal}>Cancel</Button>
          </ModalFooter>
        </form>
        <Button onClick={handleVoteKick}>Vote to kick</Button>
        {showPlayerList && (
          <VStack>
            {thisVotingAreaController.occupants.map(occupant => {
              return (
                <Button key={occupant.id} onClick={handleRemovePlayer(occupant)}>
                  {occupant.userName}
                </Button>
              );
            })}
          </VStack>
        )}
      </ModalContent>
    </Modal>
  );
}
