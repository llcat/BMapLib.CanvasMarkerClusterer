/* eslint-disable */
import { init } from 'zrender'
import {
    createCircleMarker,
    createLocationMarker,
    createImageMarker 
} from './components/marker'
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
        }
        opts = opts || {}
        this.opts = {
            ...defaultOpts,
            ...opts
        }
        this.markers = [];
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

    loadData(data) {
        this._data = data || [];
        this.markers = this._data.slice(0, 1).map(d => {
            const point = new BMap.Point(d.lng, d.lat);
            let label = createLabel(d.code)
            let marker = createLocationMarker(point, label);
            return marker;
        })
    }

    addMarkers(markers) {
        this.markers = markers
    }

    addMarker(marker) {
        
    }

    getMap() {
        return this._map;
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
        clusterer.loadData(points)
        // const p1 = points[0]
        // let r = map.pointToOverlayPixel(new BMap.Point(p1.lng, p1.lat))
        // let r1 = map.pointToPixel(new BMap.Point(p1.lng, p1.lat))
        // console.log(r, r1)
    }
}

initMap()