import { baselightTheme } from "@/utils/theme/DefaultColors";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { UserProvider } from "@/contexts/UserContext";
import { CategoryProvider } from "@/contexts/CategoryContext";
import { EquipmentProvider } from "@/contexts/EquipmentContext";
import { Prompt } from "next/font/google";

// import mutiMassages next-intl
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { SessionProviders } from "../../lib/SessionProviders";
import { DocumentProvider } from "@/contexts/DocumentContext";
import { SiteProvider } from "@/contexts/SiteContext";
import { RentalProvider } from "@/contexts/RentalContext";
import { NotifyProvider } from "@/contexts/NotifyContext";
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";
import { MaintenanceProvider } from "@/contexts/MaintenanceContext";
import { ReportProvider } from "@/contexts/ReportContext";

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
                  <EquipmentProvider>
                    <CategoryProvider>
                      <DocumentProvider>
                        <SiteProvider>
                          <RentalProvider>
                            <MaintenanceProvider>
                              <ReportProvider>
                                <NextIntlClientProvider messages={messages}>
                                  {children}
                                </NextIntlClientProvider>
                              </ReportProvider>
                            </MaintenanceProvider>
                          </RentalProvider>
                        </SiteProvider>
                      </DocumentProvider>
                    </CategoryProvider>
                  </EquipmentProvider>
                </UserProvider>
              </BreadcrumbProvider>
            </NotifyProvider>
          </SessionProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
