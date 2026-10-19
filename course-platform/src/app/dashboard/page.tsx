import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  const progress = await db.videoProgress.findMany({
    where: { userId },
    include: { lesson: { include: { course: true } } },
  });

  const byCourse = new Map<string, { course: typeof progress[0]["lesson"]["course"]; done: Set<string> }>();
  for (const p of progress) {
    if (!byCourse.has(p.lesson.courseId)) {
      byCourse.set(p.lesson.courseId, { course: p.lesson.course, done: new Set() });
    }
    if (p.completed) byCourse.get(p.lesson.courseId)!.done.add(p.lessonId);
  }

  const rows = await Promise.all(
    Array.from(byCourse.values()).map(async ({ course, done }) => {
      const total = await db.lesson.count({ where: { courseId: course.id } });
      return { course, doneCount: done.size, total };
    })
  );

  const totalCompleted = progress.filter((p) => p.completed).length;

  return (
    <div>
      <h1 className="text-2xl font-bold">My Learning 📚</h1>
      <p className="mt-1 text-sm text-slate-500">
        Welcome back, {session.user.name || session.user.email} — {totalCompleted} lesson
        {totalCompleted === 1 ? "" : "s"} completed so far.
      </p>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-white p-8 text-center">
          <p className="text-slate-500">You haven&apos;t started any course yet.</p>
          <Link
            href="/"
            className="mt-3 inline-block rounded-xl bg-brand-600 px-5 py-2 font-semibold text-white hover:bg-brand-700"
          >
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {rows.map(({ course, doneCount, total }) => {
            const percent = total ? Math.round((doneCount / total) * 100) : 0;
            return (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="rounded-2xl border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h2 className="font-bold">{course.title}</h2>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${percent}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {doneCount}/{total} lessons · {percent}% complete
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
