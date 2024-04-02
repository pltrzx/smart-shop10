'use strict'

const slidesPath = './src/images/'
const slides = [
    'slide_1_620x340px.png',
    'slide_2_620x340px.png',
    'slide_3_620x340px.png',
    'slide_4_620x340px.png',
    'slide_5_620x340px.png',
    'slide_6_620x340px.png',
    'slide_7_620x340px.png',
    'slide_8_620x340px.png',
]

const sliderDiv = document.getElementById('slider')

slides.forEach( createImage )
function createImage( image, i, arr ) {
    const img = new Image()
    img.src = slidesPath + image 
    arr[i] = img
}

