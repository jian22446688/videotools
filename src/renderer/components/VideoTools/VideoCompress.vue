<template>
    <div>
        <h2 class="c-objpadding" style="text-align: center">压缩视频</h2>
        <div>
            <h3 class="c-objpadding">请选择处理的视频文件</h3>
            <div class="c-objpadding">
                <RadioGroup v-model="runNumberLable">
                    <span>同步处理的个数：</span>
                    <Radio label="1"></Radio>
                    <Radio label="2"></Radio>
                    <Radio label="3"></Radio>
                    <Radio label="5"></Radio>
                    <Radio label="8"></Radio>
                    <Radio label="10"></Radio>
                </RadioGroup>
            </div>
            <div v-if="is_win_selectfile" class="c-objpadding">
                <span>是否选择文件夹</span>
                <i-switch v-model="is_win_switch"></i-switch>
            </div>
            <Button :disabled="isBtnkey" class="c-objpadding" @click="onSelectFile">选择文件</Button>
            <span :style="{marginLeft: '8px'}" v-text="seleceName"></span>
            <div>
                <span>文件名：</span>
                <Input class="c-objpadding" :disabled="inputName" @on-change="inputChange" v-model="inputFileName" placeholder="请选择文件..." style="width: 300px;"></Input>
                <Select :disabled="isBtnkey" v-model="selectSuffix" @on-change="inputChange" style="width:70px">
                    <Option v-for="item in cityList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
            </div>
            <Button :disabled="isBtnkey" class="c-objpadding" @click="onSelectSaveFile">选择保存文件夹</Button>
            <span v-text="seleSaveText">未选择保存文件夹，默认视频当前文件夹</span>

            <div>
                <span>是否更改大小：</span>
                <i-switch :disabled="isBtnkey" v-model="isChangeVideoSize"></i-switch>
                <Select :disabled="!isChangeVideoSize" v-model="curVideoSize" @on-change="inputChange" style="width:130px">
                    <Option v-for="item in videoSize" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
            </div>

            <Button :disabled="isBtnkey" class="c-objpadding" style="display: block" type="primary" size="large" @click="onstart">开始</Button>
            <div v-if="inputName" class="c-objpadding">
                <span>转换完成是否打开文件夹</span>
                <i-switch v-model="isOpenfile"></i-switch>
            </div>
            <Table border height="245" :columns="percentTable" size="small" :data="percentData"></Table>
        </div>
    </div>
</template>

