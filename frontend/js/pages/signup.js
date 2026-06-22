import { initPasswordChecklist } from "../components/passwordChecklist.js";

initPasswordChecklist({
  password: document.getElementById("password"),
  confirm:  document.getElementById("confirm-password"),
  panel:    document.querySelector(".password-rules"),
});
