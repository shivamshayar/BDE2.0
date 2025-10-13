import MachineLoginForm from "../MachineLoginForm";

export default function MachineLoginFormExample() {
  return (
    <MachineLoginForm
      onLogin={(machineId, password) => {
        console.log("Login triggered:", machineId, password);
      }}
    />
  );
}
