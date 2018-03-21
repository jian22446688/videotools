<template>
    <div class="layout">
        <Layout class="c-maxheight">
            <Header>
                <Menu mode="horizontal" theme="dark" active-name="1">
                    <div class="layout-logo">
                        <h3 style="top: 0; color: #e9eafc; text-align: center">智者乐学</h3>
                    </div>
                    <div class="layout-nav">
                        <MenuItem name="1">
                            <h2 style="text-align: center">视频处理工具</h2>
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
                                    <MenuItem v-for="item in leftMenu" :key="item.name" :name="item.name">
                                        <Icon :type="item.icon"></Icon>
                                        {{item.title}}
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
            <p class="layout-footer-center">cary</p>
        </Layout>
    </div>
</template>

<script>
    import vt from '../../assets/js/VideoTools.js' //注意路径
    import date from '../../assets/js/Date.js' //注意路径
    export default {
        name: "index",
        props: [],
        data () {
            return {
                activMenu: "/",
                theme3: 'light',
                currentMenuName: '',
                leftMenu: [
                    {
                        title: '压缩转换',
                        name: '/',
                        icon: 'filing'
                    },
                    {
                        title: '视频拼接',
                        name: 'videocombine',
                        icon: 'link'
                    },
                    {
                        title: '添加水印',
                        name: 'watermark',
                        icon: 'ios-browsers'
                    }
                ]
            }
        },
        created() {
            let curPath =  '';
            if (process.env.NODE_ENV !== 'development') {
                console.log("运行环境");
                curPath = process.resourcesPath + "/static/";
            }else {
                curPath = process.cwd() + "/static/"
                console.log("开发环境");
            }
            vt.setCurrentPath(curPath);
        },
        mounted() {
            this.onLeftmenuSelectEvent('watermark');
        },
        methods: {
            //左侧菜单点击事件
            onLeftmenuSelectEvent(name) {
                if(!date.getIsClickMenu()){
                    this.$Notice.error({ desc: '有任务没有完成。。。' });
                    this.activMenu = this.currentMenuName;
                    return
                }
                this.currentMenuName = name
                this.$router.push(name);
            },
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
        line-height: 30px;
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