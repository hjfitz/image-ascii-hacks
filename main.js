const ASCII_WIDTH = 200
const CHAR_DENSITY = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI:,\"^`'. ".split('').reverse()

document.addEventListener('DOMContentLoaded', () => {
				const {img, out, imgInput, contrastSlider, brightnessSlider} = collectElems()
				imgInput.addEventListener('change', e => handleNewImage(e.target.files[0], img))
				contrastSlider.addEventListener('input', refreshAsciiImage)
				brightnessSlider.addEventListener('input', refreshAsciiImage)
				computeAscii(img, out)
})

/**
 * @param {File} file
 * @param {HTMLImageElement} imgElem
 */
function handleNewImage(file, imgElem) {
				if (!file.type.startsWith('image'))
								return

				const url = URL.createObjectURL(file)
				imgElem.src = url
				imgElem.onload = refreshAsciiImage
}

/*
 * @returns {import('./types').FilterValues}
 */
function getFilterValues() {
				const {contrastSlider, brightnessSlider} = collectElems()
				return {
								contrast: parseFloat(contrastSlider.value),
								brightness: parseFloat(brightnessSlider.value),
				}
}

function refreshAsciiImage() {
				const {img, out} = collectElems()

				const {contrast, brightness} = getFilterValues()

				computeAscii(img, out, contrast, brightness)
}

/**
 * @returns {import('./types').Elements}
 */
function collectElems() {
				const img = document.querySelector('img')
				const out = document.querySelector('#out')
				const imgInput = document.querySelector('input#imgUpload')
				const contrastSlider = document.querySelector('input#contrast')
				const brightnessSlider = document.querySelector('input#brightness')
				return {img, out, imgInput, contrastSlider, brightnessSlider}
}


/**
 * @param {HTMLImageElement} imgElem
 * @param {HTMLSpanElement} codeElem
 */
function computeAscii(imgElem, codeElem, contrastValue = 0, brightnessValue = 1) {
				const canvas = document.createElement('canvas')
				const ctx = canvas.getContext('2d')

				const scaleFactor = imgElem.width / ASCII_WIDTH
				const height = (imgElem.height / scaleFactor) / 4 // fuck about until the image looks square

				canvas.width = ASCII_WIDTH
				canvas.height = height 
				ctx.drawImage(imgElem, 0, 0, ASCII_WIDTH, height)

				const imageData = ctx.getImageData(0, 0, ASCII_WIDTH, height)

				bumpContrast(imageData.data, contrastValue)
				bumpBrightness(imageData.data, brightnessValue)

				let ascii = ''
				for (let i = 0; i < imageData.data.length; i+= 4) {
								const r = imageData.data[i]
								const g = imageData.data[i + 1]
								const b = imageData.data[i + 2]
								//const avg = (r + g + b) / 3 // average
								const avg = (0.21 * r) + (0.72 * g) + (0.07 * b) // luminescence

								// our average as a proprtion of 255, in to the total chars
								const idx = (Math.floor(avg / 255 * CHAR_DENSITY.length))
								const char = CHAR_DENSITY[idx]
								ascii += char
								if ((i / 4) % ASCII_WIDTH === 0)
												ascii += '\n'
				}
				const text = document.createTextNode(ascii)
				codeElem.textContent = ''
				codeElem.appendChild(text)

}

function bumpContrast(pixelValues, contrast) {
    contrast = (contrast/100) + 1  //convert to decimal & shift range: [0..2]
    const intercept = 128 * (1 - contrast)
    for(let i = 0; i < pixelValues.length; i += 4){
        pixelValues[i] = pixelValues[i] * contrast + intercept
        pixelValues[i+1] = pixelValues[i+1] * contrast + intercept
        pixelValues[i+2] = pixelValues[i+2] * contrast + intercept
    }
    return pixelValues
}

function bumpBrightness(pixelValues, brightness) {
    for(let i = 0; i < pixelValues.length; i += 4){
        pixelValues[i] = pixelValues[i] * brightness 
        pixelValues[i+1] = pixelValues[i+1] * brightness
        pixelValues[i+2] = pixelValues[i+2] * brightness
    }
    return pixelValues
}
