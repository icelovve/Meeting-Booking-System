import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from 'src/entities/bookings.entity';
import { Room } from 'src/entities/room.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BookingsService {
    constructor(
        @InjectRepository(Booking)
        private bookingRepo: Repository<Booking>,

        @InjectRepository(User)
        private userRepo: Repository<User>,

        @InjectRepository(Room)
        private roomRepo: Repository<Room>,
    ) { }


    async getAllBookings() {
        const bookings = await this.bookingRepo.find({});
        if (bookings.length === 0) {
            return { message: 'No bookings found' };
        }

        return { message: 'Bookings retrieved successfully', bookings };
    }

    async getBookingById(id: number) {
        const booking = await this.bookingRepo.findOne({
            where: { id },
        });

        if (!booking) {
            return { message: 'Booking not found' };
        }

        const user = await this.userRepo.findOne({ where: { id: booking.userId } });
        const room = await this.roomRepo.findOne({ where: { id: booking.roomId } });

        return {
            message: 'Booking retrieved successfully',
            booking: {
                ...booking,
                user,
                room,
            },
        };
    }

    async createBooking(bookingData: Partial<Booking>) {
        const overlappingBooking = await this.bookingRepo.createQueryBuilder('booking')
            .where('booking.roomId = :roomId', { roomId: bookingData.roomId })
            .andWhere('booking.bookingDate = :bookingDate', { bookingDate: bookingData.bookingDate })
            .andWhere(`
                (booking.startTime < :endTime AND booking.endTime > :startTime)
            `, {
                startTime: bookingData.startTime,
                endTime: bookingData.endTime,
            })
            .getOne();

        if (overlappingBooking) {
            return { message: 'This room is already booked during the selected time' };
        }

        const newBooking = this.bookingRepo.create(bookingData);
        await this.bookingRepo.save(newBooking);
        return { message: 'Booking created successfully', booking: newBooking };
    }

    async updateBooking(id: number, bookingData: Partial<Booking>) {
        const booking = await this.bookingRepo.findOne({ where: { id } });
        if (!booking) {
            return { message: 'Booking not found' };
        }

        const overlappingBooking = await this.bookingRepo.createQueryBuilder('booking')
            .where('booking.roomId = :roomId', { roomId: bookingData.roomId ?? booking.roomId })
            .andWhere('booking.bookingDate = :bookingDate', { bookingDate: bookingData.bookingDate ?? booking.bookingDate })
            .andWhere(`
                (booking.startTime < :endTime AND booking.endTime > :startTime)
            `, {
                startTime: bookingData.startTime ?? booking.startTime,
                endTime: bookingData.endTime ?? booking.endTime,
            })
            .andWhere('booking.id != :id', { id })
            .getOne();

        if (overlappingBooking) {
            return { message: 'This room is already booked during the selected time' };
        }

        await this.bookingRepo.update(id, bookingData);
        return { message: 'Booking updated successfully', booking: { ...booking, ...bookingData } };
    }

    async deleteBooking(id: number) {
        const booking = await this.bookingRepo.findOne({ where: { id } });
        if (!booking) {
            return { message: 'Booking not found' };
        }

        await this.bookingRepo.delete(id);
        return { message: 'Booking deleted successfully' };
    }
}
