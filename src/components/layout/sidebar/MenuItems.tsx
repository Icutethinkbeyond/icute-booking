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
      title: "เมนู1",
      icon: IconHome,
      href: `/${localActive}/protected/dashboard`,
    },
    {
      id: uniqueId(),
      title: "เมนู2",
      icon: Group,
      href: `/${localActive}/protected/user-management`,
      children: [
        {
          id: uniqueId(),
          title: "เมนู2.1",
          href: `/${localActive}/protected/user-management`,
        },
      ],
    },
  ];
};
