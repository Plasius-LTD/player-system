import {
  createPlayerSystemSessionState,
  packageDescriptor,
} from "../dist/index.js";

const session = createPlayerSystemSessionState({
  sessionId: "demo-awakening",
  mode: "ambient",
  combatSafe: true,
});

console.log(packageDescriptor);
console.log(session);
