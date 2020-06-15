# BMapLib.CanvasMarkerClusterer
a marker cluster for baidu map javascript api v3.0 based on canvas.

#### Idea
1. 基于百度地图JS API v3.0提供的[`CanvasLayer`](http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference_3_0.html#a3b28)实现。(百度地图官方提供的基于dom实现的MarkerCluster不能应对大量marker的场景, 基本在400~500个marker时就已经有明显的拖拽卡顿的情况, CanvasLayer基本上可以将绘制各种overlay的能力完全开放给我们呢)。
2. 借助zrender的能力简化绘制流程, 事件绑定等工作, 需要在canvas层中实现marker和label等常见覆盖物组件。
3. 实现marker的聚合操作。
4. 实现label的自动避让能力, marker和label组合使用是很常见的场景, 但label一般承载的文字信息较多, 当marker点较密集时, label产生重叠导致信息一团乱麻根本无法查看。实现label的自动避让可以让label在合适的地方进行绘制, 如果不能找到合适的位置绘制, 则在鼠标hover时绘制, 这样能保证marker信息清楚明了。

#### TODO LIST
- [ ] 实现Marker, Label组件, 能完成基本的显示功能。
- [ ] 实现MarkerClusterer组件, 完成标记点的聚合实现。
- [ ] 实现Label的自动避让功能。

#### Dev
```sh
yarn install or npm install
# at china main land, install speed may very slow, you can set registry
# for temp use
yarn install --registry=https://registry.npm.taobao.org
# or
npm install --registry=https://registry.npm.taobao.org
# for consistent use
yarn config set registry https://registry.npm.taobao.org
# or
npm config set registry https://registry.npm.taobao.org
```