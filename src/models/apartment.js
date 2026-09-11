import mongoose from "mongoose";

const pricingTierSchema = new mongoose.Schema(
  {
    minDays: {
      type: Number,
      required: true,
      min: 1,
    },

    maxDays: {
      type: Number,
      default: null,
      min: 1,
    },

    pricePerDay: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const apartmentImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    publicId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    _id: false,
  }
);

const apartmentSchema = new mongoose.Schema(
  {
    size: {
      type: Number,
      required: true,
      min: 1,
      unique: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    images: {
      type: [apartmentImageSchema],
      default: [],
      validate: {
        validator: (images) =>
          images.every(
            (image) =>
              image &&
              typeof image.url === "string" &&
              image.url.trim().length > 0 &&
              typeof image.publicId === "string" &&
              image.publicId.trim().length > 0
          ),
        message: "Invalid apartment image",
      },
    },

    amenities: {
      type: [String],
      default: [],
      validate: {
        validator: (items) =>
          items.every(
            (item) =>
              typeof item === "string" &&
              item.trim().length > 0 &&
              item.length <= 100
          ),
        message: "Invalid amenity",
      },
    },

    roomFeatures: {
      type: [String],
      default: [],
      validate: {
        validator: (items) =>
          items.every(
            (item) =>
              typeof item === "string" &&
              item.trim().length > 0 &&
              item.length <= 100
          ),
        message: "Invalid room feature",
      },
    },

    bathroomFacilities: {
      type: [String],
      default: [],
      validate: {
        validator: (items) =>
          items.every(
            (item) =>
              typeof item === "string" &&
              item.trim().length > 0 &&
              item.length <= 100
          ),
        message: "Invalid bathroom facility",
      },
    },

    policies: {
      type: [String],
      default: [],
      validate: {
        validator: (items) =>
          items.every(
            (item) =>
              typeof item === "string" &&
              item.trim().length > 0 &&
              item.length <= 500
          ),
        message: "Invalid policy",
      },
    },

    pricing: {
      type: [pricingTierSchema],
      required: true,
      validate: {
        validator: (tiers) => tiers.length > 0,
        message: "At least one pricing tier is required",
      },
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

apartmentSchema.index({
  size: 1,
});

export default mongoose.models.Apartment ||
  mongoose.model("Apartment", apartmentSchema);