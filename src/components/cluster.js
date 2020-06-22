import {
    Circle,
    Sector,
    Group
} from 'zrender'
import { getExtendedBounds } from '../utils'

/**
 * less equal scale's max value
 * {
 *      color: '‘ // 聚类图标颜色, 支持zrender提供的颜色方案, hex, rgba, hsl, css color
 *      r: '' // 聚类图标中心圆半径 
 * }
 */
export const clusterScaleInfo = [
    { max: 10, color: '#1976D2', r: 16 },
    { max: 30, color: '#FBC02D', r: 20 },
    { max: 50, color: '#E64A19', r: 24 },
    { max: 100, color: '#D32F2F', r: 28 },
    { max: Number.MAX_VALUE, color: '#6A1B9A', r: 32 }
]

export function getClusterScaleBySize(scales, size=0) {
    let r = { max: 10, color: '#1976D2', size: 16 };
    for(let i=0; i<scales.length; i++) {
        let scale = scales[i];
        if (size <= scale.max) {
            r = scale;
            return r;
        }
    }
}

// 生成默认的聚类TextIcon, 仿百度点聚合图标形状
export function createClusterTextIcon(opts) {
    const size = opts.size;
    const scales = opts.scales || clusterScaleInfo;
    const scaleInfo = getClusterScaleBySize(scales, size)
    const circleR = scaleInfo.r;
    const textIcon = new Group();
    const circle = new Circle({
        style: {
            fill: scaleInfo.color || '#1976D2'
        },
        shape: {
            cx: 0,
            cy: 0,
            r: circleR
        }
    });
    
    const sector = new Sector({
        shape: {

        }
    })
    textIcon.add()
    return textIcon
}

export function genSectorList(r, color) {
    const angleList = [
        [-Math.PI/4, Math.PI/4],
        [Math.PI*(5/12), Math.PI*(11/12)],
        [Math.PI*(13/12), Math.PI*(19/12)]
    ];
    let r = [];
    let deltaR = 3;
    let gutter = 2;
    for(let i=0; i<angleList.length; i++) {
        
    }
    return r;
}

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
        this.updateGridBounds();
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