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
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable } from '../../../classes/TownController';
import { Omit_VotingArea_type_ } from '../../../generated/client';
import useTownController from '../../../hooks/useTownController';

export default function NewVotingModal(): JSX.Element {
  const coveyTownController = useTownController();
  const newVoting = useInteractable('votingArea');
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
      </ModalContent>
    </Modal>
  );
}
