import { Property } from "./property";

export type Attribute = {
  id: number;
  name: string | null;
  value: string | null;
  unit: string | null;
  propertiesHash: string;
  propertyEntries: Property[];
};
