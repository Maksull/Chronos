import { FastifyInstance } from 'fastify';
import { authenticateToken } from '@/middlewares/auth.middleware';
import { CategoryController } from '@/controllers';

interface CategoryParams {
    id: string;
}

interface CalendarParams {
    calendarId: string;
}

interface CreateCategoryBody {
    name: string;
    description?: string;
    color?: string;
}

interface UpdateCategoryBody {
    name?: string;
    description?: string;
    color?: string;
}

const getCategoriesSchema = {
    params: {
        type: 'object',
        required: ['calendarId'],
        properties: {
            calendarId: { type: 'string', format: 'uuid' },
        },
    },
} as const;

const getCategorySchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' },
        },
    },
} as const;

const createCategorySchema = {
    params: {
        type: 'object',
        required: ['calendarId'],
        properties: {
            calendarId: { type: 'string', format: 'uuid' },
        },
    },
    body: {
        type: 'object',
        required: ['name'],
        properties: {
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            color: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$', nullable: true },
        },
    },
} as const;

const updateCategorySchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' },
        },
    },
    body: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            color: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$', nullable: true },
        },
    },
} as const;

const deleteCategorySchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' },
        },
    },
} as const;

export async function categoryRoutes(app: FastifyInstance) {
    const categoryController = new CategoryController();

    app.get<{ Params: CalendarParams }>(
        '/calendars/:calendarId/categories',
        { schema: getCategoriesSchema, preHandler: [authenticateToken] },
        categoryController.getCategories.bind(categoryController),
    );

    app.get<{ Params: CategoryParams }>(
        '/categories/:id',
        { schema: getCategorySchema, preHandler: [authenticateToken] },
        categoryController.getCategoryById.bind(categoryController),
    );

    app.post<{ Params: CalendarParams; Body: CreateCategoryBody }>(
        '/calendars/:calendarId/categories',
        { schema: createCategorySchema, preHandler: [authenticateToken] },
        categoryController.createCategory.bind(categoryController),
    );

    app.put<{ Params: CategoryParams; Body: UpdateCategoryBody }>(
        '/categories/:id',
        { schema: updateCategorySchema, preHandler: [authenticateToken] },
        categoryController.updateCategory.bind(categoryController),
    );

    app.delete<{ Params: CategoryParams }>(
        '/categories/:id',
        { schema: deleteCategorySchema, preHandler: [authenticateToken] },
        categoryController.deleteCategory.bind(categoryController),
    );
}
