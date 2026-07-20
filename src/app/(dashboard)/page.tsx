import { prisma } from "@/lib/prisma";
import { HomeView } from "./HomeView";

export default async function DashboardHomePage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const threeDaysOut = new Date(startOfToday);
  threeDaysOut.setDate(threeDaysOut.getDate() + 3);

  const [dueSoonGoals, upcomingEvents] = await Promise.all([
    prisma.goal.count({
      where: { status: "active", targetDate: { gte: startOfToday, lte: threeDaysOut } },
    }),
    prisma.calendarEvent.count({
      where: { date: { gte: startOfToday, lte: threeDaysOut } },
    }),
  ]);

  return <HomeView notificationCount={dueSoonGoals + upcomingEvents} />;
}
