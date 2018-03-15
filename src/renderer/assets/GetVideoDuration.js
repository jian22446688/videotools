/**
 * Created by Cary on 2017/8/3.
 */
/**
 * Created by Cary on 2017/5/18.
 */
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

//ffmpeg 绝对路径
// var ffmpegPath = '/Users/Cary/Documents/AndroidTools/ffmp/ffmpeg';

//当前视频处理工具路径
var currentPath = path.resolve(__dirname, './') + '/';
//ffmpeg 绝对路径
var ffmpegPath = currentPath + 'ffmpeg';

//当前系统时间
var timedate = new Date();

console.log("------------------------------------------------");
console.log("------------------------------------------------");
console.log("获取处理视频目录：" + currentPath);
console.log("------------------------------------------------");
console.log("------------------------------------------------");

return;

/******************************工具方法**********************************/
/*
 * 截取视频封面
 *  @param{ String } 视频截取完成的名字
 */
var getVideoDuration = function(ffmpegfile, videoname) {
    if(ffmpegfile == null){
            console.log("FFmpeg 工具不能为空");
        return;
    }
    if(videoname == null){
        console.log("文件目录不能为空");
        return;
    }
    var textpath = videoname + "/";

    fs.stat(videoname, function (err, stats) {
        if(err){
            console.log("路径错误，请检查有效的路径");
        }
        if(stats.isDirectory()){
            var results = walkExec(videoname);
            var str = '';
            for (var i = 0; i< results.length; i++) {
                if (results[i].indexOf('.DS_Store') == -1 && results[i].indexOf('.txt') == -1) {
                    console.log("文件：" + results[i] );
                    getVideoinfo(results[i], function (par) {
                        var listtxt = textpath + "fileList.txt";
                        var str = "fileName " + par.name + " duration "+par.duration + "\n";
                        fs.appendFile(listtxt, str);
                    });
                }
            }
        }
        if(stats.isFile()){
            getVideoinfo(videoname, function (par) {
                console.log(par.name + "  D: "+ par.duration);
            });
        }
    });
    function getVideoinfo(vname, callback) {
        var cmdte = ffmpegfile + " -i "+ vname +" 2>&1 | grep 'Duration' | cut -d ' ' -f 4 | sed s/,//";
        exec(cmdte, function(err,stdout,stderr){
            var infos = {};
            if(err) {
                console.log('get weather api error:'+stderr);
            } else {
                infos.name = path.basename(vname);
                infos.duration = stdout;
                callback(infos);
            }
        });
    }
}

/*
 * 同步方法
 * 遍历文件夹中的所有文件
 * @param{ String } 需要遍历的文件夹路径
 */
var walkExec = function(dir) {
    var results = []
    var list = fs.readdirSync(dir)
    list.forEach(function(file) {
        file = dir + '/' + file
        var stat = fs.statSync(file)
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file, function (err, res) {
            }))
        } else {
            results.push(file)
        }
    })
    return results
}

/*
 * 异步方法
 * 遍历文件夹中的所有文件
 * @param{ String } 需要遍历的文件夹路径
 */
var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

/*
 * 复制目录中的所有文件包括子目录
 * @param{ String } 需要复制的目录
 * @param{ String } 复制到指定的目录
 */
var copyFile = function( src, dst ){
    // 读取目录中的所有文件/目录
    fs.readdir( src, function( err, paths ){
        if( err ){
            throw err;
        }
        paths.forEach(function( path ){
            var _src = src + '/' + path,
                _dst = dst + '/' + path,
                readable, writable;
            fs.stat( _src, function( err, st ){
                if( err ){
                    throw err;
                }
                // 判断是否为文件
                if( st.isFile() ){
                    // 创建读取流
                    readable = fs.createReadStream( _src );
                    // 创建写入流
                    writable = fs.createWriteStream( _dst );
                    // 通过管道来传输流
                    readable.pipe( writable );
                }
                // 如果是目录则递归调用自身
                else if( st.isDirectory() ){
                    exists( _src, _dst, copyFile );
                }
            });
        });
    });
};

var exists = function( src, dst, callback ){
    fs.exists( dst, function( exists ){
        // 已存在
        if( exists ){
            callback( src, dst );
        }
        // 不存在
        else{
            fs.mkdir( dst, function(){
                callback( src, dst );
            });
        }
    });
};

var mkdirSync = function (path) {
    try {
        fs.mkdirSync(path);
    } catch(e) {
        if ( e.code != 'EEXIST' ) throw e;
    }
}


/******************************工具方法**********************************/

/**
 * 所有的参数说明
 * @type {[*]}
 */
var readme = [
    { fun: '-vd',
        way: 'getVideoDuration(path)',
        present: '获取视频长度',
        parameter: ['视频源文件绝对路径 视频路径 。。。']
    },

]

//欢迎使用视频剪辑工具
console.log('欢迎使用视频剪辑工具 当前工具目录：' + currentPath);
if(process.argv.length <= 2){
    console.log('请输入正确的 参数进行视频处理。。。。。');
    return;
}

//判断输入的参数是否正确
if(process.argv[2][0] != '-'){
    console.log('请输入正确的工具的参数');
    return;
}

// if(true){
// 	return;
// }

switch (process.argv[2]){
    // -vd
    case readme[0].fun:
        getVideoDuration(process.argv[3],process.argv[4]);
        break;
    default :
        console.log("参数不正确，请确认参数是否正确。。。");
        break;
}
