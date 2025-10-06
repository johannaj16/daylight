// Web Worker for accurate timer functionality
let intervalId = null;
let startTime = null;
let pausedTime = 0;
let isRunning = false;

self.onmessage = function(e) {
  const { type, data } = e.data;
  
  switch (type) {
    case 'START':
      if (!isRunning) {
        startTime = Date.now() - pausedTime;
        isRunning = true;
        intervalId = setInterval(() => {
          const elapsed = Date.now() - startTime;
          self.postMessage({
            type: 'TICK',
            data: { elapsed }
          });
        }, 100); // Update every 100ms for smooth display
      }
      break;
      
    case 'PAUSE':
      if (isRunning) {
        clearInterval(intervalId);
        pausedTime = Date.now() - startTime;
        isRunning = false;
        self.postMessage({
          type: 'PAUSED',
          data: { elapsed: pausedTime }
        });
      }
      break;
      
    case 'RESUME':
      if (!isRunning && pausedTime > 0) {
        startTime = Date.now() - pausedTime;
        isRunning = true;
        intervalId = setInterval(() => {
          const elapsed = Date.now() - startTime;
          self.postMessage({
            type: 'TICK',
            data: { elapsed }
          });
        }, 100);
      }
      break;
      
    case 'STOP':
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      isRunning = false;
      startTime = null;
      pausedTime = 0;
      self.postMessage({
        type: 'STOPPED',
        data: { elapsed: 0 }
      });
      break;
      
    case 'GET_STATUS':
      self.postMessage({
        type: 'STATUS',
        data: { 
          isRunning, 
          elapsed: isRunning ? Date.now() - startTime : pausedTime 
        }
      });
      break;
  }
};

