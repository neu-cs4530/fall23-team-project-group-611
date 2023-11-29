import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/react';
import React from 'react';
import { GameResult } from '../../../types/CoveyTownSocket';

/**
 * A component that renders a list of GameResult's as a leaderboard, formatted as a table with the following columns:
 * - Player: the name of the player
 * - Wins: the number of games the player has won
 * - Losses: the number of games the player has lost
 * - Ties: the number of games the player has tied
 * Each column has a header (a table header `th` element) with the name of the column.
 *
 *
 * The table is sorted by the number of wins, with the player with the most wins at the top.
 *
 * @returns
 */
export default function Leaderboard({ results }: { results: GameResult[] }): JSX.Element {
  const winsLossesTiesByPlayer: Record<
    string,
    { player: string; wins: number; losses: number; ties: number }
  > = {};

  results.forEach(result => {
    const players = Object.keys(result.scores);

    const p1 = players[0];
    const p2 = players[1];
    const winner =
      result.scores[p1] > result.scores[p2]
        ? p1
        : result.scores[p2] > result.scores[p1]
          ? p2
          : undefined;
    if (winner) {
      winsLossesTiesByPlayer[winner] = {
        player: winner,
        wins: (winsLossesTiesByPlayer[winner]?.wins || 0) + 1,
        losses: winsLossesTiesByPlayer[winner]?.losses,
        ties: winsLossesTiesByPlayer[winner]?.ties,
      };
    }
    const loser =
      result.scores[p1] > result.scores[p2]
        ? p2
        : result.scores[p2] > result.scores[p1]
          ? p1
          : undefined;
    if (loser) {
      winsLossesTiesByPlayer[loser] = {
        player: loser,
        wins: winsLossesTiesByPlayer[loser]?.wins,
        losses: (winsLossesTiesByPlayer[loser]?.losses || 0) + 1,
        ties: winsLossesTiesByPlayer[loser]?.ties,
      };
    }
    if (!winner && !loser) {
      winsLossesTiesByPlayer[p1] = {
        player: p1,
        wins: winsLossesTiesByPlayer[p1]?.wins,
        losses: winsLossesTiesByPlayer[p1]?.losses,
        ties: (winsLossesTiesByPlayer[p1]?.ties || 0) + 1,
      };
      winsLossesTiesByPlayer[p2] = {
        player: p2,
        wins: winsLossesTiesByPlayer[p2]?.wins,
        losses: winsLossesTiesByPlayer[p2]?.losses,
        ties: (winsLossesTiesByPlayer[p2]?.ties || 0) + 1,
      };
    }
  });

  const rows = Object.keys(winsLossesTiesByPlayer)
    .map(player => winsLossesTiesByPlayer[player])
    .sort((p1, p2) => {
      if (p1.wins === undefined) {
        return 1;
      } else if (p2.wins === undefined) {
        return -1;
      } else {
        return p2.wins - p1.wins;
      }
    });
  return (
    <Box>
      <Heading as='h2' fontSize='l'>
        Leaderboard
      </Heading>
      <TableContainer>
        <Table size='sm'>
          <Thead>
            <Tr>
              <Th>Player</Th>
              <Th>Wins</Th>
              <Th>Losses</Th>
              <Th>Ties</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map(result => (
              <Tr key={result.player}>
                <Td>{result.player}</Td>
                <Td>{result.wins}</Td>
                <Td>{result.losses}</Td>
                <Td>{result.ties}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}
