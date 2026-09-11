"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiCheck,
  FiImage,
  FiPlus,
  FiTrash2,
  FiUpload,
} from "react-icons/fi";

const DEFAULT_AMENITIES = [
  "High-speed WiFi",
  "Rooftop swimming pool",
  "Non-smoking room",
  "Fitness center",
  "On-site parking",
  "Housekeeping service",
  "Restaurant",
];

const DEFAULT_ROOM_FEATURES = [
  "Balcony",
  "Air Conditioner",
  "Queen Bed",
  "Safe Box",
  "4K Smart TV",
  "Refrigerator",
  "All cooking utensils",
  "Kettle",
  "Microwave",
  "Electric Stove",
];

const DEFAULT_BATHROOM = [
  "Shower",
  "Toothbrush and paste",
  "Towels",
  "Hot Water",
  "Soap and shampoo",
];

const DEFAULT_POLICIES = [
  "NID or Passport copy of each guest is required.",
  "Mobile pictures of the required documents are accepted.",
  "The building has CCTV cameras covering hallways and common spaces.",
  "Our staff maintains cleanliness throughout the property.",
  "24/7 entrance security is available throughout the building.",
  "Outside guests are not allowed on the premises. Only registered guests can access the building.",
  "Guest verification and photos will be taken in person during check-in.",
];

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_IMAGES = 30;

