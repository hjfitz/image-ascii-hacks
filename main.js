
document.addEventListener('DOMContentLoaded', () => {
				const canvas = document.querySelector('canvas')
				const img = document.querySelector('img')
				const out = document.querySelector('#out')
				computeAscii(canvas, img, out)
})

const ASCII_WIDTH = 200
const CHAR_DENSITY = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,\"^`'. ".split('').reverse()

/**
 * @param {HTMLCanvasElement} canvasElem
 * @param {HTMLImageElement} imgElem
 * @param {HTMLCodeElement} codeElem
 */
function computeAscii(canvasElem, imgElem, codeElem) {
				const ctx = canvasElem.getContext('2d')
				const scaleFactor = imgElem.width / ASCII_WIDTH
				const height = (imgElem.height / scaleFactor) / 4 // fuck about until the image looks square

				canvasElem.width = ASCII_WIDTH
				canvasElem.height = height 
				ctx.drawImage(imgElem, 0, 0, ASCII_WIDTH, height)

				const imageData = ctx.getImageData(0, 0, ASCII_WIDTH, height)

				let ascii = ''
				for (let i = 0; i < imageData.data.length; i+= 4) {
								const r = imageData.data[i]
								const g = imageData.data[i + 1]
								const b = imageData.data[i + 2]
								// ignore i+3 as this is alpha
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
				codeElem.appendChild(text)

}
