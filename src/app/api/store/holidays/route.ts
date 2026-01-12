import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client"; // นำเข้า Prisma Client
import { Holiday, Store } from '@/interfaces/Store';
import { getCurrentUserAndStoreIdsByToken } from '@/utils/lib/auth';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

// [GET] ดึงข้อมูลแบบ Pagination
export async function GET(request: NextRequest) {
  try {
    const { storeId } = await getCurrentUserAndStoreIdsByToken(request);
    const { searchParams } = new URL(request.url);

    let page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (page === 0) { page = 1 }
    const skip = (page - 1) * limit;

    const [holidays, total] = await Promise.all([
      prisma.holiday.findMany({
        where: { storeId },
        skip,
        take: limit,
        orderBy: { date: "asc" },
      }),
      prisma.holiday.count({ where: { storeId } }),
    ]);

    return NextResponse.json({
      data: holidays,
      metadata: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching holidays', error);
    return NextResponse.json({ message: "Error fetching holidays" }, { status: 500 });
  }
}

// [POST] เพิ่มวันหยุด
export async function POST(request: NextRequest) {
  try {
    const { storeId } = await getCurrentUserAndStoreIdsByToken(request);
    const body: Holiday = await request.json();

    if (!body.date) {
      return new NextResponse(JSON.stringify('Date not found'), { status: 404 });
    }

    // if (body.fullDay) {
    //   if (body.startTime && body.endTime) {
    //     return new NextResponse(JSON.stringify('startTime and endTime not found'), { status: 404 });
    //   }
    // }

    const newHoliday = await prisma.holiday.create({
      data: {
        date: dayjs(body.date).format(),
        holidayName: body.holidayName,
        holidayType: body.holidayType,
        fullDay: typeof body.fullDay === 'string' ? Boolean(body.fullDay) : body.fullDay,
        startTime: body.startTime ? dayjs(body.startTime).format() : null,
        endTime: body.endTime ? dayjs(body.endTime).format() : null,
        storeId: storeId,
      },
    });

    return NextResponse.json(newHoliday, { status: 201 });
  } catch (error: any) {
    console.error('Error creating holiday', error);
    // กรณีติด @unique storeId
    if (error.code === 'P2002') {
      return NextResponse.json({ message: "ร้านค้านี้มีข้อมูลวันหยุดอยู่แล้ว" }, { status: 400 });
    }
    return NextResponse.json({ message: "Error creating holiday" }, { status: 500 });
  }
}