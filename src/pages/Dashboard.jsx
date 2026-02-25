import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [expenses, setExpenses] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
  });

  const filteredExpenses = Array.isArray(expenses)
  ? expenses.filter((exp) => {
      const matchesSearch = exp.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || exp.category === selectedCategory;

      const matchesDate =
        selectedDate === "" || exp.date === selectedDate;

      return matchesSearch && matchesCategory && matchesDate;
    })
  : [];

  const total = filteredExpenses.reduce((acc, item) => acc + item.amount, 0);
  const [displayTotal, setDisplayTotal] = useState(0);
  const API = "http://localhost:8091/api/expenses";


  useEffect(() => {
  fetchExpenses();


}, []);

const fetchExpenses = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found. Redirecting to login...");
      navigate("/login");
      return;
    }

    const res = await axios.get(API, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = Array.isArray(res.data.content) ? res.data.content : res.data;
    const mapped = data.map((e) => ({
  ...e,
  date: e.expenseDate,
}));

    setExpenses(mapped);
  } catch (error) {
    console.error("Error fetching expenses:", error.response || error.message);

    if (error.response && error.response.status === 403) {
      alert("Access denied. Please login again.");
      localStorage.removeItem("token");
      navigate("/login");
    }
  }
};




  useEffect(() => {
    let start = 0;
    const duration = 800;
    const increment = total / (duration / 16);

    const counter = setInterval(() => {
      start += increment;
      if (start >= total) {
        start = total;
        clearInterval(counter);
      }
      setDisplayTotal(Math.floor(start));
    }, 16);

    return () => clearInterval(counter);
  }, [total]);

  const handleAddExpense = async (e) => {
  e.preventDefault();

  if (!newExpense.title || !newExpense.amount) return;

  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    // POST new expense
    const res = await axios.post(
  API,
  {
    title: newExpense.title,
    amount: parseFloat(newExpense.amount),
    category: newExpense.category,
    expenseDate: newExpense.date,   // 🔥 FIXED HERE
  },
  { headers: { Authorization: `Bearer ${token}` } }
);

    // Add new expense to state
    setExpenses((prev) => [res.data, ...prev]);

    setNewExpense({ title: "", amount: "", category: "", date: "" });
    setShowModal(false);

  } catch (error) {
    console.error("Error adding expense:", error);
  }
};
  const deleteExpense = async (id) => {
  try {
    const token = localStorage.getItem("token");

    await axios.delete(`${API}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setExpenses((prev) => prev.filter((item) => item.id !== id));
  } catch (error) {
    console.error("Error deleting expense:", error);
  }
};

   const navigate = useNavigate();

const handleLogout = () => {
  localStorage.removeItem("token");
  navigate("/login");
};

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const lastMonth = lastMonthDate.getMonth();
  const lastMonthYear = lastMonthDate.getFullYear();
const currentMonthTotal = expenses
  .filter((exp) => exp.expenseDate) // skip null
  .filter((exp) => {
    const date = new Date(exp.expenseDate);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  })
  .reduce((acc, item) => acc + item.amount, 0);

const lastMonthTotal = expenses
  .filter((exp) => exp.expenseDate)
  .filter((exp) => {
    const date = new Date(exp.expenseDate);
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
  })
  .reduce((acc, item) => acc + item.amount, 0);
  const difference = lastMonthTotal - currentMonthTotal;
  const percentage =
    lastMonthTotal > 0
      ? ((difference / lastMonthTotal) * 100).toFixed(1)
      : 0;

  const isSaving = difference > 0;

  return (
    <div style={styles.container}>
      {/* NAVBAR */}
      <div style={styles.navbar}>
        <div>
          <h2 style={{ margin: 0 }}>💰 Expense Manager</h2>
          <p style={styles.navSub}>Track. Save. Improve.</p>
        </div>

        <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  style={styles.logoutBtn}
  onClick={handleLogout}
>
  Logout
</motion.button>
      </div>

      <div style={styles.wrapper}>
        {/* Total */}
        <div style={styles.card}>
          <p style={{ opacity: 0.7 }}>Total Expenses</p>
          <h1 style={{ fontSize: "40px" }}>₹ {displayTotal}</h1>
        </div>

        {/* Monthly Comparison */}
        <div style={styles.card}>
          <div style={styles.comparisonHeader}>
            <h3>Spending Overview</h3>
            <div
              style={{
                ...styles.trendBadge,
                backgroundColor: isSaving
                  ? "rgba(16,185,129,0.15)"
                  : "rgba(239,68,68,0.15)",
                color: isSaving ? "#10b981" : "#ef4444",
              }}
            >
              {isSaving ? "▲ Saving" : "▼ Higher"} {percentage}%
            </div>
          </div>

          <div style={styles.monthRow}>
            <div>
              <p style={styles.label}>This Month</p>
              <h2>₹ {currentMonthTotal}</h2>
            </div>
            <div>
              <p style={styles.label}>Last Month</p>
              <h2 style={{ opacity: 0.7 }}>₹ {lastMonthTotal}</h2>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filterRow}>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.input}
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={styles.input}
          >
            <option value="All">All Categories</option>
            {[...new Set(expenses.map((e) => e.category))].map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* ADD BUTTON */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={styles.addBtn}
          onClick={() => setShowModal(true)}
        >
          + Add Expense
        </motion.button>

        {/* Table */}
        <div style={styles.card}>
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id}>
                    <td style={styles.td}>{exp.title}</td>
                    <td style={styles.td}>₹ {exp.amount}</td>
                    <td style={styles.td}>{exp.category}</td>
                    <td style={styles.td}>{exp.date}</td>
                    <td style={styles.td}>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => deleteExpense(exp.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart */}
        <div style={styles.card}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredExpenses}>
              <XAxis dataKey="title" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip />
              <Bar dataKey="amount" fill="#ffffff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* MODAL */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              style={styles.modalOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                style={styles.modal}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
              >
                <h3>Add New Expense</h3>
                <form onSubmit={handleAddExpense} style={styles.modalForm}>
                  <input
                    placeholder="Title"
                    value={newExpense.title}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, title: e.target.value })
                    }
                    style={styles.input}
                  />

                  <input
                    type="number"
                    placeholder="Amount"
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, amount: e.target.value })
                    }
                    style={styles.input}
                  />

                  <input
                    placeholder="Category"
                    value={newExpense.category}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, category: e.target.value })
                    }
                    style={styles.input}
                  />

                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, date: e.target.value })
                    }
                    style={styles.input}
                  />

                  <div style={styles.modalButtons}>
                    <button type="submit" style={styles.saveBtn}>
                      Save
                    </button>
                    <button
                      type="button"
                      style={styles.cancelBtn}
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
    paddingBottom: "40px",
  },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px clamp(20px, 5vw, 60px)",
    color: "white",
    backdropFilter: "blur(10px)",
    flexWrap: "wrap",
    gap: "15px",
  },

  navSub: { margin: 0, fontSize: "13px", opacity: 0.7 },

  logoutBtn: {
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "white",
    padding: "8px 16px",
    borderRadius: "10px",
    cursor: "pointer",
  },

  wrapper: {
    maxWidth: "1100px",
    margin: "auto",
    padding: "0 20px",
  },

  card: {
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(20px)",
    padding: "25px",
    borderRadius: "20px",
    color: "white",
    marginBottom: "30px",
  },

  comparisonHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },

  trendBadge: {
    padding: "6px 14px",
    borderRadius: "20px",
    fontWeight: "600",
  },

  monthRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
    flexWrap: "wrap",
    gap: "20px",
  },

  label: { fontSize: "14px", opacity: 0.7 },

  filterRow: {
    display: "flex",
    gap: "15px",
    marginBottom: "25px",
    flexWrap: "wrap",
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    flex: "1 1 200px",
    minWidth: "150px",
  },

  addBtn: {
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "white",
    padding: "10px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    marginBottom: "20px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "600px",
  },

  th: { padding: "12px", textAlign: "left" },

  td: { padding: "12px", whiteSpace: "nowrap" },

  deleteBtn: {
    backgroundColor: "#ef4444",
    border: "none",
    color: "white",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  /* ✅ FIXED MODAL */

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    zIndex: 1000,
  },

  modal: {
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(20px)",
    padding: "30px",
    borderRadius: "20px",
    color: "white",
    width: "100%",
    maxWidth: "400px",
    maxHeight: "90vh",
    overflowY: "auto",
  },

  modalForm: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginTop: "15px",
  },

  /* 🔥 IMPORTANT FIX */
  modalInput: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    width: "100%",
  },

  modalButtons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },

  saveBtn: {
    backgroundColor: "#10b981",
    border: "none",
    color: "white",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  cancelBtn: {
    backgroundColor: "#ef4444",
    border: "none",
    color: "white",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default Dashboard;