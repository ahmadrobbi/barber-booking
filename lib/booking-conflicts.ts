type DatabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string;
};

const BOOKING_SLOT_CONSTRAINTS = new Set([
  "bookings_user_active_slot_key",
  "bookings_channel_active_slot_key",
]);

function includesKnownConstraint(message: string | undefined) {
  if (!message) {
    return false;
  }

  return [...BOOKING_SLOT_CONSTRAINTS].some((constraint) => message.includes(constraint));
}

export function isBookingSlotConflict(error: DatabaseErrorLike | null | undefined) {
  if (!error) {
    return false;
  }

  return error.code === "23505" && (
    includesKnownConstraint(error.message) ||
    includesKnownConstraint(error.details)
  );
}
