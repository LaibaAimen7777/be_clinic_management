export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const cnic = searchParams.get("cnic")?.trim();
    if (!cnic || cnic.length < 5) return Response.json(null);

    const patient = await prisma.patient.findFirst({
      where: { cnicOrMrNo: { equals: cnic, mode: "insensitive" } },
      orderBy: { createdAt: "desc" },
    });
    return Response.json(patient ?? null);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
