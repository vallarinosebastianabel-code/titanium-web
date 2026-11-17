import type { BodyType, Vehicle } from "@/lib/schemas/vehicle";

export type DbVehicleStatus = Vehicle["status"];
export type DbTransmission = Vehicle["transmission"];
export type DbFuelType = Vehicle["fuelType"];
export type DbDrivetrain = NonNullable<Vehicle["drivetrain"]>;

export interface DbVehicleRow {
  id: string;
  slug: string;
  stock_number: string;
  status: DbVehicleStatus;
  featured: boolean;
  make: string;
  model: string;
  trim: string | null;
  year: number;
  body_type: BodyType;
  price: number | string;
  mileage: number;
  transmission: DbTransmission;
  fuel_type: DbFuelType;
  drivetrain: DbDrivetrain | null;
  engine: string | null;
  exterior_color: string | null;
  interior_color: string | null;
  vin: string | null;
  badges: string[] | null;
  features: string[] | null;
  description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbVehicleImageRow {
  id: string;
  vehicle_id: string;
  storage_path: string;
  alt: string;
  sort_order: number;
  created_at: string;
}

export type DbVehicleWithImages = DbVehicleRow & {
  vehicle_images: DbVehicleImageRow[] | null;
};
