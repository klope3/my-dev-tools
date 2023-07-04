import { useState } from "react";

type ChanceRow = {
  label: string;
  value: number;
};

const decimalPlaces = 3;

export function ChanceSliders() {
  const [rows, setRows] = useState([] as ChanceRow[]);
  const [newRowLabel, setNewRowLabel] = useState("");

  const rangeStyle = {
    width: "900px",
  };
  const textStyle = {
    width: "100px",
  };

  function valueTotal(rows: ChanceRow[], indexToSkip: number = -1) {
    return rows.reduce(
      (accum, item, i) =>
        i === indexToSkip ? accum : round(accum + item.value),
      0
    );
  }

  function round(num: number) {
    return +num.toFixed(decimalPlaces);
  }

  function compensateRows(
    rows: ChanceRow[],
    compensateDelta: number,
    indexToSkip: number = -1
  ) {
    const step = round(Math.pow(10, -1 * decimalPlaces));
    const stepFactor = compensateDelta > 0 ? -1 : 1;
    let compensationRemaining = Math.abs(compensateDelta);
    let i = 0;

    while (compensationRemaining > 0) {
      const newValueHere = round(rows[i].value + stepFactor * step);
      if (
        i === indexToSkip ||
        rows[i].value === 0 ||
        newValueHere < 0 ||
        newValueHere > 1
      ) {
        i++;
        if (i === rows.length) i = 0;
        continue;
      }
      rows[i].value = newValueHere;
      compensationRemaining = round(compensationRemaining - step);

      i++;
      if (i === rows.length) i = 0;
    }
  }

  function removeRow(removeIndex: number) {
    if (rows[removeIndex].value === 1) return;

    const newRows = [...rows];
    const removedValue = newRows[removeIndex].value;
    newRows.splice(removeIndex, 1);
    compensateRows(newRows, -1 * removedValue);
    setRows(newRows);
  }

  function changeValue(newValue: number, changedIndex: number) {
    if (rows.length === 1) return;
    const newRows = [...rows];
    const newValueRounded = round(newValue);
    const valueDelta = newValueRounded - newRows[changedIndex].value;
    newRows[changedIndex].value = newValueRounded;

    compensateRows(newRows, valueDelta, changedIndex);

    setRows(newRows);
  }

  function addRow() {
    if (newRowLabel.length === 0) {
      console.error("Label can't be empty.");
      return;
    }
    const existingRow = rows.find((row) => row.label === newRowLabel);
    if (existingRow) {
      console.error("A row with that label already exists.");
      return;
    }
    const newRows = [...rows];
    newRows.push({
      label: newRowLabel,
      value: rows.length === 0 ? 1 : 0,
    });
    setRows(newRows);
  }

  return (
    <div>
      {rows.map((row, i) => (
        <div key={i}>
          <button onClick={() => removeRow(i)}>-</button>
          <input
            type="text"
            value={row.label}
            onChange={(e) => {
              const newRows = [...rows];
              newRows[i].label = e.target.value;
              setRows(newRows);
            }}
            style={textStyle}
          />
          <input
            type="range"
            min="0"
            max="1"
            step={Math.pow(10, -1 * decimalPlaces)}
            value={row.value}
            onChange={(e) => changeValue(+e.target.value, i)}
            style={rangeStyle}
          />
          <span>{row.value}</span>
        </div>
      ))}
      <div>Total: {valueTotal(rows)}</div>
      <div>
        New Row:
        <input
          type="text"
          value={newRowLabel}
          onChange={(e) => setNewRowLabel(e.target.value)}
        />
        <button onClick={addRow}>+</button>
      </div>
    </div>
  );
}
