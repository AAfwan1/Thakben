"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiCheck,
  FiImage,
  FiLoader,
  FiPlus,
  FiSave,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";

export default function EditApartmentPage({ params }) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    size: "",
    title: "",
    description: "",
    isAvailable: true,
    isActive: true,

    amenities: [],
    roomFeatures: [],
    bathroomFacilities: [],
    policies: [],

    images: [],

    daily: "",
    weekly: "",
    fifteenDays: "",
    monthly: "",
  });

  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    loadApartment();
  }, [id]);

  async function loadApartment() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/apartments/${id}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load apartment"
        );
      }

      const apartment = data.apartment;
      const pricing = apartment.pricing || [];

      const getPrice = (minDays) => {
        const tier = pricing.find(
          (item) => Number(item.minDays) === minDays
        );

        return tier?.pricePerDay ?? "";
      };

      setForm({
        size: apartment.size ?? "",
        title: apartment.title ?? "",
        description: apartment.description ?? "",

        isAvailable:
          apartment.isAvailable !== false,

        isActive:
          apartment.isActive !== false,

        amenities:
          apartment.amenities || [],

        roomFeatures:
          apartment.roomFeatures || [],

        bathroomFacilities:
          apartment.bathroomFacilities || [],

        policies:
          apartment.policies || [],

        images:
          (apartment.images || []).map((image) => {
            if (typeof image === "string") {
              return {
                url: image,
                publicId: "",
              };
            }

            return {
              url: image.url,
              publicId: image.publicId || "",
            };
          }),

        daily: getPrice(1),
        weekly: getPrice(7),
        fifteenDays: getPrice(15),
        monthly: getPrice(30),
      });
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Failed to load apartment"
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function addListItem(field) {
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  }

  function updateListItem(field, index, value) {
    setForm((prev) => {
      const updated = [...prev[field]];
      updated[index] = value;

      return {
        ...prev,
        [field]: updated,
      };
    });
  }

  function removeListItem(field, index) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  }

  function removeExistingImage(index) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter(
        (_, imageIndex) => imageIndex !== index
      ),
    }));
  }

  function removeNewImage(index) {
    setNewImages((prev) => {
      const image = prev[index];

      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }

      return prev.filter(
        (_, imageIndex) => imageIndex !== index
      );
    });
  }

  function handleImageSelect(event) {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) return;

    const availableSlots =
      30 -
      form.images.length -
      newImages.length;

    if (availableSlots <= 0) {
      setError(
        "Maximum 30 images are allowed."
      );

      event.target.value = "";
      return;
    }

    const selectedFiles = files.slice(
      0,
      availableSlots
    );

    const validImages = [];

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        setError(
          `${file.name}: Only JPG, PNG, WebP and AVIF images are allowed.`
        );
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError(
          `${file.name}: Image must be smaller than 10 MB.`
        );
        continue;
      }

      validImages.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }

    if (validImages.length) {
      setError("");

      setNewImages((prev) => [
        ...prev,
        ...validImages,
      ]);
    }

    event.target.value = "";
  }

  async function uploadImage(file) {
    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
      "/api/admin/upload",
      {
        method: "POST",
        credentials: "include",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to upload image"
      );
    }

    if (
      !data.image?.url ||
      !data.image?.publicId
    ) {
      throw new Error(
        "Cloudinary returned invalid image data"
      );
    }

    return {
      url: data.image.url,
      publicId: data.image.publicId,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Apartment title is required.");
      return;
    }

    if (!form.size) {
      setError("Apartment size is required.");
      return;
    }

    if (!form.description.trim()) {
      setError(
        "Apartment description is required."
      );
      return;
    }

    const daily = Number(form.daily);
    const weekly = Number(form.weekly);
    const fifteenDays = Number(
      form.fifteenDays
    );
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
      setError(
        "Please enter valid pricing values."
      );
      return;
    }

    const cleanList = (items) =>
      items
        .map((item) => item.trim())
        .filter(Boolean);

    try {
      setSaving(true);

      /*
       * Upload new images first
       */
      const uploadedImages = [];

      for (
        let i = 0;
        i < newImages.length;
        i++
      ) {
        setSuccess(
          `Uploading image ${i + 1} of ${newImages.length}...`
        );

        const uploaded = await uploadImage(
          newImages[i].file
        );

        uploadedImages.push(uploaded);
      }

      /*
       * Existing images + newly uploaded images
       */
      const finalImages = [
        ...form.images.filter(
          (image) =>
            image.url &&
            image.publicId
        ),
        ...uploadedImages,
      ];

      /*
       * Pricing tiers
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

      setSuccess("Saving apartment...");

      const response = await fetch(
        `/api/admin/apartments/${id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            size: Number(form.size),

            title: form.title.trim(),

            description:
              form.description.trim(),

            images: finalImages,

            amenities:
              cleanList(form.amenities),

            roomFeatures:
              cleanList(form.roomFeatures),

            bathroomFacilities:
              cleanList(
                form.bathroomFacilities
              ),

            policies:
              cleanList(form.policies),

            pricing,

            isAvailable:
              form.isAvailable,

            isActive:
              form.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update apartment"
        );
      }

      setSuccess(
        "Apartment updated successfully."
      );

      newImages.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(
            image.preview
          );
        }
      });

      setNewImages([]);

      setTimeout(() => {
        router.push(
          "/admin/apartments"
        );
      }, 700);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to update apartment"
      );

      setSuccess("");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-white">
        <div className="flex items-center gap-3 text-black/50">
          <FiLoader className="animate-spin" />
          Loading apartment...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-6xl px-4 py-30 sm:px-6 lg:px-8">

        {/* Header */}

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>

            <h1 className="text-2xl font-semibold text-black">
              Edit Apartment
            </h1>

            <p className="mt-1 text-sm text-black/40">
              Update apartment details,
              pricing and images.
            </p>
          </div>
        </div>

        {/* Messages */}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <FiX />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
            <FiCheck />
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Basic Information */}

          <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-medium text-black">
              Basic Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm text-black/60">
                  Apartment Size
                </label>

                <input
                  type="number"
                  min="1"
                  value={form.size}
                  onChange={(e) =>
                    updateField(
                      "size",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-black outline-none transition placeholder:text-black/30 focus:border-black/30 focus:ring-2 focus:ring-black/5"
                  placeholder="250"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-black/60">
                  Title
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    updateField(
                      "title",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-black outline-none transition placeholder:text-black/30 focus:border-black/30 focus:ring-2 focus:ring-black/5"
                  placeholder="Premium Studio Apartment"
                />
              </div>

            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm text-black/60">
                Description
              </label>

              <textarea
                rows={6}
                value={form.description}
                onChange={(e) =>
                  updateField(
                    "description",
                    e.target.value
                  )
                }
                className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-black outline-none transition placeholder:text-black/30 focus:border-black/30 focus:ring-2 focus:ring-black/5"
                placeholder="Describe the apartment..."
              />
            </div>
          </section>

          {/* Status */}

          <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-medium text-black">
              Status
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-black/10 bg-[#fafafa] p-4">
                <div>
                  <p className="text-sm font-medium text-black">
                    Booking Availability
                  </p>

                  <p className="mt-1 text-xs text-black/40">
                    Customers can book this
                    apartment.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={
                    form.isAvailable
                  }
                  onChange={(e) =>
                    updateField(
                      "isAvailable",
                      e.target.checked
                    )
                  }
                  className="h-5 w-5 accent-black"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-black/10 bg-[#fafafa] p-4">
                <div>
                  <p className="text-sm font-medium text-black">
                    Listing Status
                  </p>

                  <p className="mt-1 text-xs text-black/40">
                    Show this apartment on
                    the website.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    updateField(
                      "isActive",
                      e.target.checked
                    )
                  }
                  className="h-5 w-5 accent-black"
                />
              </label>

            </div>
          </section>

          {/* Images */}

          <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-medium text-black">
                  <FiImage />
                  Images
                </h2>

                <p className="mt-1 text-xs text-black/40">
                  Maximum 30 images. New images
                  are uploaded to Cloudinary.
                </p>
              </div>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-black/10 bg-black px-4 py-2.5 text-sm text-white transition hover:bg-black/90">
                <FiUpload />
                Add Images

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  onChange={
                    handleImageSelect
                  }
                  className="hidden"
                />
              </label>
            </div>

            {(form.images.length > 0 ||
              newImages.length > 0) && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">

                {/* Existing */}

                {form.images.map(
                  (image, index) => (
                    <div
                      key={`existing-${index}`}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-black/10 bg-[#f5f5f5]"
                    >
                      <img
                        src={image.url}
                        alt={`Apartment image ${
                          index + 1
                        }`}
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/30" />

                      <button
                        type="button"
                        onClick={() =>
                          removeExistingImage(
                            index
                          )
                        }
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white opacity-0 transition group-hover:opacity-100"
                        title="Remove image"
                      >
                        <FiTrash2
                          size={15}
                        />
                      </button>

                      <div className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-[10px] text-white">
                        Existing
                      </div>
                    </div>
                  )
                )}

                {/* New */}

                {newImages.map(
                  (image, index) => (
                    <div
                      key={`new-${index}`}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-emerald-300 bg-[#f5f5f5]"
                    >
                      <img
                        src={image.preview}
                        alt={`New image ${
                          index + 1
                        }`}
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/30" />

                      <button
                        type="button"
                        onClick={() =>
                          removeNewImage(
                            index
                          )
                        }
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white opacity-0 transition group-hover:opacity-100"
                        title="Remove image"
                      >
                        <FiTrash2
                          size={15}
                        />
                      </button>

                      <div className="absolute bottom-2 left-2 rounded-md bg-emerald-500 px-2 py-1 text-[10px] text-white">
                        New
                      </div>
                    </div>
                  )
                )}

              </div>
            )}

            {form.images.length === 0 &&
              newImages.length === 0 && (
                <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-black/10 text-sm text-black/30">
                  No images added
                </div>
              )}

          </section>

          {/* Pricing */}

          <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-medium text-black">
              Pricing
            </h2>

            <p className="mb-6 text-xs text-black/40">
              Price per day according to the
              applicable stay length.
            </p>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              <PriceInput
                label="1–6 Days"
                value={form.daily}
                onChange={(value) =>
                  updateField(
                    "daily",
                    value
                  )
                }
              />

              <PriceInput
                label="7–14 Days"
                value={form.weekly}
                onChange={(value) =>
                  updateField(
                    "weekly",
                    value
                  )
                }
              />

              <PriceInput
                label="15–29 Days"
                value={form.fifteenDays}
                onChange={(value) =>
                  updateField(
                    "fifteenDays",
                    value
                  )
                }
              />

              <PriceInput
                label="30+ Days"
                value={form.monthly}
                onChange={(value) =>
                  updateField(
                    "monthly",
                    value
                  )
                }
              />

            </div>
          </section>

          {/* Amenities */}

          <ListSection
            title="Amenities"
            items={form.amenities}
            field="amenities"
            onAdd={addListItem}
            onChange={updateListItem}
            onRemove={removeListItem}
          />

          {/* Room Features */}

          <ListSection
            title="Room Features"
            items={form.roomFeatures}
            field="roomFeatures"
            onAdd={addListItem}
            onChange={updateListItem}
            onRemove={removeListItem}
          />

          {/* Bathroom Facilities */}

          <ListSection
            title="Bathroom Facilities"
            items={
              form.bathroomFacilities
            }
            field="bathroomFacilities"
            onAdd={addListItem}
            onChange={updateListItem}
            onRemove={removeListItem}
          />

          {/* Policies */}

          <ListSection
            title="Policies"
            items={form.policies}
            field="policies"
            onAdd={addListItem}
            onChange={updateListItem}
            onRemove={removeListItem}
          />

          {/* Save */}

          <div className="flex flex-col-reverse gap-3 border-t border-black/10 pt-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                router.push(
                  "/admin/apartments"
                )
              }
              className="rounded-xl border border-black/10 px-6 py-3 text-sm text-black/60 transition hover:bg-black/5 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <FiLoader className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave />
                  Save Changes
                </>
              )}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

function PriceInput({
  label,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-black/60">
        {label}
      </label>

      <div className="relative">
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 pr-14 text-black outline-none transition placeholder:text-black/30 focus:border-black/30 focus:ring-2 focus:ring-black/5"
          placeholder="0"
        />

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-black/30">
          BDT
        </span>
      </div>
    </div>
  );
}

function ListSection({
  title,
  items,
  field,
  onAdd,
  onChange,
  onRemove,
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">

      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-medium text-black">
          {title}
        </h2>

        <button
          type="button"
          onClick={() => onAdd(field)}
          className="flex items-center gap-2 rounded-lg border border-black/10 bg-black px-3 py-2 text-xs text-white transition hover:bg-black/90"
        >
          <FiPlus />
          Add
        </button>
      </div>

      <div className="space-y-3">

        {items.map((item, index) => (
          <div
            key={index}
            className="flex gap-2"
          >
            <input
              type="text"
              value={item}
              onChange={(e) =>
                onChange(
                  field,
                  index,
                  e.target.value
                )
              }
              className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/30 focus:border-black/30 focus:ring-2 focus:ring-black/5"
              placeholder={`Enter ${title.toLowerCase()}...`}
            />

            <button
              type="button"
              onClick={() =>
                onRemove(
                  field,
                  index
                )
              }
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100"
            >
              <FiTrash2 />
            </button>
          </div>
        ))}

        {items.length === 0 && (
          <p className="rounded-xl border border-dashed border-black/10 py-8 text-center text-sm text-black/30">
            No {title.toLowerCase()} added.
          </p>
        )}

      </div>
    </section>
  );
}