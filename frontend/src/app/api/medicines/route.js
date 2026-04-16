export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";
    const medicines = await prisma.medicine.findMany({
      where: {
        name: { contains: q, mode: "insensitive" },
      },
      orderBy: { name: "asc" },
      take: 20,
    });
    return Response.json(medicines);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.name?.trim() || !body.type?.trim())
      return Response.json(
        { error: "Name and type are required." },
        { status: 400 },
      );

    const medicine = await prisma.medicine.create({
      data: { name: body.name.trim(), type: body.type.trim() },
    });
    return Response.json(medicine);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
