import React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Pagination } from '../../components/Pagination';
import { gql, useQuery } from '@apollo/client';
import { Box, Heading, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { TdUser } from '../../components/TdUser';
import { useSearchParams } from 'react-router-dom';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';
import { PaymentsQuery } from '../../generated/graphql';

dayjs.extend(relativeTime);

const PaymentsGQL = gql`
  query Payments($offset: Int, $show: Int) {
    getPayments(offset: $offset, show: $show) {
      items {
        id
        created
        expires
        user {
          id
          photo
          name
        }
      }
      count
    }
  }
`;

export function Payments() {
  const pageLimit = 20;
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.has('page') ? Number(searchParams.get('page')) : 1;

  const { data, loading, error } = useQuery<PaymentsQuery>(PaymentsGQL, {
    variables: {
      offset: (page - 1) * pageLimit,
      show: pageLimit
    }
  });

  const payments = data?.getPayments.items;
  const count = data?.getPayments.count;

  const setCurrentPage = (page: number) => {
    setSearchParams({ page: String(page) });
  };

  if (error) {
    return <Error error={error} />;
  }

  return (
    <Box>
      <Heading>Payments</Heading>
      <Pagination
        resultCount={count}
        limit={pageLimit}
        currentPage={page}
        setCurrentPage={setCurrentPage}
      />
      <Box overflowX="auto">
        <Table>
          <Thead>
            <Tr>
              <Th>User</Th>
              <Th>Created</Th>
              <Th>Expires</Th>
            </Tr>
          </Thead>
          <Tbody>
            {payments?.map((payment) => (
              <Tr key={payment.id}>
                <TdUser user={payment.user} />
                <Td>{new Date(payment.created).toLocaleString()}</Td>
                <Td>{new Date(payment.expires).toLocaleString()}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      {loading && <Loading />}
      <Pagination
        resultCount={count}
        limit={pageLimit}
        currentPage={page}
        setCurrentPage={setCurrentPage}
      />
    </Box>
  );
}
