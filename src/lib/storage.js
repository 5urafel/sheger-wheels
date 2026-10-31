/**
 * Sheggar Wheels Browser Storage Data Layer
 * Handles localStorage (durable demo state) and sessionStorage (temporary session state)
 * Safe JSON parsing, quota handling, and seed initialization
 */

export const STORAGE_KEYS = {
  USERS: "sw_users_v1",
  CARS: "sw_cars_v1",
  BOOKINGS: "sw_bookings_v1",
  REVIEWS: "sw_reviews_v1",
  DISPUTES: "sw_disputes_v1",

  SESSION: "sw_session_v1",
  CHECKOUT_DRAFT: "sw_checkout_draft_v1",
};

/* ============================================================================
   Low-level Storage Helpers
============================================================================ */

export function isBrowser() {
  return typeof window !== "undefined";
}

export function readStorage(key, fallback = null) {
  if (!isBrowser()) return fallback;
  try {
    const item = window.localStorage.getItem(key);
    if (item === null || item === undefined) return fallback;
    return JSON.parse(item);
  } catch (err) {
    console.error(`[Sheggar Wheels] Failed to parse localStorage key: ${key}`, err);
    return fallback;
  }
}

export function writeStorage(key, value) {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    // Trigger custom event for same-tab reactivity
    window.dispatchEvent(new CustomEvent("sw_storage_update", { detail: { key } }));
    return true;
  } catch (err) {
    console.error(`[Sheggar Wheels] Failed to write localStorage key: ${key}`, err);
    return false;
  }
}

