import mongoose from "mongoose";

const identityImageSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      trim: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    apartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Apartment",
      required: true,
      index: true,
    },

    checkIn: {
      type: Date,
      required: true,
    },

    checkOut: {
      type: Date,
      required: true,
    },

    days: {
      type: Number,
      required: true,
      min: 1,
    },

    pricePerDay: {
      type: Number,
      required: true,
      min: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    guestName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    guestPhone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },

    // =====================================================
    // IDENTITY DOCUMENTS
    // =====================================================
    // NID front, NID back and selfie.
    // No verification status is stored.
    // =====================================================

    identityDocuments: {
      nidFront: {
        type: identityImageSchema,
        default: null,
      },

      nidBack: {
        type: identityImageSchema,
        default: null,
      },

      selfie: {
        type: identityImageSchema,
        default: null,
      },
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
      ],
      default: "pending",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: [
        "unpaid",
        "paid",
        "failed",
        "cancelled",
        "refunded",
      ],
      default: "unpaid",
      index: true,
    },

    paymentGateway: {
      type: String,
      enum: ["sslcommerz"],
      default: "sslcommerz",
    },

    transactionId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },

    validationId: {
      type: String,
      trim: true,
      default: null,
    },

    sessionKey: {
      type: String,
      trim: true,
      default: null,
    },

    paymentMethod: {
      type: String,
      trim: true,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    paymentFailureReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// INDEXES
// =====================================================

bookingSchema.index({
  apartmentId: 1,
  checkIn: 1,
  checkOut: 1,
});

bookingSchema.index({
  paymentStatus: 1,
  status: 1,
});

bookingSchema.index(
  { transactionId: 1 },
  {
    unique: true,
    sparse: true,
  }
);

// =====================================================
// AUTO DELETE UNPAID PENDING BOOKINGS
// =====================================================
//
// Pending + unpaid bookings automatically expire
// 10 minutes after creation.
//
// 600 seconds = 10 minutes.
//
// Confirmed/paid/cancelled bookings do not match
// this partial TTL index.
// =====================================================

bookingSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 600,

    partialFilterExpression: {
      status: "pending",
      paymentStatus: "unpaid",
    },
  }
);

// =====================================================
// MODEL
// =====================================================

export default mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);