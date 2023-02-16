export default class BudgetTracker {
  constructor(querySelectorString) {
    this.root = document.querySelector(querySelectorString);
    this.root.innerHTML = BudgetTracker.renderTable();

    this.root.querySelector(".new-entry").addEventListener("click", () => {
      this.onNewEntryBtnClick();
    });

    this.loadLocalData();
  }

  static renderTable() {
    return `

    <table class="budget-tracker">
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Type</th>
          <th>Amount</th>
          <th></th>
        </tr>
      </thead>
      <tbody class="entries">

      </tbody>
      <tbody>
        <tr>
          <td colspan="5" class="controls">
            <button type="button" class="new-entry">New Entry</button>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5" class="summary">
            <strong>
              Total
            </strong>
            <span class="total">$0.00</span>
          </td>
        </tr>
      </tfoot>
    </table>
    `;
  }

  static renderEntry() {
    return `
            <tr>
                <td>
                    <input class="input input-date" type="date">
                </td>
                <td>
                    <input class="input input-description" type="text" placeholder="Add a Description (e.g. wages, bills, etc.)">
                </td>
                <td>
                    <select class="input input-type">
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </td>
                <td>
                    <input type="number" class="input input-amount">
                </td>
                <td>
                    <button type="button" class="delete-entry">&#10005;</button>
                </td>
            </tr>
        `;
  }

  loadLocalData() {
    const entries = JSON.parse(localStorage.getItem("budget-entries") || "[]");

    for (const entry of entries) {
      this.addEntry(entry);
    }

    this.updateSummary();
  }

  updateSummary() {
    const total = this.getEntryRows().reduce((total, row) => {
      const amount = row.querySelector(".input-amount").value;
      const isExpense = row.querySelector(".input-type").value === "expense";
      const modifier = isExpense ? -1 : 1;

      return total + amount * modifier;
    }, 0);

    const totalFormatted = new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: "EUR",
    }).format(total);

    this.root.querySelector(".total").textContent = totalFormatted;
  }

  saveData() {
    const data = this.getEntryRows().map((row) => {
      return {
        date: row.querySelector(".input-date").value,
        description: row.querySelector(".input-description").value,
        type: row.querySelector(".input-type").value,
        amount: parseFloat(row.querySelector(".input-amount").value),
      };
    });

    localStorage.setItem("budget-entries", JSON.stringify(data));
    this.updateSummary();
  }

  addEntry(entry = {}) {
    this.root
      .querySelector(".entries")
      .insertAdjacentHTML("beforeend", BudgetTracker.renderEntry());

    // Select last entry (we add on previous step)
    const row = this.root.querySelector(".entries tr:last-of-type");

    row.querySelector(".input-date").value =
      entry.date || new Date().toISOString().replace(/T.*/, "");
    row.querySelector(".input-description").value = entry.description || "";
    row.querySelector(".input-type").value = entry.type || "income";
    row.querySelector(".input-amount").value = entry.amount || 0;

    row.querySelector(".delete-entry").addEventListener("click", (e) => {
      this.onDeleteEntryButtonClick(e);
    });

    row.querySelectorAll(".input").forEach((input) => {
      input.addEventListener("change", () => this.saveData());
    });
  }

  getEntryRows() {
    return Array.from(this.root.querySelectorAll(".entries tr"));
  }

  onNewEntryBtnClick() {
    this.addEntry();
  }

  onDeleteEntryButtonClick(e) {
    e.target.closest("tr").remove();
    this.saveData();
  }
}
