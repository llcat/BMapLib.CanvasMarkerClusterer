import {
    Circle,
    Droplet,
    Image,
    Group
} from 'zrender'

import flag from '../assets/flag.png'

export default class Marker {
    /**
     * 
     * @param {BMap.Point} point 
     * @param {*} label 
     * @param {*} opts 
     */
    constructor(point, label, opts) {
        this.point = point;
        this.label = label;
        let { elements } = opts;
        this.elements = elements || [];
        this.group = new Group();
        this.elements.forEach(element => {
            this.group.add(element)
        })
        this.group.add(this.label.text)
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
            width: 6,
            height: 8
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
        elements: [droplet, circle]
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