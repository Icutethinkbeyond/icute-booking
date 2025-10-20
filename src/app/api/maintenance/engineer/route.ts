import { NextRequest, NextResponse } from 'next/server';
import { AboutEquipment, Category, PrismaClient, Prisma, EquipmentStatus, UserStatus, RoleName, DocumentStep } from '@prisma/client';
import { Equipment } from '@/interfaces/Equipment';
import dayjs from 'dayjs';
import { User } from '@/interfaces/User';
import { Repairman } from '@/interfaces/Maintenance';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {

        const { searchParams } = new URL(req.url);
        let maintenanceId = searchParams.get('maintenanceId');

        let engineer;

        if (!maintenanceId) {
            return new NextResponse(JSON.stringify({ error: "maintenanceId are require" }), { status: 400 });
        }

        engineer = await prisma.repairman.findMany({
            where: {
                maintenanceId
            },
            include: {
                user: true
            }
        });

        if (!engineer) {
            return new NextResponse(JSON.stringify('Engineer not found'), { status: 404 });
        }

        return new NextResponse(
            JSON.stringify({ engineer }),
            { status: 200 }
        );

    } catch (error) {
        console.error('Error fetching user:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {

    try {
        // รับ categoryId จาก query parameter
        const { searchParams } = new URL(req.url);
        const repairmanId = searchParams.get('repairmanId');

        console.log(repairmanId)

        // ตรวจสอบว่ามี categoryId หรือไม่
        if (!repairmanId) {
            return new NextResponse(JSON.stringify('repairman ID is required'), { status: 400 });
        }

        // ลบ category โดยใช้ categoryId
        const deletedRepairman = await prisma.repairman.delete({
            where: {
                repairmanId,
            },
        });

        // ส่งข้อมูล category ที่ถูกลบกลับ
        return new NextResponse(JSON.stringify(deletedRepairman), { status: 200 });
    } catch (error: any) {
        console.error('Error deleting category:', error);

        if (error.code === 'P2025') {
            // Prisma error code สำหรับการไม่พบ record ที่ต้องการลบ
            return new NextResponse(JSON.stringify('Category not found'), { status: 404 });
        }

        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}


