import { bumpBrightness, bumpContrast } from './filters.js'

const ASCII_WIDTH = 200
const CHAR_DENSITY = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI:,\"^`'. ".split('').reverse()

const state = {
				elements: null,
				srcImg: null,
				mode: null,
				contrast: 0,
				brightness: 1,
}

function setInitialState() {
				state.elements = {
								img: document.querySelector('img'),
								vid: document.querySelector('video'),
								out: document.querySelector('#out'),
								canvas: document.querySelector('canvas'),
								imgInput: document.querySelector('input#imgUpload'),
								contrastSlider: document.querySelector('input#contrast'),
								brightnessSlider: document.querySelector('input#brightness'),
								modeBtn: document.querySelector('button#camSwitch'),
				}

				state.srcElem = state.elements.img
				state.mode = 'image'

				state.elements.contrastSlider.value = state.contrast
				state.elements.brightnessSlider.value = state.brightness
}

document.addEventListener('DOMContentLoaded', () => {
				setInitialState()

				const {img, imgInput, modeBtn, contrastSlider, brightnessSlider} = state.elements

				imgInput.addEventListener('change', e => handleNewImage(e.target.files[0], img))
				contrastSlider.addEventListener('input', refreshImage)
				brightnessSlider.addEventListener('input', refreshImage)
				modeBtn.addEventListener('click', switchModes)

				drawImg()
})

/**
 * @param {MouseEvent} e
 */
async function switchModes(e) {
				const {img, vid} = state.elements
				if (state.mode === 'image') {
								state.mode = 'webcam'
								e.target.textContent = 'Use Image'
								img.style.display = 'none'
								vid.style.display = 'block'
								state.srcElem = vid
								if (e.target.dataset.initialised) return
								const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
								vid.srcObject = stream
								vid.play()
								function loop() {
												drawImg()
												if (state.mode !== 'webcam') return
												requestAnimationFrame(loop)
								}
								vid.addEventListener('play', () => {
												requestAnimationFrame(loop)
								})
								e.target.dataset.initialised = true
								
				} else {
								e.target.dataset.mode = 'image'
								e.target.textContent = 'Use Webcam'
								img.style.display = 'block'
								vid.style.display = 'none'
								state.srcElem = img
								drawImg()
				}
				
}

function drawImg() {
				const imageData = getPixelData(state.srcElem, state.elements.canvas)

				const ascii = createFrame(imageData, state)
				
				const text = document.createTextNode(ascii)
				out.textContent = ''
				out.appendChild(text)
}

/**
 * @param {HTMLImageElement | HTMLVideoElement} srcElem
 * @param {HTMLCanvasElement} canvas
 * @returns Uint8ClampedArray
 */
function getPixelData(srcElem, canvas) {
				const ctx = canvas.getContext('2d', { 
								willReadFrequently: true,
				})
				const {
								width: srcElemWidth,
								height: srcElemHeight
				} = srcElem.getBoundingClientRect()

				const scaleFactor = srcElemWidth / ASCII_WIDTH
				const height = (srcElemHeight / scaleFactor) // 2 // fuck about until the image looks square

				canvas.width = ASCII_WIDTH
				canvas.height = height 
				ctx.drawImage(srcElem, 0, 0, ASCII_WIDTH, height)

				const imageData = ctx.getImageData(0, 0, ASCII_WIDTH, height)

				return imageData.data
}

/**
 * @returns {string}
 */
export function createFrame(pixels, state) {
				bumpContrast(pixels, state.contrast)
				bumpBrightness(pixels, state.brightness)

				let ascii = ''
				for (let i = 0; i < pixels.length; i+= 4) {
								const r = pixels[i]
								const g = pixels[i + 1]
								const b = pixels[i + 2]
								//const avg = (r + g + b) / 3 // average
								const avg = (0.21 * r) + (0.72 * g) + (0.07 * b) // luminescence

								// our average as a proprtion of 255, in to the total chars
								const idx = (Math.floor(avg / 255 * CHAR_DENSITY.length))
								const char = CHAR_DENSITY[idx]
								ascii += char
								if ((i / 4) % ASCII_WIDTH === 0)
												ascii += '\n'
				}
				return ascii
}


/**
 * @param {File} file
 * @param {HTMLImageElement} imgElem
 */
function handleNewImage(file) {
				if (!file.type.startsWith('image'))
								return

				const url = URL.createObjectURL(file)
				state.elements.img.src = url
				state.elements.img.onload = drawImg
}

function refreshImage() {
				const {contrastSlider, brightnessSlider} = state.elements
				Object.assign(state, {
								contrast: parseFloat(contrastSlider.value),
								brightness: parseFloat(brightnessSlider.value),
				})

				drawImg()
}

