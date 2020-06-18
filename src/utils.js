/* eslint-disable */
export function checkBMap() {
    if (BMap) {
        if (BMap.CanvasLayer) {
            return true;
        } else {
            throw new Error('Require BMap version 3.0+, this lib need BMap.CanvasLayer support!')
        }
    } else {
        throw new Error('BMap is not exist!')
    }
}