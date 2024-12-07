import { Collection, ObjectId } from 'mongodb';
import { VehicleModel, PartModel, Vehicle, Part } from "./types.ts";
import { getRandomJoke } from "./services.ts";
import { fromVehicleModelToVehicle, fromPartModelToPart } from "./utils.ts";

export const resolvers = {
    Query: {
        vehicle: async (
            _: unknown,
            { id }: { id: string },
            context: { VehicleCollection: Collection<VehicleModel>}
        ): Promise<Vehicle | null> => {
            const vehicle = await context.VehicleCollection.findOne({ _id: new ObjectId(id) });
            if (!vehicle) {
                return null;
            }
            return {
                ...fromVehicleModelToVehicle(vehicle),
                joke: await getRandomJoke(),
            }
        },
        vehicles: async (
            _: unknown,
            __: unknown,
            context: { VehicleCollection: Collection<VehicleModel>,
                PartCollection: Collection<PartModel> }
        ): Promise<Vehicle[]> => {
            const vehicles = await context.VehicleCollection.find().toArray()
            return Promise.all(
                vehicles.map(async (vehicle) => ({
                    ...fromVehicleModelToVehicle(vehicle),
                    joke: await getRandomJoke(),
                    parts: await context.PartCollection.find({ vehicleId: vehicle._id!.toString() }).toArray().then(parts => parts.map(fromPartModelToPart)),
                }))
            )
        },
        parts: async (
            _: unknown, 
            __: unknown,
            context: { PartCollection: Collection<PartModel> }
        ): Promise<Part[]> => {
            const parts = await context.PartCollection.find().toArray();
            return parts.map(fromPartModelToPart);
        },
        vehiclesByManufacturer: async (
            _: unknown,
            { manufacturer }: { manufacturer: string },
            context: { VehicleCollection: Collection<VehicleModel> }
        ): Promise<Vehicle[]> => {
            const vehicles = await context.VehicleCollection.find({manufacturer}).toArray();
            return vehicles.map(fromVehicleModelToVehicle);
        },
        partsByVehicle: async (
            _: unknown,
            { vehicleId }: { vehicleId: string },
            context: { PartCollection: Collection<PartModel> }
        ): Promise<Part[]> => {
            const parts = await context.PartCollection.find({ vehicleId }).toArray();
            return parts.map(fromPartModelToPart);
        },
        vehicleByYearRange: async (
            _: unknown,
            { startYear, endYear }: { startYear: number, endYear: number },
            context: { VehicleCollection: Collection<VehicleModel> }
        ): Promise<Vehicle[]> => {
            const vehicles = await context.VehicleCollection.find({ year: { $gte: startYear, $lte: endYear } }).toArray();
            return vehicles.map(fromVehicleModelToVehicle);
        },
    },
    Mutation: {
        addVehicle: async (
            _: unknown,
            args: { name: string, manufacturer: string, year: number },
            context: { VehicleCollection: Collection<VehicleModel> }
        ): Promise<Vehicle> => {
            const { name, manufacturer, year } = args;
            const { insertedId } = await context.VehicleCollection.insertOne({name, manufacturer, year});
            return fromVehicleModelToVehicle({ _id: insertedId, name, manufacturer, year });
        },
        addPart: async (
            _: unknown,
            args: { name: string, price: number, vehicleId: string },
            context: { PartCollection: Collection<PartModel> }
        ): Promise<Part> => {
            const { name, price, vehicleId } = args;
            const { insertedId } = await context.PartCollection.insertOne({name, price, vehicleId});
            return fromPartModelToPart({ _id: insertedId, name, price, vehicleId });
        },
        updateVehicle: async (
            _: unknown,
            args: { id: string, name: string, manufacturer: string, year: number },
            context: { VehicleCollection: Collection<VehicleModel> }
        ): Promise<Vehicle | null> => {
            const { id, name, manufacturer, year } = args;
            const result = await context.VehicleCollection.updateOne({ _id: new ObjectId(id) }, { $set: { name, manufacturer, year } });
            if (!result.matchedCount) return null;
            return fromVehicleModelToVehicle({ _id: new ObjectId(id), name, manufacturer, year });
        }, 
        deletePart: async (_: unknown, { id }: { id: string }, context: { PartCollection: Collection<PartModel> }): Promise<Part | null> => {
            const part = await context.PartCollection.findOne({ _id: new ObjectId(id) });
            if (!part) return null;
            await context.PartCollection.deleteOne({ _id: new ObjectId(id) });
            return fromPartModelToPart(part);
          },
    }
}