export function readSession(key, fallback = null) {
  if (!isBrowser()) return fallback;
  try {
    const item = window.sessionStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (err) {
    console.error(`[Sheggar Wheels] Failed to parse sessionStorage key: ${key}`, err);
    return fallback;
  }
}

export function writeSession(key, value) {
  if (!isBrowser()) return false;
  try {
    if (value === null || value === undefined) {
      window.sessionStorage.removeItem(key);
    } else {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    }
    window.dispatchEvent(new CustomEvent("sw_session_update", { detail: { key } }));
    return true;
  } catch (err) {
    console.error(`[Sheggar Wheels] Failed to write sessionStorage key: ${key}`, err);
    return false;
  }
}

/* ============================================================================
   Seed Data Definitions
============================================================================ */

export const INITIAL_USERS = [
  {
    id: "user-renter-1",
    name: "Alemayehu Tadesse",
    email: "alemayehu@example.com",
    phone: "+251 911 234 567",
    roles: ["renter"],
    status: "active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    createdAt: "2026-01-15T08:00:00Z",
  },
  {
    id: "user-owner-1",
    name: "Dr. Henok Kebede",
    email: "henok@example.com",
    phone: "+251 912 345 678",
    roles: ["renter", "owner"], // Both capabilities coexist per spec 4.1
    status: "active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    createdAt: "2026-01-10T10:30:00Z",
  },
  {
    id: "user-admin-1",
    name: "Selamawit Bekele (Admin)",
    email: "admin@sheggarwheels.et",
    phone: "+251 911 000 000",
    roles: ["admin"],
    status: "active",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    createdAt: "2025-12-01T00:00:00Z",
  },
];

export const INITIAL_CARS = [
  {
    id: "car-prado-2024",
    ownerId: "user-owner-1",
    make: "Toyota",
    model: "Land Cruiser Prado TXL",
    year: 2024,
    category: "4x4 Off-Road",
    transmission: "Automatic",
    seats: 7,
    city: "Addis Ababa",
    neighbourhood: "Bole",
    latitude: 8.995,
    longitude: 38.789,
    pricePerDay: 8500,
    photos: [
      "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80",
    ],
    description: "Mint-condition Prado TXL perfect for city VIP transport or expedition trips across Awash and Hawassa. Includes roof rack and all-terrain 4WD.",
    status: "approved", // approved, pending, rejected, inactive
    unavailableDates: ["2026-10-25", "2026-10-26"],
    rating: 4.9,
    reviewsCount: 18,
    createdAt: "2026-01-20T12:00:00Z",
  },
  {
    id: "car-tucson-2023",
    ownerId: "user-owner-1",
    make: "Hyundai",
    model: "Tucson Limited",
    year: 2023,
    category: "Luxury SUV",
    transmission: "Automatic",
    seats: 5,
    city: "Addis Ababa",
    neighbourhood: "Kazanchis",
    latitude: 9.019,
    longitude: 38.766,
    pricePerDay: 5500,
    photos: [
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80",
    ],
    description: "Sleek and quiet modern crossover with Apple CarPlay, panoramic sunroof, and lane-keep assist. Ideal for executives in Addis business districts.",
    status: "approved",
    unavailableDates: [],
    rating: 4.8,
    reviewsCount: 14,
    createdAt: "2026-02-01T09:00:00Z",
  },
  {
    id: "car-dzire-2024",
    ownerId: "user-owner-1",
    make: "Suzuki",
    model: "Dzire Sedan",
    year: 2024,
    category: "Economy Sedan",
    transmission: "Automatic",
    seats: 5,
    city: "Addis Ababa",
    neighbourhood: "Piassa",
    latitude: 9.034,
    longitude: 38.752,
    pricePerDay: 3200,
    photos: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80",
    ],
    description: "Outstanding fuel efficiency and compact maneuverability for historic Piassa and central Addis commuting. Air-conditioned and spotless.",
    status: "approved",
    unavailableDates: [],
    rating: 4.7,
    reviewsCount: 22,
    createdAt: "2026-02-10T14:30:00Z",
  },
  {
    id: "car-lc300-2024",
    ownerId: "user-owner-1",
    make: "Toyota",
    model: "Land Cruiser 300 V8",
    year: 2024,
    category: "Luxury SUV",
    transmission: "Automatic",
    seats: 7,
    city: "Addis Ababa",
    neighbourhood: "Bole",
    latitude: 9.001,
    longitude: 38.784,
    pricePerDay: 18000,
    photos: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80",
    ],
    description: "Flagship luxury 4x4. Armored glass option, executive leather recliners, and chauffeur support available for diplomatic convoys.",
    status: "approved",
    unavailableDates: [],
    rating: 5.0,
    reviewsCount: 9,
    createdAt: "2026-02-15T11:00:00Z",
  },
  {
    id: "car-hiace-2023",
    ownerId: "user-owner-1",
    make: "Toyota",
    model: "HiAce Super Custom VIP",
    year: 2023,
    category: "VIP Van",
    transmission: "Manual",
    seats: 12,
    city: "Addis Ababa",
    neighbourhood: "Sarbet",
    latitude: 8.991,
    longitude: 38.736,
    pricePerDay: 9500,
    photos: [
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1000&q=80",
    ],
    description: "High-roof 12-passenger transporter for safari tours, family retreats, and group delegacy trips across Ethiopian scenic corridors.",
    status: "approved",
    unavailableDates: [],
    rating: 4.8,
    reviewsCount: 11,
    createdAt: "2026-02-20T08:00:00Z",
  },
  {
    id: "car-eclass-2023",
    ownerId: "user-owner-1",
    make: "Mercedes-Benz",
    model: "E-Class Avantgarde",
    year: 2023,
    category: "Luxury Sedan",
    transmission: "Automatic",
    seats: 5,
    city: "Addis Ababa",
    neighbourhood: "Sarbet",
    latitude: 8.989,
    longitude: 38.739,
    pricePerDay: 14000,
    photos: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80",
    ],
    description: "Pristine German engineering with ambient mood lighting, executive seating, and unmatched comfort for formal events in Addis.",
    status: "approved",
    unavailableDates: [],
    rating: 4.9,
    reviewsCount: 7,
    createdAt: "2026-03-01T15:00:00Z",
  },
  {
    id: "car-pajero-2022",
    ownerId: "user-owner-1",
    make: "Mitsubishi",
    model: "Pajero Sport",
    year: 2022,
    category: "4x4 Off-Road",
    transmission: "Automatic",
    seats: 7,
    city: "Addis Ababa",
    neighbourhood: "Ayat",
    latitude: 9.022,
    longitude: 38.835,
    pricePerDay: 7200,
    photos: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80",
    ],
    description: "Dependable 7-seater SUV equipped with Super Select 4WD-II. Ample boot capacity for luggage and road trips to Lake Langano.",
    status: "approved",
    unavailableDates: [],
    rating: 4.7,
    reviewsCount: 16,
    createdAt: "2026-03-05T10:00:00Z",
  },
  {
    id: "car-ranger-2023",
    ownerId: "user-owner-1",
    make: "Ford",
    model: "Ranger Wildtrak",
    year: 2023,
    category: "4x4 Off-Road",
    transmission: "Automatic",
    seats: 5,
    city: "Addis Ababa",
    neighbourhood: "Meskel Square",
    latitude: 9.011,
    longitude: 38.761,
    pricePerDay: 8000,
    photos: [
      "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1000&q=80",
    ],
    description: "Double cab pickup with high ground clearance and rear cargo bed. Perfect for project equipment transport and highway utility.",
    status: "approved",
    unavailableDates: [],
    rating: 4.8,
    reviewsCount: 13,
    createdAt: "2026-03-10T09:20:00Z",
  },
  {
    id: "car-id4-2023",
    ownerId: "user-owner-1",
    make: "Volkswagen",
    model: "ID.4 Pure Electric",
    year: 2023,
    category: "Luxury SUV",
    transmission: "Automatic",
    seats: 5,
    city: "Addis Ababa",
    neighbourhood: "Bole",
    latitude: 8.998,
    longitude: 38.788,
    pricePerDay: 6800,
    photos: [
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80",
    ],
    description: "Zero emissions EV with 400km range. Modern minimalist cockpit, rapid charging cable included.",
    status: "pending", // For Admin approval demo workflow!
    unavailableDates: [],
    rating: 0,
    reviewsCount: 0,
    createdAt: "2026-04-01T12:00:00Z",
  },
  {
    id: "car-dmax-2021",
    ownerId: "user-owner-1",
    make: "Isuzu",
    model: "D-Max Double Cab",
    year: 2021,
    category: "4x4 Off-Road",
    transmission: "Manual",
    seats: 5,
    city: "Addis Ababa",
    neighbourhood: "CMC",
    latitude: 9.028,
    longitude: 38.825,
    pricePerDay: 6000,
    photos: [
      "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1000&q=80",
    ],
    description: "Rugged workhorse diesel engine for heavy-duty trips. Temporarily deactivated by owner.",
    status: "inactive", // For Owner deactivation toggle demo!
    unavailableDates: [],
    rating: 4.5,
    reviewsCount: 8,
    createdAt: "2026-01-05T14:00:00Z",
  },
];

