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
        style: {
            text: content,
            fontSize: 14,
            fontWeight: 500,
            textFill: '#039BE5',
            textBackgroundColor: 'rgba(255, 255, 255, 0.75)',
            textBorderRadius: 2,
            textPadding: 4,
        },
        z: 1
    }
    return new Label(content, opts)
}