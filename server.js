const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// =====================
// DATABASE CONNECTION
// =====================
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "pcds_booking"
});

db.connect(err => {
    if (err) {
        console.log("DB Error:", err);
    } else {
        console.log("MySQL Connected 🚀");
    }
});

// =====================
// TEST
// =====================
app.get("/", (req, res) => {
    res.send("PCDS API Running 🚀");
});

// =====================
// REGISTER
// =====================
app.post("/register", (req, res) => {

    const { username, password } = req.body;

    db.query(
        "INSERT INTO users(username,password) VALUES(?,?)",
        [username, password],
        (err) => {
            if (err) res.json({ success: false });
            else res.json({ success: true });
        }
    );
});

// =====================
// LOGIN
// =====================
app.post("/login", (req, res) => {

    const { username, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE username=? AND password=?",
        [username, password],
        (err, result) => {

            if (result.length > 0) {
                res.json({ success: true, user: result[0] });
            } else {
                res.json({ success: false });
            }

        }
    );
});

// =====================
// ADD BOOKING
// =====================
app.post("/book", (req, res) => {

    const b = req.body;

    // generate ID
    const id = "PCDS-" + Date.now();

    db.query(
        `INSERT INTO bookings
        (booking_id,booked_by,event_name,start_date,start_time,end_date,end_time,course,role,status)
        VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
            id,
            b.booked_by,
            b.event_name,
            b.start_date,
            b.start_time,
            b.end_date,
            b.end_time,
            b.course,
            b.role,
            "Pending"
        ],
        (err) => {
            if (err) res.json({ success: false });
            else res.json({ success: true, booking_id: id });
        }
    );
});

// =====================
// GET BOOKINGS
// =====================
app.get("/bookings", (req, res) => {

    db.query("SELECT * FROM bookings ORDER BY id DESC",
    (err, result) => {
        res.json(result);
    });

});

// =====================
// UPDATE STATUS
// =====================
app.put("/status/:id", (req, res) => {

    const { status } = req.body;

    db.query(
        "UPDATE bookings SET status=? WHERE id=?",
        [status, req.params.id],
        (err) => {
            res.json({ success: true });
        }
    );

});

// =====================
// DELETE
// =====================
app.delete("/delete/:id", (req, res) => {

    db.query(
        "DELETE FROM bookings WHERE id=?",
        [req.params.id],
        (err) => {
            res.json({ success: true });
        }
    );

});

// START SERVER
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});