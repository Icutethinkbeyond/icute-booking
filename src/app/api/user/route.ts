import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, RoleName, UserStatus } from '@prisma/client';
import { User } from '@/interfaces/User';
// import { TokenService } from '@/utils/services/TokenService';
// import { sendEmail } from '@/utils/services/EmailServices';
import { PasswordService } from '@/utils/services/PasswordServices';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        // ดึง query parameters เช่น userId
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        let users;

        if (userId) {
            // ค้นหา user ตาม ID
            users = await prisma.user.findUnique({
                where: {
                    userId,
                },
                select: {
                    userId: true,
                    email: true,
                    name: true,
                    department: true,
                    position: true,
                    image: true,
                    manDay: true,
                    phone: true,
                    userStatus: true,
                    address: true,
                    role: true
                },
            });

            if (!users) {
                return new NextResponse(JSON.stringify('User not found'), { status: 404 });
            }

            return new NextResponse(JSON.stringify(users), { status: 200 });

        } else {

            const page = parseInt(searchParams.get('page') || '1', 10); // หน้าเริ่มต้นที่ 1
            const pageSize = parseInt(searchParams.get('pageSize') || '10', 10); // จำนวนข้อมูลต่อหน้าเริ่มต้นที่ 10

            // คำนวณ skip และ take
            const skip = (page - 1) * pageSize;
            const take = pageSize;

            // ดึงข้อมูลจากฐานข้อมูล
            const [users, totalItems] = await Promise.all([
                prisma.user.findMany({

                    skip,
                    take,
                    orderBy: { createdAt: 'desc' }, // เรียงลำดับตามวันที่สร้าง
                    select: {
                        userId: true,
                        email: true,
                        name: true,
                        department: true,
                        position: true,
                        image: true,
                        manDay: true,
                        phone: true,
                        userStatus: true,
                        address: true,
                        role: true
                    },

                }),
                prisma.user.count(), // นับจำนวนทั้งหมดของรายการ
            ]);

            // คำนวณค่าที่เกี่ยวข้องกับ pagination
            const totalPages = Math.ceil(totalItems / pageSize);

            // เพิ่ม rowIndex ในข้อมูลแต่ละแถว
            const usersWithIndex = users.map((user, index) => ({
                ...user,
                rowIndex: skip + index + 1, // ลำดับแถวเริ่มต้นจาก 1 และเพิ่มตาม pagination
            }));

            return new NextResponse(
                JSON.stringify({
                    data: usersWithIndex,
                    pagination: {
                        page,
                        pageSize,
                        totalItems,
                        totalPages,
                    },
                }),
                { status: 200 }
            );
        }



    } catch (error) {
        console.error('Error fetching users:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}

export async function POST(req: NextRequest) {

    try {

        const { email, password, name, department, position, phone, image, manDay, roleId, address, roleName } = await req.json() as User;
        const _roleName = roleName as RoleName;

        const _passwordService = new PasswordService();
        let hash = null;


        if (roleName !== RoleName.Employee) {

            if (password) {
                hash = await _passwordService.hashPassword(password);
            } else {
                return new NextResponse(JSON.stringify('Password is Not Defind'), { status: 400 });
            }
        }

        // Validation
        if (!email) {
            return new NextResponse(JSON.stringify('Email is required'), { status: 400 });
        } else {
            //check name is exist
            const emailIsAlready = await prisma.user.findFirst({ where: { email: { equals: email }, userStatus: UserStatus.Active } })

            if (emailIsAlready) {
                return new NextResponse(JSON.stringify('Email is Already'), { status: 400 });
            }
        }

        // let JWT_SECRET = process.env.JWT_SECRET || "OBjHLjEPKZAqSmnqNUZNkm9hTjmv4LJI"

        // const tokenService = new TokenService(JWT_SECRET, "24h");

        // Validation
        if (!name) {
            return new NextResponse(JSON.stringify('Email, Name is required'), { status: 400 });
        }

        const nameIsAlready = await prisma.user.findFirst({ where: { email: { equals: email }, userStatus: UserStatus.Active } })

        if (nameIsAlready) {
            return new NextResponse(JSON.stringify('Person is Already'), { status: 400 });
        }


        const _roleData = await prisma.role.findFirst({ where: { name: { equals: _roleName } } })

        // Create a new User
        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                password: hash,
                department,
                position,
                phone: phone ? phone : null,
                image,
                manDay: Number(manDay),
                userStatus: UserStatus.Active,
                address,
                roleId: _roleData?.roleId
            },
        });

        // Make Reset Token
        // console.log(roleId)

        // const _role = await prisma.role.findFirst({ where: { name: { equals: RoleName.Employee } } })

        // console.log(_role?.name)

        // if (roleId !== _role?.name) {

        //     console.log()
        //     // Generate Token
        //     let newToken = tokenService.generateToken({ id: newUser.userId, email: newUser.email });
        //     //Create Token For Reset Password
        //     const resetToken = await prisma.resetToken.create({
        //         data: {
        //             token: newToken,
        //             userIds: newUser.userId
        //         },
        //     });

        //     try {
        //         await sendEmail(newUser.email, "Welcome to Our Platform!", "reset-password", { ConfirmationURL: resetToken.token });
        //         return new NextResponse(JSON.stringify("Email sent successfull"), { status: 200 });
        //     } catch (error: any) {
        //         console.error("Error sending email:", error);
        //         await prisma.user.delete({ where: { userId: newUser.userId } })
        //         return new NextResponse(JSON.stringify("Failed to send email"), { status: 535 });
        //     }
        // } else {
        //     return new NextResponse(JSON.stringify(newUser), { status: 201 });
        // }

        return new NextResponse(JSON.stringify(newUser), { status: 201 });

    } catch (error) {

        console.error("Error Connect Local Server:", error);
        return new NextResponse(JSON.stringify({ error }), { status: 500 });

    }

};

