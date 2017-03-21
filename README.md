# Orbital Camera Control
Orbital camera control with gl-matrix

# Installation 
`npm install orbital-camera-control`

# Usage
```
var listenerTarget = window;
var controller = new OrbitalCameraControl(cameraViewMatrix, cameraStartRadius, listenerTarget);

loop() {
	controller.update();
}
```