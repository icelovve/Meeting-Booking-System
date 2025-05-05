import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    async login(id_number: string, phone: string) {
        const user = await this.userRepo.findOne({ where: { id_number, phone } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const payload = { id: user.id, id_number: user.id_number };

        try {
            const token = await this.jwtService.signAsync(payload);
            return {
                access_token: token,
                role: user.role,
            };
        } catch (error) {
            throw new InternalServerErrorException('Error signing token');
        }
    }


}
