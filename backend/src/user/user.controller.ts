import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/entities/user.entity';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    async findAllUsers() {
        return this.userService.findAllUsers();
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.userService.findById(+id);
    }

    @Post()
    async create(@Body() data: Partial<User>) {
        return this.userService.create(data);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: Partial<User>) {
        return this.userService.update(+id, data);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.userService.remove(+id);
    }
}
