/**
 * Created by Cary on 2017/5/18.
 */
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

var queuefun = require('queue-fun');
var Queue = queuefun.Queue(); //初始化Promise异步队列类
var q = queuefun.Q;  //配合使用的Promise流程控制类，也可以使用q.js代替

//实列化一个最大并发为1的队列
var queue1 = new Queue(5);



//ffmpeg 绝对路径
// var ffmpegPath = '/Users/Cary/Documents/AndroidTools/ffmp/ffmpeg';

//当前视频处理工具路径 
var currentPath = path.resolve(__dirname, './') + '/';


//ffmpeg 绝对路径
var ffmpegPath = currentPath + 'ffmpeg';

//当前系统时间
var timedate = new Date();
	
/******************************工具方法**********************************/
/*
 * 将视频文件转换为 MP4 压缩文件
 *  @param{ String } 需要转换的视频名字
 */
var Tomp4 = function(videoname) {
	var filadir = path.dirname(videoname) + '/';
	var outFileNameTime = timedate.getFullYear()+'-'+timedate.getMonth()+'-'+timedate.getDate()+' '+
						  timedate.getHours()+timedate.getMinutes()+timedate.getSeconds();
	var vname = path.basename(videoname);
	if (vname.indexOf('.') == -1) {
		console.log('输入的不是有效的视频文件，请检查文件后缀');
		return;
	}
	var vioName = vname.substr(0, vname.indexOf('.'));
	var vioSuffix = '.mp4';
	var outFileName = filadir + vioName + '-' + outFileNameTime.toString() + vioSuffix;
	var param = ['-i', videoname, outFileName];
	var frre = spawn(ffmpegPath, param);
	frre.stdout.on('data', function(data) {
		console.log('stdout: ' + data);
	});

	frre.stderr.on('data', function(data) {
		console.log('执行中: ' + data);
	});

	frre.stdout.on('end', function(data) {
		console.log('exit '+ data);
	});
}

/*
 * 将视频文件转换为 压缩视频文件
 *  @param{ String } 需要转换的视频名字
 */
var ToInfoVideo = function(videoname) {
    var filadir = path.dirname(videoname) + '/';
    var outFileNameTime = timedate.getFullYear()+'-'+timedate.getMonth()+'-'+timedate.getDate()+' '+
        timedate.getHours()+timedate.getMinutes()+timedate.getSeconds();
    var vname = path.basename(videoname);
    if (vname.indexOf('.') == -1) {
        console.log('输入的不是有效的视频文件，请检查文件后缀');
        return;
    }
    var vioName = vname.substr(0, vname.indexOf('.'));
    var vioSuffix = vname.substr(vname.indexOf('.'), vname.length);
    var outFileName = filadir + vioName + '-' + outFileNameTime.toString() + vioSuffix;
    var param = ['-i', videoname, outFileName];
    var frre = spawn(ffmpegPath, param);
    frre.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
    });

    frre.stderr.on('data', function(data) {
        console.log('执行中: ' + data);
    });

    frre.stdout.on('end', function(data) {
        console.log('exit '+ data);
    });
}

// 791208

/*
 * 将所有的视频文件转换为 压缩视频文件
 *  @param{ String } 文件夹路径
 */
var ToInfoVideos = function(videoname) {
    var results = walkExec(videoname);
    var newfile = path.dirname(results[0]) + '/' + 'newVideoFile/';
    mkdirSync(newfile);
    console.log(results);
    for (var i = 0; i< results.length; i++) {
        if (results[i] != undefined){
            if (results[i].indexOf('.DS_Store') == -1) {
                queue1.push(tovideo,[results[i], newfile + path.basename(results[i])]).then(console.log);
                // tovideo(results[i], newfile + path.basename(results[i]));
            }
        }
    }
    function tovideo(oldfile, newfile) {
        var deferred = q.defer();
        var param = ['-i', oldfile, newfile];
        var frre = spawn(ffmpegPath, param);
        frre.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        frre.stderr.on('data', function(data) {
            console.log('执行中: ' + data);
        });
        frre.stdout.on('end', function(data) {
            console.log('exit '+ data);
            deferred.resolve( "导出完成：" + newfile);
        });
        return deferred.promise;
    }
    //执行队列
    queue1.start();
}

