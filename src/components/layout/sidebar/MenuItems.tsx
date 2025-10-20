import {
  CollectionsBookmark,
  ContentPaste,
  Group,
  Handyman,
  Inventory,
  PinDrop,
  Report,
} from "@mui/icons-material";
import { IconHome } from "@tabler/icons-react";

import { uniqueId } from "lodash";
import { useTranslations, useLocale } from "next-intl";

export const useMenuItems = () => {
  
  const t = useTranslations("Menus");
  const localActive = useLocale();

  return [
    {
      id: uniqueId(),
      title: t("menu1"),
      icon: IconHome,
      href: `/${localActive}/protected/dashboard`,
    },
    {
      id: uniqueId(),
      title: "คลังอุปกรณ์",
      icon: Inventory,
      href: `/${localActive}/protected/inventory`,
      children: [
        {
          id: uniqueId(),
          title: "อุปกรณ์ทั้งหมด",
          href: `/${localActive}/protected/inventory`,
        },
        {
          id: uniqueId(),
          title: "หมวดหมู่",
          href: `/${localActive}/protected/inventory/category`,
        },
        {
          id: uniqueId(),
          title: "นำเข้าข้อมูล",
          href: `/${localActive}/protected/inventory/import`,
        },
      ],
    },
    {
      id: uniqueId(),
      title: "สถานที่",
      icon: PinDrop,
      href: `/${localActive}/protected/site`,
      children: [
        {
          id: uniqueId(),
          title: "รายการสถานที่",
          href: `/${localActive}/protected/site`,
        },
      ],
    },
    {
      id: uniqueId(),
      title: "เช่าอุปกรณ์",
      icon: CollectionsBookmark,
      href: `/${localActive}/protected/rental`,
      children: [
        {
          id: uniqueId(),
          title: "รายการเช่าอุปกรณ์",
          href: `/${localActive}/protected/rental`,
        },
      ],
    },
    {
      id: uniqueId(),
      title: "แจ้งซ่อม",
      icon: Handyman,
      href: `/${localActive}/protected/maintenance`,
      children: [
        {
          id: uniqueId(),
          title: t("menu3-1"),
          href: `/${localActive}/protected/maintenance`,
        },
      ],
    },
    {
      id: uniqueId(),
      title: t("menu4"),
      icon: Group,
      href: `/${localActive}/protected/user-management`,
      children: [
        {
          id: uniqueId(),
          title: t("menu4-1"),
          href: `/${localActive}/protected/user-management`,
        },
      ],
    },
    {
      id: uniqueId(),
      title: "รายงาน",
      icon: ContentPaste,
      href: `/${localActive}/protected/reports`,
      children: [
        {
          id: uniqueId(),
          title: "คลังอุปกรณ์",
          href: `/${localActive}/protected/reports/inventory`,
        },
        {
          id: uniqueId(),
          title: "การแจ้งซ่อม",
          href: `/${localActive}/protected/reports/maintenance`,
        },
        {
          id: uniqueId(),
          title: "การเช่าอุปกรณ์",
          href: `/${localActive}/protected/reports/rental`,
        },
      ],
    },
  ];
};
