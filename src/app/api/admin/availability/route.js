import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Apartment from "@/models/apartment";
import Booking from "@/models/booking";
import UnavailableDate from "@/models/unavailableDate";

export const runtime = "nodejs";

// =====================================================
// DATE HELPERS
// =====================================================

function isValidDateKey(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getMonthRange(year, month) {
  const firstDay = new Date(
    Date.UTC(year, month - 1, 1)
  );

  const nextMonth = new Date(
    Date.UTC(year, month, 1)
  );

  return {
    firstDay,
    nextMonth,
  };
}

function formatDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function expandBookingDates(checkIn, checkOut) {
  const dates = [];

  const current = new Date(
    Date.UTC(
      checkIn.getUTCFullYear(),
      checkIn.getUTCMonth(),
      checkIn.getUTCDate()
    )
  );

  const end = new Date(
    Date.UTC(
      checkOut.getUTCFullYear(),
      checkOut.getUTCMonth(),
      checkOut.getUTCDate()
    )
  );

  while (current < end) {
    dates.push(formatDateKey(current));

    current.setUTCDate(
      current.getUTCDate() + 1
    );
  }

  return dates;
}

// =====================================================
// GET
// =====================================================
//
// GET /api/admin/availability?year=2026&month=9
//
// Optional:
// apartmentId
//
// =====================================================

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } =
      new URL(request.url);

    const year = Number(
      searchParams.get("year")
    );

    const month = Number(
      searchParams.get("month")
    );

    const apartmentId =
      searchParams.get("apartmentId");

    if (
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 2100
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid year",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid month",
        },
        { status: 400 }
      );
    }

    const {
      firstDay,
      nextMonth,
    } = getMonthRange(year, month);

    // ---------------------------------------------------
    // GET APARTMENTS
    // ---------------------------------------------------

    const apartmentQuery = {
      isActive: true,
    };

    if (apartmentId) {
      apartmentQuery._id = apartmentId;
    }

    const apartments =
      await Apartment.find(apartmentQuery)
        .sort({ size: 1 })
        .lean();

    // ---------------------------------------------------
    // GET BOOKINGS
    // ---------------------------------------------------
    //
    // Booking overlaps this month when:
    //
    // booking.checkIn < nextMonth
    // AND
    // booking.checkOut > firstDay
    //
    // Cancelled bookings are ignored.
    //
    // ---------------------------------------------------

    const bookingQuery = {
      status: {
        $in: ["pending", "confirmed"],
      },

      checkIn: {
        $lt: nextMonth,
      },

      checkOut: {
        $gt: firstDay,
      },
    };

    if (apartmentId) {
      bookingQuery.apartmentId =
        apartmentId;
    }

    const bookings =
      await Booking.find(bookingQuery)
        .select(
          "apartmentId checkIn checkOut"
        )
        .lean();

    // ---------------------------------------------------
    // GET MANUALLY UNAVAILABLE DATES
    // ---------------------------------------------------

    const unavailableQuery = {
      date: {
        $gte: formatDateKey(firstDay),
        $lt: formatDateKey(nextMonth),
      },
    };

    if (apartmentId) {
      unavailableQuery.apartmentId =
        apartmentId;
    }

    const unavailableDates =
      await UnavailableDate.find(
        unavailableQuery
      )
        .select(
          "apartmentId date"
        )
        .lean();

    // ---------------------------------------------------
    // GROUP BOOKED DATES BY APARTMENT
    // ---------------------------------------------------

    const bookedDatesByApartment = {};

    for (const booking of bookings) {
      const id =
        booking.apartmentId.toString();

      if (!bookedDatesByApartment[id]) {
        bookedDatesByApartment[id] = [];
      }

      const dates = expandBookingDates(
        booking.checkIn,
        booking.checkOut
      );

      for (const date of dates) {
        if (
          date >= formatDateKey(firstDay) &&
          date < formatDateKey(nextMonth)
        ) {
          if (
            !bookedDatesByApartment[id].includes(
              date
            )
          ) {
            bookedDatesByApartment[id].push(
              date
            );
          }
        }
      }
    }

    // ---------------------------------------------------
    // GROUP UNAVAILABLE DATES BY APARTMENT
    // ---------------------------------------------------

    const unavailableDatesByApartment =
      {};

    for (const item of unavailableDates) {
      const id =
        item.apartmentId.toString();

      if (
        !unavailableDatesByApartment[id]
      ) {
        unavailableDatesByApartment[id] = [];
      }

      unavailableDatesByApartment[id].push(
        item.date
      );
    }

    // ---------------------------------------------------
    // FORMAT RESPONSE
    // ---------------------------------------------------

    const result = apartments.map(
      (apartment) => {
        const id =
          apartment._id.toString();

        return {
          _id: id,
          size: apartment.size,
          title: apartment.title,

          bookedDates:
            bookedDatesByApartment[id] || [],

          unavailableDates:
            unavailableDatesByApartment[id] ||
            [],
        };
      }
    );

    return NextResponse.json({
      success: true,

      month: {
        year,
        month,
        firstDate:
          formatDateKey(firstDay),
        lastDate:
          formatDateKey(
            new Date(
              nextMonth.getTime() - 86400000
            )
          ),
      },

      apartments: result,
    });
  } catch (error) {
    console.error(
      "Get availability error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load availability",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// POST
// =====================================================
//
// Manually mark one date unavailable.
//
// =====================================================

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      apartmentId,
      date,
    } = body;

    if (
      !apartmentId ||
      !date ||
      !isValidDateKey(date)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Apartment and valid date are required",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // VERIFY APARTMENT
    // ---------------------------------------------------

    const apartment =
      await Apartment.findOne({
        _id: apartmentId,
        isActive: true,
      }).lean();

    if (!apartment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Apartment does not exist",
        },
        { status: 404 }
      );
    }

    // ---------------------------------------------------
    // CHECK CUSTOMER BOOKING
    // ---------------------------------------------------

    const dayStart = new Date(
      `${date}T00:00:00.000Z`
    );

    const nextDay = new Date(
      dayStart.getTime() +
        24 * 60 * 60 * 1000
    );

    const booked =
      await Booking.exists({
        apartmentId: apartment._id,

        status: {
          $in: [
            "pending",
            "confirmed",
          ],
        },

        checkIn: {
          $lt: nextDay,
        },

        checkOut: {
          $gt: dayStart,
        },
      });

    if (booked) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This date is already booked by a customer",
        },
        { status: 409 }
      );
    }

    // ---------------------------------------------------
    // CREATE MANUAL BLOCK
    // ---------------------------------------------------

    const unavailable =
      await UnavailableDate.findOneAndUpdate(
        {
          apartmentId:
            apartment._id,

          date,
        },
        {
          apartmentId:
            apartment._id,

          date,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

    return NextResponse.json({
      success: true,

      message:
        "Date marked as unavailable",

      unavailableDate: {
        id: unavailable._id.toString(),
        apartmentId:
          unavailable.apartmentId.toString(),
        date: unavailable.date,
      },
    });
  } catch (error) {
    console.error(
      "Create unavailable date error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to mark date unavailable",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE
// =====================================================
//
// Remove one manually blocked date.
//
// Customer bookings cannot be deleted here.
//
// =====================================================

export async function DELETE(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      apartmentId,
      date,
    } = body;

    if (
      !apartmentId ||
      !date ||
      !isValidDateKey(date)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Apartment and valid date are required",
        },
        { status: 400 }
      );
    }

    const deleted =
      await UnavailableDate.findOneAndDelete({
        apartmentId,
        date,
      });

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unavailable date not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,

      message:
        "Date is available again",
    });
  } catch (error) {
    console.error(
      "Delete unavailable date error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to make date available",
      },
      { status: 500 }
    );
  }
}