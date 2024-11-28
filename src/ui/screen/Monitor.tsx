import { toaster } from "@kobalte/core";
import { createEventListener } from "@solid-primitives/event-listener";
import { createSignal, For, onMount, Show } from "solid-js";

import { token } from "../../service/signal/token";
import {
  Toast,
  ToastContent,
  ToastDescription,
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
  const [showToast, setShowToast] = createSignal(false);
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
          if (!showToast()) return;
          toaster.show((props) => (
            <Toast toastId={props.toastId} variant="destructive">
              <ToastContent>
                <ToastTitle>경고</ToastTitle>
                <ToastDescription>
                  {data.name}에서 폭력상황이 발생했습니다.
                </ToastDescription>
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

  createEventListener(document, "keydown", () => {
    setShowToast((p) => !p);
  });

  return (
    <>
      <div class="grid-cols-3 grid gap-5">
        <Show
          fallback={
            <p class="text-lg text-gray-500">
              연결된 CCTV 클라이언트가 없습니다.
            </p>
          }
          when={clients().length > 0}
        >
          <For each={clients()}>
            {(client) => <Video name={client.name} uri={client.uri} />}
          </For>
        </Show>
      </div>
      <Show when={showToast()}>
        <div class="w-px h-px bg-black" />
      </Show>
    </>
  );
};
