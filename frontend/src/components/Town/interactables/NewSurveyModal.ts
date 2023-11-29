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
    RadioGroup,
    Radio,
    Stack
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import useTownController from '../../../hooks/useTownController';
import { Omit_VotingArea_type_ } from '../../../generated/client';
import { useInteractable } from '../../../classes/TownController';

export default function NewSurveyModal(): JSX.Element {
    const coveyTownController = useTownController();
    const newSurvey = useInteractable('surveyArea');
    const [response, setResponse] = useState<string>('');

    const isSurveyOpen = newSurvey !== undefined;

    useEffect(() => {
        if (newSurvey) {
        coveyTownController.pause();
        } else {
        coveyTownController.unPause();
        }
    }, [coveyTownController, newSurvey]);

    const closeModal = useCallback(() => {
        if (newSurvey) {
        coveyTownController.interactEnd(newSurvey);
        }
    }, [coveyTownController, newSurvey]);

    const toast = useToast();

  const createVoting = useCallback(async () => {
    if (response && newSurvey) {
      const votingToCreate: Omit_VotingArea_type_ = {
        id: newSurvey.name,
        occupants: [],
        votes: 0, 
      };
      try {
        await coveyTownController.createVotingArea(votingToCreate);
        toast({
          title: 'Survey Created!',
          status: 'success',
        });
        setResponse('');
        coveyTownController.unPause();
        closeModal();
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: 'Unable to create survey',
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
  }, [response, setResponse, coveyTownController, newSurvey, closeModal, toast]);

    return (
        <Modal 
        isOpen={isSurveyOpen} 
        onClose ={() => {
            closeModal();
            coveyTownController.unPause();
          }}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Create a new Survey in {newSurvey?.name} </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl>
                        <FormLabel>Survey Question 1</FormLabel>
                        <Input
                            placeholder="How has your overall experience been?"
                            value={response}
                            onChange={event => setResponse(event.target.value)}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Survey Question 2</FormLabel>
                        <Input
                            placeholder="If you have used VotingArea, how was your experience?"
                            value={response}
                            onChange={event => setResponse(event.target.value)}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Survey Question 3</FormLabel>
                        <Input
                            placeholder="If you have used VoteKick, how was your experience?"
                            value={response}
                            onChange={event => setResponse(event.target.value)}
                        />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={createVoting}>
                        Create
                    </Button>
                    <Button variant="ghost" onClick={closeModal}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

 