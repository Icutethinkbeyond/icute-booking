
import { LocationType } from "@prisma/client";
import { Document, initialDocument } from "./Document"

// Site
export interface Site {
  siteId: string;
  siteName: string;
  siteDesc?: string;
  contactorName?: string;
  contactorEmail?: string;
  contactorTel?: string;
  Document?: Document[];
  documentId?: string;
  repairLocation?: string
}

export interface SiteSelect {
  siteId: string;
  siteName: string;
}

export const initialSite: Site = {
  siteId: '',
  siteName: '',
  siteDesc: '',
  documentId: '',
  Document: [],
  contactorName: '',
  contactorEmail: '',
  contactorTel: '',
  repairLocation: LocationType.OnSite
};
