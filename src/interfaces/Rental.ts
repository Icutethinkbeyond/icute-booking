import { RentalStatus } from "@prisma/client";
import dayjs, { Dayjs } from "dayjs";
import { Document } from "./Document";
import { Equipment } from "./Equipment";

// Rental
export interface Rental {
    rentalId: string;
    erentionDatePlan: Dayjs;
    dismantlingDatePlan?: Dayjs | null;
    documentId: string;
    document?: Document;
    equipmentId: string;
    equipment?: Equipment
    rentalRemark?: string;
    rentalStatus: RentalStatus;
}

export const initialRental: Rental = {
    rentalId: '',
    documentId: '',
    equipmentId: '',
    rentalRemark: '',
    erentionDatePlan: dayjs(new Date()),
    dismantlingDatePlan: null,
    rentalStatus: RentalStatus.Renting,
};