import { Body, Controller, Get, Patch, Post, Delete, Param } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { Booking } from 'src/entities/bookings.entity';

@Controller('bookings')
export class BookingsController {
    constructor(
        private readonly bookingsService: BookingsService
    ) { }

    @Get()
    async getAllBookings() {
        return await this.bookingsService.getAllBookings();
    }

    @Get(':id')
    async getBookingById(@Param('id') id: string) {
        return await this.bookingsService.getBookingById(Number(id));
    }


    @Post()
    async createBooking(@Body() bookingData: Partial<Booking>) {
        return await this.bookingsService.createBooking(bookingData);
    }

    @Patch(':id')
    async updateBooking(id: number, @Body() bookingData: Partial<Booking>) {
        return await this.bookingsService.updateBooking(id, bookingData);
    }

    @Delete(':id')
    async deleteBooking(@Param('id') id: string) {
        return await this.bookingsService.deleteBooking(Number(id));
    }
}
