const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Koneksi ke database
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'cloudcomputing2'
});

db.connect(err => {
    if (err) {
        console.error('Gagal terhubung ke database:', err);
    } else {
        console.log('Terhubung ke database MySQL.');
    }
});

app.use(express.static('public'));

// Route halaman utama
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Home</title>
            <link rel="stylesheet" href="/styles.css"> <!-- Panggil CSS -->
        </head>
        <body>
            <h1>Hello, Saya Allyssa</h1>
            <div class="btn-container">
                <a href="/form" class="btn btn-primary">Pergi ke Form</a>
                <a href="/data" class="btn btn-success">Lihat Data</a>
            </div>
        </body>
        </html>
    `);
});


// Route form input
app.get('/form', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Form Input</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
            <style>body { background-color: #ADD8E6; }</style>
        </head>
        <body class="container mt-5">
            <h2 class="text-center">Formulir Input</h2>
            <form method="post" action="/form" class="mt-4 p-4 border rounded">
                <div class="mb-3">
                    <label class="form-label">Nama:</label>
                    <input type="text" name="name" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Email:</label>
                    <input type="email" name="email" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary">Submit</button>
            </form>
            <a href="/" class="btn btn-secondary mt-3">Kembali</a>
        </body>
        </html>
    `);
});

// Route untuk menangani form submission (FIX "Cannot POST /form")
app.post('/form', (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.send('Nama dan email harus diisi!');
    }

    const sql = "INSERT INTO users (name, email) VALUES (?, ?)";
    db.query(sql, [name, email], (err, result) => {
        if (err) {
            console.error('Gagal menyimpan data:', err);
            return res.send('Gagal menyimpan data.');
        }
        console.log('Data berhasil disimpan:', result);
        
        // Menampilkan pesan sukses setelah submit
        res.send(`
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Terima Kasih</title>
                <link rel="stylesheet" href="/styles.css">
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
            </head>
            <body>
                    <style>body { background-color: #ADD8E6; }</style>
                    <h2>Terima kasih, ${name}!</h2>
                    <p>Data Anda telah disimpan.</p>
                    <div class="btn-container">
                    <a href="/form" class="btn btn-primary mt-3">Kembali ke Form</a>
                    <a href="/data" class="btn btn-success mt-3">Lihat Data</a>
                    </div>
            </body>

            </html>
        `);
    });
});


// Menampilkan data dari database
app.get('/data', (req, res) => {
    const sql = "SELECT * FROM users";
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Gagal mengambil data:', err);
            res.send('Gagal mengambil data.');
        } else {
            let html = `
                <!DOCTYPE html>
                <html lang="id">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Data Pengguna</title>
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
                    <style>body { background-color: #ADD8E6; }</style>
                </head>
                <body class="container mt-5">
                    <h2 class="text-center">Data Pengguna</h2>
                    <table class="table table-striped mt-3">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nama</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            results.forEach(user => {
                html += `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                    </tr>
                `;
            });
            html += `
                        </tbody>
                    </table>
                    <a href="/" class="btn btn-secondary">Kembali</a>
                </body>
                </html>
            `;
            res.send(html);
        }
    });
});

// Jalankan server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
