const { Cluster } = require('puppeteer-cluster');
const express = require('express');
const cors = require('cors');

(async () => {
  let queueCount = 0;
  let result = [];
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 1,
  });
  await cluster.task(async ({ page, data: url }) => {
    const videoId = url.substr(17, 11);
    let checked = false;
    page.on("request", async (request) => {
      if (request._url.indexOf('timedtext') >= 0) {
        result[videoId] = request._url;
        result.forEach((video, index) => {
          if (typeof(video) === 'number') {
            result[index] = result[index] - 1;
          }
        })
        checked = true;
      }
    });
    await page.goto(url);
    await page.close();
    console.log(videoId, checked);
    if (!checked) {
      result[videoId] = undefined;
    }
    queueCount--;
  });

  const app = express();
  app.use(cors());
  const port = 3000;
  app.get('/caption', (req, res) => {
    const { videoId } = req.query;
    if (!videoId) {
      res.send("Not enough args");
      return;
    }
    if (result[videoId] && typeof(result[videoId]) !== 'number') {
      const timeIndex = result[videoId].indexOf("expire=") + 7;
      const expTime = result[videoId].substr(timeIndex, 10);
      const time = Math.floor((Date.now() + 60000) / 1000);
      if (time < expTime) {
        res.send(result[videoId]);
        return;
      } else {
        result[videoId] = undefined;
      }
    }
    if (typeof(result[videoId]) === 'undefined') {
      cluster.queue(`https://youvi.be/${videoId}`);
      queueCount++;
      result[videoId] = queueCount;
    }
    res.send(String(result[videoId]));
  });
  app.listen(port, () => {
    console.log(`Get caption app is listening at http://localhost:${port}`)
  });
})();
