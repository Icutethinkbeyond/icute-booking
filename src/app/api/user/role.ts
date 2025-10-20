import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, RoleName, UserStatus } from '@prisma/client';
import { User } from '@/interfaces/User';
import { sendEmail } from '@/utils/services/EmailServices';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// export async function GET(req: NextRequest) {
//     try {
//         // ดึง query parameters เช่น userId
//         const { searchParams } = new URL(req.url);
//         const userId = searchParams.get('userId');

//         let categories;

//         if (userId) {
//             // ค้นหา user ตาม ID
//             categories = await prisma.user.findUnique({
//                 where: {
//                     userId,
//                 }, 
//                 include: {
//                     equipments: true, // ดึงข้อมูล equipments ที่เชื่อมโยงด้วย
//                 },
//             });

//             if (!categories) {
//                 return new NextResponse(JSON.stringify('User not found'), { status: 404 });
//             }
//         } else {

//             const page = parseInt(searchParams.get('page') || '1', 10); // หน้าเริ่มต้นที่ 1
//             const pageSize = parseInt(searchParams.get('pageSize') || '10', 10); // จำนวนข้อมูลต่อหน้าเริ่มต้นที่ 10

//             // คำนวณ skip และ take
//             const skip = (page - 1) * pageSize;
//             const take = pageSize;

//             // ดึงข้อมูลจากฐานข้อมูล
//             const [categories, totalItems] = await Promise.all([
//                 prisma.user.findMany({
//                     skip,
//                     take,
//                     orderBy: { createdAt: 'desc' }, // เรียงลำดับตามวันที่สร้าง
//                 }),
//                 prisma.user.count(), // นับจำนวนทั้งหมดของรายการ
//             ]);

//             // คำนวณค่าที่เกี่ยวข้องกับ pagination
//             const totalPages = Math.ceil(totalItems / pageSize);

//             // เพิ่ม rowIndex ในข้อมูลแต่ละแถว
//             const categoriesWithIndex = categories.map((user, index) => ({
//                 ...user,
//                 rowIndex: skip + index + 1, // ลำดับแถวเริ่มต้นจาก 1 และเพิ่มตาม pagination
//             }));

//             return new NextResponse(
//                 JSON.stringify({
//                     data: categoriesWithIndex,
//                     pagination: {
//                         page,
//                         pageSize,
//                         totalItems,
//                         totalPages,
//                     },
//                 }),
//                 { status: 200 }
//             );
//         }

//         // return new NextResponse(JSON.stringify(categories), { status: 200 });
//     } catch (error) {
//         console.error('Error fetching categories:', error);
//         return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
//     }
// }

// export async function POST(req: NextRequest) {

//     try {

//         const { email, name, surname, department, position, phone, image, manDay, roleId, address } = await req.json() as User;

//         let JWT_SECRET = process.env.JWT_SECRET || "OBjHLjEPKZAqSmnqNUZNkm9hTjmv4LJI"

//         const tokenService = new TokenService(JWT_SECRET, "24h");

//         // Validation
//         if (!email || !name || !surname) {
//             return new NextResponse(JSON.stringify('Email, Name and Surname is required'), { status: 400 });
//         }

//         const nameIsAlready = await prisma.user.findFirst({ where: { email: { equals: email } } })
//         const surNameIsAlready = await prisma.user.findFirst({ where: { email: { equals: email } } })

//         if (nameIsAlready && surNameIsAlready) {
//             return new NextResponse(JSON.stringify('Person is Already'), { status: 400 });
//         }

//         //check name is exist
//         const emailIsAlready = await prisma.user.findFirst({ where: { email: { equals: email } } })

//         if (emailIsAlready) {
//             return new NextResponse(JSON.stringify('Email is Already'), { status: 400 });
//         }

//         // const _role = await prisma.role.findFirst({ where: { name: { equals: RoleName.(roleId) } } })

//         // Create a new User
//         const newUser = await prisma.user.create({
//             data: {
//                 email, name, surname, department, position, phone: phone ? phone : null, image, manDay: Number(manDay), userStatus: UserStatus.InActice, address, roleId
//             },
//         });

//         // Make Reset Token
//         console.log(roleId)

//         const _role = await prisma.role.findFirst({ where: { name: { equals: RoleName.Employee } } })

//         console.log(_role?.name)

//         if (roleId !== _role?.name) {

//             console.log()
//             // Generate Token
//             let newToken = tokenService.generateToken({ id: newUser.userId, email: newUser.email });
//             //Create Token For Reset Password
//             const resetToken = await prisma.resetToken.create({
//                 data: {
//                     token: newToken,
//                     userIds: newUser.userId
//                 },
//             });

//             try {
//                 await sendEmail(newUser.email, "Welcome to Our Platform!", "reset-password", { ConfirmationURL: resetToken.token });
//                 return new NextResponse(JSON.stringify("Email sent successfull"), { status: 200 });
//             } catch (error: any) {
//                 console.error("Error sending email:", error);
//                 await prisma.user.delete({ where: { userId: newUser.userId } })
//                 return new NextResponse(JSON.stringify("Failed to send email"), { status: 535 });
//             }
//         } else {
//             return new NextResponse(JSON.stringify(newUser), { status: 201 });
//         }



//         // return new NextResponse(JSON.stringify(newUser), { status: 201 });

//     } catch (error) {

//         console.error("Error Connect Local Server:", error);
//         return new NextResponse(JSON.stringify({ error }), { status: 500 });

//     }

// };

// export async function DELETE(req: NextRequest) {

//     try {
//         // รับ userId จาก query parameter
//         const { searchParams } = new URL(req.url);
//         const userId = searchParams.get('userId');

//         // ตรวจสอบว่ามี userId หรือไม่
//         if (!userId) {
//             return new NextResponse(JSON.stringify('User ID is required'), { status: 400 });
//         }

//         // ลบ user โดยใช้ userId
//         const deletedUser = await prisma.user.delete({
//             where: {
//                 userId,
//             },
//         });

//         // ส่งข้อมูล user ที่ถูกลบกลับ
//         return new NextResponse(JSON.stringify(deletedUser), { status: 200 });
//     } catch (error: any) {
//         console.error('Error deleting user:', error);

//         if (error.code === 'P2025') {
//             // Prisma error code สำหรับการไม่พบ record ที่ต้องการลบ
//             return new NextResponse(JSON.stringify('User not found'), { status: 404 });
//         }

//         return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
//     }
// }

// export async function PATCH(req: NextRequest) {

//     try {

//         const { userId, userName, userDesc, userRemark } = await req.json() as User;

//         if (!(userId && userName)) {
//             return new NextResponse(JSON.stringify('User ID is required'), { status: 400 });
//         }

//         const updatedUser = await prisma.user.update({
//             where: { userId: userId },
//             data: {
//                 userName, userDesc, userRemark
//             },
//             // Update fields based on the request body
//         });

//         return new NextResponse(JSON.stringify(updatedUser), { status: 200 });

//     } catch (error: any) {

//         console.error('Error updating user:', error);

//         if (error.code === 'P2025') {
//             // Prisma error code สำหรับการไม่พบ record ที่ต้องการลบ
//             return new NextResponse(JSON.stringify('User not found'), { status: 404 });
//         }

//         return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
//     }
// }