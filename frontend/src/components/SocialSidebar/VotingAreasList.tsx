import { Box, Heading, ListItem, UnorderedList } from '@chakra-ui/react';
import React from 'react';
import VotingAreaController, {
  useVotingAreaVotes,
} from '../../classes/interactable/VotingAreaController';
import { useInteractableAreaOccupants } from '../../classes/interactable/InteractableAreaController';
import { useActiveVotingAreas } from '../../classes/TownController';
import PlayerName from './PlayerName';

type VotingAreaViewProps = {
  area: VotingAreaController;
};

/**
 * Displays a list of "active" voting areas, along with their occupants
 *
 * A voting area is "active" if its vote is not set to the constant NO_TOPIC_STRING that is exported from the ConverationArea file
 *
 * If there are active areas, it sorts them by label ascending
 *
 * See relevant hooks: useVotingAreas, usePlayersInTown.
 */
function VotingAreaView({ area }: VotingAreaViewProps): JSX.Element {
  const occupants = useInteractableAreaOccupants(area);
  const vote = useVotingAreaVotes(area);

  return (
    <Box>
      <Heading as='h3' fontSize='m'>
        {area.id}: {vote}
      </Heading>
      <UnorderedList>
        {occupants.map(occupant => {
          return (
            <ListItem key={occupant.id}>
              <PlayerName player={occupant} />
            </ListItem>
          );
        })}
      </UnorderedList>
    </Box>
  );
}
export default function VotingAreasList(): JSX.Element {
  const activeVotingAreas = useActiveVotingAreas();
  return (
    <Box>
      <Heading as='h2' fontSize='l'>
        Active Voting Areas:
      </Heading>
      {activeVotingAreas.length === 0 ? (
        <>No active voting areas</>
      ) : (
        activeVotingAreas
          .sort((a1, a2) =>
            a1.id.localeCompare(a2.id, undefined, { numeric: true, sensitivity: 'base' }),
          )
          .map(area => <VotingAreaView area={area} key={area.id} />)
      )}
    </Box>
  );
}
