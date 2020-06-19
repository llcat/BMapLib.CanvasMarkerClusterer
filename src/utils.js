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

/**
 * 返回一个左下和右上扩大了等距gridSize后的Bounds
 * ---------------------> x
 * |    
 * |     ------- (NE)
 * |     |     |
 * |     |     |
 * | (SW)-------
 * |
 * ˇ y
 * @param {BMap.Map} map 
 * @param {BMap.Bounds} originBounds 
 * @param {Number} gridSize 
 */
export function getExtendedBounds(map, originBounds, gridSize) {
    const originPixelNE = map.pointToPixel(originBounds.getNorthEast());
    const originPixelSW = map.pointToPixel(originBounds.getSouthWest());
    const newPixelNE = new BMap.Pixel(originPixelNE.x + gridSize, originPixelNE.y - gridSize);
    const newPixelSW = new BMap.Pixel(originPixelSW.x - gridSize, originPixelSW.y + gridSize);
    const newPointNE = map.pixelToPoint(newPixelNE);
    const newPointSW = map.pixelToPoint(newPixelSW);
    return new BMap.Bounds(newPixelSW, newPixelNE);
}