import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from 'src/entities/bookings.entity';
import { Room } from 'src/entities/room.entity';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Room, User])],
  controllers: [BookingsController],
  providers: [BookingsService]
})
export class BookingsModule { }