/*
 * 将所有的视频文件转换为 压缩视频文件 只需要传入一个路径
 *  @param{ String } 文件夹路径
 */
var ToInfoVideosss = function(videoname) {
    var paths = [];
    var newPaths = [];
    readDirSync(videoname);
    function readDirSync(path){
        var pa = fs.readdirSync(path);
        pa.forEach(function(ele,index){
            var info = fs.statSync(path+"/"+ele);
            if(info.isDirectory()){
                readDirSync(path+"/"+ele);
            }else{
                if(ele != ".DS_Store"){
                    paths.push(path +"/" + ele);
                    console.log("file: " + path +ele)
                }
            }
        })
    }
    paths.forEach(function (pathfile, index) {
        var newfile = path.dirname(paths[index]) + '/' + 'newVideoFile/';
        var newfilename = path.basename(paths[index]);
        fs.exists(newfile, function (exis) {
            if (!exis){ mkdirSync(newfile); }
        });
        newPaths.push(newfile + newfilename);
    })
    newPaths.forEach(function (filename, index) {
        if (filename != undefined){
            if (filename.indexOf('.DS_Store') == -1) {
                queue1.push(tovideo,[paths[index], filename]).then(console.log);
            }
        }
    })
    function tovideo(oldfile, newfile) {
        var deferred = q.defer();
        var param = ['-i', oldfile, newfile];
        var frre = spawn(ffmpegPath, param);
        frre.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        frre.stderr.on('data', function(data) {
            console.log('执行中: ' + data);
        });
        frre.stdout.on('end', function(data) {
            console.log('exit '+ data);
            deferred.resolve( "导出完成：" + newfile);
        });
        return deferred.promise;
    }
    //执行队列
    queue1.start();
}

/**
 * 改变视频大小
 * @param videopath
 * @param size
 */
var changeVideoSize = function (videopath, size) {
    // 320*180,480*270,640*360 ,720*405 ,854*480,960*540,1080*600,1280*720,1920*1080
    if(videopath == null || size == null){
        console.log("文件，文件目录, 视频大小，不能为空");
        return;
    }
    var ratioa = '';
    switch (size){
        case '180':
            ratioa = '320*180';
            break;
        case '270':
            ratioa = '480*270';
            break;
        case '360':
            ratioa = '640*360';
            break;
        case '405':
            ratioa = '720*405';
            break;
        case '480':
            ratioa = '854*480';
            break;
        case '540':
            ratioa = '960*540';
            break;
        case '600':
            ratioa = '1080*600';
            break;
        case '720':
            ratioa = '1280*720';
            break;
        case '1080':
            ratioa = '1920*1080';
            break;
        default:
            ratioa = size;
            break;
    }
    fs.stat(videopath, function (err, stats) {
        if(err){
            console.log("路径错误，请检查有效的路径");
        }
        if(stats.isDirectory()){
            var results = walkExec(videopath);
            var newfile = path.dirname(results[0]) + '/' + 'newSizeVideo/';
            mkdirSync(newfile);
            var str = '';
            console.log(results);
            for (var i = 0; i< results.length; i++) {
                if (results[i] != undefined){
                    if (results[i].indexOf('.DS_Store') == -1) {
                        queue1.push(tovideosize, [results[i], newfile + path.basename(results[i]), ratioa]).then(console.log);
                        // tovideosize(results[i], newfile + path.basename(results[i]), ratioa);
                    }
                }
            }
        }
        if(stats.isFile()){
            var newfile = path.dirname(videopath) + '/' + 'newSizeVideo/';
            mkdirSync(newfile);
            queue1.push(tovideosize, [videopath, newfile + path.basename(videopath), ratioa]).then(console.log);
            // tovideosize(videopath, newfile + path.basename(videopath), ratioa);
        }
        function tovideosize(oldfile, newfile, size) {
            var deferred = q.defer();
            var param = ['-i', oldfile, '-s', ratioa, '-aspect', '16:9', newfile];
            var frre = spawn(ffmpegPath, param);
            frre.stdout.on('data', function(data) {
                console.log('stdout: ' + data);
            });

            frre.stderr.on('data', function(data) {
                console.log('执行中: ' + data);
            });

            frre.stdout.on('end', function(data) {
                console.log('exit '+ data);
                deferred.resolve( "导出完成：" + newfile);
            });
            return deferred.promise;
        }
        //执行队列
        queue1.start();
    })

}

