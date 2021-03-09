import { ApolloClient, createHttpLink, DefaultOptions, InMemoryCache, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { WebSocketLink } from '@apollo/client/link/ws';
import {getMainDefinition} from '@apollo/client/utilities';
import AsyncStorage from '@react-native-community/async-storage';

const httpLink = createHttpLink({
    uri: 'http://192.168.1.57:3001',
});

const wsLink = new WebSocketLink({
  uri: 'ws://192.168.1.57:3001/subscriptions',
  options: {
      reconnect: true,
      connectionParams: async () => {
          const tit = await AsyncStorage.getItem('auth');

          if (!tit) return;

          const auth = JSON.parse(tit);
          return {
              token: auth.tokens.id
          }
      }
  }
});

const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  const tit = await AsyncStorage.getItem('auth');

  if (!tit) return;

  const auth = JSON.parse(tit);
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      Authorization: auth.tokens.id ? `Bearer ${auth.tokens.id}` : "",
    }
  }
});

const defaultOptions: DefaultOptions = {
    watchQuery: {
        //fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
    },
    query: {
        //fetchPolicy: 'no-cache',
        errorPolicy: 'all',
    },
};

const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
                definition.operation === 'subscription'
        );
    },
    wsLink,
    httpLink,
);

export const client = new ApolloClient({
    link: authLink.concat(splitLink),
    cache: new InMemoryCache(),
    defaultOptions: defaultOptions
});