<script>
    import ISwitch from "iview/src/components/switch/switch";
    var path = require('path');
    var fs = require('fs');
    import vt from '../../assets/js/VideoTools' //注意路径
    import cdata from '../../assets/js/Date' //注意路径
    var queuefun = require('queue-fun');
    var Queue = queuefun.Queue(); //初始化Promise异步队列类
    var q = queuefun.Q;  //配合使用的Promise流程控制类，也可以使用q.js代替
    //实列化一个最大并发为1的队列
    var queue1 = new Queue(5);
    export default {
        components: { ISwitch },
        name: "video-compress",
        props: [],
        data(){
          return{
              activMenu: "1",
              seleceName: "未选择",
              runNumberLable: "5",
              theme3: 'light',
              percent: 0,
              inputFileName: "",
              inputName: false,
              is_win_selectfile: false,
              is_win_switch: false,
              seleSaveText: "",
              selecSavePath: "",
              isOpenfile: false,
              cityList: cdata.cityList,
              isChangeVideoSize: false,
              curVideoSize: "1920*1080",
              videoSize: cdata.videoSizeList,
              selectSuffix: '.mp4',
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
            onSelectFile(){
                var en = "selefile";
                var thia = this;
                var even = cdata.getOpenFileMeaStr();
                if(this.is_win_switch){
                    even = cdata.getOpenSelectdirectory();
                }
                this.$electron.ipcRenderer.send(even, en);
                this.$electron.ipcRenderer.on(en, function (event, patha) {
                    thia.seleceName = patha[0];
                    var basename = path.basename(patha[0], path.extname(patha[0]));
                    if(!vt.fsStatIsDirSync(thia.seleceName)){
                        thia.inputFileName = basename + "_new";
                        thia.inputName = false;
                        thia.seleSaveText = path.dirname(patha[0]) + "/" + thia.inputFileName + thia.selectSuffix;

                    }else {
                        thia.inputName = true;
                        thia.inputFileName = "";
                        thia.seleSaveText = thia.seleceName + "/newVideo";
                    }
                    thia.selecSavePath = path.dirname(patha[0]);
                })
            },
            onSelectSaveFile(){
                var thia = this;
                if(this.inputFileName == ""){
                    this.$Message.warning('This is a warning tip');
                    return;
                }
                var en = "selectsave"
                this.$electron.ipcRenderer.send(cdata.getOpenSelectdirectory(), en);
                this.$electron.ipcRenderer.on(en, function (event, arg) {
                    thia.selecSavePath = arg[0];
                    console.log("argaaaa: "+ arg);
                    if(thia.inputName){
                        thia.seleSaveText =  arg[0] + "/" + thia.inputFileName + thia.selectSuffix;
                    }else {
                        thia.seleSaveText = arg[0] + "/newVideo";
                    }
                })
            },
            inputChange(event){
                if(!this.inputName){
                    if(this.selecSavePath != ""){
                        this.seleSaveText = this.selecSavePath + "/" + this.inputFileName + this.selectSuffix;
                    }
                }
            },
            onstart(){
                var thia = this;

                if(this.seleceName == "未选择" || this.seleSaveText == ""){
                    this.$Notice.error({
                        title: '提示',
                        desc: '请选择一个文件。。。'
                    });
                    return;
                }
                this.isBtnkey = true;
                queue1.option('event_begin', function () {
                    console.log("列队开始：")
                });
                queue1.option('event_end', function () {
                    console.log("列队完成");
                    thia.isBtnkey = false;
                    if(thia.isOpenfile){
                        var pa;
                        if(thia.inputName){
                            pa = thia.seleSaveText;
                        }else {
                            pa = path.dirname(thia.seleSaveText);
                        }
                        thia.$electron.shell.showItemInFolder(pa);
                    }
                    cdata.setIsClikcMenu(true);
                })
                queue1.setMax(this.runNumberLable);
                if(this.seleSaveText == ""){
                    this.seleSaveText = path.dirname(this.seleceName) + "/" + this.inputFileName + this.selectSuffix;
                }
                if(this.inputName){
                    var ds = vt.fsWalkExec(this.seleceName);
                    if(ds.length == 0){
                        this.$Notice.warning({title: '文件个数：'+ ds.length+" 文件为空" })
                        return
                    }
                    if(vt.fsExistsSync(this.seleSaveText)){
                        this.seleSaveText = path.dirname(this.seleSaveText) + "/newVideo_"+ new Date().getTime().toString();
                        vt.mkdirsSync(this.seleSaveText);
                    }else {
                        vt.mkdirsSync(this.seleSaveText);
                    }
                    for(var i=0; i<ds.length; i++){
                        var savfil = this.seleSaveText + "/" + path.basename(ds[i], path.extname(ds[i])) + this.selectSuffix;
                        queue1.push(this.oneVideo, [ds[i], savfil]).then(console.log);
                    }
                    queue1.start();
                }else {
                    queue1.push(this.oneVideo, [this.seleceName, this.seleSaveText]).then();
                    queue1.start();
                }
                cdata.setIsClikcMenu(false);
            },
            oneVideo(selefile, savepath){
                var deferred = q.defer();
                var thia = this;
                //删除文件
                if(vt.fsExistsSync(savepath)) {vt.fsUnlinkSync(savepath);}
                var objper = { name: savepath, percent: 0 }
                let objffmpeg = vt.getFfmpeg(selefile);
                let duration = 0;
                if(thia.isChangeVideoSize){
                    objffmpeg.size(thia.curVideoSize.replace('*', 'x')).autopad();
                }
                objffmpeg.on('error', function(err, stdout, stderr) {
                    thia.isBtnkey = false;
                    cdata.setIsClikcMenu(true);
                    thia.$Notice.error({ title: '转换失败', desc: " 转换失败：" + path.basename(selefile) });
                    deferred.resolve( "导出错误：");
                }).on('codecData', function(data) {
                    duration = vt.toSecond(data.duration);
                }).on('progress', function(progress) {
                    objper.percent = Math.round((vt.toSecond(progress.timemark) / duration) * 100)
                }).on('end', function() {
                    thia.$Notice.success({ title: '转换成功', desc: "转换成功" + path.basename(selefile) });
                    thia.isBtnkey = false;
                    cdata.setIsClikcMenu(true);
                    deferred.resolve("导出完成");
                }).save(savepath);
                thia.percentData.unshift(objper);
                return deferred.promise;
            },
            ontest(){
                console.log(process.platform);
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