/*
 * 将视频文件转换为 MP4 压缩文件
 *  @param{ String } 需要转换的视频名字
 */
var videoTOmp4 = function(videoname) {
	var filadir = path.dirname(videoname) + '/';
	var outFileNameTime = timedate.getFullYear()+'-'+timedate.getMonth()+'-'+timedate.getDate()+' '+
						  timedate.getHours()+timedate.getMinutes() +timedate.getSeconds();
	var vname = path.basename(videoname);
	if (vname.indexOf('.') == -1) {
		console.log('输入的不是有效的视频文件，请检查文件后缀');
		return;
	}
	var vioName = vname.substr(0, vname.indexOf('_cut'));
	var vioSuffix = '.mp4';
	var outFileName = filadir + vioName + '-' + outFileNameTime.toString() + vioSuffix;
	var param = ['-i', videoname, outFileName]
	var frre = spawn(ffmpegPath, param);
	frre.stdout.on('data', function(data) {
		console.log('stdout: ' + data);
	});
	frre.stderr.on('data', function(data) {
		console.log('执行中: ' + data);
	});
	frre.stdout.on('end', function(data) {
		spawn('rm', [videoname]);
		console.log('exit '+ data);
	});
}

/*
 * 将视频组合成一个 MP4 视频 
 *  @param{ String } 需要传入一个文件夹
 */
var combineVideo = function(videoname) {
	var results = walkExec(videoname);
	var str = '';
	for (var i = 0; i< results.length; i++) {
		if (results[i].indexOf('.DS_Store') == -1) {
			str += 'file ' + "'" + results[i] + "'" + "\n"; 
		}
	}
	console.log("文件： " +str);
	var listtxt = videoname + "/list.txt";
	fs.writeFile(listtxt, str);

	var filadir = path.dirname(videoname) + '/';
	var outFileNameTime = timedate.getFullYear()+'-'+timedate.getMonth()+'-'+timedate.getDate()+' '+
						  timedate.getHours()+timedate.getMinutes()+timedate.getSeconds();
	var vname = 'newVideo_'
	var vioSuffix = '.mp4';
	var outFileName = filadir + vname + '-' + outFileNameTime.toString() + vioSuffix;

	var param = ['-f', 'concat', '-i' , listtxt, '-c', 'copy', outFileName]
	var frre = spawn(ffmpegPath, param);
	frre.stdout.on('data', function(data) {
		console.log('stdout: ' + data);
	});
	frre.stderr.on('data', function(data) {
		console.log('执行中: ' + data);
	});
	frre.stdout.on('end', function(data) {
		spawn('rm', [ listtxt ]);
		console.log('end 视频组合成功......');
	});
}

/*
 * 视频片段拼接 1 + 2 + 3 这中样式进行拼接
 *  @param{ Array } 需要传入一个数组
 */
var combineVideoss = function(videos) {
    var str = '';
    for (var i = 0; i< videos.length; i++) {
        if (videos[i].indexOf('.') != -1) {
            str += 'file ' + "'" + videos[i] + "'" + "\n";
        }
    }
    console.log("文件： " +str);
    var listtxt = currentPath + "list.txt";
    fs.writeFile(listtxt, str);

    var filadir = path.dirname(videos[1]) + '/';
    var outFileNameTime = timedate.getFullYear()+'-'+timedate.getMonth()+'-'+timedate.getDate()+' '+
        timedate.getHours()+timedate.getMinutes()+timedate.getSeconds();
    var vname = 'snewVideo_'
    var vioSuffix = '.mp4';
    var outFileName = filadir + vname + '-' + outFileNameTime.toString() + vioSuffix;
    // -c:v libx264 -b 0.1M -c:a libfaac -ab 32k
    var param = ['-f', 'concat', '-i' , listtxt,'-c','copy', outFileName]
    var frre = spawn(ffmpegPath, param);
    frre.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
    });
    frre.stderr.on('data', function(data) {
        console.log('执行中: ' + data);
    });
    frre.stdout.on('end', function(data) {
        spawn('rm', [ listtxt ]);
        console.log('end 视频组合成功......');
    });

    // ffmpeg -i /Users/Cary/Desktop/aaa.mp4 -s 720x480 -vcodec libx264 /Users/Cary/Desktop/aaa264.mp4


}

