const canvas = document.querySelector('canvas')
canvas.width = 600
canvas.height = 600
const DOT_RADIUS = 15
const context = canvas.getContext('2d')

export {
    canvas,
    context,
    DOT_RADIUS
}