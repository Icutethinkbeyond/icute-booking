import { AboutEquipment, Equipment, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type SiteWithEquipments = {
  siteId: string;
  siteName: string;
  equipments: (Equipment & { aboutEquipment: AboutEquipment | null })[];
};

class ReportService {

  // 📌 ดึงข้อมูลสินค้า (พร้อม category และ aboutProduct)
  getEquipmentsBySite = async (siteId?: string): Promise<SiteWithEquipments[]> => {
    try {
      const sitesWithEquipments = await prisma.site.findMany({
        include: {
          Document: {
            include: {
              rental: {
                include: {
                  equipment: {
                    include: {
                      aboutEquipment: true
                    }
                  }, // ดึงข้อมูลอุปกรณ์ใน rental
                },
              },
            },
          },
        },
        where: {
          ...(siteId && { siteId: siteId }),
        }
      });

      return sitesWithEquipments.map((site) => ({
        siteId: site.siteId,
        siteName: site.siteName,
        equipments: site.Document.flatMap((doc) =>
          doc.rental.map((rental) => rental.equipment)
        ),
      }));
    } catch (error) {
      console.error("Error fetching equipment by site:", error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  };

  


}

export default ReportService;
