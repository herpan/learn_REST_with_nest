import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarkService {

    constructor(private prisma : PrismaService){}
   
    async getBookmarks(userId : number){
        return await this.prisma.bookmark.findMany({
            where :{
                userId,
            }
        })
    }   
    async createBookmark(userId : number,dto : CreateBookmarkDto){
        const bookmark = await this.prisma.bookmark.create({
                            data : {
                                userId,
                                ...dto,
                            }
                        });
        return bookmark;
    }  
    async getBookmarkById(userId : number,bookmarkId : number){
        return await this.prisma.bookmark.findFirst({
            where :{
                userId,
                id : bookmarkId,
            }
        })
    } 
    async editBookmarkById(userId : number,bookmarkId : number,dto : EditBookmarkDto){
        const bookmark = await this.prisma.bookmark.findFirst({
            where :{
                userId,
                id : bookmarkId,
            }
        })

        if(!bookmark){
            throw new ForbiddenException('Data not found');
        }

        return this.prisma.bookmark.update({
            where : {
                id : bookmarkId,
            },
            data : {
                ...dto,
            }
        });
    }   
    async deleteBookmarkById(userId : number,bookmarkId : number){
        const bookmark = await this.prisma.bookmark.findFirst({
            where :{
                userId,
                id : bookmarkId,
            }
        })

        if(!bookmark){
            throw new ForbiddenException('Data not found');
        }

        return await this.prisma.bookmark.delete({
            where : {
                id : bookmarkId
            }
        });
    }
}
