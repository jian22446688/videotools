<template>
  <div id="wrapper">
    <img id="logo" src="~@/assets/logo.png" alt="electron-vue">
    <main>
      <div class="left-side">
        <span class="title">
          Welcome to your new project!
        </span>
        <Slider v-model="value" range></Slider>
        <br>
        <system-information></system-information>
      </div>


      <Menu :theme="theme3" active-name="1">
        <MenuGroup title="内容管理">
          <MenuItem name="1">
            <Icon type="document-text"></Icon>
            文章管理
          </MenuItem>
          <MenuItem name="2">
            <Icon type="chatbubbles"></Icon>
            评论管理
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
        </MenuGroup>
      </Menu>
      <br>


      <div class="right-side">
        <Upload
                multiple
                type="drag"
                action="//jsonplaceholder.typicode.com/posts/">
          <div style="padding: 20px 0">
            <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
            <p>Click or drag files here to upload</p>
          </div>
        </Upload>
      </div>
    </main>
  </div>
</template>

<script>
    import SystemInformation from './LandingPage/SystemInformation'

    export default {
        name: 'landing-page',
        components: { SystemInformation },
        methods: {
            open (link) {
                this.$electron.shell.openExternal(link)
            }
        },
        data () {
            return {
                value: [20, 50],
                theme3: 'light'
            }
        }
    }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  #wrapper {
    background:
            radial-gradient(
                    ellipse at top left,
                    rgba(255, 255, 255, 1) 40%,
                    rgba(229, 229, 229, .9) 100%
            );
    height: 100vh;
    padding: 60px 80px;
    width: 100vw;
  }

  #logo {
    height: auto;
    margin-bottom: 20px;
    width: 420px;
  }

  main {
    display: flex;
    justify-content: space-between;
  }

  main > div { flex-basis: 50%; }

  .left-side {
    display: flex;
    flex-direction: column;
  }

  .welcome {
    color: #555;
    font-size: 23px;
    margin-bottom: 10px;
  }

  .title {
    color: #2c3e50;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 6px;
  }

  .title.alt {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .doc p {
    color: black;
    margin-bottom: 10px;
  }

  .doc button {
    font-size: .8em;
    cursor: pointer;
    outline: none;
    padding: 0.75em 2em;
    border-radius: 2em;
    display: inline-block;
    color: #fff;
    background-color: #4fc08d;
    transition: all 0.15s ease;
    box-sizing: border-box;
    border: 1px solid #4fc08d;
  }

  .doc button.alt {
    color: #42b983;
    background-color: transparent;
  }
</style>