/*
 * 将视频里面的音频提取出来 转换MP3
 *  @param{ String } 需要传入一个视频文件
 */
var extractMp3 = function(videoname) {
	// body...
	if(videoname == null){
		console.log("参数不能为空");
		return;
	}
	var filadir = path.dirname(videoname) + '/';
	var outFileNameTime = timedate.getFullYear()+'-'+timedate.getMonth()+'-'+timedate.getDate()+' '+
						  timedate.getHours()+timedate.getMinutes()+timedate.getSeconds();
	var vname = path.basename(videoname);
	if (vname.indexOf('.') == -1) {
		console.log('输入的不是有效的视频文件，请检查文件后缀');
		return;
	}
	var vioName = vname.substr(0, vname.indexOf('.'));
	var vioSuffix = '.mp3';
	var outFileName = filadir + vioName + '-' + outFileNameTime.toString() + vioSuffix;

	// ffmpeg -i input.avi -b:a 128k output.mp3
	var param = ['-i', videoname, '-b:a', '128k', outFileName]
	var frre = spawn(ffmpegPath, param);
	frre.stdout.on('data', function(data) {
		console.log('stdout: ' + data);
	});
	frre.stderr.on('data', function(data) {
		console.log('执行中: ' + data);
	});
	frre.stdout.on('end', function(data) {
		console.log('exit '+ data);
	});
}

/*
 * 截取视频封面
 *  @param{ String } 视频截取完成的名字
 */
var videoJpg = function(videoname) {
    if(videoname == null){
        console.log("参数不能为空");
        return;
    }
	// ffmpeg -ss 00:22:30 -i Mononoke.Hime.mkv -ss 00:00:30 -frames：v 1 out3.jpg
	var filadir = path.dirname(videoname) + '/';
	var outFileNameTime = timedate.getTime();
	var vname = path.basename(videoname);
	if (vname.indexOf('.') == -1) {
		console.log('输入的不是有效的视频文件，请检查文件后缀');
		return;
	}
	var vioName = vname.substr(0, vname.indexOf('.'));
	var vioSuffix = '.jpg';
	var timearr = ['00:00:03','00:00:04','00:00:05','00:00:06','00:00:07','00:00:08','00:00:09','00:00:10',
				   '00:00:11','00:00:12','00:00:13','00:00:14','00:00:15','00:00:16','00:00:17','00:00:18',
				   '00:00:19','00:00:20','00:00:21','00:00:22','00:00:23','00:00:24','00:00:25','00:00:26',
				   '00:00:27','00:00:28','00:00:29','00:00:30','00:00:31','00:00:32','00:00:33','00:00:34',];

	var coverpath = filadir + vioName +'_cover/';
	if (!fs.existsSync(coverpath)) {
		fs.mkdir(coverpath);
		console.log('没有文件');
	} 

	for (var i = 0; i < 5; i++) {
		var outFileName = coverpath + vioName + '_' + i +'_cover_' + outFileNameTime.toString() + vioSuffix;
		var param = ['-ss', timearr[parseInt((Math.random()* timearr.length))], '-s','720x480','-i', videoname,  '-frames:v', '1',  outFileName];
		var frre = spawn(ffmpegPath, param);
		frre.stdout.on('end', function(data) {
			console.log('截取完成: ' + outFileName);
		});
	}
}

/*
 * 截取视频片段
 *  @param{ String } 需要转换的视频名字
 *  @param{ String } 截取开始的时间
 *  @param{ String } 需要截取的时间
 *  @param{ String } 视频截取完成的名字
 */
