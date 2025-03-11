import { FastifyRequest, FastifyReply } from 'fastify';
import { CategoryService } from '@/services';

export class CategoryController {
    private categoryService: CategoryService;

    constructor() {
        this.categoryService = new CategoryService();
    }

    async getCategories(request: FastifyRequest<{ Params: { calendarId: string } }>, reply: FastifyReply) {
        try {
            const categories = await this.categoryService.getCategoriesByCalendarId(request.user!.userId, request.params.calendarId);
            return reply.send({ status: 'success', data: categories });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Calendar not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Not authorized') {
                    return reply.status(403).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    async getCategoryById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const category = await this.categoryService.getCategoryById(request.user!.userId, request.params.id);
            return reply.send({ status: 'success', data: category });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Category not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Not authorized') {
                    return reply.status(403).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    async createCategory(
        request: FastifyRequest<{
            Params: { calendarId: string };
            Body: { name: string; description?: string; color?: string };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const category = await this.categoryService.createCategory(request.user!.userId, request.params.calendarId, request.body);
            return reply.status(201).send({ status: 'success', data: category });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Calendar not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Not authorized') {
                    return reply.status(403).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    async updateCategory(
        request: FastifyRequest<{
            Params: { id: string };
            Body: { name?: string; description?: string; color?: string };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const category = await this.categoryService.updateCategory(request.user!.userId, request.params.id, request.body);
            return reply.send({ status: 'success', data: category });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Category not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Not authorized') {
                    return reply.status(403).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    async deleteCategory(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            await this.categoryService.deleteCategory(request.user!.userId, request.params.id);
            return reply.send({ status: 'success', message: 'Category deleted successfully' });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Category not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Not authorized') {
                    return reply.status(403).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Cannot delete category with associated events') {
                    return reply.status(400).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }
}
