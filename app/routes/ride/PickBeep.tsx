import React, { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { printStars } from "../../components/Stars";
import { GetBeeperListQuery, User } from "../../generated/graphql";
import { Navigation } from "../../utils/Navigation";
import {
  Text,
  Spinner,
  FlatList,
  Divider,
  Flex,
  Badge,
  IconButton,
  AddIcon,
  MinusIcon,
  Pressable,
  Avatar,
  Box,
  HStack,
  Spacer,
  Heading,
  Button,
  Actionsheet,
  useDisclose,
  Slider,
} from "native-base";
import { Container } from "../../components/Container";

interface Props {
  navigation: Navigation;
  route: any;
}

const GetBeepers = gql`
  query GetBeeperList($latitude: Float!, $longitude: Float!, $radius: Float) {
    getBeeperList(
      input: { latitude: $latitude, longitude: $longitude, radius: $radius }
    ) {
      id
      name
      first
      isStudent
      singlesRate
      groupRate
      capacity
      queueSize
      photoUrl
      role
      masksRequired
      rating
      venmo
      cashapp
      location {
        latitude
        longitude
      }
    }
  }
`;

function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d * 0.621371;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function PickBeepScreen(props: Props): JSX.Element {
  const { navigation, route } = props;
  const [radius, setRadius] = useState<number>(10);
  const { isOpen, onOpen, onClose } = useDisclose();

  const {
    data,
    previousData,
    refetch,
    loading,
    error,
    startPolling,
    stopPolling,
  } = useQuery<GetBeeperListQuery>(GetBeepers, {
    variables: {
      latitude: route.params.latitude,
      longitude: route.params.longitude,
      radius,
    },
  });

  useEffect(() => {
    if (previousData) refetch();
    startPolling(6000);
    return () => {
      stopPolling();
    };
  }, []);

  function getSubtitle(): string {
    if (loading) return `Loading...`;
    if (error) return `Unable to get beeper list`;
    return data?.getBeeperList.length == 1
      ? `${data.getBeeperList.length} beeper in ${radius} miles`
      : `${data?.getBeeperList.length} beepers in ${radius} miles`;
  }

  function goBack(id: string): void {
    route.params.handlePick(id);
    navigation.goBack();
  }

  function getDescription(user: User): string {
    let distance = 0;
    if (user.location) {
      distance = getDistance(
        route.params.latitude,
        route.params.longitude,
        user.location?.latitude,
        user.location?.longitude
      );
    }
    return `Queue Size: ${user.queueSize}\nCapacity: ${
      user.capacity
    } riders\nSingles: $${user.singlesRate}\nGroups: $${
      user.groupRate
    }\nDistance from you: ${distance.toFixed(2)} mi`;
  }

  React.useLayoutEffect(() => {
    props.navigation.setOptions({
      // eslint-disable-next-line react/display-name
      headerRight: () => (
        <Button size="xs" mr={2} onPress={onOpen}>
          Change Range
        </Button>
      ),
    });
  }, [props.navigation]);

  const decreseRadius = () => {
    if (radius - 5 <= 0) return;

    setRadius((oldRadius) => oldRadius - 5);
  };

  const increaseRadius = () => {
    if (radius + 5 > 30) return;

    setRadius((oldRadius) => oldRadius + 5);
  };

  const renderItem = ({ item }: { item: User }) => (
    <Pressable onPress={() => goBack(item.id)}>
      <Flex alignItems="center" direction="row" p={2}>
        <Avatar mr={2} size={50} source={{ uri: item.photoUrl || "" }} />
        <Box>
          <Heading size="md">{item.name}</Heading>
          <Text fontSize="xs">{getDescription(item)}</Text>
        </Box>
        <Spacer />
        <HStack space={2} mr={2}>
          {item.rating ? <Badge>{printStars(item.rating)}</Badge> : null}
          {item.role === "admin" ? (
            <Badge colorScheme="danger">Founder</Badge>
          ) : null}
          {item.masksRequired ? <Badge colorScheme="dark">Masks</Badge> : null}
          {item.venmo ? <Badge colorScheme="info">Venmo</Badge> : null}
          {item.cashapp ? <Badge colorScheme="success">Cash App</Badge> : null}
        </HStack>
      </Flex>
    </Pressable>
  );

  if (loading) {
    return (
      <Container alignItems="center" justifyContent="center">
        <Spinner size="lg" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container alignItems="center" justifyContent="center">
        <Text>Error</Text>
        <Text>{error.message}</Text>
      </Container>
    );
  }

  if (data?.getBeeperList && data.getBeeperList.length === 0) {
    return (
      <Container alignItems="center" justifyContent="center">
        <Text>Nobody is beeping!</Text>
        <Text>
          Nobody is beeping right now! Use the + - buttons to change your beeper
          range
        </Text>
      </Container>
    );
  }

  return (
    <Container>
      {data?.getBeeperList && data.getBeeperList.length > 0 ? (
        <FlatList
          data={data.getBeeperList as User[]}
          ItemSeparatorComponent={Divider}
          renderItem={renderItem}
        />
      ) : null}
      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <Actionsheet.Content>
          <Slider
            marginY={6}
            minValue={5}
            maxValue={30}
            defaultValue={10}
            colorScheme="cyan"
            onChangeEnd={(v) => {
              v && setRadius(Math.floor(v));
            }}
          >
            <Slider.Track>
              <Slider.FilledTrack />
            </Slider.Track>
            <Slider.Thumb />
          </Slider>
        </Actionsheet.Content>
      </Actionsheet>
    </Container>
  );
}
