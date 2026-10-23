// lib/carCatalog.js
// Pure catalogue rules shared by the homepage and /cars page.

export const CATALOG_CATEGORIES = [
  { value: "all", label: "All Vehicles" },
  { value: "suv", label: "4x4 & SUVs" },
  { value: "executive", label: "Executive Sedans" },
  { value: "economical", label: "Economical" },
  { value: "hybrid", label: "Electric & Hybrids" },
  { value: "van", label: "Vans & Groups" },
  { value: "chauffeur", label: "Chauffeur Available" },
];

export const CATALOG_SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Highest Rated" },
  { value: "newest", label: "Newest Listings" },
];

const CATEGORY_VALUES = new Set(CATALOG_CATEGORIES.map((item) => item.value));
const SORT_VALUES = new Set(CATALOG_SORT_OPTIONS.map((item) => item.value));
const TRANSMISSION_VALUES = new Set(["automatic", "manual"]);

/**
 * Public listings are approved and not soft-deleted.
 */
export function isPublicCar(car) {
  return Boolean(
    car &&
      car.status === "approved" &&
      car.deleted !== true &&
      !car.deletedAt,
  );
}

function getSearchText(car) {
  return [
    car.make,
    car.model,
    car.edition,
    car.year,
    car.fuel,
    car.city,
    car.neighbourhood,
    car.hostName,
    car.hostLocation,
    car.description,
    ...(Array.isArray(car.tags) ? car.tags : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * The data model has no category field, so categories are derived from
 * existing vehicle details. Categories may overlap intentionally.
 */
export function matchesCategory(car, category) {
  if (!category || category === "all") return true;

  const text = getSearchText(car);
  const price = Number(car.pricePerDay) || 0;

  switch (category) {
    case "suv":
      return /suv|crossover|4x4|4wd|awd|prado|rav4|tucson/.test(text);
    case "executive":
      return (
        /executive|mercedes|amg|chauffeur/.test(text) ||
        (/sedan/.test(text) && price >= 8000)
      );
    case "economical":
      return (
        price <= 5000 ||
        /economical|fuel saver|compact|hatchback|picanto|dzire/.test(text)
      );
    case "hybrid":
      return /hybrid|electric|\bev\b/.test(text);
    case "van":
      return Number(car.seats) >= 8 || /van|commuter|hiace/.test(text);
    case "chauffeur":
      return /chauffeur/.test(text);
    default:
      return true;
  }
}

export function getCatalogLocations(cars) {
  return [...new Set(
    cars
      .filter(isPublicCar)
      .map((car) => car.neighbourhood)
      .filter(Boolean),
  )].sort((left, right) => left.localeCompare(right));
}

export function getCategoryCounts(cars) {
  const publicCars = cars.filter(isPublicCar);

  return CATALOG_CATEGORIES.reduce((counts, category) => {
    counts[category.value] = publicCars.filter((car) =>
      matchesCategory(car, category.value),
    ).length;
    return counts;
  }, {});
}

function toPositiveInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

/**
 * Reads and sanitizes catalogue filters from a URLSearchParams-like object.
 * Invalid values fall back to safe defaults instead of reaching the UI.
 */
export function parseCatalogFilters(searchParams) {
  const get = (key) =>
    searchParams && typeof searchParams.get === "function"
      ? searchParams.get(key)
      : null;

  const rawCategory = get("category");
  const rawTransmission = get("transmission");
  const rawSort = get("sort");

  return {
    q: (get("q") || "").trim().slice(0, 120),
    category: CATEGORY_VALUES.has(rawCategory) ? rawCategory : "all",
    location: (get("location") || "all").trim().slice(0, 120) || "all",
    transmission: TRANSMISSION_VALUES.has(rawTransmission)
      ? rawTransmission
      : "all",
    minSeats: Math.min(toPositiveInteger(get("seats")), 30),
    maxPrice: toPositiveInteger(get("maxPrice")),
    sort: SORT_VALUES.has(rawSort) ? rawSort : "recommended",
  };
}

function getCreatedTime(car) {
  const parsed = Date.parse(car.createdAt || "");
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Filters public cars and returns a new sorted array.
 */
export function filterAndSortCars(cars, filters) {
  const activeFilters = {
    q: "",
    category: "all",
    location: "all",
    transmission: "all",
    minSeats: 0,
    maxPrice: 0,
    sort: "recommended",
    ...filters,
  };

  const query = activeFilters.q.toLowerCase();
  const location = activeFilters.location.toLowerCase();

  const filtered = cars.filter((car) => {
    if (!isPublicCar(car)) return false;
    if (query && !getSearchText(car).includes(query)) return false;
    if (!matchesCategory(car, activeFilters.category)) return false;

    if (
      location !== "all" &&
      !String(car.neighbourhood || "")
        .toLowerCase()
        .includes(location)
    ) {
      return false;
    }

    if (
      activeFilters.transmission !== "all" &&
      car.transmission !== activeFilters.transmission
    ) {
      return false;
    }

    if (
      activeFilters.minSeats > 0 &&
      Number(car.seats) < activeFilters.minSeats
    ) {
      return false;
    }

    if (
      activeFilters.maxPrice > 0 &&
      Number(car.pricePerDay) > activeFilters.maxPrice
    ) {
      return false;
    }

    return true;
  });

  return [...filtered].sort((left, right) => {
    switch (activeFilters.sort) {
      case "price-asc":
        return left.pricePerDay - right.pricePerDay;
      case "price-desc":
        return right.pricePerDay - left.pricePerDay;
      case "rating-desc":
        return (right.rating || 0) - (left.rating || 0);
      case "newest":
        return getCreatedTime(right) - getCreatedTime(left);
      case "recommended":
      default:
        return (
          (right.rating || 0) - (left.rating || 0) ||
          (right.reviewsCount || 0) - (left.reviewsCount || 0) ||
          left.pricePerDay - right.pricePerDay
        );
    }
  });
}
