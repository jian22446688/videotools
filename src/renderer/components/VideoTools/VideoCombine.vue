<template>
    <div>
        <h2 class="c-objpadding" style="text-align: center">视频拼接</h2>
        <div>
            <h3 class="c-objpadding">请选择处理的视频文件</h3>
           <div>
               <Button :disabled="isBtnkey" class="c-objpadding" @click="onSelectHeadFile">选择片头文件</Button>
               <span :style="{marginLeft: '8px'}" v-text="seleceHeadName"></span>
           </div>
            <div>
               <Button :disabled="isBtnkey" class="c-objpadding" @click="onSelectEndingFile">选择片尾文件</Button>
               <span :style="{marginLeft: '8px'}" v-text="seleceEndingName"></span>
           </div>
            <div v-if="is_win_selectfile" class="c-objpadding">
                <span>是否选择文件夹</span>
                <i-switch v-model="is_win_switch"></i-switch>
            </div>
            <div>
                <Button :disabled="isBtnkey" class="c-objpadding" @click="onSelectVideoFile">选择视频文件</Button>
                <span :style="{marginLeft: '8px'}" v-text="seleceVideoName"></span>
            </div>

            <div>
                <span>文件名：</span>
                <Input class="c-objpadding" :disabled="inputName" @on-change="inputChange" v-model="inputFileName" placeholder="请选择文件..." style="width: 300px;"></Input>
                <Select v-model="selectSuffix" @on-change="inputChange" style="width:70px">
                    <Option v-for="item in cityList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
            </div>

            <Button :disabled="isBtnkey" class="c-objpadding" @click="onSelectSaveFile">选择保存文件夹</Button>
            <span v-text="seleSaveText">未选择保存文件夹，默认视频当前文件夹</span>
            <Button :disabled="isBtnkey" class="c-objpadding" style="display: block" type="primary" size="large" @click="onBtnStart">开始</Button>
            <div class="c-objpadding">
                <span v-if="inputName">
                    <span>转换完成是否打开文件夹</span>
                    <i-switch v-model="isOpenfile"></i-switch>
                </span>
                <span>输出文件大小：</span>
                <Select v-model="videoSize" @on-change="inputChange" style="width:110px">
                    <Option v-for="item in videoSizeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
            </div>
            <Table border height="205" :columns="percentTable" size="small" :data="percentData"></Table>
        </div>
    </div>
</template>

