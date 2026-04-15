import { INDUSTRIES, type IndustryKey } from "./industries";

export type { IndustryKey } from "./industries";

// Legacy exports for backward compatibility (gunakan barbershop sebagai default)
export const BOOKING_SERVICES = INDUSTRIES.barbershop.services;
export const ALL_BOOKING_SLOTS = INDUSTRIES.barbershop.slots;

export function getServicesForIndustry(industry: IndustryKey) {
  return INDUSTRIES[industry].services;
}

export function getSlotsForIndustry(industry: IndustryKey) {
  return INDUSTRIES[industry].slots;
}

export function getBookingService(code: string, industry: IndustryKey = "barbershop") {
  const services = getServicesForIndustry(industry);
  return services.find((service) => service.code === code) ?? null;
}

export function getServiceBySelection(selection: string, industry: IndustryKey = "barbershop") {
  const services = getServicesForIndustry(industry);
  const index = parseInt(selection) - 1;
  return index >= 0 && index < services.length ? services[index] : null;
}

export function getSlotBySelection(selection: string, availableSlots: string[]) {
  const index = parseInt(selection) - 1;
  return index >= 0 && index < availableSlots.length ? availableSlots[index] : null;
}
