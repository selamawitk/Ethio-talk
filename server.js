try {
  require('./backend/dist/src/main');
} catch (e) {
  console.error('Failed to start backend:', e.message);
  process.exit(1);
}
