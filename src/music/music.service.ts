import { Injectable, BadRequestException, Inject} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from "mongodb"
import { Types } from 'mongoose';
import { Music, MusicDocument } from '../schema/music';
import { JwtService } from "@nestjs/jwt"
import { Playlist, PlaylistDocument } from '../schema/playlist';
import { CloudinaryService } from "../cloudinary/cloudinary.service"
import { Album, AlbumDocument } from '../schema/album';
import {User, UserDocument } from '../schema/user';

import { Notification, NotificationDocument } from '../schema/notification';

@Injectable()
  
export class MusicService {
  constructor(@InjectModel(Music.name) private musicModel: Model<MusicDocument>,@InjectModel(Album.name) private albumModel: Model<AlbumDocument>,@InjectModel(User.name) private userModel: Model<UserDocument>,@InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>, private jwtService: JwtService, @InjectModel(Playlist.name) private playlistModel: Model<Playlist>, private readonly cloudinaryService: CloudinaryService ) {
    
  }

  async dexuat() : Promise<Music[]> {
    const data = await this.musicModel.aggregate([
  { $sample: { size: 10 } }, 
  {
    $lookup: {
      from: "users",
      localField: "singerId",
      foreignField: "_id",
      as: "singerId"
    }
  },
  {
    $unwind: "$singerId" 
  },
  {
    $project: {
      title: 1,
      image: 1,
      "singerId.username": 1,     }
  }
]);
    return data
  }
  async album(){
    const data = await this.albumModel.aggregate([
  { $sample: { size: 10 } }, 
  {
    $lookup: {
      from: "users",
      localField: "singerId",
      foreignField: "_id",
      as: "singerId"
    }
  },
  {
    $unwind: "$singerId" 
  },
  {
    $project: {
      title: 1,
      image: 1,
      "singerId.username": 1,     }
  }
  ]);
    return data
  }
  async moinhat() : Promise<Music[]> {

    const data = await this.musicModel.find().sort({createdAt: -1}).populate("singerId","username").limit(10).lean().exec() 
    return data
  }
  async editMusicOrAlbum(id: string, body: any) {
    console.log("body", body)
    const result = await this.cloudinaryService.uploadImage(body.image)
      if(body.type === "music") {
      const data = await this.musicModel.findByIdAndUpdate(id,{ title: body.title, image: result.secure_url, category: body.category}, {new: true} )
        return "success"
    }
        const data = await this.albumModel.findByIdAndUpdate(id, { title: body.title, image: result.secure_url}, {new: true} )
        return "success"          
  }
  async detail (id: string) {
    const data = await this.musicModel.findById(id).populate("singerId", "username image").lean().exec()
    return data
  }
  async singerMusic(id: string) {
    const data = await this.musicModel.find({singerId: new Types.ObjectId(id)}).limit(10).exec()
    return data
  }
  async findById(id: string) {
    return this.musicModel.findById(id).exec()
  }
  async getPlaylistWithMusic(playlistId: string, query: any) {
  const { page, limit, search  } = query;

  const playlist = await this.playlistModel.findById(playlistId).populate('musicList');

  if (!playlist) throw new Error('Playlist không tồn tại');

  const filteredMusic = search
    ? playlist.musicList.filter(m =>
        m.title.toLowerCase().includes(search.toLowerCase())
      )
    : playlist.musicList;

  const total = filteredMusic.length; 

  const start = page * limit;
  const paginatedMusic = filteredMusic.slice(start, start + limit);

  return {
    data: paginatedMusic,
    total,
  };
  
}
  async createPlaylist(body: any) {
    const playlist = new this.playlistModel({
      userId: new ObjectId(body.userId),
      title: `Playlist của ${Math.floor(Math.random() *10000)}`,
      image: "https://s.widget-club.com/samples/aIdkSyXiunfsNZUT4p0Dp3M3lEF2/FI3N4EInBcr4RsBGKImj/F78AF6FB-AF40-4187-86BA-7316F0544BCE.jpg?q=70",
      isPublic: "public"
      
    })
    await playlist.save()
    return "success"
  }
 
async deleteMusicAndAlbumAndUser(id: string, type: string) {
  if(type === "music") {
    const music =  await this.musicModel.findById(id)
    const o = new this.notificationModel({
      userGiveId: null,
      userGetId: music.singerId,
         message: `Nhạc ${music.title} đã bị xóa vì vi phạm chính sách`,type: "admin",
         isSeen: false
       })
    await o.save()
      const data = await this.musicModel.deleteOne({_id: id})
    
      return "success"
    }
  if(type === "user") {
    const music =  await this.userModel.findById(id)
    const o = new this.notificationModel({
      userGiveId: null,
      userGetId: music._id,
         message: `Tài khoản của bạn đã bị xóa vì vi phạm chính sách`,type: "admin",
         isSeen: false
       })
    await o.save()
      const data = await this.userModel.deleteOne({_id: id})
   
    
  }
  const music =  await this.albumModel.findById(id)
    const o = new this.notificationModel({
      userGiveId: null,
      userGetId: music.singerId,
         message: `album ${music.title} đã bị xóa vì vi phạm chính sách`,type: "admin",
         isSeen: false
       })
    await o.save()
    const data = await this.albumModel.deleteOne({_id: id})
   
    return "success"
}
async getPlaylist(userId: string, query: any) {
  const { page , limit, search} = query;
  const pageNum = Number(page) || 0;
  const limitNum = Number(limit) || 10;

  const filter: any = { userId: new Types.ObjectId(userId) };

  if (search && search.trim() !== "") {
    filter.title = { $regex: search, $options: 'i' };
  }

  const total = await this.playlistModel.countDocuments(filter);

  const playlists = await this.playlistModel
    .find(filter)
    .populate('userId', 'username')
    .sort({ createdAt: -1 })
    .skip(pageNum * limitNum)
    .limit(limitNum)
    .lean()
    .exec();


  return { data: playlists, total };
}
  async getPlaylistDetail(id: string) {
    const data = await this.playlistModel.findById(id).lean().exec()
    return data
  }
  async getMusicList(search: any) {
  
  const filter: any = {};
  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }

