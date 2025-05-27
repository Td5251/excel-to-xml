<template>
  <div class="box">
    <div class="option">
      <div @click="setWin('min')">
        <LineOutlined />
      </div>
      <div @click="setWin('max')">
        <ExpandOutlined />
      </div>
      <div @click="setWin('close')">
        <CloseOutlined style="font-size: 16px" />
      </div>
    </div>
    <div class="login-form" @keydown.enter="login">
      <div class="title">欢迎使用AI机器人</div>
      <div class="title-login">登录</div>

      <a-form>
        <span>账号</span>
        <a-form-item>
          <a-input class="ipt" placeholder="请输入账号" v-model:value="requestParam.username">
            <template #prefix>
              <UserOutlined class="site-form-item-icon" />
            </template>
          </a-input>
        </a-form-item>
        <span>密码</span>
        <a-form-item>
          <a-input-password class="ipt" placeholder="请输入密码" v-model:value="requestParam.password">
            <template #prefix>
              <LockOutlined class="site-form-item-icon" />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item label="记住我" class="auto-login">
          <a-switch v-model:checked="requestParam.autologin" />
        </a-form-item>

        <a-form-item label="机器人类型">
          <a-radio-group v-model:value="requestParam.authType">
            <a-radio value="dy">抖音</a-radio>
            <a-radio value="xhs">小红书</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item class="login-btn">
          <a-button type="primary" class="login-form-button" @click="login">
            登录
            <LoginOutlined style="font-size: 16px" />
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  CloseOutlined,
  ExpandOutlined,
  LineOutlined,
} from "@ant-design/icons-vue";
import { ref } from "vue";
import axiosInst from "../../../lib/axios-inst/renderer/index";
import { message } from "ant-design-vue";
import $td from "../../../lib/td";
import { onMounted } from "vue";

let requestParam = ref({
  username: "",
  password: "",
  authType: "dy",
  autologin: false,
});

let autoLogin = () => {
  let autologin = localStorage.getItem("autologin") == "true";
  requestParam.value.autologin = autologin;
  if (autologin) {
    requestParam.value.username = localStorage.getItem("username") || "";
    requestParam.value.password = localStorage.getItem("password") || "";
    // login();
  }
};

let getElectronApi = () => {
  return (window as any).primaryWindowAPI;
};

let setWin = (type: string) => {
  getElectronApi().setWin(type);
};
let login = () => {
  // getElectronApi().showPrimary();
  // return
  // getElectronApi().showPrimary();

  if (!requestParam.value.username || !requestParam.value.password) {
    message.error("请输入账号密码");
    return;
  }
  $td.openLoading();

  $td.request
    .request({
      url: "/user-account-web/userAccountLogin/loginByUsernameAndPassword",
      method: "post",
      data: requestParam.value,
    })
    .then(async (res: any) => {

      if (!res.success) {
        $td.message.error(res.errMsg || "登录失败")
        return
      }

      localStorage.setItem("authType", requestParam.value.authType);

      $td.closeLoading();

      if (requestParam.value.autologin) {
        localStorage.setItem("autologin", "true");
        localStorage.setItem("username", requestParam.value.username);
        localStorage.setItem("password", requestParam.value.password);
      }

      $td.setToken(res.data.token);
      localStorage.setItem("username", requestParam.value.username);

      // let userInfo = await $td.request.request({
      //   url: "/user-account-web/userAccount/getSelf",
      //   method: "post",
      // });

      // console.log("userinfo");

      // console.log(userInfo);



      // localStorage.setItem("token", res.data);

      getElectronApi().showPrimary(requestParam.value.authType);
    })
};

autoLogin();

onMounted(() => {
  //给span加上overflow:hidden;white-space:nowrap;text-overflow:ellipsis;样式
  let spanList = document.querySelectorAll("span");
  spanList.forEach((item) => {
    item.setAttribute("style", "overflow:hidden;");
  });
});
</script>

<style scoped>
.box {
  width: 100vw;
  height: 100vh;
  background-image: url("/bg.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-form {
  width: 500px;
  background-color: #fff;
  border-radius: 20px;
  box-sizing: border-box;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  padding-left: 2%;
  padding-right: 2%;
  overflow: hidden;
}

.title {
  font-size: 24px;
  text-align: center;
  margin-top: 20px;
  margin-bottom: 20px;
  color: #50649c;
  font-weight: 700;
}

.title-login {
  color: #a4abc5;
  font-size: 14px;
  text-align: center;
  transform: translateY(-10px);
}

.ipt {
  width: 100%;
  height: 40px !important;
  border: 1px solid #d9d9d9;
  border-radius: 20px;
  padding: 0 11px;
  margin-top: 5px;
}

.login-btn button {
  width: 100%;
  height: 40px;
  border-radius: 20px;
  background-color: #4d79f6;
}

.register {
  width: 100%;
  text-align: center;
  font-size: 14px;
  color: #a4abc5;
}

.option {
  width: 100px;
  display: flex;
  justify-content: flex-end;
  position: fixed;
  right: 0px;
  top: 20px;
  cursor: pointer;
  color: #fff;
  z-index: 99;
}

.option div {
  margin-right: 10px;
}
</style>
