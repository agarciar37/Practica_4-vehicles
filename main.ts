import { ApolloServer} from '@apollo/server';
import { schema } from "./schema.ts";
import { MongoClient } from "mongodb";
import { VehicleModel, PartModel } from "./types.ts";
import { startStandaloneServer} from "@apollo/server/standalone";
import { resolvers } from "./resolvers.ts";

const MONGO_URL = "mongodb+srv://agarciar37:<db_password>@cluster0.nv27ans.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

if (!MONGO_URL) {
    throw new Error("Please provide a MONGO_URL");
}

const mongoClient = new MongoClient(MONGO_URL);
await mongoClient.connect();

console.info("Connected to MongoDB");

const mongoDB = mongoClient.db("vehicles");
const VehicleCollection = mongoDB.collection<VehicleModel>("vehicles");
const PartCollection = mongoDB.collection<PartModel>("parts");

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
})

const { url } = await startStandaloneServer(server, {
  context: async () => ({
    VehicleCollection,
    PartCollection,
  })
})

console.info(`Server ready at ${url}`)
