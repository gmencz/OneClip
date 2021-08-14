function getEnv() {
  return {
    PUBLIC_PUSHER_CLUSTER: process.env.PUBLIC_PUSHER_CLUSTER,
    PUBLIC_PUSHER_KEY: process.env.PUBLIC_PUSHER_KEY
  };
}

export { getEnv };
