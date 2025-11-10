import { Equipment, EquipmentQuery } from "./Equipment";


// Category
export interface Category {
  categoryId: string;
  categoryName: string;
  categoryDesc?: string | null;
  equipments: Equipment[];
  _count?: {
    equipments: number
  }
}

export interface CategoryQuery {
  categoryId: string;
  categoryName: string;
  categoryDesc?: string | null | undefined;
  equipments: EquipmentQuery[];
  _count?: {
    equipments: number
  }
}

export const initialCategory: Category = {
  categoryId: '',
  categoryName: '',
  categoryDesc: '',
  equipments: [],
};

// EquipmentType
export interface EquipmentType {
  equipmentTypeId: string;
  equipmentTypeName: string;
  equipmentTypeDesc?: string;
  equipments: Equipment[];
}

export const initialEquipmentType: EquipmentType = {
  equipmentTypeId: '',
  equipmentTypeName: '',
  equipmentTypeDesc: '',
  equipments: [],
};

export type CategorySelect = {
  categoryId: string; // ID ของหมวดหมู่
  categoryName: string; // ชื่อของหมวดหมู่
};

export type TypeSelect = {
  equipmentTypeId: string; // ID ของหมวดหมู่
  equipmentTypeName: string; // ชื่อของหมวดหมู่
};