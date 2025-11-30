import { Controller, Get, Post, Body,Put, Delete, BadRequestException,Param, Res, Req, UsePipes, ValidationPipe} from '@nestjs/common';
import { MusicService } from './music.service';
import { Music, MusicDocument} from "../schema/music"
import { Response, Request } from 'express';
import axios from "axios"
import { Playlist, PlaylistDocument } from '../schema/playlist';
import { InjectModel } from '@nestjs/mongoose';
import { Model , ObjectId, Types} from 'mongoose';
import { Album, AlbumDocument } from '../schema/album';
import { Notification, NotificationDocument } from '../schema/notification';
import {User, UserDocument } from '../schema/user';


@Controller("music")
export class MusicController {
  constructor(private readonly musicService: MusicService, @InjectModel(Playlist.name) private playlistModel: Model<Playlist>,@InjectModel(User.name) private userModel: Model<UserDocument>,@InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,@InjectModel(Music.name) private musicModel: Model<MusicDocument>, @InjectModel(Album.name) private albumModel: Model<AlbumDocument>) {
    
  }
  @Get("dexuat")
  async getData() {
    const result = await this.musicService.dexuat()
    
    return result
  }
  @Get("album")
    async getAlbum() {
      const result = await this.musicService.album()

      return result
    }
  @Get("moinhat")
    async getData3() {
      const result = await this.musicService.moinhat()
      return result
    }
  
  @Get("/detail/:id") 
  async detail(@Req() req: Request) {
    const id = req.params.id
    const result = await this.musicService.detail(id)
    return result
  }
  @Get("singer/:singerId")
  async singerMusic(@Req() req: Request) {
    return this.musicService.singerMusic(req.params.singerId)
  }
  @Get('play/:id')
  async streamMusic(@Param('id') id: string, @Res() res: Response) {
    const music = await this.musicService.findById(id);
    if (!music) throw new BadRequestException('Music not found');

    const audioUrl = music.audio;

    const response = await axios.get(audioUrl, { responseType: 'stream' });
    res.setHeader('Content-Type', 'audio/mpeg');
    response.data.pipe(res);
  }
  @Post('create-playlist')
  async createPlaylist(@Req() req: Request, @Body() body: any) {
     const token = req.cookies["jwt"]
    if(!token) throw new BadRequestException("Token not found")
   
    return this.musicService.createPlaylist(body)
  }
  @Get("playlist/:userId")
  async getPlaylist(@Req() req: Request) {
    return this.musicService.getPlaylist(req.params.userId, req.query)
  }
  @Get("album/detail/:albumId") 
  async albumDetail(@Req() req: Request) {
    return this.musicService.getAlbumDetail(req.params.albumId)
  }
  @Get("album/musics/:albumId") 
  async musicListAlbum(@Req() req: Request) {
    return this.musicService.getAlbumWithMusic(req.params.albumId, req.query)
  }
  @Get('albumAddMusic/:singerId')
async getMusicListAlbum(@Req() req: Request) {
  const { search,  singerId } = req.query;
  return this.musicService.getMusicListAlbum(search, req.params.singerId );
}
  @Put('add-music/album')
async addMusicAlbum(
  @Req() req: Request
) {
  const { albumId, musicId } = req.body
  const token = req.cookies["jwt"]
  if(!token) throw new BadRequestException("Token not found")

  return this.musicService.addMusicToAlbum(albumId, musicId);
}
  @Put("remove-music/album")
    async removeMusicAlbum(@Req() req: Request) {
       const token = req.cookies["jwt"]
    if(!token) throw new BadRequestException("Token not found")
   
      const remove = await this.albumModel.findByIdAndUpdate(req.body.albumId, {
        $pull: { musicList: req.body.musicId }
      }, {
        new: true
      })
      return {data: "success"}
    }

  @Get("playlist/detail/:playlistId") 
  async playlistDetail(@Req() req: Request) {
    return this.musicService.getPlaylistDetail(req.params.playlistId)
  }
  @Get("playlist/musics/:playlistId") 
  async musicList(@Req() req: Request) {
    return this.musicService.getPlaylistWithMusic(req.params.playlistId, req.query)
  }
  @Get('playlistAddMusic')
async getMusicList(@Req() req: Request) {
  const { search  } = req.query;
  return this.musicService.getMusicList(search);
}
  @Put('add-music')
async addMusic(
  @Req() req: Request
) {
   const token = req.cookies["jwt"]
    if(!token) throw new BadRequestException("Token not found")
   
  const { playlistId, musicId } = req.body
  return this.musicService.addMusicToPlaylist(playlistId, musicId);
}

