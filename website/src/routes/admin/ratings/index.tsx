import { useState } from 'react'
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Card } from '../../../components/Card';
import { Table, THead, TH, TBody, TR, TDText, TDButton, TDProfile } from '../../../components/Table';
import { Heading3 } from '../../../components/Typography';
import Pagination from '../../../components/Pagination';
import {gql, useQuery} from '@apollo/client';
import {GetRatingsQuery} from '../../../generated/graphql';

dayjs.extend(relativeTime);

const RatesGraphQL = gql`
    query getRatings($show: Int, $offset: Int) {
        getRatings(show: $show, offset: $offset) {
            items {
                id
                timestamp
                message
                stars
                rater {
                    id
                    first
                    last
                    photoUrl
                    username
                }
                rated {
                    id
                    first
                    last
                    photoUrl
                    username
                }
            }
            count
        }
    }
`;


export function printStars(rating: number): string {
    let stars = "";

    for (let i = 0; i < rating; i++){
        stars += "⭐️";
    }

    return stars;
}

function Ratings() {
    const { data, refetch } = useQuery<GetRatingsQuery>(RatesGraphQL, { variables: { offset: 0, show: 25 }});
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageLimit = 25;

    async function fetchRatings(page: number) {
        refetch({ 
            offset: page
        });
    }

    return <>
        <Heading3>Ratings</Heading3>

        <Pagination
            resultCount={data?.getRatings.count}
            limit={pageLimit}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onPageChange={fetchRatings}/>

        <Card>
            <Table>
                <THead>
                    <TH>Rater</TH>
                    <TH>Rated</TH>
                    <TH>Message</TH>
                    <TH>Stars</TH>
                    <TH>Date</TH>
                    <TH> </TH>
                </THead>
                <TBody>
                    {data?.getRatings && (data.getRatings.items).map(report => {
                        return (
                            <TR key={report.id}>
                                <TDProfile
                                    to={`users/${report.rater.id}`}
                                    photoUrl={report.rater.photoUrl}
                                    title={`${report.rater.first} ${report.rater.last}`}
                                    subtitle={`@${report.rater.username}`}>
                                </TDProfile>
                                <TDProfile
                                    to={`users/${report.rated.id}`}
                                    photoUrl={report.rated.photoUrl}
                                    title={`${report.rated.first} ${report.rated.last}`}
                                    subtitle={`@${report.rated.username}`}>
                                </TDProfile>
                                <TDText>{report.message}</TDText>
                                <TDText>{printStars(report.stars)}</TDText>
                                <TDText>{dayjs().to(report.timestamp)}</TDText>
                                <TDButton to={`ratings/${report.id}`}>View</TDButton>
                            </TR>
                        )
                    })}
                </TBody>
            </Table>
        </Card>

        <Pagination
            resultCount={data?.getRatings.count}
            limit={pageLimit}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onPageChange={fetchRatings}/>
    </>;
}

export default Ratings;