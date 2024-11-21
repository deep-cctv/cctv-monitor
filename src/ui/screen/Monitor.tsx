import { toaster } from "@kobalte/core";
import { createSignal, For, onMount } from "solid-js";

import { token } from "../../service/signal/token";
import {
  Toast,
  ToastContent,
  ToastProgress,
  ToastTitle,
} from "../base/Toaster";

type Client = {
  name: string;
  uri: string;
};

type Message =
  | {
      client: Client;
      type: "CLINET_DATA";
    }
  | {
      name: string;
      type: "ALERT";
    }
  | {
      name: string;
      type: "CLIENT_EXIT";
    };

const Video = (props: Client) => {
  return (
    <div>
      <video
        autoplay
        playsinline
        src={`${import.meta.env.VITE_APP_API_URL}/${props.uri}`}
      />
      <p class="font-mono font-medium">{props.name}</p>
    </div>
  );
};

export const Monitor = () => {
  const [clients, setClients] = createSignal<Client[]>([]);
  onMount(() => {
    const ws = new WebSocket(
      `${import.meta.env.VITE_APP_API_URL}/monitor?token=${token()}`
    );
    ws.onerror = (error) => {
      console.log(`WebSocket error, ${JSON.stringify(error)}`);
    };
    ws.onopen = () => {
      console.log("WebSocket connection opened");
    };
    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as Message;
      switch (data.type) {
        case "ALERT":
          toaster.show((props) => (
            <Toast toastId={props.toastId}>
              <ToastContent>
                <ToastTitle>Toast</ToastTitle>
              </ToastContent>
              <ToastProgress />
            </Toast>
          ));
          return;
        case "CLIENT_EXIT":
          setClients((prev) => prev.filter((c) => c.name !== data.name));
          return;
        case "CLINET_DATA":
          if (clients().some((c) => c.name === data.client.name)) {
            setClients((prev) =>
              prev.map((c) => (c.name === data.client.name ? data.client : c))
            );
          } else {
            setClients((prev) => [...prev, data.client]);
          }
          return;
      }
    };
  });
  return (
    <div class="grid-cols-3 grid gap-5">
      <For each={clients()}>
        {(client) => <Video name={client.name} uri={client.uri} />}
      </For>
    </div>
  );
};