  @Put("remove-music")
  async removeMusic(@Req() req: Request) {
     const token = req.cookies["jwt"]
    if(!token) throw new BadRequestException("Token not found")
   
    const remove = await this.playlistModel.findByIdAndUpdate(req.body.playlistId, {
      $pull: { musicList: req.body.musicId }
    }, {
      new: true
    })
    return {data: "success"}
  }
  @Delete("delete-playlist")
  async deletePlaylist (@Req() req: Request) {
     const token = req.cookies["jwt"]
    if(!token) throw new BadRequestException("Token not found")
   
     const data = await this.playlistModel.deleteOne({_id: req.body._id})

     return { success: "success"}
  }

  @Put("edit-playlist") 
  async editplaylist(@Req() req: Request) {
     const token = req.cookies["jwt"]
    if(!token) throw new BadRequestException("Token not found")
   
    return this.musicService.editPlaylist(req.body._id, req.body)
  }
  @Get("user-playlist/:userId")
  async getUserPlaylist(@Req() req: Request) {
    const data = await this.playlistModel.find({userId: new Types.ObjectId(req.params.userId)
, isPublic: "public"}).populate("userId","username").sort({createdAt: -1}).limit(10).exec()
    return data
  }
  @Get("user/:type/all/:userId")
    async getUserPlaylistAll(@Req() req: Request) {
    if(req.params.type === "playlist") {
      const { page } = req.query
      const data = await this.playlistModel.find({userId: new Types.ObjectId(req.params.userId), isPublic: "public"}).populate("userId","username").sort({createdAt: -1}).skip(6 * Number(page)).limit(6).exec()
      const total = await this.playlistModel.countDocuments({userId: new Types.ObjectId(req.params.userId), isPublic: "public"})
      return {data: data, total: total}
    }
    if(req.params.type === "music") {
      const { page } = req.query
      const data = await this.musicModel.find({singerId: new Types.ObjectId(req.params.userId)}).populate("singerId","username").sort({createdAt: -1}).skip(6 * Number(page)).limit(6).exec()
      const total = await this.musicModel.countDocuments({singerId: new Types.ObjectId(req.params.userId)})
      return {data: data, total: total}
    }
      const { page } = req.query
      const data = await this.albumModel.find({singerId: new Types.ObjectId(req.params.userId)}).populate("singerId","username").sort({createdAt: -1}).skip(6 * Number(page)).limit(6).exec()
      const total = await this.albumModel.countDocuments({singerId: new Types.ObjectId(req.params.singerId)})
      return {data: data, total: total}
    }
  @Get("user-music/:userId")
  async getUserMusic(@Req() req: Request) {
    const data = await this.musicModel.find({singerId: new Types.ObjectId(req.params.userId)
}).populate("singerId","username").sort({createdAt: -1}).limit(10).exec()
    return data
  }
  @Get("user-album/:userId")
  async getUserAlbum(@Req() req: Request) {
    const data = await this.albumModel.find({singerId: new Types.ObjectId(req.params.userId)}
).populate("singerId","username").sort({createdAt: -1}).limit(10).exec()
    return data
  }
  
