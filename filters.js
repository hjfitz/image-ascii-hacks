

export function bumpContrast(pixelValues, contrast) {
    contrast = (contrast/100) + 1
    const intercept = 128 * (1 - contrast)
    for(let i = 0; i < pixelValues.length; i += 4){
        pixelValues[i] = pixelValues[i] * contrast + intercept
        pixelValues[i+1] = pixelValues[i+1] * contrast + intercept
        pixelValues[i+2] = pixelValues[i+2] * contrast + intercept
    }
    return pixelValues
}

export function bumpBrightness(pixelValues, brightness) {
    for(let i = 0; i < pixelValues.length; i += 4){
        pixelValues[i] = pixelValues[i] * brightness 
        pixelValues[i+1] = pixelValues[i+1] * brightness
        pixelValues[i+2] = pixelValues[i+2] * brightness
    }
    return pixelValues
}
