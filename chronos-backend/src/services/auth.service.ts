import { User } from '@/entities';
import { AppDataSource } from '@/database/data-source';
import { RegisterUserDto, LoginDto, ChangeEmailDto, ChangePasswordDto } from '@/types/auth';
import { hash, compare } from 'bcrypt';
import { EntityManager } from 'typeorm';
import jwt from 'jsonwebtoken';
import { EmailService } from './email.service';
import { randomBytes } from 'crypto';
import { addHours } from 'date-fns';

export class AuthService {
    private userRepository = AppDataSource.getRepository(User);
    private emailService: EmailService;

    constructor() {
        this.emailService = new EmailService();
    }

    private generateVerificationToken(): string {
        return randomBytes(32).toString('hex');
    }

    async register(registerData: RegisterUserDto, entityManager?: EntityManager): Promise<{ user: User; token: string }> {
        const repository = entityManager?.getRepository(User) || this.userRepository;

        // Check if user already exists
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
        const verificationToken = this.generateVerificationToken();

        const user = repository.create({
            ...registerData,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiresAt: addHours(new Date(), 24),
            isEmailVerified: false,
        });

        const savedUser = await repository.save(user);

        // Send verification email
        await this.emailService.sendVerificationEmail(savedUser.email, verificationToken);

        const token = this.generateToken(savedUser);
        return { user: savedUser, token };
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

    private generateToken(user: User): string {
        const payload = {
            userId: user.id,
            username: user.username,
        };

        return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
            expiresIn: '24h',
        });
    }

    async verifyEmail(token: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { verificationToken: token },
        });

        if (!user) {
            throw new Error('Invalid verification token');
        }

        if (user.isEmailVerified) {
            throw new Error('Email already verified');
        }

        if (user.verificationTokenExpiresAt != null && user.verificationTokenExpiresAt < new Date()) {
            throw new Error('Verification token has expired');
        }

        // Update user
        user.isEmailVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpiresAt = null;

        return this.userRepository.save(user);
    }

    async resendVerificationEmail(userId: string): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        if (user.isEmailVerified) {
            throw new Error('Email already verified');
        }

        // Generate new verification token
        user.verificationToken = this.generateVerificationToken();
        user.verificationTokenExpiresAt = addHours(new Date(), 24);

        await this.userRepository.save(user);

        // Send new verification email
        await this.emailService.sendVerificationEmail(user.email, user.verificationToken);
    }

    async changePassword(userId: string, data: ChangePasswordDto): Promise<void> {
        const user = await this.userRepository.findOneBy({ id: userId });

        if (!user) {
            throw new Error('User not found');
        }

        // Verify current password
        const isPasswordValid = await compare(data.currentPassword, user.password);
        if (!isPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        // Hash new password
        const hashedPassword = await hash(data.newPassword, 10);
        user.password = hashedPassword;

        await this.userRepository.save(user);
    }

    async initiateEmailChange(userId: string, data: ChangeEmailDto): Promise<void> {
        const user = await this.userRepository.findOneBy({ id: userId });

        if (!user) {
            throw new Error('User not found');
        }

        // Verify password
        const isPasswordValid = await compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Password is incorrect');
        }

        // Check if new email is already in use
        const existingUser = await this.userRepository.findOne({
            where: { email: data.newEmail },
        });

        if (existingUser) {
            throw new Error('Email already in use');
        }

        // Generate verification token for new email
        const verificationToken = this.generateVerificationToken();

        user.newEmail = data.newEmail;
        user.emailChangeToken = verificationToken;
        user.emailChangeTokenExpiresAt = addHours(new Date(), 24);

        await this.userRepository.save(user);

        // Send verification email to new email address
        await this.emailService.sendEmailChangeVerification(data.newEmail, verificationToken);
    }

    async confirmEmailChange(token: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { emailChangeToken: token },
        });

        if (!user) {
            throw new Error('Invalid verification token');
        }

        if (!user.newEmail || !user.emailChangeTokenExpiresAt) {
            throw new Error('No email change was requested');
        }

        if (user.emailChangeTokenExpiresAt < new Date()) {
            throw new Error('Verification token has expired');
        }

        // Update email
        user.email = user.newEmail;
        user.newEmail = null;
        user.emailChangeToken = null;
        user.emailChangeTokenExpiresAt = null;

        return this.userRepository.save(user);
    }
}
