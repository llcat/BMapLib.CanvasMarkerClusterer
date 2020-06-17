import {
    Circle,
    Droplet,
    Group
} from 'zrender'
import MarkerClusterer from '..';

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

export function createDropletMarker(point, label, opts={
    style: {
        fill: 'rgba(50, 50, 255, 0.7)'
    },
    shape: {
        cx: 0,
        cy: 0,
        width: 4,
        height: 4
    }
}) {
    const droplet = new Droplet(opts);
    return new Marker(point, label, {
        elements: [droplet]
    })
}