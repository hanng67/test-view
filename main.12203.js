//const cv = require("opencv.js");

document.addEventListener('DOMContentLoaded', (event) => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    // Access the camera
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(error => {
            console.error("Error accessing the camera: ", error);
        });

    // Capture an image from the video stream
    function captureImage() {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpg');
        ;
    }

    // Add event listener to capture image after 3 seconds
    setTimeout(() => {
        const capturedImage = captureImage();
        processImage(capturedImage);
    }, 3000);
});

function processImage(capturedImageSrc) {
    // Load reference image (should be hosted somewhere accessible)
    let referenceImage = new Image();
    referenceImage.src = './ref.ddda9.jpg';
    let capturedImage = new Image();
    capturedImage.src = capturedImageSrc;

    referenceImage.onload = () => {
        console.log("referenceImage")
        console.log(referenceImage)
        let src2 = cv.imread(referenceImage);
        console.log("capturedImage")
        console.log(capturedImage)
        let src1 = cv.imread(capturedImage);
        
        // Convert to grayscale
        cv.cvtColor(src1, src1, cv.COLOR_RGBA2GRAY, 0);
        cv.cvtColor(src2, src2, cv.COLOR_RGBA2GRAY, 0);

        // ORB detector to find keypoints and descriptors
        let orb = new cv.ORB();
        let kp1 = new cv.KeyPointVector();
        let des1 = new cv.Mat();
        orb.detectAndCompute(src1, new cv.Mat(), kp1, des1);

        let kp2 = new cv.KeyPointVector();
        let des2 = new cv.Mat();
        orb.detectAndCompute(src2, new cv.Mat(), kp2, des2);

        // BFMatcher to match descriptors
        let bf = new cv.BFMatcher(cv.NORM_HAMMING, true);
        let matches = new cv.DMatchVector();
        bf.match(des1, des2, matches);

        // Calculate good matches
        console.log(matches.size())
        let goodMatches = 0;
        for (let i = 0; i < matches.size(); i++) {
            if (matches.get(i).distance < 50) {
                goodMatches++;
            }
        }

        // Set threshold for good matches
        let threshold = 10;
        if (goodMatches > threshold) {
            console.log("Access Granted");
        } else {
            console.log("Access Denied");
        }

        // Clean up
        src1.delete();
        src2.delete();
        kp1.delete();
        des1.delete();
        kp2.delete();
        des2.delete();
        matches.delete();
        bf.delete();
    };
}

