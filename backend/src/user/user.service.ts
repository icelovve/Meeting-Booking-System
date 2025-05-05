import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>
    ) { }

    async findAllUsers() {
        const users = await this.userRepo.find();
        if (!users || users.length === 0) {
            throw new NotFoundException('No users found');
        }

        return { message: 'Users found successfully', users };
    }

    async findById(id: number) {
        const user = await this.userRepo.findOneBy({ id });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return { message: 'User found successfully', user };
    }

    async create(data: Partial<User>) {
        try {
            const existingUser = await this.userRepo.findOne({
                where: [
                    { id_number: data.id_number },
                    { phone: data.phone }
                ]
            });

            if (existingUser) {
                throw new ConflictException('User already exists with this id_number or phone');
            }

            const user = this.userRepo.create(data);
            await this.userRepo.save(user);
            return {
                message: 'User created successfully',
                user
            }
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            } else {
                throw new BadRequestException('Error creating user');
            }
        }
    }

    async update(id: number, data: Partial<User>) {
        const user = await this.userRepo.findOneBy({ id });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.userRepo.update(id, data);
        return {
            message: 'User updated successfully',
            user: await this.userRepo.findOneBy({ id })
        };
    }

    async remove(id: number) {
        const user = await this.userRepo.findOneBy({ id });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const totalUsers = await this.userRepo.count();
        if (totalUsers <= 1) {
            throw new BadRequestException('ไม่สามารถลบผู้ใช้งานคนสุดท้ายได้');
        }

        await this.userRepo.delete(id);
        return {
            message: 'User deleted successfully',
            user
        };
    }
}
