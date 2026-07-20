import { prisma } from "@/lib/prisma";
import { DEFAULT_TIME_ZONES } from "@/lib/geo";
import { HomeView } from "./HomeView";

export default async function DashboardHomePage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const threeDaysOut = new Date(startOfToday);
  threeDaysOut.setDate(threeDaysOut.getDate() + 3);

  const [dueSoonGoals, upcomingEvents, settings] = await Promise.all([
    prisma.goal.count({
      where: { status: "active", targetDate: { gte: startOfToday, lte: threeDaysOut } },
    }),
    prisma.calendarEvent.count({
      where: { date: { gte: startOfToday, lte: threeDaysOut } },
    }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
  ]);

  const timeZoneIds =
    Array.isArray(settings?.globeTimeZones) && (settings.globeTimeZones as unknown[]).length > 0
      ? (settings.globeTimeZones as string[])
      : DEFAULT_TIME_ZONES;

  return <HomeView notificationCount={dueSoonGoals + upcomingEvents} timeZoneIds={timeZoneIds} />;
}
