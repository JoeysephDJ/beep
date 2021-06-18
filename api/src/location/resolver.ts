import { wrap } from '@mikro-orm/core';
import { Arg, Authorized, Ctx, Field, Mutation, ObjectType, PubSub, PubSubEngine, Resolver, Root, Subscription } from 'type-graphql';
import { Location } from '../entities/Location';
import { Context } from '../utils/context';
import { LocationInput } from '../validators/location';

@ObjectType()
class LocationData {
    @Field()
    public longitude!: number;

    @Field()
    public latitude!: number;
}

@Resolver(Location)
export class LocationResolver {

    @Mutation(() => Boolean)
    @Authorized()
    public async insertLocation(@Ctx() ctx: Context, @Arg('location') location: LocationInput, @PubSub() pubSub: PubSubEngine): Promise<boolean> {
        ctx.em.populate(ctx.user, "location");

        if (!ctx.user.location) {
            ctx.user.location = new Location({ ...location, user: ctx.user });
        }
        else {
            wrap(ctx.user.location).assign(location);
        }

        ctx.em.persist(ctx.user);

        pubSub.publish("Location" + ctx.user.id, location);

        await ctx.em.flush();

        return true;
    }

    @Subscription(() => LocationData, {
        nullable: true,
        topics: ({ args }) => "Location" + args.topic,
    })
    public getLocationUpdates(@Arg("topic") topic: string, @Root() entry: Location): LocationData {
        return entry;
    }
}
