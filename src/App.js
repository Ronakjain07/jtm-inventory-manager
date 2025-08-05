import React, { useState, useEffect } from "react";
import "./App.css";
import JtmLogo from "./logohigh.png";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// --- DATA: Lists of Names ---
const WORKER_NAMES = [
  "Select Worker", // Default/placeholder
  "Boss",
  "Harsh",
  "Ronak",
  "Laxman",
  "Umedsingh",
  "Sawaisingh",
  "Anoopkumar",
  "Govind",
  "Mishri",
  "Ganpatsingh",
  "Sawai",
];

const PARTY_NAMES = [
  "Select Party (or Type New)",
  "SURIYA TEXTILE",
  "MADAN VINOD",
  "VINAY TRADING COMPANY",
  "HARISH KUMAR KANWARLAL BIKANER",
  "RAM SHYAM TONK",
  "KK TEXTILE",
  "MAHESH TEXTILE BUNDI",
  "BANSILAL KRISHNAMURARU",
  "DN TEXTILE",
  "SATGURU TEXTILE JALNA",
  "SHRE HARI TEXTILE",
  "BOMBAY COLLECTION",
  "YASHVANT TEXTILE",
  "ASHIRWAD ENTERPRISE",
  "SHANKARLAL GOVINDRAM",
  "GANDESHDAD ASHOKKUMAR",
  "KATARIYA TEXTILE",
  "PAWAN TEXTILE- FATEHNAGAR",
  "BALAJI TRADING COMPANY-UJJAIN",
];
// --- END DATA ---

// Helper function to safely get data from localStorage
const getLocalStorageItem = (key, defaultValue) => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  } catch (error) {
    console.error("Error reading from localStorage", key, error);
    return defaultValue;
  }
};

// Helper function to safely set data to localStorage
const setLocalStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error writing to localStorage", key, error);
  }
};

