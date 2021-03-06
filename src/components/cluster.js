import {
    Circle,
    Sector,
    Group,
    color as zcolor,
} from 'zrender'
import { getExtendedBounds } from '../utils'

/**
 * @typedef {object} BMap.Point
 * @property {number} lng
 * @property {number} lat
 */

/**
 * less equal scale's max value
 * {
 *      color: '‘ // 聚类图标颜色, 支持zrender提供的颜色方案, hex, rgba, hsl, css color
 *      r: '' // 聚类图标中心圆半径 
 * }
 */
export const clusterScaleInfo = [
    { max: 10, color: '#1976D2', r: 14 },
    { max: 30, color: '#FBC02D', r: 16 },
    { max: 50, color: '#E64A19', r: 18 },
    { max: 100, color: '#D32F2F', r: 20 },
    { max: Number.MAX_VALUE, color: '#6A1B9A', r: 22 }
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

/**
 * 生成默认的聚类TextIcon, 仿百度点聚合图标形状
 * @param {Object} opts
 * @param {Array} opts.scales - 色阶数组, 不提供使用默认的色阶
 * @param {Number} opts.size - 对应的色阶值, 小于某个色阶的max值
 * @return {Group}
 */
export function createClusterTextIcon(opts) {
    const size = opts.size;
    const scales = opts.scales || clusterScaleInfo;
    const scaleInfo = getClusterScaleBySize(scales, size)
    const circleR = scaleInfo.r || 20;
    const iconColor = scaleInfo.color || '#1976D2';
    const textIcon = new Group();
    const circle = new Circle({
        style: {
            text: opts.size,
            fill: iconColor,
            fontSize: 14,
            fontWeight: 600
        },
        shape: {
            cx: 0,
            cy: 0,
            r: circleR
        }
    });
    circle.name = 'pp'
    textIcon.add(circle);
    const sectorList = genSectorList(circleR, iconColor);
    sectorList.forEach((s) => {
        textIcon.add(s)
    })
    return textIcon
}

export function genSectorList(r, color) {
    const angleList = [
        [-Math.PI/4, Math.PI/4],
        [Math.PI*(5/12), Math.PI*(11/12)],
        [Math.PI*(13/12), Math.PI*(19/12)]
    ];
    let sectors = [];
    const deltaR = 4;
    const gutter = 1;
    for(let i=0; i<angleList.length; i++) {
        let angle = angleList[i]
        let tempR = r;
        let tempColor = color;
        for (let j=0; j<3; j++) {
            const r0 = tempR + gutter;
            const r1 = r0 + deltaR;
            tempColor = zcolor.modifyAlpha(tempColor, (1-j*0.2));
            const sector = new Sector({
                style: {
                    fill: tempColor
                },
                shape: {
                    cx: 0,
                    cy: 0,
                    r0: r0,
                    r: r1,
                    startAngle: angle[0],
                    endAngle: angle[1]
                }
            })
            sectors.push(sector);
            tempR = r1;
        }
    }
    return sectors;
}

export default class Cluster {
    constructor(manager) {
        // MarkerClusterer实例
        this._manager = manager;
        this._map = this._manager.getMap();
        const opts = manager.getOpts();
        // 该聚合的网格尺寸
        this._gridSize = opts.gridSize;
        // 能显示聚合图标的最小marker数量
        this._clusterMinSize = opts.clusterMinSize;
        this._needAverageCenter = opts.needAverageCenter;
        this._maxZoom = opts.maxZoom
        // 该聚合持有的marker数组
        this.ownMarkers = [];
        this.centerPoint = null;
        // 基于gridSize建立的bounds, 用来聚合该范围内的marker
        this.gridBounds= null;
    }

    getRenderElement() {
        if (this.needRenderCluster()) {
            // 需要渲染cluster
            const textIcon = createClusterTextIcon({
                size: this.ownMarkers.length
            })
            return {
                type: 'cluster',
                textIcon: textIcon
            }
        } else {
            return {
                type: 'markers',
                markers: this.ownMarkers
            }
        }
    }

    addMarker(marker) {
        if (this.contain(marker)){
            return;
        } else {
            this.ownMarkers.push(marker)
        }
        // 设定中心点
        this.setCenterPoint(marker);
        // 更新网格范围
        this.updateGridBounds();
        marker.markInCluster();
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

    /**
     * 网格范围可能随着中心点变化而变化, 网格的大小是不变的
     */
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

    needRenderCluster() {
        const validSize =  this.ownMarkers.length > this._clusterMinSize;
        const validMaxZoom = this._map.getZoom() <= this._maxZoom
        return validSize && validMaxZoom;
    }

    /**
     * 网格范围内是否包含有某个marker坐标点
     * @param {BMap.Point} point 
     */
    gridBoundsContainMarkerPoint(point) {
        if (this.gridBounds) {
            return this.gridBounds.containsPoint(point)
        }
        return false;
    }
}