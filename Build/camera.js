// camera.js

// let video;
// let canvas;
// let context;

// function startCamera() {
//   video = document.createElement("video");
//   canvas = document.createElement("canvas");
//   context = canvas.getContext("2d");

//   // Request the rear camera
//   navigator.mediaDevices
//     .getUserMedia({
//       video: { facingMode: "environment" },
//     })
//     .then((stream) => {
//       video.srcObject = stream;
//       video.play();
//     })
//     .catch((error) => {
//       console.error("Error accessing the rear camera: ", error);
//     });
// }

// function captureImage() {
//   if (!video || !context) {
//     console.error("Camera not initialized");
//     return null;
//   }

//   canvas.width = video.videoWidth;
//   canvas.height = video.videoHeight;
//   context.drawImage(video, 0, 0, canvas.width, canvas.height);
//   return canvas.toDataURL("image/png");
// }

function processImage(capturedImageSrc, callback) {
  // Load reference image (should be hosted somewhere accessible)
  let referenceImage = new Image();
  referenceImage.src = "./ref.jpg";
  let capturedImage = new Image();
  capturedImage.src = capturedImageSrc;

  referenceImage.onload = () => {
    console.log("referenceImage");
    console.log(referenceImage);
    let src2 = cv.imread(referenceImage);
    console.log("capturedImage");
    console.log(capturedImage);
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

    console.log(des1);
    console.log(des2);

    // Calculate good matches
    console.log(matches.size());
    let goodMatches = 0;
    for (let i = 0; i < matches.size(); i++) {
      if (matches.get(i).distance < 50) {
        goodMatches++;
      }
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

    // Set threshold for good matches
    let threshold = 100;
    if (goodMatches > threshold) {
      console.log("Access Granted");
      callback(1);
      return true;
    } else {
      console.log("Access Denied");
      callback(0);
      return false;
    }
  };
}

// function checkImage() {
//   const capturedImageData = captureImage();
//   if (!capturedImageData) {
//     return false;
//   }
//   return processImage(capturedImageData);
// }

function checkImage(byteArray, callback) {
  let canvas = document.createElement("canvas");
  let context = canvas.getContext('2d');
  const byteArrayUint8 = new Uint8Array(byteArray);
  const blob = new Blob([byteArrayUint8], { type: "image/png" });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    return processImage(canvas.toDataURL("image/png"), callback);
  };

  img.src = url;
  // return false; // Default return until the image is processed
}

// Functions to be called from Unity
// window.startCamera = startCamera;
window.checkImage = checkImage;
