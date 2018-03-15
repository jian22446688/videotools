<template>
    <div class="layout">
        <Layout class="c-maxheight">
            <Header>
                <Menu mode="horizontal" theme="dark" active-name="1">
                    <div class="layout-logo"></div>
                    <div class="layout-nav">
                        <MenuItem name="1">
                            <h2>视频处理工具</h2>
                        </MenuItem>
                    </div>
                </Menu>
            </Header>
            <Layout :style="{padding: '0 0px', height: '100%'}">
                <Content :style="{minHeight: '280px', height: '100%', background: '#fff'}">
                    <Layout class="c-maxheight">
                        <Sider hide-trigger :style="{background: '#fff',overflow: 'auto'}">
                            <Menu @on-select="onLeftmenuSelectEvent" :theme="theme3" :active-name="activMenu" mode="vertical" width="180px">
                                <MenuGroup title="视频压缩">
                                    <MenuItem name="1">
                                        <Icon type="document-text"></Icon>
                                        转换压缩
                                    </MenuItem>
                                    <MenuItem name="2">
                                        <Icon type="chatbubbles"></Icon>
                                        视频拼接
                                    </MenuItem>
                                </MenuGroup>
                                <MenuGroup title="统计分析">
                                    <MenuItem name="3">
                                        <Icon type="heart"></Icon>
                                        用户留存
                                    </MenuItem>
                                    <MenuItem name="4">
                                        <Icon type="heart-broken"></Icon>
                                        流失用户
                                    </MenuItem>
                                    <MenuItem name="3">
                                        <Icon type="heart"></Icon>
                                        用户留存
                                    </MenuItem>
                                    <MenuItem name="4">
                                        <Icon type="heart-broken"></Icon>
                                        流失用户
                                    </MenuItem>
                                    <MenuItem name="3">
                                        <Icon type="heart"></Icon>
                                        用户留存
                                    </MenuItem>
                                    <MenuItem name="4">
                                        <Icon type="heart-broken"></Icon>
                                        流失用户
                                    </MenuItem>
                                    <MenuItem name="3">
                                        <Icon type="heart"></Icon>
                                        用户留存
                                    </MenuItem>


                                </MenuGroup>
                            </Menu>
                        </Sider>
                        <Content :style="{padding: '14px', minHeight: '280px', background: '#fff', height: '100%'}">

                            <router-view></router-view>

                        </Content>
                    </Layout>

                </Content>
            </Layout>
            <p class="layout-footer-center" @isclickmenu="test">2017-2018 &copy; cary</p>
        </Layout>
    </div>
</template>

<script>
    var path = require('path');
    import vt from '../../assets/js/VideoTools.js' //注意路径
    import date from '../../assets/js/Date.js' //注意路径
    //选择文件和文件夹
    var mainselectEvent = 'openfileeven';

    //只能选择文件夹
    var mainselectDir = "openselectdirectory";

    export default {
        name: "index",
        props: [],
        data () {
            return {
                activMenu: "1",
                seleceName: "未选择",
                theme3: 'light',
                percent: 0,
                inputFileName: "",
                seleSaveText: "",
                selecSavePath: "",
                currentMenuName: '',
            }
        },
        created() {
            //接受选择文件回调
            console.log("开始试调")
        },
        mounted() {
            console.log("开始试调aaa")
            this.$router.push('videocombine');
            this.activMenu = '2';
        },
        methods: {
            //左侧菜单点击事件
            onLeftmenuSelectEvent(name, e) {
                if(date.getIsClickMenu()){
                }else {
                    this.$Notice.error({
                        desc: '有任务没有完成。。。'
                    });
                    this.$nextTick(function () {
                    })
                    this.activMenu = this.currentMenuName;
                    return
                }
                console.log("name: " + name);
                this.currentMenuName = name
                if(name == 1){
                    this.$router.push('/');
                }
                if(name == 2){
                    this.$router.push('videocombine');
                }
            },
            test(e){
                console.log(e);
            }
        }
    }
</script>

<style scoped>

    .layout{
        background: #fff;
        position: relative;
        border-radius: 4px;
        overflow: hidden;
        height: 100%;
    }
    .layout-logo{
        width: 100px;
        height: 30px;
        background: #5b6270;
        border-radius: 3px;
        float: left;
        position: relative;
        top: 15px;

    }
    .layout-nav{
        width: 420px;
        margin: 0 auto;
        margin-right: 20px;
    }
    .layout-footer-center {
        z-index: 999;
        margin-top: 8px;
        margin-bottom: 8px;
        text-align: center;
        bottom: 0;
    }
    .c-maxheight {
        height: 100%;
    }
    .c-objpadding {
        margin-top: 8px;
        margin-bottom: 8px;

    }
</style>