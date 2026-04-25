import { getPublicTenantContextBySlug } from "@/lib/tenant-context";
import { getServicesByCodes, summarizeServices } from "@/lib/bookings";
import { getAvailableSlotsForDate } from "@/lib/scheduling";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const date = url.searchParams.get("date");
  const branchId = url.searchParams.get("branch");
  const serviceCodes = (url.searchParams.get("services") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!slug || !date || serviceCodes.length === 0) {
    return Response.json({ error: "Missing slug, date, or services." }, { status: 400 });
  }

  const tenant = await getPublicTenantContextBySlug(slug);

  if (!tenant) {
    return Response.json({ error: "Tenant not found." }, { status: 404 });
  }

  const selectedServices = getServicesByCodes(tenant.services, serviceCodes);

  if (selectedServices.length !== serviceCodes.length) {
    return Response.json({ error: "One or more services were not found." }, { status: 404 });
  }

  const summary = summarizeServices(selectedServices);

  const slots = await getAvailableSlotsForDate({
    date,
    industry: tenant.industry,
    durationMinutes: summary.totalDurationMinutes,
    userId: tenant.userId,
    channelId: tenant.channelId,
    branchId,
  });

  return Response.json({
    slots,
    duration_minutes: summary.totalDurationMinutes,
  });
}
