import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from 'src/entities/room.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoomService {
    constructor(
        @InjectRepository(Room)
        private roomRepo: Repository<Room>
    ) { }

    async allRooms() {
        const room = await this.roomRepo.find();
        if (!room || room.length === 0) {
            throw new NotFoundException('No rooms found');
        }

        await this.roomRepo.find();
        return { message: 'Rooms found successfully', room };
    }

    async findById(id: number) {
        const room = await this.roomRepo.findOneBy({ id });
        if (!room) {
            throw new NotFoundException('Room not found');
        }

        await this.roomRepo.findOneBy({ id });
        return { message: 'Room found successfully', room };
    }

    async create(data: Partial<Room>) {
        const room = this.roomRepo.create(data);
        if (!room) {
            throw new NotFoundException('Room already exists with this name');
        }

        await this.roomRepo.save(room);
        return {
            message: 'Room created successfully',
            room
        }
    }

    async update(id: number, data: Partial<Room>) {
        const room = await this.roomRepo.findOneBy({ id });
        if (!room) {
            throw new NotFoundException('Room not found');
        }

        await this.roomRepo.update(id, data);
        return {
            message: 'Room updated successfully',
            room: await this.roomRepo.findOneBy({ id })
        };
    }

    async remove(id: number) {
        const room = await this.roomRepo.findOneBy({ id });
        if (!room) {
            throw new NotFoundException('Room not found');
        }

        await this.roomRepo.delete(id);
        return {
            message: 'Room deleted successfully',
            room
        };
    }
}