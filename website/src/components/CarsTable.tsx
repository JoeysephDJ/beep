import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Pagination } from './Pagination';
import { Box, Center, Image, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { Loading } from './Loading';
import { Indicator } from './Indicator';
import { createRoute } from '@tanstack/react-router';
import { userRoute } from '../routes/admin/users/User';
import { graphql } from '../graphql';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(relativeTime);

const GetCarsForUser = graphql(`
  query GetCarsForUser($id: String, $offset: Int, $show: Int) {
    getCars(id: $id, offset: $offset, show: $show) {
      items {
        id
        make
        model
        year
        color
        photo
        created
        default
      }
      count
    }
  }
`);

export const carsTableRoute = createRoute({
  component: CarsTable,
  path: 'cars',
  getParentRoute: () => userRoute,
});

export function CarsTable() {
  const pageLimit = 5;
  const { userId } = carsTableRoute.useParams();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { data, loading, previousData } = useQuery(
    GetCarsForUser,
    {
      variables: {
        id: userId,
        offset: (currentPage - 1) * pageLimit,
        show: pageLimit
      }
    }
  );

  const cars = data?.getCars.items ?? previousData?.getCars.items;
  const count = data?.getCars.count ?? previousData?.getCars.count;

  if (count === 0) {
    return (
      <Center h="100px">
        This user has no cars.
      </Center>
    );
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <Box>
      <Pagination
        resultCount={count}
        limit={pageLimit}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <Box overflowX="auto">
        <Table>
          <Thead>
            <Tr>
              <Th>Make</Th>
              <Th>Model</Th>
              <Th>Year</Th>
              <Th>Color</Th>
              <Th>Created</Th>
              <Th>Photo</Th>
              <Th>Default</Th>
            </Tr>
          </Thead>
          <Tbody>
            {cars?.map((car) => (
              <Tr key={car.id}>
                <Td>{car.make}</Td>
                <Td>{car.model}</Td>
                <Td>{car.year}</Td>
                <Td>
                  <Indicator color={car.color} tooltip={car.color} />
                </Td>
                <Td>{dayjs().to(car.created)}</Td>
                <Td>
                  <Image src={car.photo} w="24" borderRadius="2xl" />
                </Td>
                <Td>
                  <Indicator color={car.default ? 'green' : 'red'} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      <Pagination
        resultCount={count}
        limit={pageLimit}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </Box>
  );
}
