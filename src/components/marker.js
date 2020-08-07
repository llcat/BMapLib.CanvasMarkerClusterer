import {
    Circle,
    Droplet,
    Image,
    Group
} from 'zrender'

import flag from '../assets/flag.png'

export default class Marker {
    /**
     * @param {BMap.Point} point 
     * @param {*} label 
     * @param {*} opts 
     */
    constructor(point, label, opts) {
        this.point = point;
        this.label = label;
        this.inCluster = false;
        let { elements, showLabelByHover } = opts;
        this.elements = elements || [];
        this.showLabelByHover = showLabelByHover;
        this.group = new Group();
        this.elementsGroup = new Group();
        this.elements.forEach(element => {
            this.elementsGroup.add(element)
        });
        this.group.add(this.elementsGroup);
        this.group.add(this.label.text);
        this._bindMouseEventHandler();
        this._resetLabelPosition();
    }

    _bindMouseEventHandler() {
        if (this.showLabelByHover) {
            this.label.text.hide();
            this.group.on('mouseover', () => {
                this.label.text.show();
            });
            this.group.on('mouseout', () => {
                this.label.text.hide()
            })
        }
    }

    // 重置
    _resetLabelPosition() {
        const labelRect = this.label.text.getBoundingRect();
        const elementsRect = this.elementsGroup.getBoundingRect();
        const positionX = -(labelRect.width / 2);
        const positionY = -(elementsRect.height/2 + labelRect.height);
        this.label.text.attr('position', [positionX, positionY])
    }

    markInCluster() {
        this.inCluster = true;
    }

    unMarkInCluster() {
        this.inCluster = false;
    }

    /**
     * 返回百度经纬度坐标
     * @return {BMap.Point}
     */
    getPoint() {
        return this.point
    }
}

export function createCircleMarker(point, label, opts={
    style: {
        fill: 'rgba(50, 50, 255, 0.7)'
    },
    shape: {
        cx: 0,
        cy: 0,
        r: 4
    }
}) {
    const circle = new Circle(opts);
    return new Marker(point, label, {
        elements: [circle]
    });
}


export function createLocationMarker(point, label, opts) {
    opts = opts || {}
    let { dropletOpts, circleOpts } = opts;
    dropletOpts = dropletOpts || {
        style: {
            fill: 'rgba(50, 50, 255, 0.7)'
        },
        shape: {
            cx: 0,
            cy: 0,
            width: 8,
            height: 10
        },
        rotation: Math.PI
    }
    const circleR = dropletOpts.shape.width * 0.75 / 2;
    circleOpts = circleOpts || {
        style: {
            fill: '#fff'
        },
        shape: {
            cx: 0,
            cy: 0,
            r: circleR
        }
    }
    const droplet = new Droplet(dropletOpts)
    const circle = new Circle(circleOpts)
    return new Marker(point, label, {
        elements: [droplet, circle],
        showLabelByHover: false
    })
}

export function createImageMarker(point, label, opts) {
    opts = opts || {}
    let { imgOpts } = opts;
    imgOpts = {
        style: {
            image: flag,
            x: 0,
            y: 0,
            width: 16,
            height: 16
        }
    }
    const img = new Image(imgOpts)
    return new Marker(point, label, {
        elements: [img]
    })
}