import { INestApplication,ValidationPipe } from '@nestjs/common';
import {Test} from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';


describe('App e2e',()=>{
  let app: INestApplication;
  let prisma: PrismaService;  
  beforeAll(async ()=>{
    const moduleRef = await Test.createTestingModule({
      imports : [AppModule],
    }).compile();
      app = moduleRef.createNestApplication();
      app.useGlobalPipes(new ValidationPipe({
        whitelist : true
      }),
    );
    await app.init();
    await app.listen('3333');
    prisma = app.get(PrismaService);
    await prisma.cleanDB();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(()=>{
    app.close();
  });

  describe('Auth', ()=>{
    const dto:AuthDto={
      email:'test@gmail.com',
      password:'test',
    };

    describe('Signup',()=>{
      
      it('Should throw if email empty',()=>{       
        return pactum
              .spec()
              .post('/auth/signup')
              .withBody({
                password : dto.password,
               })
              .expectStatus(400);
      });

      it('Should throw if password empty',()=>{       
        return pactum
              .spec()
              .post('/auth/signup')
              .withBody({
                email : dto.email,
               })
              .expectStatus(400);
      });

      it('Should throw if no body',()=>{       
        return pactum
              .spec()
              .post('/auth/signup')              
              .expectStatus(400);
      });

      it('Should signup',()=>{       
        return pactum
              .spec()
              .post('/auth/signup')
              .withBody(dto)
              .expectStatus(201);
      });

      it('Should throw if cridential already taken',()=>{       
        return pactum
              .spec()
              .post('/auth/signup')
              .withBody(dto)
              .expectStatus(403);
      });

    });

    describe('Signin',()=>{

      it('Should throw if email empty',()=>{       
        return pactum
              .spec()
              .post('/auth/signin')
              .withBody({
                password : dto.password,
               })
              .expectStatus(400);
      });

      it('Should throw if password empty',()=>{       
        return pactum
              .spec()
              .post('/auth/signin')
              .withBody({
                email : dto.email,
               })
              .expectStatus(400);
      });

      it('Should throw if no body',()=>{       
        return pactum
              .spec()
              .post('/auth/signin')              
              .expectStatus(400);
      });

      it('Should throw if invalid login',()=>{       
        return pactum
              .spec()
              .post('/auth/signin')
              .withBody({
                email : 'test@gmail.com',
                password : 'false',
              })
              .expectStatus(403);
      });

      it('Should signin',()=>{       
        return pactum
              .spec()
              .post('/auth/signin')
              .withBody(dto)
              .expectStatus(200)
              .stores('userAt','access_token');
      });
    });

  });

  describe('User', ()=>{
    describe('Get me',()=>{
      it('Should get current user',()=>{
        return pactum
              .spec()
              .withBearerToken('$S{userAt}')
              .get('/users/me')              
              .expectStatus(200)              
      });
    });

    describe('Edit user',()=>{
      it('Should edit user',()=>{
        const dto : EditUserDto = {
          firstName : 'Herpan',
          lastName : 'Safari',
        }
        return pactum
              .spec()
              .withBearerToken('$S{userAt}')
              .patch('/users')
              .withBody(dto)              
              .expectStatus(200)
              .expectBodyContains(dto.firstName)
              .expectBodyContains(dto.lastName)                
        });    
    });
  });

  describe('Bookmarks', ()=>{
    describe('Get empty bookmarks',()=>{
      it('Should get empty bookmark',()=>{
        return pactum
              .spec()
              .withBearerToken('$S{userAt}')
              .get('/bookmarks')              
              .expectStatus(200)
              .expectBody([]);              
      });
    });
    describe('Create bookmark',()=>{
      it('Should create',()=>{
        const dto : CreateBookmarkDto = {
          title : "First Bookmark",
          link : "https://www.youtube.com/watch?v=IdHc5z0fkfg"
        }
        return pactum
              .spec()
              .withBearerToken('$S{userAt}')
              .post('/bookmarks')
              .withBody(dto)              
              .expectStatus(201)
              .stores('bookmarkId','id');                                        
      }); 
    });
    describe('Get bookmarks',()=>{
      it('Should get bookmarks',()=>{
        return pactum
              .spec()
              .withBearerToken('$S{userAt}')
              .get('/bookmarks')              
              .expectStatus(200)
              .expectJsonLength(1);              
      });
    });
    describe('Get bookmark by id',()=>{
      it('Should get bookmark by id',()=>{
        return pactum
              .spec()
              .withBearerToken('$S{userAt}')
              .get('/bookmarks/{id}')
              .withPathParams('id','$S{bookmarkId}')              
              .expectStatus(200)
              .expectBodyContains('$S{bookmarkId}');                           
      });
    });
    describe('Edit bookmark by id',()=>{
      it('Should edit bookmark',()=>{
        const dto : EditBookmarkDto = {
          title : "First Bookmark",
          description : "Edit Bookmark",
          link : "https://www.youtube.com/watch?v=IdHc5z0fkfg"
        }
        return pactum
              .spec()
              .withBearerToken('$S{userAt}')
              .patch('/bookmarks/{id}')
              .withPathParams('id','$S{bookmarkId}')
              .withBody(dto)              
              .expectStatus(200)
              .expectBodyContains(dto.description)
              .expectBodyContains(dto.title);
                          
      });
    });
    describe('Delete bookmark by id',()=>{
      it('Should delete bookmark',()=>{        
        return pactum
              .spec()
              .withBearerToken('$S{userAt}')
              .delete('/bookmarks/{id}')
              .withPathParams('id','$S{bookmarkId}')                         
              .expectStatus(204);              
                          
      });
     
      it('Should get empty bookmark',()=>{
        return pactum
              .spec()
              .withBearerToken('$S{userAt}')
              .get('/bookmarks')              
              .expectStatus(200)
              .expectBody([]);              
      });     
    });
  });

})