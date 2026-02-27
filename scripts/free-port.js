const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;

console.log(`Attempting to free port ${PORT}...`);

if (process.platform === 'win32') {
  exec(`netstat -ano | findstr :${PORT}`, (err, stdout) => {
    if (!stdout) {
        console.log(`Port ${PORT} seems free.`);
        return;
    }
    // This simple parsing might be brittle on Windows, but good enough for a helper
    // Standard output line: "  TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       1234"
    const lines = stdout.trim().split('\n');
    lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && /^\d+$/.test(pid)) {
            console.log(`Killing PID ${pid}...`);
            exec(`taskkill /F /PID ${pid}`, (e) => {
                if (e) console.error(`Failed to kill PID ${pid}:`, e.message);
                else console.log(`Successfully killed PID ${pid}`);
            });
        }
    });
  });
} else {
  // Linux/Unix
  exec(`lsof -ti:${PORT}`, (err, stdout) => {
    if (err || !stdout) {
        console.log(`Port ${PORT} seems free (or lsof not installed/permitted).`);
        return;
    }
    const pids = stdout.trim().split('\n');
    pids.forEach(pid => {
        if (pid) {
            console.log(`Killing PID ${pid}...`);
            exec(`kill -9 ${pid}`, (e) => {
                if (e) console.error(`Failed to kill PID ${pid}:`, e.message);
                else console.log(`Successfully killed PID ${pid}`);
            });
        }
    });
  });
}
