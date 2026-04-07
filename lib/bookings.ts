export const BOOKING_SERVICES = [
  {
    code: "dewasa-premium",
    name: "Dewasa Premium",
    price: 25000,
    description: "Potong rambut, styling, dan finishing premium.",
  },
  {
    code: "anak-anak",
    name: "Anak-anak",
    price: 20000,
    description: "Potong rambut nyaman untuk pelanggan anak.",
  },
  {
    code: "hair-color",
    name: "Hair Color For Men",
    price: 100000,
    description: "Coloring rambut lengkap dengan finishing rapi.",
  },
] as const;

export const ALL_BOOKING_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
] as const;

export function getBookingService(code: string) {
  return BOOKING_SERVICES.find((service) => service.code === code) ?? null;
}
