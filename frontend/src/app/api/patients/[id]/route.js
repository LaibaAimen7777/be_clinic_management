export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(id) },
    });
    if (!patient) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(patient);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