export const INITIAL_BOOKINGS = [
  {
    id: "bk-101",
    carId: "car-prado-2024",
    renterId: "user-renter-1",
    ownerId: "user-owner-1",
    startDate: "2026-11-01",
    endDate: "2026-11-04",
    days: 3,
    pricePerDay: 8500,
    subtotal: 25500,
    fee: 1275, // 5% mock platform fee
    total: 26775,
    pickupLocation: "Bole International Airport (Terminal 1 & 2)",
    chauffeurIncluded: true,
    paymentStatus: "paid",
    status: "confirmed", // requested, confirmed, in_progress, completed, reviewed, declined, cancelled, disputed, resolved
    createdAt: "2026-10-18T10:00:00Z",
    updatedAt: "2026-10-18T11:30:00Z",
  },
  {
    id: "bk-102",
    carId: "car-tucson-2023",
    renterId: "user-renter-1",
    ownerId: "user-owner-1",
    startDate: "2026-10-22",
    endDate: "2026-10-24",
    days: 2,
    pricePerDay: 5500,
    subtotal: 11000,
    fee: 550,
    total: 11550,
    pickupLocation: "Kazanchis Business District",
    chauffeurIncluded: false,
    paymentStatus: "paid",
    status: "in_progress", // Simulated active trip!
    createdAt: "2026-10-15T09:00:00Z",
    updatedAt: "2026-10-20T08:00:00Z",
  },
  {
    id: "bk-103",
    carId: "car-dzire-2024",
    renterId: "user-renter-1",
    ownerId: "user-owner-1",
    startDate: "2026-09-10",
    endDate: "2026-09-13",
    days: 3,
    pricePerDay: 3200,
    subtotal: 9600,
    fee: 480,
    total: 10080,
    pickupLocation: "Piassa / Churchill Road",
    chauffeurIncluded: false,
    paymentStatus: "paid",
    status: "completed", // Eligible for review!
    createdAt: "2026-09-05T12:00:00Z",
    updatedAt: "2026-09-13T18:00:00Z",
  },
  {
    id: "bk-104",
    carId: "car-lc300-2024",
    renterId: "user-renter-1",
    ownerId: "user-owner-1",
    startDate: "2026-11-15",
    endDate: "2026-11-18",
    days: 3,
    pricePerDay: 18000,
    subtotal: 54000,
    fee: 2700,
    total: 56700,
    pickupLocation: "Bole Medhanialem (Main Hub)",
    chauffeurIncluded: true,
    paymentStatus: "held",
    status: "requested", // Demonstrates Owner request approval queue!
    createdAt: "2026-10-21T06:30:00Z",
    updatedAt: "2026-10-21T06:30:00Z",
  },
  {
    id: "bk-105",
    carId: "car-hiace-2023",
    renterId: "user-renter-1",
    ownerId: "user-owner-1",
    startDate: "2026-08-01",
    endDate: "2026-08-04",
    days: 3,
    pricePerDay: 9500,
    subtotal: 28500,
    fee: 1425,
    total: 29925,
    pickupLocation: "Sarbet / Old Airport",
    chauffeurIncluded: false,
    paymentStatus: "paid",
    status: "disputed", // Demonstrates Admin dispute resolution!
    createdAt: "2026-07-28T14:00:00Z",
    updatedAt: "2026-08-05T10:00:00Z",
  },
];