var videoCut = function(videoname, start, counttime) {
	// body...
	// ffmpeg -ss 00:00:00 -t 00:00:03 -i /Users/Cary/Desktop/aaa.mp4 -vcodec copy -acodec copy /Users/Cary/Desktop/ddd.mp4
	console.log("视频路径："+ videoname);
	if (typeof(start) != 'string' || typeof(counttime) != 'string' || typeof(videoname) != 'string') { 
		console.log("VideoCut 参数有误请检查。。。");
		return; 
	}
	var filadir = path.dirname(videoname) + '/';
	var outFileNameTime = timedate.getTime();
	var vname = path.basename(videoname);
	if (vname.indexOf('.') == -1) {
		console.log('输入的不是有效的视频文件，请检查文件后缀');
		return;
	}
	var vioName = vname.substr(0, vname.indexOf('.'));
	var vioSuffix = vname.substr(vname.indexOf('.'), vname.length);
	var outFileName = filadir + vioName + '_cut_' + outFileNameTime.toString() + vioSuffix;
	// var param = ['-ss', getSeconds(start), '-to', getSeconds(counttime), '-i', videoname, '-vcodec', 'copy', '-acodec', 'copy', outFileName];
	// var param = [ '-ss', getSeconds(start), '-i', videoname, '-t', getSeconds(counttime),  '-acodec', 'copy', '-vcodec','copy', outFileName];
	var param = [ '-ss', getSeconds(start), '-i', videoname, '-to', getSeconds(counttime), outFileName];

	var frre = spawn(ffmpegPath, param);

	frre.stdout.on('data', function(data) {
		console.log('stdout: ' + data);
	});

	frre.stderr.on('data', function(data) {
		console.log('stderr: ' + data);
	});

	frre.stdout.on('end', function(data) {
		console.log(outFileNameTime);
		console.log('截取完成: ' + outFileName);
		console.log('exit '+ data);
		// videoTOmp4(outFileName);
	});

}

/*
 * 截取视频封面
 *  @param{ String } 视频截取完成的名字
 */
var getVideoDuration = function(videoname) {
    if(videoname == null){
        console.log("参数不能为空");
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
        var cmdte = ffmpegPath + " -i "+ vname +" 2>&1 | grep 'Duration' | cut -d ' ' -f 4 | sed s/,//";
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
 * 截取视频封面
 *  @param{ String } 视频截取完成的名字
 */
var toGif = function(videoname, start, counttime) {
    if(videoname == null){
        console.log("参数不能为空");
        return;
    }
    var filadir = path.dirname(videoname) + '/';
    var outFileNameTime = timedate.getFullYear()+'-'+timedate.getMonth()+'-'+timedate.getDate()+' '+
        timedate.getHours()+timedate.getMinutes()+timedate.getSeconds();
    var vname = path.basename(videoname);
    if (vname.indexOf('.') == -1) {
        console.log('输入的不是有效的视频文件，请检查文件后缀');
        return;
    }
    var vioName = vname.substr(0, vname.indexOf('.'));
    var vioSuffix = '.gif';
    var outFileName = filadir + vioName + '-' + outFileNameTime.toString() + vioSuffix;

    // ffmpeg -i wheer.avi -ss 10 -t 5 -pix_fmt rgb24 -loop_output 0 -f gif cap.gif
    var param = [ '-i', videoname, '-ss',
        getSeconds(start), '-t', getSeconds(counttime), '-r','12', '-f', 'gif',
        outFileName];
    var frre = spawn(ffmpegPath, param);

    frre.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
    });

    frre.stderr.on('data', function(data) {
        console.log('stderr: ' + data);
    });

    frre.stdout.on('end', function(data) {
    });
}

/*
 * 批量视频添加水印
 *  @param{ String } 视频截取完成的名字
 */
