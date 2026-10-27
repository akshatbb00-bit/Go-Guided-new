const { body } = require("express-validator");
const validate = require("./validate");
const mongoose = require("mongoose");

exports.tourInputValidator = validate([
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Please enter a tour title")
    .isString()
    .withMessage("Tour title must be text"),

  body("location")
    .notEmpty()
    .withMessage("Please enter a location")
    .isString()
    .withMessage("Location must be text"),

  body("duration")
    .notEmpty()
    .withMessage("Please enter the tour duration")
    .isNumeric()
    .withMessage("Duration must be a number")
    .isFloat({ gt: 0 })
    .withMessage("Duration must be greater than zero"),

  body("participants")
    .notEmpty()
    .withMessage("Please specify how many participants are allowed")
    .isInt({ min: 1 })
    .withMessage("Participants must be a positive whole number"),

  body("difficulty")
    .customSanitizer((v) => v.toLowerCase())
    .isIn(["easy", "medium", "hard"])
    .withMessage("Difficulty must be one of: easy, medium, or hard"),

  body("languages")
    .customSanitizer((value) => {
      const capitalize = (str) =>
        str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

      if (Array.isArray(value)) {
        return value
          .map((v) => v.trim())
          .filter((v) => v !== "")
          .map(capitalize);
      }

      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed ? [capitalize(trimmed)] : [];
      }

      return [];
    })
    .isArray({ min: 1 })
    .withMessage("Please select at least one language")
    .custom((arr) => {
      const allValid = arr.every(
        (lang) => typeof lang === "string" && lang.trim() !== ""
      );
      if (!allValid) {
        throw new Error(
          "All selected languages must be valid, non-empty strings"
        );
      }
      return true;
    }),

  body("pricePerPerson")
    .notEmpty()
    .withMessage("Please enter a price per person")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a number greater than zero"),

  body("startDate")
    .notEmpty()
    .withMessage("Please provide a start date for the tour")
    .isISO8601()
    .withMessage("Start date must be a valid date (e.g., YYYY-MM-DD)"),

  body("overview")
    .notEmpty()
    .withMessage("Please enter a short overview")
    .isString()
    .withMessage("Overview must be text"),

  body("description")
    .notEmpty()
    .withMessage("Please provide a tour description")
    .isString()
    .withMessage("Description must be text"),

  body("highlights")
    .isArray({ min: 1 })
    .withMessage("Please list at least one tour highlight")
    .custom((arr) => {
      if (
        !arr.every((item) => typeof item === "string" && item.trim() !== "")
      ) {
        throw new Error("Each item must be a non-empty string");
      }
      return true;
    }),

  body("included")
    .isArray({ min: 1 })
    .withMessage("Please list what's included in the tour")
    .custom((arr) => {
      if (
        !arr.every((item) => typeof item === "string" && item.trim() !== "")
      ) {
        throw new Error("Each item must be a non-empty string");
      }
      return true;
    }),

  body("guides")
    .isArray({ min: 1 })
    .withMessage("Please select at least one guide")
    .custom((arr) => {
      const isValid = arr.every((_id) => mongoose.Types.ObjectId.isValid(_id));

      if (!isValid) throw new Error("One or more selected guides are invalid");
      return true;
    }),

  body("stops")
    .isArray({ min: 1 })
    .withMessage("Please list at least one stop")
    .custom((stops, { req }) => {
      if (!Array.isArray(stops)) return false;

      for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];

        const lat = parseFloat(stop.lat);
        const lng = parseFloat(stop.lng);

        if (isNaN(lat) || lat < -90 || lat > 90) {
          throw new Error(
            `Stop #${i + 1}: Latitude must be a number between -90 and 90`
          );
        }

        if (isNaN(lng) || lng < -180 || lng > 180) {
          throw new Error(
            `Stop #${i + 1}: Longitude must be a number between -180 and 180`
          );
        }

        if (typeof stop.name !== "string" || stop.name.trim() === "") {
          throw new Error(
            `Stop #${i + 1}: Name is required and must be a non-empty string`
          );
        }

        if (
          typeof stop.description !== "string" ||
          stop.description.trim() === ""
        ) {
          throw new Error(
            `Stop #${
              i + 1
            }: Description is required and must be a non-empty string`
          );
        }
      }

      const names = stops.map((s) => s.name.toLowerCase().trim());
      const nameSet = new Set(names);
      if (names.length !== nameSet.size) {
        throw new Error("Stop names must be unique");
      }

      return true;
    }),
]);
