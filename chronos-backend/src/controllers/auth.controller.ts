import { FastifyRequest, FastifyReply } from 'fastify';
import { RegisterUserDto, LoginDto, ChangeEmailDto, ChangePasswordDto } from '@/types/auth';
import { AuthService } from '@/services';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    async register(request: FastifyRequest<{ Body: RegisterUserDto }>, reply: FastifyReply) {
        try {
            const { user, token } = await this.authService.register(request.body);

            // Remove password from response
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...userWithoutPassword } = user;

            return reply.status(201).send({
                status: 'success',
                data: {
                    user: userWithoutPassword,
                    token,
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Email already registered' || error.message === 'Username already taken') {
                    return reply.status(409).send({
                        status: 'error',
                        message: error.message,
                    });
                }
            }

            request.log.error(error);
            return reply.status(500).send({
                status: 'error',
                message: 'Internal server error',
            });
        }
    }

    async login(request: FastifyRequest<{ Body: LoginDto }>, reply: FastifyReply) {
        try {
            const { user, token } = await this.authService.login(request.body);

            // Remove password from response
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...userWithoutPassword } = user;

            return reply.send({
                status: 'success',
                data: {
                    user: userWithoutPassword,
                    token,
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Invalid credentials') {
                    return reply.status(401).send({
                        status: 'error',
                        message: 'Invalid username or password',
                    });
                }
                if (error.message === 'Email not verified') {
                    return reply.status(403).send({
                        status: 'error',
                        message: 'Please verify your email before logging in',
                    });
                }
            }

            request.log.error(error);
            return reply.status(500).send({
                status: 'error',
                message: 'Internal server error',
            });
        }
    }

    async logout(request: FastifyRequest, reply: FastifyReply) {
        try {
            // Log the headers for debugging
            console.log('Request headers:', request.headers);
    
            const token = request.headers.authorization?.split(' ')[1];
     
            if (!token) {
                return reply.status(400).send({
                    status: 'error',
                    message: 'No token provided',
                });
            }
     
            await this.authService.logout(token);
     
            return reply.send({
                status: 'success',
                message: 'Logged out successfully',
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                status: 'error',
                message: 'Internal server error',
            });
        }
    }
    
    
    // Update your request type to accept the code in the body
    async verifyEmail(request: FastifyRequest<{ Body: { code: string } }>, reply: FastifyReply) {
        try {
            const { code } = request.body;
            await this.authService.verifyEmail(code);
            return reply.send({ status: 'success', message: 'Email verified successfully' });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Invalid verification code' || error.message === 'Verification code has expired') {
                    return reply.status(400).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Email already verified') {
                    return reply.status(409).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    // async resendVerification(request: FastifyRequest, reply: FastifyReply) {
    //     try {
    //         await this.authService.resendVerificationEmail(request.user!.userId);

    //         return reply.send({
    //             status: 'success',
    //             message: 'Verification email sent successfully',
    //         });
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             if (error.message === 'Email already verified') {
    //                 return reply.status(409).send({
    //                     status: 'error',
    //                     message: error.message,
    //                 });
    //             }
    //             if (error.message === 'User not found') {
    //                 return reply.status(404).send({
    //                     status: 'error',
    //                     message: error.message,
    //                 });
    //             }
    //         }

    //         request.log.error(error);
    //         return reply.status(500).send({
    //             status: 'error',
    //             message: 'Internal server error',
    //         });
    //     }
    // }

    async changePassword(request: FastifyRequest<{ Body: ChangePasswordDto }>, reply: FastifyReply) {
        try {
            await this.authService.changePassword(request.user!.userId, request.body);

            return reply.send({
                status: 'success',
                message: 'Password changed successfully',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Current password is incorrect') {
                    return reply.status(400).send({
                        status: 'error',
                        message: error.message,
                    });
                }
                if (error.message === 'User not found') {
                    return reply.status(404).send({
                        status: 'error',
                        message: error.message,
                    });
                }
            }

            request.log.error(error);
            return reply.status(500).send({
                status: 'error',
                message: 'Internal server error',
            });
        }
    }

    async resetPassword(request: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply) {
        try {
            await this.authService.resetPassword(request.body.email);
            return reply.send({
                status: 'success',
                message: 'Reset password email sent',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'User not found') {
                    return reply.status(404).send({
                        status: 'error',
                        message: error.message,
                    });
                }
            }
    
            request.log.error(error);
            return reply.status(500).send({
                status: 'error',
                message: 'Internal server error',
            });
        }
    }
    

    async initiateEmailChange(request: FastifyRequest<{ Body: ChangeEmailDto }>, reply: FastifyReply) {
        try {
            await this.authService.initiateEmailChange(request.user!.userId, request.body);

            return reply.send({
                status: 'success',
                message: 'Verification email sent to new email address',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Password is incorrect') {
                    return reply.status(400).send({
                        status: 'error',
                        message: error.message,
                    });
                }
                if (error.message === 'Email already in use') {
                    return reply.status(409).send({
                        status: 'error',
                        message: error.message,
                    });
                }
                if (error.message === 'User not found') {
                    return reply.status(404).send({
                        status: 'error',
                        message: error.message,
                    });
                }
            }

            request.log.error(error);
            return reply.status(500).send({
                status: 'error',
                message: 'Internal server error',
            });
        }
    }
    
    async checkResetToken(request: FastifyRequest<{ Body: { token: string } }>, reply: FastifyReply) {
        try {
            await this.authService.checkResetToken(request.body.token);
    
            return reply.send({
                status: 'success',
                message: 'Reset token is valid',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Invalid reset password token' || error.message === 'Reset password token has expired') {
                    return reply.status(400).send({
                        status: 'error',
                        message: error.message,
                    });
                }
            }
    
            request.log.error(error);
            return reply.status(500).send({
                status: 'error',
                message: 'Internal server error',
            });
        }
    }

    
    async resetPasswordWithToken(request: FastifyRequest<{ Body: { token: string; newPassword: string } }>, reply: FastifyReply) {
        try {
            await this.authService.resetPasswordWithToken(request.body.token, request.body.newPassword);
            return reply.send({
                status: 'success',
                message: 'Password reset successfully',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Invalid reset password token' || error.message === 'Reset password token has expired') {
                    return reply.status(400).send({
                        status: 'error',
                        message: error.message,
                    });
                }
            }
    
            request.log.error(error);
            return reply.status(500).send({
                status: 'error',
                message: 'Internal server error',
            });
        }
    }
    

    async confirmEmailChange(request: FastifyRequest<{ Querystring: { token: string } }>, reply: FastifyReply) {
        try {
            await this.authService.confirmEmailChange(request.query.token);

            return reply.send({
                status: 'success',
                message: 'Email changed successfully',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (
                    error.message === 'Invalid verification token' ||
                    error.message === 'No email change was requested' ||
                    error.message === 'Verification token has expired'
                ) {
                    return reply.status(400).send({
                        status: 'error',
                        message: error.message,
                    });
                }
            }

            request.log.error(error);
            return reply.status(500).send({
                status: 'error',
                message: 'Internal server error',
            });
        }
    }
}
