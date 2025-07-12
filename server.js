const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({ dest: path.join(__dirname, 'Uploads/') });

app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));
app.use(express.static(path.join(__dirname, '.')));

// Ghi log để theo dõi yêu cầu
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Lấy danh sách ảnh
app.get('/api/images', (req, res) => {
  const dir = path.join(__dirname, 'Uploads');
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error("Lỗi đọc thư mục Uploads:", err);
      return res.status(500).json({ error: "Không thể đọc thư mục uploads" });
    }
    const images = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f))
      .map(f => `/uploads/${f}`);
    res.json(images);
  });
});

// Tải ảnh lên
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Không có tệp nào được tải lên" });
  const ext = path.extname(req.file.originalname);
  if (!/\.(jpg|jpeg|png|gif)$/i.test(ext)) {
    return res.status(400).json({ error: "Định dạng tệp không được hỗ trợ" });
  }
  const newPath = req.file.path + ext;
  fs.rename(req.file.path, newPath, err => {
    if (err) {
      console.error("Lỗi đổi tên tệp:", err);
      return res.status(500).json({ error: "Đổi tên thất bại" });
    }
    res.json({ url: `/uploads/${path.basename(newPath)}` });
  });
});

// Xóa ảnh
app.delete('/api/images/:filename', (req, res) => {
  const filename = req.params.filename;
  // Kiểm tra filename hợp lệ
  if (!filename || !/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|gif)$/i.test(filename)) {
    return res.status(400).json({ error: 'Tên tệp không hợp lệ' });
  }
  const imgPath = path.join(__dirname, 'Uploads', filename);
  fs.unlink(imgPath, err => {
    if (err) {
      console.error("Lỗi khi xóa:", err);
      return res.status(404).json({ error: 'Không tìm thấy tệp' });
    }
    res.json({ success: true });
  });
});

// Xử lý các yêu cầu không hợp lệ
app.use((req, res, next) => {
  console.log(`Yêu cầu không hợp lệ: ${req.url}`);
  res.status(404).json({ error: 'Tuyến đường không tồn tại' });
});

// Phục vụ frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});