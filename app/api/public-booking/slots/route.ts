import { getPublicTenantContextBySlug } from "@/lib/tenant-context";
import { getAvailableSlotsForDate } from "@/lib/scheduling";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const date = url.searchParams.get("date");
  const serviceCode = url.searchParams.get("service");

  if (!slug || !date || !serviceCode) {
    return Response.json({ error: "Missing slug, date, or service." }, { status: 400 });
  }

  const tenant = await getPublicTenantContextBySlug(slug);

  if (!tenant) {
    return Response.json({ error: "Tenant not found." }, { status: 404 });
  }

  const service = tenant.services.find((item) => item.code === serviceCode);

  if (!service) {
    return Response.json({ error: "Service not found." }, { status: 404 });
  }

  const slots = await getAvailableSlotsForDate({
    date,
    industry: tenant.industry,
    durationMinutes: service.duration_minutes,
    userId: tenant.userId,
    channelId: tenant.channelId,
  });

  return Response.json({
    slots,
    duration_minutes: service.duration_minutes,
  });
}
