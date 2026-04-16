export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const prescription = await prisma.prescription.create({
      data: {
        patientId: parseInt(body.patientId),
        medicines: body.medicines,
        diagnosis: body.diagnosis ?? "",
        treatment: body.treatment ?? "",
        vaRight: body.vaRight ?? "",
        vaLeft: body.vaLeft ?? "",
        iopRight: body.iopRight ?? "",
        iopLeft: body.iopLeft ?? "",
        atRight: body.atRight ?? "",
        atLeft: body.atLeft ?? "",
        antSeg: body.antSeg ?? "",
        fundus: body.fundus ?? "",
        dm: body.dm ?? false,
        htn: body.htn ?? false,
        ihd: body.ihd ?? false,
        asthma: body.asthma ?? false,
      },
      include: { patient: true },
    });

    // update patient status to Checked
    await prisma.patient.update({
      where: { id: parseInt(body.patientId) },
      data: { status: "Checked" },
    });

    return Response.json(prescription);
  } catch (error) {
    console.error("POST /api/prescriptions error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
