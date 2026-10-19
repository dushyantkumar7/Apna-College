import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// POST { lessonId, secondsWatched, completed }
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { lessonId, secondsWatched, completed } = await req.json();
    if (!lessonId) return NextResponse.json({ error: "lessonId required" }, { status: 400 });

    const progress = await db.videoProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {
        secondsWatched: Math.max(Number(secondsWatched) || 0, 0),
        ...(completed === true ? { completed: true } : {}),
      },
      create: {
        userId,
        lessonId,
        secondsWatched: Number(secondsWatched) || 0,
        completed: completed === true,
      },
    });

    return NextResponse.json({ progress });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to save progress." }, { status: 500 });
  }
}
