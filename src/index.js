import { init } from 'zrender'
import {
    createLocationMarker,
} from './components/marker'
import {
    createClusterTextIcon
} from './components/cluster'
import { createLabel } from './components/label'
import { checkBMap } from './utils'
import points from './assets/points.json'

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

    // 更新canvas layer, 这个方法会在地图移动和缩放时自动调用
    updateLayer() {
        const canvas = this._canvasLayer.canvas;
        this._zr = init(canvas);
        this.markers.forEach(m => {
            const pix = this._map.pointToPixel(m.point)
            m.group.position = [pix.x, pix.y]
            this._zr.add(m.group)
        })
    }

    holdMarkers(markers) {
        markers.forEach(m => {
            this.holdMarker(m)
        })
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

    // 生成点聚合
    generateClusters() {

    }

    _addToClosestCluster() {

    }

    _findClosestCluster() {

    }

    _update() {
        this.clearClusters()
        this.generateCluster() 
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

        const clusterer = new MarkerClusterer(map)

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