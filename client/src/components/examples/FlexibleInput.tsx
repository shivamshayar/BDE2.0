import { useState } from "react";
import FlexibleInput from "../FlexibleInput";

export default function FlexibleInputExample() {
  const [value, setValue] = useState("");

  const options = ["PN-1001", "PN-1002", "PN-1003", "PN-1004"];

  return (
    <div className="p-8 bg-background max-w-md">
      <FlexibleInput
        id="part-number"
        label="Part Number"
        value={value}
        onChange={setValue}
        options={options}
        required
      />
      <div className="mt-4 text-sm text-muted-foreground">
        Current value: {value || "(none)"}
      </div>
    </div>
  );
}