  @Get("section/:id")
  async getSection(@Req() req: Request) {
    if(req.params.id === "dexuat") {
      const data = await this.musicModel.aggregate([
  
  { $skip: Number(req.query.page) * 5 },
  { $limit: 5 },
  {
    $lookup: {
      from: "users",
      localField: "singerId",
      foreignField: "_id",
      as: "singerId"
    }
  },
  { $unwind: "$singerId" },
  { $project: { title: 1, image: 1, "singerId.username": 1 } }
]);
      const total = await this.musicModel.countDocuments()
      return {data: data, total: total}
    }
    if(req.params.id === "album") {
       const data = await this.albumModel.aggregate([

        { $skip: Number(req.query.page) * 5 },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "singerId",
            foreignField: "_id",
            as: "singerId"
          }
        },
        { $unwind: "$singerId" },
        { $project: { title: 1, image: 1, "singerId.username": 1 } }
      ]);
            const total = await this.albumModel.countDocuments()
            return {data: data, total: total}
    }
      const data = await this.musicModel.find().populate("singerId","username image").sort({createdAt: -1}).skip(5 * Number(req.query.page)).limit(5).exec()

      const total = await this.musicModel.countDocuments()
      return {data: data, total: total}
    
  }
  @Get("search")
  async search(@Req() req: Request) {
    const data = await this.musicService.search(req.query.search, Number(req.query.page));
    
    return data;
  }
 
  @Get("singerList/:singerId")
    async singerPanel(@Req() req: Request) {
      const data = await this.musicService.getSingerAlbumAndMusic(req.params.singerId, req.query.search, Number(req.query.page),req.query.type);

      return data;
    }
  
  @Post("like")
  async follow(@Req() req: Request) {
     const token = req.cookies["jwt"]
    if(!token) throw new BadRequestException("Token not found")
   
    return this.musicService.like(req.body.userId, req.body.likeId)
  }
  @Post("createMusicOrAlbum")
  async creating(@Req() req: Request) {
     const token = req.cookies["jwt"]
    if(!token) throw new BadRequestException("Token not found")
   
 if(req.body.role !== "singer") throw new BadRequestException("Bạn không phải là ca sĩ")
    return this.musicService.createMusicOrAlbum(req.body.singerId, req.body)
  }
  @Get("getNotification/:userId") 
  async getNotification(@Req() req: Request) {
  const data = await this.notificationModel.find({userGetId: req.params.userId}).populate({
    path: "userGiveId",
    select: "image username",
    match: { _id: { $exists: true } } 
}).skip(Number(req.query.page) * 10).limit(10).lean()

    const total = await this.notificationModel.countDocuments({userGetId: req.params.userId})
  return {data: data, total: total}
  }
  @Get("isSeen") 
  async getIsSeen(@Req() req: Request) {
    const data = await this.notificationModel.find({userGetId: req.query.userId, isSeen: false}).lean()
    return data
  }
  @Put("isSeen")
  async isSeen(@Req() req: Request) {
    const data = await this.notificationModel.findByIdAndUpdate(req.body._id, {isSeen: true}, {new: true})
    return "success"
                               }
  @Delete("deleteAlbumOrMusic") 
  async deleteMusicAndAlbum(@Req() req: Request) {
     const token = req.cookies["jwt"]
    if(!token) throw new BadRequestException("Token not found")
   
    if(req.body.role !== "singer") throw new BadRequestException("Bạn không phải là ca sĩ")
    if(req.body.type === "music") {
      const data = await this.musicModel.deleteOne({_id: req.body._id})
      return "success"
    }
    const data = await this.albumModel.deleteOne({_id: req.body._id})
    return "success"
  }
  @Delete("deleteAlbumOrMusicOrUser") 
    async deleteMusicAndAlbumAmdUser(@Req() req: Request) {
       const token = req.cookies["jwt"]
      if(!token) throw new BadRequestException("Token not found")

      if(req.body.role !== "admin") throw new BadRequestException("Bạn không phải là admin")
   return this.musicService.deleteMusicAndAlbumAndUser(req.body._id, req.body.type)
    }
  @Put("editMusicOrAlbum")
  async editMusicOrAlbum(@Req() req: Request) {
     const token = req.cookies["jwt"]
    if(!token) throw new BadRequestException("Token not found")
   
    if(req.body.role !== "singer") throw new BadRequestException("bạn ko phải là ca sĩ")
  return this.musicService.editMusicOrAlbum(req.body._id, req.body)  
  }
  @Get("musicAndAlbum") 
  async getMusicAndAlbumm(@Req() req: Request) {
    if(req.query.type === "music") {
      const data = await this.musicModel.findById(req.query._id).lean().exec()
      return data
    }
    const data = await this.albumModel.findById(req.query._id).lean().exec()
    return data
  }
  @Get("category/:category")
  async category(@Req() req: Request) {
    const data = await this.musicModel.find({category: req.params.category}).populate("singerId", "username").skip(Number(req.query.page) * 10).limit(10).lean().exec()
    const total = await this.musicModel.countDocuments({category: req.params.category})
    return { data: data, total: total}
  }
  @Get("userList")
  async userList(@Req() req: Request) { 
     const token = req.cookies["jwt"]
    if(!token) throw new BadRequestException("Token not found")
     
    if(req.query.role !== "admin") throw new BadRequestException("bạn ko phải là admin")
  if(req.query.type === "user") {
    const data = await this.userModel.find({username: {$regex: req.query.search, $options: "i"}}).skip(Number(req.query.page) * 10).limit(10).lean().exec() 
    const total = await this.userModel.countDocuments({username: {$regex: req.query.search, $options: "i"}}) 
    console.log("user", data)
    return {data: data, total: total}
      }
 if(req.query.type === "music") {
    const data = await this.musicModel.find({title: {$regex: req.query.search, $options: "i"}}).skip(Number(req.query.page) * 10).limit(10).lean().exec() 
    const total = await this.musicModel.countDocuments({title: {$regex: req.query.search, $options: "i"}}) 
    return {data: data, total: total}
 }  
    const data = await this.albumModel.find({title: {$regex: req.query.search, $options: "i"}}).skip(Number(req.query.page) * 10).limit(10).lean().exec() 
    const total = await this.albumModel.countDocuments({title: {$regex: req.query.search, $options: "i"}}) 
    return {data: data, total: total}
    
  }
}