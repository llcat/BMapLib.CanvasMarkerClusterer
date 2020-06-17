/* eslint-disable */
import { init } from 'zrender'
import { createCircleMarker, createDropletMarker } from './components/marker'
import points from './assets/points.json'

export default class MarkerClusterer {

    /**
     * MarkerClusterer构造函数
     * @param {*} map - BMap实例
     * @param {*} options - 配置项
     */
    constructor(map, options={
        clusterMinSize: 2,
    }) {
        this._map = map;
        this._canvasLayer = new BMap.CanvasLayer({
            update: this.updateLayer.bind(this)
        })
        this._map.addOverlay(this._canvasLayer)
    }

    updateLayer() {
        const canvas = this._canvasLayer.canvas;
        this._zr = init(canvas);
        console.log(this._zr, this.markers);
        this.markers.forEach(m => {
            const pix = this._map.pointToOverlayPixel(m.point)
            console.log(pix)
            m.group.position = [pix.x, pix.y]
            this._zr.add(m.group)
        })
    }

    loadData(data) {
        this._data = data || [];
        this.markers = this._data.map(d => {
            const point = new BMap.Point(d.lng, d.lat);
            let marker = createDropletMarker(point);
            return marker;
        })
    }

    getMap() {
        return this._map;
    }
}

function initMap() {
    if(BMap) {
        const opts = {
            mapType: BMAP_NORMAL_MAP,
            minZoom: 2,
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