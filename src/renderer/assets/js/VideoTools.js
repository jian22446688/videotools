/**
 * Created by Cary on 2018/3/9.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const spawn = require('child_process').spawn;
const spawnSync = require('child_process').spawnSync;
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const queuefun = require('queue-fun');
const ffmpegcom = require('fluent-ffmpeg');
const Queue = queuefun.Queue(); //初始化Promise异步队列类
const q = queuefun.Q;  //配合使用的Promise流程控制类，也可以使用q.js代替

//实列化一个最大并发为1的队列
const queue1 = new Queue(5);

//当前视频处理工具路径
const currentPath = path.resolve(__dirname, './') + '/';

var currentPatha = process.cwd() + "/static/";

//ffmpeg 绝对路径
var ffmpegPath = currentPatha + 'ffmpeg';

export default {
    /*********************************工具类方法***********************************************/
    setCurrentPath(path){
        // noinspection JSAnnotator
        currentPatha = path
        if(process.platform == "win32"){
            ffmpegPath = currentPatha + 'ffmpeg.exe';
        }else{
            ffmpegPath = currentPatha + 'ffmpeg';
        }
        ffmpegcom.setFfmpegPath(ffmpegPath);
    },
    getCurrentPath(){
        return currentPatha;
    },
    getFfmpeg(par){
        return ffmpegcom(par);
    },
    getP(){
        return path.sep;
    },
    /**
     * 同步检查文件是否存在
     * @param path
     * @returns {boolean}
     */
    fsExistsSync(path) {
        try{
            return fs.existsSync(path);
        }catch(e){
            return false;
        }
        return true;
    },
    /**
     * 删除指定一个文件
     * @param path
     * @returns {*}
     */
    fsUnlinkSync(path){
        try {
            return fs.unlinkSync(path);
        }catch (e){
            return false;
        }
        return true;
    },
    /**
     * 判断是否是文件夹
     * @param path
     * @returns {boolean}
     */
    fsStatIsDirSync(path){
        try{
            return fs.statSync(path).isDirectory();
        }catch (e){
            return false;
        }
        return true;
    },

    /*
     * 同步方法
     * 遍历文件夹中的所有文件
     * @param{ String } 需要遍历的文件夹路径
     */
    fsWalkExec(dir) {
        var results = []
        var list = fs.readdirSync(dir)
        list.forEach(function(file) {
            file = dir + path.sep + file
            var stat = fs.statSync(file)
            if (stat && stat.isDirectory()) {
            } else {
                if(path.basename(file) != '.DS_Store'){
                    results.push(file)
                }
            }
        })
        return results
    },
    //创建文件夹 同步
    mkdirsSync(dirpath) {
        try {
            fs.mkdirSync(dirpath);
        } catch(e) {
            if ( e.code != 'EEXIST' ) throw e;
        }
    },


    //创建多层文件夹 同步
    mkdirsSyncs(dirpath) {
        if (!fs.existsSync(dirpath)) {
            var sep = path.sep
            var folders = dirpath.split(sep);
            var p = '';
            while (folders.length) {
                p += folders.shift() + sep;
                if (!fs.existsSync(p)) {
                    fs.mkdirSync(p);
                }
            }

        }


    },

   /*********************************工具类方法***********************************************/



    /**
     * 压缩视频
     * @param videoPath
     * @param outpath
     * @param caback
     */
    toMp4: function (videoPath, outpath, caback){
        var videoname = videoPath;
        var outname = outpath;
        var param = ['-i', videoname, outname];
        var frre = spawn(ffmpegPath, param);
        frre.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        frre.stderr.on('data', function(data) {
            console.log('执行中: ' + data);
            caback(data);
        });
        frre.stdout.on('end', function(data) {
            var obj =  {
                name: 'end',
                path: path.basename(outpath),
            }
            caback(obj);
            console.log('exit '+ path.basename(outpath));
        });
    },
    /**
     * 视频转码
     * @param videoPath
     * @param outpath
     * @param caback
     */
    toVideoCoding(videoPath, outpath, caback){
        // ffmpeg -i INPUT -map 0 -c:v libx264 -c:a copy OUTPUT
        // var param = ['-i', oldfile, '-s', ratioa, '-aspect', '16:9', newfile];
        // var param = ['-f', 'concat', '-i' , listtxt, '-c', 'copy', outFileName]
        // ffmpeg -i /Users/Cary/Desktop/铁罐与陶罐.mp4 -r 25 -s 1280*720 /Users/Cary/Desktop/铁罐与陶罐a.mp4
        // ffmpeg -f concat -i /Users/Cary/Desktop/test.txt -c copy /Users/Cary/Desktop/未来的生活c.mp4
        var videoname = videoPath;
        var outname = outpath;
        var param = ['-i', videoname,'-c:v', 'libx264', '-c:a', 'copy', outname];
        var frre = spawn(ffmpegPath, param);
        frre.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        frre.stderr.on('data', function(data) {
            console.log('执行中: ' + data);
            caback(data);
        });
        frre.stdout.on('end', function(data) {
            var obj =  {
                name: 'end',
                path: path.basename(outpath),
            }
            caback(obj);
            console.log('exit '+ path.basename(outpath));
        });
    },
    /**
     * 处理视频一样编码
     * @param videoPath
     * @param outpath
     * @param caback
     */
    toChangeVideoCoding(obje, caback){
        var videoname = obje.videoPath;
        var outname = obje.outPath;
        var resie = obje.videoSize;
        // ffmpeg -i /Users/Cary/Desktop/铁罐与陶罐.mp4 -r 25 -s 1280*720 /Users/Cary/Desktop/铁罐与陶罐a.mp4
        var param = ['-i', videoname,'-r', '25', '-s', resie, '-ar', '48000', outname];
        var frre = spawn(ffmpegPath, param);
        frre.stdout.on('data', function(data) {
            // console.log('stdout: ' + data);
        });
        frre.stderr.on('data', function(data) {
            // console.log('执行中: ' + data);
            caback(data);
        });
        frre.stdout.on('end', function(data) {
            var obj =  {
                name: 'end',
                path: path.basename(outname),
            }
            caback(obj);
            console.log('exit '+ path.basename(outname));
        });
    },

    /**
     * 通用的命令行工具
     * @param obj
     * @param back
     */
    toSpawn(obj, back){
        var frre = spawn(ffmpegPath, obj.param);
        frre.stdout.on('data', function(data) {
            var obj =  {
                name: 'stdout',
                data: data
            }
            if(back != null){
                back(obj);
            }
        });
        frre.stderr.on('data', function(data) {
            var obj =  {
                name: 'stderr',
                data: data
            }
            if(back != null){
                back(obj);
            }
        });
        frre.stdout.on('end', function(data) {
            var obj =  {
                name: 'end',
                data: data
            }
            if(back != null){
                back(obj);
            }
        });
    },


    /**
     * 获取视频长度
     * @param videofile
     * @returns {string}
     */
    getVideoDuration: function (videofile, cabk) {
        var thia = this;
        var tm = 0;
        var param = ['-i', videofile];
        var frre = spawn(ffmpegPath, param);
        frre.stderr.on('data', function(data) {
            var da = data.toString();
            if(da.indexOf('Duration:') != -1){
               var dur =  da.substr(da.indexOf('Duration:') + 10, 12);
                tm = thia.toSecond(dur);
            }
        });
        frre.stdout.on('end', function(data) {
            cabk(tm);
        });
    },
    /**
     * 把获取到视频长度转换成秒
     * @param itmestr
     * @returns {number}
     */
    toSecond(itmestr){
        var ab = itmestr.split(":");
        if(ab.length <= 2){
            ab = itmestr.split(",");
        }
        console.log(ab);
        if(itmestr == null && ab == null){
            return 0;
        }
        //字符串分割。。。。
        var hour = parseInt(ab[0]);
        var minute = parseInt(ab[1]) + hour * 60;
        var second = (parseFloat(ab[2]) + minute * 60).toFixed(2);
        return parseFloat(second);
    },
    /**
     * 获取运行中的视频时间截
     * @param timestr
     * @returns {*}
     */
    getRunVideoTime(timestr){
        // 执行中: frame= 1247 fps= 68 q=28.0 size=    4772kB time=00:00:50.42 bitrate= 775.3kbits/s
        var ss = timestr.toString();
        var ts = "";
        if(ss.indexOf('time=') != -1){
             ts = ss.substr(ss.indexOf('time=') + 5, 12);
        }else {
            return null;
        }
        return this.toSecond(ts);
    },

    test(pathaa){
        return path.basename(pathaa);
    },


}

