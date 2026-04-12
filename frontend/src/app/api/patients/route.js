import { prisma } from "@/lib/prisma";

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
    return Response.json(
      { error: "Failed to create patient" },
      { status: 500 },
    );
  }
}

// GET all patients
export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json(patients);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch patients" },
      { status: 500 },
    );
  }
}
