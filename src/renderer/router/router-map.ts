import { RouteRecordRaw } from "vue-router";

// 定义路由规则
const routeMap: Array<RouteRecordRaw> = [
  {
    path: "/login",
    name: "login",
    component: () => import("@views/login/index.vue"),
  },
  {
    path: "/primary",
    name: "primary",
    component: () => import("@views/primary/index.vue"),
    children: [
      {
        path: "/primary/index",
        name: "index",
        component: () => import("@views/primary/index/index.vue"),
      }
    ],
  },
];

export default routeMap;
