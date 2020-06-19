/* eslint-disable */
import { getExtendedBounds, checkBMap } from '../utils'

export default class Cluster {
    constructor(manager) {
        // MarkerClusterer实例
        this._manager = manager;
        this._map = this._manager.getMap();
        const opts = manager.getOpts();
        // 该聚合的网格尺寸
        this._gridSize = opts.gridSize;
        this._clusterMinSize = opts.clusterMinSize;
        this._needAverageCenter = opts.needAverageCenter;
        // 该聚合持有的marker数组
        this.ownMarkers = [];
        this.centerPoint = null;
        // 基于gridSize建立的bounds, 用来聚合该范围内的marker
        this.gridBounds= null;
    }

    addMarker(marker) {
        if (this.contain(marker)){
            return;
        }
        // 设定中心点
        this.setCenterPoint(marker);
        // 更新网格范围
    }

    setCenterPoint(marker) {
        if (!this.centerPoint) {
            this.centerPoint = marker.point;
        } else {
            if (this._needAverageCenter) {
                let l = this.ownMarkers.length;
                let lng = (this.centerPoint.lng * l + marker.point.lng) / (l+1);
                let lat = (this.centerPoint.lat * l + marker.point.lat) / (l+1);
                this.centerPoint = new BMap.Point(lng, lat);
            }
        }
    }

    updateGridBounds() {
        const bounds = new BMap.Bounds(this.centerPoint, this.centerPoint);
        this.gridBounds = getExtendedBounds(this._map, bounds, this._gridSize);
    }

    // 获取以centerPoint为中心, 宽高为2*gridSize的边界
    getGridBounds() {
        return this.gridBounds;
    }

    // 获取一个包含该cluster所有marker点的一个最小外接矩形边界
    getClusterMinBounds() {
        let bounds = new BMap.Bounds(this.centerPoint, this.centerPoint);
        this.ownMarkers.forEach(m => {
            bounds.extend(m.point)
        })
        return bounds;
    }

    // 判断是否已添加某个marker
    contain(marker) {
        return this.ownMarkers.indexOf(marker) !== -1;
    }

    // 返回聚合的中心点坐标
    getCenterPoint() {
        return this.centerPoint;
    }
}