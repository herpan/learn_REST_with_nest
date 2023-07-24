import { Body, Controller,Get, Patch,UseGuards } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import {Request} from 'express'
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
    constructor(private userService:UserService){}

    @Get('me')
    getMe(@GetUser() user:User){  
        return user;
    }

    @Patch()
    editUser(
     @GetUser('id') UserId:number,
     @Body() dto: EditUserDto
    ){
        return this.userService.editUser(UserId,dto);
    }
}
