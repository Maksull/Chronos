import { AppDataSource } from '@/database/data-source';
import { User, CalendarParticipant } from '@/entities';
import { UpdateProfileDto } from '@/types/user';

export class UserService {
    private userRepository = AppDataSource.getRepository(User);
    private participantRepository = AppDataSource.getRepository(CalendarParticipant);

    async getUserProfile(userId: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['ownedCalendars'],
        });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    async updateProfile(userId: string, updateData: UpdateProfileDto): Promise<User> {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new Error('User not found');
        }

        Object.assign(user, updateData);
        return this.userRepository.save(user);
    }
}