var addWatermarks = function(videodir, markpng, pos)  {
    if(videodir == null || markpng == null){
        console.log("文件目录，和 水印图片参数不能为空");
        return;
    }
    fs.stat(videodir, function (err, stats) {
    	if(err){
			console.log("路径错误，请检查有效的路径");
		}
        if(stats.isDirectory()){
            var results = walkExec(videodir);
            var str = '';
            for (var i = 0; i< results.length; i++) {
                if (results[i].indexOf('.DS_Store') == -1) {
                    console.log("文件：" + results[i] );
                    addWatermark(results[i], markpng, pos);
                }
            }
		}
		if(stats.isFile()){
            addWatermark(videodir, markpng, pos);
		}
    })


    /**
     * 视频添加水印
     * @param videoname 视频绝对路径
     * @param markpng logo *.png 绝对路径
     * @param pos 水印显示位置
     */
    var addWatermark = function(videoname, markpng , pos) {
        if(videoname == null){
            console.log("参数不能为空");
            return;
        }
        var filadir = path.dirname(videoname) + '/' + 'addWater/';
        mkdirSync(filadir);
        var outFileNameTime = timedate.getFullYear()+'-'+timedate.getMonth()+'-'+timedate.getDate();
        var vname = path.basename(videoname);
        if (vname.indexOf('.') == -1) {
            console.log('输入的不是有效的视频文件，请检查文件后缀');
            return;
        }
        var vioName = vname.substr(0, vname.indexOf('.'));
        var vioSuffix = vname.substr(vname.indexOf('.'), vname.length);
        var outFileName = filadir + vioName + '_water_' + outFileNameTime.toString() + vioSuffix;
        var param;

        // ffmpeg -i /Users/Jewel_M/Movies/123.mp4 -vf "movie='/Users/Jewel_M/logo.png' [logo]; [in][logo] overlay=10:10 [out]" -q:v 2 -y /Users/Jewel_M/Movies/123_a.mp4
        if(pos != null){
            console.log("有参数：POs："+ pos);
            param = [ '-i', videoname, '-vf', "movie="+ markpng +" [logo]; [in][logo] overlay="+ pos +" [out]",'-q:v', '2', '-y', outFileName];
        }else {
            //默认水印设置位置为 10：10
            console.log("没有参数：POs："+ pos);
            param = [ '-i', videoname, '-vf', "movie="+ markpng +" [logo]; [in][logo] overlay=10:10 [out]",'-q:v', '2', '-y', outFileName];
        }
        var frre = spawn(ffmpegPath, param);
        frre.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });

        frre.stderr.on('data', function(data) {
            console.log('stderr: ' + data);
        });

        frre.stdout.on('end', function(data) {
            console.log('水印添加完成...');
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

var walkExecAll = function(dir) {
    var results = []
    var list = fs.readdirSync(dir)
    list.forEach(function(file) {
        file = dir + '/' + file
        results.push(file)
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

//创建多层文件夹 同步
function mkdirsSync(dirpath, mode) { 
    if (!fs.existsSync(dirpath)) {
        var pathtmp;
        dirpath.split(path.sep).forEach(function(dirname) {
            if (pathtmp) {
                pathtmp = path.join(pathtmp, dirname);
            }
            else {
                pathtmp = dirname;
            }
            if (!fs.existsSync(pathtmp)) {
                if (!fs.mkdirSync(pathtmp, mode)) {
                    return false;
                }
            }
        });
    }
    return true; 
}

/*
 * 获取秒钟 
 * @param{ String } time 时间格式 "00:00:00"
 */
 var getSeconds = function(time) {
 	// body...
 	if (typeof(time) != 'string') {
 		return 0;
 	}
 	if (time.length < 8) {
 		console.log('输入的时间格式不对 默认为 0');
 		return 0;
 	}
 	var arr = time.split(':');
	var seconds = (arr[0] * 3600) + (arr[1] * 60) + (arr[2] * 1);
 	return seconds;
 }

/**
 * 更换一个文件夹下面所有的文件名字
 * @param videoname 文件夹
 * @param prefix 文件名前缀
 */
var changePathFileName = function (videoname, prefix) {
     var results = walkExecAll(videoname);
     var str = '';
     var j = 0;
     results.forEach(function(path){
         var info = fs.statSync(path)
         if(info.isDirectory()){
             changePathFileName(path, prefix)
         }else if(path.indexOf('.DS_Store') == -1) {
             var nname = prefix ? prefix : 'ccnew'
             var outFileName = nname + '_' + j;
             changeFileName(path, outFileName);
             j++;
         }
     })
 }

/**
 * 修改文件名
 * @param file 需要修改的文件
 * @param newname 新的文件名
 */
var changeFileName = function (file, newname) {
    var filepath = path.dirname(file) + '/';
    var vname = path.basename(file);
    var vioName = vname.substring(0,vname.lastIndexOf('.'));
    var vioSuffix = vname.substring(vname.lastIndexOf('.'));
    var newFile = filepath + newname + vioSuffix;
    if (vname.indexOf('.') == -1) {
        console.log('输入的不是有效文件，请检查文件后缀');
        return;
    }
    if(newname == null || file == null){
        console.log("旧文件和新文件名不能空；");
        return;
    }
    if(vioName == newname){
        console.log("文件名相同");
        return;
    }
    fs.exists(file, function (exis) {
        if(exis){
            fs.rename(file, newFile, function (err) {
                if (err){
                    console.log(file + " 文件修改失败");
                }else {
                    console.log(newFile + " 文件修改成功");
                }
            });
        }else {
            console.log(file + " 文件不存在") ;
        }
    });
}

/*
 * 获取视频时间长度
 *  @param{ String } 文件夹路径
 */
var getVideoDration = function(videoname) {
    var results = walkExec(videoname);
    var newfile = path.dirname(results[0]) + '/' + 'newVideoFile/';
    mkdirSync(newfile);
    console.log(results);
    for (var i = 0; i< results.length; i++) {
        if (results[i] != undefined){
            if (results[i].indexOf('.DS_Store') == -1) {
                tovideo(results[i], newfile + path.basename(results[i]));
            }
        }
    }
    function tovideo(oldfile, newfile) {
        var param = ['-i', oldfile, newfile];
        var frre = spawn(ffmpegPath, param);
        frre.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });

        frre.stderr.on('data', function(data) {
            console.log('执行中: ' + data);
        });

        frre.stdout.on('end', function(data) {
            console.log('exit '+ data);
        });
    }
}


/******************************工具方法**********************************/

// 视频裁剪
// ffmpeg -ss 00:00:00 -t 00:00:03 -i /Users/Cary/Desktop/aaa.mp4 -vcodec copy -acodec copy /Users/Cary/Desktop/ddd.mp4

var pa = '/Users/Cary/Desktop/';

var aaa = pa + 'aaa.mp4';
var bbb = pa + 'bbb.mp4';
var ccc = pa + 'ccc.mp4';

var lo = pa + 'logo.png';

// extractMp3(aaa);


// Tomp4(bbb);

// videoCut(aaa, "00:00:20", "00:00:10");
// videoCut(bbb, "00:01:10", "00:00:10");
// videoCut(ccc, "00:00:30", "00:00:10");

// videoJpg(ccc);

// mkdirSync(currentPath + 'cc');

// combineVideo(currentPath + "te");


// getVideoDuration(aaa);

// 合并视频

// ffmpeg -i /Users/Cary/Desktop/01折纸.mp4 -c:v libx264 -strict -2 /Users/Cary/Desktop/01折纸a264.mp4



var getFileinfo = function (filename) {

    fs.stat(filename, function(err, stats) {
        if (err) { throw err;}
        console.log(stats);
    });
}



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
	// -i
	case readme[0].fun:
        console.log("-i "+ process.argv[3])
        ToInfoVideo(process.argv[3]);
		break;
	// -tomp4
    case readme[1].fun:
        Tomp4(process.argv[3]);
        break;
    // -cjpg
    case readme[2].fun:
        videoJpg(process.argv[3]);
        break;
    // -vcut
    case readme[3].fun:
        videoCut(process.argv[3], process.argv[4], process.argv[5])
        break;
    // -emp3
    case readme[4].fun:
        extractMp3(process.argv[3]);
        break;
    // -vf
    case readme[5].fun:
        combineVideo(process.argv[3]);
        break;
    // -vfs
    case readme[6].fun:
    	var videoarr = new Array();
    	for(var i=3; i<process.argv.length; i++){
            videoarr.push(process.argv[i]);
		}
        combineVideoss(videoarr);
        break;
    // -vgif
    case readme[8].fun:
        toGif(process.argv[3], process.argv[4], process.argv[5]);
        break;
    // -vm
    case readme[9].fun:
        addWatermarks(process.argv[3], process.argv[4], process.argv[5]);
        break;
    // -gn
    case readme[10].fun:
        changePathFileName(process.argv[3], process.argv[4]);
        break;

    // -is
    case readme[11].fun:
        ToInfoVideos(process.argv[3]);
        break;
    // -vs
    case readme[12].fun:
        changeVideoSize(process.argv[3], process.argv[4]);
        break;

    // -vd
    case readme[7].fun:
        getVideoDuration(process.argv[3]);
        break;

    // -vs
    case readme[13].fun:
        getFileinfo(process.argv[3]);
        break;

    // -iss
    case readme[14].fun:
        ToInfoVideosss(process.argv[3]);
        break;


    default :
		console.log("参数不正确，请确认参数是否正确。。。");
        break;
}



// Parse arguments
var i = 2;
while ( i < process.argv.length) {
    var arg = process.argv[i];
    switch (arg) {
    case '--project' :
    case '-p' :

        i += 2;
        break;
    case '--server' :
    case '-s' :
        var serpath = process.argv[i+1];
        serverPath = serpath + '/hot-update-js/' + projectName + '/remote-assets/';
        
        i += 2;
        break;
    case '--src' :
    case '-s' :
        src = process.argv[i+1];
        i += 2;
        break;
    case '--dest' :
    case '-d' :
        dest = process.argv[i+1];
        i += 2;
        break;
    default :
        i++;
        break;
    }
}

// “NTSC“
// 720×480
//
// “朋友“
// 720×576
//
// “qntsc“
// 352×240
//
// “qpal“
// 352×288
//
// “SNTSC“
// 640×480
//
// “SPAL“
// 768X576
//
// “电影“
// 352×240
//
// “NTSC-膜“
// 352×240
//
// “SQCIF“
// 128x96
//
// “QCIF“
// 176×144
//
// “CIF“
// 352×288
//
// “4CIF“
// 704×576
//
// “16CIF“
// 1408x1152
//
// “QQVGA“
// 160×120
//
// “QVGA“
// 320×240
//
// “VGA“
// 640×480
//
// “SVGA“
// 800×600
//
// “XGA“
// 1024×768
//
// “UXGA“
// 1600×1200
//
// “QXGA“
// 2048×1536
//
// “SXGA“
// 1280×1024
//
// “QSXGA“
// 2560x2048
//
// “hsxga“
// 5120x4096
//
// “WVGA“
// 852x480
//
// “WXGA“
// 1366×768
//
// “WSXGA“
// 1600x1024
//
// “WUXGA“
// 1920×1200
//
// “woxga“
// 2560×1600
//
// “wqsxga“
// 3200x2048
//
// “wquxga“
// 3840x2400
//
// “whsxga“
// 6400x4096
//
// “whuxga“
// 7680x4800
//
// “CGA“
// 320x200的
//
// “EGA“
// 640X350
//
// “hd480“
// 852x480
//
// “HD720“
// 1280×720
//
// “HD1080“
// 1920×1080
//
// “2K“
// 2048x1080
//
// “2kflat“
// 1998x1080
//
// “2kscope“
// 2048x858
//
// “4K“
// 4096×2160
//
// “4kflat“
// 3996x2160
//
// “4kscope“
// 4096x1716
//
// “NHD“
// 640×360
//
// “hqvga“
// 240x160
//
// “WQVGA“
// 400X240
//
// “fwqvga“
// 432x240
//
// “HVGA“
// 分辨率480x320
//
// “QHD“
// 960×540
//
// “2kdci“
// 2048x1080
//
// “4kdci“
// 4096×2160
//
// “uhd2160“
// 3840X2160
//
// “uhd4320“
// 7680x4320



// http://sapi.seatent.com/api/v2/goods/searchingGoods?appkey=30664875&keyword=HD1114016254&memberId=29780&needFacet=1&pageNum=1&pageSize=50&timestamp=1515153115340&token=092a8c542cf5f34c7b5684d66909a55250914c9c&topSign=490E36792711FFB6CA731B4CB81FCB345E9C2717





