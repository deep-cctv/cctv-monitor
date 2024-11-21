/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import { App } from "./App.tsx";
import { ToastList, ToastRegion } from "./ui/base/Toaster.tsx";

const root = document.getElementById("root");

render(
  () => (
    <>
      <App />
      <ToastRegion>
        <ToastList />
      </ToastRegion>
    </>
  ),
  root!
);
