import { baselightTheme } from "@/utils/theme/DefaultColors";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { UserProvider } from "@/contexts/UserContext";
import { Prompt } from "next/font/google";

// import mutiMassages next-intl
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { SessionProviders } from "../../lib/SessionProviders";
import { NotifyProvider } from "@/contexts/NotifyContext";
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";
import { ServiceProvider } from "@/contexts/ServiceContext";
import { StoreProvider } from "@/contexts/StoreContext";
import { ReportProvider } from "@/contexts/ReportContext";
import { BookingProvider } from "@/contexts/BookingContext";
import { EmployeeProvider } from "@/contexts/EmployeeContext";
import EmailVerificationGuard from "@/components/forms/auth/EmailVerificationGuard";

export const dynamic = "force-dynamic";

const prompt = Prompt({
  subsets: ["thai", "latin"], // Specify subsets if needed
  weight: ["400", "700"], // Specify the font weights you need
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  if (!["en", "th"].includes(locale)) {
    // ไม่ใช้ notFound() แต่สามารถส่ง error ไปที่ console หรือแสดงข้อความ
    console.error("Invalid locale provided, using default locale");
  }

  return (
    <html lang={locale}>
      <body className={prompt.className}>
        <ThemeProvider theme={baselightTheme}>
          <SessionProviders>
            <CssBaseline />
            <NotifyProvider>
              <BreadcrumbProvider>
                <UserProvider>
                  <ServiceProvider>
                    <StoreProvider>
                      <ReportProvider>
                        <BookingProvider>
                          <EmployeeProvider>
                            {/* <CategoryProvider> */}
                            <NextIntlClientProvider messages={messages}>
                              <EmailVerificationGuard>
                              {children}
                              </EmailVerificationGuard>
                            </NextIntlClientProvider>
                            {/* </CategoryProvider> */}
                          </EmployeeProvider>
                        </BookingProvider>
                      </ReportProvider>
                    </StoreProvider>
                  </ServiceProvider>
                </UserProvider>
              </BreadcrumbProvider>
            </NotifyProvider>
          </SessionProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
