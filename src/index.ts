const Koa = require("koa"); // 导入koa
const Router = require("koa-router"); //导入koa-router
const mysql = require("mysql"); // 导入mysql，连接mysql 需要用到
const app = new Koa(); // 实例化koa
const router = new Router(); // 实例化路由;

// mysqljs 连接 mysql数据库
let connection = mysql.createConnection({
  host: "127.0.0.1", // mysql所在的主机，本地的话就是 127.0.0.1 或者 localhost, 如果数据库在服务器上，就写服务器的ip
  user: "root", // mysql的用户名
  password: "hu12345", // mysql的密码
  database: "db1", // 你要连接那个数据库
});

// 连接 mysql
connection.connect((err: any) => {
  // err代表失败
  if (err) {
    console.log("数据库初始化失败");
  } else {
    console.log("数据库初始化成功");
  }
});

// 因为 mysqljs不支持 Promise方式CRUD数据
// 所以我们做一个简单的封装
function resDb(sql: string, params?: any) {
  return new Promise((resolve, reject) => {
    let sqlParamsList: [string] = [sql];
    if (params) {
      sqlParamsList.push(params);
    }
    connection.query(...sqlParamsList, (err: unknown, res: unknown) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

//请求 /userAll 的时候返回数据
router.get("/userAll", async (ctx: { redirect: any; body: unknown }) => {
  ctx.body = await resDb("SELECT * FROM user");
});
//请求 /addUser 接受前端传过来的数据，并且把数据持久化到数据库中
router.get(
  "/addUser",
  async (ctx: { query: { name: string; age: string }; redirect: any }) => {
    const { name, age } = ctx.query;
    // 判断 name 和 age是否有值，都有值时，数据存入数据库，刷新表格页面
    // 否则直接返回到表格页面
    if (name && age) {
      await resDb("INSERT INTO user values(null,?,?)", [name, age]);
    }
    //重定向路由，到 userAll
    ctx.redirect("/userAll");
  }
);
//请求 /updateUser 接受前端传过来的数据，并且把数据持久化到数据库中
router.get(
  "/updateUser",
  async (ctx: {
    query: { id: number; name: string; age: number };
    redirect: (arg0: string) => void;
  }) => {
    const { id, name, age } = ctx.query;
    // 判断 id, name 和 age是否有值，都有值时，更新数据库中的数据，刷新表格页面
    // 否则直接返回到表格页面
    if (id && name && age) {
      await resDb("UPDATE user SET name=?, age=? WHERE id=?", [name, age, id]);
    }
    //重定向路由，到 userAll
    ctx.redirect("/userAll");
  }
);

//请求/delete/:id  接受前端传过来的数据，并且把对应的id的数据删掉
router.get(
  "/delete/:id",
  async (ctx: { params: { id: number }; redirect: (arg0: string) => void }) => {
    const { id } = ctx.params;
    // 判断 id否有值，有值时，根据id删除数据库中的数据，刷新表格页面
    // 否则直接返回到表格页面
    if (id) {
      await resDb("DELETE FROM user WHERE id=?", [id]);
    }
    //重定向路由，到 userAll
    ctx.redirect("/userAll");
  }
);

// 创建一个路径为/hello的get请求
// router.get("/hello", async (ctx: { body: string; }) => {
//   // 返回 字符串 hello
//   ctx.body = "hello";
// });

// koa注册路由相关
app
  .use(router.routes())
  .use(router.allowedMethods())
  // 监听端口
  .listen(7000, () => {
    console.log("server running port:" + 7000);
  });
