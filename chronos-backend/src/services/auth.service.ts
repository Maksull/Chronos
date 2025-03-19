import { User } from '@/entities';
import { AppDataSource } from '@/database/data-source';
import { RegisterUserDto, LoginDto, ChangeEmailDto, ChangePasswordDto } from '@/types/auth';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { addMinutes } from 'date-fns';
import { TokenBlacklist } from '@/middlewares/auth.middleware';
import { CalendarService, EmailService } from '.';

export class AuthService {
    private userRepository = AppDataSource.getRepository(User);
    private emailService: EmailService;
    private calendarService: CalendarService;

    constructor() {
        this.emailService = new EmailService();
        this.calendarService = new CalendarService();
    }

    private generateVerificationCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async register(registerData: RegisterUserDto): Promise<{ user: User; token: string }> {
        const repository = this.userRepository;
        const existingUser = await repository.findOne({
            where: [{ email: registerData.email }, { username: registerData.username }],
        });

        if (existingUser) {
            if (existingUser.email === registerData.email) {
                throw new Error('Email already registered');
            }
            throw new Error('Username already taken');
        }

        const hashedPassword = await hash(registerData.password, 10);
        const verificationCode = this.generateVerificationCode();

        const user = repository.create({
            ...registerData,
            password: hashedPassword,
            verificationCode,
            verificationCodeExpiresAt: addMinutes(new Date(), 15),
            isEmailVerified: false,
        });

        const savedUser = await repository.save(user);

        // Create personal calendar for the user
        await this.createPersonalCalendar(savedUser.id);

        await this.emailService.sendVerificationEmail(savedUser.email, verificationCode);

        const token = this.generateToken(savedUser);
        return { user: savedUser, token };
    }

    private async createPersonalCalendar(userId: string): Promise<void> {
        try {
            await this.calendarService.createPersonalCalendar(userId);
        } catch (error) {
            console.error('Failed to create personal calendar:', error);
            // Not throwing here to avoid breaking the registration process
            // We could implement a background retry mechanism if needed
        }
    }

    async login(loginData: LoginDto): Promise<{ user: User; token: string }> {
        const user = await this.userRepository.findOne({
            where: { username: loginData.username },
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await compare(loginData.password, user.password);

        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        // Add email verification check
        if (!user.isEmailVerified) {
            throw new Error('Email not verified');
        }

        const token = this.generateToken(user);

        return { user, token };
    }

    async logout(token: string) {
        TokenBlacklist.add(token);
        return { message: 'Successfully logged out' };
    }

    private generateToken(user: User): string {
        const payload = {
            userId: user.id,
            username: user.username,
        };

        return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
            expiresIn: '24h',
        });
    }

    async verifyEmail(code: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { verificationCode: code },
        });

        if (!user) {
            throw new Error('Invalid verification code');
        }

        if (user.isEmailVerified) {
            throw new Error('Email already verified');
        }

        if (user.verificationCodeExpiresAt && user.verificationCodeExpiresAt < new Date()) {
            throw new Error('Verification code has expired');
        }

        user.isEmailVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpiresAt = null;

        return this.userRepository.save(user);
    }

    async initiateEmailChange(userId: string, data: ChangeEmailDto): Promise<void> {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new Error('User not found');
        }

        const isPasswordValid = await compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Password is incorrect');
        }

        const existingUser = await this.userRepository.findOne({
            where: { email: data.newEmail },
        });

        if (existingUser) {
            throw new Error('Email already in use');
        }

        const verificationCode = this.generateVerificationCode();
        user.newEmail = data.newEmail;
        user.emailChangeCode = verificationCode;
        user.emailChangeCodeExpiresAt = addMinutes(new Date(), 15);

        await this.userRepository.save(user);
        await this.emailService.sendEmailChangeVerification(data.newEmail, verificationCode);
    }

    async confirmEmailChange(code: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { emailChangeCode: code },
        });

        if (!user) {
            throw new Error('Invalid verification code');
        }

        if (!user.newEmail || !user.emailChangeCodeExpiresAt) {
            throw new Error('No email change was requested');
        }

        if (user.emailChangeCodeExpiresAt < new Date()) {
            throw new Error('Verification code has expired');
        }

        user.email = user.newEmail;
        user.newEmail = null;
        user.emailChangeCode = null;
        user.emailChangeCodeExpiresAt = null;

        return this.userRepository.save(user);
    }

    // async resendVerificationEmail(userId: string): Promise<void> {
    //     const user = await this.userRepository.findOne({
    //         where: { id: userId },
    //     });

    //     if (!user) {
    //         throw new Error('User not found');
    //     }

    //     if (user.isEmailVerified) {
    //         throw new Error('Email already verified');
    //     }

    //     // Generate new verification token
    //     user.verificationToken = this.generateVerificationToken();
    //     user.verificationTokenExpiresAt = addHours(new Date(), 24);

    //     await this.userRepository.save(user);

    //     // Send new verification email
    //     await this.emailService.sendVerificationEmail(user.email, user.verificationToken);
    // }

    async changePassword(userId: string, data: ChangePasswordDto): Promise<void> {
        const user = await this.userRepository.findOneBy({ id: userId });

        if (!user) {
            throw new Error('User not found');
        }

        const isPasswordValid = await compare(data.currentPassword, user.password);
        if (!isPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        const hashedPassword = await hash(data.newPassword, 10);
        user.password = hashedPassword;

        await this.userRepository.save(user);
    }

    async resetPassword(email: string): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { email },
        });

        if (!user) {
            throw new Error('User not found');
        }

        const resetCode = this.generateVerificationCode();
        user.resetPasswordToken = resetCode;
        user.resetPasswordTokenExpiresAt = addMinutes(new Date(), 15);

        await this.userRepository.save(user);

        await this.emailService.sendResetPasswordEmail(user.email, resetCode);
    }

    async resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { resetPasswordToken: token },
        });

        await this.checkResetToken(token);

        await this.setNewPassword(user, newPassword);
    }

    async checkResetToken(token: string): Promise<boolean> {
        const user = await this.userRepository.findOne({
            where: { resetPasswordToken: token },
        });

        if (!user) {
            throw new Error('Invalid reset password token');
        }

        if (user.resetPasswordTokenExpiresAt && user.resetPasswordTokenExpiresAt < new Date()) {
            throw new Error('Reset password token has expired');
        }

        return true;
    }

    async setNewPassword(user: any, newPassword: string): Promise<void> {
        const hashedPassword = await hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordTokenExpiresAt = null;

        await this.userRepository.save(user);
    }
}
