import {
  CollectionsBookmark,
  Group,
  Assessment,
  Badge,
  Shower,
  Settings,
  CalendarMonthOutlined,
  HourglassBottom,
  Groups2,
} from "@mui/icons-material";
import { IconHome } from "@tabler/icons-react";

import { uniqueId } from "lodash";
import { Calendar } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

export const useMenuItems = () => {
  const t = useTranslations("Menus");
  const localActive = useLocale();

  return [
    {
      id: uniqueId(),
      title: "แผงควบคุม",
      icon: IconHome,
      href: `/${localActive}/protected/admin/dashboard`,
    },
    {
      id: uniqueId(),
      title: "รอยืนยันการจอง",
      icon: HourglassBottom,
      href: `/${localActive}/protected/admin/waiting-confirm`,
    },
    {
      id: uniqueId(),
      title: "รายการจอง",
      icon: Settings,
      href: `/${localActive}/protected/admin/bookings`,
    },
    {
      id: uniqueId(),
      title: "ปฏิทิน",
      icon: CalendarMonthOutlined,
      href: `/${localActive}/protected/admin/calendar`,
    },
    {
      id: uniqueId(),
      title: "ลูกค้า",
      icon: Groups2,
      href: `/${localActive}/protected/admin/customers`,
    },
    {
      id: uniqueId(),
      title: "จัดการบริการ",
      icon: Shower,
      href: `/${localActive}/protected/admin/services`,
    },
    {
      id: uniqueId(),
      title: "จัดการพนักงาน",
      icon: Badge,
      href: `/${localActive}/protected/admin/employees`,
    },
    {
      id: uniqueId(),
      title: "รายงาน",
      icon: Assessment,
      href: `/${localActive}/protected/admin/reports`,
    },
    {
      id: uniqueId(),
      title: "ตั้งค่าร้านค้า",
      icon: Settings,
      // href: `/${localActive}/protected/admin/settings`,
      children: [
        {
          id: uniqueId(),
          title: "ข้อมูลร้านค้า",
          icon: Settings,
          href: `/${localActive}/protected/admin/settings`,
        },
        {
          id: uniqueId(),
          title: "วันหยุด",
          icon: Settings,
          href: `/${localActive}/protected/admin/holidays-settings`,
        },
        {
          id: uniqueId(),
          title: "ตั้งค่าการจอง",
          icon: Settings,
          href: `/${localActive}/protected/admin/booking-settings`,
        },
        {
          id: uniqueId(),
          title: "ตั้งค่าไลน์",
          icon: Settings,
          href: `/${localActive}/protected/admin/line-settings`,
        },
      ],
    },
  ];
};
