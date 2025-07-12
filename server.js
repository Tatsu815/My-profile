const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
const upload = multer({ dest: path.join(__dirname, 'uploads/') });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/images', (req, res) => {
  const dir = path.join(__dirname, 'uploads');
  fs.readdir(dir, (err, files) => {
    if (err) return res.status(500).json({ error: "Cannot read uploads" });
    const images = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f))
      .map(f => `/uploads/${f}`);
    res.json(images);
  });
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const ext = path.extname(req.file.originalname);
  const newPath = req.file.path + ext;
  fs.rename(req.file.path, newPath, err => {
    if (err) return res.status(500).json({ error: "Rename failed" });
    res.json({ url: `/uploads/${path.basename(newPath)}` });
  });
});

app.delete('/api/images/:filename', (req, res) => {
  const filename = req.params.filename;
  console.log("Định xóa file:", filename);
  const imgPath = path.join(__dirname, 'uploads', filename);
  fs.unlink(imgPath, err => {
    if (err) {
      console.error("Lỗi khi xóa:", err);
      return res.status(404).json({ error: 'File not found' });
    }
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});