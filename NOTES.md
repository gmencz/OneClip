[] To share images what we will do is take the image that the user wants to share, temporarily store it in some fast db like Redis with some ID
and send that ID over Pusher to the interested device, then that device will look up that image in Redis, download it and then delete it from Redis
since we were just temporarily storing it.
