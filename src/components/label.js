import {
    Text
} from 'zrender'

export default class Label {
    constructor(content, opts) {
        this.content = content;
        this._opts = opts;
        this.text = new Text(opts)
    }
}

export function createLabel(content, opts) {
    content = content || "";
    opts = opts || {
        position: [0, -22],
        style: {
            text: content,
            fontSize: '14px',
            textFill: 'rgb(0, 158, 251)',
            textBackgroundColor: 'rgba(255, 255, 255, 0.75)',
            textBorderRadius: 2,
            textPadding: 4
        }
    }
    return new Label(content, opts)
}