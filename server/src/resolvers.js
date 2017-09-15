import { PubSub, withFilter } from 'graphql-subscriptions';

const channels = [{
  id: '1',
  name: 'deep tissue',
  messages: [{
    id: '1',
    text: 'the advantages of deep tissue',
  }, {
    id: '2',
    text: 'can I have it twice a week?',
  }]
}, {
  id: '2',
  name: 'thai yoga massage school',
  messages: [{
    id: '3',
    text: 'looking for a school',
  }, {
    id: '4',
    text: 'where can I learn it???',
  }]
}];
let nextId = 3;
let nextMessageId = 5;

const pubsub = new PubSub();

export const resolvers = {
  Query: {
    channels: () => {
      return channels;
    },
    channel: (root, { id }) => {
      return channels.find(channel => channel.id === id);
    },
  },
  Mutation: {
    addChannel: (root, args) => {
      const newChannel = { id: String(nextId++), messages: [], name: args.name };
      channels.push(newChannel);
      return newChannel;
    },
    addMessage: (root, { message }) => {
      const channel = channels.find(channel => channel.id === message.channelId);
      if(!channel)
        throw new Error("Channel does not exist");

      const newMessage = { id: String(nextMessageId++), text: message.text };
      channel.messages.push(newMessage);

      pubsub.publish('messageAdded', { messageAdded: newMessage, channelId: message.channelId });

      return newMessage;
    },
  },
  Subscription: {
    messageAdded: {
      subscribe: withFilter(() => pubsub.asyncIterator('messageAdded'), (payload, variables) => {

        return payload.channelId === variables.channelId;
      }),
    }
  },
};
