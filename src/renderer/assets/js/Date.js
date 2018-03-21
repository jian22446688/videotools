// noinspection JSAnnotator
var isClickMenu = true;
// noinspection JSAnnotator
export default {
    cityList: [
        {
            value: '.mp4',
            label: '.mp4'
        },
        {
            value: '.avi',
            label: '.avi'
        },
        {
            value: '.mov',
            label: '.mov'
        },
        {
            value: '.flv',
            label: '.flv'
        }
    ],
    videoSizeList: [//480*272、1280*720、1366*768、1920*1080
        {
            value: '480*272',
            label: '480*272'
        },
        {
            value: '1280*720',
            label: '1280*720'
        },
        {
            value: '1366*768',
            label: '1366*768'
        },
        {
            value: '1920*1080',
            label: '1920*1080'
        },
    ],
    custumVideoType: {name: 'Movies', extensions: ['mov', 'avi', 'mp4']},
    custumImageType: {name: 'Images', extensions: ['jpg', 'jpeg', 'png']},
    //打开文件和文件夹
    getOpenFileMeaStr(){
        return "openfileeven";
    },
    //只能打开文件夹
    getOpenSelectdirectory(){
      return "openselectdirectory";
    },
    //打开自定文件
    getOpenSelectCustum(){
      return "openselectcustumfile";
    },
    getIsClickMenu(){
        return isClickMenu;
    },
    setIsClikcMenu(ismenu){
        isClickMenu = ismenu;
    },

}
