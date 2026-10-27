import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { FaArrowLeft, FaSave, FaTimes } from "react-icons/fa";
import { useNavigate, useParams } from "react-router";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import MapPicker from "./MapPicker";
import { getAvailableGuides } from "../../services/guideService";
import { createTour, updateTour } from "../../services/tourService";
import useApi from "../../hooks/useApi";
import toast from "react-hot-toast";

export default function AddTourForm({
  isEditTour = false,
  existingTour = null,
}) {
  const { slug } = useParams();

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      location: "",
      duration: "",
      participants: "",
      difficulty: "Medium",
      languages: "",
      startDate: "",
      overview: "",
      description: "",
      pricePerPerson: "",
      highlights: [""],
      included: [""],
      guides: [],
      existingImages: [],
      images: [],
      thumbnail: null,
      existingThumbnail: "",
      stops: [],
    },
  });

  const {
    fields: highlightFields,
    append: appendHighlight,
    remove: removeHighlight,
  } = useFieldArray({ control, name: "highlights" });

  const {
    fields: includedFields,
    append: appendIncluded,
    remove: removeIncluded,
  } = useFieldArray({ control, name: "included" });

  const {
    fields: guideFields,
    append: appendGuide,
    remove: removeGuide,
  } = useFieldArray({ control, name: "guides" });

  const {
    fields: stopFields,
    append: appendStop,
    remove: removeStop,
    update: updateStop,
  } = useFieldArray({ control, name: "stops" });

  const selectedGuideIds = useWatch({ control, name: "guides" }) || [];

  const [imageFiles, setImageFiles] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [allGuides, setAllGuides] = useState(
    isEditTour ? existingTour.guides : []
  );
  const [mapPickerConfig, setMapPickerConfig] = useState(null);

  const { request: fetchGuides } = useApi(getAvailableGuides);
  const { loading: creatingTour, request: createTourRequest } =
    useApi(createTour);
  const { loading: updatingTour, request: updateTourRequest } =
    useApi(updateTour);

  // Pre-fill for edit mode
  useEffect(() => {
    if (isEditTour && existingTour) {
      setValue("title", existingTour.title);
      setValue("location", existingTour.location);
      setValue("duration", existingTour.duration);
      setValue("participants", existingTour.participants);
      setValue("difficulty", existingTour.difficulty);
      setValue("languages", existingTour.languages.join(", "));
      setValue("startDate", existingTour.startDate.split("T")[0]);
      setValue("overview", existingTour.overview);
      setValue("description", existingTour.description);
      setValue("pricePerPerson", existingTour.pricePerPerson);
      setValue("highlights", existingTour.highlights);
      setValue("included", existingTour.included);
      setValue(
        "guides",
        existingTour.guides.map((g) => ({ _id: g._id }))
      );
      setValue("stops", existingTour.tourSpots);
      setThumbnailFile({
        preview: existingTour.thumbnail.secure_url,
      });
      setImageFiles(
        existingTour.images.map((img) => ({ ...img, preview: img.url }))
      );

      setValue(
        "existingImages",
        existingTour.images?.map((img) => img.url) || []
      );
      setValue("existingThumbnail", existingTour.thumbnail?.secure_url || "");
    }
  }, [isEditTour, existingTour, setValue]);
  // Fetch guides when date/duration changes
  useEffect(() => {
    const startDate = getValues("startDate");
    const duration = getValues("duration");
    if (!startDate || !duration) return;

    (async () => {
      try {
        const res = await fetchGuides({ params: { startDate, duration } });
        setAllGuides((prev) => {
          const existingIds = new Set(prev.map((guide) => guide._id));
          const newGuides = (res?.data?.guides || []).filter(
            (guide) => !existingIds.has(guide._id)
          );
          return [...prev, ...newGuides];
        });
      } catch (error) {}
    })();
  }, [getValues("startDate"), getValues("duration")]);
  const onDrop = useCallback(
    (acceptedFiles) => {
      const previews = acceptedFiles.map((file) => {
        // make sure preview is added correctly
        file.preview = URL.createObjectURL(file);
        file.isNew = true;
        return file;
      });

      const updatedFiles = [...imageFiles, ...previews];

      setImageFiles(updatedFiles);

      setValue(
        "images",
        updatedFiles.filter(
          (file) =>
            file instanceof File ||
            (file && file.name && file.lastModified && file.type)
        )
      );
    },
    [imageFiles, setValue]
  );

  const onThumbnailDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const preview = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
        setThumbnailFile(preview);
        setValue("thumbnail", preview);
        setValue("existingThumbnail", "");
      }
    },
    [setValue]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const {
    getRootProps: getThumbnailRootProps,
    getInputProps: getThumbnailInputProps,
  } = useDropzone({
    onDrop: onThumbnailDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const removeImage = (index) => {
    const removed = imageFiles[index];

    // Remove from imageFiles
    const updated = imageFiles.filter((_, i) => i !== index);
    setImageFiles(updated);

    // Cleanup preview if it's a blob
    if (removed.preview?.startsWith("blob:")) {
      URL.revokeObjectURL(removed.preview);
    }

    if (removed.isNew) {
      // New image, nothing else to update in form
      return;
    }

    // Old image: remove its URL from existingImages in form
    const currentExisting = getValues("existingImages") || [];
    const updatedExisting = currentExisting.filter(
      (url) => url !== removed.url
    );
    setValue("existingImages", updatedExisting);
  };

  const isFormUpdated = () => {
    if (!existingTour) return true;

    const current = getValues();

    // Validate basic fields
    const basicFieldsChanged =
      current.title !== existingTour.title ||
      current.location !== existingTour.location ||
      Number(current.duration) !== Number(existingTour.duration) ||
      Number(current.participants) !== Number(existingTour.participants) ||
      current.difficulty !== existingTour.difficulty ||
      current.languages
        .split(",")
        .map((l) => l.trim())
        .join(",") !== existingTour.languages.join(",") ||
      current.startDate !== existingTour.startDate.split("T")[0] ||
      current.overview !== existingTour.overview ||
      current.description !== existingTour.description ||
      Number(current.pricePerPerson) !== Number(existingTour.pricePerPerson) ||
      JSON.stringify(current.highlights) !==
        JSON.stringify(existingTour.highlights) ||
      JSON.stringify(current.included) !==
        JSON.stringify(existingTour.included) ||
      JSON.stringify(current.guides.map((g) => g._id)) !==
        JSON.stringify(existingTour.guides.map((g) => g._id)) ||
      JSON.stringify(current.stops) !== JSON.stringify(existingTour.tourSpots);

    const thumbnailChanged = !!current.thumbnail; // means new one selected

    // ✅ Check if images changed
    const currentExistingImages = current.existingImages || [];

    const originalImageURLs = existingTour.images.map((img) => img.url);
    const existingImagesChanged =
      JSON.stringify(currentExistingImages.sort()) !==
      JSON.stringify(originalImageURLs.sort());

    const imagesAdded = (current.images || []).length > 0;

    const imagesChanged = existingImagesChanged || imagesAdded;

    return basicFieldsChanged || thumbnailChanged || imagesChanged;
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // For edit mode
      if (isEditTour && existingTour) {
        if (!isFormUpdated()) {
          toast.error("No changes made");
          return;
        }

        formData.append("tourId", existingTour._id);

        const { existingThumbnail, existingImages } = getValues();

        // Append existing thumbnail if no new one selected
        if (existingThumbnail) {
          formData.append("existingThumbnail", existingThumbnail);
        }
        // Append existing images (just URLs)
        if (Array.isArray(existingImages)) {
          existingImages.forEach((url) => {
            formData.append("existingImages", url);
          });
        }
      }

      // ✅ Common fields
      formData.append("title", data.title);
      formData.append("location", data.location);
      formData.append("duration", data.duration);
      formData.append("participants", data.participants);
      formData.append("difficulty", data.difficulty);
      formData.append("startDate", data.startDate);
      formData.append("overview", data.overview);
      formData.append("description", data.description);
      formData.append("pricePerPerson", data.pricePerPerson);

      data.languages.split(",").forEach((lang) => {
        formData.append("languages", lang.trim());
      });

      // ✅ Only if user selected a new thumbnail
      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      // ✅ Append only new image files (skip url objects)
      if (data.images && data.images.length) {
        data.images
          .filter((file) => file instanceof File)
          .forEach((file) => {
            formData.append("images", file);
          });
      }

      // ✅ Highlights
      data.highlights.forEach((h, i) => {
        formData.append(`highlights[${i}]`, h);
      });

      // ✅ Included
      data.included.forEach((i, idx) => {
        formData.append(`included[${idx}]`, i);
      });

      data.guides.forEach((g, i) => {
        formData.append(`guides[${i}]`, g._id);
      });

      // ✅ Stops
      data.stops.forEach((stop, i) => {
        const name = stop.place || stop.name;
        const description = stop.task || stop.description;
        const lat = stop.position?.lat || stop.lat;
        const lng = stop.position?.lng || stop.lng;

        formData.append(`stops[${i}][name]`, name || "");
        formData.append(`stops[${i}][description]`, description || "");
        formData.append(`stops[${i}][lng]`, lng || "");
        formData.append(`stops[${i}][lat]`, lat || "");
      });

      // 🔥 Submit request
      const res = isEditTour
        ? await updateTourRequest({ identifier: slug, data: formData })
        : await createTourRequest({ data: formData });

      toast.success(
        res.message || (isEditTour ? "Tour updated" : "Tour created")
      );
      navigate(-1);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const inputClass =
    "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500";

  return (
    <div className="p-6 bg-green-50 h-full overflow-y-auto scrollbar-hide">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-full mx-auto sm:max-w-xl md:max-w-4xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold text-green-700">Add New Tour</h1>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer whitespace-nowrap"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* title, location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-green-700 mb-1">Title</label>
              <input
                {...register("title", { required: true })}
                className={inputClass}
              />
              {errors.title && (
                <p className="text-red-600 text-sm">Title is required.</p>
              )}
            </div>

            <div>
              <label className="block text-green-700 mb-1">Location</label>
              <input
                {...register("location", { required: true })}
                className={inputClass}
              />
              {errors.location && (
                <p className="text-red-600 text-sm">Location is required.</p>
              )}
            </div>
          </div>

          {/* duration and participants*/}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* duration  */}
            <div>
              <label className="block text-green-700 mb-1">
                Duration (in days)
              </label>
              <input
                type="number"
                step="any"
                {...register("duration", {
                  required: "Duration is required",
                })}
                className={inputClass}
              />
              {errors.duration && (
                <p className="text-red-600 text-sm">Duration is required</p>
              )}
            </div>

            {/* participants */}
            <div>
              <label className="block text-green-700 mb-1">
                Number of Participants
              </label>
              <input
                type="number"
                step="1"
                min="1"
                {...register("participants", {
                  required: "Number of participants is required",
                  valueAsNumber: true,
                })}
                className={inputClass}
              />
              {errors.participants && (
                <p className="text-red-600 text-sm">
                  {errors.participants.message}
                </p>
              )}
            </div>

            {/* start date  */}
            <div>
              <label className="block text-green-700 mb-1">Start Date</label>
              <input
                type="date"
                {...register("startDate", {
                  required: "Start Date is required",
                })}
                className={inputClass}
              />
              {errors.startDate && (
                <p className="text-red-600 text-sm">Start Date is required</p>
              )}
            </div>

            {/* difficulty  */}
            <div>
              <label className="block text-green-700 mb-1">Difficulty</label>
              <select
                {...register("difficulty", {
                  required: "Difficulty is required",
                })}
                className={inputClass}
              >
                <option value="">Select difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              {errors.difficulty && (
                <p className="text-red-600 text-sm">
                  {errors.difficulty.message}
                </p>
              )}
            </div>

            {/* languages  */}
            <div>
              <label className="block text-green-700 mb-1">
                Languages (comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. English, Spanish, Hindi"
                {...register("languages", {
                  required: "Languages are required",
                })}
                className={inputClass}
              />
              {errors.languages && (
                <p className="text-red-600 text-sm">
                  {errors.languages.message}
                </p>
              )}
            </div>

            {/* price  */}
            <div>
              <label className="block text-green-700 mb-1">
                Price per person (INR)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register("pricePerPerson", {
                  required: "Price is required",
                  valueAsNumber: true,
                })}
                className={inputClass}
              />
              {errors.pricePerPerson && (
                <p className="text-red-600 text-sm">
                  Price per person is required
                </p>
              )}
            </div>
          </div>

          {/* description */}
          <div>
            <label className="block text-green-700 mb-1">Description</label>
            <textarea
              {...register("description", {
                required: "Description is required",
                validate: (value) =>
                  value.trim().split(/\s+/).length <= 30 ||
                  "Maximum 30 words allowed",
              })}
              rows={2}
              className={`${inputClass}`}
              placeholder="Enter a small description upto 10 words"
            />
            {errors.description && (
              <p className="text-red-600 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Overview textarea */}
          <div>
            <label className="block text-green-700 mb-1">Overview</label>
            <textarea
              {...register("overview")}
              className={inputClass}
              rows={4}
            />
          </div>

          {/* Highlights and Included fields */}
          {[
            {
              title: "Highlights",
              name: "highlights",
              fields: highlightFields,
              append: appendHighlight,
              remove: removeHighlight,
            },
            {
              title: "Included",
              name: "included",
              fields: includedFields,
              append: appendIncluded,
              remove: removeIncluded,
            },
          ].map(({ title, name, fields, append, remove }) => (
            <div key={name}>
              <label className="block text-green-700 mb-1">{title}</label>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col sm:flex-row gap-2 mb-2"
                >
                  <input
                    {...register(`${name}.${index}`)}
                    defaultValue={field || ""}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="bg-red-500 text-white px-2 py-1 rounded cursor-pointer w-full sm:w-auto"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => append("")}
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded cursor-pointer whitespace-nowrap"
              >
                Add {title.slice(0, -1)}
              </button>
            </div>
          ))}

          {/* Guides */}
          <div>
            <label className="block text-green-700 mb-2">Guides</label>
            {guideFields.map((field, index) => {
              const selectedIds = selectedGuideIds
                .map((g) => g?._id)
                .filter(Boolean);
              const currentId = selectedIds[index];

              const filteredGuides = allGuides.filter(
                (guide) =>
                  !selectedIds.includes(guide._id) || guide._id === currentId
              );
              return (
                <div
                  key={field._id}
                  className="flex flex-col sm:flex-row items-center gap-2 mb-2"
                >
                  <select
                    {...register(`guides.${index}._id`, { required: true })}
                    className={inputClass}
                    defaultValue={field._id || ""}
                  >
                    <option value="">-- Select Guide --</option>
                    {filteredGuides.map((guide) => (
                      <option key={guide._id} value={guide._id}>
                        {guide.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => removeGuide(index)}
                    className="text-red-600 hover:text-red-700 cursor-pointer whitespace-nowrap"
                  >
                    <FaTimes />
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => appendGuide({ _id: "" })}
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded cursor-pointer whitespace-nowrap"
            >
              Add Guide
            </button>
          </div>

          {/* Stops */}
          <div>
            <label className="block text-green-700 mb-2">Stops (Per Day)</label>
            {stopFields.map((stop, index) => (
              <div key={stop.id} className="mb-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  {/* Day (Read-only Input) */}
                  <input
                    type="number"
                    value={index + 1}
                    readOnly
                    className="w-20 px-2 py-2 border border-gray-300 rounded bg-gray-100 text-center"
                  />

                  {/* Description Input */}
                  <input
                    type="text"
                    defaultValue={stop.task || stop.description || ""}
                    onBlur={(e) =>
                      updateStop(index, { description: e.target.value })
                    }
                    placeholder="What will the tour do at this location?"
                    className={`${inputClass} flex-1`}
                  />

                  {/* Location Name Input */}
                  <input
                    value={stop.place || stop.name}
                    readOnly
                    className={`${inputClass} bg-gray-50 flex-1`}
                    placeholder="Location"
                  />

                  {/* Choose Location Button */}
                  <button
                    type="button"
                    onClick={() => setMapPickerConfig({ type: "stop", index })}
                    className="w-full sm:w-40 px-2 py-2 bg-green-500 text-white rounded hover:bg-green-600 whitespace-nowrap"
                  >
                    Choose Location
                  </button>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeStop(index)}
                    className="text-red-600 hover:text-red-700 cursor-pointer whitespace-nowrap"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            ))}

            {/* Add Stop Button */}
            <button
              type="button"
              onClick={() =>
                appendStop({
                  name: "",
                  lat: "",
                  lng: "",
                  description: "",
                })
              }
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
            >
              Add Stop
            </button>
          </div>

          {/* Tour Images */}
          <div>
            <label className="block text-green-700 mb-1">Tour Images</label>
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-green-400 p-4 rounded text-center cursor-pointer bg-gray-50"
            >
              <input {...getInputProps()} />
              <p>Drag & drop some images here, or click to select files</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
              {imageFiles.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={file.preview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 cursor-pointer"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Thumbnail Image */}
          <div>
            <label className="block text-green-700 mb-1">Thumbnail Image</label>
            <div
              {...getThumbnailRootProps()}
              className="border-2 border-dashed border-green-400 p-4 rounded text-center cursor-pointer bg-gray-50"
            >
              <input {...getThumbnailInputProps()} />
              <p>Drag & drop a thumbnail image here, or click to select</p>
            </div>
            {thumbnailFile && (
              <div className="mt-4 w-32 h-32">
                <img
                  src={thumbnailFile.preview}
                  alt="Thumbnail Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={creatingTour || updatingTour}
            className={`px-6 py-3 rounded-lg flex items-center gap-2 whitespace-nowrap ${
              creatingTour || updatingTour
                ? "bg-green-400 text-white cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
            }`}
          >
            <FaSave />
            {isEditTour
              ? updatingTour
                ? "Updating..."
                : "Save Changes"
              : creatingTour
              ? "Creating..."
              : "Create Tour"}
          </button>
        </form>

        {mapPickerConfig &&
          (() => {
            const stop = getValues(`stops.${mapPickerConfig.index}`);

            const lat = parseFloat(stop?.lat);
            const lng = parseFloat(stop?.lng);
            const description = stop.description;
            const initialSpots =
              !isNaN(lat) && !isNaN(lng) ? [{ ...stop, lat, lng }] : [];

            return (
              <MapPicker
                initialSpots={initialSpots}
                onClose={() => setMapPickerConfig(null)}
                onConfirm={([picked]) => {
                  if (!picked) {
                    setMapPickerConfig(null);
                    return;
                  }
                  updateStop(mapPickerConfig.index, picked);
                  setMapPickerConfig(null);
                }}
                description={description}
              />
            );
          })()}
      </div>
    </div>
  );
}
