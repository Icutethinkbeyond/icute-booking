import { NextRequest, NextResponse } from 'next/server';
import { Category, PrismaClient } from '@prisma/client';
// import { Category } from '@/interfaces/Category_Type';
import CategoryService, { Pagination } from '@/utils/services/database-services/CategoryService';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {

        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get('categoryId');
        const page = searchParams.get('page');
        const pageSize = searchParams.get('pageSize');
        const selectCategory = searchParams.get('selectCategory');

        let category;
        let categoryService = new CategoryService();

        if (Boolean(selectCategory)) {

            category = await categoryService.getCategorySelect()

            if (!category) {
                return new NextResponse(JSON.stringify('Category not found'), { status: 404 });
            }

            return new NextResponse(JSON.stringify({ data: category }), { status: 200 });
        } else if (categoryId) {
            // ค้นหา category ตาม ID

            category = await categoryService.getCategoryById(categoryId)

            if (!category) {
                return new NextResponse(JSON.stringify('Category not found'), { status: 404 });
            }

            return new NextResponse(JSON.stringify({ data: category }), { status: 200 });

        } else {

            let data: Pagination = await categoryService.getCategoryPagination(page, pageSize)

            return new NextResponse(
                JSON.stringify(data),
                { status: 200 }
            );
        }
    } catch (error) {

        console.error("Error Connect Local Server:", error);
        return new NextResponse(JSON.stringify({ error }), { status: 500 });

    }
}

export async function POST(req: NextRequest, res: NextResponse) {

    try {

        // const data = await req.json() as Category;

        const { categoryDesc, categoryName } = await req.json() as Category;

        let categoryService = new CategoryService();

        // Validation
        if (!categoryName) { return new NextResponse(JSON.stringify('Category name is required'), { status: 400 }); }

        //check name is exist
        const nameIsAlready = await categoryService.chaeckNameAlready(categoryName)

        if (nameIsAlready) { return new NextResponse(JSON.stringify('Category name is Already'), { status: 400 }); }

        let newCategory = categoryService.createCategory({ categoryDesc, categoryName })

        return new NextResponse(JSON.stringify({ newCategory, message: "สร้างหมวดหมู่สำเร็จ" }), { status: 201 });

    } catch (error) {

        console.error("Error Connect Local Server:", error);
        return new NextResponse(JSON.stringify({ error }), { status: 500 });

    }

};

export async function DELETE(req: NextRequest) {

    try {
        // รับ categoryId จาก query parameter
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get('categoryId');

        let categoryService = new CategoryService();

        // ตรวจสอบว่ามี categoryId หรือไม่
        if (!categoryId) {
            return new NextResponse(JSON.stringify('Category ID is required'), { status: 400 });
        }

        let deletedCategory = categoryService.deleteCategory(categoryId)

        return new NextResponse(JSON.stringify({ deletedCategory, message: "ลบหมวดหมู่สำเร็จ" }), { status: 200 });

    } catch (error: any) {

        console.error('Error deleting category:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });

    }
}

export async function PATCH(req: NextRequest) {

    try {

        const { categoryId, categoryName, categoryDesc } = await req.json() as Category;

        if (!(categoryId && categoryName)) {
            return new NextResponse(JSON.stringify('Category ID is required'), { status: 400 });
        }

        //check name is exist
        const nameIsAlready = await prisma.category.findFirst({ where: { categoryName: { equals: categoryName } } })

        if (nameIsAlready && nameIsAlready.categoryId !== categoryId) {
            return new NextResponse(JSON.stringify('Category name is Already'), { status: 400 });
        }

        const updatedCategory = await prisma.category.update({
            where: { categoryId: categoryId },
            data: {
                categoryName, categoryDesc
            },
            // Update fields based on the request body
        });

        return new NextResponse(JSON.stringify(updatedCategory), { status: 200 });

    } catch (error: any) {

        console.error('Error updating category:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
        
    } 
}