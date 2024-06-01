const input = document.getElementById("input");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const addInvertFilter = false;
const size = 100;
const frameInterval = 50;
let videoData = [];
canvas.width = size;
canvas.height = size;

function pixelDataToKhan(videoData) {
    let textOutput = `var currentFrame = 0;\nvar draw = function() {\nframeRate(1);\n`;
    for (let i = 0; i < videoData.length; i++) {
        let pixelData = videoData[i];
        textOutput += `if (currentFrame === ${i}) {\n`;
        for (let j = 0; j < pixelData.length; j++) {
            let pixel = pixelData[j];
            textOutput += `stroke(${pixel.r}, ${pixel.g}, ${pixel.b});\npoint(${pixel.x}, ${pixel.y});\n`;
        }
        textOutput += `}\n`;
    }
    textOutput += `currentFrame++;\n};`;
    console.log(textOutput);
}

document.addEventListener("DOMContentLoaded", () => {
    input.addEventListener("change", () => {
        let videoFile = input.files[0];
        let url = URL.createObjectURL(videoFile);

        let video = document.createElement("video");
        video.src = url;
        video.style.display = "block";
        video.width = size;
        video.height = size;
        video.muted = true;
        video.autoplay = true;
        document.body.appendChild(video);

        video.addEventListener("canplay", (event) => {
            event.target.width = size;
            event.target.height = size;
            console.log("Video is playing!");

            if (video.requestVideoFrameCallback) {
                if (addInvertFilter) {
                    ctx.filter = "invert(1)";
                }
                video.play();
                let frameCount = 0;
                const drawingLoop = (timestamp, frame) => {
                    if (frameCount % frameInterval === 0) {
                        ctx.drawImage(video, 0, 0, size, size, 0, 0, size, size);

                        const imageData = ctx.getImageData(0, 0, size, size);
                        const pixels = imageData.data;

                        const pixelData = [];
                        for (let y = 0; y < size; y++) {
                            for (let x = 0; x < size; x++) {
                                const index = (y * size + x) * 4;
                                const r = pixels[index];
                                const g = pixels[index + 1];
                                const b = pixels[index + 2];
                                pixelData.push({ x, y, r, g, b });
                            }
                        }

                        videoData.push(pixelData);
                    }
                    frameCount++;
                    video.requestVideoFrameCallback(drawingLoop);
                }
                video.requestVideoFrameCallback(drawingLoop);
            }
        })

        video.onended = (event) => {
            pixelDataToKhan(videoData);
        }
    })
})