export const INITIAL_REVIEWS = [
  {
    id: "rev-201",
    bookingId: "bk-103",
    carId: "car-dzire-2024",
    renterId: "user-renter-1",
    ownerId: "user-owner-1",
    rating: 5,
    comment: "The Dzire was super fuel efficient and clean. Dr. Henok made pickup at Piassa straightforward. Highly recommended!",
    ownerReply: "Thank you Alemayehu! Glad you enjoyed your drive across Addis.",
    createdAt: "2026-09-14T09:30:00Z",
  },
];

export const INITIAL_DISPUTES = [
  {
    id: "disp-301",
    bookingId: "bk-105",
    carId: "car-hiace-2023",
    openedBy: "user-renter-1",
    reason: "Air conditioning malfunctioned on day 2",
    description: "The rear passenger AC unit stopped blowing cold air during our trip to Bishoftu. Requesting partial refund for day 2 and 3.",
    status: "opened", // opened, resolved
    resolutionNotes: "",
    resolvedBy: null,
    createdAt: "2026-08-05T10:00:00Z",
    resolvedAt: null,
  },
];



/* ============================================================================
   Initialization & Data Layer Methods
============================================================================ */

/**
 * Initializes default demo records once if storage keys are absent.
 * NEVER overwrites user-edited mutations on subsequent page refreshes.
 */
export function initializeDemoData() {
  if (!isBrowser()) return;

  if (!window.localStorage.getItem(STORAGE_KEYS.USERS)) {
    writeStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.CARS)) {
    writeStorage(STORAGE_KEYS.CARS, INITIAL_CARS);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    writeStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    writeStorage(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.DISPUTES)) {
    writeStorage(STORAGE_KEYS.DISPUTES, INITIAL_DISPUTES);
  }

}

