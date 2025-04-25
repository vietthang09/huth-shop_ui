import mongoose, { Schema } from "mongoose";

const SettingsSchema = new Schema(
  {
    hotDeals: {
      type: [String],
      default: [],
    },
    topSellingProducts: {
      type: [String],
      default: [],
    },
    featuredCategories: {
      type: [String],
      default: [],
    },
    // Add other site-wide settings as needed
  },
  { timestamps: true }
);

export const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
