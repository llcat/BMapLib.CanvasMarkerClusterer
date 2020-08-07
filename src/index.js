import { init, dispose } from 'zrender'
import {
    createLocationMarker,
} from './components/marker'
import Cluster from './components/cluster'
import { createLabel } from './components/label'
import { checkBMap } from './utils'
import { getExtendedBounds } from './utils';

import points from './assets/points.json'
import { createClusterTextIcon } from './components/cluster';
import { Circle, Rect } from 'zrender'

export default class MarkerClusterer {

    /**
     * MarkerClusterer构造函数
     * @param {*} map - BMap实例
     * @param {*} options - 配置项
     */
    constructor(map, opts) {
        checkBMap()
        let defaultOpts = {
            clusterMinSize: 2, // 最小聚合个数, 小于该值的, 不会显示点聚合图标
            gridSize: 60, // 点聚合方格的大小
            maxZoom: 18, // 最大的缩放等级, 超过该等级不进行聚合
            needAverageCenter: false
        }
        opts = opts || {}
        this.opts = {
            ...defaultOpts,
            ...opts
        }
        // marker数组
        this.markers = [];
        // cluster数组
        this.clusters = [];
        this._map = map;
        this._canvasLayer = new BMap.CanvasLayer({
            update: this.updateLayer.bind(this)
        })
        this._map.addOverlay(this._canvasLayer)
    }

    /**
     * 更新百度地图的CanvasLayer
     * 所有的绘制操作全部在这里执行, 包括marker点和cluster点的绘制
     */
    updateLayer() {
        dispose(this._zr)
        const canvas = this._canvasLayer.canvas;
        this._zr = init(canvas);
        // this._update()
        // this.clusters.forEach(c => {
        //     const renderItems = c.getRenderElement()
        //     if (renderItems.type === 'cluster') {
        //         const pix = this._map.pointToPixel(c.getCenterPoint())
        //         console.log(pix)
        //         const { textIcon } = renderItems
        //         textIcon.position = [pix.x, pix.y]
        //         this._zr.add(textIcon)
        //     } else if (renderItems.type === 'markers') {
        //         const { markers } = renderItems
        //         markers.forEach(m => {
        //             const pix = this._map.pointToPixel(m.point)
        //             m.group.position = [pix.x, pix.y]
        //             this._zr.add(m.group)
        //         })
        //     }
        // })

        canvas.addEventListener('click', function (e) {
            console.log('canvas click', e)
        })

        // 测试
        const bg = new Rect({
            shape: {
                x:500,
                y:500,
                width: 100,
                height: 100
            },
            style: {
                fill: null,
                stroke: 'rgba(255, 155, 144, 0.6)',
            }
        })
        this._zr.add(bg)
        const testPosition = [500, 500]
        const cp = new Circle({
            shape: {
                x: 0,
                y: 0,
                r: 2
            },
            style: {
                fill: 'red'
            },
            zlevel: 200
        })
        cp.position = testPosition
        this._zr.add(cp)
        const textIcon = createClusterTextIcon({
            size: 20
        })
        textIcon.position = testPosition
        const child = textIcon.childOfName('pp')
        child.on('click', function (e) {
            console.log('circle test click', e)
        })
        console.log(child)
        console.log('---update layer')
        const c = new Circle({
            shape: {
                x: 0,
                y: 0,
                r: 16
            },
            style: {
                text: '1',
                fill: '#ccc',
                fontSize: 14,
                fontWeight: 600
            }
        })
        c.position = testPosition
        c.on('click', function (e) {
            console.log('---------测试', e)
            const rand = () => Math.floor(Math.random()*255)
            e.target.attr('style', {
                fill: `rgb(${rand()}, ${rand()}, ${rand()})`
            })
        })
        this._zr.add(c)

        // 直接使用canvas的api测试
        // if (canvas.getContext) {
        //     const ctx = canvas.getContext('2d')
        //     ctx.fillStyle = "green";
        //     ctx.fillRect(500, 500, 10, 10)
        // }
        // canvas.addEventListener('click', (e) => {
        //     e.stopPropagation()
        //     console.log('canvas click', e)
        // })
    }

    holdMarkers(markers) {
        markers.forEach(m => {
            this.holdMarker(m)
        })
        this._update()
    }

    holdMarker(marker) {
        const isHolded = this.markers.indexOf(marker) !== -1;
        if (!isHolded) {
            this.markers.push(marker)
        }
    }

    clearClusters() {
        this.clusters = [];
        this.markers.forEach(m => {
            m.unMarkInCluster()
        })
    }

    /**
     * 只生成视野范围内的点聚合
     */
    generateClusters() {
        // 在当前地图的可视Bounds的基础上扩大gridSize
        const mapBounds = this._map.getBounds();
        const mapExtendedBounds = getExtendedBounds(this._map, mapBounds, this.opts.gridSize)
        for(let i=0; i<this.markers.length; i++) {
            const marker = this.markers[i];
            if (!marker.inCluster && mapExtendedBounds.containsPoint(marker.getPoint())) {
                this._addToClosestCluster(marker)
            }
        }
    }

    /**
     * 将某个marker添加到最近的聚合中(保证marker点在聚合网格内)
     * 如果找不到合适的聚合, 基于该点新建一个聚合, 并将该聚合添加到clusters中管理
     * @param marker
     * @private
     */
    _addToClosestCluster(marker) {
        let closestCluster = this._findClosestCluster(marker);
        if (closestCluster && closestCluster.gridBoundsContainMarkerPoint(marker.point)) {
            closestCluster.addMarker(marker)
        } else {
            const cluster = new Cluster(this);
            cluster.addMarker(marker);
            this.clusters.push(cluster)
        }
    }

    /**
     * 在现有clusters中找到一个最近的cluster
     * @param marker
     * @private
     */
    _findClosestCluster(marker) {
        let minDistance = 4000000;
        let closestCluster = null;
        for (let i=0; i<this.clusters.length; i++) {
            const cluster = this.clusters[i];
            const centerPoint = cluster.getCenterPoint();
            if(centerPoint) {
                const distance = this._map.getDistance(centerPoint, marker.getPoint());
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCluster = cluster;
                }
            }
        }
        return closestCluster;
    }

    _update() {
        this.clearClusters()
        this.generateClusters()
    }

    getMap() {
        return this._map;
    }

    getOpts() {
        return this.opts;
    }
}

function initMap() {
    if(BMap) {
        const opts = {
            mapType: BMAP_NORMAL_MAP,
            minZoom: 3,
            maxZoom: 22
        }
        const initPoint = new BMap.Point(114.03502935655705, 30.31737538924881)
        const map = new BMap.Map('bmap-container', opts)
        map.centerAndZoom(initPoint, 19)
        map.enableScrollWheelZoom()

        const clusterer = new MarkerClusterer(map, {
            needAverageCenter: false
        })

        let markers = points.map(p => {
            const point = new BMap.Point(p.lng, p.lat);
            let label = createLabel(p.code);
            let marker = createLocationMarker(point, label);
            return marker;
        });
        clusterer.holdMarkers(markers)
    }
}

initMap()