//
// fs.unlink(path,callback);
// deleteFolder(path);
// function deleteFolder(path) {
//     var files = [];
//     if( fs.existsSync(path) ) {
//         files = fs.readdirSync(path);
//         files.forEach(function(file,index){
//             var curPath = path + "/" + file;
//             if(fs.statSync(curPath).isDirectory()) { // recurse
//                 deleteFolder(curPath);
//             } else { // delete file
//                 fs.unlinkSync(curPath);
//             }
//         });
//         fs.rmdirSync(path);
//     }
// }




/**
 * 所有的参数说明
 * @type {[*]}
 */
var readme = [
    { fun: '-i',
        way: 'ToInfoVideo(path)',
        present: '将视频文件压缩，对视频质量要求高的尽量不要使用',
        parameter: ['需要压缩的视频绝对路径']
    },
    { fun: '-tomp4',
        way: 'Tomp4(path)',
        present: '将其他视频文件转换为 mp4 文件 要是MP4文件会直接压缩',
        parameter: ['需要压缩的视频绝对路径']
    },
    { fun: '-cjpg',
        way: 'videoJpg(path)',
        present: '重视频中获取随机获取5张截图，可以使用该图片使用封面。。。',
        parameter: ['需要压缩的视频绝对路径']
    },
    { fun: '-vcut',
        way: 'videoCut(path, startTime, length)',
        present: '从原视频文件中剪切一段视频 保存成一个新的视频文件',
        parameter: ['视频源文件绝对路径', '开始时间', '需要截取的时长']
    },
    { fun: '-emp3',
        way: 'extractMp3(path)',
        present: '从原视频文件中获取音频文件，转换为MP3',
        parameter: ['视频源文件绝对路径']
    },
    { fun: '-vf',
        way: 'combineVideo(path)',
        present: '合并一个文件下的所有视频文件，生成一个新的MP4视频文件',
        parameter: ['视频源文件绝对路径']
    },
    { fun: '-vfs',
        way: 'combineVideoss(path)',
        present: '合并所有视频文件，生成一个新的MP4视频文件 注意：这个方法会把合并新的视频保存在第二个视频的路径中',
        parameter: ['视频源文件绝对路径 视频路径 视频路径 。。。']
    },
    { fun: '-vd',
        way: 'getVideoDuration(path)',
        present: '获取视频长度',
        parameter: ['视频源文件绝对路径 视频路径 。。。']
    },
    { fun: '-vgif',
        way: 'toGif(path, startTime, length)',
        present: '将视频文件 截取成为GIF 建议不要超过30秒',
        parameter: ['视频源文件绝对路径', '开始时间', '需要截取的时长']
    },
    { fun: '-vm',
        way: 'addWatermarks(videopath, watermarkpath, pos)',
        present: '将视频文件 添加水印 传入是一个文件夹 就添加文件夹里面的所视频，单个文件只添加一个',
        parameter: ['视频源文件绝对路径', '水印图片', '位置（10:10）默认']
    },
    { fun: '-gn',
        way: 'changePathFileName(filepath, prefix)',
        present: '将一个文件夹下面的多有的文件名字修改序列化 加上自己的前缀 是修改文件名使用的 我修改H5图片',
        parameter: ['文件夹绝对路径', '前缀']
    },
    { fun: '-is',
        way: 'ToInfoVideos(filepath)',
        present: '将一个文件夹的视频文件，压缩',
        parameter: ['文件夹绝对路径']
    },
    { fun: '-vs',
        way: 'changeVideoSize(filepath, size)',
        present: '将视频文件 添加水印 修改一个文件夹里面的所视频，单个文件只添加一个 ' +
        '320*180,480*270,640*360 ,720*405 ,854*480,960*540,1080*600,1280*720,1920*1080',
        parameter: ['文件夹绝对路径', '前缀']
    },
    { fun: '-fi',
        way: 'getFileinfo(filepath, size) 13',
        present: '将视频文件 添加水印 修改一个文件夹里面的所视频，单个文件只添加一个 ' +
        '320*180,480*270,640*360 ,720*405 ,854*480,960*540,1080*600,1280*720,1920*1080',
        parameter: ['文件夹绝对路径', '前缀']
    },
    { fun: '-iss',
        way: 'ToInfoVideosss(path) 13',
        present: '将一个文件夹的视频文件，压缩',
        parameter: ['文件夹绝对路径']
    },

]
