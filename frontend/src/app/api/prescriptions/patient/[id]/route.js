export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const prescriptions = await prisma.prescription.findMany({
      where: { patientId: parseInt(id) },
      orderBy: { createdAt: "desc" },
      include: { patient: true },
    });
    return Response.json(prescriptions);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
