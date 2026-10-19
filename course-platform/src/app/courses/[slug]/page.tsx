import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import CoursePlayer from "@/components/course-player";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: { slug: string } }) {
  const course = await db.course.findUnique({
    where: { slug: params.slug },
    include: { lessons: { orderBy: { position: "asc" } } },
  });

  if (!course || !course.published) notFound();

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  const progress = userId
    ? await db.videoProgress.findMany({ where: { userId, lesson: { courseId: course.id } } })
    : [];

  const completedMap: Record<string, boolean> = {};
  progress.forEach((p) => (completedMap[p.lessonId] = p.completed));

  return (
    <CoursePlayer
      course={{
        id: course.id,
        title: course.title,
        description: course.description,
        lessons: course.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          description: l.description,
          videoUrl: l.videoUrl,
          position: l.position,
        })),
      }}
      initialCompleted={completedMap}
    />
  );
}
