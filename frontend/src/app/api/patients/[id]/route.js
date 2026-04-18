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

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const patient = await prisma.patient.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        age: parseInt(body.age),
        relativeType: body.relativeType,
        relativeName: body.relativeName,
        cnicOrMrNo: body.cnicOrMrNo,
        date: new Date(body.date),
        status: body.status,
      },
    });
    return Response.json(patient);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await prisma.patient.delete({ where: { id: parseInt(id) } });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
