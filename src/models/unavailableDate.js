import mongoose from "mongoose";

const unavailableDateSchema = new mongoose.Schema(
  {
    apartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Apartment",
      required: true,
      index: true,
    },

    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

unavailableDateSchema.index(
  { apartmentId: 1, date: 1 },
  { unique: true }
);

export default mongoose.models.UnavailableDate ||
  mongoose.model("UnavailableDate", unavailableDateSchema);