function EditableList({
  title,
  description,
  items,
  setItems,
  placeholder,
}) {
  const [newItem, setNewItem] = useState("");

  const removeItem = (index) => {
    setItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const addItem = () => {
    const value = newItem.trim();

    if (!value) return;

    setItems((current) => [...current, value]);
    setNewItem("");
  };

  const updateItem = (index, value) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? value : item
      )
    );
  };

  return (
    <section className="rounded-[28px] border border-black/8 bg-white/70 p-6 sm:p-7">
      <div>
        <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/35">
          Apartment Content
        </p>

        <h2 className="mt-1 text-lg font-medium tracking-tight">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-xs leading-5 text-black/40">
            {description}
          </p>
        )}
      </div>

      <div className="mt-5 space-y-2">
        {items.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/5 text-black/35">
              <FiCheck size={14} />
            </div>

            <input
              type="text"
              value={item}
              onChange={(event) =>
                updateItem(index, event.target.value)
              }
              disabled={false}
              className="
                min-w-0
                flex-1
                rounded-xl
                border
                border-black/8
                bg-[#f8f7f3]
                px-3
                py-2.5
                text-sm
                text-[#11110f]
                outline-none
                transition
                focus:border-black/20
                focus:bg-white
              "
            />

            <button
              type="button"
              onClick={() => removeItem(index)}
              aria-label={`Remove ${title} item`}
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-black/8
                bg-white
                text-black/30
                transition
                hover:border-red-200
                hover:bg-red-50
                hover:text-red-500
              "
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(event) => setNewItem(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
          className="
            min-w-0
            flex-1
            rounded-xl
            border
            border-black/8
            bg-white
            px-3
            py-2.5
            text-sm
            outline-none
            placeholder:text-black/25
            focus:border-black/20
          "
        />

        <button
          type="button"
          onClick={addItem}
          className="
            flex
            shrink-0
            items-center
            gap-2
            rounded-xl
            bg-[#11110f]
            px-4
            py-2.5
            text-xs
            font-medium
            text-white
            transition
            hover:bg-black
          "
        >
          <FiPlus size={14} />
          Add
        </button>
      </div>
    </section>
  );
}

export default function NewApartmentPage() {
  const [form, setForm] = useState({
    size: "",
    title: "",
    description: "",
    daily: "",
    weekly: "",
    fifteenDays: "",
    monthly: "",
    status: "Available",
  });

  const [amenities, setAmenities] =
    useState(DEFAULT_AMENITIES);

  const [roomFeatures, setRoomFeatures] =
    useState(DEFAULT_ROOM_FEATURES);

  const [bathroom, setBathroom] =
    useState(DEFAULT_BATHROOM);

  const [policies, setPolicies] =
    useState(DEFAULT_POLICIES);

  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  /*
   * =========================================================
   * IMAGE PREVIEW URL CLEANUP
   * =========================================================
   */

  useEffect(() => {
    return () => {
      images.forEach((file) => {
        if (file?.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [images]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /*
   * =========================================================
   * HANDLE IMAGE SELECTION
   * =========================================================
   */

  const handleImages = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      event.target.value = "";
      return;
    }

    setError("");

    const remainingSlots = MAX_IMAGES - images.length;

    if (remainingSlots <= 0) {
      setError(
        `You can upload a maximum of ${MAX_IMAGES} images.`
      );

      event.target.value = "";
      return;
    }

    const selectedFiles = files.slice(0, remainingSlots);
    const validFiles = [];

    for (const file of selectedFiles) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setError(
          `${file.name}: Only JPG, PNG, WebP and AVIF images are allowed.`
        );
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setError(
          `${file.name}: Image must be smaller than 10 MB.`
        );
        continue;
      }

      const preview = URL.createObjectURL(file);

      validFiles.push({
        file,
        preview,
      });
    }

    if (files.length > remainingSlots) {
      setError(
        `Only ${remainingSlots} more image${
          remainingSlots === 1 ? "" : "s"
        } can be added.`
      );
    }

    setImages((current) => [
      ...current,
      ...validFiles,
    ]);

    event.target.value = "";
  };

  /*
   * =========================================================
   * REMOVE SELECTED IMAGE
   * =========================================================
   */

  const removeImage = (index) => {
    setImages((current) => {
      const imageToRemove = current[index];

      if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      return current.filter(
        (_, imageIndex) => imageIndex !== index
      );
    });
  };

  /*
   * =========================================================
   * UPLOAD ONE IMAGE TO CLOUDINARY
   * =========================================================
   */

  const uploadImage = async (file) => {
    const imageFormData = new FormData();

    imageFormData.append("file", file);

    const response = await fetch(
      "/api/admin/upload",
      {
        method: "POST",
        credentials: "include",
        body: imageFormData,
      }
    );

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error(
        "Invalid response received while uploading image."
      );
    }

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to upload image."
      );
    }

    if (
      !data.image?.url ||
      !data.image?.publicId
    ) {
      throw new Error(
        "Cloudinary upload did not return a valid image."
      );
    }

    return {
      url: data.image.url,
      publicId: data.image.publicId,
    };
  };

  /*
   * =========================================================
   * SUBMIT
   * =========================================================
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");
    setSaved(false);
    setLoading(true);

    try {
      /*
       * =====================================================
       * BASIC VALIDATION
       * =====================================================
       */

      const size = Number(form.size);

      if (!size || size < 1) {
        throw new Error(
          "Please enter a valid apartment size."
        );
      }

      if (!form.title.trim()) {
        throw new Error(
          "Please enter an apartment name."
        );
      }

      if (!form.description.trim()) {
        throw new Error(
          "Please enter an apartment description."
        );
      }

      if (images.length === 0) {
        throw new Error(
          "Please upload at least one apartment photo."
        );
      }

      const daily = Number(form.daily);
      const weekly = Number(form.weekly);
      const fifteenDays = Number(form.fifteenDays);
      const monthly = Number(form.monthly);

      if (
        !Number.isFinite(daily) ||
        daily < 0 ||
        !Number.isFinite(weekly) ||
        weekly < 0 ||
        !Number.isFinite(fifteenDays) ||
        fifteenDays < 0 ||
        !Number.isFinite(monthly) ||
        monthly < 0
      ) {
        throw new Error(
          "Please enter valid pricing for all stay lengths."
        );
      }

      /*
       * =====================================================
       * UPLOAD IMAGES
       * =====================================================
       */

      const uploadedImages = [];

      for (let index = 0; index < images.length; index++) {
        const image = images[index];

        const uploadedImage = await uploadImage(
          image.file
        );

        uploadedImages.push(uploadedImage);
      }

      /*
       * =====================================================
       * PRICING
       *
       * 1–6 days
       * 7–14 days
       * 15–29 days
       * 30+ days
       * =====================================================
       */

      const pricing = [
        {
          minDays: 1,
          maxDays: 6,
          pricePerDay: daily,
        },
        {
          minDays: 7,
          maxDays: 14,
          pricePerDay: weekly,
        },
        {
          minDays: 15,
          maxDays: 29,
          pricePerDay: fifteenDays,
        },
        {
          minDays: 30,
          maxDays: null,
          pricePerDay: monthly,
        },
      ];

      /*
       * =====================================================
       * APARTMENT PAYLOAD
       * =====================================================
       */

      const payload = {
        size,

        title: form.title.trim(),

        description:
          form.description.trim(),

        /*
         * IMPORTANT:
         * Store BOTH Cloudinary URL and publicId.
         *
         * The API/model now expects:
         *
         * {
         *   url: "...",
         *   publicId: "..."
         * }
         */

        images: uploadedImages.map((image) => ({
          url: image.url,
          publicId: image.publicId,
        })),

        amenities: amenities
          .map((item) => item.trim())
          .filter(Boolean),

        roomFeatures: roomFeatures
          .map((item) => item.trim())
          .filter(Boolean),

        bathroomFacilities: bathroom
          .map((item) => item.trim())
          .filter(Boolean),

        policies: policies
          .map((item) => item.trim())
          .filter(Boolean),

        pricing,

        isAvailable:
          form.status === "Available",

        isActive: true,
      };

      /*
       * =====================================================
       * CREATE APARTMENT
       * =====================================================
       */

      const response = await fetch(
        "/api/admin/apartments",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify(payload),
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Invalid response received from the server."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to create apartment."
        );
      }

      /*
       * =====================================================
       * SUCCESS
       * =====================================================
       */

      setSaved(true);

      setTimeout(() => {
        window.location.href =
          "/admin/apartments";
      }, 800);
    } catch (error) {
      console.error(
        "Create apartment error:",
        error
      );

      setError(
        error?.message ||
          "Something went wrong while creating the apartment."
      );

      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f4f0] text-[#11110f]">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="px-4 pb-8 pt-28 sm:px-6 lg:px-10 lg:pt-32">
        <div className="mx-auto max-w-5xl">

          <Link
            href="/admin/apartments"
            className="
              group
              mb-6
              inline-flex
              items-center
              gap-2
              text-xs
              font-medium
              text-black/40
              transition
              hover:text-black
            "
          >
            <FiArrowLeft
              size={14}
              className="transition-transform duration-300 group-hover:-translate-x-0.5"
            />

            Apartments
          </Link>

          <div
            className="
              flex
              flex-col
              gap-5
              border-b
              border-black/10
              pb-8
              md:flex-row
              md:items-end
              md:justify-between
            "
          >
            <div>

              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-black/35">
                Property Management
              </p>

              <h1 className="mt-3 text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
                Add Apartment
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-black/45">
                Create a new apartment and configure its
                information, pricing, photos and facilities.
              </p>

            </div>

            <div className="rounded-full border border-black/8 bg-white/60 px-4 py-2 text-[10px] text-black/40">
              Database connected
            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          FORM
      ====================================================== */}

      <section className="px-4 pb-28 sm:px-6 lg:px-10">

        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-5xl space-y-5"
        >

          {/* =================================================
              BASIC INFORMATION
          ================================================== */}

          <section className="rounded-[28px] border border-black/8 bg-white/70 p-6 sm:p-7">

            <div>

              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/35">
                01
              </p>

              <h2 className="mt-1 text-lg font-medium tracking-tight">
                Basic Information
              </h2>

            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              {/* SIZE */}

              <div>

                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.15em] text-black/35">
                  Size
                </label>

                <div className="relative">

                  <input
                    type="number"
                    min="1"
                    value={form.size}
                    onChange={(event) =>
                      updateField(
                        "size",
                        event.target.value
                      )
                    }
                    placeholder="250"
                    required
                    disabled={loading}
                    className="
                      w-full
                      rounded-xl
                      border
                      border-black/8
                      bg-white
                      px-4
                      py-3
                      pr-20
                      text-sm
                      outline-none
                      placeholder:text-black/25
                      focus:border-black/20
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-black/30">
                    sq.ft.
                  </span>

                </div>

              </div>

              {/* TITLE */}

              <div>

                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.15em] text-black/35">
                  Apartment Name
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    updateField(
                      "title",
                      event.target.value
                    )
                  }
                  placeholder="250 sq.ft. Apartment"
                  required
                  maxLength={150}
                  disabled={loading}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-black/8
                    bg-white
                    px-4
                    py-3
                    text-sm
                    outline-none
                    placeholder:text-black/25
                    focus:border-black/20
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                />

              </div>

              {/* STATUS */}

              <div>

                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.15em] text-black/35">
                  Status
                </label>

                <select
                  value={form.status}
                  onChange={(event) =>
                    updateField(
                      "status",
                      event.target.value
                    )
                  }
                  disabled={loading}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-black/8
                    bg-white
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-black/20
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  <option value="Available">
                    Available
                  </option>

                  <option value="Unavailable">
                    Unavailable
                  </option>

                </select>

              </div>

              {/* DESCRIPTION */}

              <div className="sm:col-span-2">

                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.15em] text-black/35">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Write a short description of this apartment..."
                  rows={4}
                  required
                  maxLength={5000}
                  disabled={loading}
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-black/8
                    bg-white
                    px-4
                    py-3
                    text-sm
                    leading-6
                    outline-none
                    placeholder:text-black/25
                    focus:border-black/20
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                />

              </div>

            </div>

          </section>

          {/* =================================================
              PHOTOS
          ================================================== */}

          <section className="rounded-[28px] border border-black/8 bg-white/70 p-6 sm:p-7">

            <div>

              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/35">
                02
              </p>

              <h2 className="mt-1 text-lg font-medium tracking-tight">
                Apartment Photos
              </h2>

              <p className="mt-1 text-xs leading-5 text-black/40">
                Upload the photos that will appear on the
                public apartment page.
              </p>

            </div>

            <div className="mt-5">

              <label
                htmlFor="apartment-images"
                className={` 
                  flex
                  flex-col
                  items-center
                  justify-center
                  rounded-[22px]
                  border
                  border-dashed
                  border-black/15
                  bg-[#f8f7f3]
                  px-6
                  py-10
                  text-center
                  transition
                  ${
                    loading
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:border-black/25 hover:bg-white"
                  }
                `}
              >

                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#11110f]
                    text-white
                  "
                >
                  <FiUpload size={17} />
                </div>

                <p className="mt-4 text-sm font-medium">
                  Upload apartment photos
                </p>

                <p className="mt-1 text-xs text-black/35">
                  JPG, PNG, WebP or AVIF · Max 10 MB each
                </p>

                <p className="mt-1 text-[10px] text-black/25">
                  Maximum {MAX_IMAGES} images
                </p>

                <input
                  id="apartment-images"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  onChange={handleImages}
                  disabled={loading}
                  className="hidden"
                />

              </label>

            </div>

            {/* IMAGE PREVIEWS */}

            {images.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

                {images.map((image, index) => (
                  <div
                    key={`${image.file.name}-${index}`}
                    className="
                      group
                      relative
                      overflow-hidden
                      rounded-2xl
                      border
                      border-black/8
                      bg-[#f8f7f3]
                    "
                  >

                    <div className="relative aspect-square overflow-hidden">

                      <img
                        src={image.preview}
                        alt={image.file.name}
                        className="
                          h-full
                          w-full
                          object-cover
                          transition
                          duration-500
                          group-hover:scale-105
                        "
                      />

                      {/* IMAGE NUMBER */}

                      <div
                        className="
                          absolute
                          left-2
                          top-2
                          flex
                          h-7
                          min-w-7
                          items-center
                          justify-center
                          rounded-full
                          bg-black/70
                          px-2
                          text-[10px]
                          font-medium
                          text-white
                          backdrop-blur-sm
                        "
                      >
                        {index + 1}
                      </div>

                      {/* REMOVE */}

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(index)
                        }
                        disabled={loading}
                        aria-label={`Remove ${image.file.name}`}
                        className="
                          absolute
                          right-2
                          top-2
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-full
                          bg-black/70
                          text-white
                          opacity-0
                          transition
                          group-hover:opacity-100
                          hover:bg-red-500
                          disabled:cursor-not-allowed
                        "
                      >
                        <FiTrash2 size={13} />
                      </button>

                    </div>

                    <div className="border-t border-black/8 px-3 py-2">

                      <p className="truncate text-[10px] font-medium">
                        {image.file.name}
                      </p>

                      <p className="mt-0.5 text-[9px] text-black/30">
                        {(
                          image.file.size /
                          (1024 * 1024)
                        ).toFixed(2)}{" "}
                        MB
                      </p>

                    </div>

                  </div>
                ))}

              </div>
            )}

            {images.length > 0 && (
              <div className="mt-4 flex items-center justify-between gap-3">

                <p className="text-[10px] text-black/35">
                  {images.length}{" "}
                  {images.length === 1
                    ? "image"
                    : "images"}{" "}
                  selected. Images will be uploaded to
                  Cloudinary when you create the apartment.
                </p>

                <span className="shrink-0 rounded-full bg-black/5 px-3 py-1 text-[9px] text-black/40">
                  {images.length}/{MAX_IMAGES}
                </span>

              </div>
            )}

          </section>

          {/* =================================================
              PRICING
          ================================================== */}

          <section className="rounded-[28px] border border-black/8 bg-white/70 p-6 sm:p-7">

            <div>

              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/35">
                03
              </p>

              <h2 className="mt-1 text-lg font-medium tracking-tight">
                Pricing
              </h2>

              <p className="mt-1 text-xs leading-5 text-black/40">
                Set the price per day for each stay-length tier.
              </p>

            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {[
                ["daily", "1–6 Days"],
                ["weekly", "7–14 Days"],
                ["fifteenDays", "15–29 Days"],
                ["monthly", "30+ Days"],
              ].map(([field, label]) => (
                <div key={field}>

                  <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.15em] text-black/35">
                    {label}
                  </label>

                  <div className="relative">

                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-black/35">
                      ৳
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form[field]}
                      onChange={(event) =>
                        updateField(
                          field,
                          event.target.value
                        )
                      }
                      placeholder="0"
                      required
                      disabled={loading}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-black/8
                        bg-white
                        px-4
                        py-3
                        pl-9
                        text-sm
                        outline-none
                        focus:border-black/20
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    />

                  </div>

                </div>
              ))}

            </div>

          </section>

          {/* =================================================
              AMENITIES
          ================================================== */}

          <EditableList
            title="Amenities & Facilities"
            description="Default amenities are already added. Remove anything this apartment does not have or add something new."
            items={amenities}
            setItems={setAmenities}
            placeholder="Add an amenity..."
          />

          {/* =================================================
              ROOM FEATURES
          ================================================== */}

          <EditableList
            title="Room Features"
            description="Customize the features available inside this apartment."
            items={roomFeatures}
            setItems={setRoomFeatures}
            placeholder="Add a room feature..."
          />

          {/* =================================================
              BATHROOM
          ================================================== */}

          <EditableList
            title="Bathroom Facilities"
            description="Customize the bathroom facilities for this apartment."
            items={bathroom}
            setItems={setBathroom}
            placeholder="Add a bathroom facility..."
          />

          {/* =================================================
              POLICIES
          ================================================== */}

          <EditableList
            title="Booking Policies"
            description="Default policies are included. Remove or add policies as needed."
            items={policies}
            setItems={setPolicies}
            placeholder="Add a booking policy..."
          />

          {/* =================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="rounded-[20px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* =================================================
              SAVE
          ================================================== */}

          <div
            className="
              sticky
              bottom-4
              rounded-[24px]
              border
              border-black/10
              bg-[#11110f]/95
              p-3
              shadow-[0_20px_60px_rgba(0,0,0,0.18)]
              backdrop-blur-xl
            "
          >

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="px-3">

                <p className="text-sm font-medium text-white">
                  Ready to create this apartment?
                </p>

                <p className="mt-1 text-[10px] text-white/35">
                  Review the information before saving.
                </p>

              </div>

              <div className="flex gap-2">

                <Link
                  href="/admin/apartments"
                  className="
                    flex
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/10
                    bg-white/5
                    px-5
                    py-3
                    text-xs
                    font-medium
                    text-white/60
                    transition
                    hover:bg-white/10
                    hover:text-white
                  "
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-[#f5f4f0]
                    px-5
                    py-3
                    text-xs
                    font-medium
                    text-[#11110f]
                    transition
                    hover:bg-white
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  <FiCheck size={14} />

                  {loading
                    ? "Uploading & Creating..."
                    : "Create Apartment"}

                </button>

              </div>

            </div>

          </div>

        </form>

      </section>

      {/* =====================================================
          SUCCESS MESSAGE
      ====================================================== */}

      {saved && (
        <div
          className="
            fixed
            bottom-6
            left-1/2
            z-50
            flex
            -translate-x-1/2
            items-center
            gap-3
            rounded-full
            border
            border-black/10
            bg-[#11110f]
            px-5
            py-3
            text-sm
            text-white
            shadow-[0_15px_50px_rgba(0,0,0,0.2)]
          "
        >

          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
            <FiCheck size={13} />
          </span>

          Apartment created successfully

        </div>
      )}

    </main>
  );
}