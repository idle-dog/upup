# 项目开发及工具使用说明

## 第一步：领取任务

在 [issues](https://github.com/idle-dog/upup/labels/%E4%BB%BB%E5%8A%A1) 中查看并领取任务

## 第二步：安装运行环境

安装 [nodejs](https://nodejs.org/) 运行环境

## 第三步：克隆仓库

```bash
git clone git@github.com:idle-dog/upup.git
cd upup
```

## 第四步：安装fis

本项目选择fis作为集成开发环境

```bash
npm i -g fis
```
## 第五步：启动调试服务器

fis内置了一个调试服务器，方便本地预览项目

```bash
fis server start
```

## 第六步：构建

```bash
fis release -wL
```

在项目目录中执行 ``fis release`` 命令，即可将项目构建到调试服务器的临时目录中进行预览，release命令后添加的 ``-wL`` 参数表示对项目代码进行修改监听，发现有改动会立即触发重新构建，并自动刷新浏览器。

> 注意，参数中的 ``L`` 是大写。

## 第七步：预览

使用浏览器访问 ``http://localhost:8080/`` 进行项目预览

## 第八步：开发

修改代码，并保存，浏览器会自动刷新页面

## 第九步：提交

功能开发完成后，即可提交代码，并发起 pull request 合并至当前项目中。