function App() {
  const [qualities, setQualities] = useState(() => {
    const storedQualities = getLocalStorageItem("jtmQualities", null);
    if (storedQualities) {
      return storedQualities.map((q) => ({
        ...q,
        shades: q.shades.map((s) => ({
          ...s,
          currentStock: Number(s.currentStock || 0),
        })),
      }));
    }
    return [
      {
        id: "venice",
        name: "JTM-VENICE",
        shades: Array.from({ length: 12 }, (_, i) => ({
          id: `venice-shade-${i + 1}`,
          name: `Shade ${i + 1}`,
          currentStock: 0,
        })),
      },
      {
        id: "bizylizy",
        name: "JTM-BIZY LIZY",
        shades: Array.from({ length: 11 }, (_, i) => ({
          id: `bizylizy-shade-${i + 1}`,
          name: `Shade ${i + 1}`,
          currentStock: 0,
        })),
      },
      {
        id: "discovery",
        name: "JTM-DISCOVERY",
        shades: Array.from({ length: 6 }, (_, i) => ({
          id: `discovery-shade-${i + 1}`,
          name: `Shade ${i + 1}`,
          currentStock: 0,
        })),
      },
    ];
  });

  const [selectedQuality, setSelectedQuality] = useState(null);
  const [inwardQuantities, setInwardQuantities] = useState({});
  const [inwardDate, setInwardDate] = useState("");
  const [outwardQuantities, setOutwardQuantities] = useState({});
  const [outwardDate, setOutwardDate] = useState("");
  const [outwardWorkerName, setOutwardWorkerName] = useState(WORKER_NAMES[0]);
  const [transactions, setTransactions] = useState(() =>
    getLocalStorageItem("jtmTransactions", [])
  );
  const [showHistory, setShowHistory] = useState(false);
  const [showOutwardForm, setShowOutwardForm] = useState(false);
  const [historySearchDate, setHistorySearchDate] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertModalMessage, setAlertModalMessage] = useState("");
  const [alertModalTitle, setAlertModalTitle] = useState("Attention!");

  const [outwardPartyName, setOutwardPartyName] = useState("");
  const [showShadeHistory, setShowShadeHistory] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const [showAddQualityForm, setShowAddQualityForm] = useState(false);
  const [newQualityName, setNewQualityName] = useState("");
  const [newShadeCount, setNewShadeCount] = useState("");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // useEffect: Add/remove 'no-scroll' class to body based on menu state
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isMobileMenuOpen]);

  const displayCustomAlert = (message, title = "Attention!") => {
    setAlertModalMessage(message);
    setAlertModalTitle(title);
    setShowAlertModal(true);
  };

  const closeAlertModal = () => {
    setShowAlertModal(false);
    setAlertModalMessage("");
    setAlertModalTitle("Attention!");
  };

  useEffect(() => {
    setLocalStorageItem("jtmQualities", qualities);
  }, [qualities]);

  useEffect(() => {
    setLocalStorageItem("jtmTransactions", transactions);
  }, [transactions]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateTotalStock = (qualityId) => {
    const quality = qualities.find((q) => q.id === qualityId);
    if (!quality) return 0;
    return quality.shades.reduce((sum, shade) => sum + shade.currentStock, 0);
  };

  const handleMenuToggle = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleInwardClick = (quality) => {
    setSelectedQuality(quality);
    setInwardQuantities({});
    setInwardDate(new Date().toISOString().slice(0, 10));
    setShowHistory(false);
    setShowOutwardForm(false);
    setHistorySearchDate("");
    setShowShadeHistory(false);
    setShowDashboard(false);
    setShowAddQualityForm(false);
    setIsMobileMenuOpen(false);
  };

  const handleInwardShadeQuantityChange = (shadeId, value) => {
    const numValue = Math.max(0, parseFloat(value) || 0);
    setInwardQuantities((prevQuantities) => ({
      ...prevQuantities,
      [shadeId]: numValue,
    }));
  };

  const handleInwardSubmit = () => {
    if (!inwardDate) {
      displayCustomAlert("Please select a date for the inward transaction.");
      return;
    }
    let hasQuantities = false;
    selectedQuality.shades.forEach((shade) => {
      if ((inwardQuantities[shade.id] || 0) > 0) hasQuantities = true;
    });
    if (!hasQuantities) {
      displayCustomAlert("Please enter meters for at least one shade.");
      return;
    }
    const updatedQualities = qualities.map((q) => {
      if (q.id === selectedQuality.id) {
        return {
          ...q,
          shades: q.shades.map((shade) => ({
            ...shade,
            currentStock:
              shade.currentStock + (inwardQuantities[shade.id] || 0),
          })),
        };
      }
      return q;
    });
    const newTransaction = {
      id: Date.now(),
      date: inwardDate,
      time: new Date().toLocaleTimeString("en-US", { hour12: false }),
      quality: selectedQuality.name,
      type: "Inward",
      items: selectedQuality.shades
        .map((shade) => {
          const quantityAdded = inwardQuantities[shade.id] || 0;
          const stockBefore = shade.currentStock;
          const stockAfter = stockBefore + quantityAdded;
          return {
            shadeName: shade.name,
            quantity: quantityAdded,
            currentStockAfter: stockAfter,
          };
        })
        .filter((item) => item.quantity > 0),
      workerName: "N/A",
      partyName: "N/A",
    };
    setQualities(updatedQualities);
    setTransactions((prevTransactions) => [
      newTransaction,
      ...prevTransactions,
    ]);
    displayCustomAlert("Stock added successfully!", "Success!");
    setSelectedQuality(null);
  };

  const handleOutwardClick = (quality) => {
    setSelectedQuality(quality);
    setOutwardQuantities({});
    setOutwardDate(new Date().toISOString().slice(0, 10));
    setOutwardWorkerName(WORKER_NAMES[0]);
    setOutwardPartyName("");
    setShowHistory(false);
    setShowOutwardForm(true);
    setHistorySearchDate("");
    setShowShadeHistory(false);
    setShowDashboard(false);
    setShowAddQualityForm(false);
    setIsMobileMenuOpen(false);
  };

  const handleOutwardShadeQuantityChange = (shadeId, value) => {
    const numValue = Math.max(0, parseFloat(value) || 0);
    setOutwardQuantities((prevQuantities) => ({
      ...prevQuantities,
      [shadeId]: numValue,
    }));
  };

  const handleOutwardSubmit = () => {
    if (outwardWorkerName === WORKER_NAMES[0]) {
      displayCustomAlert("Please select a worker name.", "Error");
      return;
    }
    if (outwardPartyName.trim() === "") {
      displayCustomAlert("Please enter or select a Party Name.", "Error");
      return;
    }
    if (!outwardDate) {
      displayCustomAlert(
        "Please select a date for the outward transaction.",
        "Error"
      );
      return;
    }

    let hasQuantities = false;
    let hasInsufficientStock = false;

    const potentialUpdatedQualities = qualities.map((q) => {
      if (q.id === selectedQuality.id) {
        return {
          ...q,
          shades: q.shades.map((shade) => {
            const quantityToSubtract = outwardQuantities[shade.id] || 0;
            if (quantityToSubtract > 0) {
              hasQuantities = true;
              if (shade.currentStock < quantityToSubtract) {
                hasInsufficientStock = true;
                displayCustomAlert(
                  `Not enough stock for ${selectedQuality.name} - ${shade.name}.\nAvailable: ${shade.currentStock} M, Tried to remove: ${quantityToSubtract} M`,
                  "Stock Error!"
                );
                return shade;
              }
              return {
                ...shade,
                currentStock: shade.currentStock - quantityToSubtract,
              };
            }
            return shade;
          }),
        };
      }
      return q;
    });

    if (hasInsufficientStock) return;
    if (!hasQuantities) {
      displayCustomAlert(
        "Please enter meters for at least one shade.",
        "Error"
      );
      return;
    }

    setQualities(potentialUpdatedQualities);

    const newTransaction = {
      id: Date.now(),
      date: outwardDate,
      time: new Date().toLocaleTimeString("en-US", { hour12: false }),
      quality: selectedQuality.name,
      type: "Outward",
      items: selectedQuality.shades
        .map((shade) => {
          const quantitySubtracted = outwardQuantities[shade.id] || 0;
          const stockBefore = shade.currentStock;
          const stockAfter = stockBefore - quantitySubtracted;
          return {
            shadeName: shade.name,
            quantity: quantitySubtracted,
            currentStockAfter: stockAfter,
          };
        })
        .filter((item) => item.quantity > 0),
      workerName: outwardWorkerName,
      partyName: outwardPartyName.trim(),
    };

    setTransactions((prevTransactions) => [
      newTransaction,
      ...prevTransactions,
    ]);
    displayCustomAlert("Stock removed successfully!", "Success!");
    setSelectedQuality(null);
    setShowOutwardForm(false);
  };

  const handleBackToQualities = () => {
    setSelectedQuality(null);
    setShowHistory(false);
    setShowOutwardForm(false);
    setHistorySearchDate("");
    setShowShadeHistory(false);
    setShowDashboard(false);
    setShowAddQualityForm(false);
    setIsMobileMenuOpen(false);
  };

  const handleShowHistory = () => {
    setSelectedQuality(null);
    setShowOutwardForm(false);
    setShowHistory(true);
    setHistorySearchDate("");
    setShowShadeHistory(false);
    setShowDashboard(false);
    setShowAddQualityForm(false);
    setIsMobileMenuOpen(false);
  };

  const handleShowShadeHistory = () => {
    setSelectedQuality(null);
    setShowOutwardForm(false);
    setShowHistory(false);
    setHistorySearchDate("");
    setShowShadeHistory(true);
    setShowDashboard(false);
    setShowAddQualityForm(false);
    setIsMobileMenuOpen(false);
  };

  const handleShowDashboard = () => {
    setSelectedQuality(null);
    setShowOutwardForm(false);
    setShowHistory(false);
    setHistorySearchDate("");
    setShowShadeHistory(false);
    setShowDashboard(true);
    setShowAddQualityForm(false);
    setIsMobileMenuOpen(false);
  };

  const handleShowAddQuality = () => {
    setSelectedQuality(null);
    setShowOutwardForm(false);
    setShowHistory(false);
    setHistorySearchDate("");
    setShowShadeHistory(false);
    setShowDashboard(false);
    setShowAddQualityForm(true);
    setNewQualityName("");
    setNewShadeCount("");
    setIsMobileMenuOpen(false);
  };

  const handleAddQualitySubmit = () => {
    if (newQualityName.trim() === "") {
      displayCustomAlert("Please enter a Quality Name.", "Error");
      return;
    }
    const shadeCount = parseInt(newShadeCount);
    if (isNaN(shadeCount) || shadeCount <= 0) {
      displayCustomAlert(
        "Please enter a valid number of shades (greater than 0).",
        "Error"
      );
      return;
    }
    if (
      qualities.some(
        (q) => q.name.toLowerCase() === newQualityName.trim().toLowerCase()
      )
    ) {
      displayCustomAlert(
        "A quality with this name already exists. Please choose a different name.",
        "Error"
      );
      return;
    }

    const newQualityId = newQualityName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
    const newShades = Array.from({ length: shadeCount }, (_, i) => ({
      id: `${newQualityId}-shade-${i + 1}`,
      name: `Shade ${i + 1}`,
      currentStock: 0,
    }));
    const newQuality = {
      id: newQualityId,
      name: newQualityName.trim(),
      shades: newShades,
    };

    setQualities((prevQualities) => [...prevQualities, newQuality]);
    displayCustomAlert(
      `${newQuality.name} with ${shadeCount} shades added successfully!`,
      "Success!"
    );
    setNewQualityName("");
    setNewShadeCount("");
    setShowAddQualityForm(false);
  };

  const groupTransactionsByDate = (txns) => {
    const grouped = {};
    txns.forEach((txn) => {
      if (!grouped[txn.date]) {
        grouped[txn.date] = [];
      }
      grouped[txn.date].push(txn);
    });
    return grouped;
  };

  const filteredTransactions = historySearchDate
    ? transactions.filter((txn) => txn.date === historySearchDate)
    : transactions;

  const groupedHistory = groupTransactionsByDate(filteredTransactions);
  const sortedDates = Object.keys(groupedHistory).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  const chartData = qualities.map((q) => ({
    name: q.name.replace("JTM-", ""),
    "Total Meters": calculateTotalStock(q.id),
  }));

  return (
    <div className="App">
      <div className="top-red-strip"></div>
      <header className="App-header">
        <div className="header-left">
          <img
            src={JtmLogo}
            alt="JTM Textile Industries LLP Logo"
            className="app-logo"
          />
        </div>
        <div className="header-center">
          <h1>JTM Textile Stock Management</h1>
        </div>
        <div
          className={`hamburger-menu-icon ${isMobileMenuOpen ? "open" : ""}`}
          onClick={handleMenuToggle}
        >
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
        {/* Mobile menu starts off-screen and slides in */}
        <nav className={`main-nav ${isMobileMenuOpen ? "open" : ""}`}>
          <button onClick={handleBackToQualities} className="nav-button">
            Home
          </button>
          <button onClick={handleShowHistory} className="nav-button">
            View History
          </button>
          <button onClick={handleShowShadeHistory} className="nav-button">
            Shade History
          </button>
          <button onClick={handleShowDashboard} className="nav-button">
            Dashboard
          </button>
          <button
            onClick={handleShowAddQuality}
            className="nav-button add-quality-button"
          >
            Add Quality
          </button>
        </nav>
      </header>
      <main className="App-main">
        {showHistory ? (
          <div className="history-container">
            <h2>Transaction History</h2>
            <div className="history-search-bar">
              <label htmlFor="history-date-search">Search by Date:</label>
              <input
                type="date"
                id="history-date-search"
                value={historySearchDate}
                onChange={(e) => setHistorySearchDate(e.target.value)}
                className="date-input"
              />
              <button
                onClick={() => setHistorySearchDate("")}
                className="clear-search-button"
              >
                Clear Search
              </button>
            </div>

            {sortedDates.length === 0 ? (
              <p className="no-transactions-message">
                {historySearchDate
                  ? "No transactions found for this date."
                  : "No transactions recorded yet."}
              </p>
            ) : (
              <div className="daily-transaction-groups">
                {sortedDates.map((date) => (
                  <div key={date} className="daily-group">
                    <h3>
                      Transactions for{" "}
                      {new Date(date).toLocaleDateString("en-IN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                    <div className="table-responsive">
                      <table className="transactions-table">
                        <thead>
                          <tr>
                            <th>Time</th>
                            <th>Type</th>
                            <th>Quality</th>
                            <th>Party Name</th>
                            <th>Shade & Quantity</th>
                            <th>Worker</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedHistory[date].map((transaction) => (
                            <tr key={transaction.id}>
                              <td>{transaction.time}</td>
                              <td
                                className={
                                  transaction.type === "Inward"
                                    ? "type-inward"
                                    : "type-outward"
                                }
                              >
                                <strong>{transaction.type}</strong>
                              </td>
                              <td>{transaction.quality}</td>
                              <td>
                                {transaction.partyName === "N/A"
                                  ? "-"
                                  : transaction.partyName}
                              </td>
                              <td>
                                <ul className="transaction-items-list">
                                  {transaction.items.map((item, index) => (
                                    <li key={index}>
                                      {item.shadeName}: {item.quantity} M (Stock
                                      After: {item.currentStockAfter} M)
                                    </li>
                                  ))}
                                </ul>
                              </td>
                              <td>
                                {transaction.workerName === "N/A"
                                  ? "-"
                                  : transaction.workerName}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="back-button" onClick={handleBackToQualities}>
              Back to Home
            </button>
          </div>
        ) : showShadeHistory ? ( // Shade History View
          <div className="shade-history-container">
            <h2>Current Stock by Shade</h2>
            <button className="back-button" onClick={handleBackToQualities}>
              Back to Home
            </button>
            <div className="quality-shade-tables">
              {qualities.map((quality) => (
                <div key={quality.id} className="quality-shade-group">
                  <h3>{quality.name} Available Stock</h3>
                  <div className="table-responsive">
                    <table className="shade-stock-table">
                      <thead>
                        <tr>
                          <th>Shade Name</th>
                          <th>Current Stock (Meters)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quality.shades.map((shade) => (
                          <tr key={shade.id}>
                            <td>{shade.name}</td>
                            <td
                              className={
                                shade.currentStock <= 0 ? "low-stock" : ""
                              }
                            >
                              {shade.currentStock} M
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : showDashboard ? ( // Dashboard View
          <div className="dashboard-container">
            <h2>Overall Stock Dashboard</h2>
            <button className="back-button" onClick={handleBackToQualities}>
              Back to Home
            </button>

            <div className="dashboard-section">
              <h3>Total Stock by Quality (Meters)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="Total Meters"
                    fill="#0047AB"
                    isAnimationActive={true}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {qualities.map((quality) => (
              <div key={`chart-${quality.id}`} className="dashboard-section">
                <h3>{quality.name} Stock by Shade (Meters)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={quality.shades}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="currentStock"
                      fill="#E42A2B"
                      isAnimationActive={true}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}

            <div className="dashboard-section">
              <h3>Detailed Stock Overview</h3>
              <div className="table-responsive">
                <table className="overall-stock-table">
                  <thead>
                    <tr>
                      <th>Quality</th>
                      <th>Shade Name</th>
                      <th>Current Stock (Meters)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qualities.map((quality) => (
                      <React.Fragment key={quality.id}>
                        {quality.shades.map((shade, index) => (
                          <tr key={shade.id}>
                            {index === 0 && (
                              <td
                                rowSpan={quality.shades.length}
                                className="quality-name-cell"
                              >
                                <strong>{quality.name}</strong>
                              </td>
                            )}
                            <td>{shade.name}</td>
                            <td
                              className={
                                shade.currentStock <= 0 ? "low-stock" : ""
                              }
                            >
                              {shade.currentStock} M
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : showAddQualityForm ? (
          <div className="add-quality-form-container">
            <h2>Add New Quality</h2>
            <div className="form-controls">
              <label htmlFor="new-quality-name">Quality Name:</label>
              <input
                type="text"
                id="new-quality-name"
                value={newQualityName}
                onChange={(e) => setNewQualityName(e.target.value)}
                placeholder="e.g., JTM-NEWFABRIC"
                className="medium-input-field"
                required
              />
            </div>
            <div className="form-controls">
              <label htmlFor="new-shade-count">Number of Shades:</label>
              <input
                type="number"
                id="new-shade-count"
                value={newShadeCount}
                onChange={(e) => setNewShadeCount(e.target.value)}
                min="1"
                placeholder="e.g., 8"
                className="medium-input-field"
                required
              />
            </div>
            <div className="form-actions">
              <button
                className="submit-button add-quality-submit-button"
                onClick={handleAddQualitySubmit}
              >
                Add Quality
              </button>
              <button className="back-button" onClick={handleBackToQualities}>
                Back
              </button>
            </div>
          </div>
        ) : showOutwardForm ? (
          <div className="outward-form-container">
            <h2>Cloth Outward for {selectedQuality.name}</h2>
            <div className="form-controls">
              <label htmlFor="outward-date">Date:</label>
              <input
                type="date"
                id="outward-date"
                value={outwardDate}
                onChange={(e) => setOutwardDate(e.target.value)}
                className="date-input"
                required
              />
            </div>
            <div className="form-controls">
              <label htmlFor="outward-worker-name">Worker Name:</label>
              <select
                id="outward-worker-name"
                value={outwardWorkerName}
                onChange={(e) => setOutwardWorkerName(e.target.value)}
                className="medium-input-field worker-name-select"
                required
              >
                {WORKER_NAMES.map((name) => (
                  <option
                    key={name}
                    value={name}
                    disabled={name === WORKER_NAMES[0]}
                  >
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-controls">
              <label htmlFor="outward-party-name">Party Name:</label>
              <input
                type="text"
                id="outward-party-name"
                value={outwardPartyName}
                onChange={(e) => setOutwardPartyName(e.target.value)}
                list="party-names-list"
                placeholder="Select Party (or Type New)"
                className="medium-input-field party-name-input"
                required
              />
              <datalist id="party-names-list">
                {PARTY_NAMES.slice(1).map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>

            <div className="shade-inputs">
              {selectedQuality.shades.map((shade) => (
                <div key={shade.id} className="shade-input-item">
                  <label htmlFor={shade.id}>{shade.name}:</label>
                  <input
                    type="number"
                    id={shade.id}
                    value={outwardQuantities[shade.id] || ""}
                    onChange={(e) =>
                      handleOutwardShadeQuantityChange(shade.id, e.target.value)
                    }
                    min="0"
                    placeholder="Meters"
                    className="medium-input-field"
                  />
                  <span className="current-shade-stock">
                    Current: {shade.currentStock} M
                  </span>
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button
                className="submit-button outward-button"
                onClick={handleOutwardSubmit}
              >
                Submit Outward
              </button>
              <button className="back-button" onClick={handleBackToQualities}>
                Back to Qualities
              </button>
            </div>
          </div>
        ) : selectedQuality ? (
          <div className="inward-form-container">
            <h2>Cloth Inward for {selectedQuality.name}</h2>
            <div className="form-controls">
              <label htmlFor="inward-date">Date:</label>
              <input
                type="date"
                id="inward-date"
                value={inwardDate}
                onChange={(e) => setInwardDate(e.target.value)}
                className="date-input"
                required
              />
            </div>

            <div className="shade-inputs">
              {selectedQuality.shades.map((shade) => (
                <div key={shade.id} className="shade-input-item">
                  <label htmlFor={shade.id}>{shade.name}:</label>
                  <input
                    type="number"
                    id={shade.id}
                    value={inwardQuantities[shade.id] || ""}
                    onChange={(e) =>
                      handleInwardShadeQuantityChange(shade.id, e.target.value)
                    }
                    min="0"
                    placeholder="Meters"
                    className="medium-input-field"
                  />
                  <span className="current-shade-stock">
                    Current: {shade.currentStock} M
                  </span>
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button
                className="submit-button inward-button"
                onClick={handleInwardSubmit}
              >
                Submit Inward
              </button>
              <button className="back-button" onClick={handleBackToQualities}>
                Back to Qualities
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2>Product Qualities</h2>
            <div className="quality-list">
              {qualities.map((quality) => (
                <div key={quality.id} className="quality-card">
                  <h3>{quality.name}</h3>
                  <p className="total-stock">
                    Total Stock: {calculateTotalStock(quality.id)} Meters
                  </p>
                  <div className="quality-buttons">
                    <button
                      className="inward-button"
                      onClick={() => handleInwardClick(quality)}
                    >
                      Cloth Inward
                    </button>
                    <button
                      className="outward-button"
                      onClick={() => handleOutwardClick(quality)}
                    >
                      Cloth Outward
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      <footer className="App-footer">
        <p>
          Current Time:{" "}
          {currentDateTime.toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          &nbsp; {currentDateTime.toLocaleTimeString("en-US", { hour12: true })}
        </p>
        <p>&copy; 2025 JTM Textile Industries LLP. All rights reserved.</p>
      </footer>

      {showAlertModal && (
        <div className="alert-modal-overlay">
          <div className="alert-modal-content">
            <h3>{alertModalTitle}</h3>
            <p>{alertModalMessage}</p>
            <button onClick={closeAlertModal} className="alert-modal-button">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
