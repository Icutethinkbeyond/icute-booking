import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import withAuth from "next-auth/middleware";

export const locales = ["en", "th"] as const;

const intlMiddleware = createMiddleware({
  locales: locales,
  defaultLocale: "th",
  localeDetection: false,
});

const authMiddleware = withAuth(
  async function onSuccess(req) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: async ({ token }) => {
        if (!token) return false;
        const currentTime = Math.floor(Date.now() / 1000);
        return typeof token.exp === "number" && token.exp > currentTime; // ตรวจสอบ token expiry
      },
    },
    pages: {
      signIn: "/auth/sign-in",
    },
  }
);

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const excludePattern = "^(/(" + locales.join("|") + "))?/protected/?.*?$";
  const publicPathnameRegex = RegExp(excludePattern, "i");
  const isPublicPage = !publicPathnameRegex.test(pathname);

  // ตรวจสอบ Locale ใน URL
  const locale = locales.find((loc) => pathname.startsWith(`/${loc}`));

  if (locale) {
    const trimmedPath = pathname.replace(`/${locale}`, "");
    const isValidPath = pathname.startsWith("/_next") || pathname.includes(".");

    // Redirect ไป `/protected/dashboard` ถ้า path ไม่ถูกต้อง
    if (!trimmedPath || trimmedPath === "/") {
      return NextResponse.redirect(new URL(`/${locale}/protected/dashboard`, req.url));
    }
  }

  // ตรวจสอบ token และ session expiration
  const token = await getToken({ req });
  if (token) {
    const currentTime = Math.floor(Date.now() / 1000);
    if (typeof token.exp === "number" && token.exp < currentTime) {
      // Token หมดอายุ
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }
  }

  if (isPublicPage) {
    return intlMiddleware(req);
  } else {
    return (authMiddleware as any)(req);
  }
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
