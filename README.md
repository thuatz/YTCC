# YTCC
NodeJS app to get Youtube Videos Captions

Use this if you want to get videos captions programmatically.

Some technical descriptions:
+ 'maxConcurrency': The maximum Puppeteer's instance will be run at the same time, adjust it base on your server's performance.
+ If successful getting a caption, the server will return the caption's url.
+ If the job is queued, the server will return the number of waiting jobs ultil the video will be processed (e.g: 1, 2, 3, ...).
+ Sometimes it fails to collect captions url, check the console log. (it prints true if successfully, false if failure).
