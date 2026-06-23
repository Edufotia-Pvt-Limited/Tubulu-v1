module.exports = {
  apps: [
    {
      name: "tubulu-backend",
      script: "index.js",
      cwd: "./backend",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "tubulu-voice-gateway",
      script: "server.js",
      cwd: "./",
      env: {
        PORT: 8080
      }
    },
    {
      name: "tubulu-voice-tunnel",
      script: "run_tunnel.js",
      cwd: "./"
    },
    {
      name: "tubulu-admin-portal",
      script: "npx",
      args: "vite preview --port 5173 --host 0.0.0.0",
      cwd: "./apps/admin_portal"
    },
    {
      name: "tubulu-website",
      script: "npx",
      args: "vite preview --port 4173 --host 0.0.0.0",
      cwd: "./apps/tubulu_website"
    }
  ]
};
