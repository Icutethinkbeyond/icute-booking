import { CategorySelect } from "@/interfaces/Category";
import { PrismaClient, Category } from "@prisma/client";

const prisma = new PrismaClient();

export interface Pagination {
  data: {
    rowIndex: number;
    categoryId: string;
    createdAt: Date;
    updatedAt: Date;
    categoryName: string;
    categoryDesc: string | null;
  }[],
  pagination: {
    page: number,
    pageSize: number,
    totalItems: number,
    totalPages: number,
  }
}

class CategoryService {

  async getCategorySelect(): Promise<CategorySelect[] | null> {
    return await prisma.category.findMany({
      select: {
        categoryId: true,
        categoryName: true,
      }
    });
  }

  async getCategoryById(categoryId: string): Promise<Category | null> {
    return await prisma.category.findUnique({
      where: {
        categoryId,
      },
      include: {
        equipments: true, // ดึงข้อมูล equipments ที่เชื่อมโยงด้วย
      },
    });
  }

  async deleteCategory(categoryId: string): Promise<Category> {
    return await prisma.category.delete({
      where: { categoryId },
    });
  }


  async getCategoryPagination(pageParam: null | string, pageSizeParam: null | string, categoryName?: string | null): Promise<Pagination> {

    const page = parseInt(pageParam || '1', 10); // หน้าเริ่มต้นที่ 1
    const pageSize = parseInt(pageSizeParam || '10', 10); // จำนวนข้อมูลต่อหน้าเริ่มต้นที่ 10

    // คำนวณ skip และ take
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [categories, totalItems] = await Promise.all([
      prisma.category.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' }, // เรียงลำดับตามวันที่สร้าง
        where: {
          ...(categoryName && { categoryName: { contains: categoryName, mode: "insensitive" } }),
        }
      }),
      prisma.category.count(), // นับจำนวนทั้งหมดของรายการ
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);

    // เพิ่ม rowIndex ในข้อมูลแต่ละแถว
    const categoriesWithIndex = categories.map((category, index) => ({
      ...category,
      rowIndex: skip + index + 1, // ลำดับแถวเริ่มต้นจาก 1 และเพิ่มตาม pagination
    }));

    return {
      data: categoriesWithIndex,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    }
  }

  async createCategory(data: Omit<Category, "categoryId" | "createdAt" | "updatedAt" | "equipments">): Promise<Category> {
    return await prisma.category.create({
      data,
    });
  }

  async chaeckNameAlready(categoryName: string): Promise<Category | null> {
    return await prisma.category.findFirst({ where: { categoryName: { equals: categoryName } } })
  }


  async updateCategory(categoryId: string, data: Partial<Category>): Promise<Category> {
    return await prisma.category.update({
      where: { categoryId },
      data,
    });
  }


}

export default CategoryService;