/**
 * Restores initial demo seed data (development-only control).
 */
export function resetDemoData() {
  if (!isBrowser()) return;
  writeStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
  writeStorage(STORAGE_KEYS.CARS, INITIAL_CARS);
  writeStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  writeStorage(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  writeStorage(STORAGE_KEYS.DISPUTES, INITIAL_DISPUTES);

  // Clear active session
  writeSession(STORAGE_KEYS.SESSION, null);
  writeSession(STORAGE_KEYS.CHECKOUT_DRAFT, null);
}

/* ============================================================================
   Entity CRUD Operations
============================================================================ */

// Cars
export function getCars() {
  initializeDemoData();
  return readStorage(STORAGE_KEYS.CARS, INITIAL_CARS);
}

export function getPublicCars() {
  const cars = getCars();
  // Only approved and non-inactive cars appear publicly per specification!
  return cars.filter((c) => c.status === "approved");
}

export function getCarById(id) {
  const cars = getCars();
  return cars.find((c) => c.id === id) || null;
}

export function saveCar(car) {
  const cars = getCars();
  const existingIdx = cars.findIndex((c) => c.id === car.id);
  let updated;
  if (existingIdx >= 0) {
    updated = [...cars];
    updated[existingIdx] = { ...updated[existingIdx], ...car, updatedAt: new Date().toISOString() };
  } else {
    const newCar = {
      ...car,
      id: car.id || `car-${Date.now()}`,
      status: car.status || "pending", // default to pending for admin approval
      createdAt: new Date().toISOString(),
      rating: car.rating || 0,
      reviewsCount: car.reviewsCount || 0,
    };
    updated = [newCar, ...cars];
  }
  writeStorage(STORAGE_KEYS.CARS, updated);
  return updated;
}

export function deleteCar(id) {
  const cars = getCars();
  const updated = cars.filter((c) => c.id !== id);
  writeStorage(STORAGE_KEYS.CARS, updated);
  return updated;
}

// Bookings
export function getBookings() {
  initializeDemoData();
  return readStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
}

export function getBookingById(id) {
  const bookings = getBookings();
  return bookings.find((b) => b.id === id) || null;
}

export function saveBooking(booking) {
  const bookings = getBookings();
  const existingIdx = bookings.findIndex((b) => b.id === booking.id);
  let updated;
  if (existingIdx >= 0) {
    updated = [...bookings];
    updated[existingIdx] = { ...updated[existingIdx], ...booking, updatedAt: new Date().toISOString() };
  } else {
    const newBooking = {
      ...booking,
      id: booking.id || `bk-${Date.now()}`,
      status: booking.status || "requested",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updated = [newBooking, ...bookings];
  }
  writeStorage(STORAGE_KEYS.BOOKINGS, updated);
  return updated;
}

export function updateBookingStatus(id, newStatus, extraData = {}) {
  const booking = getBookingById(id);
  if (!booking) return null;

  // Validate state transitions according to Section 7 of the brief
  const validTransitions = {
    requested: ["confirmed", "declined", "cancelled"],
    confirmed: ["in_progress", "cancelled"],
    in_progress: ["completed", "disputed"],
    completed: ["reviewed", "disputed"],
    declined: [],
    cancelled: [],
    disputed: ["resolved"],
    resolved: [],
    reviewed: [],
  };

  const allowed = validTransitions[booking.status] || [];
  if (!allowed.includes(newStatus)) {
    console.warn(`[Sheggar Wheels] Invalid state transition: ${booking.status} -> ${newStatus}`);
    return false;
  }

  saveBooking({ ...booking, ...extraData, status: newStatus });
  return true;
}

/**
 * Checks if a car has overlapping active bookings for the specified date range.
 * Satisfies Section 6 & 16: Two overlapping active bookings for one car cannot both be confirmed.
 */
export function hasBookingConflict(carId, startDate, endDate, excludeBookingId = null) {
  const bookings = getBookings();
  const car = getCarById(carId);

  // Check against car's blocked dates
  if (car && car.unavailableDates && Array.isArray(car.unavailableDates)) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (const d of car.unavailableDates) {
      const blockDate = new Date(d);
      if (blockDate >= start && blockDate <= end) {
        return { conflict: true, reason: `Car is blocked by owner on ${d}` };
      }
    }
  }

  // Check against other active bookings
  const activeStatuses = ["requested", "confirmed", "in_progress"];
  const overlapping = bookings.find((b) => {
    if (b.carId !== carId) return false;
    if (excludeBookingId && b.id === excludeBookingId) return false;
    if (!activeStatuses.includes(b.status)) return false;

    // Overlap condition: start <= otherEnd && end >= otherStart
    return startDate <= b.endDate && endDate >= b.startDate;
  });

  if (overlapping) {
    return {
      conflict: true,
      reason: `Overlaps with existing booking (${overlapping.startDate} to ${overlapping.endDate})`,
      booking: overlapping,
    };
  }

  return { conflict: false };
}

// Users
export function getUsers() {
  initializeDemoData();
  return readStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export function getUserById(id) {
  const users = getUsers();
  return users.find((u) => u.id === id) || null;
}

export function saveUser(user) {
  const users = getUsers();
  const existingIdx = users.findIndex((u) => u.id === user.id);
  let updated;
  if (existingIdx >= 0) {
    updated = [...users];
    updated[existingIdx] = { ...updated[existingIdx], ...user };
  } else {
    updated = [...users, { ...user, id: user.id || `user-${Date.now()}`, createdAt: new Date().toISOString() }];
  }
  writeStorage(STORAGE_KEYS.USERS, updated);
  return updated;
}

// Reviews
export function getReviews() {
  initializeDemoData();
  return readStorage(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
}

export function addReview(review) {
  const reviews = getReviews();
  const newReview = {
    ...review,
    id: review.id || `rev-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newReview, ...reviews];
  writeStorage(STORAGE_KEYS.REVIEWS, updated);

  // Mark booking as reviewed
  if (review.bookingId) {
    updateBookingStatus(review.bookingId, "reviewed");
  }
  return newReview;
}

export function replyToReview(reviewId, replyText) {
  const reviews = getReviews();
  const updated = reviews.map((r) => (r.id === reviewId ? { ...r, ownerReply: replyText } : r));
  writeStorage(STORAGE_KEYS.REVIEWS, updated);
  return updated;
}

// Disputes
export function getDisputes() {
  initializeDemoData();
  return readStorage(STORAGE_KEYS.DISPUTES, INITIAL_DISPUTES);
}

export function openDispute(dispute) {
  const disputes = getDisputes();
  const newDispute = {
    ...dispute,
    id: dispute.id || `disp-${Date.now()}`,
    status: "opened",
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  };
  const updated = [newDispute, ...disputes];
  writeStorage(STORAGE_KEYS.DISPUTES, updated);

  if (dispute.bookingId) {
    updateBookingStatus(dispute.bookingId, "disputed");
  }
  return newDispute;
}

export function resolveDispute(disputeId, notes, resolvedByUserId) {
  const disputes = getDisputes();
  const dispute = disputes.find((d) => d.id === disputeId);
  if (!dispute) return false;

  const updated = disputes.map((d) =>
    d.id === disputeId
      ? {
          ...d,
          status: "resolved",
          resolutionNotes: notes,
          resolvedBy: resolvedByUserId,
          resolvedAt: new Date().toISOString(),
        }
      : d
  );
  writeStorage(STORAGE_KEYS.DISPUTES, updated);

  if (dispute.bookingId) {
    updateBookingStatus(dispute.bookingId, "resolved", { resolutionNotes: notes });
  }
  return true;
}



export function setUserStatus(userId, newStatus) {
  const users = getUsers();
  const updated = users.map((u) =>
    u.id === userId ? { ...u, status: newStatus } : u
  );
  writeStorage(STORAGE_KEYS.USERS, updated);
  return updated;
}

