import { Dayjs } from "dayjs";


export interface ReportSetting {
  serviceId: string | null;
  exportAll: boolean;
  dateStart: Date | Dayjs | null;
  dateEnd: Date | Dayjs | null;
  filename: string
};


export const initialReport: ReportSetting = {
  serviceId: '',
  exportAll: true,
  filename: '',
  dateStart: null,
  dateEnd: null,
};