export async function DELETE(req: NextRequest) {

    try {
        // รับ userId จาก query parameter
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        // ตรวจสอบว่ามี userId หรือไม่
        if (!userId) {
            return new NextResponse(JSON.stringify('User ID is required'), { status: 400 });
        }

        // ลบ user โดยใช้ userId
        const deletedUser = await prisma.user.update({
            where: {
                userId,
            },
            data: {
                userStatus: UserStatus.InActice
            }
        });

        // ส่งข้อมูล user ที่ถูกลบกลับ
        return new NextResponse(JSON.stringify({ userName: deletedUser.name }), { status: 200 });
    } catch (error: any) {
        console.error('Error deleting user:', error);

        if (error.code === 'P2025') {
            // Prisma error code สำหรับการไม่พบ record ที่ต้องการลบ
            return new NextResponse(JSON.stringify('User not found'), { status: 404 });
        }

        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {

    try {

        const { userId, email, password, name, department, position, phone, image, manDay, roleId, address, roleName } = await req.json() as User;
        const _roleName = roleName as RoleName;

        // ตรวจสอบว่ามี userId หรือไม่
        if (!userId) {
            return new NextResponse(JSON.stringify('User ID is required'), { status: 400 });
        }

        const _passwordService = new PasswordService();
        let hash = null;

        if (password && roleName !== RoleName.Employee) {
            hash = await _passwordService.hashPassword(password);
        }

        if (roleName !== RoleName.Employee) {
            // Validation
            if (!email) {
                return new NextResponse(JSON.stringify('Email is required'), { status: 400 });
            } else {

                //check name is exist
                const emailIsAlready = await prisma.user.findFirst({ where: { email: { equals: email }, userStatus: UserStatus.Active } })

                if (emailIsAlready && emailIsAlready.email !== email) {
                    return new NextResponse(JSON.stringify('Email is Already'), { status: 400 });
                }
            }
        }

        // let JWT_SECRET = process.env.JWT_SECRET || "OBjHLjEPKZAqSmnqNUZNkm9hTjmv4LJI"

        // const tokenService = new TokenService(JWT_SECRET, "24h");


        // Validation
        if (!name) {
            return new NextResponse(JSON.stringify('Name is required'), { status: 400 });
        }

        // const nameIsAlready = await prisma.user.findFirst({ where: { email: { equals: email }, userStatus: UserStatus.Active } })

        //check name is exist
        const nameIsAlready = await prisma.user.findFirst({ where: { name: { equals: name }, userStatus: UserStatus.Active } })

        if (nameIsAlready && nameIsAlready.userId !== userId) {
            return new NextResponse(JSON.stringify('Person is Already'), { status: 400 });
        }


        const _roleData = await prisma.role.findFirst({ where: { name: { equals: _roleName } } })

        // Create a new User
        const updatedUser = await prisma.user.update({
            data: {
                email,
                name,
                password: hash,
                department,
                position,
                phone: phone ? phone : null,
                image,
                manDay: Number(manDay),
                userStatus: UserStatus.Active,
                address,
                roleId: _roleData?.roleId
            },
            where: {
                userId
            }
        });

        // const updatedUser = await prisma.user.update({
        //     where: { userId: userId },
        //     data: {
        //         userName, userDesc, userRemark
        //     },
        //     // Update fields based on the request body
        // });

        return new NextResponse(JSON.stringify(updatedUser), { status: 200 });

    } catch (error: any) {

        console.error('Error updating user:', error);

        if (error.code === 'P2025') {
            // Prisma error code สำหรับการไม่พบ record ที่ต้องการลบ
            return new NextResponse(JSON.stringify('User not found'), { status: 404 });
        }

        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}