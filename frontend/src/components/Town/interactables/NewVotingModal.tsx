import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable } from '../../../classes/TownController';
import { Omit_VotingArea_type_ } from '../../../generated/client';
import useTownController from '../../../hooks/useTownController';

export default function NewVotingModal(): JSX.Element {
  const coveyTownController = useTownController();
  const newVoting = useInteractable('votingArea');
  const [poll, setPoll] = useState<string>('');
  const [value, setValue] = React.useState('0');

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
    if (poll && newVoting) {
      const votingToCreate: Omit_VotingArea_type_ = {
        id: newVoting.name,
        occupants: [],
        poll,
      };
      try {
        await coveyTownController.createVotingArea(votingToCreate);
        toast({
          title: 'Voting Created!',
          status: 'success',
        });
        setPoll('');
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
  }, [poll, setPoll, coveyTownController, newVoting, closeModal, toast]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create a poll in {newVoting?.name} </ModalHeader>
        <ModalCloseButton />
        <form
          onSubmit={ev => {
            ev.preventDefault();
            createVoting();
          }}>
          <ModalBody pb={6}>
            <FormControl>
              <Input
                id='poll'
                placeholder='Share the poll to vote on'
                name='poll'
                value={poll}
                onChange={e => setPoll(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalBody>
            <RadioGroup onChange={setValue} value={value}>
              <Stack direction='row'>
                <Radio value='1'>Hate</Radio>
                <Radio value='2'>Disagree</Radio>
                <Radio value='3'>Neutral</Radio>
                <Radio value='4'>Agree</Radio>
                <Radio value='5'>Love</Radio>
              </Stack>
            </RadioGroup>
          </ModalBody>
          <ModalBody>
            <Box>
              <Heading as='h2' fontSize='l'>
                Poll Results
              </Heading>
              <TableContainer>
                <Table size='sm' variant='unstyled'>
                  <Thead>
                    <Tr>
                      <Th>Hate</Th>
                      <Th>Disagree</Th>
                      <Th>Neutral</Th>
                      <Th>Agree</Th>
                      <Th>Love</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Th>0</Th>
                      <Th>0</Th>
                      <Th>0</Th>
                      <Th>0</Th>
                      <Th>0</Th>
                    </Tr>
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          </ModalBody>
          <ModalBody>
            <Button colorScheme='blue' mr={3} onClick={createVoting}>
              Create Poll
            </Button>
            <Button colorScheme='blue' mr={3} value={''} onClick={e => setPoll('')}>
              Clear Poll
            </Button>
            <Button onClick={closeModal}>Cancel</Button>
          </ModalBody>
        </form>
      </ModalContent>
    </Modal>
  );
}
