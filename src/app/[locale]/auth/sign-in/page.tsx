"use client";

import AuthForm from "@/components/forms/auth/AuthForm";
import LineLogin from "@/components/forms/auth/LineLogin";
import {
  checkShopLoginCallbackUrl,
  parseShopFromCallbackUrl,
} from "@/utils/lib/utils";
import { usePathname, useSearchParams } from "next/navigation";

const LoginPage = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const isShop = checkShopLoginCallbackUrl(callbackUrl);

  const shopInfo = callbackUrl ? parseShopFromCallbackUrl(callbackUrl) : null

  return <>{isShop ? <LineLogin shopId={shopInfo} /> : <AuthForm />};</>;
};

export default LoginPage;
