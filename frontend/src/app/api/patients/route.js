export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";

function getPKTDate() {
  const now = new Date();
  const pkt = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Karachi" }),
  );
  const y = pkt.getFullYear();
  const m = String(pkt.getMonth() + 1).padStart(2, "0");
  const d = String(pkt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const patient = await prisma.patient.create({
      data: {
        name: body.name,
        age: Number(body.age),
        relativeType: body.relativeType,
        relativeName: body.relativeName,
        cnicOrMrNo: body.cnicOrMrNo,
        date: new Date(body.date),
        status: "Waiting",
      },
    });
    return Response.json(patient);
  } catch (error) {
    console.error("POST /api/patients error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const today = getPKTDate();
    const todayStart = new Date(today + "T00:00:00.000Z");

    // Auto-mark any past Waiting patients as No-Show
    await prisma.patient.updateMany({
      where: {
        status: "Waiting",
        date: { lt: todayStart },
      },
      data: { status: "No-Show" },
    });

    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: "desc" },
    });

    return Response.json(patients);
  } catch (error) {
    console.error("GET /api/patients error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