<script>

    var path = require('path');
    var fs = require('fs');
    import vt from '../../assets/js/VideoTools.js' //注意路径
    import data from '../../assets/js/Date.js' //注意路径
    var queuefun = require('queue-fun');
    var Queue = queuefun.Queue(); //初始化Promise异步队列类
    var q = queuefun.Q;  //配合使用的Promise流程控制类，也可以使用q.js代替
    //实列化一个最大并发为1的队列
    var queue1 = new Queue(1);

    var vheadPath = "temp/temp_vheadVideo.mp4";
    var vendingPath = "temp/temp_vengingVideo.mp4";
    var vbine ="temp_Video.txt";
    var vtempPath ="temp/temp_Video.mp4";
    export default {
        name: "video-combine",
        props: [],
        data(){
            return {
                selectSuffix: ".mp4",
                cityList: data.cityList,
                videoSize: '1920*1080',
                videoSizeList: data.videoSizeList,
                seleceHeadName: "未选择",
                seleceEndingName: "未选择",
                seleceVideoName: "未选择",
                seleSaveText: "",
                selecSavePath: "",
                inputFileName: "",
                inputName: false,
                is_win_selectfile: false,
                is_win_switch: false,
                isOpenfile: false,
                isBtnkey: false,
                percentTable: [
                    {
                        title: '文件路径名字',
                        key: 'name',
                    },
                    {
                        title: '进度',
                        width: 200,
                        render: (h, params) => {
                            return h('div', [
                                h('Progress', {
                                    props: {
                                        percent: this.percentData[params.index].percent,
                                    },
                                    style: {
                                        padding: '0',
                                        paddingLeft: '0px',
                                        marginRight: '0px'
                                    },
                                }),
                            ]);
                        }
                    },
                ],
                percentData: [
                    // {
                    //     name: 'John Brown',
                    //     percent: 18,
                    // }
                ],
            }
        },
        created() {

        },
        mounted() {
            if(process.platform == "win32"){
                this.is_win_selectfile = true;
            }else {
                this.is_win_selectfile = false;
            }
        },
        methods: {
            //选择片头
            onSelectHeadFile(){
                // var en = "selecustumfile";
                var thia = this;
                var en = {
                    event: "selecustumfilea",
                    sustumType: data.custumVideoType
                }
                this.$electron.ipcRenderer.send(data.getOpenSelectCustum(), en);
                this.$electron.ipcRenderer.once(en.event, function (event, patha) {
                    thia.seleceHeadName = patha.file[0];
                })
            },
            //选择片尾
            onSelectEndingFile(){
                var thia = this;
                var en = {
                    event: "selecustumfileb",
                    sustumType: data.custumVideoType
                }
                this.$electron.ipcRenderer.send(data.getOpenSelectCustum(), en);
                this.$electron.ipcRenderer.once(en.event, function (event, patha) {
                    thia.seleceEndingName = patha.file[0];
                })
            },
            //选择视频
            onSelectVideoFile(){
                var thia = this;
                var en = 'selecustumfilec';
                var even = data.getOpenFileMeaStr();
                if(this.is_win_switch){
                    even = data.getOpenSelectdirectory();
                }
                this.$electron.ipcRenderer.send(even, en);
                this.$electron.ipcRenderer.once(en, function (event, patha) {
                    thia.seleceVideoName = patha[0];
                    if(!vt.fsStatIsDirSync(thia.seleceVideoName)){
                        thia.inputName = false;
                        thia.inputFileName = path.basename(patha[0], path.extname(patha[0])) + "_new_g";
                        thia.selectSuffix = path.extname(patha[0]);
                        thia.seleSaveText = path.dirname(patha[0]) + "/" + thia.inputFileName + thia.selectSuffix;
                        thia.selecSavePath = path.dirname(patha[0]);
                    }else {
                        thia.inputName = true;
                        thia.inputFileName = "";
                        thia.seleSaveText = patha[0] + "/newVideo_g";
                    }
                })
            },
            //选择保存文件夹
            onSelectSaveFile(){
                var thia = this;
                var en = "selecustumfiled";
                this.$electron.ipcRenderer.send(data.getOpenSelectdirectory(), en);
                this.$electron.ipcRenderer.once(en, function (event, patha) {
                    thia.selecSavePath = path.dirname(patha[0]) + "/";
                    thia.inputChange();
                })
            },
            inputChange(event){
                if(!this.inputName){
                    this.seleSaveText = this.selecSavePath + "/" + this.inputFileName + this.selectSuffix;
                }
            },
            onBtnStart(){
                var thia = this;
                if(!(this.seleceHeadName != "未选择") && !(this.seleceEndingName != "未选择")){
                    this.$Notice.error({title: '请选择一个片头或者片尾。。。', });
                    return;
                }
                if(thia.seleceVideoName == "未选择"){
                    this.$Notice.error({title: '必须要选择一个视频文件或者视频文件夹。。。', })
                    return
                }
                var headNumber = 0;
                var objes = [];
                if(this.seleceHeadName != "未选择"){
                    var obje = {
                        videoPath: this.seleceHeadName,
                        outPath: vt.getCurrentPath() + vheadPath,
                        videoSize: this.videoSize,
                        pos: 1,
                    }
                    objes.push(obje);
                }
                if(this.seleceEndingName != "未选择"){
                    var obje = {
                        videoPath: this.seleceEndingName,
                        outPath: vt.getCurrentPath()+vendingPath,
                        videoSize: this.videoSize,
                        pos: 2,
                    }
                    objes.push(obje);
                }
                queue1.option('event_begin', function () {
                    console.log("列队开始：")
                });
                queue1.option('event_end', function () {
                    console.log("列队完成");
                    if(thia.isOpenfile){
                        thia.$electron.shell.showItemInFolder(thia.seleSaveText);
                    }
                    thia.isBtnkey = false;
                    data.setIsClikcMenu(true);
                })
                objes.forEach(function (obe) {
                    thia.oneVideo(obe, function (pa) {
                        headNumber ++;
                        if(headNumber == objes.length){
                            if(thia.inputName){
                                var ds = vt.fsWalkExec(thia.seleceVideoName);
                                if(ds.length == 0){
                                    thia.$Notice.warning({title: '文件个数：'+ ds.length+" 文件为空" })
                                    return
                                }
                                if(vt.fsExistsSync(thia.seleSaveText)){
                                    thia.seleSaveText = path.dirname(thia.seleSaveText) + "/newVideo_g_"+ new Date().getTime().toString();
                                    vt.mkdirsSync(thia.seleSaveText);
                                }else {
                                    vt.mkdirsSync(thia.seleSaveText);
                                }
                                process.nextTick(function () {
                                    ds.forEach(function (file) {
                                        var vsave = thia.seleSaveText + "/" + path.basename(file, path.extname(file)) + thia.selectSuffix;
                                        console.log(file);
                                        console.log(vsave);
                                        queue1.push(thia.onStartBineVideo, [file, vsave, objes]).then(console.log);
                                    })
                                    queue1.start();
                                })
                            }else {
                                thia.onStartBineVideo(thia.seleceVideoName, thia.seleSaveText, objes);
                            }
                        }
                    })
                });
                this.isBtnkey = true;
                data.setIsClikcMenu(false);
            },
            oneVideo(obj, cabk){
                var thia = this;
                //删除文件
                if(vt.fsExistsSync(obj.outPath)) {vt.fsUnlinkSync(obj.outPath);}
                var objper = { name: obj.videoPath, percent: 0 }
                let duration = 0;
                vt.getFfmpeg(obj.videoPath).fps(25).size(obj.videoSize.replace("*", "x")).audioFrequency(48000)
                    .on('codecData', function(data) {
                        duration = vt.toSecond(data.duration);
                    }).on('error', function(err, stdout, stderr) {
                        thia.$Notice.error({ title: '转码错误' });
                    thia.isBtnkey = false;
                    data.setIsClikcMenu(true);
                    }).on('progress', function(progress) {
                        let per = (vt.toSecond(progress.timemark) / duration) * 100;
                        if(per > 100){
                            per = 100;
                        }
                        objper.percent = Math.round(per)

                    }).on('end', function() {
                        thia.$Notice.success({ title: '转码成功' });
                        cabk();
                    }).save(obj.outPath);
                thia.percentData.unshift(objper);
            },
            //开始处理视频
            onStartBineVideo(vpath, savep, obList){
                var deferred = q.defer();
                var thia = this;
                var obje = {
                    videoPath: vpath,
                    outPath: vt.getCurrentPath()+vtempPath,
                    videoSize: this.videoSize,
                };
                var vheList = obList;
                this.oneVideo(obje, function () {
                    thia.writeTxtStr(vheList);
                    //删除文件
                    if(vt.fsExistsSync(thia.seleSaveText)) { vt.fsUnlinkSync(thia.seleSaveText); }
                    var objparm = { param:  ['-f', 'concat', '-safe','0','-i' , path.join(vt.getCurrentPath()+vbine), '-c', 'copy', path.join(savep)] }
                    vt.toSpawn(objparm, function (event) {
                        //视频合并完成
                        if(event.name == "end"){
                            if(!thia.inputName){
                                vt.fsUnlinkSync(vt.getCurrentPath()+vheadPath);
                                vt.fsUnlinkSync(vt.getCurrentPath()+vendingPath);
                            }
                            vt.fsUnlinkSync(vt.getCurrentPath()+vtempPath);
                            thia.$Notice.success({ title: '视频合并完成', desc: thia.seleSaveText+ " 合并成功" });
                            deferred.resolve( "视频合并完成：");
                            if(!thia.inputName){thia.isBtnkey = false;}
                            data.setIsClikcMenu(true);
                        }
                    })
                });
                return deferred.promise;
            },
            writeTxtStr(vPath){
                var txtStr = '';
                if(vPath.length == 1){
                    if(vPath[0].pos == 1){
                        txtStr = "file "+ "'"+path.join(vt.getCurrentPath()+vheadPath)
                            + "'" + "\n"+ "file "+ "'"+ path.join(vt.getCurrentPath()+vtempPath) + "'"
                    }else if(vPath[0].pos == 2){
                        txtStr = "file "+ "'"+ path.join(vt.getCurrentPath()+vtempPath)
                            + "'" + "\n" + "file " + "'"+path.join(vt.getCurrentPath()+vendingPath)+ "'"
                    }
                }
                if(vPath.length == 2){
                    txtStr = "file "+ "'"+path.join(vt.getCurrentPath()+vheadPath)
                        + "'" + "\n"+ "file "+ "'"+path.join( vt.getCurrentPath()+vtempPath) + "'" + "\n" + "file " + "'"+path.join(vt.getCurrentPath()+vendingPath)+ "'"
                }
                fs.writeFileSync(path.join(vt.getCurrentPath()+vbine), txtStr);
            },
            ontest(){
                console.log(Math.round(7.30));
            },
        }
    }
</script>

<style scoped>
    .c-objpadding {
        margin-top: 8px;
        margin-bottom: 8px;
    }
</style>