  const musics = await this.musicModel
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return musics;
}
  async addMusicToPlaylist(playlistId: string, musicId: string) {
    const musicObjectId = new Types.ObjectId(musicId);
    const playlist = await this.playlistModel.findByIdAndUpdate(
      playlistId,
      { $push: { musicList: musicObjectId } },
      { new: true },
    );

    return {data: "success"}
  }
   async getAlbumDetail(id: string) {
    const data = await this.albumModel.findById(id).populate("singerId", "username").lean().exec()
    return data
  }
  async getMusicListAlbum(search: any, singerId: any) {
  
  const filter: any = {};
  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }
 if (singerId) {
  filter.singerId = new Types.ObjectId(singerId);
 }
  const musics = await this.musicModel
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return musics;
  }
   async addMusicToAlbum(albumId: string, musicId: string) {
    const musicObjectId = new Types.ObjectId(musicId);
    const album = await this.albumModel.findById(albumId)
     if (album.musicList.some(id => id.toString() === musicObjectId.toString())) {
    throw new BadRequestException("Bài hát này của bạn đã có trong Album");
     }     
    const albawUpdate = await this.albumModel.findByIdAndUpdate(
      albumId,
      { $push: { musicList: musicObjectId } },
      { new: true },
    );

    return {data: "success"}
   }
  async getAlbumWithMusic(playlistId: string, query: any) {
    const { page, limit, search  } = query;

    const playlist = await this.albumModel.findById(playlistId).populate('musicList');

    if (!playlist) throw new Error('Playlist không tồn tại');

    const filteredMusic = search
      ? playlist.musicList.filter(m =>
          m.title.toLowerCase().includes(search.toLowerCase())
        )
      : playlist.musicList;

    const total = filteredMusic.length; 

    const start = page * limit;
    const paginatedMusic = filteredMusic.slice(start, start + limit);

    return {
      data: paginatedMusic,
      total,
    };

  }
  async editPlaylist(playlistId: string, data: any) {
    const result = await this.cloudinaryService.uploadImage(data.image);
    const playlist = await this.playlistModel.findByIdAndUpdate(playlistId, {
      title: data.title,
      image: result.secure_url,
      isPublic: data.isPublic
    }, {new: true})
    return {data: "success"}
  }
  async search(keyword: any, page : number) {
     
    const regex = new RegExp(keyword, 'i');

    const [musics, playlists, totalMusic, totalPlaylist] = await Promise.all([
      this.musicModel
        .find({ title: { $regex: regex } })
        .populate('singerId', 'username')
        .lean(),

      this.playlistModel
        .find({ title: { $regex: regex }, isPublic: 'public' })
        .populate('userId', 'username')
        .lean(),

      this.musicModel.countDocuments({ title: { $regex: regex } }),
      this.playlistModel.countDocuments({
        title: { $regex: regex },
        isPublic: 'public',
      }),
    ]);

    // Gắn nhãn
    const musicResults = musics.map((m) => ({
      type: 'music',
      _id: m._id,
      title: m.title,
      image: m.image,
      
    }));

    const playlistResults = playlists.map((p) => ({
      type: 'playlist',
      _id: p._id,
      title: p.title,
      image: p.image,
    
    }));

    // Gộp, trộn ngẫu nhiên, rồi cắt theo limit
    const combined = [...musicResults, ...playlistResults]
      .sort(() => Math.random() - 0.5)
      
    const total = totalMusic + totalPlaylist;
    const start = page * 10;
  const end = start + 10;
  const pagedData = combined.slice(start, end);
    return { data: pagedData, total };
  }
  async getSingerAlbumAndMusic(singerId: any, keyword: any, page : number, type: any) {
 console.log("type", singerId)
 if(type === "music") {
   const music =  await this.musicModel
        .find({singerId: new Types.ObjectId(singerId) ,title : { $regex: keyword, $options: 'i' } })
        .populate('singerId', 'username').sort({createdAt: -1}).skip(page * 10).limit(10)
        .lean()
      const total = await this.musicModel.countDocuments({singerId: new Types.ObjectId(singerId), title : { $regex: keyword, $options: 'i' }})
    return { data: music, total: total}
 }
     
     const album = await  this.albumModel
        .find({title : { $regex: keyword, $options: 'i' }, singerId: new Types.ObjectId(singerId) , })
        .populate('singerId', 'username').sort({createdAt: -1}).skip(page * 10).limit(10)
        .lean()

    const total = await this.albumModel.countDocuments({
       title : { $regex: keyword, $options: 'i' },
        singerId: new Types.ObjectId(singerId) ,
      })


      
      
    return { data: album, total };
  }
  async like(userId: string, targetMusicId: string) {
    const targetUser = await this.musicModel.findById(targetMusicId);
    if (!targetUser) throw new Error("Người dùng không tồn tại");

    const alreadyFollowed = targetUser.like.includes(userId);

    if (alreadyFollowed) {

      await this.musicModel.updateOne(
        { _id: targetMusicId },
        { $pull: { like: userId } }, {new: true}
      );
    } else {
      // ✅ Theo dõi
      await this.musicModel.updateOne(
        { _id: targetMusicId },
        { $addToSet: { like: userId } }, {new: true}
      );
    }

    
    return {
      success: true,
         };
  }
  async sendNotificationToFollowers(singerId: string, data: { type: string, message: string, postId: String }) {
  const singer = await this.userModel.findById(singerId);

  if (!singer || !singer.follower) return;

  const notifications = singer.follower.map(followerId => ({
    userGiveId: new Types.ObjectId(singerId),
    userGetId: followerId,
    message: data.message,
    type: data.type,
    isSeen: false,
    postId: data.postId
  }));

  await this.notificationModel.insertMany(notifications);
  }
  async createMusicOrAlbum(userId : string , data: any) {
    const user = await this.userModel.findById(userId)
    if(data.type === "album") {
      const result = await this.cloudinaryService.uploadImage(data.image)
      const album = new this.albumModel({
        title: data.title,
        singerId: new Types.ObjectId(userId),
        image: result.secure_url,
        type: data.type
      })
      await album.save()
      await this.sendNotificationToFollowers(userId,{type: "album", message: `Ca sĩ ${user.username} đã tạo album mới`, postId: album._id})
      return {data: "success"}
    }

    const result = await this.cloudinaryService.uploadImage(data.image)
    const resultAudio = await this.cloudinaryService.uploadAudio(data.audio)
    const music = new this.musicModel({
      title: data.title,
      singerId: new Types.ObjectId(userId),
      image: result.secure_url,
      audio: resultAudio.secure_url,
      type: data.type,
      category: data.category
    })
    await music.save()
     await this.sendNotificationToFollowers(userId,{type: "music", message: `Ca sĩ ${user.username} đã tạo nhạc mới`, postId: music._id})
    return {data: "success"}
  }
}