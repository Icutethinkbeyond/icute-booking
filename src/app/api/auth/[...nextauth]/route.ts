import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import LineProvider from "next-auth/providers/line";
import {  UserStatus } from '@prisma/client';
import { prisma } from "../../../../../lib/prisma";


const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 1 * 60 * 60 // 1 hours
  },
  // pages: {
  //   signIn: "/sign-in"
  // },
  providers: [

    // 🟢 เพิ่ม LINE Provider
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {

        const { email, password } = credentials ?? {};

        // console.log(email)

        if (!email || !password) {
          throw new Error("โปรดกรอกอีเมลและรหัสผ่าน");
        }


        let user = await prisma.user.findFirst({
          select: {
            password: true, // เลือก password
            email: true,
            userId: true,
            isEmailVerified: true,
            role: {
              select: {
                name: true,
                roleId: true
              },
            },
            store: {
              select: {
                storeName: true,
                id: true
              }
            }
          }, where: {
            email: {
              equals: email
            },
            userStatus: {
              equals: UserStatus.ACTIVE
            },
            // isEmailVerified : {
            //   equals: true
            // }     
          },
        })

        // console.log(user?.store)

        if (!user || !user.password) {
          throw new Error("โปรดตรวจสอบชื่อผู้ใช้งานเเละรหัสผ่าน");
        }

        const isPasswordValid = await compare(
          password,
          user.password
        )

        if (isPasswordValid) {
          return {
            id: user.userId.toString(),
            email: user.email,
            roleName: user.role?.name,
            roleId: user.role?.roleId,
            storeName: user.store?.storeName,
            storeId: user.store?.id,
            emailVerified: user.isEmailVerified,
            provider: "credentials" // เพิ่มเพื่อให้แยกแยะได้
          } as any;
        }

        // if (user && isPasswordValid) {
        //   // return user;
        //   return {
        //     email: user.email,
        //     id: user.userId.toString(),
        //     roleName: user.role?.name,
        //     roleId: user.role?.roleId,
        //     storeName: user.store?.storeName,
        //     storeId: user.store?.id,
        //     url: '/protected/dashboard'
        //   }
        // } else {
        //   throw new Error("โปรดตรวจสอบชื่อผู้ใช้งานเเละรหัสผ่าน");
        // }
      },
    }),


  ],
  callbacks: {

    // 🟢 จัดการข้อมูลเมื่อ Login ผ่าน LINE
    async signIn({ user, account, profile }) {
      if (account?.provider === "line" && profile) {
        try {
          // ค้นหา User ใน DB ด้วย lineUserId (sub)
          let dbUser = await prisma.customer.findUnique({
            where: { lineUserId: profile.sub },
            select: {
              id: true,
              email: true,
              // role: { select: { name: true, roleId: true } },
              // store: { select: { storeName: true, id: true } }
            }
          });

          // 2.1 ค้นหาหรือสร้าง Role สำหรับผู้ดูแลร้านค้า (STOREADMIN)
          let customerRole = await prisma.role.findUnique({
            where: { name: "CUSTOMER" },
          });

          if (!customerRole) {
            customerRole = await prisma.role.create({
              data: {
                name: "CUSTOMER",
                description: "Role สำหรับลูกค้า",
              },
            });
          }

          // ถ้าไม่พบ User ให้สร้างใหม่ (หรือจัดการตาม Logic ของคุณ)
          if (!dbUser) {
            // ตัวอย่าง: ไม่อนุญาตให้ login ถ้ายังไม่มีในระบบ
            // return false; 
            // หรือ สร้าง user ใหม่:
            if (profile.sub) {
              dbUser = await prisma.customer.create({
                data: {
                  lineUserId: profile.sub,
                  name: user.name,
                  email: profile.email,
                  roleId: customerRole?.roleId,
                },
                // include: { role: true, store: true }
              }) as any;
            } else {
              console.error("LINE SignIn Error: profile not found");
              return false;
            }
          }

          // ส่งข้อมูล DB เข้าไปใน object user เพื่อให้ jwt callback นำไปใช้ต่อ
          (user as any).id = dbUser?.id.toString();
          // (user as any).roleId = dbUser?.role?.;
          // (user as any).roleName = dbUser?.role?;
          // (user as any).storeId = dbUser?.store?.id;
          // (user as any).storeName = dbUser?.store?.storeName;
        } catch (error) {
          console.error("LINE SignIn Error:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, trigger, user, account, session }) {
      // เมื่อ Login ครั้งแรก user object จะมีค่า
      if (user) {
        token.id = user.id;
        token.roleId = (user as any).roleId;
        token.roleName = (user as any).roleName;
        token.storeName = (user as any).storeName;
        token.storeId = (user as any).storeId;
        token.provider = account?.provider;
        token.emailVerified = (user as any).emailVerified;
      }
      // เพิ่มส่วนนี้เพื่อให้การเรียก update() จาก useSession ทำงาน
      // if (trigger === "update" && session) {
      //   const updatedUser = await prisma.user.findUnique({
      //     where: { email: token.email as string }
      //   });
      //   console.log(updatedUser)
      //   token.id = user.id;
      //   token.roleId = (user as any).roleId;
      //   token.roleName = (user as any).roleName;
      //   token.storeName = (user as any).storeName;
      //   token.storeId = (user as any).storeId;
      //   token.provider = account?.provider;
      //   token.emailVerified = updatedUser?.isEmailVerified;
      // }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          roleName: token.roleName,
          roleId: token.roleId,
          storeName: token.storeName,
          storeId: token.storeId,
          provider: token.provider,
          emailVerified: token.emailVerified
        }
      } as any;
    },
  },
};
// })


const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

