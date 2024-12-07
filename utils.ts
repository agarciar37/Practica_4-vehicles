import { VehicleModel, PartModel, Vehicle, Part } from "./types.ts";

export const fromVehicleModelToVehicle = (vehicleModel: VehicleModel): Vehicle => ({
  id: vehicleModel._id!.toString(),
  name: vehicleModel.name,
  manufacturer: vehicleModel.manufacturer,
  year: vehicleModel.year,
  joke: "",
});

export const fromPartModelToPart = (partModel: PartModel): Part => ({
  id: partModel._id!.toString(),
  name: partModel.name,
  price: partModel.price,
  vehicleId: partModel.vehicleId,
});
