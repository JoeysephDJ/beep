import * as React from "react";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MainFindBeepScreen } from "../routes/ride/FindBeep";
import { RatingsScreen } from "../routes/Ratings";
import { BeepsScreen } from "../routes/Beeps";
import { ChangePasswordScreen } from "../routes/settings/ChangePassword";
import { EditProfileScreen } from "../routes/settings/EditProfile";
import { gql, useMutation } from "@apollo/client";
import {
  LogoutMutation,
  ResendMutation,
} from "../generated/graphql";
import { client } from "../utils/Apollo";
import {
  LOCATION_TRACKING,
  StartBeepingScreen,
} from "../routes/beep/StartBeeping";
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import {
  Box,
  Pressable,
  VStack,
  Text,
  HStack,
  Divider,
  Icon,
  Avatar,
  Flex,
  Switch,
  useColorMode,
  Spinner,
} from "native-base";
import { UserData, useUser } from "../utils/useUser";

const Logout = gql`
  mutation Logout {
    logout(isApp: true)
  }
`;

const Drawer = createDrawerNavigator();

const getIcon = (screenName: string) => {
  switch (screenName) {
    case "Ride":
      return "car";
    case "Beep":
      return "steering";
    case "Edit Profile":
      return "account-edit";
    case "Change Password":
      return "form-textbox-password";
    case "Beeps":
      return "car-multiple";
    case "Ratings":
      return "account-star";
    default:
      return "car";
  }
};

const Resend = gql`
  mutation Resend {
    resendEmailVarification
  }
`;

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user } = useUser();

  const { colorMode, toggleColorMode } = useColorMode();
  const [logout, { loading }] = useMutation<LogoutMutation>(Logout);
  const [resend, { loading: resendLoading }] =
    useMutation<ResendMutation>(Resend);

  const handleLogout = async () => {
    await logout({
      variables: {
        isApp: true,
      },
    });

    AsyncStorage.clear();

    if (!__DEV__) {
      Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
    }

    props.navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });

    client.writeQuery({
      query: UserData,
      data: {
        getUser: null,
      },
    });
  };

  const handleResendVerification = () => {
    resend()
      .then(() =>
        alert(
          "Successfully resent verification email. Please check your email for further instructions."
        )
      )
      .catch((error) => alert(error.message));
  };

  return (
    <DrawerContentScrollView {...props}>
      <VStack space={6} my={2} mx={2}>
        <Flex ml={2} direction="row" alignItems="center">
          <Avatar
            key={user?.photoUrl}
            mr={4}
            source={{ uri: !user?.photoUrl ? undefined : user.photoUrl }}
          >
            {user?.isBeeping ? <Avatar.Badge size={20} bg="green.400" /> : null}
          </Avatar>
          <Box>
            <Text fontWeight="extrabold">{user?.name}</Text>
            <Text fontSize={14} mt={0.5} fontWeight={500}>
              @{user?.username}
            </Text>
          </Box>
        </Flex>
        <VStack divider={<Divider />} space={4}>
          <VStack space={3}>
            {props.state.routeNames.map((name: string, index: number) => (
              <Pressable
                key={index}
                px={5}
                py={3}
                rounded="md"
                bg={
                  index === props.state.index
                    ? "rgba(143, 143, 143, 0.1)"
                    : "transparent"
                }
                onPress={() => {
                  props.navigation.navigate(name);
                }}
              >
                <HStack space={7} alignItems="center">
                  <Icon
                    color={
                      index === props.state.index ? "primary.500" : "gray.500"
                    }
                    size={5}
                    as={<MaterialCommunityIcons name={getIcon(name)} />}
                  />
                  <Text fontWeight={500}>{name}</Text>
                </HStack>
              </Pressable>
            ))}
            <Pressable onPress={handleLogout}>
              <HStack px={5} py={3} space={7} alignItems="center">
                {loading ? (
                  <Spinner size="sm" />
                ) : (
                  <Icon
                    color="gray.500"
                    size={5}
                    as={<MaterialCommunityIcons name="logout-variant" />}
                  />
                )}
                <Text mr={4} fontWeight={500}>
                  Logout
                </Text>
              </HStack>
            </Pressable>
            {!user?.isEmailVerified ? (
              <Pressable onPress={handleResendVerification}>
                <HStack px={5} py={3} space={7} alignItems="center">
                  {resendLoading ? (
                    <Spinner size="sm" />
                  ) : (
                    <Icon
                      color="red.400"
                      size={6}
                      as={
                        <MaterialCommunityIcons name="alert-circle-outline" />
                      }
                    />
                  )}
                  <Text mr={4} fontWeight={500}>
                    Resend Verification Email
                  </Text>
                </HStack>
              </Pressable>
            ) : null}
            <HStack px={5} py={3} space={5} alignItems="center">
              <Text>☀️</Text>
              <Switch
                isChecked={colorMode === "dark"}
                onToggle={toggleColorMode}
              />
              <Text>️🌑</Text>
            </HStack>
          </VStack>
        </VStack>
      </VStack>
    </DrawerContentScrollView>
  );
}

export function BeepDrawer() {
  const { colorMode } = useColorMode();

  return (
    <Box flex={1}>
      <Drawer.Navigator
        useLegacyImplementation={true}
        screenOptions={{
          drawerType: "front",
          headerTintColor: colorMode === "dark" ? "white" : "black",
        }}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen name="Ride" component={MainFindBeepScreen} />
        <Drawer.Screen name="Beep" component={StartBeepingScreen} />
        <Drawer.Screen name="Edit Profile" component={EditProfileScreen} />
        <Drawer.Screen
          name="Change Password"
          component={ChangePasswordScreen}
        />
        <Drawer.Screen name="Beeps" component={BeepsScreen} />
        <Drawer.Screen name="Ratings" component={RatingsScreen} />
      </Drawer.Navigator>
    </Box>
  );
}
