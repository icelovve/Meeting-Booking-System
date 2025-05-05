import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RoomService } from './room.service';
import { Room } from 'src/entities/room.entity';

@Controller('room')
export class RoomController {
    constructor(private readonly roomService: RoomService) { }

    @Get()
    async allRooms() {
        return await this.roomService.allRooms();
    }

    @Get(':id')
    async findById(@Param('id') id: number) {
        return await this.roomService.findById(id);
    }

    @Post()
    async create(@Body() data: Partial<Room>) {
        return await this.roomService.create(data);
    }

    @Patch(':id')
    async update(@Param('id') id: number, @Body() data: Partial<Room>) {
        return await this.roomService.update(id, data);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return await this.roomService.remove(Number(id));
    }
}
